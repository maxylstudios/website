import type { Metadata } from "next";
import Link from "next/link";
import { entertainment } from "@/lib/taxonomy";

export const metadata: Metadata = {
  title: "Entertainment",
  description: "Microdramas, films, and other entertainment from Maxyl Studios.",
};

export default function EntertainmentPage() {
  return (
    <div className="px-5 pb-20 pt-24 sm:px-8">
      <p className="text-xs font-semibold tracking-[0.28em] text-muted uppercase">Entertainment</p>
      <h1 className="mt-3 max-w-3xl text-4xl font-bold sm:text-5xl">Microdramas, films, and series.</h1>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">
        Stories that are not ads. Open a form, then the pieces filed under it.
      </p>
      <Link href="/contact" className="mt-6 inline-block rounded bg-white px-5 py-3 text-sm font-bold text-black">
        Commission a film
      </Link>
      <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {entertainment.items.map((item) => (
          <li key={item.slug}>
            <Link
              href={`/entertainment/${item.slug}`}
              className="flex min-h-32 items-end rounded-3xl border border-white/10 px-5 py-5 text-2xl font-bold hover:border-white/40"
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
