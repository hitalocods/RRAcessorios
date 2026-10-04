import { getCategories, getNeighborhoods, getProducts } from "@/services/products";
import { Storefront } from "@/components/storefront";

// Pagina estática: é revalidada via revalidatePath quando o admin altera produtos, categorias ou bairros.
export const revalidate = 86400;

export default async function Home() {
  const [products, categories, neighborhoods] = await Promise.all([
    getProducts(),
    getCategories(),
    getNeighborhoods(),
  ]);

  return <Storefront products={products} categories={categories} neighborhoods={neighborhoods} />;
}
