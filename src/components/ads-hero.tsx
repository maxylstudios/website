"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { mediaHref, mediaPublicUrl, type MediaItem } from "@/lib/media";

type Props = {
  item: MediaItem;
  kicker: string;
  openHref?: string;
};

export function AdsHero({ item, kicker, openHref }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const href = openHref ?? mediaHref(item);
  const title = item.title?.trim() || "Featured cut";
  const blurb = item.caption?.trim() || "";

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = muted;
    void video.play().catch(() => undefined);
  }, [muted, item.id]);

  return (
    <section className="vault-hero">
      {item.kind === "video" ? (
        <video
          ref={videoRef}
          key={item.id}
          src={mediaPublicUrl(item.storage_path)}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted={muted}
          loop
          playsInline
          preload="auto"
          aria-label={title}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={mediaPublicUrl(item.storage_path)}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <div className="vault-hero-veil" aria-hidden />

      <div className="vault-hero-body">
        <p className="vault-hero-kicker">{kicker}</p>
        <h1 className="vault-hero-title">{title}</h1>
        {blurb ? <p className="vault-hero-blurb">{blurb}</p> : null}
        <div className="vault-hero-actions">
          <Link href={href} className="vault-hero-open">
            <svg width="11" height="13" viewBox="0 0 9 10" aria-hidden>
              <path d="M1.1.8v8.4L8.2 5 1.1.8Z" fill="currentColor" />
            </svg>
            Open
          </Link>
          {item.kind === "video" ? (
            <button
              type="button"
              className="vault-hero-mute"
              onClick={() => setMuted((value) => !value)}
              aria-pressed={muted}
            >
              {muted ? "Sound off" : "Sound on"}
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
