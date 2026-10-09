"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { saveAdminMedia } from "@/app/admin/actions";
import { uploadAdminFile } from "@/lib/admin-upload";
import { closestAspect, guessPlaceFromFilename, titleFromFilename } from "@/lib/guess-place";
import { adsCategories, adsCategory, entertainment, topicIn } from "@/lib/taxonomy";

type RowStatus = "ready" | "uploading" | "saving" | "done" | "error";

type BatchRow = {
  id: string;
  file: File;
  kind: "image" | "video";
  title: string;
  section: "ads" | "entertainment";
  categorySlug: string;
  subcategorySlug: string;
  aspect: string;
  published: boolean;
  showOnHome: boolean;
  guessLabel: string;
  status: RowStatus;
  percent: number;
  message: string;
};

const field =
  "w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-white/35";

function kindOf(file: File): "image" | "video" | null {
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("image/")) return "image";
  return null;
}

function probeAspect(file: File, kind: "image" | "video") {
  return new Promise<string>((resolve) => {
    const url = URL.createObjectURL(file);
    if (kind === "video") {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.src = url;
      video.onloadedmetadata = () => {
        resolve(closestAspect(video.videoWidth, video.videoHeight));
        URL.revokeObjectURL(url);
      };
      video.onerror = () => {
        resolve("16:9");
        URL.revokeObjectURL(url);
      };
      return;
    }
    const image = new window.Image();
    image.onload = () => {
      resolve(closestAspect(image.naturalWidth, image.naturalHeight));
      URL.revokeObjectURL(url);
    };
    image.onerror = () => {
      resolve("16:9");
      URL.revokeObjectURL(url);
    };
    image.src = url;
  });
}

function defaultsFromName(name: string) {
  const guess = guessPlaceFromFilename(name);
  return {
    title: titleFromFilename(name) || name,
    section: (guess?.section ?? "ads") as "ads" | "entertainment",
    categorySlug: guess?.categorySlug ?? adsCategories[0].slug,
    subcategorySlug:
      guess?.subcategorySlug ??
      (guess?.section === "entertainment"
        ? entertainment.items[0].slug
        : adsCategories[0].items[0].slug),
    guessLabel: guess?.label ?? "",
  };
}

export function BatchUploader() {
  const router = useRouter();
  const [rows, setRows] = useState<BatchRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const [defaultSection, setDefaultSection] = useState<"ads" | "entertainment">("ads");
  const [defaultCategory, setDefaultCategory] = useState(adsCategories[0].slug);
  const [defaultSubcategory, setDefaultSubcategory] = useState(adsCategories[0].items[0].slug);
  const [defaultPublished, setDefaultPublished] = useState(true);
  const [defaultHome, setDefaultHome] = useState(false);

  const summary = useMemo(() => {
    const done = rows.filter((row) => row.status === "done").length;
    const failed = rows.filter((row) => row.status === "error").length;
    const active = rows.find((row) => row.status === "uploading" || row.status === "saving");
    return { done, failed, active, total: rows.length };
  }, [rows]);

  function patch(id: string, next: Partial<BatchRow>) {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, ...next } : row)));
  }

  async function addFiles(list: FileList | File[] | null) {
    if (!list || list.length === 0) return;
    setError("");
    const incoming = Array.from(list);
    const created: BatchRow[] = [];

    for (const file of incoming) {
      const kind = kindOf(file);
      if (!kind) continue;
      const guessed = defaultsFromName(file.name);
      const aspect = await probeAspect(file, kind);
      created.push({
        id: crypto.randomUUID(),
        file,
        kind,
        title: guessed.title,
        section: guessed.section,
        categorySlug: guessed.categorySlug,
        subcategorySlug: guessed.subcategorySlug,
        aspect,
        published: defaultPublished,
        showOnHome: defaultHome,
        guessLabel: guessed.guessLabel,
        status: "ready",
        percent: 0,
        message: guessed.guessLabel ? `Matched ${guessed.guessLabel}` : "Needs a place check",
      });
    }

    if (created.length === 0) {
      setError("Add image or video files only.");
      return;
    }
    setRows((current) => [...current, ...created]);
  }

  function applyDefaultsToUnguessed() {
    setRows((current) =>
      current.map((row) => {
        if (row.guessLabel || row.status !== "ready") return row;
        return {
          ...row,
          section: defaultSection,
          categorySlug: defaultSection === "entertainment" ? entertainment.slug : defaultCategory,
          subcategorySlug: defaultSubcategory,
          published: defaultPublished,
          showOnHome: defaultHome,
          message: "Place set from batch defaults",
        };
      }),
    );
  }

  function applyDefaultsToAll() {
    setRows((current) =>
      current.map((row) => {
        if (row.status !== "ready") return row;
        return {
          ...row,
          section: defaultSection,
          categorySlug: defaultSection === "entertainment" ? entertainment.slug : defaultCategory,
          subcategorySlug: defaultSubcategory,
          published: defaultPublished,
          showOnHome: defaultHome,
          message: "Place set from batch defaults",
        };
      }),
    );
  }

  async function startBatch() {
    setError("");
    if (rows.length === 0) {
      setError("Add files first.");
      return;
    }

    for (const row of rows) {
      if (row.status !== "ready" && row.status !== "error") continue;
      const category = row.section === "entertainment" ? entertainment : adsCategory(row.categorySlug);
      if (!row.title.trim() || !category || !topicIn(category, row.subcategorySlug)) {
        setError(`Fix the place or title for “${row.file.name}” before starting.`);
        return;
      }
    }

    setBusy(true);
    let hadError = false;

    for (const row of rows) {
      if (row.status === "done") continue;
      patch(row.id, { status: "uploading", percent: 2, message: "Uploading" });

      try {
        const path = await uploadAdminFile(row.file, row.kind, (progress) => {
          patch(row.id, {
            status: "uploading",
            percent: progress.percent,
            message: progress.label,
          });
        });

        patch(row.id, { status: "saving", percent: 96, message: "Saving details" });

        const form = new FormData();
        form.set("title", row.title.trim());
        form.set("section", row.section);
        form.set("category", row.section === "entertainment" ? entertainment.slug : row.categorySlug);
        form.set("subcategory", row.subcategorySlug);
        form.set("caption", "");
        form.set("published", row.published ? "true" : "false");
        form.set("showOnHome", row.showOnHome ? "true" : "false");
        form.set("aspect", row.aspect);
        form.set("kind", row.kind);
        form.set("existingPath", "");
        form.set("storagePath", path);
        if (row.kind === "video") {
          form.set("cropX", "50");
          form.set("cropY", "50");
        }

        const result = await saveAdminMedia(form);
        if (!result.ok) throw new Error(result.message);

        patch(row.id, { status: "done", percent: 100, message: "Saved" });
      } catch (caught) {
        hadError = true;
        const message = caught instanceof Error ? caught.message : "Could not save.";
        patch(row.id, { status: "error", percent: 0, message });
      }
    }

    setBusy(false);
    if (!hadError) {
      router.push("/admin");
      router.refresh();
    }
  }

  const defaultTopics =
    defaultSection === "entertainment"
      ? entertainment.items
      : (adsCategory(defaultCategory)?.items ?? []);

  return (
    <div className="space-y-6">
      <section
        onDragEnter={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          void addFiles(event.dataTransfer.files);
        }}
        className={`rounded-3xl border border-dashed px-5 py-12 text-center transition ${
          dragOver ? "border-white bg-white/10" : "border-white/20 bg-white/[0.03]"
        }`}
      >
        <p className="text-lg font-bold">Drop a batch of films or stills</p>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted">
          Titles and categories fill from each file name. Set batch defaults for anything that does not match, then upload them one after another with progress on each row.
        </p>
        <label className="mt-6 inline-flex cursor-pointer rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black">
          Choose files
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
            className="sr-only"
            onChange={(event) => {
              void addFiles(event.target.files);
              event.currentTarget.value = "";
            }}
          />
        </label>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs tracking-[0.22em] text-muted uppercase">Batch defaults</p>
            <h2 className="mt-2 text-xl font-bold">Fallback place</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy || rows.length === 0}
              onClick={applyDefaultsToUnguessed}
              className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
            >
              Apply to unmatched
            </button>
            <button
              type="button"
              disabled={busy || rows.length === 0}
              onClick={applyDefaultsToAll}
              className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
            >
              Apply to all ready
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="text-sm">
            Place
            <select
              value={defaultSection}
              disabled={busy}
              onChange={(event) => {
                const next = event.target.value === "entertainment" ? "entertainment" : "ads";
                setDefaultSection(next);
                if (next === "entertainment") {
                  setDefaultCategory(entertainment.slug);
                  setDefaultSubcategory(entertainment.items[0].slug);
                } else {
                  setDefaultCategory(adsCategories[0].slug);
                  setDefaultSubcategory(adsCategories[0].items[0].slug);
                }
              }}
              className={`mt-2 ${field}`}
            >
              <option value="ads">Ads</option>
              <option value="entertainment">Entertainment</option>
            </select>
          </label>
          {defaultSection === "ads" ? (
            <label className="text-sm">
              Category
              <select
                value={defaultCategory}
                disabled={busy}
                onChange={(event) => {
                  const next = event.target.value;
                  setDefaultCategory(next);
                  setDefaultSubcategory(adsCategory(next)?.items[0]?.slug ?? "");
                }}
                className={`mt-2 ${field}`}
              >
                {adsCategories.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <label className="text-sm">
            Subcategory
            <select
              value={defaultSubcategory}
              disabled={busy}
              onChange={(event) => setDefaultSubcategory(event.target.value)}
              className={`mt-2 ${field}`}
            >
              {defaultTopics.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-col justify-end gap-2 text-sm">
            <label className="flex items-center justify-between gap-3 rounded-xl border border-white/10 px-3 py-2">
              <span>Show on site</span>
              <input
                type="checkbox"
                checked={defaultPublished}
                disabled={busy}
                onChange={(event) => setDefaultPublished(event.target.checked)}
                className="accent-white"
              />
            </label>
            <label className="flex items-center justify-between gap-3 rounded-xl border border-white/10 px-3 py-2">
              <span>Show on home</span>
              <input
                type="checkbox"
                checked={defaultHome}
                disabled={busy}
                onChange={(event) => setDefaultHome(event.target.checked)}
                className="accent-white"
              />
            </label>
          </div>
        </div>
      </section>

      {rows.length > 0 ? (
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted">
              {summary.total} files · {summary.done} saved
              {summary.failed ? ` · ${summary.failed} failed` : ""}
              {summary.active ? ` · ${summary.active.file.name}` : ""}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => setRows([])}
                className="rounded-full border border-white/20 px-4 py-2 text-sm disabled:opacity-50"
              >
                Clear
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void startBatch()}
                className="rounded-full bg-ember px-5 py-2 text-sm font-bold disabled:opacity-60"
              >
                {busy ? "Uploading…" : summary.failed ? "Retry failed / remaining" : "Upload all"}
              </button>
            </div>
          </div>

          <ul className="space-y-3">
            {rows.map((row) => {
              const topics =
                row.section === "entertainment"
                  ? entertainment.items
                  : (adsCategory(row.categorySlug)?.items ?? []);
              const locked = busy || row.status === "done" || row.status === "uploading" || row.status === "saving";

              return (
                <li key={row.id} className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{row.file.name}</p>
                      <p className="mt-1 text-xs text-muted">
                        {row.kind} · {(row.file.size / (1024 * 1024)).toFixed(1)} MB · {row.aspect}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          row.status === "done"
                            ? "bg-white text-black"
                            : row.status === "error"
                              ? "bg-ember/20 text-white"
                              : "bg-white/10 text-muted"
                        }`}
                      >
                        {row.status}
                      </span>
                      {!locked ? (
                        <button
                          type="button"
                          onClick={() => setRows((current) => current.filter((entry) => entry.id !== row.id))}
                          className="text-xs text-muted hover:text-white"
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <label className="text-sm md:col-span-2 xl:col-span-1">
                      Title
                      <input
                        value={row.title}
                        disabled={locked}
                        onChange={(event) => patch(row.id, { title: event.target.value })}
                        className={`mt-2 ${field}`}
                      />
                    </label>
                    <label className="text-sm">
                      Place
                      <select
                        value={row.section}
                        disabled={locked}
                        onChange={(event) => {
                          const next = event.target.value === "entertainment" ? "entertainment" : "ads";
                          patch(row.id, {
                            section: next,
                            categorySlug: next === "entertainment" ? entertainment.slug : adsCategories[0].slug,
                            subcategorySlug:
                              next === "entertainment"
                                ? entertainment.items[0].slug
                                : adsCategories[0].items[0].slug,
                          });
                        }}
                        className={`mt-2 ${field}`}
                      >
                        <option value="ads">Ads</option>
                        <option value="entertainment">Entertainment</option>
                      </select>
                    </label>
                    {row.section === "ads" ? (
                      <label className="text-sm">
                        Category
                        <select
                          value={row.categorySlug}
                          disabled={locked}
                          onChange={(event) => {
                            const next = event.target.value;
                            patch(row.id, {
                              categorySlug: next,
                              subcategorySlug: adsCategory(next)?.items[0]?.slug ?? "",
                            });
                          }}
                          className={`mt-2 ${field}`}
                        >
                          {adsCategories.map((category) => (
                            <option key={category.slug} value={category.slug}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </label>
                    ) : null}
                    <label className="text-sm">
                      Subcategory
                      <select
                        value={row.subcategorySlug}
                        disabled={locked}
                        onChange={(event) => patch(row.id, { subcategorySlug: event.target.value })}
                        className={`mt-2 ${field}`}
                      >
                        {topics.map((item) => (
                          <option key={item.slug} value={item.slug}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={row.published}
                        disabled={locked}
                        onChange={(event) => patch(row.id, { published: event.target.checked })}
                        className="accent-white"
                      />
                      Live
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={row.showOnHome}
                        disabled={locked}
                        onChange={(event) => patch(row.id, { showOnHome: event.target.checked })}
                        className="accent-white"
                      />
                      Home
                    </label>
                    <select
                      value={row.aspect}
                      disabled={locked}
                      onChange={(event) => patch(row.id, { aspect: event.target.value })}
                      className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs"
                    >
                      {["16:9", "9:16", "4:5", "1:1", "3:2", "21:9", "free"].map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <span className="text-xs text-muted">{row.message}</span>
                  </div>

                  {row.status === "uploading" || row.status === "saving" || row.status === "done" ? (
                    <div className="mt-3">
                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-ember transition-[width] duration-200"
                          style={{ width: `${row.percent}%` }}
                        />
                      </div>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {error ? <p className="text-sm text-ember">{error}</p> : null}

      <p className="text-sm text-muted">
        Prefer one carefully framed still?{" "}
        <Link href="/admin/media/new" className="text-white underline-offset-2 hover:underline">
          Use single upload
        </Link>
        .
      </p>
    </div>
  );
}
