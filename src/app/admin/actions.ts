"use server";

import { revalidatePath } from "next/cache";
import { extensionForType } from "@/lib/crop-image";
import { adsCategory, entertainmentCategory } from "@/lib/taxonomy";
import type { MediaItem } from "@/lib/media";
import { clearAdminToken, readAdminToken, setAdminToken } from "@/lib/admin-session";
import { deleteStoredVideo, uploadVideo, videoObjectKey } from "@/lib/s3";
import { createPublicSupabase, isMissingSchema } from "@/lib/supabase";

function schemaMessage(message: string) {
  if (isMissingSchema(message) || message.toLowerCase().includes("open_admin_session")) {
    return "Run supabase/05_admin_password.sql in the SQL editor, then try again.";
  }
  if (message.toLowerCase().includes("show_on_home") || message.toLowerCase().includes("item_show_on_home")) {
    return "Run supabase/07_homepage.sql in the SQL editor, then try again.";
  }
  if (message.toLowerCase().includes("hero_video") || message.toLowerCase().includes("save_hero_video")) {
    return "Run supabase/09_hero_video.sql in the SQL editor, then try again.";
  }
  if (message.toLowerCase().includes("object_name") || message.toLowerCase().includes("ticket_path")) {
    return "Run supabase/08_fix_upload_ticket.sql in the SQL editor, then try again.";
  }
  if (message.toLowerCase().includes("direct deletion from storage")) {
    return "Run supabase/10_delete_media.sql in the SQL editor, then try again.";
  }
  if (message.toLowerCase().includes("homepage_board") || message.toLowerCase().includes("save_homepage_board")) {
    return "Run supabase/11_homepage_board.sql in the SQL editor, then try again.";
  }
  if (message.toLowerCase().includes("poster_path") || message.toLowerCase().includes("save_item_poster")) {
    return "Run supabase/13_posters.sql in the SQL editor, then try again.";
  }
  if (
    message.toLowerCase().includes("item_subcategory") ||
    message.toLowerCase().includes("choose a subcategory") ||
    (message.toLowerCase().includes("save_media_item") && message.toLowerCase().includes("function"))
  ) {
    return "Run supabase/14_drop_subcategories.sql in the SQL editor, then try again.";
  }
  if (message.toLowerCase().includes("page_heroes") || message.toLowerCase().includes("save_page_heroes")) {
    return "Run supabase/12_page_heroes.sql in the SQL editor, then try again.";
  }
  return message;
}

async function tokenOrThrow() {
  const token = await readAdminToken();
  if (!token) throw new Error("Enter the admin password again.");
  return token;
}

export async function loginAdmin(password: string) {
  const supabase = createPublicSupabase();
  const { data, error } = await supabase.rpc("open_admin_session", {
    candidate: password,
  });

  if (error) {
    return { ok: false as const, message: schemaMessage(error.message) };
  }

  if (typeof data !== "string" || data.length === 0) {
    return { ok: false as const, message: "Wrong password." };
  }

  await setAdminToken(data);
  return { ok: true as const };
}

export async function logoutAdmin() {
  const token = await readAdminToken();
  if (token) {
    const supabase = createPublicSupabase();
    await supabase.rpc("close_admin_session", { raw_token: token });
  }
  await clearAdminToken();
}

export async function loadAdminMedia() {
  const token = await readAdminToken();
  if (!token) return { items: [] as MediaItem[], message: "Enter the admin password again." };

  const supabase = createPublicSupabase();
  const { data, error } = await supabase.rpc("list_admin_media", { raw_token: token });
  if (error) return { items: [] as MediaItem[], message: schemaMessage(error.message) };
  return { items: (data ?? []) as MediaItem[], message: "" };
}

export async function loadAdminItem(id: string) {
  const { items, message } = await loadAdminMedia();
  return { item: items.find((entry) => entry.id === id) ?? null, message };
}

export async function saveAdminMedia(formData: FormData) {
  try {
    const token = await tokenOrThrow();
    const supabase = createPublicSupabase();
    const idValue = String(formData.get("id") ?? "");
    const itemId = idValue.length > 0 ? idValue : null;
    const title = String(formData.get("title") ?? "");
    const caption = String(formData.get("caption") ?? "");
    const aspect = String(formData.get("aspect") ?? "16:9");
    const published = String(formData.get("published") ?? "") === "true";
    const showOnHome = String(formData.get("showOnHome") ?? "") === "true";
    const kind = String(formData.get("kind") ?? "");
    const existingPath = String(formData.get("existingPath") ?? "");
    const file = formData.get("file");
    const cropX = Number(formData.get("cropX") ?? 50);
    const cropY = Number(formData.get("cropY") ?? 50);
    const widthValue = formData.get("width");
    const heightValue = formData.get("height");
    const width = widthValue ? Number(widthValue) : null;
    const height = heightValue ? Number(heightValue) : null;
    const crop = kind === "video" ? { x: cropX, y: cropY } : null;
    const section = String(formData.get("section") ?? "");
    const categorySlug = String(formData.get("category") ?? "");
    const category =
      section === "entertainment" ? entertainmentCategory(categorySlug) : section === "ads" ? adsCategory(categorySlug) : null;
    if (!category || (section !== "ads" && section !== "entertainment")) {
      return { ok: false as const, message: "Choose Ads or Entertainment, then a category." };
    }

    let storagePath = existingPath;
    let savedWidth = width;
    let savedHeight = height;
    const providedPath = String(formData.get("storagePath") ?? "");

    let uploadedVideo: string | null = null;
    if (providedPath) {
      storagePath = providedPath;
      if (kind === "video") {
        uploadedVideo = providedPath;
        savedWidth = null;
        savedHeight = null;
      }
    } else if (file instanceof File && file.size > 0) {
      const type = file.type || "application/octet-stream";
      const extension = extensionForType(type);
      const bytes = new Uint8Array(await file.arrayBuffer());

      if (kind === "video") {
        const key = videoObjectKey(extension);
        storagePath = await uploadVideo(key, bytes, type);
        uploadedVideo = storagePath;
        savedWidth = null;
        savedHeight = null;
      } else {
        storagePath = `uploads/${crypto.randomUUID()}.${extension}`;
        const { error: ticketError } = await supabase.rpc("begin_media_upload", {
          raw_token: token,
          ticket_path: storagePath,
        });
        if (ticketError) throw new Error(schemaMessage(ticketError.message));

        const { error: uploadError } = await supabase.storage.from("media").upload(storagePath, bytes, {
          contentType: type,
          upsert: false,
        });
        if (uploadError) throw new Error(uploadError.message);
        savedWidth = width;
        savedHeight = height;
      }
    }

    if (!storagePath) {
      return { ok: false as const, message: "Choose an image or a video." };
    }

    const { error } = await supabase.rpc("save_media_item", {
      raw_token: token,
      item_id: itemId,
      item_title: title,
      item_label: category.name,
      item_caption: caption,
      item_kind: kind,
      item_path: storagePath,
      item_aspect: aspect,
      item_crop: crop,
      item_width: savedWidth,
      item_height: savedHeight,
      item_published: published,
      item_section: section,
      item_category: category.slug,
      item_show_on_home: showOnHome,
    });
    if (error) {
      if (uploadedVideo) await deleteStoredVideo(uploadedVideo);
      throw new Error(schemaMessage(error.message));
    }

    if (uploadedVideo && existingPath && existingPath !== uploadedVideo) {
      await deleteStoredVideo(existingPath);
    }

    revalidatePath("/");
    revalidatePath("/ads");
    revalidatePath("/entertainment");
    revalidatePath("/admin");
    return { ok: true as const };
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : "Could not save.";
    return { ok: false as const, message };
  }
}

export async function loadHeroVideo() {
  const token = await readAdminToken();
  if (!token) return { path: null as string | null, message: "Enter the admin password again." };

  const supabase = createPublicSupabase();
  const { data, error } = await supabase.from("hero_video").select("storage_path").eq("id", 1).maybeSingle();
  if (error) return { path: null as string | null, message: schemaMessage(error.message) };
  return { path: data?.storage_path ?? null, message: "" };
}

export async function saveHeroVideo(storagePath: string) {
  try {
    const token = await tokenOrThrow();
    const supabase = createPublicSupabase();
    const { data, error } = await supabase.rpc("save_hero_video", {
      raw_token: token,
      item_path: storagePath,
    });
    if (error) {
      await deleteStoredVideo(storagePath);
      throw new Error(schemaMessage(error.message));
    }
    const previous = typeof data === "string" ? data : "";
    if (previous && previous !== storagePath) await deleteStoredVideo(previous);
    revalidatePath("/");
    revalidatePath("/admin/hero");
    return { ok: true as const };
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : "Could not save the hero video.";
    return { ok: false as const, message };
  }
}

export async function clearHeroVideo() {
  try {
    const token = await tokenOrThrow();
    const supabase = createPublicSupabase();
    const { data, error } = await supabase.rpc("clear_hero_video", { raw_token: token });
    if (error) throw new Error(schemaMessage(error.message));
    if (typeof data === "string" && data) await deleteStoredVideo(data);
    revalidatePath("/");
    revalidatePath("/admin/hero");
    return { ok: true as const };
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : "Could not remove the hero video.";
    return { ok: false as const, message };
  }
}

export async function saveHomepageBoard(videoIds: string[], imageIds: string[]) {
  try {
    const token = await tokenOrThrow();
    const supabase = createPublicSupabase();
    const { error } = await supabase.rpc("save_homepage_board", {
      raw_token: token,
      next_videos: videoIds,
      next_images: imageIds,
    });
    if (error) throw new Error(schemaMessage(error.message));
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/home");
    return { ok: true as const };
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : "Could not save the homepage.";
    return { ok: false as const, message };
  }
}

export async function saveItemPoster(id: string, path: string) {
  try {
    const token = await tokenOrThrow();
    const supabase = createPublicSupabase();
    const { error } = await supabase.rpc("save_item_poster", {
      raw_token: token,
      item_id: id,
      item_path: path,
    });
    if (error) throw new Error(schemaMessage(error.message));
    revalidatePath("/");
    revalidatePath("/admin/home");
    return { ok: true as const };
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : "Could not save the poster.";
    return { ok: false as const, message };
  }
}

export async function savePageHeroes(heroes: Record<string, string>) {
  try {
    const token = await tokenOrThrow();
    const supabase = createPublicSupabase();
    const { error } = await supabase.rpc("save_page_heroes", {
      raw_token: token,
      heroes,
    });
    if (error) throw new Error(schemaMessage(error.message));
    revalidatePath("/ads", "layout");
    revalidatePath("/entertainment", "layout");
    revalidatePath("/admin/features");
    return { ok: true as const };
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : "Could not save the page heroes.";
    return { ok: false as const, message };
  }
}

export async function removeAdminMedia(id: string) {
  try {
    const token = await tokenOrThrow();
    const supabase = createPublicSupabase();
    const { items } = await loadAdminMedia();
    const current = items.find((entry) => entry.id === id);
    const { error } = await supabase.rpc("delete_media_item", {
      raw_token: token,
      item_id: id,
    });
    if (error) throw new Error(schemaMessage(error.message));
    if (current?.kind === "video") {
      try {
        await deleteStoredVideo(current.storage_path);
      } catch {
        // The catalogue row is already gone. A storage miss should not undo that.
      }
    }
    revalidatePath("/");
    revalidatePath("/ads");
    revalidatePath("/entertainment");
    revalidatePath("/admin");
    return { ok: true as const };
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : "Could not delete.";
    return { ok: false as const, message };
  }
}
