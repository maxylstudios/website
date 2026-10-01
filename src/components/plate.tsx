import type { Project } from "@/lib/catalogue";

function Mark({ index, ink }: { index: number; ink: string }) {
  const variant = index % 4;

  if (variant === 0) {
    return (
      <svg viewBox="0 0 200 200" className="h-[62%] w-[62%]" aria-hidden>
        <circle cx="100" cy="100" r="64" fill="none" stroke={ink} strokeWidth="1.5" />
        <circle cx="100" cy="100" r="6" fill={ink} />
        <path d="M100 28v18M100 154v18M28 100h18M154 100h18" stroke={ink} strokeWidth="1.5" />
      </svg>
    );
  }

  if (variant === 1) {
    return (
      <svg viewBox="0 0 200 200" className="h-[62%] w-[62%]" aria-hidden>
        <rect x="36" y="46" width="128" height="108" fill="none" stroke={ink} strokeWidth="1.5" />
        <path d="M36 82h128M36 118h128M78 46v108M122 46v108" stroke={ink} strokeWidth="1" />
      </svg>
    );
  }

  if (variant === 2) {
    return (
      <svg viewBox="0 0 200 200" className="h-[62%] w-[62%]" aria-hidden>
        <path
          d="M40 140c28-72 92-72 120 0"
          fill="none"
          stroke={ink}
          strokeWidth="1.5"
        />
        <path d="M58 140h84" stroke={ink} strokeWidth="1.5" />
        <circle cx="100" cy="78" r="5" fill={ink} />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 200 200" className="h-[62%] w-[62%]" aria-hidden>
      <path d="M48 48h104v104H48z" fill="none" stroke={ink} strokeWidth="1.5" />
      <path d="M48 48l104 104M152 48L48 152" stroke={ink} strokeWidth="1" />
    </svg>
  );
}

export function Plate({ project }: { project: Project }) {
  const index = Number(project.number);

  return (
    <div
      className="relative flex aspect-[4/5] items-center justify-center overflow-hidden"
      style={{
        background: `linear-gradient(160deg, ${project.cover.from}, ${project.cover.to})`,
        color: project.cover.ink,
      }}
    >
      <span className="absolute left-4 top-4 text-[11px] tracking-[0.22em]">
        {project.number}
      </span>
      <span className="absolute right-4 top-4 text-[11px] tracking-[0.18em]">
        {project.year}
      </span>
      <Mark index={index} ink={project.cover.ink} />
    </div>
  );
}
