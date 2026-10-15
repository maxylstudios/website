import { NextResponse } from "next/server";
import { extensionForType } from "@/lib/crop-image";
import { readAdminToken } from "@/lib/admin-session";
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

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ message: "Choose an image." }, { status: 400 });
    }

    const contentType = file.type || "image/jpeg";
    if (!contentType.startsWith("image/")) {
      return NextResponse.json({ message: "Choose an image file." }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) {
      return NextResponse.json({ message: "Storage is not configured." }, { status: 500 });
    }

    const path = `uploads/${crypto.randomUUID()}.${extensionForType(contentType)}`;
    const { error: ticketError } = await supabase.rpc("begin_media_upload", {
      raw_token: token,
      ticket_path: path,
    });
    if (ticketError) {
      return NextResponse.json({ message: ticketError.message }, { status: 400 });
    }

    const response = await fetch(`${url}/storage/v1/object/media/${path}`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": contentType,
        "x-upsert": "false",
      },
      body: Buffer.from(await file.arrayBuffer()),
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json({ message: text || "Storage upload failed." }, { status: 400 });
    }

    return NextResponse.json({ path });
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : "Could not upload the image.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
