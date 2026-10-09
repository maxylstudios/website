import Link from "next/link";
import { MediaThumb } from "@/components/media-thumb";
import { mediaHref, type MediaItem } from "@/lib/media";

export function MediaCard({ item }: { item: MediaItem }) {
  return (
    <Link href={mediaHref(item)} className="group block w-44 shrink-0 sm:w-52 md:w-56">
      <MediaThumb
        item={item}
        className="overflow-hidden rounded-md bg-neutral-950"
        sizes="224px"
      />
      <p className="mt-2 truncate text-sm font-semibold">{item.title}</p>
      <p className="truncate text-xs text-muted">
        {item.label || "Unlabelled"} · {item.kind}
      </p>
    </Link>
  );
}

export function MediaRows({ items }: { items: MediaItem[] }) {
  const groups = new Map<string, MediaItem[]>();
  for (const item of items) {
    const label = item.label.trim() || "Unlabelled";
    groups.set(label, [...(groups.get(label) ?? []), item]);
  }

  return (
    <div className="mt-4">
      {[...groups.entries()].map(([label, list]) => (
        <section key={label} className="mt-8">
          <h2 className="mb-3 px-4 text-lg font-semibold md:px-8">{label}</h2>
          <ul className="row-scroll flex items-start gap-3 overflow-x-auto px-4 pb-2 md:px-8">
            {list.map((item) => (
              <li key={item.id}>
                <MediaCard item={item} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
