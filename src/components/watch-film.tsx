import Image from "next/image";
import Link from "next/link";
import { Montserrat } from "next/font/google";
import { notFound } from "next/navigation";
import { FilmPlayer } from "@/components/film-player";
import { entertainmentDossier, partnerLabel } from "@/lib/entertainment-dossier";
import {
  frameStyleForItem,
  getPublishedMedia,
  isExternalUrl,
  isFiled,
  isPortraitItem,
  mediaHref,
  mediaPublicUrl,
  objectPosition,
  type MediaItem,
} from "@/lib/media";
import { placeLabel } from "@/lib/taxonomy";

const dossierFont = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export async function WatchFilm({ id }: { id: string }) {
  const item = await getPublishedMedia(id);
  if (!item) notFound();

  const url = mediaPublicUrl(item.storage_path);
  const place = placeLabel(item.section, item.category_slug, item.subcategory_slug);
  const back = mediaHref(item).split("/").slice(0, -1).join("/") || "/misc";
  const frame = frameStyleForItem(item);
  const portrait = isPortraitItem(item);

  if (item.section === "entertainment") {
    return <EntertainmentWatch item={item} url={url} back={back} frame={frame} portrait={portrait} />;
  }

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
          {isExternalUrl(item.external_url) ? (
            <a
              href={isExternalUrl(item.external_url)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-xs font-bold tracking-[0.08em] uppercase text-white transition hover:border-white/50"
            >
              Open link
              <span aria-hidden>↗</span>
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function EntertainmentWatch({
  item,
  url,
  back,
  frame,
  portrait,
}: {
  item: MediaItem;
  url: string;
  back: string;
  frame: { aspectRatio: string };
  portrait: boolean;
}) {
  const title = item.title?.trim() || "Untitled";
  const dossier = entertainmentDossier(item);
  const realUrl = isExternalUrl(item.external_url);
  const partner = partnerLabel(realUrl || dossier.url, dossier.room);
  const kuku = partner === "Kuku FM";
  const films = dossier.room === "Films";

  return (
    <article className={`${dossierFont.className} min-h-[calc(100svh-4rem)] bg-[#050505] pt-20 pb-16 text-white sm:pt-24`}>
      <div
        className={`mx-auto grid w-full items-start gap-8 px-4 sm:gap-10 sm:px-6 lg:px-8 ${
          portrait
            ? "max-w-5xl lg:grid-cols-[minmax(16rem,28rem)_minmax(18rem,1fr)]"
            : "max-w-6xl lg:grid-cols-[minmax(0,1.2fr)_minmax(22rem,0.9fr)]"
        }`}
      >
        <div className={`min-w-0 ${portrait ? "mx-auto w-full max-w-md lg:mx-0" : "w-full"}`}>
          {item.kind === "video" ? (
            <FilmPlayer
              src={url}
              title={title}
              poster={item.poster_path ? mediaPublicUrl(item.poster_path) : `/api/poster/${item.id}`}
              initialRatio={frame.aspectRatio}
            />
          ) : (
            <div className="relative overflow-hidden bg-neutral-950" style={frame}>
              <Image
                src={url}
                alt={title}
                fill
                sizes="(max-width: 1024px) 100vw, 720px"
                className="object-contain"
                style={{ objectPosition: objectPosition(item.crop) }}
                unoptimized
              />
            </div>
          )}
        </div>

        <aside className="min-w-0 lg:sticky lg:top-24 lg:pt-1">
          <Link href={back} className="case-kicker transition hover:text-white">
            ← {dossier.room}
          </Link>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.03em] sm:text-[2.15rem] sm:leading-[1.15]">{title}</h1>
          <ul className="case-tags">
            <li>{dossier.client}</li>
            <li>{dossier.role}</li>
            <li>{dossier.style}</li>
          </ul>
          <p className="mt-4 text-sm leading-7 text-white/75">{dossier.caption}</p>
          {films ? null : (
            <dl className="case-credits">
              <div>
                <dt>Studio</dt>
                <dd>Maxyl Studios</dd>
              </div>
              <div>
                <dt>Format</dt>
                <dd>{dossier.room}</dd>
              </div>
              <div>
                <dt>Look</dt>
                <dd>{dossier.style}</dd>
              </div>
              <div>
                <dt>Partner</dt>
                <dd>{partner}</dd>
              </div>
            </dl>
          )}
          {realUrl ? (
            <div className="case-actions">
              <a href={realUrl} target="_blank" rel="noopener noreferrer" className="case-out">
                {kuku ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src="/kuku-fm-mark.png" alt="" className="case-mark" />
                ) : null}
                <span>{kuku ? "Open on Kuku FM" : "Open link"}</span>
                <span aria-hidden>↗</span>
              </a>
            </div>
          ) : null}
        </aside>
      </div>
    </article>
  );
}
