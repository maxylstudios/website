import Image from "next/image";
import Link from "next/link";

const explore = [
  { href: "/", label: "Home" },
  { href: "/ads", label: "Ads" },
  { href: "/entertainment", label: "Entertainment" },
  { href: "/about", label: "About us" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
];

const people = [
  { name: "Sushmith", phone: "+91 9606558600", tel: "+919606558600" },
  { name: "Nitika", phone: "+91 81978 53851", tel: "+918197853851" },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.12),transparent_55%),#000]">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[1.2fr_0.8fr_0.9fr]">
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="relative block h-[34px] w-[92px] overflow-hidden">
              <Image
                src="/images/maxyl_logo_transparent.png"
                alt="Maxyl"
                width={1280}
                height={720}
                className="absolute max-w-none"
                style={{ height: 68, width: 120, left: -14, top: -16 }}
              />
            </span>
            <span className="h-5 w-px bg-white/35" aria-hidden />
            <span className="text-[11px] font-semibold tracking-[0.32em] text-white/90 uppercase">Studios</span>
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-6 text-white/65">
            A GenAI film studio for commercials, product films, and entertainment — directed and finished while the idea is still warm.
          </p>
        </div>

        <div>
          <p className="text-[11px] font-semibold tracking-[0.24em] text-[#c4b5fd] uppercase">Explore</p>
          <ul className="mt-4 space-y-2.5">
            {explore.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-white/75 transition hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[11px] font-semibold tracking-[0.24em] text-[#c4b5fd] uppercase">Call the studio</p>
          <ul className="mt-4 space-y-4">
            {people.map((person) => (
              <li key={person.tel}>
                <a href={`tel:${person.tel}`} className="group block">
                  <span className="block text-sm font-semibold text-white transition group-hover:text-[#c4b5fd]">
                    {person.name}
                  </span>
                  <span className="mt-0.5 block text-sm text-white/65">{person.phone}</span>
                </a>
              </li>
            ))}
          </ul>
          <Link
            href="/contact"
            className="mt-6 inline-block text-xs font-semibold tracking-[0.18em] text-[#c4b5fd] uppercase transition hover:text-white"
          >
            Contact page →
          </Link>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-5 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>© {year} Maxyl Studios</p>
          <p>Ads and entertainment, filed separately.</p>
        </div>
      </div>
    </footer>
  );
}
