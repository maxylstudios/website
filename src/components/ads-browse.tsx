"use client";

import Link from "next/link";
import { AdsFilmCard } from "@/components/ads-film-card";
import type { MediaItem } from "@/lib/media";

export type AdsRow = {
  slug: string;
  name: string;
  href: string;
  items: MediaItem[];
  index: number;
};

function Shelf({ row }: { row: AdsRow }) {
  return (
    <section id={row.slug} className="vault-row scroll-mt-28">
      <div className="vault-row-head">
        <Link href={row.href} className="vault-row-title">
          <span className="vault-row-num">{String(row.index).padStart(2, "0")}</span>
          {row.name}
        </Link>
        <p className="vault-row-count">
          {row.items.length} cut{row.items.length === 1 ? "" : "s"}
        </p>
      </div>
      <div className="row-scroll vault-rail">
        {row.items.map((item) => (
          <AdsFilmCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

export function AdsBrowse({ rows }: { rows: AdsRow[] }) {
  const filled = rows.filter((row) => row.items.length > 0);
  if (filled.length === 0) {
    return <p className="px-6 py-16 text-sm text-white/45">No ads published yet.</p>;
  }

  return (
    <div className="vault-catalogue">
      {filled.map((row) => (
        <Shelf key={row.slug} row={row} />
      ))}
    </div>
  );
}

export function AdsGalleryGrid({ items }: { items: MediaItem[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-white/45">Nothing filed here yet.</p>;
  }

  return (
    <div className="vault-grid">
      {items.map((item) => (
        <AdsFilmCard key={item.id} item={item} />
      ))}
    </div>
  );
}
