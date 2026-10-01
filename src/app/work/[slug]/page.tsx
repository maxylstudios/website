import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Plate } from "@/components/plate";
import { getProject, projects, relatedProjects } from "@/lib/catalogue";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: "Plate" };

  return {
    title: project.title,
    description: project.excerpt,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const related = relatedProjects(project.slug);

  return (
    <article className="mx-auto w-full max-w-6xl px-5 py-14 md:px-8 md:py-20">
      <p className="text-[11px] tracking-[0.24em] text-muted uppercase">
        Plate {project.number}
      </p>
      <h1 className="mt-4 font-serif text-5xl tracking-tight md:text-7xl">
        {project.title}
      </h1>
      <p className="mt-4 max-w-xl font-serif text-2xl text-muted italic">
        {project.excerpt}
      </p>

      <div className="mt-10 grid gap-10 md:grid-cols-12">
        <div className="md:col-span-8">
          <Plate project={project} />
        </div>
        <dl className="md:col-span-4 md:pt-2">
          <div className="border-t border-line py-3">
            <dt className="text-[11px] tracking-[0.18em] text-muted uppercase">
              Client
            </dt>
            <dd className="mt-1">{project.client}</dd>
          </div>
          <div className="border-t border-line py-3">
            <dt className="text-[11px] tracking-[0.18em] text-muted uppercase">
              Year
            </dt>
            <dd className="mt-1">{project.year}</dd>
          </div>
          <div className="border-t border-line py-3">
            <dt className="text-[11px] tracking-[0.18em] text-muted uppercase">
              Discipline
            </dt>
            <dd className="mt-1">
              <Link
                href={`/work?discipline=${project.discipline}`}
                className="border-b border-ember"
              >
                {project.discipline}
              </Link>
            </dd>
          </div>
          <div className="border-y border-line py-3">
            <dt className="text-[11px] tracking-[0.18em] text-muted uppercase">
              Services
            </dt>
            <dd className="mt-1">{project.services.join(", ")}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-12 max-w-2xl space-y-5 text-lg leading-8">
        {project.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      {related.length > 0 ? (
        <section className="mt-16 border-t border-line pt-8">
          <h2 className="text-[11px] tracking-[0.18em] text-muted uppercase">
            Also in the catalogue
          </h2>
          <ul className="mt-4 grid gap-6 sm:grid-cols-2">
            {related.map((item) => (
              <li key={item.slug}>
                <Link href={`/work/${item.slug}`} className="group block">
                  <Plate project={item} />
                  <span className="mt-3 block font-serif text-2xl group-hover:text-ember">
                    {item.title}
                  </span>
                  <span className="text-sm text-muted">{item.discipline}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
