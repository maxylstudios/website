"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  saveCatalogueOrder,
  saveEntertainmentItem,
  saveItemPoster,
  savePageHeroes,
} from "@/app/admin/actions";
import { posterSrc } from "@/components/home-shelves";
import { uploadAdminFile } from "@/lib/admin-upload";
import { catalogueSlug, sortCatalogue, type MediaItem } from "@/lib/media";
import { entertainmentPageKey, entertainmentTopicKey } from "@/lib/page-heroes";
import { entertainmentCategories } from "@/lib/taxonomy";

type Draft = {
  title: string;
  caption: string;
  client: string;
  role: string;
  style: string;
  url: string;
  showPartner: boolean;
};

const field =
  "w-full rounded-lg border border-white/10 bg-black/50 px-2.5 py-2 text-sm outline-none transition focus:border-white/35";

function blank(item: MediaItem): Draft {
  return {
    title: item.title,
    caption: item.caption,
    client: item.client,
    role: item.role,
    style: item.style_tag,
    url: item.external_url,
    showPartner: item.show_partner !== false,
  };
}

function changed(item: MediaItem, draft: Draft | undefined) {
  if (!draft) return false;
  return (
    draft.title !== item.title ||
    draft.caption !== item.caption ||
    draft.client !== item.client ||
    draft.role !== item.role ||
    draft.style !== item.style_tag ||
    draft.url !== item.external_url ||
    draft.showPartner !== (item.show_partner !== false)
  );
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

export function EntertainmentDeskEditor({
  items,
  heroes,
  message,
}: {
  items: MediaItem[];
  heroes: Record<string, string>;
  message: string;
}) {
  const router = useRouter();
  const films = useMemo(
    () => sortCatalogue(items.filter((item) => item.section === "entertainment")),
    [items],
  );
  const rooms = useMemo(() => {
    const micro = entertainmentCategories.find((category) => category.slug === "microdramas");
    const rest = entertainmentCategories.filter((category) => category.slug !== "microdramas");
    return micro ? [micro, ...rest] : entertainmentCategories;
  }, []);

  const [drafts, setDrafts] = useState<Record<string, Draft>>(() =>
    Object.fromEntries(films.map((item) => [item.id, blank(item)])),
  );
  const [order, setOrder] = useState(() => films.map((item) => item.id));
  const [heroPicks, setHeroPicks] = useState(() => {
    const next: Record<string, string> = {
      [entertainmentPageKey()]: heroes[entertainmentPageKey()] ?? "",
    };
    for (const category of entertainmentCategories) {
      next[entertainmentTopicKey(category.slug)] = heroes[entertainmentTopicKey(category.slug)] ?? "";
    }
    return next;
  });
  const [busy, setBusy] = useState(false);
  const [posterBusy, setPosterBusy] = useState<string | null>(null);
  const [error, setError] = useState(message);
  const [saved, setSaved] = useState("");

  const byId = useMemo(() => new Map(films.map((item) => [item.id, item])), [films]);
  const orderedFilms = useMemo(
    () => order.map((id) => byId.get(id)).filter((item): item is MediaItem => Boolean(item)),
    [byId, order],
  );

  const dirtyIds = useMemo(
    () => films.filter((item) => changed(item, drafts[item.id])).map((item) => item.id),
    [films, drafts],
  );

  const orderDirty = useMemo(() => order.join(",") !== films.map((item) => item.id).join(","), [films, order]);

  const heroesDirty = useMemo(() => {
    if ((heroPicks[entertainmentPageKey()] ?? "") !== (heroes[entertainmentPageKey()] ?? "")) return true;
    return entertainmentCategories.some(
      (category) =>
        (heroPicks[entertainmentTopicKey(category.slug)] ?? "") !==
        (heroes[entertainmentTopicKey(category.slug)] ?? ""),
    );
  }, [heroPicks, heroes]);

  const videos = orderedFilms.filter((item) => item.kind === "video");

  function patch(id: string, next: Partial<Draft>) {
    setSaved("");
    setDrafts((current) => {
      const item = films.find((entry) => entry.id === id);
      const base =
        current[id] ??
        (item
          ? blank(item)
          : { title: "", caption: "", client: "", role: "", style: "", url: "", showPartner: true });
      return { ...current, [id]: { ...base, ...next } };
    });
  }

  function reorderInRoom(roomSlug: string, id: string, direction: -1 | 1) {
    setSaved("");
    setOrder((current) => {
      const roomIds = current.filter((entry) => catalogueSlug(byId.get(entry)!) === roomSlug);
      const moved = move(
        roomIds.map((entry) => byId.get(entry)!).filter(Boolean),
        id,
        direction,
      ).map((item) => item.id);
      let cursor = 0;
      return current.map((entry) => {
        if (catalogueSlug(byId.get(entry)!) !== roomSlug) return entry;
        const next = moved[cursor];
        cursor += 1;
        return next;
      });
    });
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
      setSaved("Poster updated.");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not upload the poster.");
    } finally {
      setPosterBusy(null);
    }
  }

  async function saveEverything() {
    setBusy(true);
    setError("");
    setSaved("");

    for (const id of dirtyIds) {
      const draft = drafts[id];
      if (!draft?.title.trim()) {
        setBusy(false);
        setError("Every title needs a name.");
        return;
      }
      const result = await saveEntertainmentItem(
        id,
        draft.title.trim(),
        draft.caption.trim(),
        draft.client.trim(),
        draft.role.trim(),
        draft.style.trim(),
        draft.url.trim(),
        draft.showPartner,
      );
      if (!result.ok) {
        setBusy(false);
        setError(result.message);
        return;
      }
    }

    if (orderDirty) {
      const result = await saveCatalogueOrder(order);
      if (!result.ok) {
        setBusy(false);
        setError(result.message);
        return;
      }
    }

    if (heroesDirty) {
      const result = await savePageHeroes({ ...heroes, ...heroPicks });
      if (!result.ok) {
        setBusy(false);
        setError(result.message);
        return;
      }
    }

    setBusy(false);
    setSaved("Entertainment page updated.");
    router.refresh();
  }

  const canSave = dirtyIds.length > 0 || heroesDirty || orderDirty;

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-[#c4b5fd] uppercase">Entertainment</p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Manage the slate</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canSave ? <span className="text-xs tracking-[0.14em] text-[#c4b5fd] uppercase">Unsaved</span> : null}
          <Link href="/entertainment" className="rounded border border-white/20 px-3 py-2 text-sm font-bold text-white/80 hover:border-white/40 hover:text-white">
            Open page
          </Link>
          <button
            type="button"
            disabled={busy || !canSave}
            onClick={() => void saveEverything()}
            className="rounded bg-[#8b5cf6] px-4 py-2 text-sm font-bold text-black disabled:opacity-40"
          >
            {busy ? "Saving" : "Save"}
          </button>
        </div>
      </div>

      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
      {saved ? <p className="mt-3 text-sm text-[#c4b5fd]">{saved}</p> : null}

      <section className="mt-6 overflow-hidden rounded-xl border border-white/12">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-white/[0.03] px-3 py-2">
          <h2 className="text-sm font-bold">Hero</h2>
          <p className="text-xs text-muted">Microdramas can feature a Films title</p>
        </div>
        <div className="divide-y divide-white/8">
          <HeroPick
            label="Entertainment home"
            value={heroPicks[entertainmentPageKey()] ?? ""}
            choices={videos}
            onChange={(value) => {
              setSaved("");
              setHeroPicks((current) => ({ ...current, [entertainmentPageKey()]: value }));
            }}
          />
          {rooms.map((category) => {
            const roomOnly = videos.filter((item) => catalogueSlug(item) === category.slug);
            const choices =
              category.slug === "microdramas"
                ? videos
                : roomOnly;
            return (
              <HeroPick
                key={category.slug}
                label={`${category.name} page`}
                value={heroPicks[entertainmentTopicKey(category.slug)] ?? ""}
                choices={choices}
                labelRoom={category.slug === "microdramas"}
                onChange={(value) => {
                  setSaved("");
                  setHeroPicks((current) => ({
                    ...current,
                    [entertainmentTopicKey(category.slug)]: value,
                  }));
                }}
              />
            );
          })}
        </div>
      </section>

      <div className="mt-8 space-y-8">
        {rooms.map((category) => {
          const list = orderedFilms.filter((item) => catalogueSlug(item) === category.slug);
          const micro = category.slug === "microdramas";
          return (
            <section key={category.slug} className="overflow-hidden rounded-xl border border-white/12">
              <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-white/[0.03] px-3 py-2">
                <h2 className="text-sm font-bold">{category.name}</h2>
                <div className="flex items-center gap-3 text-xs text-muted">
                  <span>{list.length}</span>
                  <Link href={`/entertainment/${category.slug}`} className="hover:text-white">
                    View
                  </Link>
                </div>
              </div>
              {list.length === 0 ? (
                <p className="px-3 py-3 text-sm text-muted">Nothing filed here yet.</p>
              ) : (
                <ul className="divide-y divide-white/8">
                  {list.map((item, index) => {
                    const draft = drafts[item.id] ?? blank(item);
                    const dirty = changed(item, draft);
                    return (
                      <li key={item.id} className={`grid gap-2 px-3 py-3 ${dirty ? "bg-[#8b5cf6]/10" : ""}`}>
                        <div className="grid grid-cols-[3.25rem_1fr] items-start gap-3 sm:grid-cols-[4.5rem_1fr_auto]">
                          <div className="relative h-12 overflow-hidden rounded-md border border-white/15 bg-black sm:h-16">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={posterSrc(item)} alt="" className="h-full w-full object-cover" />
                          </div>
                          <div className="grid gap-2 sm:grid-cols-2">
                            <input
                              value={draft.title}
                              onChange={(event) => patch(item.id, { title: event.target.value })}
                              placeholder="Title"
                              aria-label="Title"
                              className={field}
                            />
                            <input
                              value={draft.caption}
                              onChange={(event) => patch(item.id, { caption: event.target.value })}
                              placeholder="Short write-up"
                              aria-label="Write-up"
                              className={field}
                            />
                            <input
                              value={draft.client}
                              onChange={(event) => patch(item.id, { client: event.target.value })}
                              placeholder="Client"
                              aria-label="Client"
                              className={field}
                            />
                            <input
                              value={draft.role}
                              onChange={(event) => patch(item.id, { role: event.target.value })}
                              placeholder="Role"
                              aria-label="Role"
                              className={field}
                            />
                            <input
                              value={draft.style}
                              onChange={(event) => patch(item.id, { style: event.target.value })}
                              placeholder="Look"
                              aria-label="Look"
                              className={field}
                            />
                            <input
                              value={draft.url}
                              onChange={(event) => patch(item.id, { url: event.target.value })}
                              placeholder="https://kukufm.com/…"
                              aria-label="External link"
                              className={field}
                            />
                            {micro ? (
                              <label className="flex items-center gap-2 text-sm text-white/70 sm:col-span-2">
                                <input
                                  type="checkbox"
                                  checked={draft.showPartner}
                                  onChange={(event) => patch(item.id, { showPartner: event.target.checked })}
                                  className="h-4 w-4 accent-white"
                                />
                                Show partner (Kuku TV)
                              </label>
                            ) : null}
                          </div>
                          <div className="col-span-2 flex flex-wrap items-center justify-end gap-2 sm:col-span-1 sm:flex-col sm:items-end">
                            <div className="flex gap-1.5">
                              <button
                                type="button"
                                aria-label={`Move ${item.title} earlier`}
                                disabled={index === 0}
                                onClick={() => reorderInRoom(category.slug, item.id, -1)}
                                className="rounded bg-white/15 px-2 py-1 text-[11px] font-bold disabled:opacity-30"
                              >
                                Up
                              </button>
                              <button
                                type="button"
                                aria-label={`Move ${item.title} later`}
                                disabled={index === list.length - 1}
                                onClick={() => reorderInRoom(category.slug, item.id, 1)}
                                className="rounded bg-white/15 px-2 py-1 text-[11px] font-bold disabled:opacity-30"
                              >
                                Down
                              </button>
                            </div>
                            <label className="relative cursor-pointer overflow-hidden rounded bg-white/15 px-2 py-1 text-[11px] font-bold">
                              {posterBusy === item.id ? "…" : item.poster_path ? "Poster" : "Add poster"}
                              <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 cursor-pointer opacity-0"
                                disabled={posterBusy === item.id}
                                onChange={(event) => {
                                  const file = event.target.files?.[0];
                                  if (file) void uploadPoster(item.id, file);
                                  event.currentTarget.value = "";
                                }}
                              />
                            </label>
                            <Link
                              href={`/admin/media/${item.id}`}
                              className="text-[11px] tracking-[0.12em] text-white/45 uppercase hover:text-white"
                            >
                              Full edit
                            </Link>
                            {!item.published ? (
                              <span className="text-[10px] tracking-[0.12em] text-amber-200/80 uppercase">Draft</span>
                            ) : null}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

function HeroPick({
  label,
  value,
  choices,
  onChange,
  labelRoom = false,
}: {
  label: string;
  value: string;
  choices: MediaItem[];
  onChange: (value: string) => void;
  labelRoom?: boolean;
}) {
  return (
    <label className="grid grid-cols-1 items-center gap-2 px-3 py-2 sm:grid-cols-[12rem_1fr]">
      <span className="text-sm text-white/70">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className={field}>
        <option value="">Automatic</option>
        {choices.map((item) => {
          const room = catalogueSlug(item) === "microdramas" ? "Microdramas" : "Films";
          return (
            <option key={item.id} value={item.id}>
              {labelRoom ? `${room} · ` : ""}
              {item.title}
              {item.published ? "" : " (draft)"}
            </option>
          );
        })}
      </select>
    </label>
  );
}
