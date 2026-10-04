import { PageHeader } from "@/components/admin/admin-shell";
import { CategoriesManager } from "@/components/admin/categories-manager";
import { requireAdmin } from "@/lib/auth";
import { getCategories } from "@/services/products";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const categories = await getCategories();

  return (
    <>
      <PageHeader
        title="Categorias"
        description="Organize as categorias exibidas na loja e no cadastro de produtos"
      />
      <CategoriesManager categories={categories} />
    </>
  );
}
