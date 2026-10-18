"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Code2, Route, ChartNoAxesCombined, Settings2, LogOut, Shield, PanelLeftClose, PanelLeftOpen, Menu } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { authClient } from "@/lib/auth-client";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "./ui/dialog";
import { rememberSettingsOrigin } from "@/lib/motion";
import { MotionRegion } from "./motion-region";

export type ShellUser = { name: string; email: string; role: string };
const navigation = [
  { href: "/inicio", label: "Inicio", icon: Home },
  { href: "/ejercicios", label: "Ejercicios", icon: Code2 },
  { href: "/rutas", label: "Rutas de aprendizaje", icon: Route },
  { href: "/progreso", label: "Mi progreso", icon: ChartNoAxesCombined },
];
const preferenceKey = "itera:navigation";
function subscribe(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener("itera:navigation", listener);
  return () => { window.removeEventListener("storage", listener); window.removeEventListener("itera:navigation", listener); };
}
function snapshot() { try { return localStorage.getItem(preferenceKey); } catch { return null; } }

export function AppShell({ children, user, workspace = false, header }: { children: React.ReactNode; user: ShellUser | null; workspace?: boolean; header?: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const preference = useSyncExternalStore(subscribe, snapshot, () => null);
  const [fallback, setFallback] = useState<string | null>(null);
  const collapsed = (fallback ?? preference ?? (workspace ? "collapsed" : "expanded")) === "collapsed";
  const [signingOut, setSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState(false);
  const [navigationOpen, setNavigationOpen] = useState(false);
  const navigationDestination = useRef<string | null>(null);
  useEffect(() => {
    function restoreNavigation() {
      const open = window.history.state?.iteraNavigation === true;
      setNavigationOpen(open);
      if (!open && navigationDestination.current) {
        const href = navigationDestination.current;
        navigationDestination.current = null;
        // Next restaura primero la entrada anterior durante este mismo popstate.
        // Navegar en el siguiente turno evita que esa restauración pise el destino.
        window.setTimeout(() => router.push(href, { scroll: href !== "/configuracion" }), 0);
      }
    }
    window.addEventListener("popstate", restoreNavigation);
    return () => window.removeEventListener("popstate", restoreNavigation);
  }, [router]);

  function changeNavigation(open: boolean) {
    if (open) {
      if (!window.history.state?.iteraNavigation) {
        window.history.pushState({ ...window.history.state, iteraNavigation: true }, "");
      }
      setNavigationOpen(true);
    } else if (window.history.state?.iteraNavigation) {
      window.history.back();
    } else {
      setNavigationOpen(false);
    }
  }
  const title = navigation.find(n => pathname.startsWith(n.href))?.label ?? (pathname.startsWith("/admin") ? "Administración" : "Configuración");

  function toggleNavigation() {
    const next = collapsed ? "expanded" : "collapsed";
    try { localStorage.setItem(preferenceKey, next); window.dispatchEvent(new Event("itera:navigation")); }
    catch { setFallback(next); }
  }

  function navigationContent(mobile = false) {
    function item({ href, label, icon: Icon }: typeof navigation[number]) {
      const active = pathname.startsWith(href);
      const link = <Link href={href} scroll={href === "/configuracion" ? false : undefined} onClick={event => { if (href === "/configuracion") rememberSettingsOrigin(event.currentTarget); }} className="navigation-link" aria-label={label} aria-current={active ? "page" : undefined}>
        <Icon aria-hidden="true" /><span className="navigation-label">{label}</span>
      </Link>;
      return <div key={href} className="navigation-item relative">
        {link}
        {!mobile && <span className="navigation-tooltip" aria-hidden="true">{label}</span>}
      </div>;
    }
    return <>
      <div className="flex h-11 items-center px-1 md:h-9"><Logo className="navigation-brand" href="/" /></div>
      <nav aria-label={mobile ? "Navegación móvil" : "Navegación principal"} className="mt-7 space-y-1"><p className="navigation-caption">Tu práctica</p>{navigation.map(entry => item(entry))}</nav>
      <div className="mt-auto space-y-1 pt-8">
        {user?.role === "ADMIN" && item({ href: "/admin", label: "Administración", icon: Shield })}
        {item({ href: "/configuracion", label: "Configuración", icon: Settings2 })}
        <div className="mx-2 mt-4 flex min-h-10 items-center justify-center gap-2 pt-3 text-xs text-muted-foreground">
          <Code2 className="size-4 shrink-0" aria-hidden="true" /><span className="navigation-footer-label">Entorno local</span>
        </div>
      </div>
    </>;
  }

  return <div className="app-shell" data-collapsed={collapsed}>
    <aside id="navigation-sidebar" className="app-sidebar" aria-label="Barra lateral">{navigationContent()}</aside>
      <header className="app-header flex min-w-0 items-center gap-2 px-3 sm:gap-3 sm:px-5">
      <Dialog open={navigationOpen} onOpenChange={changeNavigation}>
        <DialogTrigger asChild><Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir navegación"><Menu /></Button></DialogTrigger>
        <DialogContent className="navigation-drawer inset-y-0 left-0 top-0 flex h-dvh max-h-none w-[min(288px,calc(100%-3rem))] translate-x-0 translate-y-0 flex-col rounded-none border-0 border-r bg-surface p-4" onClickCapture={event => {
          const link = event.target instanceof Element ? event.target.closest("a") : null;
          if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          event.preventDefault();
          if (link.pathname === "/configuracion") rememberSettingsOrigin(link);
          navigationDestination.current = link.pathname + link.search + link.hash;
          changeNavigation(false);
        }}>
          <DialogTitle className="sr-only">Navegación de Itera</DialogTitle>
          <DialogDescription className="sr-only">Accede a tus ejercicios, rutas y progreso.</DialogDescription>
          {navigationContent(true)}
        </DialogContent>
      </Dialog>
      <Button variant="ghost" size="icon" className="hidden min-[1200px]:inline-flex" aria-label={collapsed ? "Expandir navegación" : "Contraer navegación"} aria-expanded={!collapsed} aria-controls="navigation-sidebar" title={collapsed ? "Expandir navegación" : "Contraer navegación"} onClick={toggleNavigation}>
        {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
      </Button>
      <div className="min-w-0 flex-1">{header ?? <p className="text-sm font-medium">{title}</p>}</div>
      <div className="flex shrink-0 items-center gap-2">
        <ThemeToggle />
        {!workspace && (user ? <>
          <Link href="/configuracion" scroll={false} onClick={event => rememberSettingsOrigin(event.currentTarget)} aria-label="Mi cuenta" className="ml-1 flex size-8 items-center justify-center rounded-full border bg-surface text-xs font-medium" title={user.name}>{user.name.slice(0, 1).toUpperCase()}</Link>
          <Button variant="ghost" size="icon" disabled={signingOut} aria-label="Cerrar sesión" title="Cerrar sesión" onClick={async () => {
            setSigningOut(true); setLogoutError(false);
            try { const result = await authClient.signOut(); if (result.error) throw new Error(); router.push("/"); router.refresh(); }
            catch { setLogoutError(true); } finally { setSigningOut(false); }
          }}><LogOut /></Button>
        </> : <Button asChild variant="outline" size="sm"><Link href="/registro">Crear cuenta</Link></Button>)}
      </div>
    </header>
    {logoutError && <p role="alert" className="border-b px-5 py-3 text-sm text-destructive">No se pudo cerrar la sesión. Inténtalo de nuevo.</p>}
    {workspace ? children : <main id="main-content"><MotionRegion>{children}</MotionRegion></main>}
  </div>;
}
