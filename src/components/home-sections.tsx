import Link from "next/link";

const lanes = [
  {
    href: "/ads",
    kicker: "Catalogue",
    title: "Ads",
    text: "Fashion, product, automotive, and the rest of the commercial shelf — sorted by category.",
    cta: "Browse ads",
  },
  {
    href: "/entertainment",
    kicker: "Catalogue",
    title: "Entertainment",
    text: "Films and microdramas from the studio. Two rooms, no mixed pile.",
    cta: "Browse entertainment",
  },
];

const notes = [
  {
    title: "More tries",
    line: "Ten looks before lunch. Keep the one that sells.",
  },
  {
    title: "Fewer days",
    line: "A product film does not wait on a unit, a location, or a week in the edit.",
  },
  {
    title: "Still directed",
    line: "GenAI is the camera and the set. The taste is still ours.",
  },
];

const studioPoints = [
  { label: "Ads", detail: "Commercials filed by category" },
  { label: "Films", detail: "Entertainment and microdramas" },
];

export function HomeIntro() {
  return (
    <section className="home-reveal bg-[linear-gradient(180deg,rgba(139,92,246,0.08),transparent_42%),#000] px-5 py-12 sm:px-8 sm:py-14">
      <div className="grid items-end gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-[#c4b5fd] uppercase">The studio</p>
          <h2 className="mt-4 text-3xl leading-tight font-bold sm:text-5xl">
            GenAI films for brands and stories.
          </h2>
          <p className="mt-5 text-base leading-7 text-white/70">
            Maxyl makes commercials, product films, and entertainment by generating the picture, directing it, and finishing it while the idea is still warm.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/ads" className="rounded bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-white/90">
              See the ads
            </Link>
            <Link
              href="/entertainment"
              className="rounded border border-[#c4b5fd]/55 px-5 py-3 text-sm font-bold text-[#c4b5fd] transition hover:border-[#c4b5fd] hover:text-white"
            >
              See entertainment
            </Link>
          </div>
        </div>
        <ul className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          {studioPoints.map((point) => (
            <li key={point.label} className="border-t border-white/20 pt-4">
              <p className="text-sm font-bold tracking-[0.16em] text-[#c4b5fd] uppercase">{point.label}</p>
              <p className="mt-1.5 text-sm leading-6 text-white/65">{point.detail}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function HomeLanes() {
  return (
    <section className="home-reveal px-5 py-12 sm:px-8 sm:py-14">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-[#c4b5fd] uppercase">Where to look</p>
          <h2 className="mt-3 text-2xl font-bold sm:text-3xl">Two catalogues.</h2>
        </div>
        <p className="max-w-md text-sm leading-6 text-white/60 sm:text-right">
          Ads stay in one room. Entertainment stays in the other.
        </p>
      </div>
      <ul className="mt-8 grid gap-4 md:grid-cols-2">
        {lanes.map((lane) => (
          <li key={lane.href}>
            <Link
              href={lane.href}
              className="group block h-full rounded-[1.4rem] border border-white/15 bg-white/[0.03] px-6 py-7 transition duration-300 hover:border-[#c4b5fd]/40 hover:bg-white/[0.05]"
            >
              <p className="text-[11px] font-semibold tracking-[0.22em] text-[#c4b5fd] uppercase">{lane.kicker}</p>
              <h3 className="mt-3 text-3xl font-bold">{lane.title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/65">{lane.text}</p>
              <span className="mt-6 inline-block text-xs font-semibold tracking-[0.18em] text-white/80 uppercase transition group-hover:text-[#c4b5fd]">
                {lane.cta} →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function HomeNotes() {
  return (
    <section className="home-reveal px-5 py-12 sm:px-8 sm:py-14">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-[#c4b5fd] uppercase">How we work</p>
          <h2 className="mt-3 text-2xl font-bold sm:text-3xl">Efficiency is the point.</h2>
        </div>
        <Link
          href="/about"
          className="text-xs font-semibold tracking-[0.18em] text-[#c4b5fd] uppercase transition hover:text-white"
        >
          About the studio →
        </Link>
      </div>
      <ul className="mt-8 grid gap-8 sm:grid-cols-3">
        {notes.map((note) => (
          <li key={note.title} className="border-t border-white/15 pt-5">
            <h3 className="text-lg font-bold">{note.title}</h3>
            <p className="mt-2 text-sm leading-6 text-white/65">{note.line}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function HomeContact() {
  return (
    <section className="home-reveal border-t border-white/10 bg-[linear-gradient(0deg,rgba(139,92,246,0.1),transparent_50%)] px-5 py-12 sm:px-8 sm:py-14">
      <div className="grid items-end gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-[#c4b5fd] uppercase">Next step</p>
          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">Ready for a film?</h2>
          <p className="mt-4 text-sm leading-6 text-white/70">
            Quoted for the piece you need — a single film, a campaign, or an ongoing slate. Two people answer the phone.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 lg:justify-end">
          <Link href="/contact" className="rounded bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-white/90">
            Call the studio
          </Link>
          <Link
            href="/pricing"
            className="rounded border border-white/25 px-5 py-3 text-sm font-bold text-white transition hover:border-white/50"
          >
            How pricing works
          </Link>
        </div>
      </div>
    </section>
  );
}
