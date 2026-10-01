import Image from "next/image";
import Link from "next/link";
import { loadAdminMedia } from "@/app/admin/actions";
import { mediaPublicUrl } from "@/lib/media";
import { placeLabel } from "@/lib/taxonomy";

export default async function AdminHome() {
  const { items, message } = await loadAdminMedia();

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Uploads</h1>
          <p className="mt-2 text-sm text-muted">
            Images stay in Supabase. Videos are stored in the maxylstudios folder on S3 and framed on the site.
          </p>
        </div>
        <Link href="/admin/media/new" className="rounded bg-ember px-4 py-2 text-sm font-bold">
          Upload
        </Link>
      </div>

      {message ? <p className="mt-4 text-sm text-ember">{message}</p> : null}

      {items.length === 0 ? (
        <p className="mt-10 text-sm text-muted">Nothing uploaded yet.</p>
      ) : (
        <ul className="mt-8 divide-y divide-white/10">
          {items.map((item) => (
            <li key={item.id}>
              <Link href={`/admin/media/${item.id}`} className="flex items-center gap-4 py-4">
                {item.kind === "image" ? (
                  <Image
                    src={mediaPublicUrl(item.storage_path)}
                    alt=""
                    width={112}
                    height={64}
                    className="h-16 w-28 rounded object-cover"
                  />
                ) : (
                  <span className="flex h-16 w-28 items-center justify-center rounded bg-white/10 text-xs">
                    Video
                  </span>
                )}
                <span>
                  <span className="block font-semibold">{item.title}</span>
                  <span className="text-sm text-muted">
                    {placeLabel(item.section ?? "", item.category_slug ?? "", item.subcategory_slug ?? "")} ·{" "}
                    {item.published ? "Live" : "Hidden"}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
