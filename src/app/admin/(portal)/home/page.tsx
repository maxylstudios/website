import { loadAdminMedia } from "@/app/admin/actions";
import { HomeBoardEditor } from "@/components/admin/home-board-editor";
import { getHomepageBoard } from "@/lib/media";

export default async function HomepageAdminPage() {
  const [{ items, message }, board] = await Promise.all([loadAdminMedia(), getHomepageBoard()]);
  return (
    <HomeBoardEditor
      items={items}
      videoIds={board?.videoIds ?? null}
      imageIds={board?.imageIds ?? null}
      message={message}
    />
  );
}
