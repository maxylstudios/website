import type { Metadata } from "next";
import { AdsBrowse } from "@/components/ads-browse";
import { AdsHero } from "@/components/ads-hero";
import { getHiddenCategories, visibleCategories } from "@/lib/hidden-categories";
import { listPublishedMedia } from "@/lib/media";
import { adsPageKey, getPageHeroes, pickFeatured } from "@/lib/page-heroes";
import { adsCategory } from "@/lib/taxonomy";

export const metadata: Metadata = {
  title: "Ads",
  description: "Advertising categories at Maxyl Studios.",
};

export default async function AdsPage() {
  const [uploaded, heroes, hidden] = await Promise.all([
    listPublishedMedia(),
    getPageHeroes(),
    getHiddenCategories(),
  ]);
  const categories = visibleCategories("ads", hidden);
  const films = uploaded.filter((item) => item.section === "ads");
  const featured = pickFeatured(films, heroes[adsPageKey()]);
  const featuredCategory = featured ? adsCategory(featured.category_slug) : null;

  const rows = categories.map((category, index) => ({
    slug: category.slug,
    name: category.name,
    href: `/ads/${category.slug}`,
    index: index + 1,
    items: films.filter((item) => item.category_slug === category.slug),
  }));

  const kickerParts = [featuredCategory?.name, featured?.style_tag?.trim()].filter(Boolean);

  return (
    <div className="bg-black">
      {featured ? (
        <AdsHero item={featured} kicker={kickerParts.join(" · ") || "Ads"} />
      ) : (
        <section className="border-b border-white/10 px-6 pb-10 pt-10 sm:px-8">
          <p className="text-[11px] tracking-[0.24em] text-white/45 uppercase">Ads</p>
          <h1 className="mt-3 text-4xl font-bold">All ads</h1>
          <p className="mt-3 text-sm text-white/50">Nothing featured yet — pick a category from the sidebar.</p>
        </section>
      )}
      <AdsBrowse rows={rows} />
    </div>
  );
}
