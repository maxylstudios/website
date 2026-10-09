import type { Metadata } from "next";
import { EntertainmentBrowse } from "@/components/entertainment-browse";
import { HomeBillboard } from "@/components/home-billboard";
import { SectionLinks } from "@/components/section-links";
import { listPublishedMedia } from "@/lib/media";
import { adsPageKey, getPageHeroes, pickFeatured } from "@/lib/page-heroes";
import { adsCategories, adsCategory } from "@/lib/taxonomy";

export const metadata: Metadata = {
  title: "Ads",
  description: "Advertising categories at Maxyl Studios.",
};

export default async function AdsPage() {
  const [uploaded, heroes] = await Promise.all([listPublishedMedia(), getPageHeroes()]);
  const films = uploaded.filter((item) => item.section === "ads");
  const featured = pickFeatured(films, heroes[adsPageKey()]);
  const featuredCategory = featured ? adsCategory(featured.category_slug) : null;

  const rows = adsCategories.map((category) => ({
    slug: category.slug,
    name: category.name,
    href: `/ads/${category.slug}`,
    items: films.filter((item) => item.category_slug === category.slug),
  }));

  const links = adsCategories.map((category) => ({
    href: `/ads/${category.slug}`,
    label: category.name,
  }));

  return (
    <div className="bg-black">
      {featured ? (
        <HomeBillboard item={featured} kicker={featuredCategory ? featuredCategory.name : "Ads"} blurb={null} links={links} />
      ) : (
        <section className="px-5 pb-6 pt-28 sm:px-8">
          <p className="text-xs font-semibold tracking-[0.28em] text-muted uppercase">Ads</p>
          <h1 className="mt-3 text-4xl font-bold sm:text-5xl">Ads</h1>
          <SectionLinks className="mt-8" links={links} />
        </section>
      )}
      <EntertainmentBrowse rows={rows} />
    </div>
  );
}
