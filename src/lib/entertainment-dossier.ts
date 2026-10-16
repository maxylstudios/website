import { catalogueSlug, isExternalUrl, type MediaItem } from "@/lib/media";

export type EntertainmentDossier = {
  room: "Films" | "Microdramas";
  caption: string;
  client: string;
  role: string;
  style: string;
  url: string;
};

const filmLooks = ["Cinematic", "Photoreal", "Epic scale", "Night grade", "GenAI"];
const microLooks = ["Vertical", "Binge cut", "Phone-first", "Serial", "GenAI"];

const partnerLinks = [
  "https://kukufm.com/",
  "https://www.instagram.com/kuku_fm/",
  "https://www.youtube.com/@kukufm",
  "https://x.com/kukufmofficial",
];

function hash(seed: string, salt: string) {
  let value = 0;
  const text = `${seed}:${salt}`;
  for (let index = 0; index < text.length; index += 1) {
    value = (value * 33 + text.charCodeAt(index)) >>> 0;
  }
  return value;
}

function pick<T>(list: T[], seed: string, salt: string) {
  return list[hash(seed, salt) % list.length];
}

export function partnerLabel(url: string, room: EntertainmentDossier["room"]) {
  if (room === "Microdramas" || /kuku/i.test(url)) return "Kuku TV";
  if (url.includes("instagram.com")) return "Instagram";
  if (url.includes("youtube.com")) return "YouTube";
  if (url.includes("x.com") || url.includes("twitter.com")) return "X";
  return "Link";
}

export function entertainmentDossier(
  item: Pick<
    MediaItem,
    "id" | "title" | "caption" | "client" | "role" | "style_tag" | "external_url" | "category_slug" | "subcategory_slug" | "section"
  >,
): EntertainmentDossier {
  const slug = catalogueSlug(item);
  const room = slug === "microdramas" ? "Microdramas" : "Films";
  const title = item.title?.trim() || "Untitled";
  const micro = room === "Microdramas";

  const caption =
    item.caption?.trim() ||
    (micro
      ? `${title} is a Maxyl microdrama — a short, bingeable story cut for the phone and carried on Kuku TV.`
      : `${title} is an original Maxyl film. GenAI is the camera and the set. The cut, the grade, and the taste stay with the studio.`);

  return {
    room,
    caption,
    client: item.client?.trim() || "Maxyl Studios",
    role: item.role?.trim() || (micro ? "Microdrama" : "Original film"),
    style: item.style_tag?.trim() || pick(micro ? microLooks : filmLooks, item.id, "look"),
    url: isExternalUrl(item.external_url) || (micro ? "https://kukufm.com/" : pick(partnerLinks, item.id, "link")),
  };
}
