"use client";

import { useState, useTransition } from "react";
import { Edit2, Plus, Tags, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createCategory, deleteCategory, renameCategory } from "@/app/actions/settings";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Category } from "@/types/product";

interface CategoriesManagerProps {
  categories: Category[];
}

export function CategoriesManager({ categories }: CategoriesManagerProps) {
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newName, setNewName] = useState("");
  const [editName, setEditName] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;

    startTransition(async () => {
      try {
        const res = await createCategory(newName);
        if (!res.ok) {
          toast.error(res.error);
        } else {
          toast.success("Categoria criada com sucesso!");
          setNewName("");
          setIsNewOpen(false);
        }
      } catch {
        toast.error("Erro ao criar categoria");
      }
    });
  }

  async function handleRename(e: React.FormEvent) {
    e.preventDefault();
    if (!editingCategory || !editName.trim()) return;

    startTransition(async () => {
      try {
        const res = await renameCategory(editingCategory.id, editName);
        if (!res.ok) {
          toast.error(res.error);
        } else {
          toast.success("Categoria atualizada com sucesso!");
          setEditingCategory(null);
        }
      } catch {
        toast.error("Erro ao renomear categoria");
      }
    });
  }

  async function handleDelete(category: Category) {
    if (category.product_count > 0) {
      toast.error(`Esta categoria possui ${category.product_count} produto(s) vinculado(s). Mova ou exclua os produtos antes.`);
      return;
    }

    if (!confirm(`Deseja excluir a categoria "${category.name}"?`)) return;

    startTransition(async () => {
      try {
        const res = await deleteCategory(category.id);
        if (!res.ok) {
          toast.error(res.error);
        } else {
          toast.success("Categoria excluída!");
        }
      } catch {
        toast.error("Erro ao excluir categoria");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {categories.length} {categories.length === 1 ? "categoria cadastrada" : "categorias cadastradas"}
        </p>

        <Button onClick={() => setIsNewOpen(true)} className="rounded-xl">
          <Plus className="mr-2 h-4 w-4" />
          Nova Categoria
        </Button>
      </div>

      {/* Modal Criar Categoria */}
      <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
        <DialogContent
          title="Nova Categoria"
          description="Digite o nome da categoria para organizar seus produtos na loja."
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Nome da Categoria</Label>
              <Input
                id="cat-name"
                placeholder="Ex: Fones, Relógios, Mochilas..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
                required
              />
            </div>
            <Button disabled={isPending} className="w-full rounded-xl">
              {isPending ? "Criando..." : "Criar Categoria"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Editar Categoria */}
      <Dialog open={Boolean(editingCategory)} onOpenChange={(open) => !open && setEditingCategory(null)}>
        <DialogContent
          title="Renomear Categoria"
          description="Ao renomear, todos os produtos desta categoria serão atualizados automaticamente."
        >
          <form onSubmit={handleRename} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cat-rename">Nome</Label>
              <Input
                id="cat-rename"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                autoFocus
                required
              />
            </div>
            <Button disabled={isPending} className="w-full rounded-xl">
              {isPending ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Grid de Categorias */}
      {categories.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-white p-12 text-center">
          <Tags className="mx-auto h-8 w-8 text-muted-foreground/60" />
          <p className="mt-2 font-medium">Nenhuma categoria cadastrada</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Crie categorias para agrupar seus produtos.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between rounded-2xl border bg-white p-4 shadow-sm"
            >
              <div>
                <h3 className="font-semibold text-foreground">{cat.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {cat.product_count} {cat.product_count === 1 ? "produto" : "produtos"}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  onClick={() => {
                    setEditingCategory(cat);
                    setEditName(cat.name);
                  }}
                  title="Renomear categoria"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg text-destructive hover:bg-red-50 hover:text-red-600"
                  onClick={() => handleDelete(cat)}
                  title="Excluir categoria"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
