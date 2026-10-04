"use client";

import { useState, useTransition } from "react";
import { Edit2, MapPin, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteNeighborhood, saveNeighborhood } from "@/app/actions/settings";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import type { Neighborhood } from "@/types/product";

interface NeighborhoodsManagerProps {
  neighborhoods: Neighborhood[];
}

export function NeighborhoodsManager({ neighborhoods }: NeighborhoodsManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Neighborhood | null>(null);
  const [name, setName] = useState("");
  const [fee, setFee] = useState("");
  const [isPending, startTransition] = useTransition();

  function openCreate() {
    setEditing(null);
    setName("");
    setFee("0");
    setIsModalOpen(true);
  }

  function openEdit(item: Neighborhood) {
    setEditing(item);
    setName(item.name);
    setFee(String(item.fee));
    setIsModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    startTransition(async () => {
      try {
        const res = await saveNeighborhood({
          id: editing?.id,
          name,
          fee,
        });

        if (!res.ok) {
          toast.error(res.error);
        } else {
          toast.success(editing ? "Bairro atualizado!" : "Bairro cadastrado com sucesso!");
          setIsModalOpen(false);
        }
      } catch {
        toast.error("Erro ao salvar bairro");
      }
    });
  }

  async function handleDelete(item: Neighborhood) {
    if (!confirm(`Deseja remover o bairro "${item.name}"?`)) return;

    startTransition(async () => {
      try {
        const res = await deleteNeighborhood(item.id);
        if (!res.ok) {
          toast.error(res.error);
        } else {
          toast.success("Bairro removido!");
        }
      } catch {
        toast.error("Erro ao excluir bairro");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {neighborhoods.length} {neighborhoods.length === 1 ? "bairro cadastrado" : "bairros cadastrados"}
        </p>

        <Button onClick={openCreate} className="rounded-xl">
          <Plus className="mr-2 h-4 w-4" />
          Novo Bairro
        </Button>
      </div>

      {/* Modal Cadastrar / Editar Bairro */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          title={editing ? "Editar Bairro" : "Cadastrar Bairro"}
          description="Informe o nome do bairro e o valor da taxa de entrega cobrada dos clientes."
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="neigh-name">Nome do Bairro</Label>
              <Input
                id="neigh-name"
                placeholder="Ex: Centro, Ilhotas, Jóquei..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="neigh-fee">Taxa de Entrega (R$)</Label>
              <Input
                id="neigh-fee"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                required
              />
              <p className="text-[11px] text-muted-foreground">
                Coloque 0 para entrega grátis neste bairro.
              </p>
            </div>

            <Button disabled={isPending} className="w-full rounded-xl">
              {isPending ? "Salvando..." : editing ? "Salvar Alterações" : "Cadastrar Bairro"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Lista de Bairros */}
      {neighborhoods.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-white p-12 text-center">
          <MapPin className="mx-auto h-8 w-8 text-muted-foreground/60" />
          <p className="mt-2 font-medium">Nenhum bairro cadastrado</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Cadastre os bairros atendidos e suas taxas para que os clientes selecionem no carrinho.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {neighborhoods.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-2xl border bg-white p-4 shadow-sm"
            >
              <div>
                <h3 className="font-semibold text-foreground">{item.name}</h3>
                <p className="text-xs font-medium text-muted-foreground mt-0.5">
                  Taxa:{" "}
                  <span className={item.fee === 0 ? "text-emerald-600 font-bold" : "text-foreground font-semibold"}>
                    {item.fee === 0 ? "Grátis" : formatCurrency(item.fee)}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  onClick={() => openEdit(item)}
                  title="Editar bairro"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg text-destructive hover:bg-red-50 hover:text-red-600"
                  onClick={() => handleDelete(item)}
                  title="Excluir bairro"
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
