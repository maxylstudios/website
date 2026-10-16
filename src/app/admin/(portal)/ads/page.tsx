import { loadAdminMedia } from "@/app/admin/actions";
import { AdsDeskEditor } from "@/components/admin/ads-desk-editor";
import { getHiddenCategories } from "@/lib/hidden-categories";
import { getPageHeroes } from "@/lib/page-heroes";

export default async function AdsAdminPage() {
  const [{ items, message }, heroes, hidden] = await Promise.all([
    loadAdminMedia(),
    getPageHeroes(),
    getHiddenCategories(),
  ]);
  return <AdsDeskEditor items={items} heroes={heroes} hidden={hidden} message={message} />;
}
