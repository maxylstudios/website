"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { MediaEditor } from "@/components/admin/media-editor";

export default function EditMediaPage() {
  const params = useParams<{ id: string }>();
  return (
    <div>
      <div className="mb-6">
        <Link href="/admin" className="text-xs tracking-[0.22em] text-muted uppercase">
          Library
        </Link>
        <h1 className="mt-2 text-3xl font-bold">Edit upload</h1>
      </div>
      <MediaEditor id={params.id} />
    </div>
  );
}
