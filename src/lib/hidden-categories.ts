import { createPublicSupabase } from "@/lib/supabase";
import { adsCategories, entertainmentCategories, type CatalogueCategory } from "@/lib/taxonomy";

export type HiddenCategory = {
  section: "ads" | "entertainment";
  slug: string;
};

export async function getHiddenCategories(): Promise<HiddenCategory[]> {
  try {
    const supabase = createPublicSupabase();
    const { data, error } = await supabase.from("hidden_categories").select("section, slug");
    if (error || !data) return [];
    return data
      .map((row) => ({
        section: String(row.section ?? "") as HiddenCategory["section"],
        slug: String(row.slug ?? ""),
      }))
      .filter((row) => (row.section === "ads" || row.section === "entertainment") && row.slug.length > 0);
  } catch {
    return [];
  }
}

export function visibleCategories(
  section: "ads" | "entertainment",
  hidden: HiddenCategory[],
): CatalogueCategory[] {
  const source = section === "ads" ? adsCategories : entertainmentCategories;
  const blocked = new Set(hidden.filter((row) => row.section === section).map((row) => row.slug));
  return source.filter((category) => !blocked.has(category.slug));
}
