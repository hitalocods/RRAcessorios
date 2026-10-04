"use client";

import { useMemo, useState, useTransition } from "react";
import { Loader2, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createOrder } from "@/app/actions/orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/store/cart-store";
import type { Neighborhood } from "@/types/product";

type CartDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  neighborhoods?: Neighborhood[];
};

export function CartDrawer({ open, onOpenChange, neighborhoods = [] }: CartDrawerProps) {
  const { items, subtotal, removeItem, setQuantity, clearCart } = useCart();
  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
  const [selectedNeighborhoodId, setSelectedNeighborhoodId] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const selectedNeighborhood = useMemo(() => {
    return neighborhoods.find((n) => n.id === selectedNeighborhoodId);
  }, [neighborhoods, selectedNeighborhoodId]);

  const deliveryFee = selectedNeighborhood ? selectedNeighborhood.fee : 0;
  const total = subtotal + deliveryFee;

  const handleFinishOrder = () => {
    if (!customerName.trim()) {
      toast.error("Por favor, informe seu nome para o pedido.");
      return;
    }

    if (neighborhoods.length > 0 && !selectedNeighborhoodId) {
      toast.error("Por favor, selecione seu bairro de entrega.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await createOrder({
          customerName,
          address,
          neighborhoodId: selectedNeighborhoodId,
          items: items.map((i) => ({ id: i.product.id, quantity: i.quantity })),
        });

        if (!res.ok) {
          toast.error(res.error);
          return;
        }

        // Monta a mensagem para o WhatsApp com formatação caprichada
        const lines = items
          .map((i) => `• ${i.quantity}x ${i.product.name} - ${formatCurrency(i.product.price * i.quantity)}`)
          .join("\n");

        const msg = [
          `*NOVO PEDIDO #${res.number}*`,
          `━━━━━━━━━━━━━━━━━━`,
          `*Cliente:* ${customerName}`,
          `*Bairro:* ${res.neighborhood}`,
          address ? `*Endereço:* ${address}` : null,
          `━━━━━━━━━━━━━━━━━━`,
          `*Itens:*`,
          lines,
          `━━━━━━━━━━━━━━━━━━`,
          `*Subtotal:* ${formatCurrency(res.subtotal)}`,
          `*Taxa de entrega:* ${res.fee === 0 ? "Grátis" : formatCurrency(res.fee)}`,
          `*Total:* ${formatCurrency(res.total)}`,
        ]
          .filter(Boolean)
          .join("\n");

        const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "558694932418";
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;

        window.open(url, "_blank", "noopener,noreferrer");

        toast.success(`Pedido #${res.number} registrado com sucesso!`);
        clearCart();
        onOpenChange(false);
      } catch {
        toast.error("Falha ao registrar pedido. Tente novamente.");
      }
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Seu Carrinho</SheetTitle>
        </SheetHeader>

        <div className="premium-scrollbar flex-1 overflow-y-auto px-4 sm:px-6">
          {items.length === 0 ? (
            <div className="flex h-full min-h-80 flex-col items-center justify-center gap-3 text-center">
              <div className="rounded-full border p-4 bg-stone-50">
                <ShoppingBag className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">Seu carrinho está vazio</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Navegue pelo catálogo e adicione os itens desejados.
              </p>
            </div>
          ) : (
            <div className="space-y-6 pb-6">
              {/* Lista de itens */}
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-3 sm:gap-4 rounded-xl border p-2.5 bg-card">
                    <div className="h-18 w-16 shrink-0 overflow-hidden rounded-lg bg-stone-100 sm:h-20 sm:w-18">
                      {item.product.image_url ? (
                        <img src={item.product.image_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[9px] uppercase font-semibold text-muted-foreground">
                          Sem foto
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-semibold">{item.product.name}</p>
                        <button
                          type="button"
                          onClick={() => removeItem(item.product.id)}
                          className="text-muted-foreground hover:text-destructive p-1 rounded-md transition"
                          title="Remover item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <p className="text-xs font-medium text-muted-foreground">
                        {formatCurrency(item.product.price)}
                      </p>

                      <div className="flex w-fit items-center rounded-lg border bg-stone-50 p-0.5">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 rounded-md"
                          onClick={() => setQuantity(item.product.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-xs font-semibold">{item.quantity}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 rounded-md"
                          onClick={() => setQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dados de Entrega */}
              <div className="rounded-xl border bg-stone-50/70 p-4 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Dados para Entrega
                </p>

                <div className="space-y-1.5">
                  <Label htmlFor="c-name" className="text-xs">Seu Nome *</Label>
                  <Input
                    id="c-name"
                    placeholder="Como podemos te chamar?"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="h-9 rounded-lg bg-white text-sm"
                    required
                  />
                </div>

                {neighborhoods.length > 0 && (
                  <div className="space-y-1.5">
                    <Label htmlFor="c-neigh" className="text-xs">Bairro *</Label>
                    <select
                      id="c-neigh"
                      value={selectedNeighborhoodId}
                      onChange={(e) => setSelectedNeighborhoodId(e.target.value)}
                      className="w-full h-9 rounded-lg border border-input bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    >
                      <option value="">Selecione seu bairro...</option>
                      {neighborhoods.map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.name} - Taxa: {n.fee === 0 ? "Grátis" : formatCurrency(n.fee)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="c-address" className="text-xs">Endereço completo (Rua, nº, ponto de ref.)</Label>
                  <Input
                    id="c-address"
                    placeholder="Ex: Rua das Flores, 120, Apto 2"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="h-9 rounded-lg bg-white text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t bg-card p-4 sm:p-5 space-y-3">
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxa de Entrega</span>
                <span className={deliveryFee === 0 ? "text-emerald-600 font-semibold" : ""}>
                  {selectedNeighborhood ? (deliveryFee === 0 ? "Grátis" : formatCurrency(deliveryFee)) : "A calcular"}
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-1.5 border-t text-sm font-bold text-foreground">
                <span>Total</span>
                <span className="text-lg text-primary">{formatCurrency(total)}</span>
              </div>
            </div>

            <Button
              className="h-12 w-full rounded-xl text-sm font-semibold shadow-md"
              disabled={isPending}
              onClick={handleFinishOrder}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando Pedido...
                </>
              ) : (
                "Finalizar no WhatsApp"
              )}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
