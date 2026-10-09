/**
 * Generate stored posters for catalogue videos that do not have poster_path yet.
 *
 * Run on your Mac (needs ffmpeg + .env.local):
 *   MAXYL_ADMIN_PASSWORD='your-desk-password' npm run posters:backfill
 *
 * Options:
 *   --force   regenerate even when a poster already exists
 *   --limit N only process N videos
 *
 * Requires supabase/13_posters.sql already applied.
 */

import { spawn } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { mkdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

function loadEnvFile(path: string) {
  if (!existsSync(path)) return;
  const text = readFileSync(path, "utf8");
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvFile(join(process.cwd(), ".env.local"));

function ffmpegBin() {
  if (existsSync("/opt/homebrew/bin/ffmpeg")) return "/opt/homebrew/bin/ffmpeg";
  if (existsSync("/usr/local/bin/ffmpeg")) return "/usr/local/bin/ffmpeg";
  if (existsSync("/usr/bin/ffmpeg")) return "/usr/bin/ffmpeg";
  return "ffmpeg";
}

function grabFrame(url: string, at: string, file: string) {
  return new Promise<boolean>((resolve) => {
    const child = spawn(
      ffmpegBin(),
      ["-y", "-hide_banner", "-loglevel", "error", "-ss", at, "-i", url, "-frames:v", "1", "-vf", "scale=1280:-2", "-q:v", "3", file],
      { stdio: "ignore" },
    );
    const timer = setTimeout(() => child.kill("SIGKILL"), 60000);
    child.on("error", () => {
      clearTimeout(timer);
      resolve(false);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve(code === 0);
    });
  });
}

async function extractPoster(url: string, outFile: string) {
  const ok = (await grabFrame(url, "1.5", outFile)) || (await grabFrame(url, "0.2", outFile));
  if (!ok) return null;
  const bytes = await readFile(outFile);
  if (bytes.length < 64) return null;
  return bytes;
}

function mediaPublicUrl(path: string) {
  if (path.startsWith("https://") || path.startsWith("http://")) return path;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/object/public/media/${path}`;
}

function argValue(name: string) {
  const index = process.argv.indexOf(name);
  if (index < 0) return null;
  return process.argv[index + 1] ?? null;
}

type RpcResult<T> = { data: T | null; error: string | null };

async function rpc<T>(name: string, body: Record<string, unknown>, token?: string): Promise<RpcResult<T>> {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
  const response = await fetch(`${base}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(token ? { "x-admin-token": token } : {}),
    },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  if (!response.ok) {
    try {
      const parsed = JSON.parse(text) as { message?: string; error?: string };
      return { data: null, error: parsed.message || parsed.error || text || response.statusText };
    } catch {
      return { data: null, error: text || response.statusText };
    }
  }
  if (!text) return { data: null as T, error: null };
  try {
    return { data: JSON.parse(text) as T, error: null };
  } catch {
    return { data: text as T, error: null };
  }
}

async function uploadPoster(ticketPath: string, jpeg: Buffer, token: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

  const ticket = await rpc<null>("begin_media_upload", {
    raw_token: token,
    ticket_path: ticketPath,
  });
  if (ticket.error) throw new Error(ticket.error);

  const response = await fetch(`${base}/storage/v1/object/media/${ticketPath}`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "image/jpeg",
      "x-upsert": "false",
    },
    body: new Uint8Array(jpeg),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Storage upload failed");
  }
}

async function main() {
  const force = process.argv.includes("--force");
  const limitRaw = argValue("--limit");
  const limit = limitRaw ? Number(limitRaw) : Infinity;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const password = process.env.MAXYL_ADMIN_PASSWORD;

  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local");
  }
  if (!password) {
    throw new Error("Set MAXYL_ADMIN_PASSWORD to your admin desk password, then run again.");
  }

  const login = await rpc<string>("open_admin_session", { candidate: password });
  if (login.error || typeof login.data !== "string" || !login.data) {
    throw new Error(login.error || "Wrong admin password.");
  }
  const token = login.data;

  const listed = await rpc<Array<Record<string, unknown>>>("list_admin_media", { raw_token: token });
  if (listed.error) throw new Error(listed.error);

  const videos =
    listed.data?.filter((row) => {
      if (row.kind !== "video") return false;
      const hasPoster = typeof row.poster_path === "string" && row.poster_path.length > 0;
      return force || !hasPoster;
    }) ?? [];

  const work = videos.slice(0, Number.isFinite(limit) ? limit : videos.length);
  console.log(`Found ${videos.length} video(s) to poster${force ? " (force)" : ""}. Processing ${work.length}.`);

  const workDir = join(
    tmpdir(),
    `maxyl-backfill-${createHash("sha1").update(String(Date.now())).digest("hex").slice(0, 8)}`,
  );
  await mkdir(workDir, { recursive: true });

  let okCount = 0;
  let failCount = 0;

  try {
    for (const [index, row] of work.entries()) {
      const id = String(row.id);
      const title = String(row.title || id);
      const storagePath = String(row.storage_path || "");
      const source = mediaPublicUrl(storagePath);
      process.stdout.write(`[${index + 1}/${work.length}] ${title} … `);

      if (!source.startsWith("http")) {
        console.log("skip (bad path)");
        failCount += 1;
        continue;
      }

      const localFile = join(workDir, `${id}.jpg`);
      const jpeg = await extractPoster(source, localFile);
      if (!jpeg) {
        console.log("ffmpeg failed");
        failCount += 1;
        continue;
      }

      const ticketPath = `uploads/${randomUUID()}.jpg`;
      try {
        await uploadPoster(ticketPath, jpeg, token);
        const saved = await rpc<string>("save_item_poster", {
          raw_token: token,
          item_id: id,
          item_path: ticketPath,
        });
        if (saved.error) throw new Error(saved.error);
        console.log("ok");
        okCount += 1;
      } catch (caught) {
        console.log(caught instanceof Error ? caught.message : "failed");
        failCount += 1;
      }
    }
  } finally {
    await rm(workDir, { recursive: true, force: true });
    await rpc("close_admin_session", { raw_token: token });
  }

  console.log(`\nDone. ${okCount} saved, ${failCount} failed.`);
  if (okCount === 0 && work.length > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
