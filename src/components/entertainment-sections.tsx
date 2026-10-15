"use client";

import Link from "next/link";
import { Montserrat } from "next/font/google";
import { MediaPoster } from "@/components/media-poster";
import { MediaThumb } from "@/components/media-thumb";
import { entertainmentDossier, partnerLabel } from "@/lib/entertainment-dossier";
import { isExternalUrl, mediaHref, type MediaItem } from "@/lib/media";

const ui = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ent-ui",
});

export type EntertainmentLane = {
  slug: string;
  name: string;
  href: string;
  blurb: string;
  items: MediaItem[];
};

function Still({ item }: { item: MediaItem }) {
  if (item.kind === "video") {
    return <MediaPoster item={item} className="absolute inset-0 h-full w-full object-cover" />;
  }
  return (
    <MediaThumb
      item={item}
      fill
      className="absolute inset-0 h-full overflow-hidden rounded-none bg-black"
      sizes="480px"
    />
  );
}

function CaseStudy({ item }: { item: MediaItem }) {
  const title = item.title?.trim() || "Untitled";
  const dossier = entertainmentDossier(item);
  const realUrl = isExternalUrl(item.external_url);
  const partner = partnerLabel(realUrl || dossier.url, dossier.room);
  const kuku = partner === "Kuku FM";
  const href = mediaHref(item);
  const films = dossier.room === "Films";

  return (
    <article className="case">
      <p className="case-kicker">{dossier.room}</p>
      <h3 className="case-title">
        <Link href={href}>{title}</Link>
      </h3>
      <Link href={href} className="case-still" aria-label={`Watch ${title}`}>
        <Still item={item} />
      </Link>
      <ul className="case-tags">
        <li>{dossier.client}</li>
        <li>{dossier.role}</li>
        <li>{dossier.style}</li>
      </ul>
      <p className="case-body">{dossier.caption}</p>
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
      <div className="case-actions">
        <Link href={href} className="case-watch">
          Watch
        </Link>
        {realUrl ? (
          <a href={realUrl} target="_blank" rel="noopener noreferrer" className="case-out">
            {kuku ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/kuku-fm-mark.png" alt="" className="case-mark" />
            ) : null}
            <span>{kuku ? "Open on Kuku FM" : "Open link"}</span>
            <span aria-hidden>↗</span>
          </a>
        ) : null}
      </div>
    </article>
  );
}

function CaseRail({ items }: { items: MediaItem[] }) {
  if (items.length === 0) {
    return <p className="case-empty">Nothing filed in this room yet.</p>;
  }
  return (
    <div className="case-rail">
      {items.map((item) => (
        <CaseStudy key={item.id} item={item} />
      ))}
    </div>
  );
}

export function EntertainmentNav({ lanes }: { lanes: EntertainmentLane[] }) {
  const ordered = [...lanes].sort((a, b) => {
    if (a.slug === "microdramas") return -1;
    if (b.slug === "microdramas") return 1;
    return 0;
  });

  return (
    <div className={`${ui.variable} case-wrap`}>
      {ordered.map((lane) => (
        <section key={lane.slug} className="case-room" aria-label={lane.name}>
          <header className="case-head">
            <div>
              <p className="case-eyebrow">{lane.items.length} titles</p>
              <h2 className="case-heading">{lane.name}</h2>
            </div>
            <Link href={lane.href} className="case-filter case-filter-on">
              See all
            </Link>
          </header>
          <CaseRail items={lane.items} />
        </section>
      ))}
    </div>
  );
}

export function EntertainmentGrid({
  title,
  items,
  lanes,
}: {
  title: string;
  items: MediaItem[];
  lanes: EntertainmentLane[];
}) {
  return (
    <div className={`${ui.variable} case-wrap`}>
      <header className="case-head">
        <div>
          <p className="case-eyebrow">The slate</p>
          <h2 className="case-heading">{title}</h2>
        </div>
        <nav className="case-filters" aria-label="Rooms">
          <Link href="/entertainment" className="case-filter">
            All
          </Link>
          {lanes.map((lane) => (
            <Link
              key={lane.slug}
              href={lane.href}
              className={lane.name === title ? "case-filter case-filter-on" : "case-filter"}
            >
              {lane.name}
              <span>{lane.items.length}</span>
            </Link>
          ))}
        </nav>
      </header>
      <CaseRail items={items} />
    </div>
  );
}
