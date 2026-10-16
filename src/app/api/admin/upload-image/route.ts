import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Kept only as a clear error if something still hits this path.
 * Image uploads must go browser → Supabase via /api/admin/upload-intent
 * so they are not blocked by Vercel's 4.5MB function body limit.
 */
export async function POST() {
  return NextResponse.json(
    {
      message:
        "Poster uploads go straight to storage now. Refresh the page and try again. If this keeps happening, redeploy the latest build.",
    },
    { status: 410 },
  );
}
