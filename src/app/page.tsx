import Link from "next/link";
import { ArrowRight, Code2, Route } from "lucide-react";
import { currentUser } from "@/server/auth";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { PracticeDemo } from "@/components/landing/practice-demo";
import { Disclosure } from "@/components/arc/disclosure";
import { languageNames, levelNames } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const user = await currentUser();
  return <div className="landing">
    <header className="landing-header landing-container">
      <Logo href="/" />
      <nav className="flex items-center gap-3 sm:gap-7" aria-label="Navegación">
        <Link href="/ejercicios" className="landing-nav-link hidden sm:inline-flex">Ejercicios</Link>
        <Link href="/rutas" className="landing-nav-link hidden sm:inline-flex">Rutas</Link>
        <ThemeToggle />
        <Link href={user ? "/inicio" : "/iniciar-sesion"} className="landing-nav-link inline-flex">{user ? "Mi espacio" : "Entrar"}</Link>
      </nav>
    </header>
    <main id="main-content">
      <section className="landing-hero landing-container" aria-labelledby="landing-title">
        <div className="landing-hero-copy">
          <h1 id="landing-title">Menos teoría.<br />Más intentos.</h1>
          <p className="landing-lead">Aprende lógica escribiendo código.</p>
          <div className="landing-hero-actions">
            <Button asChild size="lg"><Link href={user ? "/inicio" : "/ejercicios/suma-de-dos-numeros?lenguaje=javascript"}>{user ? "Continuar" : "Empezar"}<ArrowRight aria-hidden="true" /></Link></Button>
            <Link href="/rutas" className="landing-quiet-link">Elegir ruta<ArrowRight className="size-3.5" aria-hidden="true" /></Link>
          </div>
          <p className="landing-hero-note">Python · JavaScript · TypeScript</p>
        </div>
        <div className="landing-hero-product">
          <PracticeDemo />
          <div className="landing-demo-footnote"><span>Demo interactiva · código fijo</span><Link href="/ejercicios/suma-de-dos-numeros?lenguaje=javascript" className="landing-quiet-link">Abrir editor<ArrowRight className="size-3.5" aria-hidden="true" /></Link></div>
        </div>
      </section>
      <section className="landing-explore" aria-labelledby="explore-title">
        <div className="landing-container landing-explore-grid">
          <div className="landing-explore-copy">
            <Route className="size-6 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
            <h2 id="explore-title">Elige tu<br />próximo reto.</h2>
            <Link href="/rutas" className="landing-quiet-link">Ver rutas<ArrowRight className="size-4" aria-hidden="true" /></Link>
          </div>
          <div className="landing-explore-options">
            <form action="/ejercicios" className="landing-finder" aria-label="Encuentra tu ejercicio">
              <fieldset><legend>¿Qué quieres practicar?</legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><label htmlFor="landing-language" className="field-label">Lenguaje</label><select id="landing-language" name="lenguaje" defaultValue="python" className="field">{Object.entries(languageNames).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
                  <div><label htmlFor="landing-level" className="field-label">Nivel</label><select id="landing-level" name="nivel" defaultValue="INITIATION" className="field">{Object.entries(levelNames).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
                </div>
                <Button type="submit" variant="outline" className="mt-5 w-full">Explorar ejercicios<ArrowRight aria-hidden="true" /></Button>
              </fieldset>
            </form>
            <Link href="/rutas/desde-cero" className="landing-route-link">
              <span className="landing-route-mark" aria-hidden="true"><span /><span /><span /></span>
              <div><h3>Desde cero</h3><p>Tu primera línea de código.</p></div>
              <ArrowRight className="ml-auto size-5 shrink-0" aria-hidden="true" />
            </Link>
            <Disclosure title="¿Cómo funciona?" className="mt-5 px-3"><ol className="flex flex-col gap-3 pb-4 text-sm leading-6 text-muted-foreground"><li>1. Entiende el reto.</li><li>2. Escribe y prueba tu código.</li><li>3. Compara y vuelve a intentarlo.</li></ol><p className="pb-4 text-sm leading-6 text-muted-foreground">Pistas y soluciones cuando las necesites. Cuenta y progreso en tu computadora.</p></Disclosure>
          </div>
        </div>
      </section>
      <section className="landing-closing landing-container" aria-labelledby="closing-title">
        <div><Code2 className="mb-4 size-6 text-muted-foreground" aria-hidden="true" /><h2 id="closing-title">Un intento<br />más cerca.</h2></div>
        <Button asChild size="lg"><Link href="/rutas/desde-cero">Empezar desde cero<ArrowRight aria-hidden="true" /></Link></Button>
      </section>
    </main>
    <footer className="landing-footer landing-container"><Logo href="/" /><div className="flex flex-wrap gap-5"><Link href="/ejercicios" className="landing-quiet-link">Ejercicios</Link><Link href="/rutas" className="landing-quiet-link">Rutas</Link></div></footer>
  </div>;
}
