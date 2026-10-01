import Link from "next/link";
import { projects } from "@/lib/catalogue";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-line">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-8 text-sm text-muted md:flex-row md:items-end md:justify-between md:px-8">
        <div>
          <p className="font-serif text-lg text-ink">Maxyl Studios</p>
          <p className="mt-1">A portfolio catalogue. {projects.length} plates in this volume.</p>
        </div>
        <div className="flex gap-5">
          <Link href="/work" className="hover:text-ink">
            Catalogue
          </Link>
          <Link href="/contact" className="hover:text-ink">
            Enquire
          </Link>
        </div>
      </div>
    </footer>
  );
}
