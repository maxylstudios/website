import { loadAdminMedia } from "@/app/admin/actions";
import { AdsDeskEditor } from "@/components/admin/ads-desk-editor";
import { getPageHeroes } from "@/lib/page-heroes";

export default async function AdsAdminPage() {
  const [{ items, message }, heroes] = await Promise.all([loadAdminMedia(), getPageHeroes()]);
  return <AdsDeskEditor items={items} heroes={heroes} message={message} />;
}
