import Link from "next/link";
import { projects } from "@/lib/catalogue";

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-14 md:px-8 md:py-20">
      <p className="text-[11px] tracking-[0.24em] text-muted uppercase">
        Volume 01
      </p>
      <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[0.95] tracking-tight text-ink md:text-7xl">
        Work, listed the way a catalogue lists it.
      </h1>
      <p className="mt-6 max-w-xl text-lg leading-8 text-muted">
        Maxyl Studios keeps identity, digital, editorial, and spatial projects
        as numbered plates. This is the index. Open any row, or browse the
        covers.
      </p>
      <Link
        href="/work"
        className="mt-8 inline-block border-b border-ember pb-0.5 text-sm text-ink"
      >
        Open the catalogue
      </Link>

      <div className="mt-16 border-t border-line">
        <div className="hidden grid-cols-[4rem_1.4fr_1fr_8rem_4.5rem] gap-4 border-b border-line py-3 text-[11px] tracking-[0.18em] text-muted uppercase md:grid">
          <span>No.</span>
          <span>Title</span>
          <span>Client</span>
          <span>Discipline</span>
          <span>Year</span>
        </div>
        <ul>
          {projects.map((project) => (
            <li key={project.slug} className="border-b border-line">
              <Link
                href={`/work/${project.slug}`}
                className="grid grid-cols-[2.5rem_1fr] gap-x-4 gap-y-1 py-5 transition-colors hover:text-ember md:grid-cols-[4rem_1.4fr_1fr_8rem_4.5rem] md:items-baseline"
              >
                <span className="text-sm text-muted">{project.number}</span>
                <span className="font-serif text-2xl tracking-tight md:text-[1.75rem]">
                  {project.title}
                </span>
                <span className="col-start-2 text-sm text-muted md:col-start-auto md:text-base">
                  {project.client}
                </span>
                <span className="col-start-2 text-sm md:col-start-auto">
                  {project.discipline}
                </span>
                <span className="col-start-2 text-sm text-muted md:col-start-auto">
                  {project.year}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
