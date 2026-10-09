"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logoutAdmin } from "@/app/admin/actions";

const links = [
  { href: "/admin", label: "Library", exact: true },
  { href: "/admin/home", label: "Homepage", exact: true },
  { href: "/admin/media/new", label: "Upload", exact: true },
  { href: "/admin/media/batch", label: "Batch", exact: true },
  { href: "/admin/hero", label: "Hero", exact: true },
  { href: "/admin/features", label: "Features", exact: true },
];

export function AdminBar() {
  const router = useRouter();
  const pathname = usePathname();

  async function signOut() {
    await logoutAdmin();
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="text-lg font-bold tracking-tight">
            Desk
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            {links.map((link) => {
              const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-3 py-1.5 ${
                    active ? "bg-white text-black" : "text-muted hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <nav className="flex flex-wrap items-center gap-4 text-sm">
          <Link href="/ads" className="text-muted hover:text-white">
            Ads
          </Link>
          <Link href="/" className="text-muted hover:text-white">
            Site
          </Link>
          <button
            type="button"
            onClick={() => void signOut()}
            className="rounded-full border border-white/15 px-3 py-1.5 text-muted hover:border-white/40 hover:text-white"
          >
            Lock
          </button>
        </nav>
      </div>
    </header>
  );
}
