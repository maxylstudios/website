type PixelCrop = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not read that image."));
    image.src = src;
  });
}

export async function cropImage(src: string, crop: PixelCrop, type: string) {
  const image = await loadImage(src);
  const maxEdge = 2400;
  const scale = Math.min(1, maxEdge / Math.max(crop.width, crop.height));
  const width = Math.max(1, Math.round(crop.width * scale));
  const height = Math.max(1, Math.round(crop.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not crop that image.");

  const outputType = type === "image/png" || type === "image/webp" ? type : "image/jpeg";
  context.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, outputType, 0.92);
  });
  if (!blob) throw new Error("Could not crop that image.");
  return { blob, width, height, type: outputType };
}

export function extensionForType(type: string) {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/gif") return "gif";
  if (type === "video/webm") return "webm";
  if (type === "video/quicktime") return "mov";
  if (type.startsWith("video/")) return "mp4";
  return "jpg";
}
