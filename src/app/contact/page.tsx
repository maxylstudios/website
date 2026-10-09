import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Call Sushmith or Nitika at Maxyl Studios.",
};

const people = [
  { name: "Sushmith", phone: "+91 9606558600", tel: "+919606558600" },
  { name: "Nitika", phone: "+91 81978 53851", tel: "+918197853851" },
];

export default function ContactPage() {
  return (
    <div className="bg-black px-5 pb-20 pt-28 sm:px-10">
      <p className="text-xs font-semibold tracking-[0.32em] text-[#c4b5fd] uppercase">Contact</p>
      <h1 className="mt-4 max-w-3xl text-5xl leading-[0.95] font-bold sm:text-7xl">Call the studio.</h1>
      <p className="mt-5 max-w-xl text-base leading-7 text-white/70">
        Two people answer. Pick one and the phone opens.
      </p>

      <ul className="mt-12 grid gap-5 md:grid-cols-2">
        {people.map((person) => (
          <li key={person.tel}>
            <a
              href={`tel:${person.tel}`}
              className="group relative block overflow-hidden rounded-[1.6rem] border border-white/30 bg-black p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_22px_50px_rgba(0,0,0,0.45),0_0_36px_rgba(139,92,246,0.22)] sm:p-9"
            >
              <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(160deg,rgba(255,255,255,0.16),transparent_34%,rgba(139,92,246,0.16))]" />
              <span className="relative text-xs font-semibold tracking-[0.28em] text-[#c4b5fd] uppercase">Call</span>
              <span className="relative mt-10 block text-4xl font-bold sm:text-5xl">{person.name}</span>
              <span className="relative mt-4 block text-xl tracking-wide text-white/85 sm:text-2xl">{person.phone}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
