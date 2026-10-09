/** Grab a still from a local video File in the browser (no server ffmpeg). */
export async function grabVideoPosterFile(file: File, atSeconds = 1.5): Promise<File | null> {
  if (!file.type.startsWith("video/")) return null;

  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.src = url;

  try {
    await new Promise<void>((resolve, reject) => {
      video.onloadeddata = () => resolve();
      video.onerror = () => reject(new Error("Could not read that video for a poster."));
    });

    const duration = video.duration;
    const tip =
      Number.isFinite(duration) && duration > 0
        ? Math.min(atSeconds, Math.max(0.05, duration * 0.08))
        : 0.1;

    if (video.readyState >= 2) {
      await new Promise<void>((resolve) => {
        const done = () => {
          video.removeEventListener("seeked", done);
          resolve();
        };
        video.addEventListener("seeked", done);
        try {
          video.currentTime = tip;
        } catch {
          resolve();
        }
      });
    }

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.88));
    if (!blob || blob.size < 64) return null;

    const stem = file.name.replace(/\.[^.]+$/, "") || "film";
    return new File([blob], `${stem}-poster.jpg`, { type: "image/jpeg" });
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
    video.removeAttribute("src");
    video.load();
  }
}
