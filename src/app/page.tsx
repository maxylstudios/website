import Link from "next/link";
import { listPublishedMedia, mediaHref, mediaPublicUrl, type MediaItem } from "@/lib/media";

function FilmCard({ item }: { item: MediaItem }) {
  return (
    <Link
      href={mediaHref(item)}
      className="group flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]"
    >
      <span className="relative block aspect-video bg-black">
        <video
          src={mediaPublicUrl(item.storage_path)}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-contain"
        />
      </span>
      <span className="flex items-end justify-between gap-4 px-5 py-4">
        <span className="min-w-0">
          <span className="block text-[11px] tracking-[0.22em] text-muted uppercase">
            {item.label || "Film"}
          </span>
          <span className="mt-1 block truncate text-xl font-bold sm:text-2xl">{item.title}</span>
        </span>
        <span className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-bold text-black">
          Play
        </span>
      </span>
    </Link>
  );
}

export default async function Home() {
  const uploaded = await listPublishedMedia();
  const films = uploaded.filter((item) => item.kind === "video").slice(0, 2);

  return (
    <div className="bg-black pt-16">
      {films.length > 0 ? (
        <>
        <section className="px-4 pt-6 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.28em] text-muted uppercase">Maxyl Studios</p>
              <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Selected films</h1>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/ads" className="rounded bg-white px-5 py-2.5 text-sm font-bold text-black">
                See the ads
              </Link>
              <Link href="/entertainment" className="rounded border border-white/30 px-5 py-2.5 text-sm font-bold">
                Entertainment
              </Link>
            </div>
          </div>
        </section>
        <section className="grid grid-cols-1 gap-4 px-4 py-5 sm:px-6 md:grid-cols-2 md:gap-5">
          {films.map((item) => (
            <FilmCard key={item.id} item={item} />
          ))}
        </section>
        </>
      ) : (
        <section className="flex min-h-[calc(100svh-4rem)] flex-col justify-end px-5 pb-12 sm:px-10">
          <p className="text-xs font-semibold tracking-[0.32em] text-muted uppercase">Maxyl Studios</p>
          <h1 className="mt-4 max-w-3xl text-5xl leading-[0.95] font-bold sm:text-7xl">
            Films from the studio.
          </h1>
          <Link href="/ads" className="mt-8 w-fit rounded bg-white px-6 py-3 text-sm font-bold text-black">
            See the ads
          </Link>
        </section>
      )}
    </div>
  );
}
