import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function supabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase URL and publishable key are missing.");
  }
  return { url, key };
}

export function createPublicSupabase() {
  const { url, key } = supabaseEnv();
  return createClient(url, key);
}

let browserClient: SupabaseClient | null = null;

export function getBrowserSupabase() {
  if (!browserClient) {
    const { url, key } = supabaseEnv();
    browserClient = createClient(url, key);
  }
  return browserClient;
}

export function isMissingSchema(message: string) {
  const text = message.toLowerCase();
  return (
    text.includes("schema cache") ||
    text.includes("does not exist") ||
    (text.includes("media_items") && text.includes("relation"))
  );
}
