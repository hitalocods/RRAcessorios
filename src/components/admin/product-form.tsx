"use client";

import { useState, useTransition } from "react";
import { Pencil, Plus, Upload } from "lucide-react";
import { toast } from "sonner";
import { createProduct, updateProduct } from "@/app/actions/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { categories, type Product } from "@/types/product";

export function ProductForm({ product }: { product?: Product }) {
  const [category, setCategory] = useState(product?.category || categories[0]);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        formData.set("category", category);
        startTransition(async () => {
          try {
            if (product) {
              await updateProduct(formData);
              toast.success("Produto atualizado");
            } else {
              await createProduct(formData);
              toast.success("Produto criado");
            }
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Falha ao salvar produto");
          }
        });
      }}
      className="grid gap-4"
    >
      {product && (
        <>
          <input type="hidden" name="id" value={product.id} />
          <input type="hidden" name="current_image_url" value={product.image_url || ""} />
        </>
      )}
      <div className="grid gap-2">
        <Label htmlFor={product ? `name-${product.id}` : "name"}>Nome</Label>
        <Input id={product ? `name-${product.id}` : "name"} name="name" defaultValue={product?.name} required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={product ? `description-${product.id}` : "description"}>Descricao</Label>
        <Textarea
          id={product ? `description-${product.id}` : "description"}
          name="description"
          defaultValue={product?.description || ""}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label htmlFor={product ? `price-${product.id}` : "price"}>Preco</Label>
          <Input
            id={product ? `price-${product.id}` : "price"}
            name="price"
            type="number"
            min="0"
            step="0.01"
            defaultValue={product?.price}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={product ? `stock-${product.id}` : "stock"}>Estoque</Label>
          <Input
            id={product ? `stock-${product.id}` : "stock"}
            name="stock"
            type="number"
            min="0"
            step="1"
            defaultValue={product?.stock ?? 0}
            required
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label>Categoria</Label>
        <Select value={category} onValueChange={(value) => setCategory(value as typeof category)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((item) => (
              <SelectItem value={item} key={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor={product ? `image-${product.id}` : "image"}>Imagem</Label>
        <label className="flex h-24 cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed bg-muted/40 text-sm text-muted-foreground transition hover:bg-muted">
          <Upload className="h-4 w-4" />
          Upload para Storage
          <Input id={product ? `image-${product.id}` : "image"} name="image" type="file" accept="image/*" className="sr-only" />
        </label>
      </div>
      <Button disabled={isPending} className="rounded-full">
        {product ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        {product ? "Salvar alteracoes" : "Adicionar produto"}
      </Button>
    </form>
  );
}
