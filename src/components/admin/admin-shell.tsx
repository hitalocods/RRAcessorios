"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, ExternalLink, LayoutDashboard, LogOut, MapPin, Package, Tags } from "lucide-react";
import { signOutAdmin } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/pedidos", label: "Pedidos", icon: ClipboardList },
  { href: "/admin/produtos", label: "Produtos", icon: Package },
  { href: "/admin/categorias", label: "Categorias", icon: Tags },
  { href: "/admin/bairros", label: "Bairros", icon: MapPin },
];

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

export function AdminShell({ pending, children }: { pending: number; children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh bg-[#f6f6f5]">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-[#0d0d0e] text-white lg:flex">
        <div className="px-6 pb-8 pt-7">
          <p className="text-[11px] uppercase tracking-[0.28em] text-white/40">Painel</p>
          <p className="mt-1 text-lg font-semibold tracking-tight">RR Acessórios</p>
        </div>
        <nav className="grid gap-1 px-3">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition",
                  active ? "bg-white text-black" : "text-white/60 hover:bg-white/[0.06] hover:text-white",
                )}
              >
                <Icon className="h-[18px] w-[18px]" />
                <span className="flex-1">{label}</span>
                {href === "/admin/pedidos" && pending > 0 && (
                  <span
                    className={cn(
                      "grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-semibold",
                      active ? "bg-black text-white" : "bg-amber-400 text-black",
                    )}
                  >
                    {pending}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto grid gap-1 border-t border-white/10 p-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/60 transition hover:bg-white/[0.06] hover:text-white"
          >
            <ExternalLink className="h-[18px] w-[18px]" />
            Ver loja
          </Link>
          <form action={signOutAdmin}>
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/60 transition hover:bg-white/[0.06] hover:text-white">
              <LogOut className="h-[18px] w-[18px]" />
              Sair
            </button>
          </form>
        </div>
      </aside>

      {/* Topo mobile */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-white/85 px-4 backdrop-blur-xl lg:hidden">
        <p className="font-semibold tracking-tight">RR Acessórios</p>
        <div className="flex items-center gap-1">
          <Link href="/" target="_blank" className="rounded-full p-2 text-muted-foreground" aria-label="Ver loja">
            <ExternalLink className="h-5 w-5" />
          </Link>
          <form action={signOutAdmin}>
            <button className="rounded-full p-2 text-muted-foreground" aria-label="Sair">
              <LogOut className="h-5 w-5" />
            </button>
          </form>
        </div>
      </header>

      <main className="px-4 pb-28 pt-6 sm:px-6 lg:ml-64 lg:px-10 lg:pb-12 lg:pt-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>

      {/* Navegacao inferior mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition",
                active ? "text-black" : "text-muted-foreground",
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 1.8} />
              {label}
              {href === "/admin/pedidos" && pending > 0 && (
                <span className="absolute right-[calc(50%-18px)] top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-amber-400 px-1 text-[10px] font-semibold text-black">
                  {pending}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 lg:mb-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
