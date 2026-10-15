import type { Metadata } from "next";
import { EntertainmentNav } from "@/components/entertainment-sections";
import { EntertainmentStage } from "@/components/entertainment-stage";
import { catalogueSlug, listPublishedMedia } from "@/lib/media";
import { entertainmentPageKey, getPageHeroes, pickFeatured } from "@/lib/page-heroes";
import { entertainmentCategories } from "@/lib/taxonomy";

export const metadata: Metadata = {
  title: "Entertainment",
  description: "Films and microdramas from Maxyl Studios.",
};

const blurbs: Record<string, string> = {
  films: "Epics, thrillers, and cinematic worlds made for the big feeling.",
  microdramas: "Short, bingeable stories cut for vertical and social screens.",
};

export default async function EntertainmentPage() {
  const [uploaded, heroes] = await Promise.all([listPublishedMedia(), getPageHeroes()]);
  const films = uploaded.filter((item) => item.section === "entertainment");
  const featured = pickFeatured(films, heroes[entertainmentPageKey()]);

  const ordered = featured
    ? [featured, ...films.filter((item) => item.id !== featured.id)]
    : films;

  const lanes = entertainmentCategories.map((category) => ({
    slug: category.slug,
    name: category.name,
    href: `/entertainment/${category.slug}`,
    blurb: blurbs[category.slug] ?? "Open the catalogue.",
    items: films.filter((item) => catalogueSlug(item) === category.slug),
  }));

  return (
    <>
      <EntertainmentStage items={ordered} initialId={featured?.id} />
      <EntertainmentNav lanes={lanes} />
    </>
  );
}
