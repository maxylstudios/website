import { NextResponse } from "next/server";
import { extensionForType } from "@/lib/crop-image";
import { readAdminToken } from "@/lib/admin-session";
import { createVideoUploadTarget } from "@/lib/s3";
import { createPublicSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const token = await readAdminToken();
    if (!token) {
      return NextResponse.json({ message: "Enter the admin password again." }, { status: 401 });
    }

    const supabase = createPublicSupabase();
    const { error: sessionError } = await supabase.rpc("list_admin_media", {
      raw_token: token,
    });
    if (sessionError) {
      return NextResponse.json({ message: "Enter the admin password again." }, { status: 401 });
    }

    const body = (await request.json()) as {
      kind?: string;
      contentType?: string;
    };
    const kind = String(body.kind ?? "");
    const contentType = String(body.contentType ?? "application/octet-stream");
    if (kind !== "image" && kind !== "video") {
      return NextResponse.json({ message: "Choose an image or a video." }, { status: 400 });
    }

    const extension = extensionForType(contentType);

    if (kind === "video") {
      const target = await createVideoUploadTarget(contentType, extension);
      return NextResponse.json({
        mode: "s3" as const,
        kind,
        path: target.path,
        uploadUrl: target.uploadUrl,
        contentType: target.contentType,
      });
    }

    const path = `uploads/${crypto.randomUUID()}.${extension}`;
    const { error: ticketError } = await supabase.rpc("begin_media_upload", {
      raw_token: token,
      ticket_path: path,
    });
    if (ticketError) {
      return NextResponse.json({ message: ticketError.message }, { status: 400 });
    }

    return NextResponse.json({
      mode: "supabase" as const,
      kind,
      path,
      contentType,
    });
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : "Could not start the upload.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
