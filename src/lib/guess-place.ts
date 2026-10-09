import { adsCategories, entertainmentCategories, type CatalogueCategory } from "@/lib/taxonomy";

export type GuessedPlace = {
  section: "ads" | "entertainment";
  categorySlug: string;
  label: string;
};

function cleanStem(name: string) {
  return name
    .replace(/\.[^.]+$/, "")
    .replace(/[_\-.+/\\|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function titleFromFilename(name: string) {
  const stem = cleanStem(name);
  if (!stem) return "";
  return stem
    .split(" ")
    .map((word) => {
      if (/^[0-9]+$/.test(word)) return word;
      if (word.length <= 2) return word.toUpperCase();
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\+/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function aliases(name: string, slug: string) {
  const base = [normalize(name), slug.replace(/-/g, " ")];
  const extras: string[] = [];
  if (slug === "films") extras.push("film", "films", "short film", "short films", "series", "music video", "mv", "trailer", "trailers", "promo", "promos");
  if (slug === "microdramas") extras.push("microdrama", "micro dramas");
  if (slug === "fashion-and-lifestyle") extras.push("fashion", "lifestyle", "clothing");
  if (slug === "products-and-fmcg") extras.push("fmcg", "product", "products");
  if (slug === "ai-talent-and-avatars") extras.push("ai talent", "avatar", "avatars");
  return [...new Set([...base, ...extras].filter(Boolean))];
}

function scorePhrase(haystack: string, phrase: string) {
  if (!phrase) return 0;
  if (haystack === phrase) return 100 + phrase.length;
  if (` ${haystack} `.includes(` ${phrase} `)) return 60 + phrase.length;
  const parts = phrase.split(" ").filter(Boolean);
  if (parts.length > 1 && parts.every((part) => ` ${haystack} `.includes(` ${part} `))) {
    return 25 + phrase.length;
  }
  return 0;
}

type Candidate = GuessedPlace & { score: number };

function collect(category: CatalogueCategory, section: "ads" | "entertainment", haystack: string) {
  const categoryScore = Math.max(
    ...aliases(category.name, category.slug).map((alias) => scorePhrase(haystack, alias)),
    0,
  );
  if (categoryScore === 0) return [] as Candidate[];
  return [
    {
      section,
      categorySlug: category.slug,
      label: section === "entertainment" ? `Entertainment · ${category.name}` : category.name,
      score: categoryScore + (section === "entertainment" && haystack.includes("entertainment") ? 8 : 0),
    },
  ];
}

export function guessPlaceFromFilename(name: string): GuessedPlace | null {
  const haystack = normalize(cleanStem(name));
  if (!haystack) return null;

  const candidates: Candidate[] = [
    ...entertainmentCategories.flatMap((category) => collect(category, "entertainment", haystack)),
    ...adsCategories.flatMap((category) => collect(category, "ads", haystack)),
  ];

  if (haystack.includes("entertainment") || haystack.includes("ads entertainment")) {
    for (const entry of candidates) {
      if (entry.section === "entertainment") entry.score += 12;
    }
  }

  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0];
  if (!best || best.score < 25) return null;
  return {
    section: best.section,
    categorySlug: best.categorySlug,
    label: best.label,
  };
}

export function closestAspect(width: number, height: number) {
  if (!width || !height) return "16:9";
  const value = width / height;
  const options: { id: string; value: number }[] = [
    { id: "16:9", value: 16 / 9 },
    { id: "4:5", value: 4 / 5 },
    { id: "1:1", value: 1 },
    { id: "3:2", value: 3 / 2 },
    { id: "9:16", value: 9 / 16 },
    { id: "21:9", value: 21 / 9 },
  ];
  return options.reduce((best, option) =>
    Math.abs(option.value - value) < Math.abs(best.value - value) ? option : best,
  ).id;
}
