"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { categories, type ProductCategory } from "@/types/product";
import { uploadImageToBlob } from "@/lib/blob";
import { sql } from "@/lib/db";

async function assertAdmin() {
  const isAdmin = await isAdminAuthenticated();

  if (!isAdmin) {
    redirect("/admin/login");
  }
}

function getNumber(formData: FormData, key: string) {
  const raw = String(formData.get(key) || "0").replace(",", ".");
  return Number(raw);
}

function getCategory(formData: FormData): ProductCategory {
  const category = String(formData.get("category") || "");
  if (!categories.includes(category as ProductCategory)) {
    return "Capas";
  }
  return category as ProductCategory;
}

async function uploadImage(file: File | null) {
  if (!file || file.size === 0) {
    return null;
  }

  const extension = file.name.split(".").pop() || "jpg";
  const fileName = `${crypto.randomUUID()}.${extension}`;
  const renamedFile = new File([file], fileName, { type: file.type });

  return await uploadImageToBlob(renamedFile);
}

export async function createProduct(formData: FormData) {
  await assertAdmin();
  const imageUrl = await uploadImage(formData.get("image") as File | null);

  await sql`
    INSERT INTO products (id, name, description, price, category, stock, image_url)
    VALUES (
      ${crypto.randomUUID()},
      ${String(formData.get("name") || "")},
      ${String(formData.get("description") || "")},
      ${getNumber(formData, "price")},
      ${getCategory(formData)},
      ${Math.max(0, Math.round(getNumber(formData, "stock")))},
      ${imageUrl}
    )
  `;

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function updateProduct(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") || "");
  const currentImage = String(formData.get("current_image_url") || "");
  const imageUrl = (await uploadImage(formData.get("image") as File | null)) || currentImage || null;

  await sql`
    UPDATE products
    SET
      name = ${String(formData.get("name") || "")},
      description = ${String(formData.get("description") || "")},
      price = ${getNumber(formData, "price")},
      category = ${getCategory(formData)},
      stock = ${Math.max(0, Math.round(getNumber(formData, "stock")))},
      image_url = ${imageUrl}
    WHERE id = ${id}
  `;

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function deleteProduct(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") || "");

  await sql`
    DELETE FROM products
    WHERE id = ${id}
  `;

  revalidatePath("/");
  revalidatePath("/admin");
}
