import { PageHeader } from "@/components/admin/admin-shell";
import { NeighborhoodsManager } from "@/components/admin/neighborhoods-manager";
import { requireAdmin } from "@/lib/auth";
import { getNeighborhoods } from "@/services/products";

export const dynamic = "force-dynamic";

export default async function AdminNeighborhoodsPage() {
  await requireAdmin();
  const neighborhoods = await getNeighborhoods();

  return (
    <>
      <PageHeader
        title="Bairros e Taxas"
        description="Configure os bairros de entrega atendidos pela loja e a taxa de frete de cada um"
      />
      <NeighborhoodsManager neighborhoods={neighborhoods} />
    </>
  );
}
