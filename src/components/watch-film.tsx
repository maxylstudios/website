import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FilmPlayer } from "@/components/film-player";
import { frameStyleForItem, getPublishedMedia, isFiled, isPortraitItem, mediaHref, mediaPublicUrl, objectPosition } from "@/lib/media";
import { placeLabel } from "@/lib/taxonomy";

export async function WatchFilm({ id }: { id: string }) {
  const item = await getPublishedMedia(id);
  if (!item) notFound();

  const url = mediaPublicUrl(item.storage_path);
  const place = placeLabel(item.section, item.category_slug, item.subcategory_slug);
  const back = mediaHref(item).split("/").slice(0, -1).join("/") || "/misc";
  const frame = frameStyleForItem(item);
  const portrait = isPortraitItem(item);

  return (
    <article className="min-h-[calc(100svh-4rem)] bg-black pt-20 pb-16 sm:pt-24">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <Link
          href={back}
          className="inline-flex items-center gap-2 text-xs tracking-[0.2em] text-[#c4b5fd] uppercase transition-colors hover:text-white"
        >
          <span aria-hidden className="text-base leading-none">
            ←
          </span>
          {isFiled(item) ? place : "Misc"}
        </Link>

        <div className={`mt-5 sm:mt-7 ${portrait ? "mx-auto max-w-md sm:max-w-lg" : "w-full"}`}>
          {item.kind === "video" ? (
            <FilmPlayer
              src={url}
              title={item.title}
              poster={item.poster_path ? mediaPublicUrl(item.poster_path) : `/api/poster/${item.id}`}
              initialRatio={frame.aspectRatio}
            />
          ) : (
            <div
              className="relative overflow-hidden rounded-2xl border border-white/15 bg-neutral-950 shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
              style={frame}
            >
              <Image
                src={url}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 100vw, 960px"
                className="object-contain"
                style={{ objectPosition: objectPosition(item.crop) }}
                unoptimized
              />
            </div>
          )}
        </div>

        <div className={`mt-6 sm:mt-8 ${portrait ? "mx-auto max-w-md text-center sm:max-w-lg" : "max-w-3xl"}`}>
          <h1 className="sr-only">{item.title}</h1>
          {item.caption ? <p className="text-sm leading-7 text-muted sm:text-base">{item.caption}</p> : null}
        </div>
      </div>
    </article>
  );
}
