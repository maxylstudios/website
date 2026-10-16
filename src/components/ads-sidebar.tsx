"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { CatalogueCategory } from "@/lib/taxonomy";

type Props = {
  categories: CatalogueCategory[];
  counts: Record<string, number>;
  total: number;
};

export function AdsSidebar({ categories, counts, total }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const activeSlug = pathname.startsWith("/ads/") ? (pathname.split("/")[2] ?? "") : "";
  const activeName =
    categories.find((category) => category.slug === activeSlug)?.name ?? "All ads";

  return (
    <>
      <button
        type="button"
        className="ads-side-toggle lg:hidden"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="min-w-0 flex-1 text-left">
          <span className="block text-[10px] tracking-[0.28em] text-white/45 uppercase">Browse</span>
          <span className="mt-0.5 block truncate text-sm font-bold">{activeName}</span>
        </span>
        <span className={`text-white/70 transition ${open ? "rotate-180" : ""}`} aria-hidden>
          ▾
        </span>
      </button>

      {open ? (
        <button type="button" className="ads-side-scrim lg:hidden" aria-label="Close" onClick={() => setOpen(false)} />
      ) : null}

      <aside className={`ads-sidebar ${open ? "ads-sidebar-open" : ""}`} aria-label="Ads categories">
        <div className="ads-sidebar-inner">
          <div className="ads-sidebar-head">
            <p className="text-[10px] font-semibold tracking-[0.28em] text-white/40 uppercase">Maxyl Studios</p>
            <Link href="/ads" className="mt-2 block text-2xl font-bold tracking-tight" onClick={() => setOpen(false)}>
              Ads
            </Link>
          </div>

          <p className="ads-browse-label">Browse</p>
          <nav className="ads-sidebar-nav">
            <Link
              href="/ads"
              onClick={() => setOpen(false)}
              aria-current={pathname === "/ads" ? "page" : undefined}
              className={`ads-side-link ${pathname === "/ads" ? "ads-side-link-active" : ""}`}
            >
              <span className="min-w-0 flex-1 truncate">All ads</span>
              <span className="ads-side-count">{total}</span>
            </Link>

            {categories.map((category) => {
              const href = `/ads/${category.slug}`;
              const active = activeSlug === category.slug;
              const count = counts[category.slug] ?? 0;
              return (
                <Link
                  key={category.slug}
                  href={href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`ads-side-link ${active ? "ads-side-link-active" : ""}`}
                >
                  <span className="min-w-0 flex-1 truncate">{category.name}</span>
                  <span className="ads-side-count">{count}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
