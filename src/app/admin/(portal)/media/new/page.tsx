"use client";

import Link from "next/link";
import { MediaEditor } from "@/components/admin/media-editor";

export default function NewMediaPage() {
  return (
    <div>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <Link href="/admin" className="text-xs tracking-[0.22em] text-muted uppercase">
            Library
          </Link>
          <h1 className="mt-2 text-3xl font-bold">New upload</h1>
          <p className="mt-2 text-sm text-muted">
            One file with framing tools. For many files, use{" "}
            <Link href="/admin/media/batch" className="text-white underline-offset-2 hover:underline">
              batch upload
            </Link>
            .
          </p>
        </div>
      </div>
      <MediaEditor />
    </div>
  );
}
