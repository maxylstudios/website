"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MediaThumb } from "@/components/media-thumb";
import { mediaHref, type MediaItem } from "@/lib/media";

function ReelCard({ item, portrait }: { item: MediaItem; portrait: boolean }) {
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
    <div ref={cardRef}>
      <Link
        href={mediaHref(item)}
        className="group relative block overflow-hidden border border-[#8b5cf6]/40 bg-black shadow-[0_0_0_1px_rgba(139,92,246,0.08)] transition duration-300 hover:border-[#c4b5fd] hover:shadow-[0_0_36px_rgba(139,92,246,0.28)]"
      >
        <span className="pointer-events-none absolute top-0 left-0 z-10 h-3 w-3 border-t-2 border-l-2 border-[#c4b5fd]" />
        <span className="pointer-events-none absolute top-0 right-0 z-10 h-3 w-3 border-t-2 border-r-2 border-[#c4b5fd]" />
        <span className="pointer-events-none absolute bottom-0 left-0 z-10 h-3 w-3 border-b-2 border-l-2 border-[#c4b5fd]" />
        <span className="pointer-events-none absolute right-0 bottom-0 z-10 h-3 w-3 border-r-2 border-b-2 border-[#c4b5fd]" />
        <span className={`relative block overflow-hidden ${portrait ? "aspect-[9/16]" : "aspect-video"}`}>
          <MediaThumb
            item={item}
            fill
            active={visible}
            autoPlay={visible}
            loop={visible}
            preload={visible ? "metadata" : "none"}
            className="absolute inset-0 h-full overflow-hidden rounded-none bg-black"
            sizes={portrait ? "(min-width: 640px) 320px, 46vw" : "(min-width: 768px) 50vw, 100vw"}
          />
        </span>
        <span className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-[linear-gradient(to_top,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0.55)_55%,transparent)] p-4 sm:p-5">
          <span className="block text-[11px] tracking-[0.22em] text-[#c4b5fd] uppercase">{item.label || "Film"}</span>
          <span className={`mt-1 block font-bold ${portrait ? "line-clamp-2 text-base" : "line-clamp-2 text-lg sm:text-xl"}`}>
            {item.title}
          </span>
        </span>
      </Link>
    </div>
  );
}

export function HomeHero({
  vertical,
  horizontal,
}: {
  vertical: MediaItem[];
  horizontal: MediaItem[];
}) {
  const portraits = vertical.slice(0, 2);
  const landscapes = horizontal.slice(0, 2);
  if (portraits.length === 0 && landscapes.length === 0) return null;

  return (
    <section className="border-t border-[#8b5cf6]/70 bg-[linear-gradient(180deg,rgba(139,92,246,0.2),transparent_22rem)] px-4 py-12 sm:px-8 sm:py-16 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-xl">
          <span className="mb-4 block h-0.5 w-10 bg-[#8b5cf6]" aria-hidden />
          <h2 className="text-3xl font-bold sm:text-4xl">Selected films</h2>
          <p className="mt-3 text-sm leading-6 text-white/75 sm:text-base">A short cut from the reel.</p>
        </div>

        {landscapes.length > 0 ? (
          <div className={`mt-8 grid gap-4 ${landscapes.length > 1 ? "md:grid-cols-2" : ""}`}>
            {landscapes.map((item) => (
              <ReelCard key={item.id} item={item} portrait={false} />
            ))}
          </div>
        ) : null}

        {portraits.length > 0 ? (
          <div
            className={`mx-auto mt-8 grid gap-5 ${
              portraits.length > 1 ? "max-w-[42rem] grid-cols-2" : "max-w-[20rem] grid-cols-1"
            }`}
          >
            {portraits.map((item) => (
              <ReelCard key={item.id} item={item} portrait />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
