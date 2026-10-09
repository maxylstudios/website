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
  show_on_home: boolean;
  poster_path: string | null;
  created_at: string;
  section: string;
  category_slug: string;
  subcategory_slug: string;
};

export const mediaColumns =
  "id, title, label, caption, kind, storage_path, aspect, crop, width, height, published, show_on_home, poster_path, created_at, section, category_slug, subcategory_slug";

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

export function frameStyleForItem(
  item: Pick<MediaItem, "aspect" | "width" | "height">,
): { aspectRatio: string } {
  if (item.aspect && item.aspect !== "free") {
    return aspectRatioStyle(item.aspect);
  }
  if (item.width && item.height) {
    return { aspectRatio: `${item.width} / ${item.height}` };
  }
  return { aspectRatio: "16 / 9" };
}

export function mediaPublicUrl(path: string) {
  if (path.startsWith("https://") || path.startsWith("http://")) return path;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/object/public/media/${path}`;
}

export function objectPosition(crop: MediaCrop | null) {
  return `${crop?.x ?? 50}% ${crop?.y ?? 50}%`;
}

/** Entertainment used to store the topic in subcategory_slug. Prefer category_slug after the 14 migration. */
export function catalogueSlug(item: Pick<MediaItem, "section" | "category_slug" | "subcategory_slug">) {
  if (item.section === "entertainment") {
    if (item.category_slug && item.category_slug !== "entertainment") return item.category_slug;
    return item.subcategory_slug || "";
  }
  return item.category_slug || "";
}

export function mediaHref(item: Pick<MediaItem, "id" | "section" | "category_slug" | "subcategory_slug">) {
  const slug = catalogueSlug(item);
  if (item.section === "entertainment" && slug) {
    return `/entertainment/${slug}/${item.id}`;
  }
  if (item.section === "ads" && slug) {
    return `/ads/${slug}/${item.id}`;
  }
  return `/misc/${item.id}`;
}

export function isFiled(item: Pick<MediaItem, "section" | "category_slug" | "subcategory_slug">) {
  return mediaHref({ ...item, id: "x" }) !== "/misc/x";
}

const catalogueColumns =
  "id, title, label, caption, kind, storage_path, aspect, crop, width, height, published, created_at, section, category_slug, subcategory_slug";

const legacyColumns =
  "id, title, label, caption, kind, storage_path, aspect, crop, width, height, published, created_at";

function withDefaults(item: Record<string, unknown>): MediaItem {
  return {
    ...(item as MediaItem),
    section: String(item.section ?? ""),
    category_slug: String(item.category_slug ?? ""),
    subcategory_slug: String(item.subcategory_slug ?? ""),
    show_on_home: Boolean(item.show_on_home),
    poster_path: typeof item.poster_path === "string" && item.poster_path.length > 0 ? item.poster_path : null,
  };
}

export async function listPublishedMedia() {
  try {
    const supabase = createPublicSupabase();
    const primary = await supabase
      .from("media_items")
      .select(mediaColumns)
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (!primary.error && primary.data) {
      return primary.data.map((item) => withDefaults(item as Record<string, unknown>));
    }

    const catalogue = await supabase
      .from("media_items")
      .select(catalogueColumns)
      .eq("published", true)
      .order("created_at", { ascending: false });
    if (!catalogue.error && catalogue.data) {
      return catalogue.data.map((item) => withDefaults(item as Record<string, unknown>));
    }

    const fallback = await supabase
      .from("media_items")
      .select(legacyColumns)
      .eq("published", true)
      .order("created_at", { ascending: false });
    if (fallback.error || !fallback.data) return [];
    return fallback.data.map((item) => withDefaults(item as Record<string, unknown>));
  } catch {
    return [];
  }
}

export function isPortraitItem(item: Pick<MediaItem, "aspect" | "width" | "height">) {
  if (item.aspect === "9:16" || item.aspect === "4:5") return true;
  if (item.aspect === "16:9" || item.aspect === "21:9" || item.aspect === "3:2") return false;
  const [width, height] = frameStyleForItem(item).aspectRatio.split("/").map((part) => Number(part.trim()));
  if (!width || !height) return false;
  return height > width;
}

export type HeroVideo = {
  storage_path: string;
  updated_at: string;
};

export function heroAsMediaItem(path: string): MediaItem {
  return {
    id: "hero",
    title: "Hero",
    label: "",
    caption: "",
    kind: "video",
    storage_path: path,
    aspect: "16:9",
    crop: null,
    width: null,
    height: null,
    published: true,
    show_on_home: true,
    poster_path: null,
    created_at: "",
    section: "",
    category_slug: "",
    subcategory_slug: "",
  };
}

export async function getHeroVideo() {
  try {
    const supabase = createPublicSupabase();
    const { data, error } = await supabase
      .from("hero_video")
      .select("storage_path, updated_at")
      .eq("id", 1)
      .maybeSingle();
    if (error || !data?.storage_path) return null;
    return data as HeroVideo;
  } catch {
    return null;
  }
}

export async function listHomeMedia() {
  const published = await listPublishedMedia();
  const flagged = published.filter((item) => item.kind === "video" && item.show_on_home);
  if (flagged.length > 0) return flagged;
  return published.filter((item) => item.kind === "video").slice(0, 8);
}

export type HomepageBoard = {
  videoIds: string[];
  imageIds: string[];
};

export async function getHomepageBoard(): Promise<HomepageBoard | null> {
  try {
    const supabase = createPublicSupabase();
    const { data, error } = await supabase
      .from("homepage_board")
      .select("video_ids, image_ids")
      .eq("id", 1)
      .maybeSingle();
    if (error || !data) return null;
    return {
      videoIds: Array.isArray(data.video_ids) ? data.video_ids.map(String) : [],
      imageIds: Array.isArray(data.image_ids) ? data.image_ids.map(String) : [],
    };
  } catch {
    return null;
  }
}

export function arrangeHomepage(items: MediaItem[], board: HomepageBoard | null) {
  const published = items.filter((item) => item.published);
  if (!board) {
    return {
      videos: published.filter((item) => item.kind === "video"),
      images: published.filter((item) => item.kind === "image"),
    };
  }

  const byId = new Map(published.map((item) => [item.id, item]));
  const pick = (ids: string[], kind: MediaItem["kind"]) =>
    ids
      .map((id) => byId.get(id))
      .filter((item): item is MediaItem => item !== undefined && item.kind === kind);

  return {
    videos: pick(board.videoIds, "video"),
    images: pick(board.imageIds, "image"),
  };
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
    if (!primary.error && primary.data) {
      return withDefaults(primary.data as Record<string, unknown>);
    }

    const catalogue = await supabase
      .from("media_items")
      .select(catalogueColumns)
      .eq("id", id)
      .eq("published", true)
      .maybeSingle();
    if (!catalogue.error && catalogue.data) {
      return withDefaults(catalogue.data as Record<string, unknown>);
    }

    const fallback = await supabase
      .from("media_items")
      .select(legacyColumns)
      .eq("id", id)
      .eq("published", true)
      .maybeSingle();
    if (fallback.error || !fallback.data) return null;
    return withDefaults(fallback.data as Record<string, unknown>);
  } catch {
    return null;
  }
}
