"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveHomepageArt } from "@/app/admin/actions";
import { uploadAdminFile } from "@/lib/admin-upload";
import { homepageArtSlots, type HomepageArt } from "@/lib/homepage-art";

export function HomeArtEditor({ art }: { art: HomepageArt }) {
  const router = useRouter();
  const [paths, setPaths] = useState(art);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function upload(slot: string, file: File) {
    setBusy(slot);
    setError("");
    try {
      const path = await uploadAdminFile(file, "image", () => {});
      const result = await saveHomepageArt(slot, path);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setPaths((current) => ({ ...current, [slot]: result.url }));
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not upload the image.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="mb-12 border-b border-white/10 pb-12">
      <p className="text-xs font-semibold tracking-[0.28em] text-[#c4b5fd] uppercase">Homepage</p>
      <h2 className="mt-2 text-3xl font-bold">Feature art</h2>
      <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
        Pictures only. The YAILIANS poster, the era still, and the three cards under the vertical shelf. Upload replaces the current image.
      </p>
      {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
      <ul className="mt-6 grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {homepageArtSlots.map((slot) => {
          const src = paths[slot.id];
          return (
            <li key={slot.id} className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
              <div className="relative aspect-[16/10] overflow-hidden bg-black">
                {src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <p className="absolute inset-0 flex items-center justify-center text-xs tracking-[0.16em] text-white/35 uppercase">No image yet</p>
                )}
              </div>
              <div className="flex items-end justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="text-sm font-bold">{slot.label}</p>
                  <p className="mt-1 text-xs leading-5 text-muted">{slot.hint}</p>
                </div>
                <label className="relative shrink-0 cursor-pointer overflow-hidden rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-black">
                  {busy === slot.id ? "Uploading" : src ? "Replace" : "Upload"}
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 cursor-pointer opacity-0"
                    disabled={busy !== null}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      event.target.value = "";
                      if (file) void upload(slot.id, file);
                    }}
                  />
                </label>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
