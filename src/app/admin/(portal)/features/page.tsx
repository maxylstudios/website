import { loadAdminMedia } from "@/app/admin/actions";
import { FeatureEditor, type FeatureSlot } from "@/components/admin/feature-editor";
import { adsCategoryKey, adsPageKey, entertainmentPageKey, entertainmentTopicKey, getPageHeroes } from "@/lib/page-heroes";
import type { MediaItem } from "@/lib/media";
import { adsCategories, entertainment } from "@/lib/taxonomy";

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
    ...entertainment.items.map((topic) => ({
      key: entertainmentTopicKey(topic.slug),
      group: "Entertainment pages",
      label: topic.name,
      selected: heroes[entertainmentTopicKey(topic.slug)] ?? "",
      choices: choices(items, (item) => item.section === "entertainment" && item.subcategory_slug === topic.slug),
    })),
  ];

  return <FeatureEditor slots={slots} message={message} />;
}
