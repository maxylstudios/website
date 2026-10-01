export type Topic = {
  slug: string;
  name: string;
};

export type CatalogueCategory = {
  slug: string;
  name: string;
  items: Topic[];
};

function topics(names: string[]): Topic[] {
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

export const entertainment: CatalogueCategory = {
  slug: "entertainment",
  name: "Entertainment",
  items: topics([
    "Microdramas",
    "Series",
    "Short Films",
    "Music Videos",
    "Trailers",
    "Promos",
  ]),
};

export const adsCategories: CatalogueCategory[] = [
  {
    slug: "fashion-and-lifestyle",
    name: "Fashion & Lifestyle",
    items: topics([
      "Clothing",
      "Footwear",
      "Jewellery",
      "Watches",
      "Beauty",
      "Cosmetics",
      "Luxury",
      "AI Photoshoots",
    ]),
  },
  {
    slug: "products-and-fmcg",
    name: "Products & FMCG",
    items: topics([
      "Food & Beverage",
      "Packaged Products",
      "Electronics",
      "Phones",
      "Headphones",
      "Product Showcases",
    ]),
  },
  {
    slug: "automotive-and-mobility",
    name: "Automotive & Mobility",
    items: topics([
      "Cars",
      "EVs",
      "Bikes",
      "Product Reveals",
      "Automotive Films",
      "Concept Visuals",
    ]),
  },
  {
    slug: "sports-and-fitness",
    name: "Sports & Fitness",
    items: topics([
      "Athlete Campaigns",
      "Sportswear",
      "Fitness Brands",
      "AI Athletes",
      "AI Photoshoots",
    ]),
  },
  {
    slug: "real-estate-and-architecture",
    name: "Real Estate & Architecture",
    items: topics([
      "Property Films",
      "Architecture",
      "Interiors",
      "Hospitality",
      "Real Estate Visualisation",
    ]),
  },
  {
    slug: "finance-and-corporate",
    name: "Finance & Corporate",
    items: topics(["Banking", "Insurance", "Fintech", "Corporate Films", "Explainers", "B2B Content"]),
  },
  {
    slug: "education-and-information",
    name: "Education & Information",
    items: topics([
      "EdTech",
      "Science Visualisation",
      "History",
      "Safety Videos",
      "Training",
      "Explainers",
    ]),
  },
  entertainment,
  {
    slug: "mythology-and-fantasy",
    name: "Mythology & Fantasy",
    items: topics([
      "Mythological Films",
      "Fantasy Worlds",
      "RPG Content",
      "Creatures",
      "Battles",
      "Worldbuilding",
    ]),
  },
  {
    slug: "advertising-and-social",
    name: "Advertising & Social",
    items: topics([
      "Brand Films",
      "Commercials",
      "Reels",
      "Performance Ads",
      "Campaigns",
      "Product Ads",
    ]),
  },
  {
    slug: "ai-talent-and-avatars",
    name: "AI Talent & Avatars",
    items: topics([
      "AI Models",
      "Virtual Influencers",
      "Digital Humans",
      "Spokesperson Avatars",
      "AI Photoshoots",
    ]),
  },
  {
    slug: "product-and-app-demos",
    name: "Product & App Demos",
    items: topics([
      "App Walkthroughs",
      "Website Demos",
      "UI Videos",
      "SaaS Explainers",
      "Avatar + Screen Content",
    ]),
  },
  {
    slug: "animation-and-creative-styles",
    name: "Animation & Creative Styles",
    items: topics([
      "Anime",
      "2D",
      "2.5D",
      "3D",
      "Claymation",
      "Paper Style",
      "Watercolour",
      "CGI",
      "Photorealistic",
      "Surreal",
    ]),
  },
  {
    slug: "localisation",
    name: "Localisation",
    items: topics([
      "AI Dubbing",
      "Lip-sync",
      "Multilingual Content",
      "Regional Adaptation",
      "Voice Localisation",
    ]),
  },
];

export function adsCategory(slug: string) {
  return adsCategories.find((category) => category.slug === slug) ?? null;
}

export function topicIn(category: CatalogueCategory, slug: string) {
  return category.items.find((item) => item.slug === slug) ?? null;
}

export function placeLabel(section: string, categorySlug: string, subcategorySlug: string) {
  if (section === "entertainment") {
    const topic = topicIn(entertainment, subcategorySlug);
    return topic ? `Entertainment · ${topic.name}` : "Entertainment";
  }
  const category = adsCategory(categorySlug);
  const topic = category ? topicIn(category, subcategorySlug) : null;
  if (category && topic) return `${category.name} · ${topic.name}`;
  if (category) return category.name;
  return "Untagged";
}
