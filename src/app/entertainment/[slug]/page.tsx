import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { HomeBillboard } from "@/components/home-billboard";
import { MediaShelf } from "@/components/media-shelf";
import { SectionLinks } from "@/components/section-links";
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
  const links = entertainmentCategories.map((item) => ({
    href: `/entertainment/${item.slug}`,
    label: item.name,
  }));

  return (
    <div className="bg-black">
      {featured ? (
        <HomeBillboard item={featured} kicker={category.name} blurb={null} links={links} />
      ) : (
        <section className="px-5 pb-6 pt-28 sm:px-8">
          <Link href="/entertainment" className="text-xs tracking-[0.22em] text-muted uppercase">
            Entertainment
          </Link>
          <h1 className="mt-3 text-4xl font-bold">{category.name}</h1>
          <SectionLinks className="mt-6" currentHref={`/entertainment/${category.slug}`} links={links} />
        </section>
      )}
      <div className="px-5 pb-20 pt-8 sm:px-8">
        <MediaShelf items={items} />
      </div>
    </div>
  );
}
