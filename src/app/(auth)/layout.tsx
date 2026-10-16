import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import { ArrowLeft, FileCode2, History, LockKeyhole } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="auth-layout">
    <header className="auth-header"><Logo href="/" /><ThemeToggle /></header>
    <main id="main-content" className="auth-main">
      <aside className="auth-context" aria-label="Tu cuenta local">
        <p className="text-sm text-muted-foreground">Tu aprendizaje tiene un lugar.</p>
        <h2>Vuelve a tu idea.<br />Sigue desde ahí.</h2>
        <ul><li><FileCode2 aria-hidden="true" /><div><h3>Tus borradores</h3><p>Retoma el código que dejaste a medio escribir.</p></div></li><li><History aria-hidden="true" /><div><h3>Tus intentos</h3><p>Revisa lo que probaste y lo que has resuelto.</p></div></li><li><LockKeyhole aria-hidden="true" /><div><h3>En tu computadora</h3><p>Cuenta y progreso locales, sin servicios externos.</p></div></li></ul>
        <Link href="/ejercicios" className="text-link"><ArrowLeft className="size-4" aria-hidden="true" />Explorar sin cuenta</Link>
      </aside>
      <div className="auth-form-pane">{children}</div>
    </main>
    <footer className="px-6 py-6 text-center text-xs text-muted-foreground">Solo en tu computadora. Sin suscripciones.</footer>
  </div>;
}
