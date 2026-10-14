"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, Code2, Route, ChartNoAxesCombined, Settings2, LogOut, ArrowUpRight, Shield, PanelLeftClose } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";

const navigation = [{ href: "/inicio", label: "Mi espacio", icon: LayoutGrid }, { href: "/ejercicios", label: "Ejercicios", icon: Code2 }, { href: "/rutas", label: "Rutas de aprendizaje", icon: Route }, { href: "/progreso", label: "Mi progreso", icon: ChartNoAxesCombined }];

export function AppShell({ children, user }: { children: React.ReactNode; user: { name: string; email: string; role: string } | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState(false);
  return <div className="min-h-dvh md:pl-[224px]">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[224px] flex-col border-r bg-background px-4 py-7 md:flex">
      <Logo className="ml-4" />
      <div className="mt-12 mb-3 px-4 text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase">Tu aprendizaje</div>
      <nav aria-label="Navegación principal" className="space-y-1">{navigation.map(({ href, label, icon: Icon }) => <Link key={href} href={href} aria-current={pathname.startsWith(href) ? "page" : undefined} className={cn("flex h-11 items-center gap-3 rounded-lg px-4 text-[13px] transition-colors", pathname.startsWith(href) ? "bg-surface font-medium text-foreground" : "text-muted-foreground hover:bg-surface hover:text-foreground")}><Icon className={cn("size-[17px]", pathname.startsWith(href) && "text-primary")} strokeWidth={1.6} />{label}</Link>)}</nav>
      <div className="mt-auto space-y-1 pt-8">
        <div className="mx-3 mb-7 rounded-xl border border-dashed p-3.5"><p className="text-xs font-medium">Un poco, cada día.</p><p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">La próxima solución empieza con un intento.</p></div>
        {user?.role === "ADMIN" && <Link className="flex h-11 items-center gap-3 rounded-lg px-4 text-[13px] text-muted-foreground hover:bg-surface" href="/admin"><Shield className="size-4" />Administración</Link>}
        <Link href="/configuracion" className="flex h-11 items-center gap-3 rounded-lg px-4 text-[13px] text-muted-foreground hover:bg-surface"><Settings2 className="size-4" />Configuración</Link>
        <div className="mt-4 flex items-center justify-between border-t pt-4 pl-3"><span className="flex items-center gap-2 text-xs text-muted-foreground"><span className="size-1.5 rounded-full bg-muted-foreground" />Entorno local</span><ThemeToggle /></div>
      </div>
    </aside>
    <header className="flex h-18 items-center justify-between gap-4 border-b px-5 sm:px-9 lg:px-12">
      <div className="md:hidden"><Logo /></div><div className="hidden items-center gap-2 text-xs text-muted-foreground md:flex"><PanelLeftClose className="size-4" strokeWidth={1.5} /><span className="mx-2 text-border">/</span>{navigation.find(n => pathname.startsWith(n.href))?.label ?? (pathname.startsWith("/admin") ? "Administración" : "Configuración")}</div>
      <div className="flex items-center gap-3"><span className="hidden text-xs text-muted-foreground sm:block">A tu ritmo. A tu manera.</span><span className="hidden h-4 border-l sm:block" />{user ? <><Link href="/configuracion" className="flex items-center gap-2.5 text-xs font-medium"><span className="flex size-8 items-center justify-center rounded-full bg-surface">{user.name.slice(0, 1).toUpperCase()}</span><span className="hidden lg:inline">{user.name}</span></Link><Button variant="ghost" size="icon" disabled={signingOut} aria-label="Cerrar sesión" onClick={async () => { setSigningOut(true); setLogoutError(false); try { const result = await authClient.signOut(); if (result.error) throw new Error(); router.push("/"); router.refresh(); } catch { setLogoutError(true); } finally { setSigningOut(false); } }}><LogOut /></Button>{logoutError && <span role="alert" className="text-xs text-destructive">Intenta cerrar sesión otra vez.</span>}</> : <Button asChild variant="outline" size="sm"><Link href="/registro">Crear cuenta <ArrowUpRight /></Link></Button>}<div className="md:hidden"><ThemeToggle /></div></div>
    </header>
    <nav aria-label="Navegación móvil" className="sticky top-0 z-20 flex overflow-x-auto border-b bg-background px-3 md:hidden">{navigation.map(({ href, label, icon: Icon }) => <Link key={href} href={href} aria-current={pathname.startsWith(href) ? "page" : undefined} className={cn("flex min-h-12 shrink-0 items-center gap-2 border-b-2 px-3 text-xs", pathname.startsWith(href) ? "border-primary text-primary" : "border-transparent text-muted-foreground")}><Icon className="size-4" />{label}</Link>)}</nav>
    <main id="main-content" className="animate-enter">{children}</main>
  </div>;
}
