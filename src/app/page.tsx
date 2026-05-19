import { getProducts } from "@/services/products";
import { Storefront } from "@/components/storefront";

export default async function Home() {
  const products = await getProducts();

  return <Storefront products={products} />;
}
