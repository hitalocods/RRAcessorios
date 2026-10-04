"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/types/product";

export function useProductFilter(products: Product[]) {
  const [activeCategory, setActiveCategory] = useState<string>("Todos");

  const filteredProducts = useMemo(
    () => (activeCategory === "Todos" ? products : products.filter((product) => product.category === activeCategory)),
    [activeCategory, products],
  );

  return {
    activeCategory,
    filteredProducts,
    setActiveCategory,
  };
}
