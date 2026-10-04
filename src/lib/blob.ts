import { del, put } from "@vercel/blob";

const MAX_BYTES = 4 * 1024 * 1024;

export async function uploadImageToBlob(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Arquivo precisa ser uma imagem");
  if (file.size > MAX_BYTES) throw new Error("Imagem muito grande (max 4 MB)");

  const extension = file.name.split(".").pop() || "webp";
  const blob = await put(`products/${crypto.randomUUID()}.${extension}`, file, {
    access: "public",
    contentType: file.type,
    cacheControlMaxAge: 60 * 60 * 24 * 365, // nome unico -> pode cachear 1 ano
  });

  return blob.url;
}

export async function deleteImageFromBlob(url: string | null | undefined) {
  if (!url || !url.includes(".blob.vercel-storage.com")) return;
  try {
    await del(url);
  } catch {
    // nao bloqueia a operacao se a imagem ja nao existir
  }
}