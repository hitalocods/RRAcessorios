"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { CartDrawer } from "@/components/cart-drawer";
import { ProductCard } from "@/components/product-card";
import { SiteHeader } from "@/components/site-header";
import { useProductFilter } from "@/hooks/use-product-filter";
import { CartProvider } from "@/store/cart-store";
import { categories } from "@/types/product";
import type { Product } from "@/types/product";

export function Storefront({ products }: { products: Product[] }) {
  const [cartOpen, setCartOpen] = useState(false);
  const { activeCategory, filteredProducts, setActiveCategory } = useProductFilter(products);

  return (
    <CartProvider>
      <SiteHeader onCartOpen={() => setCartOpen(true)} />
      <main>
        <section className="mx-auto grid max-w-7xl gap-6 px-3 pb-9 pt-7 sm:px-6 sm:pb-12 sm:pt-14 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:pb-20 lg:pt-20">
          <motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-muted-foreground sm:mb-4 sm:text-xs">
              Acessorios premium
            </p>
            <h1 className="max-w-2xl text-4xl font-semibold tracking-[-0.035em] sm:text-6xl lg:text-7xl">
              STORE
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground sm:mt-5 sm:text-base sm:leading-7">
              Curadoria limpa de capas, carregadores, perfumes e acessorios para uma rotina mais precisa.
            </p>
          </motion.div>
          <motion.div
            initial={false}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="grid min-h-56 place-items-center rounded-lg border bg-white p-4 shadow-[0_24px_80px_rgba(15,15,15,0.04)] sm:min-h-72 sm:p-6"
          >
            <div className="w-full max-w-sm space-y-4">
              <div className="aspect-[4/3] rounded-lg bg-[linear-gradient(135deg,#f7f7f6,#e9e7e3)] p-5">
                <div className="flex h-full items-end justify-between gap-3">
                  <div className="h-24 w-16 rounded-[1.1rem] border border-black/10 bg-white/70 shadow-sm sm:h-36 sm:w-24 sm:rounded-[1.4rem]" />
                  <div className="h-32 w-14 rounded-full border border-black/10 bg-[#111] shadow-sm sm:h-44 sm:w-20" />
                  <div className="h-20 w-20 rounded-lg border border-black/10 bg-white/80 shadow-sm sm:h-28 sm:w-28" />
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.16em] text-muted-foreground sm:text-xs sm:tracking-[0.18em]">
                <span>Capas</span>
                <span>Perfumes</span>
                <span>Tech</span>
              </div>
            </div>
          </motion.div>
        </section>

        <section id="categories" className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="premium-scrollbar -mx-3 flex snap-x gap-2 overflow-x-auto px-3 pb-3 sm:mx-0 sm:px-0">
            {(["Todos", ...categories] as const).map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`min-h-10 shrink-0 snap-start rounded-full border px-4 py-2 text-sm transition sm:px-5 ${
                  activeCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-white text-muted-foreground hover:border-foreground hover:text-foreground"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        <section id="products" className="mx-auto max-w-7xl px-3 pb-20 pt-6 sm:px-6 sm:pt-8 lg:px-8">
          <div className="mb-5 flex items-end justify-between gap-4 sm:mb-8">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground sm:text-xs">
                {filteredProducts.length} itens
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight sm:mt-2 sm:text-2xl">Produtos</h2>
            </div>
          </div>
          <motion.div layout className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-2 lg:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </AnimatePresence>
          </motion.div>
        </section>
      </main>
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </CartProvider>
  );
}
