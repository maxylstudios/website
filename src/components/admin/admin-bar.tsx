"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { logoutAdmin } from "@/app/admin/actions";

export function AdminBar() {
  const router = useRouter();

  async function signOut() {
    await logoutAdmin();
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-6 py-4">
      <Link href="/admin" className="text-lg font-bold">
        Studio desk
      </Link>
      <nav className="flex flex-wrap items-center gap-4 text-sm">
        <Link href="/admin/media/new" className="font-semibold text-white">
          Upload
        </Link>
        <Link href="/ads" className="text-muted hover:text-white">
          Ads
        </Link>
        <Link href="/" className="text-muted hover:text-white">
          Site
        </Link>
        <button type="button" onClick={() => void signOut()} className="text-muted hover:text-white">
          Lock
        </button>
      </nav>
    </header>
  );
}
