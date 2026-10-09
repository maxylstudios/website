import type { Metadata } from "next";
import { EntertainmentBrowse } from "@/components/entertainment-browse";
import { HomeBillboard } from "@/components/home-billboard";
import { SectionLinks } from "@/components/section-links";
import { catalogueSlug, listPublishedMedia } from "@/lib/media";
import { entertainmentPageKey, getPageHeroes, pickFeatured } from "@/lib/page-heroes";
import { entertainmentCategories, entertainmentCategory } from "@/lib/taxonomy";

export const metadata: Metadata = {
  title: "Entertainment",
  description: "Microdramas and films from Maxyl Studios.",
};

export default async function EntertainmentPage() {
  const [uploaded, heroes] = await Promise.all([listPublishedMedia(), getPageHeroes()]);
  const films = uploaded.filter((item) => item.section === "entertainment");
  const featured = pickFeatured(films, heroes[entertainmentPageKey()]);
  const featuredCategory = featured ? entertainmentCategory(featured.category_slug) : null;

  const rows = entertainmentCategories.map((category) => ({
    slug: category.slug,
    name: category.name,
    href: `/entertainment/${category.slug}`,
    items: films.filter((item) => catalogueSlug(item) === category.slug),
  }));

  const links = entertainmentCategories.map((category) => ({
    href: `/entertainment/${category.slug}`,
    label: category.name,
  }));

  return (
    <div className="bg-black">
      {featured ? (
        <HomeBillboard item={featured} kicker={featuredCategory ? featuredCategory.name : "Entertainment"} blurb={null} links={links} />
      ) : (
        <section className="px-5 pb-6 pt-28 sm:px-8">
          <p className="text-xs font-semibold tracking-[0.28em] text-muted uppercase">Entertainment</p>
          <h1 className="mt-3 text-4xl font-bold sm:text-5xl">Entertainment</h1>
          <SectionLinks className="mt-8" links={links} />
        </section>
      )}
      <EntertainmentBrowse rows={rows} />
    </div>
  );
}
