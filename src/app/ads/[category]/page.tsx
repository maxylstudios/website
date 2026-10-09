import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EntertainmentBrowse } from "@/components/entertainment-browse";
import { HomeBillboard } from "@/components/home-billboard";
import { SectionLinks } from "@/components/section-links";
import { listPublishedMedia } from "@/lib/media";
import { adsCategoryKey, getPageHeroes, pickFeatured } from "@/lib/page-heroes";
import { adsCategory, topicIn } from "@/lib/taxonomy";

type PageProps = {
  params: Promise<{ category: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  return { title: adsCategory(category)?.name ?? "Ads" };
}

export default async function AdsCategoryPage({ params }: PageProps) {
  const { category: slug } = await params;
  const category = adsCategory(slug);
  if (!category) notFound();

  const [uploaded, heroes] = await Promise.all([listPublishedMedia(), getPageHeroes()]);
  const films = uploaded.filter((item) => item.section === "ads" && item.category_slug === category.slug);
  const featured = pickFeatured(films, heroes[adsCategoryKey(category.slug)]);
  const featuredTopic = featured ? topicIn(category, featured.subcategory_slug) : null;

  const rows = category.items.map((topic) => ({
    slug: topic.slug,
    name: topic.name,
    href: `/ads/${category.slug}/${topic.slug}`,
    items: films.filter((item) => item.subcategory_slug === topic.slug),
  }));

  const links = category.items.map((topic) => ({
    href: `/ads/${category.slug}/${topic.slug}`,
    label: topic.name,
  }));

  return (
    <div className="bg-black">
      {featured ? (
        <HomeBillboard
          item={featured}
          kicker={featuredTopic ? `${category.name} · ${featuredTopic.name}` : category.name}
          blurb={null}
          links={links}
        />
      ) : (
        <section className="px-5 pb-6 pt-28 sm:px-8">
          <Link href="/ads" className="text-xs tracking-[0.22em] text-muted uppercase">
            Ads
          </Link>
          <h1 className="mt-3 text-4xl font-bold sm:text-5xl">{category.name}</h1>
          <SectionLinks className="mt-8" links={links} />
        </section>
      )}
      <EntertainmentBrowse rows={rows} />
    </div>
  );
}
