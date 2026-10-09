import { isPortraitItem, type MediaItem } from "@/lib/media";
import { createPublicSupabase } from "@/lib/supabase";

export function adsPageKey() {
  return "ads";
}

export function adsCategoryKey(slug: string) {
  return `ads:${slug}`;
}

export function entertainmentPageKey() {
  return "entertainment";
}

export function entertainmentTopicKey(slug: string) {
  return `entertainment:${slug}`;
}

export async function getPageHeroes() {
  try {
    const supabase = createPublicSupabase();
    const { data, error } = await supabase.from("page_heroes").select("page_key, media_id");
    if (error || !data) return {} as Record<string, string>;
    return Object.fromEntries(data.map((row) => [String(row.page_key), String(row.media_id)]));
  } catch {
    return {} as Record<string, string>;
  }
}

export function pickFeatured(films: MediaItem[], heroId: string | undefined) {
  if (heroId) {
    const chosen = films.find((item) => item.id === heroId && item.kind === "video");
    if (chosen) return chosen;
  }
  return (
    films.find((item) => item.kind === "video" && !isPortraitItem(item)) ??
    films.find((item) => item.kind === "video") ??
    null
  );
}
