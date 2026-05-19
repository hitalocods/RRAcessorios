"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient, createClient } from "@/supabase/server";
import { categories, type ProductCategory } from "@/types/product";

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return user;
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

  const supabase = createAdminClient();
  const extension = file.name.split(".").pop() || "jpg";
  const fileName = `${crypto.randomUUID()}.${extension}`;
  const path = `products/${fileName}`;
  const buffer = await file.arrayBuffer();

  const { error } = await supabase.storage.from("product-images").upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}

export async function createProduct(formData: FormData) {
  await assertAdmin();
  const imageUrl = await uploadImage(formData.get("image") as File | null);
  const supabase = createAdminClient();

  const { error } = await supabase.from("products").insert({
    name: String(formData.get("name") || ""),
    description: String(formData.get("description") || ""),
    price: getNumber(formData, "price"),
    category: getCategory(formData),
    stock: Math.max(0, Math.round(getNumber(formData, "stock"))),
    image_url: imageUrl,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function updateProduct(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") || "");
  const currentImage = String(formData.get("current_image_url") || "");
  const imageUrl = (await uploadImage(formData.get("image") as File | null)) || currentImage || null;
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("products")
    .update({
      name: String(formData.get("name") || ""),
      description: String(formData.get("description") || ""),
      price: getNumber(formData, "price"),
      category: getCategory(formData),
      stock: Math.max(0, Math.round(getNumber(formData, "stock"))),
      image_url: imageUrl,
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function deleteProduct(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") || "");
  const supabase = createAdminClient();
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/admin");
}
