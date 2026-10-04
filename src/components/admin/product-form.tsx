"use client";

import { useRef, useState, useTransition } from "react";
import { Loader2, Pencil, Plus, Upload } from "lucide-react";
import { toast } from "sonner";
import { createProduct, updateProduct } from "@/app/actions/products";
import { compressImage } from "@/lib/compress-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { defaultCategories, type Product } from "@/types/product";

interface ProductFormProps {
  product?: Product;
  categories?: string[];
  onSuccess?: () => void;
}

export function ProductForm({ product, categories: availableCategories, onSuccess }: ProductFormProps) {
  const cats = availableCategories && availableCategories.length > 0 ? availableCategories : Array.from(defaultCategories);
  const [category, setCategory] = useState(product?.category || cats[0]);
  const [preview, setPreview] = useState<{ url: string; size: number } | null>(null);
  const [isPending, startTransition] = useTransition();
  const compressed = useRef<File | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleFile(file: File | undefined) {
    if (preview) URL.revokeObjectURL(preview.url);
    compressed.current = null;
    setPreview(null);
    if (!file) return;

    try {
      const small = await compressImage(file);
      compressed.current = small;
      setPreview({ url: URL.createObjectURL(small), size: small.size });
    } catch {
      toast.error("Não foi possível otimizar a imagem");
    }
  }

  return (
    <form
      ref={formRef}
      action={(formData) => {
        formData.set("category", category);
        if (compressed.current) formData.set("image", compressed.current);
        startTransition(async () => {
          try {
            const res = product ? await updateProduct(formData) : await createProduct(formData);
            if (!res.ok) {
              toast.error(res.error);
              return;
            }

            toast.success(product ? "Produto atualizado com sucesso!" : "Produto criado com sucesso!");
            if (!product) {
              formRef.current?.reset();
              if (preview) URL.revokeObjectURL(preview.url);
              setPreview(null);
              compressed.current = null;
            }
            onSuccess?.();
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
        <Label htmlFor={product ? `name-${product.id}` : "name"}>Nome do Produto</Label>
        <Input
          id={product ? `name-${product.id}` : "name"}
          name="name"
          placeholder="Ex: Capa MagSafe Fosca"
          defaultValue={product?.name}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor={product ? `description-${product.id}` : "description"}>Descrição</Label>
        <Textarea
          id={product ? `description-${product.id}` : "description"}
          name="description"
          placeholder="Detalhes, material, compatibilidade..."
          defaultValue={product?.description || ""}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label htmlFor={product ? `price-${product.id}` : "price"}>Preço (R$)</Label>
          <Input
            id={product ? `price-${product.id}` : "price"}
            name="price"
            type="number"
            min="0"
            step="0.01"
            placeholder="0,00"
            defaultValue={product?.price}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={product ? `stock-${product.id}` : "stock"}>Estoque (Qtd)</Label>
          <Input
            id={product ? `stock-${product.id}` : "stock"}
            name="stock"
            type="number"
            min="0"
            step="1"
            placeholder="0"
            defaultValue={product?.stock ?? 0}
            required
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Categoria</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a categoria" />
          </SelectTrigger>
          <SelectContent>
            {cats.map((item) => (
              <SelectItem value={item} key={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor={product ? `image-${product.id}` : "image"}>Foto do Produto</Label>
        <label className="flex h-28 cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-dashed bg-muted/30 p-2 text-sm text-muted-foreground transition hover:border-black/40 hover:bg-muted/60">
          {preview ? (
            <div className="flex items-center gap-3">
              <img src={preview.url} alt="Preview" className="h-20 w-20 rounded-lg object-cover shadow-sm" />
              <div className="text-left text-xs">
                <p className="font-medium text-foreground">Foto otimizada</p>
                <p className="text-muted-foreground">Tamanho: {(preview.size / 1024).toFixed(0)} KB (WebP)</p>
                <p className="mt-1 text-[11px] text-primary underline">Clique para trocar</p>
              </div>
            </div>
          ) : product?.image_url ? (
            <div className="flex items-center gap-3">
              <img src={product.image_url} alt={product.name} className="h-20 w-20 rounded-lg object-cover shadow-sm" />
              <div className="text-left text-xs">
                <p className="font-medium text-foreground">Imagem atual</p>
                <p className="mt-1 text-[11px] text-primary underline">Clique para substituir</p>
              </div>
            </div>
          ) : (
            <>
              <Upload className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Selecionar imagem</span>
              <span className="text-[11px] text-muted-foreground">Será comprimida automaticamente em WebP</span>
            </>
          )}
          <Input
            id={product ? `image-${product.id}` : "image"}
            name="image"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => handleFile(event.target.files?.[0])}
          />
        </label>
      </div>

      <Button disabled={isPending} className="mt-2 h-11 w-full rounded-xl font-medium">
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : product ? (
          <>
            <Pencil className="mr-2 h-4 w-4" />
            Salvar alterações
          </>
        ) : (
          <>
            <Plus className="mr-2 h-4 w-4" />
            Cadastrar produto
          </>
        )}
      </Button>
    </form>
  );
}
