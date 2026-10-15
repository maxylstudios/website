import { mediaPublicUrl } from "@/lib/media";
import { createPublicSupabase } from "@/lib/supabase";

export const homepageArtSlots = [
  {
    id: "yailians",
    label: "YAILIANS poster",
    hint: "Background of the feature jumbotron under the vertical shelf.",
  },
  {
    id: "era",
    label: "New era still",
    hint: "Wide background behind the AI content section.",
  },
  {
    id: "card-worlds",
    label: "Worlds card",
    hint: "Image on the Worlds card.",
  },
  {
    id: "card-faces",
    label: "Faces card",
    hint: "Image on the Faces card.",
  },
  {
    id: "card-campaigns",
    label: "Campaigns card",
    hint: "Image on the Campaigns card.",
  },
] as const;

export type HomepageArtSlot = (typeof homepageArtSlots)[number]["id"];

export type HomepageArt = Partial<Record<HomepageArtSlot, string>>;

export async function getHomepageArt(): Promise<HomepageArt> {
  try {
    const supabase = createPublicSupabase();
    const { data, error } = await supabase.from("homepage_art").select("slot, image_path");
    if (error || !data) return {};
    const art: HomepageArt = {};
    for (const row of data) {
      const slot = String(row.slot ?? "");
      const path = String(row.image_path ?? "").trim();
      if (!path) continue;
      if (homepageArtSlots.some((entry) => entry.id === slot)) {
        art[slot as HomepageArtSlot] = mediaPublicUrl(path);
      }
    }
    return art;
  } catch {
    return {};
  }
}
