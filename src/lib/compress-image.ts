// Reduz a foto no navegador antes de enviar (economiza Blob, banda e tempo de funcao na Vercel).
const MAX_SIZE = 1200; // px no maior lado
const QUALITY = 0.8;

export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.type === "image/svg+xml") {
    return file;
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIZE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", QUALITY));
  if (!blob || blob.size >= file.size) return file;

  return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", { type: "image/webp" });
}
