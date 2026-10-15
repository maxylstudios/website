import { AdsSidebar } from "@/components/ads-sidebar";
import { listPublishedMedia } from "@/lib/media";
import { adsCategories } from "@/lib/taxonomy";

export default async function AdsLayout({ children }: { children: React.ReactNode }) {
  const uploaded = await listPublishedMedia();
  const films = uploaded.filter((item) => item.section === "ads");
  const counts = Object.fromEntries(
    adsCategories.map((category) => [
      category.slug,
      films.filter((item) => item.category_slug === category.slug).length,
    ]),
  );

  return (
    <div className="ads-desk bg-black">
      <AdsSidebar counts={counts} total={films.length} />
      <div className="ads-main min-w-0 flex-1">{children}</div>
    </div>
  );
}
