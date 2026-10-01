import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MediaShelf } from "@/components/media-shelf";
import { listPublishedMedia } from "@/lib/media";
import { adsCategory } from "@/lib/taxonomy";

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

  const uploaded = await listPublishedMedia();
  const items = uploaded.filter((item) => item.section === "ads" && item.category_slug === category.slug);

  return (
    <div className="px-5 pb-20 pt-24 sm:px-8">
      <p className="text-xs font-semibold tracking-[0.28em] text-muted uppercase">Ads</p>
      <h1 className="mt-3 text-4xl font-bold">{category.name}</h1>
      <ul className="mt-6 flex flex-wrap gap-2">
        {category.items.map((item) => (
          <li key={item.slug}>
            <Link
              href={`/ads/${category.slug}/${item.slug}`}
              className="block rounded-full border border-white/15 px-3 py-1.5 text-sm hover:border-white/40"
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-8">
        <MediaShelf items={items} />
      </div>
    </div>
  );
}
