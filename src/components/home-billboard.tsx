"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SectionLinks } from "@/components/section-links";
import { VideoMark } from "@/components/video-mark";
import { mediaHref, mediaPublicUrl, type MediaItem } from "@/lib/media";

function VolumeCast({ muted }: { muted: boolean }) {
  return (
    <span
      className={`flex shrink-0 items-end gap-1.5 text-[#c4b5fd] ${muted ? "motion-safe:animate-pulse" : ""}`}
      aria-hidden
    >
      <svg width="22" height="22" viewBox="0 0 24 24" className="shrink-0">
        <path
          d="M5 12.2V10a7 7 0 0 1 14 0v2.2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <rect x="2.4" y="11.2" width="4.2" height="6.4" rx="1.4" fill="currentColor" />
        <rect x="17.4" y="11.2" width="4.2" height="6.4" rx="1.4" fill="currentColor" />
      </svg>
      <svg width="18" height="22" viewBox="0 0 18 24" className="shrink-0">
        <path
          d="M9 2.2c-3.3 0-5.8 2.5-5.8 6.1 0 2 .6 3.3 1.5 4.4.6.8 1 1.5 1 2.3v3.2h3.6v-1.5c0-1.2.4-2 1.2-2.9 1-1.2 1.6-2.2 1.6-4.3 0-3.4-2.2-7.3-6.1-7.3Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M9 7.2c-1.3 0-2.2 1-2.2 2.4 0 1 .4 1.7 1 2.3.4.4.5.8.5 1.2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
      <svg width="16" height="20" viewBox="0 0 16 22" className={`shrink-0 ${muted ? "" : "text-white"}`}>
        <path
          d="M6.2 16.8a2.1 2.1 0 1 1-1.5-2V5.4L14 3.2v7.4a2.1 2.1 0 1 1-1.5-2V5.2L6.2 6.8v10Z"
          fill="currentColor"
        />
      </svg>
      <svg width="16" height="18" viewBox="0 0 16 18" className={`shrink-0 ${muted ? "opacity-45" : "text-white"}`}>
        <path d="M2 11c1.1-1.3 1.1-2.5 0-3.8" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M6.2 13.4c2-2.2 2-5.8 0-8" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M10.4 15.6c2.8-3 2.8-9.2 0-12.2" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    </span>
  );
}

function CueBars({ live }: { live: boolean }) {
  return (
    <span className="flex h-4 items-end gap-[3px]" aria-hidden>
      {[0, 1, 2, 3].map((index) => (
        <span
          key={index}
          className="w-[3px] bg-current"
          style={
            live
              ? { height: "100%" }
              : { animation: `cue-bar 0.75s ease-in-out ${index * 0.12}s infinite` }
          }
        />
      ))}
    </span>
  );
}

type Props = {
  item: MediaItem;
  kicker?: string;
  blurb?: string | null;
  secondaryHref?: string;
  secondaryLabel?: string;
  links?: { href: string; label: string }[];
  /** overlay keeps type on the picture. stage puts the title card under the video. */
  layout?: "overlay" | "stage";
  /** null hides the film link. Omit it to open the catalogue film. */
  playHref?: string | null;
};

export function HomeBillboard({
  item,
  kicker = "Maxyl Studios",
  blurb,
  secondaryHref = "/ads",
  secondaryLabel = "See the ads",
  links = [],
  layout = "overlay",
  playHref,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = muted;
    void video.play().catch(() => undefined);
  }, [muted, item.id]);

  const line =
    item.caption?.trim() ||
    (blurb === null ? "" : blurb || "Films and ads from the studio — shot, shaped, and finished for the screen.");

  const actions = (
    <div className="flex flex-wrap items-center gap-3">
      <Link
        href={mediaHref(item)}
        className="rounded bg-white px-6 py-3 text-sm font-bold text-black transition hover:bg-white/90"
      >
        Play
      </Link>
      {links.length === 0 ? (
        <Link
          href={secondaryHref}
          className="rounded border border-white/35 px-6 py-3 text-sm font-bold text-white transition hover:border-white/60"
        >
          {secondaryLabel}
        </Link>
      ) : null}
      <button
        type="button"
        onClick={() => setMuted((value) => !value)}
        className="rounded px-3 py-3 text-sm text-white/70 transition hover:text-white"
        aria-pressed={muted}
        aria-label={muted ? "Unmute trailer" : "Mute trailer"}
      >
        {muted ? "Sound off" : "Sound on"}
      </button>
    </div>
  );

  const video = (
    <video
      ref={videoRef}
      key={item.id}
      src={
        item.id === "hero" ? `${mediaPublicUrl(item.storage_path)}?v=2` : mediaPublicUrl(item.storage_path)
      }
      className="absolute inset-0 h-full w-full object-cover"
      autoPlay
      muted={muted}
      loop
      playsInline
      preload="auto"
      fetchPriority="high"
      aria-label={item.title}
    />
  );

  if (layout === "stage") {
    return (
      <section className="flex h-svh flex-col bg-black pt-16">
        <div className="flex shrink-0 flex-nowrap items-center justify-center gap-3 border-b border-[#8b5cf6]/80 bg-[linear-gradient(90deg,transparent,rgba(139,92,246,0.22),transparent)] px-4 py-3 text-center sm:gap-4">
          <p className="flex min-w-0 items-center justify-center gap-2 text-sm text-white sm:gap-3">
            <VolumeCast muted={muted} />
            <span className="hidden sm:inline">{muted ? "Watch it with the volume on?" : "Now you can hear it."}</span>
          </p>
          <button
            type="button"
            onClick={() => setMuted((value) => !value)}
            className={`group relative inline-flex items-center gap-2.5 px-5 py-2 text-[13px] font-bold tracking-[0.2em] uppercase transition duration-200 active:translate-y-px ${
              muted
                ? "bg-transparent text-[#c4b5fd] hover:bg-[#8b5cf6] hover:text-black"
                : "bg-[#8b5cf6] text-black hover:bg-[#a78bfa]"
            }`}
            aria-pressed={muted}
            aria-label={muted ? "Unmute" : "Mute"}
          >
            <span className="pointer-events-none absolute top-0 left-0 h-2 w-2 border-t-2 border-l-2 border-current" />
            <span className="pointer-events-none absolute top-0 right-0 h-2 w-2 border-t-2 border-r-2 border-current" />
            <span className="pointer-events-none absolute bottom-0 left-0 h-2 w-2 border-b-2 border-l-2 border-current" />
            <span className="pointer-events-none absolute right-0 bottom-0 h-2 w-2 border-r-2 border-b-2 border-current" />
            <CueBars live={!muted} />
            {muted ? "Unmute" : "Mute"}
          </button>
        </div>
        <div
          className="relative min-h-0 flex-1 cursor-pointer overflow-hidden"
          onClick={(event) => {
            if ((event.target as HTMLElement).closest("a, button")) return;
            setMuted((value) => !value);
          }}
        >
          {video}
          <VideoMark />
          <div
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,black_0%,rgba(0,0,0,0.72)_18%,transparent_46%)]"
            aria-hidden
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-6 px-5 pb-8 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:px-12 lg:pb-10">
            <div className="max-w-xl">
              <span className="mb-4 block h-0.5 w-10 bg-[#8b5cf6]" aria-hidden />
              <h1 className="text-4xl leading-[1.05] font-bold sm:text-5xl">Ads and films.</h1>
              <p className="mt-3 max-w-md text-sm leading-6 text-white/80 sm:text-base">
                Commercials, product films, and pictures for brands.
              </p>
            </div>
            <div className="pointer-events-auto flex flex-wrap items-center gap-3">
              <Link
                href="/ads"
                className="rounded bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-white/90"
              >
                See the ads
              </Link>
              <Link
                href="/entertainment"
                className="rounded border border-white/40 px-5 py-3 text-sm font-bold transition hover:border-white"
              >
                Entertainment
              </Link>
              {(playHref === undefined ? mediaHref(item) : playHref) ? (
                <Link
                  href={playHref === undefined ? mediaHref(item) : playHref}
                  className="px-2 py-3 text-sm font-bold text-white/80 transition hover:text-white"
                >
                  This film
                </Link>
              ) : null}
            </div>
          </div>
        </div>
        {links.length > 0 ? <SectionLinks links={links} className="px-5 py-5 sm:px-8 lg:px-12" /> : null}
      </section>
    );
  }

  return (
    <section className="bg-black">
      <div className="relative isolate min-h-[min(92svh,56rem)] w-full overflow-hidden">
        {video}
        <VideoMark />
        <div className="relative flex min-h-[min(92svh,56rem)] flex-col justify-end px-5 pb-16 pt-28 sm:px-8 sm:pb-20 lg:px-12">
          <p className="text-xs font-semibold tracking-[0.32em] text-white uppercase drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)]">
            {kicker}
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl leading-[0.95] font-bold text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.85)] sm:text-6xl lg:text-7xl">
            {item.title}
          </h1>
          {line ? (
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/90 drop-shadow-[0_1px_10px_rgba(0,0,0,0.85)] sm:text-base">
              {line}
            </p>
          ) : null}
          <div className="mt-8">{actions}</div>
        </div>
      </div>
      {links.length > 0 ? (
        <SectionLinks links={links} className="px-5 py-5 sm:px-8 lg:px-12" />
      ) : null}
    </section>
  );
}
