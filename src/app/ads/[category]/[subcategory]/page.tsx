import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MediaShelf } from "@/components/media-shelf";
import { SectionLinks } from "@/components/section-links";
import { listPublishedMedia } from "@/lib/media";
import { adsCategory, topicIn } from "@/lib/taxonomy";

type PageProps = {
  params: Promise<{ category: string; subcategory: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category, subcategory } = await params;
  const group = adsCategory(category);
  const topic = group ? topicIn(group, subcategory) : null;
  return { title: topic?.name ?? "Ads" };
}

export default async function AdsSubcategoryPage({ params }: PageProps) {
  const { category: categorySlug, subcategory: subcategorySlug } = await params;
  const category = adsCategory(categorySlug);
  const topic = category ? topicIn(category, subcategorySlug) : null;
  if (!category || !topic) notFound();

  const uploaded = await listPublishedMedia();
  const items = uploaded.filter(
    (item) =>
      item.section === "ads" &&
      item.category_slug === category.slug &&
      item.subcategory_slug === topic.slug,
  );

  return (
    <div className="px-5 pb-20 pt-24 sm:px-8">
      <Link href={`/ads/${category.slug}`} className="text-xs tracking-[0.22em] text-muted uppercase">
        {category.name}
      </Link>
      <h1 className="mt-3 text-4xl font-bold">{topic.name}</h1>
      <SectionLinks
        className="mt-6"
        currentHref={`/ads/${category.slug}/${topic.slug}`}
        links={category.items.map((item) => ({
          href: `/ads/${category.slug}/${item.slug}`,
          label: item.name,
        }))}
      />
      <div className="mt-8">
        <MediaShelf items={items} />
      </div>
    </div>
  );
}
