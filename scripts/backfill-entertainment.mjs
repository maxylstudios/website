/**
 * Fill empty entertainment captions, credits, and a partner link.
 * Does not overwrite fields that already have text.
 *
 *   MAXYL_ADMIN_PASSWORD='...' node scripts/backfill-entertainment.mjs
 *
 * Needs supabase/17_ads_meta.sql and supabase/18_external_url.sql.
 */

import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const raw of readFileSync(path, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvFile(join(process.cwd(), ".env.local"));

async function rpc(name, body) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const response = await fetch(`${base}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  if (!response.ok) {
    try {
      return { data: null, error: JSON.parse(text).message || text };
    } catch {
      return { data: null, error: text || response.statusText };
    }
  }
  if (!text) return { data: null, error: null };
  try {
    return { data: JSON.parse(text), error: null };
  } catch {
    return { data: text, error: null };
  }
}

const filmLooks = ["Cinematic", "Photoreal", "Epic scale", "Night grade", "GenAI"];
const microLooks = ["Vertical", "Binge cut", "Phone-first", "Serial", "GenAI"];
const partnerLinks = [
  "https://kukufm.com/",
  "https://www.instagram.com/kuku_fm/",
  "https://www.youtube.com/@kukufm",
  "https://x.com/kukufmofficial",
];

function pick(list, seed, salt) {
  const hex = createHash("sha1").update(`${seed}:${salt}`).digest("hex");
  return list[Number.parseInt(hex.slice(0, 8), 16) % list.length];
}

function roomOf(row) {
  const slug = row.category_slug && row.category_slug !== "entertainment" ? row.category_slug : row.subcategory_slug;
  return slug === "microdramas" ? "Microdramas" : "Films";
}

async function main() {
  const password = process.env.MAXYL_ADMIN_PASSWORD;
  if (!password || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    throw new Error("Need MAXYL_ADMIN_PASSWORD plus Supabase env in .env.local");
  }

  const login = await rpc("open_admin_session", { candidate: password });
  if (login.error || typeof login.data !== "string") throw new Error(login.error || "Login failed");
  const token = login.data;

  const listed = await rpc("list_admin_media", { raw_token: token });
  if (listed.error || !listed.data) throw new Error(listed.error || "Could not list media");

  const rows = listed.data.filter((row) => row.section === "entertainment");
  console.log(`Backfilling ${rows.length} entertainment title(s)…`);

  let ok = 0;
  let fail = 0;

  for (const row of rows) {
    const id = String(row.id);
    const title = String(row.title || "Untitled").trim() || "Untitled";
    const room = roomOf(row);
    const micro = room === "Microdramas";
    const caption =
      String(row.caption || "").trim() ||
      (micro
        ? `${title} is a Maxyl microdrama — a short, bingeable story cut for the phone and carried on Kuku TV.`
        : `${title} is an original Maxyl film. GenAI is the camera and the set. The cut, the grade, and the taste stay with the studio.`);
    const client = String(row.client || "").trim() || "Maxyl Studios";
    const role = String(row.role || "").trim() || (micro ? "Microdrama" : "Original film");
    const style = String(row.style_tag || "").trim() || pick(micro ? microLooks : filmLooks, id, "look");
    const url = String(row.external_url || "").trim() || (micro ? "https://kukufm.com/" : pick(partnerLinks, id, "link"));

    process.stdout.write(`${title} … `);
    const saved = await rpc("save_item_ads_meta", {
      raw_token: token,
      item_id: id,
      item_title: title,
      item_caption: caption,
      item_client: client,
      item_role: role,
      item_style: style,
    });
    if (saved.error) {
      console.log(saved.error);
      fail += 1;
      continue;
    }

    const linked = await rpc("save_item_external_url", {
      raw_token: token,
      item_id: id,
      item_url: url,
    });
    if (linked.error) {
      console.log(`copy saved, link skipped (${linked.error})`);
      fail += 1;
      continue;
    }
    console.log("ok");
    ok += 1;
  }

  await rpc("close_admin_session", { raw_token: token });
  console.log(`\nDone. ${ok} saved, ${fail} failed.`);
  if (fail) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
