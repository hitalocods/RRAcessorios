import { unstable_noStore as noStore } from "next/cache";
import type { Product } from "@/types/product";
import { sql } from "@/lib/db";

const fallbackProducts: Product[] = [
  {
    id: "demo-1",
    name: "Capa MagSafe Smoke",
    description: "Acabamento translúcido com toque macio.",
    price: 149,
    category: "Capas",
    stock: 12,
    image_url:
      "https://images.unsplash.com/photo-1601593346740-925612772716?auto=format&fit=crop&w=1200&q=85",
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-2",
    name: "Perfume Noir 50ml",
    description: "Fragrância intensa, seca e elegante.",
    price: 289,
    category: "Perfumes",
    stock: 7,
    image_url:
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=85",
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-3",
    name: "Carregador GaN 35W",
    description: "Compacto, rápido e silencioso.",
    price: 219,
    category: "Carregadores",
    stock: 18,
    image_url:
      "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1200&q=85",
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-4",
    name: "Pulseira Steel Loop",
    description: "Aço escovado com ajuste preciso.",
    price: 179,
    category: "Acessórios",
    stock: 9,
    image_url:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=85",
    created_at: new Date().toISOString(),
  },
];

export async function getProducts(): Promise<Product[]> {
  noStore();

  try {
    const products = await sql`
      SELECT * FROM products
      ORDER BY created_at DESC
    `;

    return products.length > 0 ? (products as Product[]) : fallbackProducts;
  } catch {
    return fallbackProducts;
  }
}
