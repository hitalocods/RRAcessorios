import { put } from "@vercel/blob";

export async function uploadImageToBlob(file: File): Promise<string> {
  const blob = await put(file.name, file, {
    access: "public",
  });

  return blob.url;
}