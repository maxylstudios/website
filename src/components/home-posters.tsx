"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MediaThumb } from "@/components/media-thumb";
import { mediaHref, type MediaItem } from "@/lib/media";

function PosterCard({ item }: { item: MediaItem }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = cardRef.current;
    if (!node) return;
    let shown = false;
    const reveal = () => {
      if (shown) return;
      const box = node.getBoundingClientRect();
      if (box.bottom <= 0 || box.top >= window.innerHeight) return;
      shown = true;
      setVisible(true);
    };
    reveal();
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) reveal();
    });
    observer.observe(node);
    window.addEventListener("scroll", reveal, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", reveal);
    };
  }, []);

  return (
    <div ref={cardRef} className="min-w-0">
      <Link
        href={mediaHref(item)}
        aria-label={item.title}
        className="relative block overflow-hidden rounded-[1.35rem] border border-white/30 bg-black shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_18px_50px_rgba(0,0,0,0.55),0_0_32px_rgba(139,92,246,0.28)]"
      >
        <MediaThumb
          item={item}
          active={visible}
          autoPlay={visible}
          loop={visible}
          preload={visible ? "metadata" : "none"}
          className="overflow-hidden rounded-none bg-black"
          sizes="80vw"
        />
        <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.32),rgba(255,255,255,0.05)_16%,transparent_34%)]" />
        <span className="pointer-events-none absolute inset-0 rounded-[1.35rem] ring-1 ring-inset ring-white/25" />
      </Link>
    </div>
  );
}

export function masonryColumns<T>(items: T[]) {
  if (items.length <= 1) return [items];
  return [items.filter((_, index) => index % 2 === 0), items.filter((_, index) => index % 2 === 1)];
}

export function HomePosters({
  items,
  className = "py-8",
  balanced = false,
}: {
  items: MediaItem[];
  className?: string;
  balanced?: boolean;
}) {
  if (items.length === 0) return null;
  const columns = masonryColumns(items);
  const template = balanced ? "grid-cols-2" : columns.length > 1 ? "grid-cols-[1.55fr_0.58fr]" : "grid-cols-1";

  return (
    <section className={`bg-black ${className}`}>
      <div className={`mx-auto grid w-[94vw] items-start gap-3 sm:gap-4 ${template}`}>
        {columns.map((column, index) => (
          <div key={index} className="flex flex-col gap-3 sm:gap-4">
            {column.map((item) => (
              <PosterCard key={item.id} item={item} />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
