export function VideoMark() {
  return (
    <span className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center" aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/maxyl_logo_transparent.png"
        alt=""
        draggable={false}
        className="w-[min(38%,18rem)] opacity-30 select-none"
      />
    </span>
  );
}
