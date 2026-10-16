"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  hideCatalogueCategory,
  restoreCatalogueCategory,
  saveCatalogueOrder,
  saveItemCopy,
  saveItemPoster,
  savePageHeroes,
} from "@/app/admin/actions";
import { posterSrc } from "@/components/home-shelves";
import { uploadAdminFile } from "@/lib/admin-upload";
import type { HiddenCategory } from "@/lib/hidden-categories";
import { adsCategoryKey, adsPageKey } from "@/lib/page-heroes";
import { sortCatalogue, type MediaItem } from "@/lib/media";
import { adsCategories } from "@/lib/taxonomy";

type Draft = { title: string; caption: string };

const field =
  "w-full rounded-lg border border-white/10 bg-black/50 px-2.5 py-2 text-sm outline-none transition focus:border-white/35";

function move(items: MediaItem[], id: string, direction: -1 | 1) {
  const index = items.findIndex((item) => item.id === id);
  const next = index + direction;
  if (index < 0 || next < 0 || next >= items.length) return items;
  const copy = items.slice();
  const [picked] = copy.splice(index, 1);
  copy.splice(next, 0, picked);
  return copy;
}

export function AdsDeskEditor({
  items,
  heroes,
  hidden,
  message,
}: {
  items: MediaItem[];
  heroes: Record<string, string>;
  hidden: HiddenCategory[];
  message: string;
}) {
  const router = useRouter();
  const ads = useMemo(() => sortCatalogue(items.filter((item) => item.section === "ads")), [items]);
  const hiddenSlugs = useMemo(
    () => new Set(hidden.filter((row) => row.section === "ads").map((row) => row.slug)),
    [hidden],
  );

  const [drafts, setDrafts] = useState<Record<string, Draft>>(() =>
    Object.fromEntries(ads.map((item) => [item.id, { title: item.title, caption: item.caption }])),
  );
  const [order, setOrder] = useState(() => ads.map((item) => item.id));
  const [heroPicks, setHeroPicks] = useState(() => {
    const next: Record<string, string> = {
      [adsPageKey()]: heroes[adsPageKey()] ?? "",
    };
    for (const category of adsCategories) {
      next[adsCategoryKey(category.slug)] = heroes[adsCategoryKey(category.slug)] ?? "";
    }
    return next;
  });
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [posterBusy, setPosterBusy] = useState<string | null>(null);
  const [error, setError] = useState(message);
  const [saved, setSaved] = useState("");

  const byId = useMemo(() => new Map(ads.map((item) => [item.id, item])), [ads]);
  const orderedAds = useMemo(
    () => order.map((id) => byId.get(id)).filter((item): item is MediaItem => Boolean(item)),
    [byId, order],
  );

  const dirtyIds = useMemo(() => {
    return ads
      .filter((item) => {
        const draft = drafts[item.id];
        if (!draft) return false;
        return draft.title !== item.title || draft.caption !== item.caption;
      })
      .map((item) => item.id);
  }, [ads, drafts]);

  const orderDirty = useMemo(() => {
    const current = ads.map((item) => item.id).join(",");
    return order.join(",") !== current;
  }, [ads, order]);

  const heroesDirty = useMemo(() => {
    if ((heroPicks[adsPageKey()] ?? "") !== (heroes[adsPageKey()] ?? "")) return true;
    return adsCategories.some(
      (category) =>
        (heroPicks[adsCategoryKey(category.slug)] ?? "") !== (heroes[adsCategoryKey(category.slug)] ?? ""),
    );
  }, [heroPicks, heroes]);

  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return adsCategories
      .filter((category) => filter === "all" || category.slug === filter)
      .map((category) => {
        const list = orderedAds.filter((item) => {
          if (item.category_slug !== category.slug) return false;
          if (!needle) return true;
          const draft = drafts[item.id];
          const hay = `${item.title} ${item.caption} ${draft?.title ?? ""} ${draft?.caption ?? ""}`.toLowerCase();
          return hay.includes(needle);
        });
        return { category, list, hidden: hiddenSlugs.has(category.slug) };
      });
  }, [drafts, filter, hiddenSlugs, orderedAds, query]);

  function patchDraft(id: string, next: Partial<Draft>) {
    setSaved("");
    setDrafts((current) => ({
      ...current,
      [id]: { title: current[id]?.title ?? "", caption: current[id]?.caption ?? "", ...next },
    }));
  }

  function reorderInCategory(categorySlug: string, id: string, direction: -1 | 1) {
    setSaved("");
    setOrder((current) => {
      const categoryIds = current.filter((entry) => byId.get(entry)?.category_slug === categorySlug);
      const moved = move(
        categoryIds.map((entry) => byId.get(entry)!).filter(Boolean),
        id,
        direction,
      ).map((item) => item.id);
      let cursor = 0;
      return current.map((entry) => {
        if (byId.get(entry)?.category_slug !== categorySlug) return entry;
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

  async function toggleCategory(slug: string, hiddenNow: boolean) {
    setBusy(true);
    setError("");
    const result = hiddenNow
      ? await restoreCatalogueCategory("ads", slug)
      : await hideCatalogueCategory("ads", slug);
    setBusy(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setSaved(hiddenNow ? "Category restored." : "Category removed from the site.");
    router.refresh();
  }

  async function saveEverything() {
    setBusy(true);
    setError("");
    setSaved("");

    for (const id of dirtyIds) {
      const draft = drafts[id];
      if (!draft?.title.trim()) {
        setBusy(false);
        setError("Every film needs a title.");
        return;
      }
      const result = await saveItemCopy(id, draft.title.trim(), draft.caption.trim());
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
    setSaved("Ads page updated.");
    router.refresh();
  }

  const adsVideos = orderedAds.filter((item) => item.kind === "video");
  const canSave = dirtyIds.length > 0 || heroesDirty || orderDirty;

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-[#c4b5fd] uppercase">Ads page</p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Manage the Ads reel</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canSave ? <span className="text-xs tracking-[0.14em] text-[#c4b5fd] uppercase">Unsaved</span> : null}
          <Link href="/ads" className="rounded border border-white/20 px-3 py-2 text-sm font-bold text-white/80 hover:border-white/40 hover:text-white">
            Open Ads
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
          <h2 className="text-sm font-bold">Heroes</h2>
          <p className="text-xs text-muted">Top film per page</p>
        </div>
        <div className="divide-y divide-white/8">
          <label className="grid grid-cols-1 items-center gap-2 px-3 py-2 sm:grid-cols-[11rem_1fr]">
            <span className="text-sm text-white/70">Ads home</span>
            <select
              value={heroPicks[adsPageKey()] ?? ""}
              onChange={(event) => {
                setSaved("");
                setHeroPicks((current) => ({ ...current, [adsPageKey()]: event.target.value }));
              }}
              className={field}
            >
              <option value="">Automatic</option>
              {adsVideos.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                  {item.published ? "" : " (draft)"}
                </option>
              ))}
            </select>
          </label>
          {adsCategories
            .filter((category) => !hiddenSlugs.has(category.slug))
            .map((category) => {
              const key = adsCategoryKey(category.slug);
              const choices = adsVideos.filter((item) => item.category_slug === category.slug);
              return (
                <label key={category.slug} className="grid grid-cols-1 items-center gap-2 px-3 py-2 sm:grid-cols-[11rem_1fr]">
                  <span className="truncate text-sm text-white/70">{category.name}</span>
                  <select
                    value={heroPicks[key] ?? ""}
                    onChange={(event) => {
                      setSaved("");
                      setHeroPicks((current) => ({ ...current, [key]: event.target.value }));
                    }}
                    className={field}
                  >
                    <option value="">Automatic</option>
                    {choices.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.title}
                        {item.published ? "" : " (draft)"}
                      </option>
                    ))}
                  </select>
                </label>
              );
            })}
        </div>
      </section>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search"
          className={`${field} sm:max-w-xs`}
        />
        <select value={filter} onChange={(event) => setFilter(event.target.value)} className={`${field} sm:max-w-xs`}>
          <option value="all">All categories</option>
          {adsCategories.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.name}
              {hiddenSlugs.has(category.slug) ? " (removed)" : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 space-y-6">
        {groups.map(({ category, list, hidden: isHidden }) => (
          <section key={category.slug} className="overflow-hidden rounded-xl border border-white/12">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[0.03] px-3 py-2">
              <h2 className="text-sm font-bold">
                {category.name}
                {isHidden ? <span className="ml-2 text-xs font-semibold text-amber-200/80">Removed from site</span> : null}
              </h2>
              <div className="flex items-center gap-3 text-xs text-muted">
                <span>{list.length}</span>
                {!isHidden ? (
                  <Link href={`/ads/${category.slug}`} className="hover:text-white">
                    View
                  </Link>
                ) : null}
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void toggleCategory(category.slug, isHidden)}
                  className="font-semibold text-white/55 uppercase tracking-[0.12em] hover:text-white"
                >
                  {isHidden ? "Restore" : "Delete category"}
                </button>
              </div>
            </div>

            {list.length === 0 ? (
              <p className="px-3 py-3 text-sm text-muted">Nothing here yet.</p>
            ) : (
              <ul className="divide-y divide-white/8">
                {list.map((item, index) => {
                  const draft = drafts[item.id] ?? { title: item.title, caption: item.caption };
                  const dirty = draft.title !== item.title || draft.caption !== item.caption;
                  return (
                    <li
                      key={item.id}
                      className={`grid grid-cols-[3.25rem_1fr] items-center gap-2 px-2 py-2 sm:grid-cols-[3.25rem_minmax(0,1fr)_minmax(0,1.1fr)_auto] sm:gap-3 ${
                        dirty ? "bg-[#8b5cf6]/10" : ""
                      }`}
                    >
                      <div className="relative h-12 w-full overflow-hidden rounded-md border border-white/15 bg-black">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={posterSrc(item)} alt="" className="h-full w-full object-cover" />
                      </div>

                      <input
                        value={draft.title}
                        onChange={(event) => patchDraft(item.id, { title: event.target.value })}
                        placeholder="Title"
                        aria-label="Title"
                        className={field}
                      />

                      <input
                        value={draft.caption}
                        onChange={(event) => patchDraft(item.id, { caption: event.target.value })}
                        placeholder="Short caption"
                        aria-label="Short caption"
                        className={`${field} col-span-2 sm:col-span-1`}
                      />

                      <div className="col-span-2 flex flex-wrap items-center justify-end gap-2 sm:col-span-1">
                        <button
                          type="button"
                          aria-label={`Move ${item.title} earlier`}
                          disabled={index === 0}
                          onClick={() => reorderInCategory(category.slug, item.id, -1)}
                          className="rounded bg-white/15 px-2 py-1 text-[11px] font-bold disabled:opacity-30"
                        >
                          Up
                        </button>
                        <button
                          type="button"
                          aria-label={`Move ${item.title} later`}
                          disabled={index === list.length - 1}
                          onClick={() => reorderInCategory(category.slug, item.id, 1)}
                          className="rounded bg-white/15 px-2 py-1 text-[11px] font-bold disabled:opacity-30"
                        >
                          Down
                        </button>
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
                          Edit
                        </Link>
                        {!item.published ? (
                          <span className="text-[10px] tracking-[0.12em] text-amber-200/80 uppercase">Draft</span>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
