import { redirect } from "next/navigation";
import Link from "next/link";
import { signOutAdmin } from "@/app/actions/auth";
import { ProductForm } from "@/components/admin/product-form";
import { AdminProducts } from "@/components/admin/admin-products";
import { Button } from "@/components/ui/button";
import { getProducts } from "@/services/products";
import { isAdminAuthenticated } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const isAdmin = await isAdminAuthenticated();

  if (!isAdmin) {
    redirect("/admin/login");
  }

  const products = await getProducts();
  const inventory = products.reduce((sum, product) => sum + product.stock, 0);
  const catalogValue = products.reduce((sum, product) => sum + product.price * product.stock, 0);

  return (
    <main className="min-h-dvh bg-[#fafafa]">
      <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-sm font-semibold tracking-[0.24em]">
            STORE
          </Link>
          <form action={signOutAdmin}>
            <Button variant="ghost" className="rounded-full">
              Sair
            </Button>
          </form>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[360px_1fr] lg:px-8">
        <aside className="h-fit rounded-lg border bg-white p-5 shadow-sm lg:sticky lg:top-24">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Dashboard</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">Admin STORE</h1>
          </div>
          <div className="mb-6 grid grid-cols-2 gap-3">
            <div className="rounded-md border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">Produtos</p>
              <p className="mt-1 text-2xl font-semibold">{products.length}</p>
            </div>
            <div className="rounded-md border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">Estoque</p>
              <p className="mt-1 text-2xl font-semibold">{inventory}</p>
            </div>
            <div className="col-span-2 rounded-md border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">Valor em catalogo</p>
              <p className="mt-1 text-xl font-semibold">{formatCurrency(catalogValue)}</p>
            </div>
          </div>
          <ProductForm />
        </aside>
        <section className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Produtos</p>
              <h2 className="mt-1 text-xl font-semibold">Catalogo cadastrado</h2>
            </div>
          </div>
          <AdminProducts products={products} />
        </section>
      </div>
    </main>
  );
}
