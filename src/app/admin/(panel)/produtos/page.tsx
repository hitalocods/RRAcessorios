import { PageHeader } from "@/components/admin/admin-shell";
import { ProductsManager } from "@/components/admin/products-manager";
import { requireAdmin } from "@/lib/auth";
import { getCategories, getProducts } from "@/services/products";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  await requireAdmin();
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  return (
    <>
      <PageHeader
        title="Produtos"
        description="Gerencie seu catálogo, estoque e fotos dos produtos"
      />
      <ProductsManager initialProducts={products} categories={categories} />
    </>
  );
}
