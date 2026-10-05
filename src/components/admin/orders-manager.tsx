"use client";

import { useMemo, useState, useTransition } from "react";
import { CheckCircle2, Clock, MapPin, Package, ShoppingBag, User, XCircle } from "lucide-react";
import { toast } from "sonner";
import { setOrderStatus } from "@/app/actions/orders";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types/product";

interface OrdersManagerProps {
  initialOrders: Order[];
}

export function OrdersManager({ initialOrders }: OrdersManagerProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "all">("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    if (selectedStatus === "all") return initialOrders;
    return initialOrders.filter((o) => o.status === selectedStatus);
  }, [initialOrders, selectedStatus]);

  const counts = useMemo(() => {
    return {
      all: initialOrders.length,
      pending: initialOrders.filter((o) => o.status === "pending").length,
      confirmed: initialOrders.filter((o) => o.status === "confirmed").length,
      cancelled: initialOrders.filter((o) => o.status === "cancelled").length,
    };
  }, [initialOrders]);

  async function handleStatusChange(id: string, status: "confirmed" | "cancelled") {
    const actionLabel = status === "confirmed" ? "confirmar a venda e baixar o estoque" : "cancelar este pedido";
    if (!confirm(`Deseja realmente ${actionLabel}?`)) return;

    setLoadingId(id);
    startTransition(async () => {
      try {
        const res = await setOrderStatus(id, status);
        if (!res.ok) {
          toast.error(res.error);
        } else {
          toast.success(status === "confirmed" ? "Pedido confirmado! Estoque baixado com sucesso." : "Pedido cancelado.");
        }
      } catch {
        toast.error("Erro ao atualizar status do pedido");
      } finally {
        setLoadingId(null);
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Abas de filtro */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSelectedStatus("all")}
          className={`rounded-full px-4 py-2 text-xs font-medium transition ${
            selectedStatus === "all" ? "bg-black text-white" : "border bg-white text-muted-foreground hover:bg-stone-50"
          }`}
        >
          Todos ({counts.all})
        </button>
        <button
          type="button"
          onClick={() => setSelectedStatus("pending")}
          className={`relative rounded-full px-4 py-2 text-xs font-medium transition ${
            selectedStatus === "pending"
              ? "bg-amber-500 text-white"
              : "border bg-white text-muted-foreground hover:bg-stone-50"
          }`}
        >
          Pendentes ({counts.pending})
          {counts.pending > 0 && (
            <span className="ml-1.5 inline-block h-2 w-2 rounded-full bg-amber-300" />
          )}
        </button>
        <button
          type="button"
          onClick={() => setSelectedStatus("confirmed")}
          className={`rounded-full px-4 py-2 text-xs font-medium transition ${
            selectedStatus === "confirmed"
              ? "bg-emerald-600 text-white"
              : "border bg-white text-muted-foreground hover:bg-stone-50"
          }`}
        >
          Confirmados ({counts.confirmed})
        </button>
        <button
          type="button"
          onClick={() => setSelectedStatus("cancelled")}
          className={`rounded-full px-4 py-2 text-xs font-medium transition ${
            selectedStatus === "cancelled"
              ? "bg-stone-700 text-white"
              : "border bg-white text-muted-foreground hover:bg-stone-50"
          }`}
        >
          Cancelados ({counts.cancelled})
        </button>
      </div>

      {/* Lista de Pedidos */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-white p-12 text-center">
          <ShoppingBag className="mx-auto h-8 w-8 text-muted-foreground/60" />
          <p className="mt-2 font-medium">Nenhum pedido nesta aba</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Quando os clientes finalizarem pedidos na loja pelo WhatsApp, eles aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((order) => {
            const isLoading = loadingId === order.id;
            const dateStr = new Date(order.created_at).toLocaleString("pt-BR", {
              dateStyle: "short",
              timeStyle: "short",
            });

            return (
              <div
                key={order.id}
                className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md"
              >
                {/* Cabeçalho do Card */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-stone-50/70 px-4 py-3 sm:px-5">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className="rounded-lg bg-black px-2.5 py-1 text-xs font-bold text-white">
                      #{order.number}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {dateStr}
                    </span>
                  </div>

                  {/* Badge de status */}
                  <div>
                    {order.status === "pending" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                        <Clock className="h-3.5 w-3.5" />
                        Aguardando Confirmação
                      </span>
                    )}
                    {order.status === "confirmed" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Venda Confirmada (Estoque Baixado)
                      </span>
                    )}
                    {order.status === "cancelled" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-stone-200 px-3 py-1 text-xs font-semibold text-stone-700">
                        <XCircle className="h-3.5 w-3.5" />
                        Cancelado
                      </span>
                    )}
                  </div>
                </div>

                {/* Corpo: Dados do Cliente + Itens */}
                <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-2 lg:gap-6">
                  {/* Dados do Cliente e Entrega */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-2.5">
                      <User className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Cliente</p>
                        <p className="font-semibold text-foreground">{order.customer_name}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div className="text-sm">
                        <p className="text-xs text-muted-foreground">
                          {order.delivery_type === "pickup" ? "Modalidade: Retirada na Loja" : "Entrega em Domicílio"}
                        </p>
                        <p className="font-medium text-foreground">
                          Bairro: {order.neighborhood_name || "Não informado"}
                        </p>
                        {order.address && (
                          <p className="text-xs text-muted-foreground">{order.address}</p>
                        )}
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Taxa de entrega:{" "}
                          <span className={order.delivery_fee === 0 ? "text-emerald-600 font-semibold" : ""}>
                            {order.delivery_fee === 0 ? "Grátis" : formatCurrency(order.delivery_fee)}
                          </span>
                        </p>
                      </div>
                    </div>

                    {order.payment_method && (
                      <div className="rounded-lg border bg-stone-50/80 px-3 py-2 text-xs">
                        <span className="text-muted-foreground">Pagamento: </span>
                        <strong className="text-foreground">{order.payment_method}</strong>
                      </div>
                    )}

                    {order.notes && (
                      <div className="rounded-lg border border-amber-200 bg-amber-50/50 px-3 py-2 text-xs">
                        <span className="text-amber-800 font-semibold">Obs: </span>
                        <span className="text-stone-700">{order.notes}</span>
                      </div>
                    )}
                  </div>

                  {/* Itens do Pedido */}
                  <div className="space-y-2 rounded-xl bg-stone-50/60 p-3 sm:p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <Package className="h-3.5 w-3.5" />
                      Itens do Pedido
                    </div>
                    <ul className="divide-y divide-stone-200/60 text-sm">
                      {order.items.map((item, idx) => (
                        <li key={idx} className="flex justify-between py-1.5">
                          <span className="font-medium">
                            {item.quantity}x {item.name}
                          </span>
                          <span className="text-muted-foreground">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <div className="border-t border-stone-200/80 pt-2 text-xs text-muted-foreground space-y-1">
                      <div className="flex justify-between">
                        <span>Subtotal produtos:</span>
                        <span>{formatCurrency(order.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taxa de entrega:</span>
                        <span>{formatCurrency(order.delivery_fee)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-foreground pt-1 border-t">
                        <span>Total:</span>
                        <span className="text-base text-primary">{formatCurrency(order.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rodapé: Ações de aprovação / cancelamento */}
                <div className="flex flex-wrap items-center justify-end gap-2 border-t bg-stone-50/40 px-4 py-3 sm:px-5">
                  {order.status === "pending" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isLoading}
                        onClick={() => handleStatusChange(order.id, "cancelled")}
                        className="rounded-xl text-destructive hover:bg-red-50 hover:text-red-700"
                      >
                        Recusar / Cancelar
                      </Button>
                      <Button
                        size="sm"
                        disabled={isLoading}
                        onClick={() => handleStatusChange(order.id, "confirmed")}
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <CheckCircle2 className="mr-1.5 h-4 w-4" />
                        Confirmar Venda (Baixar Estoque)
                      </Button>
                    </>
                  )}

                  {order.status === "confirmed" && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isLoading}
                      onClick={() => handleStatusChange(order.id, "cancelled")}
                      className="rounded-xl text-xs text-muted-foreground hover:text-destructive"
                    >
                      Cancelar e devolver estoque
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
