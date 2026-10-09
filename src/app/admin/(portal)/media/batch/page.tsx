"use client";

import Link from "next/link";
import { BatchUploader } from "@/components/admin/batch-uploader";

export default function BatchUploadPage() {
  return (
    <div>
      <div className="mb-6">
        <Link href="/admin" className="text-xs tracking-[0.22em] text-muted uppercase">
          Library
        </Link>
        <h1 className="mt-2 text-3xl font-bold">Batch upload</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Queue many files at once. Each row keeps its own title, place, and progress.
        </p>
      </div>
      <BatchUploader />
    </div>
  );
}
