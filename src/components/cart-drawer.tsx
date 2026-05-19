"use client";

import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/store/cart-store";

type CartDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const { items, subtotal, removeItem, setQuantity } = useCart();

  const finishOrder = () => {
    const lines = items.map((item) => `- ${item.product.name} x${item.quantity}`).join("%0A");
    const message = `Ola, gostaria de fazer este pedido:%0A%0A${lines}%0A%0ATotal: ${formatCurrency(subtotal)}`;
    const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank", "noopener,noreferrer");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Carrinho</SheetTitle>
        </SheetHeader>
        <div className="premium-scrollbar flex-1 overflow-y-auto px-4 sm:px-6">
          {items.length === 0 ? (
            <div className="flex h-full min-h-80 flex-col items-center justify-center gap-3 text-center">
              <div className="rounded-full border p-4">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <p className="text-sm text-muted-foreground">Seu carrinho esta vazio.</p>
            </div>
          ) : (
            <div className="space-y-4 pb-6 sm:space-y-5">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-3 sm:gap-4">
                  <div className="h-20 w-16 shrink-0 overflow-hidden rounded-md bg-muted sm:h-24 sm:w-20">
                    {item.product.image_url && (
                      <img src={item.product.image_url} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">{formatCurrency(item.product.price)}</p>
                      </div>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => removeItem(item.product.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex w-fit items-center rounded-full border">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-full"
                        onClick={() => setQuantity(item.product.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-full"
                        onClick={() => setQuantity(item.product.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="border-t p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <strong className="text-lg">{formatCurrency(subtotal)}</strong>
          </div>
          <Button className="h-12 w-full rounded-full" disabled={!items.length} onClick={finishOrder}>
            Finalizar no WhatsApp
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
