"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { HomeFilmCard } from "@/components/home-film-card";
import { isPortraitItem, type MediaItem } from "@/lib/media";

export type EntertainmentRow = {
  slug: string;
  name: string;
  href: string;
  items: MediaItem[];
};

function Row({ row }: { row: EntertainmentRow }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  function updateButtons() {
    const node = scrollerRef.current;
    if (!node) return;
    const max = node.scrollWidth - node.clientWidth;
    setCanPrev(node.scrollLeft > 8);
    setCanNext(max > 8 && node.scrollLeft < max - 8);
  }

  useEffect(() => {
    const node = scrollerRef.current;
    if (!node) return;
    updateButtons();
    node.addEventListener("scroll", updateButtons, { passive: true });
    window.addEventListener("resize", updateButtons);
    return () => {
      node.removeEventListener("scroll", updateButtons);
      window.removeEventListener("resize", updateButtons);
    };
  }, [row.items.length]);

  function scrollByCard(direction: -1 | 1) {
    const node = scrollerRef.current;
    if (!node) return;
    node.scrollBy({ left: node.clientWidth * 0.72 * direction, behavior: "smooth" });
  }

  return (
    <section className="mt-10">
      <div className="flex items-end justify-between gap-4 px-5 sm:px-8">
        <div>
          <Link href={row.href} className="text-xl font-bold hover:text-white/80 sm:text-2xl">
            {row.name}
          </Link>
          <p className="mt-1 text-xs tracking-[0.18em] text-muted uppercase">
            {row.items.length === 0 ? "Shelf is open" : `${row.items.length} pieces`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {row.items.length > 1 ? (
            <>
              <button
                type="button"
                aria-label={`Previous ${row.name}`}
                disabled={!canPrev}
                onClick={() => scrollByCard(-1)}
                className="flex h-9 w-9 items-center justify-center text-white disabled:opacity-25"
              >
                <Chevron direction="left" />
              </button>
              <button
                type="button"
                aria-label={`Next ${row.name}`}
                disabled={!canNext}
                onClick={() => scrollByCard(1)}
                className="flex h-9 w-9 items-center justify-center text-white disabled:opacity-25"
              >
                <Chevron direction="right" />
              </button>
            </>
          ) : null}
          <Link href={row.href} className="text-xs tracking-[0.16em] text-muted uppercase hover:text-white">
            Open
          </Link>
        </div>
      </div>
      {row.items.length === 0 ? null : (
        <div
          ref={scrollerRef}
          className="row-scroll mt-4 flex snap-x snap-mandatory items-start gap-4 overflow-x-auto px-5 pb-2 sm:gap-5 sm:px-8"
        >
          {row.items.map((item) => (
            <HomeFilmCard
              key={item.id}
              item={item}
              orientation={isPortraitItem(item) ? "portrait" : "landscape"}
            />
          ))}
        </div>
      )}
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

export function EntertainmentBrowse({ rows }: { rows: EntertainmentRow[] }) {
  const filled = rows.filter((row) => row.items.length > 0);
  if (filled.length === 0) return null;

  return (
    <div className="pb-16">
      {filled.map((row) => (
        <Row key={row.slug} row={row} />
      ))}
    </div>
  );
}
