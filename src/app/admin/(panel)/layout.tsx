import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { getPendingCount } from "@/services/products";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const pending = await getPendingCount().catch(() => 0);

  return <AdminShell pending={pending}>{children}</AdminShell>;
}
