"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import type { ActionResult, OrderItem } from "@/types/product";

type OrderInput = {
  items: { id: string; quantity: number }[];
  neighborhoodId: string;
  customerName: string;
  address: string;
};

export type CreatedOrder =
  | { ok: true; number: number; items: OrderItem[]; subtotal: number; fee: number; total: number; neighborhood: string }
  | { ok: false; error: string };

// Publica: chamada pelo carrinho. Precos e taxa sao recalculados no servidor (nao confia no navegador).
export async function createOrder(input: OrderInput): Promise<CreatedOrder> {
  const customerName = input.customerName.trim().slice(0, 80);
  const address = input.address.trim().slice(0, 200);
  const wanted = input.items
    .filter((item) => typeof item.id === "string" && Number.isInteger(item.quantity) && item.quantity > 0)
    .slice(0, 50);

  if (!customerName) return { ok: false, error: "Digite seu nome" };
  if (!wanted.length) return { ok: false, error: "Carrinho vazio" };

  try {
    const ids = wanted.map((item) => item.id);
    const [products, neighborhoods] = await Promise.all([
      sql`SELECT id, name, price::float AS price, stock FROM products WHERE id = ANY(${ids})`,
      sql`SELECT name, fee::float AS fee FROM neighborhoods WHERE id = ${input.neighborhoodId}`,
    ]);

    const neighborhood = neighborhoods[0];
    if (!neighborhood) return { ok: false, error: "Escolha o bairro de entrega" };

    const items: OrderItem[] = [];
    for (const want of wanted) {
      const product = products.find((p) => p.id === want.id);
      if (!product) return { ok: false, error: "Um produto do carrinho não existe mais. Remova e tente de novo." };
      if ((product.stock as number) < want.quantity) {
        return { ok: false, error: `Estoque insuficiente de ${product.name}` };
      }
      items.push({
        product_id: product.id as string,
        name: product.name as string,
        price: product.price as number,
        quantity: Math.min(want.quantity, 99),
      });
    }

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const fee = neighborhood.fee as number;
    const total = subtotal + fee;

    const [order] = await sql`
      INSERT INTO orders (id, customer_name, address, neighborhood_name, delivery_fee, subtotal, total, items)
      VALUES (${crypto.randomUUID()}, ${customerName}, ${address || null}, ${neighborhood.name as string},
              ${fee}, ${subtotal}, ${total}, ${JSON.stringify(items)}::jsonb)
      RETURNING number
    `;

    return { ok: true, number: order.number as number, items, subtotal, fee, total, neighborhood: neighborhood.name as string };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "Não foi possível registrar o pedido. Tente novamente." };
  }
}

// Admin: confirmar baixa o estoque; cancelar um pedido ja confirmado devolve o estoque.
export async function setOrderStatus(id: string, status: "confirmed" | "cancelled"): Promise<ActionResult> {
  await requireAdmin();

  try {
    if (status === "confirmed") {
      await sql`
        WITH o AS (
          UPDATE orders SET status = 'confirmed' WHERE id = ${id} AND status = 'pending' RETURNING items
        ), i AS (
          SELECT e->>'product_id' AS pid, SUM((e->>'quantity')::int) AS qty
          FROM o, jsonb_array_elements(o.items) e GROUP BY 1
        )
        UPDATE products p SET stock = GREATEST(p.stock - i.qty, 0) FROM i WHERE p.id = i.pid
      `;
    } else {
      await sql`
        WITH prev AS (
          SELECT status FROM orders WHERE id = ${id}
        ), o AS (
          UPDATE orders SET status = 'cancelled' WHERE id = ${id} AND status <> 'cancelled' RETURNING items
        ), i AS (
          SELECT e->>'product_id' AS pid, SUM((e->>'quantity')::int) AS qty
          FROM o, jsonb_array_elements(o.items) e
          WHERE (SELECT status FROM prev) = 'confirmed'
          GROUP BY 1
        )
        UPDATE products p SET stock = p.stock + i.qty FROM i WHERE p.id = i.pid
      `;
    }
  } catch (error) {
    console.error(error);
    return { ok: false, error: "Falha ao atualizar pedido" };
  }

  revalidatePath("/");
  revalidatePath("/admin", "layout");
  return { ok: true };
}
