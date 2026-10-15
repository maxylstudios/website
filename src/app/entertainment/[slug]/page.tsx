import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { EntertainmentSections } from "@/components/entertainment-sections";
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

  const shelves = entertainmentCategories.map((entry) => ({
    slug: entry.slug,
    name: entry.name,
    href: `/entertainment/${entry.slug}`,
    items:
      entry.slug === category.slug
        ? items
        : uploaded.filter(
            (item) => item.section === "entertainment" && catalogueSlug(item) === entry.slug,
          ),
  }));

  return (
    <>
      <EntertainmentStage items={ordered} initialId={featured?.id} />
      <EntertainmentSections shelves={shelves} />
    </>
  );
}
