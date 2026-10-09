import { adsCategories, entertainment, type CatalogueCategory } from "@/lib/taxonomy";

export type GuessedPlace = {
  section: "ads" | "entertainment";
  categorySlug: string;
  subcategorySlug: string;
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
  if (slug === "short-films") extras.push("films", "film", "short film", "short films");
  if (slug === "microdramas") extras.push("microdrama", "micro dramas");
  if (slug === "music-videos") extras.push("music video", "mv");
  if (slug === "ai-photoshoots") extras.push("ai photoshoot", "photoshoot", "photoshoots");
  if (slug === "food-and-beverage") extras.push("f and b", "fnb", "food beverage");
  if (slug === "2-5d") extras.push("2.5d", "2 5d");
  if (slug === "avatar-screen-content") extras.push("avatar screen", "avatar + screen");
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
  const found: Candidate[] = [];
  const categoryScore = Math.max(
    ...aliases(category.name, category.slug).map((alias) => scorePhrase(haystack, alias)),
    0,
  );

  for (const topic of category.items) {
    const topicScore = Math.max(
      ...aliases(topic.name, topic.slug).map((alias) => scorePhrase(haystack, alias)),
      0,
    );
    if (topicScore === 0 && categoryScore === 0) continue;
    found.push({
      section,
      categorySlug: category.slug,
      subcategorySlug: topic.slug,
      label: section === "entertainment" ? `Entertainment · ${topic.name}` : `${category.name} · ${topic.name}`,
      score: topicScore * 3 + categoryScore + (section === "entertainment" && haystack.includes("entertainment") ? 8 : 0),
    });
  }

  if (categoryScore > 0 && found.every((entry) => entry.categorySlug !== category.slug || entry.score < categoryScore)) {
    const first = category.items[0];
    if (first) {
      found.push({
        section,
        categorySlug: category.slug,
        subcategorySlug: first.slug,
        label: section === "entertainment" ? `Entertainment · ${first.name}` : `${category.name} · ${first.name}`,
        score: categoryScore,
      });
    }
  }

  return found;
}

export function guessPlaceFromFilename(name: string): GuessedPlace | null {
  const haystack = normalize(cleanStem(name));
  if (!haystack) return null;

  const candidates: Candidate[] = [
    ...collect(entertainment, "entertainment", haystack),
    ...adsCategories.flatMap((category) =>
      collect(category, category.slug === entertainment.slug ? "entertainment" : "ads", haystack),
    ),
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
    subcategorySlug: best.subcategorySlug,
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
