"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/store/cart-store";
import type { Product } from "@/types/product";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const installments = product.price / 3;

  return (
    <motion.article
      layout
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      whileHover={{ y: -3 }}
      className="group min-w-0 overflow-hidden rounded-md border bg-card shadow-[0_16px_50px_rgba(15,15,15,0.035)] sm:rounded-lg sm:shadow-[0_20px_60px_rgba(15,15,15,0.04)]"
    >
      <div className="aspect-[1/1.12] overflow-hidden bg-muted sm:aspect-[4/5]">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-stone-100 text-xs uppercase tracking-[0.22em] text-muted-foreground">
            STORE
          </div>
        )}
      </div>
      <div className="space-y-3 p-3 sm:space-y-4 sm:p-5">
        <div className="space-y-1">
          <p className="truncate text-[9px] uppercase tracking-[0.14em] text-muted-foreground sm:text-[11px] sm:tracking-[0.18em]">
            {product.category}
          </p>
          <h3 className="line-clamp-2 min-h-9 text-sm font-medium leading-[1.15] tracking-tight sm:line-clamp-1 sm:min-h-0 sm:text-base">
            {product.name}
          </h3>
          <p className="hidden line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground sm:block">
            {product.description || "Selecao premium STORE."}
          </p>
        </div>
        <div className="grid gap-3 sm:flex sm:items-end sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold tracking-tight sm:text-lg">{formatCurrency(product.price)}</p>
            <p className="hidden text-xs text-muted-foreground sm:block">3x de {formatCurrency(installments)}</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-9 w-full rounded-full px-2 text-xs sm:w-auto sm:px-3 sm:text-sm"
            onClick={() => {
              addItem(product);
              toast.success("Produto adicionado");
            }}
            disabled={product.stock <= 0}
          >
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="sm:hidden">Add</span>
            <span className="hidden sm:inline">Adicionar</span>
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
