"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { saveEntertainmentItem, savePageHeroes } from "@/app/admin/actions";
import { posterSrc } from "@/components/home-shelves";
import { catalogueSlug, type MediaItem } from "@/lib/media";
import { entertainmentPageKey, entertainmentTopicKey } from "@/lib/page-heroes";
import { entertainmentCategories } from "@/lib/taxonomy";

type Draft = {
  title: string;
  caption: string;
  client: string;
  role: string;
  style: string;
  url: string;
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
    draft.url !== item.external_url
  );
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
  const films = useMemo(() => items.filter((item) => item.section === "entertainment"), [items]);
  const rooms = useMemo(() => {
    const micro = entertainmentCategories.find((category) => category.slug === "microdramas");
    const rest = entertainmentCategories.filter((category) => category.slug !== "microdramas");
    return micro ? [micro, ...rest] : entertainmentCategories;
  }, []);

  const [drafts, setDrafts] = useState<Record<string, Draft>>(() =>
    Object.fromEntries(films.map((item) => [item.id, blank(item)])),
  );
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
  const [error, setError] = useState(message);
  const [saved, setSaved] = useState("");

  const dirtyIds = useMemo(
    () => films.filter((item) => changed(item, drafts[item.id])).map((item) => item.id),
    [films, drafts],
  );

  const heroesDirty = useMemo(() => {
    if ((heroPicks[entertainmentPageKey()] ?? "") !== (heroes[entertainmentPageKey()] ?? "")) return true;
    return entertainmentCategories.some(
      (category) =>
        (heroPicks[entertainmentTopicKey(category.slug)] ?? "") !==
        (heroes[entertainmentTopicKey(category.slug)] ?? ""),
    );
  }, [heroPicks, heroes]);

  const videos = films.filter((item) => item.kind === "video");

  function patch(id: string, next: Partial<Draft>) {
    setSaved("");
    setDrafts((current) => {
      const item = films.find((entry) => entry.id === id);
      const base = current[id] ?? (item ? blank(item) : { title: "", caption: "", client: "", role: "", style: "", url: "" });
      return { ...current, [id]: { ...base, ...next } };
    });
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
      );
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

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-[#c4b5fd] uppercase">Entertainment</p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Manage the slate</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {dirtyIds.length > 0 || heroesDirty ? (
            <span className="text-xs tracking-[0.14em] text-[#c4b5fd] uppercase">Unsaved</span>
          ) : null}
          <Link href="/entertainment" className="rounded border border-white/20 px-3 py-2 text-sm font-bold text-white/80 hover:border-white/40 hover:text-white">
            Open page
          </Link>
          <button
            type="button"
            disabled={busy || (dirtyIds.length === 0 && !heroesDirty)}
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
          <p className="text-xs text-muted">Which video plays at the top</p>
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
          {rooms.map((category) => (
            <HeroPick
              key={category.slug}
              label={`${category.name} page`}
              value={heroPicks[entertainmentTopicKey(category.slug)] ?? ""}
              choices={videos.filter((item) => catalogueSlug(item) === category.slug)}
              onChange={(value) => {
                setSaved("");
                setHeroPicks((current) => ({ ...current, [entertainmentTopicKey(category.slug)]: value }));
              }}
            />
          ))}
        </div>
      </section>

      <div className="mt-8 space-y-8">
        {rooms.map((category) => {
          const list = films.filter((item) => catalogueSlug(item) === category.slug);
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
                  {list.map((item) => {
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
                          </div>
                          <div className="col-span-2 flex items-center justify-end gap-3 sm:col-span-1 sm:flex-col sm:items-end">
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
}: {
  label: string;
  value: string;
  choices: MediaItem[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid grid-cols-1 items-center gap-2 px-3 py-2 sm:grid-cols-[12rem_1fr]">
      <span className="text-sm text-white/70">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className={field}>
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
}
