import type { Metadata } from "next";
import Link from "next/link";
import { adsCategories } from "@/lib/taxonomy";

export const metadata: Metadata = {
  title: "Ads",
  description: "Advertising categories at Maxyl Studios.",
};

export default function AdsPage() {
  return (
    <div className="px-5 pb-20 pt-24 sm:px-8">
      <p className="text-xs font-semibold tracking-[0.28em] text-muted uppercase">Ads</p>
      <h1 className="mt-3 max-w-3xl text-4xl font-bold sm:text-5xl">Catalogue categories</h1>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">
        Fourteen shelves. Open one to see the work filed there, then narrow it by subcategory.
      </p>
      <Link href="/contact" className="mt-6 inline-block rounded bg-white px-5 py-3 text-sm font-bold text-black">
        Commission an ad
      </Link>
      <ol className="mt-10 grid gap-3 sm:grid-cols-2">
        {adsCategories.map((category, index) => (
          <li key={category.slug}>
            <Link
              href={`/ads/${category.slug}`}
              className="block h-full rounded-3xl border border-white/10 px-5 py-5 hover:border-white/40"
            >
              <span className="text-xs text-muted">{String(index + 1).padStart(2, "0")}</span>
              <span className="mt-2 block text-xl font-bold">{category.name}</span>
              <span className="mt-2 block text-sm leading-6 text-muted">
                {category.items.map((item) => item.name).join(", ")}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
