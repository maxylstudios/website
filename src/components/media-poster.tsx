"use client";

import { useState } from "react";
import { mediaPublicUrl, type MediaItem } from "@/lib/media";

type Mode = "uploaded" | "video" | "empty";

function startMode(item: MediaItem): Mode {
  if (item.kind === "image") return "uploaded";
  if (item.poster_path) return "uploaded";
  return "video";
}

/** Prefer a stored poster; otherwise show a muted video frame (no server ffmpeg). */
export function MediaPoster({
  item,
  className,
}: {
  item: MediaItem;
  className?: string;
}) {
  const [mode, setMode] = useState<Mode>(() => startMode(item));
  const videoSrc = mediaPublicUrl(item.storage_path);

  if (item.kind === "image") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={videoSrc} alt="" loading="lazy" className={className} />
    );
  }

  if (mode === "uploaded" && item.poster_path) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={mediaPublicUrl(item.poster_path)}
        alt=""
        loading="lazy"
        className={className}
        onError={() => setMode("video")}
      />
    );
  }

  if (mode === "video") {
    return (
      <video
        src={videoSrc}
        muted
        playsInline
        preload="metadata"
        className={className}
        onLoadedData={(event) => {
          const node = event.currentTarget;
          const tip = Number.isFinite(node.duration) && node.duration > 0 ? Math.min(1.5, node.duration * 0.08) : 0.1;
          try {
            node.currentTime = tip;
          } catch {
            // Some browsers block seeking until more data arrives.
          }
        }}
        onError={() => setMode("empty")}
      />
    );
  }

  return <span className={`block bg-neutral-900 ${className ?? ""}`} aria-hidden />;
}
