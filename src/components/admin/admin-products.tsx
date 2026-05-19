"use client";

import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { deleteProduct } from "@/app/actions/products";
import { ProductForm } from "@/components/admin/product-form";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types/product";

export function AdminProducts({ products }: { products: Product[] }) {
  return (
    <div className="grid gap-4">
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.03 }}
          className="grid gap-4 rounded-lg border bg-card p-3 shadow-sm sm:grid-cols-[84px_1fr_auto]"
        >
          <div className="h-24 overflow-hidden rounded-md bg-muted sm:h-20">
            {product.image_url && <img src={product.image_url} alt="" className="h-full w-full object-cover" />}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-medium">{product.name}</h3>
              <span className="rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground">{product.category}</span>
            </div>
            <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{product.description}</p>
            <div className="mt-3 flex gap-4 text-sm">
              <span>{formatCurrency(product.price)}</span>
              <span className="text-muted-foreground">{product.stock} em estoque</span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:justify-end">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="rounded-full">
                  Editar
                </Button>
              </SheetTrigger>
              <SheetContent className="premium-scrollbar overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Editar produto</SheetTitle>
                </SheetHeader>
                <div className="px-6 pb-6">
                  <ProductForm product={product} />
                </div>
              </SheetContent>
            </Sheet>
            <form action={deleteProduct}>
              <input type="hidden" name="id" value={product.id} />
              <Button size="icon" variant="ghost" className="rounded-full text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </motion.div>
      ))}
      {!products.length && (
        <div className="rounded-lg border bg-card p-10 text-center text-sm text-muted-foreground">
          Nenhum produto cadastrado.
        </div>
      )}
      <Separator />
    </div>
  );
}
