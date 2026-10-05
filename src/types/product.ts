export const defaultCategories = ["Capas", "Acessórios", "Perfumes", "Carregadores"] as const;

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  stock: number;
  image_url: string | null;
  created_at: string;
};

export type Category = {
  id: string;
  name: string;
  product_count: number;
};

export type Neighborhood = {
  id: string;
  name: string;
  fee: number;
};

export type OrderStatus = "pending" | "confirmed" | "cancelled";

export type OrderItem = {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
};

export type Order = {
  id: string;
  number: number;
  customer_name: string;
  delivery_type: "delivery" | "pickup";
  address: string | null;
  neighborhood_name: string | null;
  delivery_fee: number;
  payment_method: string | null;
  notes: string | null;
  subtotal: number;
  total: number;
  items: OrderItem[];
  status: OrderStatus;
  created_at: string;
};

export type ActionResult = { ok: true } | { ok: false; error: string };
