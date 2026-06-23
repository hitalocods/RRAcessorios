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
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Admin</p>
          <h1 className="text-2xl font-semibold tracking-tight">STORE</h1>
          {params.error === "invalid" && <p className="text-sm text-destructive">Credenciais invalidas.</p>}
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" name="password" type="password" required autoComplete="current-password" />
          </div>
        </div>
        <Button className="h-11 w-full rounded-full">
          Entrar
        </Button>
      </form>
    </main>
  );
}
