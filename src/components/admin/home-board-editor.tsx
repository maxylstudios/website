"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveHomepageBoard, saveItemPoster } from "@/app/admin/actions";
import { posterSrc } from "@/components/home-shelves";
import { MediaThumb } from "@/components/media-thumb";
import { uploadAdminFile } from "@/lib/admin-upload";
import { isPortraitItem, type MediaItem } from "@/lib/media";

type Lane = "horizontal" | "vertical" | "image";

function startingLane(items: MediaItem[], ids: string[] | null, kind: "video" | "image") {
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
  const [horizontal, setHorizontal] = useState(() => startingLane(items, videoIds, "video").filter((item) => !isPortraitItem(item)));
  const [vertical, setVertical] = useState(() => startingLane(items, videoIds, "video").filter(isPortraitItem));
  const [images, setImages] = useState(() => startingLane(items, imageIds, "image"));
  const [adding, setAdding] = useState<Lane | null>(null);
  const [query, setQuery] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [posterBusy, setPosterBusy] = useState<string | null>(null);
  const [error, setError] = useState(message);
  const [saved, setSaved] = useState(false);

  const pools = useMemo(() => {
    const used = new Set([...horizontal, ...vertical, ...images].map((item) => item.id));
    const needle = query.trim().toLowerCase();
    const titled = (item: MediaItem) => item.title.toLowerCase().includes(needle);
    return {
      horizontal: items.filter((item) => item.kind === "video" && !isPortraitItem(item) && !used.has(item.id) && titled(item)),
      vertical: items.filter((item) => item.kind === "video" && isPortraitItem(item) && !used.has(item.id) && titled(item)),
      image: items.filter((item) => item.kind === "image" && !used.has(item.id) && titled(item)),
    };
  }, [horizontal, images, items, query, vertical]);

  function update(lane: Lane, next: MediaItem[]) {
    setSaved(false);
    if (lane === "horizontal") setHorizontal(next);
    else if (lane === "vertical") setVertical(next);
    else setImages(next);
  }

  function drop(lane: Lane, targetId: string) {
    if (!dragId) return;
    const current = lane === "horizontal" ? horizontal : lane === "vertical" ? vertical : images;
    update(lane, insertBefore(current, dragId, targetId));
    setDragId(null);
  }

  async function uploadPoster(id: string, file: File) {
    setPosterBusy(id);
    setError("");
    try {
      const path = await uploadAdminFile(file, "image", () => {});
      const result = await saveItemPoster(id, path);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      const patch = (item: MediaItem) => (item.id === id ? { ...item, poster_path: path } : item);
      setHorizontal((current) => current.map(patch));
      setVertical((current) => current.map(patch));
      setImages((current) => current.map(patch));
      setSaved(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not upload the poster.");
    } finally {
      setPosterBusy(null);
    }
  }

  async function save() {
    setBusy(true);
    setError("");
    setSaved(false);
    const result = await saveHomepageBoard(
      [...horizontal, ...vertical].map((item) => item.id),
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
          <h1 className="mt-2 text-3xl font-bold">The shelves</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
            Same rows as the homepage under the hero. Landscape films, portrait films, then pictures. On a film, Poster uploads art of any shape.
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
        title="Landscape"
        hint="Wide films. The first shelf under the hero."
        artClass="h-36"
        posters
        posterBusy={posterBusy}
        onPoster={uploadPoster}
        items={horizontal}
        adding={adding === "horizontal"}
        pool={pools.horizontal}
        query={query}
        onQuery={setQuery}
        onToggleAdd={() => {
          setQuery("");
          setAdding((current) => (current === "horizontal" ? null : "horizontal"));
        }}
        onAdd={(item) => update("horizontal", [...horizontal, item])}
        onMove={(id, direction) => update("horizontal", move(horizontal, id, direction))}
        onRemove={(id) => update("horizontal", horizontal.filter((item) => item.id !== id))}
        onDragStart={setDragId}
        onDrop={(id) => drop("horizontal", id)}
      />

      <LaneEditor
        title="Portrait"
        hint="Tall films. The shelf under the landscape films."
        artClass="h-64"
        posters
        posterBusy={posterBusy}
        onPoster={uploadPoster}
        items={vertical}
        adding={adding === "vertical"}
        pool={pools.vertical}
        query={query}
        onQuery={setQuery}
        onToggleAdd={() => {
          setQuery("");
          setAdding((current) => (current === "vertical" ? null : "vertical"));
        }}
        onAdd={(item) => update("vertical", [...vertical, item])}
        onMove={(id, direction) => update("vertical", move(vertical, id, direction))}
        onRemove={(id) => update("vertical", vertical.filter((item) => item.id !== id))}
        onDragStart={setDragId}
        onDrop={(id) => drop("vertical", id)}
      />

      <LaneEditor
        title="Pictures"
        hint="The shelf under the films."
        artClass="h-48"
        items={images}
        adding={adding === "image"}
        pool={pools.image}
        query={query}
        onQuery={setQuery}
        onToggleAdd={() => {
          setQuery("");
          setAdding((current) => (current === "image" ? null : "image"));
        }}
        onAdd={(item) => update("image", [...images, item])}
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
  artClass,
  posters = false,
  posterBusy,
  onPoster,
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
  artClass: string;
  posters?: boolean;
  posterBusy?: string | null;
  onPoster?: (id: string, file: File) => void;
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
        <p className="mt-6 rounded-2xl border border-dashed border-white/20 px-6 py-12 text-center text-sm text-muted">
          Nothing in this shelf yet.
        </p>
      ) : (
        <div className="row-scroll mt-5 flex items-start gap-4 overflow-x-auto pb-4">
          {items.map((item) => (
            <article
              key={item.id}
              draggable
              onDragStart={() => onDragStart(item.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => onDrop(item.id)}
              className="flex w-max shrink-0 cursor-grab flex-col active:cursor-grabbing"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={posterSrc(item)}
                alt=""
                draggable={false}
                className={`${artClass} w-auto rounded-xl border border-white/20 bg-neutral-950 object-contain`}
              />
              <div className="mt-3 flex max-w-[16rem] items-center gap-2">
                {item.kind === "video" ? (
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#8b5cf6] text-black" aria-hidden>
                    <svg width="8" height="9" viewBox="0 0 9 10">
                      <path d="M1.1.8v8.4L8.2 5 1.1.8Z" fill="currentColor" />
                    </svg>
                  </span>
                ) : null}
                <Link href={`/admin/media/${item.id}`} className="min-w-0 truncate text-sm font-bold hover:underline">
                  {item.title}
                </Link>
              </div>
              <div className="mt-2 flex max-w-[16rem] flex-wrap gap-1.5">
                {posters ? (
                  <label className="cursor-pointer rounded bg-[#8b5cf6] px-2 py-1 text-[11px] font-bold text-black">
                    {posterBusy === item.id ? "Uploading" : item.poster_path ? "Replace poster" : "Poster"}
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      disabled={posterBusy === item.id}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        event.target.value = "";
                        if (file && onPoster) onPoster(item.id, file);
                      }}
                    />
                  </label>
                ) : null}
                {!item.published ? <span className="rounded bg-white/15 px-2 py-1 text-[11px] font-semibold">Hidden</span> : null}
                <button type="button" aria-label={`Move ${item.title} earlier`} onClick={() => onMove(item.id, -1)} className="rounded bg-white/15 px-2 py-1 text-[11px] font-bold">
                  Earlier
                </button>
                <button type="button" aria-label={`Move ${item.title} later`} onClick={() => onMove(item.id, 1)} className="rounded bg-white/15 px-2 py-1 text-[11px] font-bold">
                  Later
                </button>
                <button type="button" aria-label={`Take ${item.title} off the homepage`} onClick={() => onRemove(item.id)} className="rounded bg-white px-2 py-1 text-[11px] font-bold text-black">
                  Off page
                </button>
              </div>
            </article>
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
