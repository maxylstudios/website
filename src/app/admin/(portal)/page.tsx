import { loadAdminMedia } from "@/app/admin/actions";
import { AdminLibrary } from "@/components/admin/admin-library";

export default async function AdminHome() {
  const { items, message } = await loadAdminMedia();
  return <AdminLibrary items={items} message={message} />;
}
