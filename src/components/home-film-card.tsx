"use client";

import Link from "next/link";
import { MediaPoster } from "@/components/media-poster";
import { MediaThumb } from "@/components/media-thumb";
import { mediaHref, type MediaItem } from "@/lib/media";

type Orientation = "portrait" | "landscape";

function PlayMark() {
  return (
    <span className="pointer-events-none absolute top-1/2 left-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/25 text-white/80 backdrop-blur-[2px]" aria-hidden>
      <svg width="10" height="12" viewBox="0 0 9 10">
        <path d="M1.1.8v8.4L8.2 5 1.1.8Z" fill="currentColor" />
      </svg>
    </span>
  );
}

export function HomeFilmCard({
  item,
  orientation,
}: {
  item: MediaItem;
  orientation: Orientation;
  autoPlay?: boolean;
}) {
  const portrait = orientation === "portrait";

  return (
    <Link
      href={mediaHref(item)}
      aria-label={item.kind === "video" ? "Play film" : "Open picture"}
      className={`group relative flex shrink-0 snap-start overflow-hidden rounded-[1.35rem] border border-white/30 bg-black shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_18px_44px_rgba(0,0,0,0.5),0_0_28px_rgba(139,92,246,0.24)] ${
        portrait ? "w-[11.5rem] sm:w-[13rem]" : "w-[min(82vw,20rem)] sm:w-[24rem]"
      }`}
    >
      <span className={`relative block w-full overflow-hidden bg-black ${portrait ? "aspect-[2/3]" : "aspect-video"}`}>
        {item.kind === "video" ? (
          <MediaPoster item={item} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <MediaThumb item={item} fill className="absolute inset-0 h-full overflow-hidden rounded-none bg-black" sizes={portrait ? "208px" : "384px"} />
        )}
        <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.32),rgba(255,255,255,0.05)_16%,transparent_34%)]" />
        <span className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/20" />
        {item.kind === "video" ? <PlayMark /> : null}
      </span>
    </Link>
  );
}
