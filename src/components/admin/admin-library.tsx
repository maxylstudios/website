"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { mediaPublicUrl, type MediaItem } from "@/lib/media";
import { placeLabel } from "@/lib/taxonomy";

type Props = {
  items: MediaItem[];
  message?: string;
};

export function AdminLibrary({ items, message = "" }: Props) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "live" | "hidden" | "home" | "video" | "image">("all");

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((item) => {
      if (filter === "live" && !item.published) return false;
      if (filter === "hidden" && item.published) return false;
      if (filter === "home" && !item.show_on_home) return false;
      if (filter === "video" && item.kind !== "video") return false;
      if (filter === "image" && item.kind !== "image") return false;
      if (!needle) return true;
      const place = placeLabel(item.section ?? "", item.category_slug ?? "", item.subcategory_slug ?? "");
      return `${item.title} ${item.label} ${place}`.toLowerCase().includes(needle);
    });
  }, [filter, items, query]);

  const liveCount = items.filter((item) => item.published).length;
  const homeCount = items.filter((item) => item.show_on_home).length;

  return (
    <div>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs tracking-[0.22em] text-muted uppercase">Studio desk</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Library</h1>
          <p className="mt-2 text-sm text-muted">
            {items.length} uploads · {liveCount} live · {homeCount} on home
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/media/new"
            className="inline-flex w-fit items-center rounded-full bg-ember px-5 py-2.5 text-sm font-bold"
          >
            New upload
          </Link>
          <Link
            href="/admin/media/batch"
            className="inline-flex w-fit items-center rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold"
          >
            Batch upload
          </Link>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search title or category"
          className="w-full rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm outline-none focus:border-white/35 sm:max-w-sm"
        />
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", "All"],
              ["live", "Live"],
              ["hidden", "Hidden"],
              ["home", "Home"],
              ["video", "Video"],
              ["image", "Image"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                filter === id ? "bg-white text-black" : "bg-white/10 text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {message ? <p className="mt-4 text-sm text-ember">{message}</p> : null}

      {visible.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-white/15 px-6 py-16 text-center">
          <p className="text-sm text-muted">{items.length === 0 ? "Nothing uploaded yet." : "No matches."}</p>
          {items.length === 0 ? (
            <Link href="/admin/media/new" className="mt-4 inline-block text-sm font-semibold text-white">
              Upload the first film
            </Link>
          ) : null}
        </div>
      ) : (
        <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((item) => (
            <li key={item.id}>
              <Link
                href={`/admin/media/${item.id}`}
                className="group block overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] transition hover:border-white/30"
              >
                <span className="relative block aspect-video bg-black">
                  {item.kind === "image" ? (
                    <Image
                      src={mediaPublicUrl(item.storage_path)}
                      alt=""
                      fill
                      sizes="320px"
                      className="object-cover transition duration-300 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <video
                      src={mediaPublicUrl(item.storage_path)}
                      muted
                      playsInline
                      preload="metadata"
                      className="absolute inset-0 h-full w-full object-contain"
                    />
                  )}
                </span>
                <span className="block px-4 py-4">
                  <span className="block truncate text-lg font-bold">{item.title}</span>
                  <span className="mt-1 block truncate text-sm text-muted">
                    {placeLabel(item.section ?? "", item.category_slug ?? "", item.subcategory_slug ?? "")}
                  </span>
                  <span className="mt-3 flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        item.published ? "bg-white text-black" : "bg-white/10 text-muted"
                      }`}
                    >
                      {item.published ? "Live" : "Hidden"}
                    </span>
                    {item.show_on_home ? (
                      <span className="rounded-full bg-ember/20 px-2.5 py-1 text-[11px] font-semibold text-white">
                        Home
                      </span>
                    ) : null}
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-muted">
                      {item.kind} · {item.aspect}
                    </span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
