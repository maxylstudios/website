import { loadAdminMedia } from "@/app/admin/actions";
import { EntertainmentDeskEditor } from "@/components/admin/entertainment-desk-editor";
import { getPageHeroes } from "@/lib/page-heroes";

export default async function EntertainmentAdminPage() {
  const [{ items, message }, heroes] = await Promise.all([loadAdminMedia(), getPageHeroes()]);
  return <EntertainmentDeskEditor items={items} heroes={heroes} message={message} />;
}
