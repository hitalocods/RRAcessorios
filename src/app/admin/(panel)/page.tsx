import Link from "next/link";
import { AlertTriangle, ArrowUpRight, Boxes, Receipt, ShoppingBag, Truck, Wallet } from "lucide-react";
import { PageHeader } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { cn, formatCurrency } from "@/lib/utils";
import { getDashboard, type Period } from "@/services/products";

const periods: { value: Period; label: string }[] = [
  { value: "7", label: "7 dias" },
  { value: "30", label: "30 dias" },
  { value: "90", label: "90 dias" },
  { value: "all", label: "Tudo" },
];

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  await requireAdmin();
  const { p } = await searchParams;
  const period: Period = periods.some((item) => item.value === p) ? (p as Period) : "30";
  const data = await getDashboard(period);
  const maxDay = Math.max(...data.chart.map((d) => d.value), 1);

  const stats = [
    { label: "Faturamento", value: formatCurrency(data.revenue), icon: Wallet, highlight: true },
    { label: "Pedidos confirmados", value: String(data.orders), icon: ShoppingBag },
    { label: "Ticket médio", value: formatCurrency(data.averageTicket), icon: Receipt },
    { label: "Taxas de entrega", value: formatCurrency(data.fees), icon: Truck },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Resumo financeiro dos pedidos confirmados"
        action={
          <div className="flex rounded-full border bg-white p-1 text-sm">
            {periods.map((item) => (
              <Link
                key={item.value}
                href={`/admin?p=${item.value}`}
                className={cn(
                  "rounded-full px-3 py-1.5 transition",
                  period === item.value ? "bg-black text-white" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        }
      />

      {data.pending > 0 && (
        <Link
          href="/admin/pedidos"
          className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm transition hover:bg-amber-100"
        >
          <span>
            <strong>{data.pending}</strong> {data.pending === 1 ? "pedido aguardando" : "pedidos aguardando"} confirmação
          </span>
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {stats.map(({ label, value, icon: Icon, highlight }) => (
          <div
            key={label}
            className={cn(
              "rounded-2xl border p-4 lg:p-5",
              highlight ? "border-black bg-[#0d0d0e] text-white" : "bg-white",
            )}
          >
            <div className="flex items-center justify-between">
              <p className={cn("text-xs", highlight ? "text-white/60" : "text-muted-foreground")}>{label}</p>
              <Icon className={cn("h-4 w-4", highlight ? "text-white/50" : "text-muted-foreground")} />
            </div>
            <p className="mt-3 truncate text-xl font-semibold tracking-tight lg:text-2xl">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border bg-white p-5 lg:mt-6 lg:p-6">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="font-semibold">Vendas por dia</h2>
          <p className="text-xs text-muted-foreground">últimos {data.chart.length} dias</p>
        </div>
        <div className="flex h-44 items-end gap-[3px]">
          {data.chart.map((d) => (
            <div key={d.day} className="group relative flex h-full flex-1 items-end">
              <div
                className={cn("w-full rounded-t-[3px] transition", d.value ? "bg-black group-hover:bg-amber-500" : "bg-stone-100")}
                style={{ height: `${Math.max((d.value / maxDay) * 100, 2)}%` }}
              />
              <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-black px-2 py-1 text-[11px] text-white group-hover:block">
                {d.day.split("-").reverse().slice(0, 2).join("/")} · {formatCurrency(d.value)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:mt-6 lg:grid-cols-2 lg:gap-6">
        <Panel title="Mais vendidos">
          {data.topProducts.length ? (
            <ol className="divide-y">
              {data.topProducts.map((item, index) => (
                <li key={item.name} className="flex items-center gap-3 py-3 text-sm">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-stone-100 text-xs font-medium">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{item.name}</span>
                  <span className="text-muted-foreground">{item.quantity} un</span>
                  <span className="w-24 text-right font-medium">{formatCurrency(item.revenue)}</span>
                </li>
              ))}
            </ol>
          ) : (
            <Empty>Sem vendas confirmadas no período.</Empty>
          )}
        </Panel>

        <Panel title="Vendas por bairro">
          {data.byNeighborhood.length ? (
            <ul className="grid gap-3">
              {data.byNeighborhood.map((item) => (
                <li key={item.name} className="text-sm">
                  <div className="mb-1.5 flex justify-between">
                    <span>{item.name}</span>
                    <span className="text-muted-foreground">
                      {item.orders} {item.orders === 1 ? "pedido" : "pedidos"} · {formatCurrency(item.revenue)}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-stone-100">
                    <div
                      className="h-full rounded-full bg-black"
                      style={{ width: `${(item.revenue / data.byNeighborhood[0].revenue) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>Sem vendas confirmadas no período.</Empty>
          )}
        </Panel>

        <Panel title="Estoque" icon={<Boxes className="h-4 w-4 text-muted-foreground" />}>
          <div className="grid grid-cols-3 gap-3 text-center">
            <MiniStat label="Produtos" value={String(data.stock.products)} />
            <MiniStat label="Unidades" value={String(data.stock.units)} />
            <MiniStat label="Valor" value={formatCurrency(data.stock.value)} />
          </div>
        </Panel>

        <Panel title="Estoque baixo" icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}>
          {data.lowStock.length ? (
            <ul className="divide-y">
              {data.lowStock.map((item) => (
                <li key={item.id} className="flex justify-between py-2.5 text-sm">
                  <span className="truncate">{item.name}</span>
                  <span className={cn("font-medium", item.stock === 0 ? "text-red-600" : "text-amber-600")}>
                    {item.stock === 0 ? "Esgotado" : `${item.stock} un`}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>Tudo certo com o estoque.</Empty>
          )}
        </Panel>
      </div>
    </>
  );
}

function Panel({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border bg-white p-5 lg:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold">{title}</h2>
        {icon}
      </div>
      {children}
    </section>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-stone-50 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 truncate font-semibold">{value}</p>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-6 text-center text-sm text-muted-foreground">{children}</p>;
}
