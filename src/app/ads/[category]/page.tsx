import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdsGalleryGrid } from "@/components/ads-browse";
import { AdsHero } from "@/components/ads-hero";
import { getHiddenCategories, visibleCategories } from "@/lib/hidden-categories";
import { listPublishedMedia } from "@/lib/media";
import { adsCategoryKey, getPageHeroes, pickFeatured } from "@/lib/page-heroes";
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

  const [uploaded, heroes, hidden] = await Promise.all([
    listPublishedMedia(),
    getPageHeroes(),
    getHiddenCategories(),
  ]);
  const categories = visibleCategories("ads", hidden);
  if (!categories.some((entry) => entry.slug === category.slug)) notFound();
  const films = uploaded.filter((item) => item.section === "ads" && item.category_slug === category.slug);
  const featured = pickFeatured(films, heroes[adsCategoryKey(category.slug)]);
  const index = categories.findIndex((entry) => entry.slug === category.slug) + 1;

  return (
    <div className="bg-black">
      {featured ? (
        <AdsHero
          item={featured}
          kicker={[category.name, featured.style_tag?.trim()].filter(Boolean).join(" · ")}
        />
      ) : (
        <section className="border-b border-white/10 px-6 pb-10 pt-10 sm:px-8">
          <Link href="/ads" className="text-[11px] tracking-[0.2em] text-white/45 uppercase hover:text-white">
            ← All ads
          </Link>
          <h1 className="mt-3 text-4xl font-bold">{category.name}</h1>
          <p className="mt-3 text-sm text-white/50">
            {films.length === 0 ? "Nothing filed here yet." : `${films.length} cut${films.length === 1 ? "" : "s"}`}
          </p>
        </section>
      )}

      <div className="vault-catalogue">
        <div className="vault-row-head px-6 sm:px-8">
          <h2 className="vault-row-title">
            <span className="vault-row-num">{String(Math.max(index, 1)).padStart(2, "0")}</span>
            {category.name}
          </h2>
          <p className="vault-row-count">
            {films.length} cut{films.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="px-6 pb-20 pt-4 sm:px-8">
          <AdsGalleryGrid items={films} />
        </div>
      </div>
    </div>
  );
}
