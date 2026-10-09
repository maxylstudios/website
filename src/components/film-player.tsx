"use client";

import { useEffect, useRef, useState } from "react";
import { VideoMark } from "@/components/video-mark";

type Props = {
  src: string;
  title: string;
  poster?: string;
  initialRatio?: string;
};

function clock(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const whole = Math.floor(seconds);
  const minutes = Math.floor(whole / 60);
  const rest = whole % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

export function FilmPlayer({ src, title, poster, initialRatio = "16 / 9" }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [ratio, setRatio] = useState(initialRatio);
  const [controls, setControls] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = volume;
    video.muted = muted;
  }, [volume, muted]);

  useEffect(() => {
    if (!playing) {
      setControls(true);
      return;
    }
    const hide = window.setTimeout(() => setControls(false), 2400);
    return () => window.clearTimeout(hide);
  }, [playing, time, controls]);

  function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
      setStarted(true);
    } else {
      video.pause();
    }
  }

  function setLevel(next: number) {
    const level = Math.min(1, Math.max(0, next));
    setVolume(level);
    setMuted(level === 0);
  }

  async function copyLink() {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      const field = document.createElement("textarea");
      field.value = url;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.left = "-9999px";
      document.body.appendChild(field);
      field.select();
      setCopied(document.execCommand("copy"));
      field.remove();
    }
    window.setTimeout(() => setCopied(false), 1600);
  }

  async function toggleFullscreen() {
    const shell = shellRef.current;
    if (!shell) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await shell.requestFullscreen();
    }
  }

  const quiet = muted || volume === 0;
  const [rw, rh] = ratio.split("/").map((part) => Number(part.trim()));
  const shellStyle =
    rw > 0 && rh > 0
      ? { aspectRatio: ratio, width: `min(100%, calc(82svh * ${rw} / ${rh}))` }
      : { aspectRatio: ratio, width: "100%" };

  return (
    <div
      ref={shellRef}
      className="mx-auto w-full overflow-hidden rounded-2xl border border-white/15 bg-neutral-950 shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
      style={shellStyle}
      onMouseMove={() => setControls(true)}
      onTouchStart={() => setControls(true)}
    >
      <div className="relative h-full w-full">
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          playsInline
          preload="none"
          controlsList="nodownload"
          disablePictureInPicture
          disableRemotePlayback
          className="absolute inset-0 h-full w-full object-contain"
          onContextMenu={(event) => event.preventDefault()}
          onPlay={() => {
            setPlaying(true);
            setStarted(true);
          }}
          onPause={() => setPlaying(false)}
          onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
          onLoadedMetadata={(event) => {
            const video = event.currentTarget;
            setDuration(video.duration);
            if (video.videoWidth && video.videoHeight) {
              setRatio(`${video.videoWidth} / ${video.videoHeight}`);
            }
          }}
          onClick={togglePlay}
        />
        <VideoMark />

        {!playing ? (
          <button
            type="button"
            onClick={togglePlay}
            className="absolute top-1/2 left-1/2 z-10 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/45 bg-black/30 text-white/90 backdrop-blur-[2px] transition hover:bg-black/45 sm:h-16 sm:w-16"
            aria-label={`Play ${title}`}
          >
            <PlayIcon />
          </button>
        ) : null}

        <div
          className={`absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/90 via-black/55 to-transparent px-3 pt-10 pb-3 transition-opacity duration-300 sm:px-4 sm:pb-4 ${
            controls || !playing ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={Math.min(time, duration || 0)}
            aria-label="Seek"
            onChange={(event) => {
              const next = Number(event.target.value);
              const video = videoRef.current;
              if (video) video.currentTime = next;
              setTime(next);
              setStarted(true);
            }}
            className="film-seek w-full"
          />
          <div className="mt-2.5 flex items-center gap-2.5 sm:gap-3">
            <button type="button" onClick={togglePlay} className="text-white" aria-label={playing ? "Pause" : "Play"}>
              {playing ? <PauseIcon /> : <PlayIcon />}
            </button>
            <span className="text-[11px] text-white/85 tabular-nums sm:text-xs">
              {clock(time)}
              <span className="text-white/45"> / {clock(duration)}</span>
            </span>
            <button
              type="button"
              onClick={() => setMuted((value) => !value)}
              className="text-white"
              aria-pressed={quiet}
              aria-label={quiet ? "Unmute" : "Mute"}
            >
              {quiet ? <MutedIcon /> : <SoundIcon />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={quiet ? 0 : volume}
              aria-label="Volume"
              onChange={(event) => setLevel(Number(event.target.value))}
              className="film-seek hidden w-20 sm:block"
            />
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => void copyLink()}
                className="rounded-full border border-white/25 px-2.5 py-1 text-[11px] font-bold text-white/90 sm:px-3 sm:text-xs"
              >
                {copied ? "Copied" : "Copy link"}
              </button>
              <button type="button" onClick={() => void toggleFullscreen()} className="text-white" aria-label="Full screen">
                <FullIcon />
              </button>
            </div>
          </div>
          {!started ? <p className="sr-only">Press play to start the film.</p> : null}
        </div>
      </div>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path d="M5 3.5v11l10-5.5L5 3.5Z" fill="currentColor" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path d="M4 3h4v12H4V3Zm6 0h4v12h-4V3Z" fill="currentColor" />
    </svg>
  );
}

function SoundIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path d="M3 7h3l4-3v10L6 11H3V7Zm9 2a3 3 0 0 0-1.2-2.4v4.8A3 3 0 0 0 12 9Z" fill="currentColor" />
    </svg>
  );
}

function MutedIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path d="M3 7h3l4-3v10L6 11H3V7Zm9.2.8 2.2 2.2 2.2-2.2.8.8-2.2 2.2 2.2 2.2-.8.8-2.2-2.2-2.2 2.2-.8-.8 2.2-2.2-2.2-2.2.8-.8Z" fill="currentColor" />
    </svg>
  );
}

function FullIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path d="M3 7V3h4v2H5v2H3Zm8-4h4v4h-2V5h-2V3ZM3 11h2v2h2v2H3v-4Zm10 2h-2v2H7v-2h2v2h4v-4Z" fill="currentColor" />
    </svg>
  );
}
