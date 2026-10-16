import Link from "next/link";
import { ArrowRight, Code2, Clock3, Route } from "lucide-react";
import { currentUser } from "@/server/auth";
import { getCatalog } from "@/server/catalog";
import { db } from "@/server/db";
import { languageNames, levelNames, type Language } from "@/lib/types";
import { learningPathLevel } from "@/lib/learning-paths";
import { Button } from "@/components/ui/button";
import { ExerciseRow } from "@/components/exercise-row";
import { ActivityList } from "@/components/activity-list";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Inicio" };
export default async function DashboardPage() {
  const user = await currentUser();
  const language = (user?.preference?.language ?? "python") as Language;
  const catalog = await getCatalog(user?.id, language);
  const solved = catalog.filter(e => e.solved).length;
  const lastDraft = user ? await db.draft.findFirst({ where: { userId: user.id, variant: { language, version: { exercise: { published: true } } } }, orderBy: { updatedAt: "desc" }, select: { variant: { select: { version: { select: { exercise: { select: { slug: true } } } } } } } }) : null;
  const continueExercise = catalog.find(e => e.slug === lastDraft?.variant.version.exercise.slug && !e.solved);
  const recommendation = continueExercise ?? catalog.find(e => !e.solved && e.level === (user?.preference?.level ?? "BEGINNER")) ?? catalog.find(e => !e.solved) ?? catalog[0];
  const suggestions = catalog.filter(e => !e.solved && e.id !== recommendation?.id).slice(0, 3);
  const [paths, recent] = await Promise.all([
    db.learningPath.findMany({ orderBy: { order: "asc" }, include: { _count: { select: { items: true } } } }),
    user ? db.submission.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 5, select: { id: true, status: true, mode: true, createdAt: true, passedCount: true, totalCount: true, variant: { select: { language: true, version: { select: { title: true, exercise: { select: { slug: true } } } } } } } }) : [],
  ]);
  return <div className="page-container">
    <div className="page-intro">
      <div><h1 className="page-title">{user ? `Hola, ${user.name.split(" ")[0]}.` : "Tu primer paso en programación."}</h1><p className="page-description">{user ? "Retoma tu práctica o descubre tu siguiente ejercicio." : "Empieza con un ejercicio guiado. Puedes explorar sin crear una cuenta."}</p></div>
      <Link href="/configuracion" className="flex min-h-10 items-center gap-2 rounded-lg bg-surface px-3 text-xs text-muted-foreground transition-colors hover:bg-selection"><Code2 className="size-3.5" />{languageNames[language]}</Link>
    </div>
    <div className="dashboard-layout">
      <div className="min-w-0">
        {recommendation && <section className="practice-focus" aria-labelledby="continue-title">
          <div className="practice-focus-copy">
          <p className="text-xs font-medium text-muted-foreground">{continueExercise ? "Continúa donde lo dejaste" : solved === catalog.length ? "Volver a practicar" : "Tu siguiente paso"}</p>
          <h2 id="continue-title" className="mt-4 text-2xl font-semibold tracking-tight">{recommendation.title}</h2>
          <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">{recommendation.description}</p>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground"><Badge>{levelNames[recommendation.level]}</Badge><span>{recommendation.category}</span><span className="flex items-center gap-1.5"><Clock3 className="size-3.5" />{recommendation.minutes} min aprox.</span></div>
          <Button asChild className="mt-6"><Link href={`/ejercicios/${recommendation.slug}?lenguaje=${language}`}>{continueExercise ? "Continuar ejercicio" : "Empezar ejercicio"}<ArrowRight /></Link></Button>
          </div>
          <div className="practice-focus-method" aria-label="Cómo practicar"><p className="text-sm font-medium">Una idea, un nuevo intento</p><ol><li><span>1</span>Entiende la entrada y lo que debes obtener.</li><li><span>2</span>Escribe tu solución y prueba los ejemplos.</li><li><span>3</span>Compara el resultado y vuelve al código.</li></ol><Link href="/rutas/desde-cero" className="text-link text-xs">¿Primera vez? Empieza desde cero</Link></div>
        </section>}
        {!recommendation && <section className="empty-state" aria-label="Catálogo vacío"><h2 className="section-title">Todavía no hay ejercicios publicados</h2><p className="text-sm leading-7 text-muted-foreground">Cuando haya contenido disponible, encontrarás aquí tu primer paso. Mientras tanto, puedes explorar las rutas.</p><Link href="/rutas" className="text-link">Explorar rutas<ArrowRight aria-hidden="true" /></Link></section>}
        <section className="dashboard-recommendations" aria-labelledby="recommended-title">
          <div className="section-heading"><h2 id="recommended-title" className="section-title">Ejercicios recomendados</h2><Link href={`/ejercicios?lenguaje=${language}`} className="text-link text-xs">Ver todos<ArrowRight className="size-3.5" /></Link></div>
          {suggestions.length ? suggestions.map(e => <ExerciseRow key={e.id} exercise={e} language={language} />) : <p className="py-6 text-sm leading-6 text-muted-foreground">Has completado el catálogo en este lenguaje. Prueba el otro o repasa tus soluciones.</p>}
        </section>
        <section className="dashboard-routes" aria-labelledby="paths-title">
          <div className="section-heading justify-start gap-2"><Route className="size-4 text-muted-foreground" /><h2 id="paths-title" className="section-title">Rutas de aprendizaje</h2></div>
          <ul className="flex flex-col gap-1">{paths.map(path => { const level = learningPathLevel(path.slug); return <li key={path.id}><Link href={`/rutas/${path.slug}?lenguaje=${language}`} className="list-entry items-center justify-between gap-4"><div><h3 className="text-sm font-medium">{path.title}</h3><p className="mt-1 text-xs text-muted-foreground">{path._count.items} ejercicios · {level ? levelNames[level] : "A tu ritmo"}</p></div><ArrowRight className="size-4 shrink-0 text-muted-foreground" /></Link></li>; })}</ul>
        </section>
      </div>
      <div className="dashboard-journal">
        <section className="soft-section" aria-labelledby="progress-title"><div className="flex items-center justify-between gap-2"><h2 id="progress-title" className="section-title">Tu progreso</h2><Link href="/progreso" className="text-link text-xs">Ver detalle</Link></div><p className="mt-5 text-3xl font-semibold tracking-tight">{solved}<span className="ml-1 text-sm font-normal text-muted-foreground">/ {catalog.length}</span></p><p className="mt-1 text-xs leading-5 text-muted-foreground">Ejercicios resueltos en {languageNames[language]}</p><div role="progressbar" aria-label={`Ejercicios resueltos en ${languageNames[language]}`} aria-valuemin={0} aria-valuemax={catalog.length || 1} aria-valuenow={solved} className="progress-track mt-4"><div className="progress-fill" style={{ width: `${catalog.length ? solved / catalog.length * 100 : 0}%` }} /></div></section>
        <section aria-labelledby="activity-title"><h2 id="activity-title" className="section-title mb-3 px-3">Actividad reciente</h2><ActivityList entries={recent} compact /></section>
      </div>
    </div>
    {!user && <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-surface px-5 py-4"><p className="text-xs text-muted-foreground">Crea una cuenta local para guardar tu progreso.</p><Link href="/registro" className="text-link text-xs">Crear cuenta<ArrowRight className="size-3.5" /></Link></div>}
  </div>;
}
