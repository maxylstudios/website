"use client";

import Link from "next/link";
import { Bebas_Neue, Montserrat } from "next/font/google";
import { useEffect, useMemo, useRef, useState } from "react";
import { mediaHref, mediaPublicUrl, type MediaItem } from "@/lib/media";
import { entertainmentCategory } from "@/lib/taxonomy";

const display = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-ent-display",
});

const ui = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ent-ui",
});

const accents = [
  { id: "ember", soft: "#ff7a3d", hard: "#ff5a1a", badge: "#c41e1e" },
  { id: "acid", soft: "#d6ff3d", hard: "#c4f000", badge: "#1e5a9e" },
  { id: "tide", soft: "#4de8e0", hard: "#2ad4cc", badge: "#2a6bb5" },
] as const;

type Props = {
  items: MediaItem[];
  initialId?: string;
};

export function EntertainmentStage({ items, initialId }: Props) {
  const playable = useMemo(
    () => items.filter((item) => item.kind === "video" || item.kind === "image"),
    [items],
  );
  const startIndex = Math.max(0, playable.findIndex((item) => item.id === initialId));
  const [index, setIndex] = useState(startIndex);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const active = playable[Math.min(index, Math.max(playable.length - 1, 0))] ?? null;
  const accent = accents[index % accents.length];

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !active || active.kind !== "video") return;
    video.muted = muted;
    void video.play().catch(() => undefined);
  }, [active?.id, muted]);

  if (!active) {
    return (
      <div className={`${display.variable} ${ui.variable} ent-empty`}>
        <p>Nothing in the vault yet.</p>
      </div>
    );
  }

  const categoryName = entertainmentCategory(active.category_slug)?.name ?? "Entertainment";
  const title = active.title?.trim() || "Untitled";
  const href = mediaHref(active);

  return (
    <div
      className={`${display.variable} ${ui.variable} ent-shell`}
      style={{
        ["--ent-accent" as string]: accent.soft,
        ["--ent-accent-hard" as string]: accent.hard,
        ["--ent-badge" as string]: accent.badge,
      }}
    >
      <article className="ent-stage">
        <div className="ent-stage-media" aria-hidden>
          {active.kind === "video" ? (
            <video
              ref={videoRef}
              key={active.id}
              src={mediaPublicUrl(active.storage_path)}
              className="ent-stage-video"
              autoPlay
              muted={muted}
              loop
              playsInline
              preload="auto"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mediaPublicUrl(active.storage_path)} alt="" className="ent-stage-video" />
          )}
          <div className="ent-stage-veil" />
        </div>

        <div className="ent-stage-body">
          <div className="ent-left">
            <p className="ent-kicker">{categoryName.toUpperCase()}:</p>
            <h1 className="ent-title">{title}</h1>
            <div className="ent-actions">
              <Link href={href} className="ent-play">
                <svg width="11" height="12" viewBox="0 0 9 10" aria-hidden>
                  <path d="M1.1.8v8.4L8.2 5 1.1.8Z" fill="currentColor" />
                </svg>
                PLAY
              </Link>
              {active.kind === "video" ? (
                <button type="button" className="ent-trailer" onClick={() => setMuted((value) => !value)}>
                  {muted ? "WATCH TRAILER" : "MUTE TRAILER"}
                </button>
              ) : null}
              {playable.length > 1 ? (
                <button
                  type="button"
                  className="ent-trailer"
                  onClick={() => setIndex((value) => (value + 1) % playable.length)}
                >
                  NEXT
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
