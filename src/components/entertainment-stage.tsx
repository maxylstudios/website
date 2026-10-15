"use client";

import Link from "next/link";
import { Montserrat } from "next/font/google";
import { useEffect, useMemo, useRef, useState } from "react";
import { entertainmentDossier } from "@/lib/entertainment-dossier";
import { mediaHref, mediaPublicUrl, type MediaItem } from "@/lib/media";

const ui = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ent-ui",
});

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

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !active || active.kind !== "video") return;
    video.muted = muted;
    void video.play().catch(() => undefined);
  }, [active, muted]);

  if (!active) {
    return (
      <div className={`${ui.variable} ent-empty`}>
        <p>Nothing in the vault yet.</p>
      </div>
    );
  }

  const title = active.title?.trim() || "Untitled";
  const href = mediaHref(active);
  const dossier = entertainmentDossier(active);

  return (
    <div className={`${ui.variable} ent-shell`}>
      <article className="ent-stage">
        <div className="ent-stage-media">
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

        <div className="ent-feature-copy">
          <p className="ent-feature-kicker">Now featuring · {dossier.room}</p>
          <h1 className="ent-feature-title">{title}</h1>
          <p className="ent-feature-line">{dossier.caption}</p>
          <div className="ent-feature-actions">
            <Link href={href} className="case-watch">
              Watch
            </Link>
            {active.kind === "video" ? (
              <button type="button" className="case-out" onClick={() => setMuted((value) => !value)}>
                {muted ? "Sound" : "Mute"}
              </button>
            ) : null}
            {playable.length > 1 ? (
              <button
                type="button"
                className="case-out"
                onClick={() => setIndex((value) => (value + 1) % playable.length)}
              >
                Next film
              </button>
            ) : null}
          </div>
        </div>
      </article>
    </div>
  );
}
