import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { FileCode2, History, LockKeyhole } from "lucide-react";
import { MotionRegion } from "@/components/motion-region";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="auth-layout">
    <header className="auth-header"><Logo href="/" /><ThemeToggle /></header>
    <main id="main-content" className="auth-main">
      <MotionRegion className="auth-form-pane">{children}</MotionRegion>
      <aside className="auth-context" aria-label="Tu cuenta local">
        <h2>Tu código.<br />Tu próximo intento.</h2>
        <ul><li><FileCode2 aria-hidden="true" /><h3>Borradores de tu cuenta</h3></li><li><History aria-hidden="true" /><h3>Historial de intentos</h3></li><li><LockKeyhole aria-hidden="true" /><h3>Datos en esta instalación</h3></li></ul>
      </aside>
    </main>
    <footer className="px-6 py-6 text-center text-xs text-muted-foreground">Cuenta y progreso en la base de datos local de Itera. Sin copia en la nube.</footer>
  </div>;
}
