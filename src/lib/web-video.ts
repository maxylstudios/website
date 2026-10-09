import { spawn } from "node:child_process";
import { createReadStream, createWriteStream } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { ReadableStream as WebReadableStream } from "node:stream/web";

/** A smaller H.264 file that can start before the download finishes. Falls back to the original if ffmpeg cannot run. */
export async function optimizeWebVideo(source: ReadableStream, fallbackType: string) {
  const dir = await mkdtemp(join(tmpdir(), "maxyl-video-"));
  const input = join(dir, "in");
  const output = join(dir, "out.mp4");
  const cleanup = () => {
    void rm(dir, { recursive: true, force: true });
  };
  try {
    await pipeline(Readable.fromWeb(source as WebReadableStream), createWriteStream(input));
    const prepared = await runFfmpeg(input, output);
    const stream = createReadStream(prepared ? output : input);
    stream.on("close", cleanup);
    return { body: stream, contentType: prepared ? "video/mp4" : fallbackType };
  } catch (error) {
    cleanup();
    throw error;
  }
}

function runFfmpeg(input: string, output: string) {
  return new Promise<boolean>((resolve) => {
    const child = spawn(
      "ffmpeg",
      [
        "-y",
        "-i",
        input,
        "-map",
        "0:v:0",
        "-map",
        "0:a:0?",
        "-vf",
        "scale='min(1920,iw)':-2",
        "-c:v",
        "libx264",
        "-profile:v",
        "high",
        "-pix_fmt",
        "yuv420p",
        "-crf",
        "23",
        "-preset",
        "veryfast",
        "-c:a",
        "aac",
        "-b:a",
        "128k",
        "-ac",
        "2",
        "-movflags",
        "+faststart",
        output,
      ],
      { stdio: "ignore" },
    );
    child.on("error", () => resolve(false));
    child.on("close", (code) => resolve(code === 0));
  });
}
