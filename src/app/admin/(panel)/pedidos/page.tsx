import { PageHeader } from "@/components/admin/admin-shell";
import { OrdersManager } from "@/components/admin/orders-manager";
import { requireAdmin } from "@/lib/auth";
import { getOrders } from "@/services/products";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  await requireAdmin();
  const orders = await getOrders();

  return (
    <>
      <PageHeader
        title="Pedidos"
        description="Acompanhe pedidos feitos no WhatsApp, confirme vendas e dê baixa no estoque automaticamente"
      />
      <OrdersManager initialOrders={orders} />
    </>
  );
}
