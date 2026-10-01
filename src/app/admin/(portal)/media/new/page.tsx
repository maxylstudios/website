"use client";

import { MediaEditor } from "@/components/admin/media-editor";

export default function NewMediaPage() {
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">New upload</h1>
      <MediaEditor />
    </div>
  );
}
