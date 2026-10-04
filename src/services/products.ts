import type { Category, Neighborhood, Order, OrderStatus, Product } from "@/types/product";
import { sql } from "@/lib/db";

export async function getProducts(): Promise<Product[]> {
  try {
    const rows = await sql`
      SELECT id, name, description, price::float AS price, category, stock, image_url, created_at
      FROM products
      ORDER BY created_at DESC
    `;
    return rows as Product[];
  } catch (error) {
    console.error("Falha ao buscar produtos", error);
    return [];
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const rows = await sql`
      SELECT c.id, c.name, COUNT(p.id)::int AS product_count
      FROM categories c
      LEFT JOIN products p ON p.category = c.name
      GROUP BY c.id, c.name
      ORDER BY c.name
    `;
    return rows as Category[];
  } catch (error) {
    console.error("Falha ao buscar categorias", error);
    return [];
  }
}

export async function getNeighborhoods(): Promise<Neighborhood[]> {
  try {
    const rows = await sql`SELECT id, name, fee::float AS fee FROM neighborhoods ORDER BY name`;
    return rows as Neighborhood[];
  } catch (error) {
    console.error("Falha ao buscar bairros", error);
    return [];
  }
}

export async function getOrders(status?: OrderStatus): Promise<Order[]> {
  const rows = status
    ? await sql`
        SELECT id, number, customer_name, address, neighborhood_name, delivery_fee::float AS delivery_fee,
               subtotal::float AS subtotal, total::float AS total, items, status, created_at
        FROM orders WHERE status = ${status}
        ORDER BY created_at DESC LIMIT 200
      `
    : await sql`
        SELECT id, number, customer_name, address, neighborhood_name, delivery_fee::float AS delivery_fee,
               subtotal::float AS subtotal, total::float AS total, items, status, created_at
        FROM orders
        ORDER BY created_at DESC LIMIT 200
      `;
  return rows as Order[];
}

export async function getPendingCount(): Promise<number> {
  const [row] = await sql`SELECT COUNT(*)::int AS count FROM orders WHERE status = 'pending'`;
  return (row?.count as number) ?? 0;
}

export type Period = "7" | "30" | "90" | "all";

export async function getDashboard(period: Period) {
  const days = period === "all" ? null : Number(period);
  const since = days ? new Date(Date.now() - days * 86400000) : new Date(0);
  const chartDays = days ?? 30;
  const chartSince = new Date(Date.now() - chartDays * 86400000);

  const [summary, daily, topProducts, byNeighborhood, stock, lowStock, pending] = await Promise.all([
    sql`
      SELECT COUNT(*)::int AS orders,
             COALESCE(SUM(total), 0)::float AS revenue,
             COALESCE(SUM(subtotal), 0)::float AS products_revenue,
             COALESCE(SUM(delivery_fee), 0)::float AS fees
      FROM orders WHERE status = 'confirmed' AND created_at >= ${since}
    `,
    sql`
      SELECT to_char(created_at AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM-DD') AS day,
             SUM(total)::float AS value
      FROM orders WHERE status = 'confirmed' AND created_at >= ${chartSince}
      GROUP BY 1 ORDER BY 1
    `,
    sql`
      SELECT e->>'name' AS name,
             SUM((e->>'quantity')::int)::int AS quantity,
             SUM((e->>'price')::numeric * (e->>'quantity')::int)::float AS revenue
      FROM orders o, jsonb_array_elements(o.items) e
      WHERE o.status = 'confirmed' AND o.created_at >= ${since}
      GROUP BY 1 ORDER BY quantity DESC LIMIT 5
    `,
    sql`
      SELECT COALESCE(neighborhood_name, 'Sem bairro') AS name, COUNT(*)::int AS orders, SUM(total)::float AS revenue
      FROM orders WHERE status = 'confirmed' AND created_at >= ${since}
      GROUP BY 1 ORDER BY revenue DESC LIMIT 5
    `,
    sql`
      SELECT COUNT(*)::int AS products, COALESCE(SUM(stock), 0)::int AS units,
             COALESCE(SUM(price * stock), 0)::float AS value
      FROM products
    `,
    sql`SELECT id, name, stock FROM products WHERE stock <= 3 ORDER BY stock, name LIMIT 6`,
    sql`SELECT COUNT(*)::int AS count FROM orders WHERE status = 'pending'`,
  ]);

  const dailyMap = new Map(daily.map((row) => [row.day as string, row.value as number]));
  const chart = Array.from({ length: chartDays }, (_, i) => {
    const date = new Date(Date.now() - (chartDays - 1 - i) * 86400000);
    const key = date.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
    return { day: key, value: dailyMap.get(key) ?? 0 };
  });

  const s = summary[0];
  return {
    orders: s.orders as number,
    revenue: s.revenue as number,
    productsRevenue: s.products_revenue as number,
    fees: s.fees as number,
    averageTicket: s.orders ? (s.revenue as number) / (s.orders as number) : 0,
    pending: pending[0].count as number,
    chart,
    topProducts: topProducts as { name: string; quantity: number; revenue: number }[],
    byNeighborhood: byNeighborhood as { name: string; orders: number; revenue: number }[],
    stock: stock[0] as { products: number; units: number; value: number },
    lowStock: lowStock as { id: string; name: string; stock: number }[],
  };
}
