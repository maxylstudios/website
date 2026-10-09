import Link from "next/link";
import { MediaThumb } from "@/components/media-thumb";
import { isPortraitItem, mediaHref, type MediaItem } from "@/lib/media";

export function MediaShelf({ items }: { items: MediaItem[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted">Nothing filed here yet.</p>;
  }

  return (
    <ul className="grid grid-cols-2 items-start gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {items.map((item) => {
        const portrait = isPortraitItem(item);
        return (
          <li key={item.id}>
            <Link
              href={mediaHref(item)}
              aria-label={item.kind === "video" ? "Play film" : "Open picture"}
              className="group relative block overflow-hidden rounded-2xl border border-white/20 bg-neutral-950"
            >
              <span className={`relative block overflow-hidden bg-black ${portrait ? "aspect-[2/3]" : "aspect-video"}`}>
                {item.kind === "video" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/api/poster/${item.id}`}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <MediaThumb item={item} fill className="absolute inset-0 h-full overflow-hidden rounded-none bg-black" sizes="25vw" />
                )}
                {item.kind === "video" ? (
                  <span className="pointer-events-none absolute top-1/2 left-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/25 text-white/80 backdrop-blur-[2px]" aria-hidden>
                    <svg width="9" height="11" viewBox="0 0 9 10">
                      <path d="M1.1.8v8.4L8.2 5 1.1.8Z" fill="currentColor" />
                    </svg>
                  </span>
                ) : null}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
