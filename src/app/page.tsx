import Link from "next/link";
import { HomeBillboard } from "@/components/home-billboard";
import { HomeShelves } from "@/components/home-shelves";
import { getHomepageArt } from "@/lib/homepage-art";
import { arrangeHomepage, getHeroVideo, getHomepageBoard, heroAsMediaItem, isPortraitItem, listPublishedMedia } from "@/lib/media";

export default async function Home() {
  const [hero, published, board, art] = await Promise.all([
    getHeroVideo(),
    listPublishedMedia(),
    getHomepageBoard(),
    getHomepageArt(),
  ]);
  const { videos } = arrangeHomepage(published, board);
  const featured = videos.find((item) => !isPortraitItem(item)) ?? videos[0] ?? null;

  return (
    <div className="bg-black">
      {hero ? (
        <HomeBillboard item={heroAsMediaItem(hero.storage_path)} layout="stage" playHref={null} showMark={false} />
      ) : featured ? (
        <HomeBillboard item={featured} layout="stage" showMark={false} />
      ) : (
        <section className="flex min-h-[calc(100svh-4rem)] flex-col justify-end px-5 pb-12 pt-24 sm:px-10">
          <p className="text-xs font-semibold tracking-[0.32em] text-muted uppercase">Maxyl Studios</p>
          <h1 className="mt-4 max-w-3xl text-5xl leading-[0.95] font-bold sm:text-7xl">Films from the studio.</h1>
          <Link href="/ads" className="mt-8 w-fit rounded bg-white px-6 py-3 text-sm font-bold text-black">
            See the ads
          </Link>
        </section>
      )}
      <HomeShelves videos={videos} art={art} />
    </div>
  );
}
