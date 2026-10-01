"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Index" },
  { href: "/work", label: "Catalogue" },
  { href: "/studio", label: "Studio" },
  { href: "/contact", label: "Contact" },
];

function isCurrent(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b border-line">
      <div className="mx-auto flex w-full max-w-6xl items-end justify-between gap-6 px-5 py-5 md:px-8">
        <Link href="/" className="group leading-none">
          <span className="block font-serif text-2xl tracking-tight text-ink">
            Maxyl
          </span>
          <span className="mt-1 block text-[10px] tracking-[0.28em] text-muted uppercase">
            Studios
          </span>
        </Link>
        <nav aria-label="Primary">
          <ul className="flex flex-wrap justify-end gap-x-5 gap-y-2 text-sm">
            {links.map((link) => {
              const current = isCurrent(pathname, link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={current ? "page" : undefined}
                    className={`border-b pb-0.5 transition-colors ${
                      current
                        ? "border-ember text-ink"
                        : "border-transparent text-muted hover:text-ink"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
