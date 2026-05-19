export const categories = ["Capas", "Acessórios", "Perfumes", "Carregadores"] as const;

export type ProductCategory = (typeof categories)[number];

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: ProductCategory;
  stock: number;
  image_url: string | null;
  created_at: string;
};

export type ProductInput = Omit<Product, "id" | "created_at">;
