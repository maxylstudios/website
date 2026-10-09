export type CatalogueCategory = {
  slug: string;
  name: string;
};

function categories(names: string[]): CatalogueCategory[] {
  return names.map((name) => ({
    name,
    slug: name
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/\+/g, " ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, ""),
  }));
}

export const entertainmentCategories: CatalogueCategory[] = categories([
  "Films",
  "Microdramas",
]);

/** Old entertainment topics that now live under Films. */
export const retiredEntertainmentSlugs = [
  "series",
  "short-films",
  "music-videos",
  "trailers",
  "promos",
] as const;

export const adsCategories: CatalogueCategory[] = categories([
  "Fashion & Lifestyle",
  "Products & FMCG",
  "Automotive & Mobility",
  "Sports & Fitness",
  "Real Estate & Architecture",
  "Finance & Corporate",
  "Education & Information",
  "Entertainment",
  "Mythology & Fantasy",
  "Advertising & Social",
  "AI Talent & Avatars",
  "Product & App Demos",
  "Animation & Creative Styles",
  "Localisation",
]);

export function adsCategory(slug: string) {
  return adsCategories.find((category) => category.slug === slug) ?? null;
}

export function entertainmentCategory(slug: string) {
  return entertainmentCategories.find((category) => category.slug === slug) ?? null;
}

export function sectionCategories(section: "ads" | "entertainment") {
  return section === "entertainment" ? entertainmentCategories : adsCategories;
}

export function placeLabel(section: string, categorySlug: string, subcategorySlug = "") {
  const slug =
    section === "entertainment" && (!categorySlug || categorySlug === "entertainment")
      ? subcategorySlug || categorySlug
      : categorySlug;
  if (section === "entertainment") {
    const category = entertainmentCategory(slug);
    return category ? `Entertainment · ${category.name}` : "Entertainment";
  }
  if (section === "ads") {
    const category = adsCategory(slug);
    return category ? category.name : "Ads";
  }
  return "Untagged";
}
