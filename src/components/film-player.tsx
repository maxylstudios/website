"use client";

import { useEffect, useRef, useState } from "react";
import { VideoMark } from "@/components/video-mark";

type Props = {
  src: string;
  title: string;
  initialRatio?: string;
};

function clock(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const whole = Math.floor(seconds);
  const minutes = Math.floor(whole / 60);
  const rest = whole % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

export function FilmPlayer({ src, title, initialRatio = "16 / 9" }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [ratio, setRatio] = useState(initialRatio);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = volume;
    video.muted = muted;
  }, [volume, muted]);

  function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
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
      ? { aspectRatio: ratio, width: `min(100%, calc(90vh * ${rw} / ${rh}))` }
      : { aspectRatio: ratio, width: "100%" };

  return (
    <div ref={shellRef} className="mx-auto w-full max-w-full bg-black" style={shellStyle}>
      <div className="relative h-full w-full">
        <video
          ref={videoRef}
          src={src}
          playsInline
          preload="metadata"
          controlsList="nodownload"
          disablePictureInPicture
          disableRemotePlayback
          className="absolute inset-0 h-full w-full object-contain"
          onContextMenu={(event) => event.preventDefault()}
          onPlay={() => setPlaying(true)}
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
        {playing ? null : (
          <button
            type="button"
            onClick={togglePlay}
            className="absolute top-1/2 left-1/2 z-10 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black"
            aria-label={`Play ${title}`}
          >
            <PlayIcon />
          </button>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-black/75 px-3 pt-3 pb-3">
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
            }}
            className="w-full accent-white"
          />
          <div className="mt-2 flex items-center gap-2">
            <button type="button" onClick={togglePlay} className="text-white" aria-label={playing ? "Pause" : "Play"}>
              {playing ? <PauseIcon /> : <PlayIcon />}
            </button>
            <span className="text-xs text-white tabular-nums">
              {clock(time)} / {clock(duration)}
            </span>
            <button
              type="button"
              onClick={() => setMuted((value) => !value)}
              className="ml-2 text-white"
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
              className="w-20 accent-white"
            />
            <button
              type="button"
              onClick={() => void copyLink()}
              className="ml-auto rounded-full border border-white/25 px-3 py-1 text-xs font-bold"
            >
              {copied ? "Copied" : "Copy link"}
            </button>
            <button type="button" onClick={() => void toggleFullscreen()} className="text-white" aria-label="Full screen">
              <FullIcon />
            </button>
          </div>
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
