import { NextResponse } from "next/server";
import { extensionForType } from "@/lib/crop-image";
import { readAdminToken } from "@/lib/admin-session";
import { uploadVideo, videoObjectKey } from "@/lib/s3";
import { createPublicSupabase } from "@/lib/supabase";
import { optimizeWebVideo } from "@/lib/web-video";

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

    const form = await request.formData();
    const kind = String(form.get("kind") ?? "");
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ message: "Choose an image or a video." }, { status: 400 });
    }
    if (kind !== "image" && kind !== "video") {
      return NextResponse.json({ message: "Choose an image or a video." }, { status: 400 });
    }

    const type = file.type || "application/octet-stream";
    const extension = extensionForType(type);

    if (kind === "video") {
      if (form.get("optimize") === "web") {
        const prepared = await optimizeWebVideo(file.stream(), type);
        const key = videoObjectKey(prepared.contentType === "video/mp4" ? "mp4" : extension);
        const path = await uploadVideo(key, prepared.body, prepared.contentType);
        return NextResponse.json({ path, kind });
      }
      const key = videoObjectKey(extension);
      const path = await uploadVideo(key, file.stream(), type);
      return NextResponse.json({ path, kind });
    }

    const bytes = new Uint8Array(await file.arrayBuffer());

    const path = `uploads/${crypto.randomUUID()}.${extension}`;
    const { error: ticketError } = await supabase.rpc("begin_media_upload", {
      raw_token: token,
      ticket_path: path,
    });
    if (ticketError) {
      return NextResponse.json({ message: ticketError.message }, { status: 400 });
    }

    const { error: uploadError } = await supabase.storage.from("media").upload(path, bytes, {
      contentType: type,
      upsert: false,
    });
    if (uploadError) {
      return NextResponse.json({ message: uploadError.message }, { status: 400 });
    }

    return NextResponse.json({ path, kind });
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : "Upload failed.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
