import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing",
  description: "How Maxyl Studios quotes a film, a campaign, or an ongoing slate.",
};

const offers = [
  {
    title: "A single film",
    text: "One ad, product film, or short. You get a quote for that piece, not a package you do not need.",
  },
  {
    title: "A campaign",
    text: "Several cuts from one world: a hero film, cutdowns, and stills, filed in the right category.",
  },
  {
    title: "An ongoing slate",
    text: "A run of films across ads or entertainment. The studio keeps the look consistent from piece to piece.",
  },
];

export default function PricingPage() {
  return (
    <div className="px-5 pb-20 pt-28 sm:px-10">
      <p className="text-xs font-semibold tracking-[0.28em] text-muted uppercase">Pricing</p>
      <h1 className="mt-3 max-w-3xl text-4xl leading-tight font-bold sm:text-6xl">
        Quoted for the film, not a menu of prices.
      </h1>
      <p className="mt-6 max-w-2xl text-base leading-7 text-muted">
        Length, cast, and how many versions you need change the cost. Tell us the category
        and the category, and we reply with a quote.
      </p>
      <ul className="mt-10 grid gap-4 md:grid-cols-3">
        {offers.map((offer) => (
          <li key={offer.title} className="rounded-3xl border border-white/10 px-5 py-6">
            <h2 className="text-xl font-bold">{offer.title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted">{offer.text}</p>
          </li>
        ))}
      </ul>
      <Link href="/contact" className="mt-8 inline-block rounded bg-white px-5 py-3 text-sm font-bold text-black">
        Ask for a quote
      </Link>
    </div>
  );
}
