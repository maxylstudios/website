"use client";

import Image from "next/image";
import { useState } from "react";
import { VideoMark } from "@/components/video-mark";
import { frameStyleForItem, mediaPublicUrl, objectPosition, type MediaItem } from "@/lib/media";

type Props = {
  item: MediaItem;
  className?: string;
  sizes?: string;
  autoPlay?: boolean;
  loop?: boolean;
  preload?: "none" | "metadata" | "auto";
  /** When false, a video is not requested yet. */
  active?: boolean;
  /** Fill the parent and crop, instead of letterboxing the original frame. */
  fill?: boolean;
  onRatioChange?: (ratio: string) => void;
};

export function MediaThumb({
  item,
  className = "overflow-hidden rounded-2xl bg-neutral-950",
  sizes = "(min-width: 640px) 33vw, 50vw",
  autoPlay = false,
  loop = false,
  preload = "metadata",
  active = true,
  fill = false,
  onRatioChange,
}: Props) {
  const [ratio, setRatio] = useState(frameStyleForItem(item).aspectRatio);
  const url = mediaPublicUrl(item.storage_path);

  return (
    <span className={`relative block w-full ${className}`} style={fill ? undefined : { aspectRatio: ratio }}>
      {item.kind === "video" && !active ? (
        <span className="absolute inset-0 bg-black" />
      ) : item.kind === "video" ? (
        <>
          <video
            src={url}
            muted
            playsInline
            autoPlay={autoPlay}
            loop={loop}
            preload={preload}
            className={`absolute inset-0 h-full w-full ${fill ? "object-cover transition duration-700 group-hover:scale-105" : "object-contain"}`}
            onLoadedMetadata={(event) => {
              const video = event.currentTarget;
              if (video.videoWidth > 0 && video.videoHeight > 0) {
                const next = `${video.videoWidth} / ${video.videoHeight}`;
                setRatio(next);
                onRatioChange?.(next);
              }
            }}
          />
          <VideoMark />
        </>
      ) : (
        <Image
          src={url}
          alt=""
          fill
          sizes={sizes}
          className="object-cover"
          style={{ objectPosition: objectPosition(item.crop) }}
        />
      )}
    </span>
  );
}
