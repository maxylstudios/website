import { loadAdminMedia } from "@/app/admin/actions";
import { HomeArtEditor } from "@/components/admin/home-art-editor";
import { HomeBoardEditor } from "@/components/admin/home-board-editor";
import { getHomepageArt } from "@/lib/homepage-art";
import { getHomepageBoard } from "@/lib/media";

export default async function HomepageAdminPage() {
  const [{ items, message }, board, art] = await Promise.all([
    loadAdminMedia(),
    getHomepageBoard(),
    getHomepageArt(),
  ]);
  return (
    <>
      <HomeArtEditor art={art} />
      <HomeBoardEditor
        items={items}
        videoIds={board?.videoIds ?? null}
        imageIds={board?.imageIds ?? null}
        message={message}
      />
    </>
  );
}
