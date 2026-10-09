"use client";

import Link from "next/link";
import { useState } from "react";
import { MediaThumb } from "@/components/media-thumb";
import { mediaHref, type MediaItem } from "@/lib/media";

type Orientation = "portrait" | "landscape";

function PlayCue() {
  return (
    <span className="inline-flex shrink-0 items-center gap-2 text-[#c4b5fd]">
      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-current/45">
        <svg width="9" height="10" viewBox="0 0 9 10" aria-hidden>
          <path d="M1.1.9v8.2L8 5 1.1.9Z" fill="currentColor" />
        </svg>
      </span>
      <span className="text-[10px] font-semibold tracking-[0.22em] uppercase">Play</span>
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
  const [still, setStill] = useState(true);

  return (
    <Link
      href={mediaHref(item)}
      aria-label={item.kind === "video" ? `Play ${item.title}` : item.title}
      className={`group flex shrink-0 snap-start flex-col overflow-hidden rounded-[1.35rem] border border-white/30 bg-black shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_18px_44px_rgba(0,0,0,0.5),0_0_28px_rgba(139,92,246,0.24)] ${
        portrait ? "w-[11.5rem] sm:w-[13rem]" : "w-[min(82vw,20rem)] sm:w-[24rem]"
      }`}
    >
      <span className={`relative block overflow-hidden bg-black ${portrait ? "aspect-[2/3]" : "aspect-video"}`}>
        {item.kind === "video" && still ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/poster/${item.id}`}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
            onError={() => setStill(false)}
          />
        ) : item.kind === "image" ? (
          <MediaThumb item={item} fill className="absolute inset-0 h-full overflow-hidden rounded-none bg-black" sizes={portrait ? "208px" : "384px"} />
        ) : null}
        <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.32),rgba(255,255,255,0.05)_16%,transparent_34%)]" />
        <span className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/20" />
      </span>
      <span className="flex items-center gap-3 border-t border-white/10 bg-white/[0.045] px-3.5 py-3">
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[10px] tracking-[0.2em] text-muted uppercase">{item.label || "Film"}</span>
          <span className={`mt-1 block font-bold ${portrait ? "line-clamp-2 text-sm leading-snug" : "truncate text-base"}`}>
            {item.title}
          </span>
        </span>
        {item.kind === "video" ? <PlayCue /> : null}
      </span>
    </Link>
  );
}
