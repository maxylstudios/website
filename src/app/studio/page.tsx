import type { Metadata } from "next";
import Link from "next/link";
import { disciplines, projects } from "@/lib/catalogue";

export const metadata: Metadata = {
  title: "Studio",
  description: "How Maxyl Studios organises its portfolio catalogue.",
};

const notes = [
  {
    title: "One volume",
    text: "Everything public lives in this site. The index, the plates, and the enquiry form are one Next.js app, not a set of separate services.",
  },
  {
    title: "Four disciplines",
    text: "Work is filed as identity, digital, editorial, or spatial. A project can touch more than one, and it is listed under the one that leads.",
  },
  {
    title: "Replace the plates",
    text: "The nine entries are a starter catalogue. Swap titles, clients, and copy in the catalogue file when the real work is ready.",
  },
];

export default function StudioPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-14 md:px-8 md:py-20">
      <p className="text-[11px] tracking-[0.24em] text-muted uppercase">Studio</p>
      <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[0.95] tracking-tight md:text-6xl">
        A practice that files its work.
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
        Maxyl Studios makes identities, sites, publications, and spaces, then
        keeps them in a catalogue you can leaf through. {projects.length} plates
        are in this volume, across {disciplines.join(", ").toLowerCase()}.
      </p>

      <ul className="mt-14 grid gap-10 border-t border-line pt-10 md:grid-cols-3">
        {notes.map((note, index) => (
          <li key={note.title}>
            <p className="text-[11px] tracking-[0.18em] text-muted">
              0{index + 1}
            </p>
            <h2 className="mt-3 font-serif text-2xl">{note.title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted">{note.text}</p>
          </li>
        ))}
      </ul>

      <Link
        href="/contact"
        className="mt-14 inline-block border border-ink bg-ink px-5 py-3 text-sm text-paper transition-colors hover:bg-transparent hover:text-ink"
      >
        Start an enquiry
      </Link>
    </div>
  );
}
