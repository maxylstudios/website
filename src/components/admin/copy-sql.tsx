"use client";

import { useState } from "react";

export function CopySql({ sql }: { sql: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(sql);
    setCopied(true);
  }

  return (
    <button
      type="button"
      onClick={() => void copy()}
      className="rounded bg-ember px-4 py-2 text-sm font-bold"
    >
      {copied ? "Copied" : "Copy SQL"}
    </button>
  );
}
