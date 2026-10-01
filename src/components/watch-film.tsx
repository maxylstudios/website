import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FilmPlayer } from "@/components/film-player";
import { aspectRatioStyle, getPublishedMedia, isFiled, mediaHref, mediaPublicUrl, objectPosition } from "@/lib/media";
import { placeLabel } from "@/lib/taxonomy";

export async function WatchFilm({ id }: { id: string }) {
  const item = await getPublishedMedia(id);
  if (!item) notFound();

  const url = mediaPublicUrl(item.storage_path);
  const place = placeLabel(item.section, item.category_slug, item.subcategory_slug);
  const back = mediaHref(item).split("/").slice(0, -1).join("/") || "/misc";
  const frame = aspectRatioStyle(item.aspect === "free" ? "16:9" : item.aspect);

  return (
    <article className="pb-16 pt-24">
      <div className="px-4 sm:px-8">
        <Link href={back} className="text-xs tracking-[0.22em] text-muted uppercase">
          {isFiled(item) ? place : "Misc"}
        </Link>
        <h1 className="mt-3 text-4xl font-bold sm:text-5xl">{item.title}</h1>
        {item.caption ? <p className="mt-4 text-base leading-7 text-muted">{item.caption}</p> : null}
      </div>
      <div className="mt-6 w-full">
        {item.kind === "video" ? (
          <FilmPlayer src={url} title={item.title} />
        ) : (
          <div className="relative overflow-hidden rounded-3xl bg-black" style={frame}>
            <Image
              src={url}
              alt={item.title}
              fill
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: objectPosition(item.crop) }}
            />
          </div>
        )}
      </div>
    </article>
  );
}
