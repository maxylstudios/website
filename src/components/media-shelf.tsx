import Link from "next/link";
import { MediaThumb } from "@/components/media-thumb";
import { mediaHref, type MediaItem } from "@/lib/media";

export function MediaShelf({ items }: { items: MediaItem[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted">Nothing filed here yet.</p>;
  }

  return (
    <ul className="grid grid-cols-2 items-start gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {items.map((item) => (
        <li key={item.id}>
          <Link href={mediaHref(item)} className="block">
            <MediaThumb item={item} />
            <span className="mt-2 block text-sm text-muted">{item.label}</span>
            <span className="block truncate text-base font-bold sm:text-lg">{item.title}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
