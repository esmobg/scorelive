const MAX_BYTES = 2 * 1024 * 1024;
const MAX_EDGE = 128;
const JPEG_QUALITY = 0.72;

export type LogoCompressResult =
  | { ok: true; dataUrl: string }
  | { ok: false; error: "type" | "size" | "read" };

const ALLOWED = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/svg+xml",
  "image/webp",
]);

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("read"));
      }
    };
    reader.onerror = () => reject(new Error("read"));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("read"));
    img.src = src;
  });
}

/**
 * Read a team logo file and produce a compressed data URL for localStorage.
 * SVG is stored as-is (already small); raster images are resized via canvas.
 */
export async function compressLogoFile(file: File): Promise<LogoCompressResult> {
  if (!ALLOWED.has(file.type)) {
    return { ok: false, error: "type" };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: "size" };
  }

  try {
    if (file.type === "image/svg+xml") {
      const dataUrl = await readAsDataUrl(file);
      if (dataUrl.length > 180_000) {
        return { ok: false, error: "size" };
      }
      return { ok: true, dataUrl };
    }

    const original = await readAsDataUrl(file);
    const img = await loadImage(original);
    const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height, 1));
    const width = Math.max(1, Math.round(img.width * scale));
    const height = Math.max(1, Math.round(img.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return { ok: false, error: "read" };
    }
    ctx.drawImage(img, 0, 0, width, height);
    const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
    if (dataUrl.length > 180_000) {
      return { ok: false, error: "size" };
    }
    return { ok: true, dataUrl };
  } catch {
    return { ok: false, error: "read" };
  }
}
