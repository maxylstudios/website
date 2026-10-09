"use client";

import Link from "next/link";
import { useState } from "react";

type Item = {
  href: string;
  label: string;
};

export function SectionLinks({
  links,
  currentHref,
  className = "",
}: {
  links: Item[];
  currentHref?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(true);
  const current = links.find((link) => link.href === currentHref);

  return (
    <div className={className}>
      <div className="md:hidden">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="flex w-full items-center gap-4 rounded-2xl border border-white/20 bg-white/[0.04] px-4 py-3 text-left"
        >
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] tracking-[0.22em] text-muted uppercase">Categories</span>
            <span className="mt-1 block truncate text-base font-bold">
              {current?.label ?? "Choose a category"}
            </span>
          </span>
          <span className="text-xs tracking-[0.16em] text-white/50">{String(links.length).padStart(2, "0")}</span>
          <span className={`text-white/70 transition ${open ? "rotate-180" : ""}`} aria-hidden>
            <Chevron />
          </span>
        </button>
        {open ? (
          <ul className="mt-2 max-h-80 overflow-y-auto rounded-2xl border border-white/15 bg-black">
            {links.map((link, index) => {
              const active = link.href === currentHref;
              return (
                <li key={link.href} className="border-b border-white/10 last:border-b-0">
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-4 px-4 py-3 ${active ? "bg-white text-black" : "text-white"}`}
                  >
                    <span className={`w-6 text-xs tracking-[0.14em] ${active ? "text-black/50" : "text-white/40"}`}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="font-bold">{link.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
      <div className="hidden flex-wrap gap-3 md:flex">
        {links.map((link) => {
          const active = link.href === currentHref;
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`rounded border px-5 py-3 text-sm font-bold transition ${
                active
                  ? "border-white bg-white text-black"
                  : "border-white/35 text-white hover:border-white/60"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function Chevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
      <path
        d="m4 6 4 4 4-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
