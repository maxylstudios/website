import type { Metadata } from "next";
import { MediaShelf } from "@/components/media-shelf";
import { isFiled, listPublishedMedia } from "@/lib/media";

export const metadata: Metadata = {
  title: "Misc",
  description: "Films and stills that are not filed in a category yet.",
};

export default async function MiscPage() {
  const uploaded = await listPublishedMedia();
  const items = uploaded.filter((item) => !isFiled(item));

  return (
    <div className="px-5 pb-20 pt-24 sm:px-8">
      <p className="text-xs font-semibold tracking-[0.28em] text-muted uppercase">Misc</p>
      <h1 className="mt-3 text-4xl font-bold">Unfiled work</h1>
      <p className="mt-4 max-w-xl text-sm leading-6 text-muted">
        Anything without an Ads category or an Entertainment page lands here.
      </p>
      <div className="mt-8">
        <MediaShelf items={items} />
      </div>
    </div>
  );
}
