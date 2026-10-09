import { loadAdminMedia } from "@/app/admin/actions";
import { FeatureEditor, type FeatureSlot } from "@/components/admin/feature-editor";
import { adsCategoryKey, adsPageKey, entertainmentPageKey, entertainmentTopicKey, getPageHeroes } from "@/lib/page-heroes";
import { catalogueSlug, type MediaItem } from "@/lib/media";
import { adsCategories, entertainmentCategories } from "@/lib/taxonomy";

function choices(items: MediaItem[], match: (item: MediaItem) => boolean) {
  return items
    .filter((item) => item.kind === "video" && match(item))
    .map((item) => ({ id: item.id, title: item.title, published: item.published }));
}

export default async function FeaturesAdminPage() {
  const [{ items, message }, heroes] = await Promise.all([loadAdminMedia(), getPageHeroes()]);

  const slots: FeatureSlot[] = [
    {
      key: adsPageKey(),
      group: "Ads",
      label: "Ads",
      selected: heroes[adsPageKey()] ?? "",
      choices: choices(items, (item) => item.section === "ads"),
    },
    ...adsCategories.map((category) => ({
      key: adsCategoryKey(category.slug),
      group: "Ads pages",
      label: category.name,
      selected: heroes[adsCategoryKey(category.slug)] ?? "",
      choices: choices(items, (item) => item.section === "ads" && item.category_slug === category.slug),
    })),
    {
      key: entertainmentPageKey(),
      group: "Entertainment",
      label: "Entertainment",
      selected: heroes[entertainmentPageKey()] ?? "",
      choices: choices(items, (item) => item.section === "entertainment"),
    },
    ...entertainmentCategories.map((category) => ({
      key: entertainmentTopicKey(category.slug),
      group: "Entertainment pages",
      label: category.name,
      selected: heroes[entertainmentTopicKey(category.slug)] ?? "",
      choices: choices(items, (item) => item.section === "entertainment" && catalogueSlug(item) === category.slug),
    })),
  ];

  return <FeatureEditor slots={slots} message={message} />;
}
