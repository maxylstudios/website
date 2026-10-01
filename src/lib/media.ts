import { createPublicSupabase } from "@/lib/supabase";

export type MediaCrop = {
  x: number;
  y: number;
};

export type MediaItem = {
  id: string;
  title: string;
  label: string;
  caption: string;
  kind: "image" | "video";
  storage_path: string;
  aspect: string;
  crop: MediaCrop | null;
  width: number | null;
  height: number | null;
  published: boolean;
  created_at: string;
  section: string;
  category_slug: string;
  subcategory_slug: string;
};

export const mediaColumns =
  "id, title, label, caption, kind, storage_path, aspect, crop, width, height, published, created_at, section, category_slug, subcategory_slug";

export const aspectOptions = [
  { id: "16:9", label: "16:9", value: 16 / 9 },
  { id: "4:5", label: "4:5", value: 4 / 5 },
  { id: "1:1", label: "1:1", value: 1 },
  { id: "3:2", label: "3:2", value: 3 / 2 },
  { id: "9:16", label: "9:16", value: 9 / 16 },
  { id: "21:9", label: "21:9", value: 21 / 9 },
  { id: "free", label: "Free", value: undefined },
] as const;

export function aspectNumber(aspect: string) {
  return aspectOptions.find((option) => option.id === aspect)?.value;
}

export function aspectRatioStyle(aspect: string): { aspectRatio: string } {
  if (!aspect.includes(":")) return { aspectRatio: "16 / 9" };
  const [width, height] = aspect.split(":").map(Number);
  if (!width || !height) return { aspectRatio: "16 / 9" };
  return { aspectRatio: `${width} / ${height}` };
}

export function mediaPublicUrl(path: string) {
  if (path.startsWith("https://") || path.startsWith("http://")) return path;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/object/public/media/${path}`;
}

export function objectPosition(crop: MediaCrop | null) {
  return `${crop?.x ?? 50}% ${crop?.y ?? 50}%`;
}

export function mediaHref(item: Pick<MediaItem, "id" | "section" | "category_slug" | "subcategory_slug">) {
  if (item.section === "entertainment" && item.subcategory_slug) {
    return `/entertainment/${item.subcategory_slug}/${item.id}`;
  }
  if (item.section === "ads" && item.category_slug && item.subcategory_slug) {
    return `/ads/${item.category_slug}/${item.subcategory_slug}/${item.id}`;
  }
  return `/misc/${item.id}`;
}

export function isFiled(item: Pick<MediaItem, "section" | "category_slug" | "subcategory_slug">) {
  return mediaHref({ ...item, id: "x" }) !== "/misc/x";
}

const legacyColumns =
  "id, title, label, caption, kind, storage_path, aspect, crop, width, height, published, created_at";

export async function listPublishedMedia() {
  try {
    const supabase = createPublicSupabase();
    const primary = await supabase
      .from("media_items")
      .select(mediaColumns)
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (!primary.error && primary.data) return primary.data as MediaItem[];

    const fallback = await supabase
      .from("media_items")
      .select(legacyColumns)
      .eq("published", true)
      .order("created_at", { ascending: false });
    if (fallback.error || !fallback.data) return [];
    return fallback.data.map((item) => ({
      ...item,
      section: "",
      category_slug: "",
      subcategory_slug: "",
    })) as MediaItem[];
  } catch {
    return [];
  }
}

export async function getPublishedMedia(id: string) {
  try {
    const supabase = createPublicSupabase();
    const primary = await supabase
      .from("media_items")
      .select(mediaColumns)
      .eq("id", id)
      .eq("published", true)
      .maybeSingle();
    if (!primary.error && primary.data) return primary.data as MediaItem;

    const fallback = await supabase
      .from("media_items")
      .select(legacyColumns)
      .eq("id", id)
      .eq("published", true)
      .maybeSingle();
    if (fallback.error || !fallback.data) return null;
    return {
      ...fallback.data,
      section: "",
      category_slug: "",
      subcategory_slug: "",
    } as MediaItem;
  } catch {
    return null;
  }
}
