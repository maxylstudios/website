import { AdsSidebar } from "@/components/ads-sidebar";
import { getHiddenCategories, visibleCategories } from "@/lib/hidden-categories";
import { listPublishedMedia } from "@/lib/media";

export default async function AdsLayout({ children }: { children: React.ReactNode }) {
  const [uploaded, hidden] = await Promise.all([listPublishedMedia(), getHiddenCategories()]);
  const categories = visibleCategories("ads", hidden);
  const films = uploaded.filter((item) => item.section === "ads");
  const counts = Object.fromEntries(
    categories.map((category) => [
      category.slug,
      films.filter((item) => item.category_slug === category.slug).length,
    ]),
  );

  return (
    <div className="ads-desk bg-black">
      <AdsSidebar categories={categories} counts={counts} total={films.length} />
      <div className="ads-main min-w-0 flex-1">{children}</div>
    </div>
  );
}
