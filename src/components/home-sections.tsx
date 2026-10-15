import Link from "next/link";

const lanes = [
  {
    href: "/ads",
    kicker: "Catalogue",
    title: "Ads",
    text: "Commercials, product films, testimonials and brand imagery across fashion, automotive, beauty, tech, food and more.",
    cta: "Browse ads",
  },
  {
    href: "/entertainment",
    kicker: "Catalogue",
    title: "Films",
    text: "Epics, thrillers, animated worlds and bingeable microdramas, made at cinematic scale.",
    cta: "Browse films",
  },
];

const notes = [
  {
    title: "More options",
    line: "See your idea in many styles before you commit to one.",
  },
  {
    title: "Premium, not pricey",
    line: "Cinematic quality for a fraction of a traditional shoot’s cost and time.",
  },
  {
    title: "Human taste",
    line: "GenAI is our camera and our set. The eye behind it is ours.",
  },
];

const studioPoints = [
  {
    label: "Ads & commercials",
    detail: "Commercials, product films and imagery for brands that refuse to look ordinary.",
  },
  {
    label: "Films & entertainment",
    detail: "Epics, thrillers, animated worlds and bingeable microdramas, made at cinematic scale.",
  },
];

export function HomeIntro() {
  return (
    <section className="home-reveal bg-[linear-gradient(180deg,rgba(139,92,246,0.08),transparent_42%),#000] px-5 py-12 sm:px-8 sm:py-14">
      <div className="grid items-end gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
        <div>
          <h2 className="text-3xl leading-tight font-bold sm:text-5xl">
            Give every story the sky it deserves.
          </h2>
          <p className="mt-5 text-base leading-7 text-white/70">
            Too many great ideas were shrunk to fit a budget, a set or a schedule. With GenAI, Maxyl takes the
            ceiling away. Oceans, empires, whole galaxies, or one face in perfect light: we build at the scale
            the story was always meant to have.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/ads" className="rounded bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-white/90">
              See the ads
            </Link>
            <Link
              href="/entertainment"
              className="rounded border border-[#c4b5fd]/55 px-5 py-3 text-sm font-bold text-[#c4b5fd] transition hover:border-[#c4b5fd] hover:text-white"
            >
              See the films
            </Link>
          </div>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
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
          <h2 className="mt-3 text-2xl font-bold sm:text-3xl">Everything we’ve conjured, in two catalogues.</h2>
        </div>
        <p className="max-w-md text-sm leading-6 text-white/60 sm:text-right">
          From filming sneakers to sea monsters, new phones to old myths, nothing is off the table.
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
          <h2 className="text-2xl font-bold sm:text-3xl">Faster than a shoot. Bigger than a set.</h2>
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
          <h2 className="text-3xl font-bold sm:text-4xl">Ready for a film?</h2>
          <p className="mt-4 text-sm leading-6 text-white/70">
            Quoted for exactly what you need: a single film, a full campaign or an ongoing slate. You bring the
            ambition. We’ll match it!
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
