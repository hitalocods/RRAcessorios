"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { deleteImageFromBlob, uploadImageToBlob } from "@/lib/blob";
import { sql } from "@/lib/db";
import type { ActionResult } from "@/types/product";

function getNumber(formData: FormData, key: string) {
  const value = Number(String(formData.get(key) || "0").replace(",", "."));
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function getFields(formData: FormData) {
  return {
    name: String(formData.get("name") || "").trim(),
    description: String(formData.get("description") || "").trim(),
    price: getNumber(formData, "price"),
    category: String(formData.get("category") || "").trim(),
    stock: Math.round(getNumber(formData, "stock")),
  };
}

async function uploadImage(formData: FormData) {
  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) return null;
  return uploadImageToBlob(file);
}

function refresh() {
  revalidatePath("/");
  revalidatePath("/admin", "layout");
}

function fail(error: unknown, fallback: string): ActionResult {
  console.error(error);
  return { ok: false, error: error instanceof Error ? error.message : fallback };
}

export async function createProduct(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const { name, description, price, category, stock } = getFields(formData);
  if (!name || !category) return { ok: false, error: "Preencha nome e categoria" };

  try {
    const imageUrl = await uploadImage(formData);
    await sql`
      INSERT INTO products (id, name, description, price, category, stock, image_url)
      VALUES (${crypto.randomUUID()}, ${name}, ${description}, ${price}, ${category}, ${stock}, ${imageUrl})
    `;
  } catch (error) {
    return fail(error, "Falha ao criar produto");
  }

  refresh();
  return { ok: true };
}

export async function updateProduct(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const currentImage = String(formData.get("current_image_url") || "") || null;
  const { name, description, price, category, stock } = getFields(formData);
  if (!id || !name || !category) return { ok: false, error: "Preencha nome e categoria" };

  try {
    const newImage = await uploadImage(formData);
    await sql`
      UPDATE products
      SET name = ${name}, description = ${description}, price = ${price},
          category = ${category}, stock = ${stock}, image_url = ${newImage || currentImage}
      WHERE id = ${id}
    `;
    if (newImage && currentImage) await deleteImageFromBlob(currentImage);
  } catch (error) {
    return fail(error, "Falha ao salvar produto");
  }

  refresh();
  return { ok: true };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    const rows = await sql`DELETE FROM products WHERE id = ${id} RETURNING image_url`;
    await deleteImageFromBlob(rows[0]?.image_url as string | null);
  } catch (error) {
    return fail(error, "Falha ao apagar produto");
  }

  refresh();
  return { ok: true };
}

export async function adjustStock(id: string, delta: number): Promise<ActionResult> {
  await requireAdmin();
  await sql`UPDATE products SET stock = GREATEST(stock + ${Math.round(delta)}, 0) WHERE id = ${id}`;
  refresh();
  return { ok: true };
}
