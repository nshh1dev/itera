import Link from "next/link";
import { ArrowDown, ArrowRight, Check, CornerDownRight, Lightbulb, Route, Terminal } from "lucide-react";
import { currentUser } from "@/server/auth";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { PracticeDemo } from "@/components/landing/practice-demo";
import { languageNames, levelNames } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const user = await currentUser();

  return <div className="landing">
    <header className="landing-header landing-container">
      <Logo href="/" />
      <nav className="flex items-center gap-3 sm:gap-7" aria-label="Navegación">
        <a href="#como-se-aprende" className="landing-nav-link hidden md:inline-flex">El método</a>
        <Link href="/ejercicios" className="landing-nav-link hidden sm:inline-flex">Explorar ejercicios</Link>
        <ThemeToggle />
        <Link href={user ? "/inicio" : "/iniciar-sesion"} className="landing-nav-link inline-flex">{user ? "Ir a mi panel" : "Iniciar sesión"}</Link>
      </nav>
    </header>

    <main id="main-content">
      <section className="landing-hero landing-container" aria-labelledby="landing-title">
        <div className="landing-hero-copy">
          <h1 id="landing-title">Una idea se entiende<br />cuando la pones a prueba.</h1>
          <p className="landing-lead">Aprende lógica escribiendo código. Prueba una idea, compara el resultado y entiende qué cambiar en el siguiente intento.</p>
          <div className="landing-hero-actions">
            <Button asChild size="lg"><Link href={user ? "/inicio" : "/ejercicios/suma-de-dos-numeros?lenguaje=javascript"}>{user ? "Seguir practicando" : "Empezar a practicar"} <ArrowRight aria-hidden="true" data-icon="inline-end" /></Link></Button>
            <a href="#como-se-aprende" className="landing-quiet-link">Así se aprende <ArrowDown className="size-3.5" aria-hidden="true" /></a>
          </div>
          <p className="landing-hero-note">Python, JavaScript y TypeScript. En tu computadora, a tu ritmo.</p>
        </div>
        <div className="landing-hero-product">
          <div className="landing-demo-caption"><span>Una entrada. Tu idea en código. Un resultado que puedes explicar.</span><CornerDownRight className="size-4" aria-hidden="true" /></div>
          <PracticeDemo />
          <div className="landing-demo-footnote"><span>Demostración interactiva · código fijo</span><Link href="/ejercicios/suma-de-dos-numeros?lenguaje=javascript" className="landing-quiet-link">Abrir en Itera <ArrowRight className="size-3.5" aria-hidden="true" /></Link></div>
        </div>
      </section>

      <section id="como-se-aprende" className="landing-process landing-container" aria-labelledby="process-title">
        <div className="landing-section-heading">
          <h2 id="process-title">De «¿y si…?»<br />a «ahora lo entiendo».</h2>
          <p>Cuatro pasos para pasar de una idea a una solución que puedes explicar.</p>
        </div>
        <ol className="landing-steps">
          <li>
            <span className="landing-step-number">01</span>
            <h3>Comprender</h3>
            <p>Una consigna concreta. Una entrada y un resultado que buscar.</p>
            <div className="landing-step-sample"><span className="text-muted-foreground">Recibes</span><code>&#123; a: 3, b: 5 &#125;</code></div>
          </li>
          <li>
            <span className="landing-step-number">02</span>
            <h3>Programar</h3>
            <p>Traduce tu idea a código. Empieza con lo que ya sabes.</p>
            <div className="landing-step-sample"><code><span className="text-primary-text">return</span> data.a + data.b;</code></div>
          </li>
          <li>
            <span className="landing-step-number">03</span>
            <h3>Ejecutar</h3>
            <p>Prueba los ejemplos. Compara lo que esperabas con lo que pasó.</p>
            <div className="landing-step-sample"><Check className="size-4 text-success-text" aria-hidden="true" /><code>8</code><span className="text-muted-foreground">Resultado esperado</span></div>
          </li>
          <li>
            <span className="landing-step-number">04</span>
            <h3>Mejorar</h3>
            <p>Cambia la entrada. Revisa tu solución. Haz tuya la lógica.</p>
            <div className="landing-step-sample"><code>a: -2, b: 7</code><ArrowRight className="size-3.5 text-muted-foreground" aria-hidden="true" /><code>5</code></div>
          </li>
        </ol>
      </section>

      <section className="landing-explore" aria-labelledby="explore-title">
        <div className="landing-container landing-explore-grid">
          <div className="landing-explore-copy">
            <Route className="size-6 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
            <h2 id="explore-title">Tu punto de partida.<br />Tu propio recorrido.</h2>
            <p className="landing-section-copy">¿Tu primera línea o tu próximo reto? Elige un lenguaje y un nivel. Sigue una ruta o explora por tu cuenta.</p>
            <Link href="/rutas" className="landing-quiet-link">Ver todas las rutas <ArrowRight className="size-4" aria-hidden="true" /></Link>
          </div>
          <div className="landing-explore-options">
            <form action="/ejercicios" className="landing-finder" aria-label="Encuentra tu ejercicio">
              <fieldset>
                <legend>Hoy quiero practicar…</legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><label htmlFor="landing-language" className="field-label">Lenguaje</label><select id="landing-language" name="lenguaje" defaultValue="python" className="field">{Object.entries(languageNames).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
                  <div><label htmlFor="landing-level" className="field-label">Nivel</label><select id="landing-level" name="nivel" defaultValue="BEGINNER" className="field">{Object.entries(levelNames).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
                </div>
                <Button type="submit" variant="outline" className="mt-5 w-full">Encontrar ejercicios <ArrowRight aria-hidden="true" data-icon="inline-end" /></Button>
              </fieldset>
            </form>
            <Link href="/rutas/desde-cero" className="landing-route-link">
              <span className="landing-route-mark" aria-hidden="true"><span /><span /><span /></span>
              <div><span className="text-xs text-muted-foreground">¿Nunca has programado?</span><h3>Desde cero</h3><p>Tu primer resultado, paso a paso.</p></div>
              <ArrowRight className="ml-auto size-5 shrink-0" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="landing-feedback landing-container" aria-labelledby="feedback-title">
        <div className="landing-review">
          <div className="landing-review-heading"><Terminal className="size-4" aria-hidden="true" /><span>Leer el resultado también es programar.</span></div>
          <div className="landing-review-body">
            <p className="text-xs text-muted-foreground">Ejemplo de un primer intento · a = 3, b = 5</p>
            <code className="landing-review-code"><span className="text-primary-text">return</span> data.a;</code>
            <dl className="landing-comparison">
              <div><dt>Tu resultado</dt><dd>3<span>Solo devolviste a</span></dd></div>
              <div><dt>Esperado</dt><dd>8<span>La suma de a y b</span></dd></div>
            </dl>
            <details className="landing-hint">
              <summary><Lightbulb className="size-4" aria-hidden="true" /><span>Una pista para seguir</span><span className="landing-details-indicator" aria-hidden="true">+</span></summary>
              <p>Ya tienes el primer número. ¿Qué operación necesitas para añadir el segundo? Usa <code>+</code> y devuelve la suma con <code>return</code>.</p>
            </details>
            <details className="landing-hint">
              <summary><Terminal className="size-4" aria-hidden="true" /><span>Entender la solución</span><span className="landing-details-indicator" aria-hidden="true">+</span></summary>
              <div className="landing-explanation"><code>return data.a + data.b;</code><p>Accedemos a ambos valores, los sumamos y entregamos el resultado. Con 3 y 5 obtenemos 8; con −2 y 7, obtenemos 5. Cambia los números en la demo para comprobarlo.</p></div>
            </details>
          </div>
        </div>
        <div className="landing-feedback-copy">
          <h2 id="feedback-title">No salió.<br />Ya sabes algo más.</h2>
          <p className="landing-section-copy">Compara lo esperado con tu resultado. Si necesitas ayuda, descubre una pista cada vez o consulta la solución explicada. Después, vuelve al código y prueba lo que entendiste.</p>
        </div>
      </section>

      <section className="landing-closing landing-container" aria-labelledby="closing-title">
        <div><p className="text-sm text-muted-foreground">No hace falta tenerlo todo claro.</p><h2 id="closing-title">Empieza con<br />una pequeña idea.</h2></div>
        <div className="landing-closing-action"><Button asChild size="lg"><Link href="/rutas/desde-cero">Dar el primer paso <ArrowRight aria-hidden="true" data-icon="inline-end" /></Link></Button><p>Sin experiencia previa.<br />Sin prisa por terminar.</p></div>
      </section>
    </main>

    <footer className="landing-footer landing-container">
      <Logo href="/" />
      <p>Un intento más cerca.</p>
      <div className="flex flex-wrap gap-5"><Link href="/ejercicios" className="landing-quiet-link">Ejercicios</Link><Link href="/rutas" className="landing-quiet-link">Rutas</Link><span>Hecho para aprender.</span></div>
    </footer>
  </div>;
}
