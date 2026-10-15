"use client";

import Link from "next/link";
import { MediaPoster } from "@/components/media-poster";
import { MediaThumb } from "@/components/media-thumb";
import { mediaHref, type MediaItem } from "@/lib/media";
import { adsCategory } from "@/lib/taxonomy";

export function AdsFilmCard({ item }: { item: MediaItem }) {
  const category = adsCategory(item.category_slug)?.name ?? "Ads";
  const tag = item.style_tag?.trim() || category;
  const title = item.title?.trim() || "Untitled";
  const badge = item.client?.trim() || item.role?.trim() || "";

  return (
    <Link href={mediaHref(item)} className="vault-card group" aria-label={`Open ${title}`}>
      <span className="vault-card-media">
        {item.kind === "video" ? (
          <MediaPoster
            item={item}
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <MediaThumb
            item={item}
            fill
            className="absolute inset-0 h-full overflow-hidden rounded-none bg-black"
            sizes="360px"
          />
        )}
        <span className="vault-card-veil" aria-hidden />
        <span className="vault-card-tag">{tag}</span>
        <span className="vault-card-copy">
          <span className="vault-card-title">{title}</span>
          {badge ? <span className="vault-card-badge">{badge}</span> : null}
        </span>
      </span>
    </Link>
  );
}
