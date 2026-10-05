"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import type { ActionResult } from "@/types/product";

function refresh() {
  revalidatePath("/");
  revalidatePath("/admin", "layout");
}

function isUniqueViolation(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "23505";
}

// ---------- Categorias ----------

export async function createCategory(name: string): Promise<ActionResult> {
  await requireAdmin();
  const clean = name.trim();
  if (!clean) return { ok: false, error: "Digite um nome" };

  try {
    await sql`INSERT INTO categories (id, name) VALUES (${crypto.randomUUID()}, ${clean})`;
  } catch (error) {
    return { ok: false, error: isUniqueViolation(error) ? "Essa categoria já existe" : "Falha ao criar categoria" };
  }

  refresh();
  return { ok: true };
}

export async function renameCategory(id: string, name: string): Promise<ActionResult> {
  await requireAdmin();
  const clean = name.trim();
  if (!clean) return { ok: false, error: "Digite um nome" };

  try {
    const [current] = await sql`SELECT name FROM categories WHERE id = ${id}`;
    if (!current) return { ok: false, error: "Categoria não encontrada" };

    await sql.transaction([
      sql`UPDATE categories SET name = ${clean} WHERE id = ${id}`,
      sql`UPDATE products SET category = ${clean} WHERE category = ${current.name as string}`,
    ]);
  } catch (error) {
    return { ok: false, error: isUniqueViolation(error) ? "Essa categoria já existe" : "Falha ao renomear" };
  }

  refresh();
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  await requireAdmin();
  const [row] = await sql`
    SELECT COUNT(p.id)::int AS count FROM categories c
    LEFT JOIN products p ON p.category = c.name
    WHERE c.id = ${id}
  `;
  if ((row?.count as number) > 0) {
    return { ok: false, error: "Mova ou apague os produtos dessa categoria antes" };
  }

  await sql`DELETE FROM categories WHERE id = ${id}`;
  refresh();
  return { ok: true };
}

// ---------- Bairros ----------

function parseFee(fee: number | string) {
  const value = Number(String(fee).replace(",", "."));
  return Number.isFinite(value) && value >= 0 ? value : null;
}

export async function saveNeighborhood(data: { id?: string; name: string; fee: number | string }): Promise<ActionResult> {
  await requireAdmin();
  const name = data.name.trim();
  const fee = parseFee(data.fee);
  if (!name) return { ok: false, error: "Digite o nome do bairro" };
  if (fee === null) return { ok: false, error: "Taxa inválida" };

  try {
    if (data.id) {
      await sql`UPDATE neighborhoods SET name = ${name}, fee = ${fee} WHERE id = ${data.id}`;
    } else {
      await sql`INSERT INTO neighborhoods (id, name, fee) VALUES (${crypto.randomUUID()}, ${name}, ${fee})`;
    }
  } catch (error) {
    return { ok: false, error: isUniqueViolation(error) ? "Esse bairro já existe" : "Falha ao salvar bairro" };
  }

  refresh();
  return { ok: true };
}

export async function deleteNeighborhood(id: string): Promise<ActionResult> {
  await requireAdmin();
  await sql`DELETE FROM neighborhoods WHERE id = ${id}`;
  refresh();
  return { ok: true };
}

// Ação pública para o carrinho buscar bairros e taxas sempre sincronizados em tempo real
export async function getLiveNeighborhoods() {
  try {
    const rows = await sql`SELECT id, name, fee::float AS fee FROM neighborhoods ORDER BY name`;
    return { ok: true, data: rows as { id: string; name: string; fee: number }[] };
  } catch (error) {
    console.error("Falha ao sincronizar bairros", error);
    return { ok: false, data: [] };
  }
}
