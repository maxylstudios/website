import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About us",
  description: "Maxyl Studios makes ads, films, and AI pictures for brands.",
};

export default function AboutPage() {
  return (
    <div className="px-5 pb-20 pt-28 sm:px-10">
      <p className="text-xs font-semibold tracking-[0.28em] text-muted uppercase">About us</p>
      <h1 className="mt-3 max-w-3xl text-4xl leading-tight font-bold sm:text-6xl">
        Films and ads for brands that need to be seen.
      </h1>
      <p className="mt-6 max-w-2xl text-base leading-7 text-muted">
        Maxyl Studios produces commercials, product films, entertainment, and AI pictures.
        The work is filed under Ads and Entertainment, so a fashion film and a microdrama
        do not sit in the same pile.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/ads" className="rounded bg-white px-5 py-3 text-sm font-bold text-black">
          Browse ads
        </Link>
        <Link href="/contact" className="rounded border border-white/30 px-5 py-3 text-sm font-bold">
          Contact us
        </Link>
      </div>
    </div>
  );
}
