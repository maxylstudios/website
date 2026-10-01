import Image from "next/image";
import Link from "next/link";
import {
  aspectRatioStyle,
  mediaHref,
  mediaPublicUrl,
  objectPosition,
  type MediaItem,
} from "@/lib/media";

export function MediaCard({ item }: { item: MediaItem }) {
  const url = mediaPublicUrl(item.storage_path);
  const frame =
    item.kind === "video" || item.aspect !== "free"
      ? aspectRatioStyle(item.aspect === "free" ? "16:9" : item.aspect)
      : item.width && item.height
        ? { aspectRatio: `${item.width} / ${item.height}` }
        : aspectRatioStyle("16:9");

  return (
    <Link href={mediaHref(item)} className="group block w-64 shrink-0 md:w-72">
      <div className="relative overflow-hidden rounded-md bg-neutral-950" style={frame}>
        {item.kind === "video" ? (
          <video
            src={url}
            muted
            playsInline
            className="h-full w-full object-cover"
            style={{ objectPosition: objectPosition(item.crop) }}
          />
        ) : (
          <Image
            src={url}
            alt=""
            fill
            sizes="288px"
            className="object-cover"
            style={{ objectPosition: objectPosition(item.crop) }}
          />
        )}
      </div>
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
          <ul className="row-scroll flex gap-3 overflow-x-auto px-4 pb-2 md:px-8">
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
