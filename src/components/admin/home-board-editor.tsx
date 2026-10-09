"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveHomepageBoard } from "@/app/admin/actions";
import { masonryColumns } from "@/components/home-posters";
import { MediaThumb } from "@/components/media-thumb";
import { type MediaItem } from "@/lib/media";

type Lane = "video" | "image";

function startingLane(items: MediaItem[], ids: string[] | null, kind: Lane) {
  const pool = items.filter((item) => item.kind === kind);
  if (!ids) return pool.filter((item) => item.published);
  const byId = new Map(pool.map((item) => [item.id, item]));
  return ids.map((id) => byId.get(id)).filter((item): item is MediaItem => item !== undefined);
}

function move(items: MediaItem[], id: string, direction: -1 | 1) {
  const index = items.findIndex((item) => item.id === id);
  const next = index + direction;
  if (index < 0 || next < 0 || next >= items.length) return items;
  const copy = items.slice();
  const [picked] = copy.splice(index, 1);
  copy.splice(next, 0, picked);
  return copy;
}

function insertBefore(items: MediaItem[], draggedId: string, targetId: string) {
  if (draggedId === targetId) return items;
  const dragged = items.find((item) => item.id === draggedId);
  if (!dragged) return items;
  const rest = items.filter((item) => item.id !== draggedId);
  const index = rest.findIndex((item) => item.id === targetId);
  if (index < 0) return items;
  rest.splice(index, 0, dragged);
  return rest;
}

export function HomeBoardEditor({
  items,
  videoIds,
  imageIds,
  message,
}: {
  items: MediaItem[];
  videoIds: string[] | null;
  imageIds: string[] | null;
  message: string;
}) {
  const router = useRouter();
  const [videos, setVideos] = useState(() => startingLane(items, videoIds, "video"));
  const [images, setImages] = useState(() => startingLane(items, imageIds, "image"));
  const [adding, setAdding] = useState<Lane | null>(null);
  const [query, setQuery] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(message);
  const [saved, setSaved] = useState(false);

  const pools = useMemo(() => {
    const used = new Set([...videos, ...images].map((item) => item.id));
    const needle = query.trim().toLowerCase();
    return {
      video: items.filter((item) => item.kind === "video" && !used.has(item.id) && item.title.toLowerCase().includes(needle)),
      image: items.filter((item) => item.kind === "image" && !used.has(item.id) && item.title.toLowerCase().includes(needle)),
    };
  }, [images, items, query, videos]);

  function update(lane: Lane, next: MediaItem[]) {
    setSaved(false);
    if (lane === "video") setVideos(next);
    else setImages(next);
  }

  function add(item: MediaItem) {
    update(item.kind, [...(item.kind === "video" ? videos : images), item]);
  }

  function drop(lane: Lane, targetId: string) {
    if (!dragId) return;
    const current = lane === "video" ? videos : images;
    update(lane, insertBefore(current, dragId, targetId));
    setDragId(null);
  }

  async function save() {
    setBusy(true);
    setError("");
    setSaved(false);
    const result = await saveHomepageBoard(
      videos.map((item) => item.id),
      images.map((item) => item.id),
    );
    setBusy(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-[#c4b5fd] uppercase">Homepage</p>
          <h1 className="mt-2 text-3xl font-bold">Films, then pictures</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
            This is the page under the hero. Drag a tile to reorder it. Order runs left, right, left, right.
          </p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => void save()}
          className="rounded bg-[#8b5cf6] px-5 py-3 text-sm font-bold text-black disabled:opacity-40"
        >
          {busy ? "Saving" : "Save homepage"}
        </button>
      </div>

      {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
      {saved ? <p className="mt-4 text-sm text-[#c4b5fd]">Homepage updated.</p> : null}

      <LaneEditor
        title="Videos"
        hint="The masonry directly under the hero."
        items={videos}
        adding={adding === "video"}
        pool={pools.video}
        query={query}
        onQuery={setQuery}
        onToggleAdd={() => {
          setQuery("");
          setAdding((current) => (current === "video" ? null : "video"));
        }}
        onAdd={add}
        onMove={(id, direction) => update("video", move(videos, id, direction))}
        onRemove={(id) => update("video", videos.filter((item) => item.id !== id))}
        onDragStart={setDragId}
        onDrop={(id) => drop("video", id)}
      />

      <LaneEditor
        title="Images"
        hint="The masonry under the videos."
        balanced
        items={images}
        adding={adding === "image"}
        pool={pools.image}
        query={query}
        onQuery={setQuery}
        onToggleAdd={() => {
          setQuery("");
          setAdding((current) => (current === "image" ? null : "image"));
        }}
        onAdd={add}
        onMove={(id, direction) => update("image", move(images, id, direction))}
        onRemove={(id) => update("image", images.filter((item) => item.id !== id))}
        onDragStart={setDragId}
        onDrop={(id) => drop("image", id)}
      />
    </div>
  );
}

function LaneEditor({
  title,
  hint,
  balanced = false,
  items,
  adding,
  pool,
  query,
  onQuery,
  onToggleAdd,
  onAdd,
  onMove,
  onRemove,
  onDragStart,
  onDrop,
}: {
  title: string;
  hint: string;
  balanced?: boolean;
  items: MediaItem[];
  adding: boolean;
  pool: MediaItem[];
  query: string;
  onQuery: (value: string) => void;
  onToggleAdd: () => void;
  onAdd: (item: MediaItem) => void;
  onMove: (id: string, direction: -1 | 1) => void;
  onRemove: (id: string) => void;
  onDragStart: (id: string) => void;
  onDrop: (id: string) => void;
}) {
  const columns = masonryColumns(items);

  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">{title}</h2>
          <p className="mt-1 text-sm text-muted">{hint}</p>
        </div>
        <button
          type="button"
          onClick={onToggleAdd}
          className="rounded-full border border-white/20 px-4 py-2 text-sm font-bold"
        >
          {adding ? "Close library" : `Add ${title.toLowerCase()}`}
        </button>
      </div>

      {items.length === 0 ? (
        <p className="mt-6 rounded-[1.35rem] border border-dashed border-white/20 px-6 py-12 text-center text-sm text-muted">
          Nothing in this section yet.
        </p>
      ) : (
        <div className={`mt-6 grid items-start gap-3 ${balanced ? "grid-cols-2" : columns.length > 1 ? "grid-cols-[1.55fr_0.58fr]" : "grid-cols-1"}`}>
          {columns.map((column, index) => (
            <div key={index} className="flex flex-col gap-3">
              {column.map((item) => (
                <article
                  key={item.id}
                  draggable
                  onDragStart={() => onDragStart(item.id)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => onDrop(item.id)}
                  className="relative overflow-hidden rounded-[1.35rem] border border-white/30 bg-black shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_18px_50px_rgba(0,0,0,0.55),0_0_32px_rgba(139,92,246,0.28)]"
                >
                  <MediaThumb item={item} active preload="metadata" className="overflow-hidden rounded-none bg-black" sizes="40vw" />
                  <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-black via-black/80 to-transparent px-3 pt-10 pb-3">
                    <p className="min-w-0 flex-1 truncate text-sm font-bold">
                      <Link href={`/admin/media/${item.id}`} className="hover:underline">
                        {item.title}
                      </Link>
                    </p>
                    {!item.published ? (
                      <span className="rounded-full bg-white/15 px-2 py-1 text-[10px] font-semibold text-white">Hidden</span>
                    ) : null}
                    <button type="button" aria-label={`Move ${item.title} earlier`} onClick={() => onMove(item.id, -1)} className="rounded bg-white/15 px-2 py-1 text-xs font-bold">
                      Earlier
                    </button>
                    <button type="button" aria-label={`Move ${item.title} later`} onClick={() => onMove(item.id, 1)} className="rounded bg-white/15 px-2 py-1 text-xs font-bold">
                      Later
                    </button>
                    <button type="button" aria-label={`Take ${item.title} off the homepage`} onClick={() => onRemove(item.id)} className="rounded bg-white px-2 py-1 text-xs font-bold text-black">
                      Off page
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ))}
        </div>
      )}

      {adding ? (
        <div className="mt-4 rounded-[1.35rem] border border-white/15 bg-white/[0.03] p-4">
          <input
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            placeholder={`Search ${title.toLowerCase()}`}
            className="w-full rounded-full border border-white/10 bg-black px-4 py-2.5 text-sm outline-none focus:border-white/35"
          />
          {pool.length === 0 ? (
            <p className="px-2 py-8 text-center text-sm text-muted">Nothing left to add.</p>
          ) : (
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {pool.map((item) => (
                <li key={item.id}>
                  <button type="button" onClick={() => onAdd(item)} className="block w-full text-left">
                    <span className="block overflow-hidden rounded-2xl border border-white/10 bg-black">
                      <MediaThumb item={item} preload="metadata" className="overflow-hidden rounded-none bg-black" sizes="20vw" />
                    </span>
                    <span className="mt-2 block truncate text-sm font-semibold">{item.title}</span>
                    {!item.published ? <span className="text-[11px] text-muted">Hidden</span> : null}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </section>
  );
}
