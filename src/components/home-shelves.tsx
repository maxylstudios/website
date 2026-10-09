"use client";

import Link from "next/link";
import { useRef } from "react";
import { isPortraitItem, mediaHref, mediaPublicUrl, type MediaItem } from "@/lib/media";

export function posterSrc(item: MediaItem) {
  if (item.poster_path) return mediaPublicUrl(item.poster_path);
  if (item.kind === "image") return mediaPublicUrl(item.storage_path);
  return `/api/poster/${item.id}`;
}

function PlayMark() {
  return (
    <span className="pointer-events-none absolute top-1/2 left-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/25 text-white/80 backdrop-blur-[2px]" aria-hidden>
      <svg width="10" height="12" viewBox="0 0 9 10">
        <path d="M1.1.8v8.4L8.2 5 1.1.8Z" fill="currentColor" />
      </svg>
    </span>
  );
}

export function ShelfTile({ item, href, frame }: { item: MediaItem; href: string; frame: string }) {
  return (
    <Link href={href} aria-label={item.kind === "video" ? `Play ${item.title}` : item.title} className="relative flex w-max shrink-0 snap-start">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={posterSrc(item)}
        alt=""
        className={`${frame} w-auto rounded-xl border border-white/20 bg-neutral-950 object-contain shadow-[0_16px_40px_rgba(0,0,0,0.45)]`}
      />
      {item.kind === "video" ? <PlayMark /> : null}
    </Link>
  );
}

function Shelf({ title, note, items, frame }: { title: string; note: string; items: MediaItem[]; frame: string }) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  if (items.length === 0) return null;

  return (
    <section className="bg-black pt-8">
      <div className="flex items-end justify-between gap-4 px-5 sm:px-8">
        <div>
          <h2 className="text-xl font-bold sm:text-2xl">{title}</h2>
          <p className="mt-1 text-xs tracking-[0.18em] text-[#c4b5fd] uppercase">{note}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label={`Previous ${title}`}
            onClick={() => scrollerRef.current?.scrollBy({ left: -420, behavior: "smooth" })}
            className="flex h-9 w-9 items-center justify-center text-white"
          >
            <Chevron direction="left" />
          </button>
          <button
            type="button"
            aria-label={`Next ${title}`}
            onClick={() => scrollerRef.current?.scrollBy({ left: 420, behavior: "smooth" })}
            className="flex h-9 w-9 items-center justify-center text-white"
          >
            <Chevron direction="right" />
          </button>
        </div>
      </div>
      <div ref={scrollerRef} className="row-scroll mt-4 flex snap-x snap-mandatory items-start gap-4 overflow-x-auto px-5 pb-6 sm:gap-5 sm:px-8">
        {items.map((item) => (
          <ShelfTile key={item.id} item={item} href={mediaHref(item)} frame={frame} />
        ))}
      </div>
    </section>
  );
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
      {direction === "left" ? (
        <path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="m6 3 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

export function HomeShelves({ videos, images }: { videos: MediaItem[]; images: MediaItem[] }) {
  const horizontal = videos.filter((item) => !isPortraitItem(item));
  const vertical = videos.filter(isPortraitItem);
  if (horizontal.length === 0 && vertical.length === 0 && images.length === 0) return null;
  return (
    <div className="bg-black pb-10">
      <Shelf title="Landscape" note="Wide films" items={horizontal} frame="h-40 sm:h-48" />
      <Shelf title="Portrait" note="Tall films" items={vertical} frame="h-72 sm:h-80" />
      <Shelf title="Pictures" note="Stills" items={images} frame="h-64 sm:h-72" />
    </div>
  );
}
