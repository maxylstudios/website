"use client";

import Image from "next/image";
import Cropper, { type Area } from "react-easy-crop";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  aspectNumber,
  aspectOptions,
  aspectRatioStyle,
  mediaPublicUrl,
  objectPosition,
  type MediaCrop,
  type MediaItem,
} from "@/lib/media";
import { loadAdminItem, removeAdminMedia, saveAdminMedia } from "@/app/admin/actions";
import { uploadAdminFile } from "@/lib/admin-upload";
import { grabVideoPosterFile } from "@/lib/video-poster";
import { cropImage, extensionForType } from "@/lib/crop-image";
import { closestAspect, guessPlaceFromFilename, titleFromFilename } from "@/lib/guess-place";
import { adsCategories, adsCategory, entertainmentCategory, sectionCategories } from "@/lib/taxonomy";

type Props = {
  id?: string;
};

type Progress = {
  percent: number;
  label: string;
} | null;

export function MediaEditor({ id }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [section, setSection] = useState<"ads" | "entertainment">("ads");
  const [categorySlug, setCategorySlug] = useState(adsCategories[0].slug);
  const [caption, setCaption] = useState("");
  const [published, setPublished] = useState(true);
  const [showOnHome, setShowOnHome] = useState(false);
  const [aspect, setAspect] = useState("16:9");
  const [focus, setFocus] = useState<MediaCrop>({ x: 50, y: 50 });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [existing, setExisting] = useState<MediaItem | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pixels, setPixels] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<Progress>(null);
  const [error, setError] = useState("");
  const [hint, setHint] = useState("");
  const [drag, setDrag] = useState<{ x: number; y: number; origin: MediaCrop } | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const kind: "image" | "video" | null = file
    ? file.type.startsWith("video/")
      ? "video"
      : "image"
    : existing?.kind ?? null;

  const categories = sectionCategories(section);

  useEffect(() => {
    if (!id) return;
    const current = id;
    let cancelled = false;

    async function load() {
      const { item, message } = await loadAdminItem(current);

      if (cancelled) return;
      if (message) {
        setError(message);
        return;
      }
      if (!item) {
        setError("That upload was not found.");
        return;
      }
      setExisting(item);
      setTitle(item.title);
      if (item.section === "entertainment" || item.section === "ads") setSection(item.section);
      if (item.category_slug) setCategorySlug(item.category_slug);
      setCaption(item.caption);
      setPublished(item.published);
      setShowOnHome(Boolean(item.show_on_home));
      setAspect(item.aspect);
      setFocus(item.crop ?? { x: 50, y: 50 });
      setPreview(mediaPublicUrl(item.storage_path));
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  function applyGuesses(name: string) {
    const nextTitle = titleFromFilename(name);
    if (nextTitle) {
      if (!id) setTitle(nextTitle);
      else setTitle((current) => (current.trim() ? current : nextTitle));
    }

    const guess = guessPlaceFromFilename(name);
    if (!guess) {
      setHint(nextTitle && !id ? "Title filled from the file name." : "");
      return;
    }
    setSection(guess.section);
    setCategorySlug(guess.categorySlug);
    setHint(`Auto-filled · ${guess.label}`);
  }

  function chooseFile(next: File | null) {
    setError("");
    if (!next) return;
    const allowed = next.type.startsWith("image/") || next.type.startsWith("video/");
    if (!allowed) {
      setError("Upload an image or a video.");
      return;
    }

    setPreview((current) => {
      if (current?.startsWith("blob:")) URL.revokeObjectURL(current);
      return URL.createObjectURL(next);
    });
    setFile(next);
    setPixels(null);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
    setFocus({ x: 50, y: 50 });
    applyGuesses(next.name);

    if (next.type.startsWith("video/")) {
      const probe = document.createElement("video");
      probe.preload = "metadata";
      probe.src = URL.createObjectURL(next);
      probe.onloadedmetadata = () => {
        setAspect(closestAspect(probe.videoWidth, probe.videoHeight));
        URL.revokeObjectURL(probe.src);
      };
    } else if (next.type.startsWith("image/")) {
      const objectUrl = URL.createObjectURL(next);
      const probe = new window.Image();
      probe.onload = () => {
        setAspect(closestAspect(probe.naturalWidth, probe.naturalHeight));
        URL.revokeObjectURL(objectUrl);
      };
      probe.src = objectUrl;
    }
  }

  function moveFocus(event: React.PointerEvent<HTMLVideoElement>) {
    if (!drag) return;
    const nextX = Math.min(100, Math.max(0, drag.origin.x - (event.clientX - drag.x) / 4));
    const nextY = Math.min(100, Math.max(0, drag.origin.y - (event.clientY - drag.y) / 4));
    setFocus({ x: nextX, y: nextY });
  }

  async function save() {
    setError("");
    if (!title.trim()) {
      setError("Add a title.");
      return;
    }
    const chosen = section === "entertainment" ? entertainmentCategory(categorySlug) : adsCategory(categorySlug);
    if (!chosen) {
      setError("Choose Ads or Entertainment, then a category.");
      return;
    }
    if (!existing && !file) {
      setError("Choose an image or a video.");
      return;
    }
    if (file && kind === "image" && !pixels) {
      setError("Wait for the crop to settle, then save.");
      return;
    }

    const savedKind = file ? kind : existing?.kind;
    if (!savedKind) {
      setError("Choose an image or a video.");
      return;
    }

    setBusy(true);
    setProgress({ percent: 4, label: "Preparing" });

    try {
      const form = new FormData();
      if (id) form.set("id", id);
      form.set("title", title.trim());
      form.set("section", section);
      form.set("category", categorySlug);
      form.set("caption", caption.trim());
      form.set("published", published ? "true" : "false");
      form.set("showOnHome", showOnHome ? "true" : "false");
      form.set("aspect", aspect);
      form.set("kind", savedKind);
      form.set("existingPath", existing?.storage_path ?? "");
      if (savedKind === "video") {
        form.set("cropX", String(focus.x));
        form.set("cropY", String(focus.y));
      }

      if (file && kind === "image") {
        if (!pixels || !preview) throw new Error("Crop the image first.");
        setProgress({ percent: 8, label: "Cropping image" });
        const cropped = await cropImage(preview, pixels, file.type);
        const croppedFile = new File([cropped.blob], `crop.${extensionForType(cropped.type)}`, {
          type: cropped.type,
        });
        form.set("width", String(cropped.width));
        form.set("height", String(cropped.height));
        const path = await uploadAdminFile(croppedFile, "image", setProgress);
        form.set("storagePath", path);
      } else if (file && kind === "video") {
        setProgress({ percent: 6, label: "Making poster" });
        const posterFile = await grabVideoPosterFile(file);
        const path = await uploadAdminFile(file, "video", setProgress);
        form.set("storagePath", path);
        if (posterFile) {
          setProgress({ percent: 93, label: "Uploading poster" });
          const posterPath = await uploadAdminFile(posterFile, "image", () => {});
          form.set("posterPath", posterPath);
        }
      }

      setProgress({ percent: 96, label: "Saving details" });
      const result = await saveAdminMedia(form);
      if (!result.ok) throw new Error(result.message);

      setProgress({ percent: 100, label: "Done" });
      router.push("/admin");
      router.refresh();
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Could not save.";
      setError(message);
      setBusy(false);
      setProgress(null);
    }
  }

  async function remove() {
    if (!id || !existing) return;
    if (!window.confirm(`Delete “${existing.title}”?`)) return;
    setBusy(true);
    const result = await removeAdminMedia(id);
    if (!result.ok) {
      setError(result.message);
      setBusy(false);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  const frame = aspectRatioStyle(aspect === "free" && kind === "video" ? "16:9" : aspect);
  const field =
    "mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm outline-none transition focus:border-white/35";

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_380px]">
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
        <label
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
            chooseFile(event.dataTransfer.files?.[0] ?? null);
          }}
          className={`flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-4 py-8 text-center transition ${
            dragOver ? "border-white bg-white/10" : "border-white/20 bg-black/40 hover:border-white/40"
          }`}
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
            className="sr-only"
            onChange={(event) => chooseFile(event.target.files?.[0] ?? null)}
          />
          <span className="text-sm font-semibold text-white">
            {file ? file.name : existing ? "Drop a replacement file" : "Drop a film or still here"}
          </span>
          <span className="mt-2 max-w-sm text-xs leading-5 text-muted">
            Title and category fill from the file name when they match. Frame ratio is detected from the file.
          </span>
        </label>

        {hint ? (
          <p className="mt-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-muted">
            {hint}
          </p>
        ) : null}

        {preview && kind === "image" && file ? (
          <div className="relative mt-4 h-[420px] overflow-hidden rounded-2xl bg-neutral-950">
            <Cropper
              image={preview}
              crop={crop}
              zoom={zoom}
              aspect={aspectNumber(aspect)}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, area) => setPixels(area)}
            />
          </div>
        ) : null}

        {preview && kind === "video" ? (
          <div className="mx-auto mt-4 max-h-[70vh] overflow-hidden rounded-2xl bg-black" style={frame}>
            <video
              src={preview}
              muted
              playsInline
              className="h-full w-full cursor-grab object-cover"
              style={{ objectPosition: objectPosition(focus) }}
              onPointerDown={(event) => {
                event.currentTarget.setPointerCapture(event.pointerId);
                setDrag({ x: event.clientX, y: event.clientY, origin: focus });
              }}
              onPointerMove={moveFocus}
              onPointerUp={() => setDrag(null)}
            />
          </div>
        ) : null}

        {preview && kind === "image" && !file ? (
          <Image
            src={preview}
            alt=""
            width={existing?.width ?? 1600}
            height={existing?.height ?? 900}
            className="mt-4 h-auto max-h-[420px] w-full rounded-2xl object-contain"
          />
        ) : null}

        {kind === "image" && file ? (
          <label className="mt-4 block text-sm text-muted">
            Zoom
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
              className="mt-2 w-full accent-white"
            />
          </label>
        ) : null}
        {kind === "video" ? (
          <p className="mt-3 text-sm text-muted">
            Drag the picture to frame it. The original file stays intact.
          </p>
        ) : null}
      </section>

      <aside className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
        <p className="text-xs tracking-[0.22em] text-muted uppercase">Details</p>
        <h2 className="mt-2 text-xl font-bold">{id ? "Edit upload" : "New upload"}</h2>

        <label className="mt-5 block text-sm">
          Title
          <input value={title} onChange={(event) => setTitle(event.target.value)} className={field} />
        </label>

        <label className="mt-4 block text-sm">
          Place
          <select
            value={section}
            onChange={(event) => {
              const next = event.target.value === "entertainment" ? "entertainment" : "ads";
              setSection(next);
              setHint("");
              setCategorySlug(sectionCategories(next)[0].slug);
            }}
            className={`${field} bg-black`}
          >
            <option value="ads">Ads</option>
            <option value="entertainment">Entertainment</option>
          </select>
        </label>

        <label className="mt-4 block text-sm">
          Category
          <select
            value={categorySlug}
            onChange={(event) => {
              setCategorySlug(event.target.value);
              setHint("");
            }}
            className={`${field} bg-black`}
          >
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-4 block text-sm">
          Caption
          <textarea
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            rows={4}
            className={`${field} resize-y`}
          />
        </label>

        <fieldset className="mt-4">
          <legend className="text-sm text-muted">Frame</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {aspectOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setAspect(option.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  aspect === option.id ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-5 space-y-3">
          <label className="flex items-center justify-between gap-3 rounded-xl border border-white/10 px-3 py-3 text-sm">
            <span>Show on the site</span>
            <input
              type="checkbox"
              checked={published}
              onChange={(event) => setPublished(event.target.checked)}
              className="h-4 w-4 accent-white"
            />
          </label>
          <label className="flex items-center justify-between gap-3 rounded-xl border border-white/10 px-3 py-3 text-sm">
            <span>Show on the homepage</span>
            <input
              type="checkbox"
              checked={showOnHome}
              onChange={(event) => setShowOnHome(event.target.checked)}
              className="h-4 w-4 accent-white"
            />
          </label>
        </div>

        {progress ? (
          <div className="mt-5 rounded-2xl border border-white/10 bg-black/50 p-3">
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="text-muted">{progress.label}</span>
              <span className="font-semibold tabular-nums">{progress.percent}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-ember transition-[width] duration-200"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          </div>
        ) : null}

        {error ? <p className="mt-4 text-sm text-ember">{error}</p> : null}

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void save()}
            disabled={busy}
            className="rounded-full bg-ember px-5 py-2.5 text-sm font-bold disabled:opacity-60"
          >
            {busy ? "Working…" : "Save"}
          </button>
          {id ? (
            <button
              type="button"
              onClick={() => void remove()}
              disabled={busy}
              className="rounded-full border border-white/20 px-5 py-2.5 text-sm disabled:opacity-60"
            >
              Delete
            </button>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
