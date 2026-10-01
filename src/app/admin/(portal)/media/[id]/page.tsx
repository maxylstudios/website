"use client";

import { useParams } from "next/navigation";
import { MediaEditor } from "@/components/admin/media-editor";

export default function EditMediaPage() {
  const params = useParams<{ id: string }>();
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Edit upload</h1>
      <MediaEditor id={params.id} />
    </div>
  );
}
