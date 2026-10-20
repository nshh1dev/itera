import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import { ArrowLeft, FileCode2, History, LockKeyhole } from "lucide-react";
import { MotionRegion } from "@/components/motion-region";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="auth-layout">
    <header className="auth-header"><Logo href="/" /><ThemeToggle /></header>
    <main id="main-content" className="auth-main">
      <MotionRegion className="auth-form-pane">{children}</MotionRegion>
      <aside className="auth-context" aria-label="Tu cuenta local">
        <h2>Tu código.<br />Tu próximo intento.</h2>
        <ul><li><FileCode2 aria-hidden="true" /><h3>Borradores guardados</h3></li><li><History aria-hidden="true" /><h3>Historial de intentos</h3></li><li><LockKeyhole aria-hidden="true" /><h3>Todo en tu computadora</h3></li></ul>
        <Link href="/ejercicios" className="text-link"><ArrowLeft className="size-4" aria-hidden="true" />Explorar sin cuenta</Link>
      </aside>
    </main>
    <footer className="px-6 py-6 text-center text-xs text-muted-foreground">Solo en tu computadora. Sin suscripciones.</footer>
  </div>;
}
