"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SiteFooter } from "@/components/site-footer";
import { adsCategories } from "@/lib/taxonomy";

const topLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About us" },
  { href: "/ads", label: "Ads" },
  { href: "/entertainment", label: "Entertainment" },
  { href: "/contact", label: "Contact us" },
];

function usesSidebar(pathname: string) {
  return pathname.startsWith("/misc");
}

function isCurrent(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SideNav({
  open,
  onNavigate,
}: {
  open: boolean;
  onNavigate: () => void;
}) {
  const pathname = usePathname();
  const miscOpen = pathname.startsWith("/misc");
  const heading = miscOpen ? "Misc" : "Ads";
  const links = miscOpen
    ? []
    : adsCategories.map((category) => ({
        href: `/ads/${category.slug}`,
        label: category.name,
        current: pathname === `/ads/${category.slug}` || pathname.startsWith(`/ads/${category.slug}/`),
      }));

  const itemClass = (current: boolean) =>
    `block rounded px-3 py-2 text-sm transition-colors ${
      current ? "bg-white/10 font-semibold text-white" : "text-muted hover:bg-white/5 hover:text-white"
    }`;

  return (
    <aside
      className={`fixed bottom-0 top-16 z-30 w-64 overflow-y-auto border-r border-line bg-black px-3 py-6 ${
        open ? "block" : "hidden"
      } lg:block`}
    >
      <ul className="mb-6 space-y-1 lg:hidden">
        {topLinks.map((link) => (
          <li key={link.href}>
            <Link href={link.href} onClick={onNavigate} className={itemClass(isCurrent(pathname, link.href))}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
      <p className="px-3 text-[11px] tracking-[0.22em] text-muted uppercase">{heading}</p>
      <nav aria-label={heading} className="mt-4">
        <ul className="space-y-1">
          <li>
            <Link
              href={miscOpen ? "/misc" : "/ads"}
              onClick={onNavigate}
              className={itemClass(pathname === (miscOpen ? "/misc" : "/ads"))}
            >
              All
            </Link>
          </li>
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} onClick={onNavigate} className={itemClass(link.current)}>
                {link.label}
              </Link>
            </li>
          ))}
          {miscOpen ? null : (
            <li>
              <Link href="/misc" onClick={onNavigate} className={itemClass(false)}>
                Misc
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </aside>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const sidebar = usesSidebar(pathname);
  const [open, setOpen] = useState(false);

  if (pathname.startsWith("/admin")) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-full bg-transparent">
      <header
        className={`fixed inset-x-0 top-0 z-40 flex h-16 items-center gap-6 px-4 md:px-8 ${
          pathname === "/entertainment" || pathname === "/ads"
            ? "bg-transparent"
            : pathname === "/"
              ? "bg-black"
            : "bg-gradient-to-b from-black via-black/75 to-transparent"
        }`}
      >
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <span className="relative block h-[34px] w-[92px] overflow-hidden">
            <Image
              src="/images/maxyl_logo_transparent.png"
              alt="Maxyl"
              width={1280}
              height={720}
              priority
              className="absolute max-w-none"
              style={{
                height: 68,
                width: 120,
                left: -14,
                top: -16,
              }}
            />
          </span>
          <span className="h-5 w-px bg-white/35" aria-hidden />
          <span className="text-[11px] font-semibold tracking-[0.32em] text-white/90 uppercase">
            Studios
          </span>
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-4 text-sm lg:flex">
          {topLinks.map((link) => {
            const current = isCurrent(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={current ? "page" : undefined}
                className={current ? "font-semibold text-white" : "text-muted hover:text-white"}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          className="ml-auto text-sm font-semibold lg:hidden"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </header>

      {sidebar ? <SideNav open={open} onNavigate={() => setOpen(false)} /> : null}

      {open && !sidebar ? (
        <div className="fixed inset-x-0 top-16 z-30 bg-black px-4 py-4 lg:hidden">
          <nav aria-label="Primary">
            <ul className="space-y-1">
              {topLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block rounded px-3 py-2 text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      ) : null}

      <div className={sidebar ? "lg:pl-64" : ""}>
        {children}
        <SiteFooter />
      </div>
    </div>
  );
}
