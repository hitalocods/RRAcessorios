"use client";

import { useMemo, useState, useTransition } from "react";
import { AlertCircle, Edit2, Minus, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { adjustStock, deleteProduct } from "@/app/actions/products";
import { ProductForm } from "@/components/admin/product-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import type { Category, Product } from "@/types/product";

interface ProductsManagerProps {
  initialProducts: Product[];
  categories: Category[];
}

export function ProductsManager({ initialProducts, categories }: ProductsManagerProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [stockFilter, setStockFilter] = useState<"all" | "low" | "out">("all");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const categoryNames = useMemo(() => categories.map((c) => c.name), [categories]);

  const filtered = useMemo(() => {
    return initialProducts.filter((product) => {
      const matchSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(search.toLowerCase()));

      const matchCategory = selectedCategory === "Todos" || product.category === selectedCategory;

      let matchStock = true;
      if (stockFilter === "low") matchStock = product.stock > 0 && product.stock <= 3;
      if (stockFilter === "out") matchStock = product.stock <= 0;

      return matchSearch && matchCategory && matchStock;
    });
  }, [initialProducts, search, selectedCategory, stockFilter]);

  async function handleAdjustStock(id: string, delta: number) {
    startTransition(async () => {
      try {
        const res = await adjustStock(id, delta);
        if (!res.ok) toast.error(res.error);
      } catch {
        toast.error("Erro ao alterar estoque");
      }
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este produto? A imagem também será apagada do armazenamento.")) {
      return;
    }

    setDeletingId(id);
    startTransition(async () => {
      try {
        const res = await deleteProduct(id);
        if (!res.ok) {
          toast.error(res.error);
        } else {
          toast.success("Produto excluído com sucesso");
        }
      } catch {
        toast.error("Erro ao excluir produto");
      } finally {
        setDeletingId(null);
      }
    });
  }

  return (
    <div className="space-y-5">
      {/* Barra de Ações: Busca, Filtros e Botão Novo Produto */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar produtos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 rounded-xl bg-white pl-9"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-10 rounded-xl border border-input bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="Todos">Todas as Categorias</option>
            {categoryNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as "all" | "low" | "out")}
            className="h-10 rounded-xl border border-input bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">Todo Estoque</option>
            <option value="low">Estoque Baixo (≤ 3)</option>
            <option value="out">Esgotados (0)</option>
          </select>
        </div>

        {/* Modal de Novo Produto */}
        <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
          <DialogTrigger asChild>
            <Button className="h-10 rounded-xl px-4 shadow-sm">
              <Plus className="mr-2 h-4 w-4" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent
            title="Cadastrar Novo Produto"
            description="Preencha os dados e escolha a foto. A imagem será otimizada automaticamente."
          >
            <ProductForm
              categories={categoryNames}
              onSuccess={() => setIsNewOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Modal de Edição */}
      <Dialog open={Boolean(editingProduct)} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent
          title="Editar Produto"
          description="Altere os dados desejados e salve as alterações."
        >
          {editingProduct && (
            <ProductForm
              product={editingProduct}
              categories={categoryNames}
              onSuccess={() => setEditingProduct(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Lista de Produtos */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-white p-12 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground/60" />
          <p className="mt-2 font-medium">Nenhum produto encontrado</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {initialProducts.length === 0
              ? "Comece cadastrando seu primeiro produto clicando no botão acima."
              : "Tente mudar os filtros de busca ou categoria."}
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((product) => {
            const isLow = product.stock > 0 && product.stock <= 3;
            const isOut = product.stock <= 0;

            return (
              <div
                key={product.id}
                className="flex flex-col gap-4 rounded-2xl border bg-white p-3.5 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between sm:p-4"
              >
                {/* Imagem + Info */}
                <div className="flex min-w-0 items-center gap-3.5">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border bg-stone-100">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] uppercase font-semibold text-muted-foreground">
                        Sem foto
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate font-semibold text-foreground">{product.name}</h3>
                      <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs text-muted-foreground">
                        {product.category}
                      </span>
                    </div>
                    {product.description && (
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{product.description}</p>
                    )}
                    <p className="mt-1 text-sm font-semibold">{formatCurrency(product.price)}</p>
                  </div>
                </div>

                {/* Estoque e Ações */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3 sm:border-t-0 sm:pt-0 sm:justify-end">
                  {/* Controle Rápido de Estoque */}
                  <div className="flex items-center gap-1.5 rounded-xl border bg-stone-50 p-1">
                    <button
                      type="button"
                      onClick={() => handleAdjustStock(product.id, -1)}
                      disabled={product.stock <= 0}
                      className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-white hover:text-foreground disabled:opacity-30"
                      title="Diminuir estoque"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span
                      className={`min-w-10 text-center text-xs font-semibold ${
                        isOut ? "text-red-600" : isLow ? "text-amber-600" : "text-foreground"
                      }`}
                    >
                      {product.stock} un
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAdjustStock(product.id, 1)}
                      className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-white hover:text-foreground"
                      title="Aumentar estoque"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Botões Editar / Excluir */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingProduct(product)}
                      className="h-9 rounded-xl"
                    >
                      <Edit2 className="mr-1.5 h-3.5 w-3.5" />
                      Editar
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(product.id)}
                      disabled={deletingId === product.id}
                      className="h-9 w-9 rounded-xl text-destructive hover:bg-red-50 hover:text-red-600"
                      title="Excluir produto"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
