"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  Banknote,
  CheckCircle2,
  CreditCard,
  Loader2,
  Minus,
  Plus,
  QrCode,
  ShoppingBag,
  Store,
  Trash2,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { createOrder } from "@/app/actions/orders";
import { getLiveNeighborhoods } from "@/app/actions/settings";
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

export function CartDrawer({ open, onOpenChange, neighborhoods: initialNeighborhoods = [] }: CartDrawerProps) {
  const { items, subtotal, removeItem, setQuantity, clearCart } = useCart();
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>(initialNeighborhoods);
  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">("delivery");
  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
  const [reference, setReference] = useState("");
  const [selectedNeighborhoodId, setSelectedNeighborhoodId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"Pix" | "Cartão" | "Dinheiro">("Pix");
  const [needChange, setNeedChange] = useState(false);
  const [changeFor, setChangeFor] = useState("");
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();

  // Sincronização em tempo real dos bairros do banco de dados sempre que o carrinho abrir
  useEffect(() => {
    if (open) {
      getLiveNeighborhoods().then((res) => {
        if (res.ok && res.data.length > 0) {
          setNeighborhoods(res.data);
          // Se ainda não selecionou nenhum bairro e a entrega for delivery, pré-seleciona o primeiro
          setSelectedNeighborhoodId((prev) => prev || res.data[0]?.id || "");
        }
      });
    }
  }, [open]);

  const selectedNeighborhood = useMemo(() => {
    return neighborhoods.find((n) => n.id === selectedNeighborhoodId);
  }, [neighborhoods, selectedNeighborhoodId]);

  const deliveryFee = deliveryType === "delivery" ? (selectedNeighborhood ? selectedNeighborhood.fee : 0) : 0;
  const total = subtotal + deliveryFee;

  const handleFinishOrder = () => {
    if (!customerName.trim()) {
      toast.error("Por favor, informe seu nome para o pedido.");
      return;
    }

    if (deliveryType === "delivery") {
      if (neighborhoods.length > 0 && !selectedNeighborhoodId) {
        toast.error("Por favor, selecione seu bairro de entrega.");
        return;
      }
      if (!address.trim()) {
        toast.error("Por favor, informe a rua e número para entrega.");
        return;
      }
    }

    startTransition(async () => {
      try {
        const fullAddress = reference.trim() ? `${address.trim()} (Ref: ${reference.trim()})` : address.trim();

        const res = await createOrder({
          customerName,
          deliveryType,
          neighborhoodId: deliveryType === "delivery" ? selectedNeighborhoodId : undefined,
          address: deliveryType === "delivery" ? fullAddress : "Retirada na loja",
          paymentMethod,
          changeFor: needChange ? changeFor : undefined,
          notes,
          items: items.map((i) => ({ id: i.product.id, quantity: i.quantity })),
        });

        if (!res.ok) {
          toast.error(res.error);
          return;
        }

        // Monta a mensagem para o WhatsApp com formatação limpa e profissional
        const lines = items
          .map((i) => `• ${i.quantity}x ${i.product.name} (${formatCurrency(i.product.price * i.quantity)})`)
          .join("\n");

        const msgLines = [
          `*NOVO PEDIDO #${res.number}*`,
          `━━━━━━━━━━━━━━━━━━`,
          `*Cliente:* ${customerName}`,
          `*Tipo:* ${res.deliveryType === "pickup" ? "🏪 Retirada na Loja" : "🛵 Entrega no Endereço"}`,
        ];

        if (res.deliveryType === "delivery") {
          msgLines.push(`*Bairro:* ${res.neighborhood}`);
          msgLines.push(`*Endereço:* ${address.trim()}`);
          if (reference.trim()) {
            msgLines.push(`*Ponto de ref.:* ${reference.trim()}`);
          }
        }

        msgLines.push(`━━━━━━━━━━━━━━━━━━`);
        msgLines.push(`*Itens do Pedido:*`);
        msgLines.push(lines);
        msgLines.push(`━━━━━━━━━━━━━━━━━━`);
        msgLines.push(`*Pagamento:* ${res.paymentMethod}`);
        if (notes.trim()) {
          msgLines.push(`*Observação:* ${notes.trim()}`);
        }
        msgLines.push(`━━━━━━━━━━━━━━━━━━`);
        msgLines.push(`*Subtotal:* ${formatCurrency(res.subtotal)}`);
        msgLines.push(`*Taxa de entrega:* ${res.fee === 0 ? "Grátis" : formatCurrency(res.fee)}`);
        msgLines.push(`*TOTAL A PAGAR:* ${formatCurrency(res.total)}`);
        msgLines.push(`━━━━━━━━━━━━━━━━━━`);
        msgLines.push(`_Aguardando confirmação da loja_`);

        const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "558694932418";
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(msgLines.join("\n"))}`;

        window.open(url, "_blank", "noopener,noreferrer");

        toast.success(`Pedido #${res.number} enviado com sucesso!`);
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
          <SheetTitle className="text-lg font-bold">Seu Carrinho</SheetTitle>
        </SheetHeader>

        <div className="premium-scrollbar flex-1 overflow-y-auto px-4 sm:px-6">
          {items.length === 0 ? (
            <div className="flex h-full min-h-80 flex-col items-center justify-center gap-3 text-center">
              <div className="rounded-full border p-4 bg-stone-50">
                <ShoppingBag className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold">Seu carrinho está vazio</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Navegue pelo catálogo e escolha seus produtos para finalizar o pedido.
              </p>
            </div>
          ) : (
            <div className="space-y-6 pb-6">
              {/* Lista de Itens */}
              <div className="space-y-2.5">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Itens Selecionados ({items.length})
                </p>
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-3 rounded-xl border p-2.5 bg-card">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                      {item.product.image_url ? (
                        <img src={item.product.image_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[9px] uppercase font-semibold text-muted-foreground">
                          Sem foto
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-semibold">{item.product.name}</p>
                        <button
                          type="button"
                          onClick={() => removeItem(item.product.id)}
                          className="text-muted-foreground hover:text-destructive p-1 rounded-md transition"
                          title="Remover item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <p className="text-xs font-semibold text-foreground">
                        {formatCurrency(item.product.price)}
                      </p>

                      <div className="flex w-fit items-center rounded-lg border bg-stone-50 p-0.5">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 rounded-md"
                          onClick={() => setQuantity(item.product.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-7 text-center text-xs font-semibold">{item.quantity}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 rounded-md"
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

              {/* Dados do Cliente */}
              <div className="rounded-xl border bg-stone-50/70 p-3.5 space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="customer-name" className="text-xs font-semibold">
                    Seu Nome *
                  </Label>
                  <Input
                    id="customer-name"
                    placeholder="Digite seu nome completo"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="h-9 rounded-lg bg-white text-sm"
                    required
                  />
                </div>

                {/* Alternador: Entrega ou Retirada */}
                <div className="space-y-1.5 pt-1">
                  <Label className="text-xs font-semibold">Como deseja receber?</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDeliveryType("delivery")}
                      className={`flex items-center justify-center gap-1.5 rounded-lg border p-2 text-xs font-medium transition ${
                        deliveryType === "delivery"
                          ? "border-black bg-black text-white shadow-sm"
                          : "border-input bg-white text-muted-foreground hover:bg-stone-50"
                      }`}
                    >
                      <Truck className="h-3.5 w-3.5" />
                      Entrega (Delivery)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryType("pickup")}
                      className={`flex items-center justify-center gap-1.5 rounded-lg border p-2 text-xs font-medium transition ${
                        deliveryType === "pickup"
                          ? "border-black bg-black text-white shadow-sm"
                          : "border-input bg-white text-muted-foreground hover:bg-stone-50"
                      }`}
                    >
                      <Store className="h-3.5 w-3.5" />
                      Retirada na Loja
                    </button>
                  </div>
                </div>

                {/* Campos de Entrega */}
                {deliveryType === "delivery" ? (
                  <div className="space-y-2.5 pt-2 border-t border-stone-200">
                    <div className="space-y-1">
                      <Label htmlFor="c-neigh" className="text-xs font-semibold">
                        Bairro de Entrega *
                      </Label>
                      {neighborhoods.length > 0 ? (
                        <select
                          id="c-neigh"
                          value={selectedNeighborhoodId}
                          onChange={(e) => setSelectedNeighborhoodId(e.target.value)}
                          className="w-full h-9 rounded-lg border border-input bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring font-medium"
                          required
                        >
                          {neighborhoods.map((n) => (
                            <option key={n.id} value={n.id}>
                              {n.name} — Taxa: {n.fee === 0 ? "Grátis" : formatCurrency(n.fee)}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-xs text-muted-foreground rounded-lg border bg-white p-2">
                          Entrega disponível (taxa a combinar pelo WhatsApp)
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="c-address" className="text-xs font-semibold">
                        Rua e Número *
                      </Label>
                      <Input
                        id="c-address"
                        placeholder="Ex: Av. Frei Serafim, 1250"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="h-9 rounded-lg bg-white text-sm"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="c-ref" className="text-xs font-medium text-muted-foreground">
                        Complemento / Ponto de Referência
                      </Label>
                      <Input
                        id="c-ref"
                        placeholder="Ex: Apto 302, em frente ao supermercado"
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                        className="h-9 rounded-lg bg-white text-sm"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-2.5 text-xs text-emerald-800 space-y-1">
                    <p className="font-semibold flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      Retirada Grátis no Balcão
                    </p>
                    <p className="text-muted-foreground">
                      Seu pedido será separado e ficará pronto para você retirar na nossa loja.
                    </p>
                  </div>
                )}
              </div>

              {/* Forma de Pagamento */}
              <div className="rounded-xl border bg-stone-50/70 p-3.5 space-y-3">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Forma de Pagamento
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod("Pix");
                      setNeedChange(false);
                    }}
                    className={`flex flex-col items-center justify-center gap-1 rounded-lg border p-2 text-xs font-medium transition ${
                      paymentMethod === "Pix"
                        ? "border-black bg-black text-white shadow-sm"
                        : "border-input bg-white text-muted-foreground hover:bg-stone-50"
                    }`}
                  >
                    <QrCode className="h-4 w-4" />
                    Pix
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod("Cartão");
                      setNeedChange(false);
                    }}
                    className={`flex flex-col items-center justify-center gap-1 rounded-lg border p-2 text-xs font-medium transition ${
                      paymentMethod === "Cartão"
                        ? "border-black bg-black text-white shadow-sm"
                        : "border-input bg-white text-muted-foreground hover:bg-stone-50"
                    }`}
                  >
                    <CreditCard className="h-4 w-4" />
                    Cartão
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("Dinheiro")}
                    className={`flex flex-col items-center justify-center gap-1 rounded-lg border p-2 text-xs font-medium transition ${
                      paymentMethod === "Dinheiro"
                        ? "border-black bg-black text-white shadow-sm"
                        : "border-input bg-white text-muted-foreground hover:bg-stone-50"
                    }`}
                  >
                    <Banknote className="h-4 w-4" />
                    Dinheiro
                  </button>
                </div>

                {/* Opção de Troco para dinheiro */}
                {paymentMethod === "Dinheiro" && (
                  <div className="space-y-2 pt-1 border-t border-stone-200">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground">
                      <input
                        type="checkbox"
                        checked={needChange}
                        onChange={(e) => setNeedChange(e.target.checked)}
                        className="rounded border-stone-300 text-black focus:ring-black h-4 w-4"
                      />
                      Precisa de troco?
                    </label>

                    {needChange && (
                      <div className="space-y-1">
                        <Label htmlFor="change-for" className="text-[11px] text-muted-foreground">
                          Troco para quanto?
                        </Label>
                        <Input
                          id="change-for"
                          placeholder="Ex: R$ 50,00 ou R$ 100,00"
                          value={changeFor}
                          onChange={(e) => setChangeFor(e.target.value)}
                          className="h-8 rounded-lg bg-white text-xs"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Observações adicionais */}
                <div className="space-y-1 pt-1">
                  <Label htmlFor="notes" className="text-[11px] text-muted-foreground">
                    Observação do pedido (opcional)
                  </Label>
                  <Input
                    id="notes"
                    placeholder="Ex: Embalar para presente..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="h-8 rounded-lg bg-white text-xs"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Resumo e Botão de Finalização */}
        {items.length > 0 && (
          <div className="border-t bg-card p-4 sm:p-5 space-y-3">
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Subtotal dos produtos</span>
                <span className="font-medium text-foreground">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Entrega ({deliveryType === "pickup" ? "Retirada" : selectedNeighborhood?.name || "Bairro"})</span>
                <span
                  className={
                    deliveryFee === 0 ? "text-emerald-600 font-semibold" : "font-medium text-foreground"
                  }
                >
                  {deliveryFee === 0 ? "Grátis" : formatCurrency(deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t text-sm font-bold text-foreground">
                <span>Total a Pagar</span>
                <span className="text-xl font-extrabold text-primary">{formatCurrency(total)}</span>
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
                  Registrando Pedido...
                </>
              ) : (
                "Enviar Pedido no WhatsApp"
              )}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
