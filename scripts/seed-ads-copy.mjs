/**
 * Fill sample title/caption/client/role/style for Ads films missing copy.
 *
 *   MAXYL_ADMIN_PASSWORD='...' npm run ads:seed-copy
 *
 * Requires supabase/17_ads_meta.sql.
 */

import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

function loadEnvFile(path: string) {
  if (!existsSync(path)) return;
  const text = readFileSync(path, "utf8");
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvFile(join(process.cwd(), ".env.local"));

async function rpc(name, body) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
  const response = await fetch(`${base}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  if (!response.ok) {
    try {
      const parsed = JSON.parse(text);
      return { data: null, error: parsed.message || text };
    } catch {
      return { data: null, error: text || response.statusText };
    }
  }
  if (!text) return { data: null, error: null };
  try {
    return { data: JSON.parse(text), error: null };
  } catch {
    return { data: text, error: null };
  }
}

const categoryMeta = {
  "fashion-and-lifestyle": {
    clients: ["Atelier Noir", "Lumen Wear", "Meralda"],
    roles: ["Fashion film", "Lifestyle spot", "Lookbook reel"],
    styles: ["Photoreal", "Editorial", "Soft light"],
    captions: [
      "Cloth, cast, and colour cut for the scroll.",
      "A quiet luxury mood built for product and people.",
      "Movement first — the garment does the talking.",
    ],
  },
  "products-and-fmcg": {
    clients: ["North Pantry", "Volt Care", "Daily Form"],
    roles: ["Product film", "Hero spot", "Launch cut"],
    styles: ["Macro", "Clean studio", "Photoreal"],
    captions: [
      "Pack, pour, and proof in one tight beat.",
      "Shelf energy without the shelf noise.",
      "The product stays centre. Everything else supports.",
    ],
  },
  "automotive-and-mobility": {
    clients: ["Apex Mobility", "Line Drive", "Orbit EV"],
    roles: ["Auto film", "Motion study", "Brand film"],
    styles: ["Cinematic", "Night grade", "Photoreal"],
    captions: [
      "Road, body, and light in one continuous pass.",
      "Speed felt, not shouted.",
      "A machine portrait with room to breathe.",
    ],
  },
  "sports-and-fitness": {
    clients: ["Pulse Lab", "Iron Coast", "Form Athletics"],
    roles: ["Training film", "Campaign cut", "Athlete reel"],
    styles: ["High energy", "Handheld", "Grit grade"],
    captions: [
      "Sweat, timing, and the last rep.",
      "Bodies in motion, brand in the frame.",
      "Built for the warm-up and the finish.",
    ],
  },
  "real-estate-and-architecture": {
    clients: ["Harbour Estates", "Axis Homes", "Stone & Glass"],
    roles: ["Property film", "Architecture tour", "Walkthrough"],
    styles: ["Wide lens", "Golden hour", "Still-life"],
    captions: [
      "Space, light, and the path through a room.",
      "A home told as a quiet sequence.",
      "Architecture with a human pace.",
    ],
  },
  "finance-and-corporate": {
    clients: ["Ledger & Co", "North Trust", "Plain Capital"],
    roles: ["Corporate film", "Brand film", "Explainer"],
    styles: ["Clean grade", "Boardroom", "Minimal"],
    captions: [
      "Clarity over clutter. Trust in the cut.",
      "A company story without the jargon pile.",
      "People, process, and a steady tone.",
    ],
  },
  "education-and-information": {
    clients: ["Open Lecture", "Skillform", "Signal School"],
    roles: ["Explainer", "Course trailer", "Info film"],
    styles: ["Graphic mix", "Friendly", "Clear cut"],
    captions: [
      "Ideas made easy to follow.",
      "Teaching that still feels cinematic.",
      "One concept, one clean path.",
    ],
  },
  entertainment: {
    clients: ["Stage Door", "Night Circuit", "Studio Maxyl"],
    roles: ["Promo", "Trailer cut", "Event film"],
    styles: ["Neon grade", "Performance", "Bold type"],
    captions: [
      "Energy for the night and the feed.",
      "A show sold in thirty sharp seconds.",
      "Crowd, cue, and cut.",
    ],
  },
  "mythology-and-fantasy": {
    clients: ["Fable Works", "Myth Engine", "Astral Ink"],
    roles: ["World film", "Fantasy spot", "Lore reel"],
    styles: ["VFX heavy", "Painterly", "Epic grade"],
    captions: [
      "Gods, grain, and a larger world.",
      "Fantasy framed like a brand film.",
      "Legend, condensed.",
    ],
  },
  "advertising-and-social": {
    clients: ["Quick Signal", "Social North", "Cut Desk"],
    roles: ["Social cut", "Paid silent", "Hook reel"],
    styles: ["Vertical first", "Fast cut", "Bold open"],
    captions: [
      "Made to stop the thumb.",
      "Silent-friendly and still loud.",
      "Hook, hold, handoff.",
    ],
  },
  "ai-talent-and-avatars": {
    clients: ["Avatar Lab", "Face Forward", "Synth Cast"],
    roles: ["AI talent film", "Avatar demo", "Cast study"],
    styles: ["GenAI", "Character", "Hybrid"],
    captions: [
      "A face that can change with the brief.",
      "Talent without the call sheet drag.",
      "Directed GenAI, not random noise.",
    ],
  },
  "product-and-app-demos": {
    clients: ["App Harbor", "Interface Co", "Tapline"],
    roles: ["App demo", "UI film", "Product walkthrough"],
    styles: ["UI clean", "Screen capture", "Soft 3D"],
    captions: [
      "The product does the demo.",
      "Screens with a human rhythm.",
      "Tap, reveal, retain.",
    ],
  },
  "animation-and-creative-styles": {
    clients: ["Frame Forge", "Ink Motion", "Color Orbit"],
    roles: ["Motion piece", "Style film", "Animated spot"],
    styles: ["2D motion", "3D stylized", "Mixed media"],
    captions: [
      "Style as the strategy.",
      "Illustration that moves with intent.",
      "A look you can recognise in one beat.",
    ],
  },
  localisation: {
    clients: ["Polyglot Brand", "Region Desk", "Voice Across"],
    roles: ["Local cut", "Language adapt", "Market version"],
    styles: ["Multi-market", "Clean VO", "Matched grade"],
    captions: [
      "Same film, right language, right market.",
      "Local without losing the brand spine.",
      "One master, many rooms.",
    ],
  },
};

const fallback = {
  clients: ["Maxyl Studios"],
  roles: ["Brand film", "Campaign cut", "Studio piece"],
  styles: ["Photoreal", "Cinematic", "Editorial"],
  captions: [
    "A studio cut built for the brand and the scroll.",
    "Directed GenAI with a finished grade.",
    "Picture, pace, and a clear point.",
  ],
};

function pick(list, seed, salt) {
  const hex = createHash("sha1").update(`${seed}:${salt}`).digest("hex");
  const index = Number.parseInt(hex.slice(0, 8), 16) % list.length;
  return list[index];
}

function prettyTitle(raw) {
  const cleaned = raw
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return "Untitled film";
  return cleaned
    .split(" ")
    .map((word) => {
      if (/^[0-9]+$/.test(word)) return word;
      if (word.length <= 2) return word.toUpperCase();
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

async function main() {
  const password = process.env.MAXYL_ADMIN_PASSWORD;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!password || !url || !key) {
    throw new Error("Need MAXYL_ADMIN_PASSWORD and Supabase env in .env.local");
  }

  const login = await rpc<string>("open_admin_session", { candidate: password });
  if (login.error || typeof login.data !== "string") throw new Error(login.error || "Login failed");
  const token = login.data;

  const listed = await rpc<Row[]>("list_admin_media", { raw_token: token });
  if (listed.error || !listed.data) throw new Error(listed.error || "Could not list media");

  const ads = listed.data.filter((row) => row.section === "ads" && row.kind === "video");
  console.log(`Seeding ${ads.length} ads film(s)…`);

  let ok = 0;
  let fail = 0;

  for (const row of ads) {
    const id = String(row.id);
    const slug = String(row.category_slug || "");
    const pack = categoryMeta[slug] ?? fallback;
    const title = prettyTitle(String(row.title || "Untitled film"));
    const caption = String(row.caption || "").trim() || pick(pack.captions, id, "caption");
    const client = String(row.client || "").trim() || pick(pack.clients, id, "client");
    const role = String(row.role || "").trim() || pick(pack.roles, id, "role");
    const style = String(row.style_tag || "").trim() || pick(pack.styles, id, "style");

    process.stdout.write(`${title} … `);
    const saved = await rpc("save_item_ads_meta", {
      raw_token: token,
      item_id: id,
      item_title: title,
      item_caption: caption,
      item_client: client,
      item_role: role,
      item_style: style,
    });
    if (saved.error) {
      console.log(saved.error);
      fail += 1;
    } else {
      console.log("ok");
      ok += 1;
    }
  }

  await rpc("close_admin_session", { raw_token: token });
  console.log(`\nDone. ${ok} saved, ${fail} failed.`);
  if (fail) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
