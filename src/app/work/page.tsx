import type { Metadata } from "next";
import Link from "next/link";
import { Plate } from "@/components/plate";
import { disciplines, isDiscipline, projects } from "@/lib/catalogue";

export const metadata: Metadata = {
  title: "Catalogue",
  description: "Every plate in the Maxyl Studios portfolio catalogue.",
};

export default async function CataloguePage({
  searchParams,
}: {
  searchParams: Promise<{ discipline?: string }>;
}) {
  const { discipline } = await searchParams;
  const active = isDiscipline(discipline) ? discipline : "All";
  const list =
    active === "All"
      ? projects
      : projects.filter((project) => project.discipline === active);

  const filters = ["All", ...disciplines];

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-14 md:px-8 md:py-20">
      <p className="text-[11px] tracking-[0.24em] text-muted uppercase">Plates</p>
      <h1 className="mt-4 max-w-2xl font-serif text-5xl leading-[0.95] tracking-tight md:text-6xl">
        The catalogue.
      </h1>
      <p className="mt-5 max-w-xl text-lg leading-8 text-muted">
        Covers for the same list as the index. Filter by discipline.
      </p>

      <ul className="mt-10 flex flex-wrap gap-x-5 gap-y-3 text-sm">
        {filters.map((filter) => {
          const href =
            filter === "All" ? "/work" : `/work?discipline=${filter}`;
          const current = filter === active;
          return (
            <li key={filter}>
              <Link
                href={href}
                aria-current={current ? "true" : undefined}
                className={`border-b pb-0.5 ${
                  current
                    ? "border-ember text-ink"
                    : "border-transparent text-muted hover:text-ink"
                }`}
              >
                {filter}
              </Link>
            </li>
          );
        })}
      </ul>

      {list.length === 0 ? (
        <p className="mt-12 text-muted">Nothing filed under {active} yet.</p>
      ) : (
        <ul className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((project) => (
            <li key={project.slug}>
              <Link href={`/work/${project.slug}`} className="group block">
                <Plate project={project} />
                <h2 className="mt-4 font-serif text-2xl tracking-tight group-hover:text-ember">
                  {project.title}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  {project.discipline} · {project.client}
                </p>
                <p className="mt-3 text-sm leading-6 text-ink">{project.excerpt}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
