import Link from "next/link";
import { ArrowRight, Code2, Clock3, Route } from "lucide-react";
import { currentUser } from "@/server/auth";
import { getCatalog } from "@/server/catalog";
import { db } from "@/server/db";
import { getLastDraft, getRecentSubmissions } from "@/server/activity";
import { languageNames, levelNames, type Language } from "@/lib/types";
import { learningPathLevel } from "@/lib/learning-paths";
import { Button } from "@/components/ui/button";
import { ExerciseRow } from "@/components/exercise-row";
import { ActivityList } from "@/components/activity-list";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/arc/progress";
import { Disclosure } from "@/components/arc/disclosure";

export const metadata = { title: "Inicio" };
export default async function DashboardPage() {
  const user = await currentUser();
  const language = (user?.preference?.language ?? "python") as Language;
  const [catalog, lastDraft, paths, recent] = await Promise.all([
    getCatalog(user?.id, language),
    user ? getLastDraft(user.id, language) : null,
    db.learningPath.findMany({ orderBy: { order: "asc" }, include: { _count: { select: { items: true } } } }),
    user ? getRecentSubmissions(user.id, 5) : [],
  ]);
  const solved = catalog.filter(e => e.solved).length;
  const continueExercise = catalog.find(e => e.slug === lastDraft?.variant.version.exercise.slug && !e.solved);
  const recommendation = continueExercise ?? catalog.find(e => !e.solved && e.level === (user?.preference?.level ?? "INITIATION")) ?? catalog.find(e => !e.solved) ?? catalog[0];
  const suggestions = catalog.filter(e => !e.solved && e.id !== recommendation?.id).slice(0, 3);
  return <div className="page-container">
    <div className="page-intro">
      <div><h1 className="page-title">{user ? `Hola, ${user.name.split(" ")[0]}.` : "Empieza a practicar."}</h1></div>
      <Link href="/configuracion" className="flex min-h-10 items-center gap-2 rounded-lg bg-surface px-3 text-xs text-muted-foreground hover:bg-selection"><Code2 className="size-3.5" />{languageNames[language]}</Link>
    </div>
    <div className="dashboard-layout">
      <div className="min-w-0">
        {recommendation && <section className="practice-focus" aria-labelledby="continue-title">
          <div className="practice-focus-copy">
          <p className="text-xs font-medium text-muted-foreground">{continueExercise ? "Continúa donde lo dejaste" : solved === catalog.length ? "Volver a practicar" : "Tu siguiente paso"}</p>
          <h2 id="continue-title" className="mt-4 text-2xl font-semibold tracking-tight">{recommendation.title}</h2>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground"><Badge>{levelNames[recommendation.level]}</Badge><span>{recommendation.category}</span><span className="flex items-center gap-1.5"><Clock3 className="size-3.5" />{recommendation.minutes} min aprox.</span></div>
          <Button asChild className="mt-6"><Link href={`/ejercicios/${recommendation.slug}?lenguaje=${language}`}>{continueExercise ? "Continuar ejercicio" : "Empezar ejercicio"}<ArrowRight /></Link></Button>
          </div>
           <div className="practice-focus-method"><Link href="/rutas/desde-cero" className="text-link text-sm">¿Primera vez? Desde cero<ArrowRight className="size-4" aria-hidden="true" /></Link><Disclosure title="Cómo practicar" className="mt-4"><ol><li><span>1</span>Entiende el reto.</li><li><span>2</span>Escribe y prueba.</li><li><span>3</span>Compara y mejora.</li></ol></Disclosure></div>
        </section>}
         {!recommendation && <section className="empty-state" aria-label="Catálogo vacío"><h2 className="section-title">Todavía no hay ejercicios</h2><Link href="/rutas" className="text-link">Explorar rutas<ArrowRight aria-hidden="true" /></Link></section>}
        <section className="dashboard-recommendations" aria-labelledby="recommended-title">
           <div className="section-heading"><h2 id="recommended-title" className="section-title">Para ti</h2><Link href={`/ejercicios?lenguaje=${language}`} className="text-link text-xs">Ver todos<ArrowRight className="size-3.5" /></Link></div>
          {suggestions.length ? suggestions.map(e => <ExerciseRow key={e.id} exercise={e} language={language} />) : <p className="py-6 text-sm leading-6 text-muted-foreground">Has completado el catálogo en este lenguaje. Prueba el otro o repasa tus soluciones.</p>}
        </section>
        <section className="dashboard-routes" aria-labelledby="paths-title">
           <div className="section-heading justify-start gap-2"><Route className="size-4 text-muted-foreground" /><h2 id="paths-title" className="section-title">Rutas</h2></div>
          <ul className="flex flex-col gap-1">{paths.map(path => { const level = learningPathLevel(path.slug); return <li key={path.id}><Link href={`/rutas/${path.slug}?lenguaje=${language}`} className="list-entry items-center justify-between gap-4"><div><h3 className="text-sm font-medium">{path.title}</h3><p className="mt-1 text-xs text-muted-foreground">{path._count.items} ejercicios · {level ? levelNames[level] : "A tu ritmo"}</p></div><ArrowRight className="size-4 shrink-0 text-muted-foreground" /></Link></li>; })}</ul>
        </section>
      </div>
      <div className="dashboard-journal">
         <section className="soft-section" aria-labelledby="progress-title"><div className="flex items-center justify-between gap-2"><h2 id="progress-title" className="section-title">Progreso</h2><Link href="/progreso" className="text-link text-xs">Ver detalle</Link></div><p className="mt-5 text-3xl font-semibold tracking-tight">{solved}<span className="ml-1 text-sm font-normal text-muted-foreground">/ {catalog.length}</span></p><p className="mt-1 text-xs leading-5 text-muted-foreground">Resueltos · {languageNames[language]}</p><Progress label={`Ejercicios resueltos en ${languageNames[language]}`} value={solved} max={catalog.length} className="mt-4" /></section>
        <section aria-labelledby="activity-title"><h2 id="activity-title" className="section-title mb-3 px-3">Actividad reciente</h2><ActivityList entries={recent} compact /></section>
      </div>
    </div>
    {!user && <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-surface px-5 py-4"><p className="text-xs text-muted-foreground">Crea una cuenta local para guardar tu progreso.</p><Link href="/registro" className="text-link text-xs">Crear cuenta<ArrowRight className="size-3.5" /></Link></div>}
  </div>;
}
