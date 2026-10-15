import type { Metadata } from "next";
import Link from "next/link";
import { Caveat } from "next/font/google";

const hand = Caveat({ subsets: ["latin"], weight: ["500", "700"] });

export const metadata: Metadata = {
  title: "About us",
  description:
    "Born from YAIL Studios and Mixbreed Studios, Maxyl is an AI-first production ecosystem for commercials, entertainment, and new cinematic experiences.",
};

const notes = [
  {
    title: "More Creative Freedom",
    line: "Explore more concepts, visual styles, and ambitious ideas without traditional production limits.",
    sketch: <BoardSketch />,
  },
  {
    title: "Faster Turnarounds",
    line: "From concept to final cut, AI-powered workflows make production faster and easier to scale.",
    sketch: <ClockSketch />,
  },
  {
    title: "Smarter Budgets",
    line: "Achieve cinematic quality and bigger creative ambitions at a fraction of traditional production costs.",
    sketch: <LensSketch />,
  },
];

export default function AboutPage() {
  return (
    <div className="bg-black px-5 pb-24 pt-28 sm:px-10">
      <p className="text-xs font-semibold tracking-[0.32em] text-[#c4b5fd] uppercase">About us</p>
      <h1 className={`${hand.className} mt-4 max-w-4xl text-6xl leading-[0.9] font-bold text-white sm:text-8xl`}>
        Two Studios. One Extraordinary Vision.
      </h1>
      <p className="mt-6 max-w-3xl text-base leading-7 text-white/75 sm:text-lg">
        Born from the coming together of two creative forces,{" "}
        <span className="font-semibold text-white">YAIL Studios and Mixbreed Studios</span>, Maxyl is
        reimagining the future of filmmaking. We&apos;re building an AI-first production ecosystem where
        storytelling, technology, and imagination work together to break creative boundaries. From commercials
        and entertainment to entirely new cinematic experiences, we&apos;re not just creating content.
        We&apos;re shaping what&apos;s next!
      </p>

      <ul className="mt-14 grid gap-6 lg:grid-cols-3">
        {notes.map((note, index) => (
          <li
            key={note.title}
            className="rounded-[1.4rem] border border-white/20 bg-white/[0.03] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
            style={{ transform: `rotate(${index === 1 ? 0.6 : index === 2 ? -0.5 : -0.8}deg)` }}
          >
            <div className="text-[#c4b5fd]">{note.sketch}</div>
            <h2 className={`${hand.className} mt-4 text-4xl font-bold`}>{note.title}</h2>
            <p className="mt-2 text-sm leading-6 text-white/70">{note.line}</p>
          </li>
        ))}
      </ul>

      <div className="mt-16 grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <h2 className={`${hand.className} text-5xl leading-none font-bold sm:text-6xl`}>
            Big Ideas. Smarter Production.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/75">
            Great filmmaking takes imagination, time, and resources. At Maxyl, we use AI-powered workflows and
            human creativity to make ambitious production faster, more flexible, and cost-effective. From
            commercials and product films to microdramas and original entertainment, we bring cinematic quality
            to every scale and budget.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/ads" className="rounded bg-white px-5 py-3 text-sm font-bold text-black">
              Explore Our Work
            </Link>
            <Link href="/contact" className="rounded border border-[#c4b5fd]/60 px-5 py-3 text-sm font-bold text-[#c4b5fd]">
              Let’s Create Together
            </Link>
          </div>
        </div>
        <Storyboard />
      </div>
    </div>
  );
}

function BoardSketch() {
  return (
    <svg viewBox="0 0 240 140" className="h-36 w-full" fill="none" aria-hidden>
      <path d="M18 22h78v46H18zM108 18h70v52h-70zM34 84h92v38H34zM150 82h68v42h-68z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M36 48c8-14 22-16 30-4M124 46c6-10 18-8 22 2M58 108h40M168 104h28" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M188 28l8 6-8 5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function ClockSketch() {
  return (
    <svg viewBox="0 0 240 140" className="h-36 w-full" fill="none" aria-hidden>
      <path d="M118 18c-28 2-50 26-48 54 2 30 28 50 58 46 26-3 46-26 44-52-2-24-22-46-54-48z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M122 40v32l22 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M168 36c14 6 22 18 20 32M46 96c8 16 24 26 42 28" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function LensSketch() {
  return (
    <svg viewBox="0 0 240 140" className="h-36 w-full" fill="none" aria-hidden>
      <path d="M46 48h58l10-16h36l8 16h36v52H46z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M108 74a18 16 0 1 0 36 0 18 16 0 1 0-36 0" stroke="currentColor" strokeWidth="1.5" />
      <path d="M78 38l6-10M168 34l8-12M188 96l16 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function Storyboard() {
  return (
    <svg viewBox="0 0 420 280" className="w-full text-[#c4b5fd]" fill="none" aria-hidden>
      <path d="M28 24h160v100H28zM214 36h170v88H214zM40 150h120v96H40zM184 158h200v92H184z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M52 78c18-28 48-30 62-6M70 92h48M236 84c12-20 36-18 44 4M214 214c20-24 52-22 64 6M250 230h70" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M300 70l14 10-14 9M92 186l10 8-12 8" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M18 18l8 14M390 250l12-8M360 20c10 8 8 18-2 22" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
