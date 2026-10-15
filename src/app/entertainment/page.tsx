import type { Metadata } from "next";
import { EntertainmentSections } from "@/components/entertainment-sections";
import { EntertainmentStage } from "@/components/entertainment-stage";
import { catalogueSlug, listPublishedMedia } from "@/lib/media";
import { entertainmentPageKey, getPageHeroes, pickFeatured } from "@/lib/page-heroes";
import { entertainmentCategories } from "@/lib/taxonomy";

export const metadata: Metadata = {
  title: "Entertainment",
  description: "Films and microdramas from Maxyl Studios.",
};

export default async function EntertainmentPage() {
  const [uploaded, heroes] = await Promise.all([listPublishedMedia(), getPageHeroes()]);
  const films = uploaded.filter((item) => item.section === "entertainment");
  const featured = pickFeatured(films, heroes[entertainmentPageKey()]);

  const ordered = featured
    ? [featured, ...films.filter((item) => item.id !== featured.id)]
    : films;

  const shelves = entertainmentCategories.map((category) => ({
    slug: category.slug,
    name: category.name,
    href: `/entertainment/${category.slug}`,
    items: films.filter((item) => catalogueSlug(item) === category.slug),
  }));

  return (
    <>
      <EntertainmentStage items={ordered} initialId={featured?.id} />
      <EntertainmentSections shelves={shelves} />
    </>
  );
}
