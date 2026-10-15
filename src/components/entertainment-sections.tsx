"use client";

import Link from "next/link";
import { Bebas_Neue, Montserrat } from "next/font/google";
import { MediaPoster } from "@/components/media-poster";
import { MediaThumb } from "@/components/media-thumb";
import { mediaHref, type MediaItem } from "@/lib/media";

const display = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-ent-display",
});

const ui = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ent-ui",
});

export type EntertainmentShelf = {
  slug: string;
  name: string;
  href: string;
  items: MediaItem[];
};

function ShelfCard({ item }: { item: MediaItem }) {
  const title = item.title?.trim() || "Untitled";

  return (
    <Link href={mediaHref(item)} className="ent-shelf-card group" aria-label={`Play ${title}`}>
      <span className="ent-shelf-frame">
        {item.kind === "video" ? (
          <MediaPoster
            item={item}
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <MediaThumb
            item={item}
            fill
            className="absolute inset-0 h-full overflow-hidden rounded-none bg-black"
            sizes="320px"
          />
        )}
        <span className="ent-shelf-veil" aria-hidden />
        <span className="ent-shelf-title">{title}</span>
      </span>
    </Link>
  );
}

function Shelf({ shelf }: { shelf: EntertainmentShelf }) {
  if (shelf.items.length === 0) return null;

  return (
    <section className="ent-shelf">
      <div className="ent-shelf-head">
        <Link href={shelf.href} className="ent-shelf-name">
          {shelf.name}
        </Link>
        <p className="ent-shelf-count">
          {shelf.items.length} title{shelf.items.length === 1 ? "" : "s"}
        </p>
      </div>
      <div className="row-scroll ent-shelf-rail">
        {shelf.items.map((item) => (
          <ShelfCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

export function EntertainmentSections({ shelves }: { shelves: EntertainmentShelf[] }) {
  const filled = shelves.filter((shelf) => shelf.items.length > 0);

  return (
    <div className={`${display.variable} ${ui.variable} ent-below`}>
      <section className="ent-intro">
        <p className="ent-intro-kicker">Entertainment</p>
        <h2 className="ent-intro-title">Stories built for the big feeling.</h2>
        <p className="ent-intro-copy">
          Films and microdramas from Maxyl — epics, thrillers, animated worlds and bingeable cuts, made at
          cinematic scale without the traditional production ceiling.
        </p>
        <div className="ent-intro-actions">
          <Link href="/entertainment/films" className="ent-play">
            Films
          </Link>
          <Link href="/entertainment/microdramas" className="ent-trailer">
            Microdramas
          </Link>
        </div>
      </section>

      {filled.map((shelf) => (
        <Shelf key={shelf.slug} shelf={shelf} />
      ))}

      <section className="ent-pitch">
        <div>
          <p className="ent-intro-kicker">Why Maxyl</p>
          <h2 className="ent-intro-title">Faster than a shoot. Bigger than a set.</h2>
        </div>
        <ul className="ent-pitch-grid">
          <li>
            <h3>More options</h3>
            <p>See your idea in many styles before you commit to one.</p>
          </li>
          <li>
            <h3>Premium, not pricey</h3>
            <p>Cinematic quality for a fraction of a traditional shoot’s cost and time.</p>
          </li>
          <li>
            <h3>Human taste</h3>
            <p>GenAI is our camera and our set. The eye behind it is ours.</p>
          </li>
        </ul>
      </section>

      <section className="ent-cta">
        <h2 className="ent-intro-title">Ready for a film?</h2>
        <p className="ent-intro-copy">
          Quoted for exactly what you need: a single film, a full campaign or an ongoing slate. You bring the
          ambition. We’ll match it.
        </p>
        <div className="ent-intro-actions">
          <Link href="/contact" className="ent-play">
            Call the studio
          </Link>
          <Link href="/ads" className="ent-trailer">
            See the ads
          </Link>
        </div>
      </section>
    </div>
  );
}
