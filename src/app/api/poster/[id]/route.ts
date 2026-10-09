import { posterJpeg } from "@/lib/poster";
import { getPublishedMedia, mediaPublicUrl } from "@/lib/media";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const item = await getPublishedMedia(id);
  if (!item || item.kind !== "video") {
    return new Response(null, { status: 404 });
  }

  const url = mediaPublicUrl(item.storage_path);
  if (!url.startsWith("https://")) {
    return new Response(null, { status: 404 });
  }

  const jpeg = await posterJpeg(url);
  if (!jpeg) {
    return new Response(null, { status: 404 });
  }

  return new Response(new Uint8Array(jpeg), {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=604800",
    },
  });
}
