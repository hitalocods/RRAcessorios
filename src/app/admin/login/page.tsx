import { signInAdmin } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const dynamic = "force-dynamic";

export default async function AdminLogin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="grid min-h-dvh place-items-center bg-background px-4">
      <form action={signInAdmin} className="w-full max-w-sm space-y-7 rounded-lg border bg-card p-6 shadow-sm">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Painel Administrativo</p>
          <h1 className="text-2xl font-semibold tracking-tight">RR ACESSÓRIOS</h1>
          {params.error === "invalid" && <p className="text-sm font-medium text-destructive">Senha incorreta. Tente novamente.</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Senha de Acesso</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoFocus
            autoComplete="current-password"
            placeholder="Digite sua senha..."
            className="h-11 rounded-xl"
          />
        </div>
        <Button className="h-11 w-full rounded-xl text-sm font-medium shadow-sm">
          Acessar Painel
        </Button>
      </form>
    </main>
  );
}
