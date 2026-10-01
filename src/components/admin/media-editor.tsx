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
import { cropImage, extensionForType } from "@/lib/crop-image";
import { adsCategories, adsCategory, entertainment, topicIn } from "@/lib/taxonomy";

const maxBytes = 50 * 1024 * 1024;

type Props = {
  id?: string;
};

export function MediaEditor({ id }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [section, setSection] = useState<"ads" | "entertainment">("ads");
  const [categorySlug, setCategorySlug] = useState(adsCategories[0].slug);
  const [subcategorySlug, setSubcategorySlug] = useState(adsCategories[0].items[0].slug);
  const [caption, setCaption] = useState("");
  const [published, setPublished] = useState(true);
  const [aspect, setAspect] = useState("16:9");
  const [focus, setFocus] = useState<MediaCrop>({ x: 50, y: 50 });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [existing, setExisting] = useState<MediaItem | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pixels, setPixels] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [drag, setDrag] = useState<{ x: number; y: number; origin: MediaCrop } | null>(null);

  const kind: "image" | "video" | null = file
    ? file.type.startsWith("video/")
      ? "video"
      : "image"
    : existing?.kind ?? null;

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
      if (item.subcategory_slug) setSubcategorySlug(item.subcategory_slug);
      setCaption(item.caption);
      setPublished(item.published);
      setAspect(item.aspect);
      setFocus(item.crop ?? { x: 50, y: 50 });
      setPreview(mediaPublicUrl(item.storage_path));
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  function chooseFile(next: File | null) {
    setError("");
    if (!next) return;
    if (next.size > maxBytes) {
      setError("Keep the file under 50 MB.");
      return;
    }
    const allowed =
      next.type.startsWith("image/") || next.type.startsWith("video/");
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
    const chosen =
      section === "entertainment" ? entertainment : adsCategory(categorySlug);
    if (!chosen || !topicIn(chosen, subcategorySlug)) {
      setError("Choose Ads or Entertainment, then a subcategory.");
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

    try {
      const form = new FormData();
      if (id) form.set("id", id);
      form.set("title", title.trim());
      form.set("section", section);
      form.set("category", section === "entertainment" ? entertainment.slug : categorySlug);
      form.set("subcategory", subcategorySlug);
      form.set("caption", caption.trim());
      form.set("published", published ? "true" : "false");
      form.set("aspect", aspect);
      form.set("kind", savedKind);
      form.set("existingPath", existing?.storage_path ?? "");
      if (savedKind === "video") {
        form.set("cropX", String(focus.x));
        form.set("cropY", String(focus.y));
      }

      if (file && kind === "image") {
        if (!pixels || !preview) throw new Error("Crop the image first.");
        const cropped = await cropImage(preview, pixels, file.type);
        form.set(
          "file",
          new File([cropped.blob], `crop.${extensionForType(cropped.type)}`, { type: cropped.type }),
        );
        form.set("width", String(cropped.width));
        form.set("height", String(cropped.height));
      } else if (file && kind === "video") {
        form.set("file", file);
      }

      const result = await saveAdminMedia(form);
      if (!result.ok) throw new Error(result.message);

      router.push("/admin");
      router.refresh();
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Could not save.";
      setError(message);
      setBusy(false);
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

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div>
        <label className="block rounded border border-dashed border-white/25 px-4 py-8 text-center text-sm text-muted">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
            className="sr-only"
            onChange={(event) => chooseFile(event.target.files?.[0] ?? null)}
          />
          {file ? file.name : existing ? "Replace the file" : "Choose an image or video"}
          <span className="mt-1 block text-xs">Any ratio. Up to 50 MB.</span>
        </label>

        {preview && kind === "image" && file ? (
          <div className="relative mt-4 h-[420px] overflow-hidden rounded bg-neutral-950">
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
          <div className="mt-4 overflow-hidden rounded bg-black" style={frame}>
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
            className="mt-4 h-auto max-h-[420px] w-full rounded object-contain"
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
              className="mt-2 w-full"
            />
          </label>
        ) : null}
        {kind === "video" ? (
          <p className="mt-3 text-sm text-muted">
            Drag the picture to frame it. The original file stays intact; the site shows this crop.
          </p>
        ) : null}
      </div>

      <div>
        <label className="mb-4 block text-sm">
          Title
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-1 w-full border-b border-white/20 bg-transparent py-2 outline-none"
          />
        </label>
        <label className="mb-4 block text-sm">
          Place
          <select
            value={section}
            onChange={(event) => {
              const next = event.target.value === "entertainment" ? "entertainment" : "ads";
              setSection(next);
              if (next === "entertainment") {
                setCategorySlug(entertainment.slug);
                setSubcategorySlug(entertainment.items[0].slug);
              } else {
                setCategorySlug(adsCategories[0].slug);
                setSubcategorySlug(adsCategories[0].items[0].slug);
              }
            }}
            className="mt-1 w-full border-b border-white/20 bg-black py-2 outline-none"
          >
            <option value="ads">Ads</option>
            <option value="entertainment">Entertainment</option>
          </select>
        </label>
        {section === "ads" ? (
          <label className="mb-4 block text-sm">
            Category
            <select
              value={categorySlug}
              onChange={(event) => {
                const next = event.target.value;
                const category = adsCategory(next);
                setCategorySlug(next);
                setSubcategorySlug(category?.items[0]?.slug ?? "");
              }}
              className="mt-1 w-full border-b border-white/20 bg-black py-2 outline-none"
            >
              {adsCategories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label className="mb-4 block text-sm">
          Subcategory
          <select
            value={subcategorySlug}
            onChange={(event) => setSubcategorySlug(event.target.value)}
            className="mt-1 w-full border-b border-white/20 bg-black py-2 outline-none"
          >
            {(section === "entertainment" ? entertainment.items : (adsCategory(categorySlug)?.items ?? [])).map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label className="mb-4 block text-sm">
          Caption
          <textarea
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            rows={4}
            className="mt-1 w-full resize-y border-b border-white/20 bg-transparent py-2 outline-none"
          />
        </label>
        <fieldset className="mb-4">
          <legend className="text-sm text-muted">Frame</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {aspectOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setAspect(option.id)}
                className={`rounded px-3 py-1 text-xs ${
                  aspect === option.id ? "bg-white text-black" : "bg-white/10 text-white"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>
        <label className="mb-6 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={published}
            onChange={(event) => setPublished(event.target.checked)}
          />
          Show on the site
        </label>
        {error ? <p className="mb-4 text-sm text-ember">{error}</p> : null}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void save()}
            disabled={busy}
            className="rounded bg-ember px-4 py-2 text-sm font-bold disabled:opacity-60"
          >
            {busy ? "Saving" : "Save"}
          </button>
          {id ? (
            <button
              type="button"
              onClick={() => void remove()}
              disabled={busy}
              className="rounded border border-white/20 px-4 py-2 text-sm"
            >
              Delete
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
