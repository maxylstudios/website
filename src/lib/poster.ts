import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

function ffmpegBin() {
  if (existsSync("/opt/homebrew/bin/ffmpeg")) return "/opt/homebrew/bin/ffmpeg";
  if (existsSync("/usr/local/bin/ffmpeg")) return "/usr/local/bin/ffmpeg";
  if (existsSync("/usr/bin/ffmpeg")) return "/usr/bin/ffmpeg";
  return "ffmpeg";
}

const cacheDir = join(tmpdir(), "maxyl-posters");
const pending = new Map<string, Promise<Buffer | null>>();
let active = 0;
const waiters: Array<() => void> = [];

function slot() {
  if (active < 2) {
    active += 1;
    return Promise.resolve();
  }
  return new Promise<void>((resolve) => {
    waiters.push(() => {
      active += 1;
      resolve();
    });
  });
}

function release() {
  active -= 1;
  waiters.shift()?.();
}

function grab(url: string, at: string, file: string) {
  return new Promise<boolean>((resolve) => {
    const child = spawn(
      ffmpegBin(),
      ["-y", "-hide_banner", "-loglevel", "error", "-ss", at, "-i", url, "-frames:v", "1", "-vf", "scale=960:-2", "-q:v", "4", file],
      { stdio: "ignore" },
    );
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
    }, 25000);
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

async function extract(url: string) {
  await mkdir(cacheDir, { recursive: true });
  const file = join(cacheDir, `${createHash("sha1").update(url).digest("hex")}.jpg`);
  try {
    return await readFile(file);
  } catch {
    // A miss just means we still have to cut a frame.
  }

  await slot();
  try {
    try {
      return await readFile(file);
    } catch {
      // Another request may have written it while this one waited.
    }
    const saved = (await grab(url, "1.5", file)) || (await grab(url, "0", file));
    if (!saved) return null;
    const bytes = await readFile(file);
    if (bytes.length < 32) return null;
    return bytes;
  } finally {
    release();
  }
}

export function posterJpeg(url: string) {
  const current = pending.get(url);
  if (current) return current;
  const job = extract(url).finally(() => pending.delete(url));
  pending.set(url, job);
  return job;
}
