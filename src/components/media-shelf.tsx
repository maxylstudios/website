import Image from "next/image";
import Link from "next/link";
import { mediaHref, mediaPublicUrl, objectPosition, type MediaItem } from "@/lib/media";

export function MediaShelf({ items }: { items: MediaItem[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted">Nothing filed here yet.</p>;
  }

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item.id}>
          <Link href={mediaHref(item)} className="block">
            <span className="relative block aspect-video overflow-hidden rounded-2xl bg-neutral-950">
              {item.kind === "video" ? (
                <video
                  src={mediaPublicUrl(item.storage_path)}
                  muted
                  playsInline
                  preload="metadata"
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{ objectPosition: objectPosition(item.crop) }}
                />
              ) : (
                <Image
                  src={mediaPublicUrl(item.storage_path)}
                  alt=""
                  fill
                  sizes="(min-width: 640px) 40vw, 100vw"
                  className="object-cover"
                  style={{ objectPosition: objectPosition(item.crop) }}
                />
              )}
            </span>
            <span className="mt-2 block text-sm text-muted">{item.label}</span>
            <span className="block truncate text-lg font-bold">{item.title}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
