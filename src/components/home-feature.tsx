import type { HomepageArt } from "@/lib/homepage-art";

const yailiansHref = "https://yourailensstudios.com/yailians";

const cards = [
  {
    slot: "card-worlds" as const,
    index: "01",
    title: "Worlds",
    text: "Cities, weather, creatures. Built for the shot, not rented for the day.",
  },
  {
    slot: "card-faces" as const,
    index: "02",
    title: "Faces",
    text: "Close-ups that hold. Performance without a call sheet or a twelve-hour day.",
  },
  {
    slot: "card-campaigns" as const,
    index: "03",
    title: "Campaigns",
    text: "A brand film at trailer scale, on a calendar that used to be a fantasy.",
  },
];

export function HomeFeature({ art }: { art: HomepageArt }) {
  const poster = art.yailians;
  const era = art.era;

  return (
    <div className="bg-black text-white">
      <section className="relative isolate min-h-[82svh] overflow-hidden bg-[#07060c]">
        {poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={poster} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,rgba(139,92,246,0.35),transparent_46%),linear-gradient(160deg,#1a1028_0%,#07060c_48%,#12080c_100%)]"
            aria-hidden
          />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.62)_0%,rgba(0,0,0,0.22)_34%,transparent_62%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.72)_0%,rgba(0,0,0,0.18)_26%,transparent_52%)]" />
        <div className="relative flex min-h-[82svh] flex-col justify-end px-5 pt-28 pb-14 sm:px-10 sm:pb-16">
          <p className="text-[11px] font-semibold tracking-[0.32em] text-[#c4b5fd] uppercase">First feature · 45 minutes</p>
          <p className="mt-4 text-xs font-semibold tracking-[0.28em] text-white/70 uppercase">Attack on Bangalore</p>
          <h2 className="mt-3 max-w-5xl text-6xl leading-[0.88] font-bold tracking-tight sm:text-8xl">YAILIANS</h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/80">
            Our first 45-minute AI film. Bangalore under fire, held for the length of a feature. No backlot, no crowd
            call, no year on a stage. A city, a siege, and a story that finally got the runtime it asked for.
          </p>
          <a
            href={yailiansHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 w-fit rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition hover:bg-white/90"
          >
            See YAILIANS
          </a>
        </div>
      </section>

      <section className="relative isolate overflow-hidden border-t border-white/10">
        {era ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={era} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(180deg,#000,rgba(139,92,246,0.16),#000)]" aria-hidden />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.58)_0%,rgba(0,0,0,0.16)_42%,rgba(0,0,0,0.36)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.45)_0%,transparent_46%)]" />
        <div className="relative grid gap-10 px-5 py-20 sm:px-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:py-28">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.32em] text-[#c4b5fd] uppercase">AI multimedia</p>
            <h2 className="mt-4 max-w-3xl text-4xl leading-[0.95] font-bold sm:text-6xl">The new era of AI content.</h2>
          </div>
          <p className="max-w-md text-base leading-7 text-white/75 lg:pb-1">
            Picture, performance, sound and world, directed as one piece. The warehouse and the wait are gone. The
            taste stays with the studio. This is how films and campaigns get made now.
          </p>
        </div>
      </section>

      <section className="border-t border-white/10 px-5 py-14 sm:px-10 sm:py-16">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="max-w-xl text-3xl font-bold sm:text-4xl">What the new stack can hold.</h2>
          <p className="max-w-sm text-sm leading-6 text-white/60">Three kinds of picture we make every week.</p>
        </div>
        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {cards.map((card) => {
            const src = art[card.slot];
            return (
              <li key={card.slot} className="group relative min-h-[22rem] overflow-hidden rounded-[1.4rem] border border-white/10 bg-[#0c0c10]">
                {src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
                ) : (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(196,181,253,0.2),transparent_42%),#101018]" aria-hidden />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/10" />
                <div className="relative flex h-full min-h-[22rem] flex-col justify-end p-6">
                  <p className="text-[11px] font-semibold tracking-[0.22em] text-[#c4b5fd] uppercase">{card.index}</p>
                  <h3 className="mt-2 text-3xl font-bold">{card.title}</h3>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-white/75">{card.text}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
