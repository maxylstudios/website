"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearHeroVideo, saveHeroVideo } from "@/app/admin/actions";
import { uploadAdminFile } from "@/lib/admin-upload";
import { mediaPublicUrl } from "@/lib/media";

type Progress = {
  percent: number;
  label: string;
} | null;

export function HeroEditor({ path, message }: { path: string | null; message: string }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<Progress>(null);
  const [error, setError] = useState(message);
  const [preview, setPreview] = useState<string | null>(path ? mediaPublicUrl(path) : null);

  useEffect(() => {
    if (!file) {
      setPreview(path ? mediaPublicUrl(path) : null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file, path]);

  async function save() {
    if (!file) {
      setError("Choose a video.");
      return;
    }
    if (!file.type.startsWith("video/")) {
      setError("Choose a video file.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      const storagePath = await uploadAdminFile(file, "video", setProgress, { optimize: true });
      setProgress({ percent: 97, label: "Saving" });
      const result = await saveHeroVideo(storagePath);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setFile(null);
      setProgress(null);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save the hero video.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    setError("");
    const result = await clearHeroVideo();
    setBusy(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setFile(null);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-xs font-semibold tracking-[0.28em] text-muted uppercase">Homepage</p>
      <h1 className="mt-2 text-3xl font-bold">Hero video</h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
        This video plays on the homepage only. It stays separate from the library.
      </p>

      <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-black">
        {preview ? (
          <video src={preview} className="aspect-video w-full bg-black object-cover" controls playsInline />
        ) : (
          <div className="flex aspect-video items-center justify-center text-sm text-muted">No hero video yet.</div>
        )}
      </div>

      <label className="mt-6 block text-sm">
        Video file
        <input
          type="file"
          accept="video/*"
          disabled={busy}
          onChange={(event) => {
            setFile(event.target.files?.[0] ?? null);
            setError("");
          }}
          className="mt-2 block w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-bold file:text-black"
        />
      </label>

      {progress ? (
        <p className="mt-4 text-sm text-muted">
          {progress.label} · {progress.percent}%
        </p>
      ) : null}
      {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={busy || !file}
          onClick={() => void save()}
          className="rounded bg-white px-5 py-3 text-sm font-bold text-black disabled:opacity-40"
        >
          {path ? "Replace video" : "Save video"}
        </button>
        {path ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void remove()}
            className="rounded border border-white/30 px-5 py-3 text-sm font-bold disabled:opacity-40"
          >
            Remove
          </button>
        ) : null}
      </div>
    </div>
  );
}
