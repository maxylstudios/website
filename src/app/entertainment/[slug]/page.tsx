import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { EntertainmentGrid } from "@/components/entertainment-sections";
import { EntertainmentStage } from "@/components/entertainment-stage";
import { catalogueSlug, listPublishedMedia } from "@/lib/media";
import { entertainmentTopicKey, getPageHeroes, pickFeatured } from "@/lib/page-heroes";
import {
  entertainmentCategories,
  entertainmentCategory,
  retiredEntertainmentSlugs,
} from "@/lib/taxonomy";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const blurbs: Record<string, string> = {
  films: "Epics, thrillers, and cinematic worlds made for the big feeling.",
  microdramas: "Short, bingeable stories cut for vertical and social screens.",
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return { title: entertainmentCategory(slug)?.name ?? "Entertainment" };
}

export default async function EntertainmentCategoryPage({ params }: PageProps) {
  const { slug } = await params;
  if ((retiredEntertainmentSlugs as readonly string[]).includes(slug)) {
    redirect("/entertainment/films");
  }
  const category = entertainmentCategory(slug);
  if (!category) notFound();

  const [uploaded, heroes] = await Promise.all([listPublishedMedia(), getPageHeroes()]);
  const items = uploaded.filter(
    (item) => item.section === "entertainment" && catalogueSlug(item) === category.slug,
  );
  const featured = pickFeatured(items, heroes[entertainmentTopicKey(category.slug)]);
  const ordered = featured
    ? [featured, ...items.filter((item) => item.id !== featured.id)]
    : items;

  const lanes = entertainmentCategories.map((entry) => ({
    slug: entry.slug,
    name: entry.name,
    href: `/entertainment/${entry.slug}`,
    blurb: blurbs[entry.slug] ?? "Open the catalogue.",
    items: uploaded.filter(
      (item) => item.section === "entertainment" && catalogueSlug(item) === entry.slug,
    ),
  }));

  return (
    <>
      <EntertainmentStage
        items={ordered}
        initialId={featured?.id}
        room={category.name}
      />
      <EntertainmentGrid title={category.name} items={items} lanes={lanes} />
    </>
  );
}
