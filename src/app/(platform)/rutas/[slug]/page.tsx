import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/server/db";
import { currentUser } from "@/server/auth";
import { getCatalog } from "@/server/catalog";
import { languageSchema } from "@/lib/validation";
import { ExerciseRow } from "@/components/exercise-row";
import { modulesForPath } from "@/lib/learning-modules";
import { languages, languageNames, levelNames } from "@/lib/types";
import { learningPaths } from "@/lib/learning-paths";
import { Disclosure } from "@/components/arc/disclosure";
import { activePathExercise } from "@/lib/practice-navigation";

export default async function PathPage({ params, searchParams }: { params: Promise<{slug:string}>; searchParams: Promise<{lenguaje?:string}> }) {
  const {slug} = await params;
  const user = await currentUser();
  const language = languageSchema.catch("python").parse((await searchParams).lenguaje ?? user?.preference?.language);
  const [path, catalog] = await Promise.all([
    db.learningPath.findUnique({ where: { slug }, include: { items: { orderBy: { position: "asc" } } } }),
    getCatalog(user?.id, language),
  ]);
  if (!path) notFound();
  const exercises = path.items.flatMap(item => { const exercise = catalog.find(e => e.id === item.exerciseId); return exercise ? [exercise] : []; });
  const modules = modulesForPath(slug);
  const definition = learningPaths.find(path => path.slug === slug);
  const next = definition ? learningPaths.find(path => path.order > definition.order) : undefined;
  const nextExercise = activePathExercise(exercises);
  const firstIntegration = exercises.find(exercise => exercise.activityType === "INTEGRATION");
  return <div className="page-container">
    <Link href={`/rutas?lenguaje=${language}`} className="text-link text-xs"><ArrowLeft className="size-3.5" aria-hidden="true" />Todas las rutas</Link>
    <h1 className="page-title mt-5">{path.title}</h1>
    {definition && <p className="mt-3 text-xs font-medium text-muted-foreground">{levelNames[definition.level]} · Fundamentos de programación y algoritmos</p>}
    <p className="page-description">{path.description}</p>
    <nav aria-label="Lenguaje de la ruta" className="segmented-control mt-5 flex-wrap">{languages.map(lang => <Link key={lang} href={`?lenguaje=${lang}`} aria-current={language === lang ? "page" : undefined} className="segment">{languageNames[lang]}</Link>)}</nav>
    <Disclosure title="Sobre esta ruta" className="mt-3 max-w-prose"><p className="pb-3 text-sm leading-6 text-muted-foreground">Los mismos retos y el mismo orden en Python, JavaScript y TypeScript. Cambia la sintaxis, no el problema. El progreso se guarda por lenguaje y todas las etapas tienen acceso libre. {language === "typescript" ? "Puedes empezar sin conocer JavaScript: los tipos se presentan gradualmente." : "Las ayudas disminuyen a medida que practicas."}</p></Disclosure>
    {nextExercise && <section className="surface-panel mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-surface p-5" aria-label="Siguiente ejercicio de la ruta"><div><h2 className="text-sm font-semibold">{nextExercise.started ? "Retoma tu práctica" : "Tu siguiente paso"}</h2><p className="mt-2 text-sm text-muted-foreground">Ejercicio {exercises.findIndex(exercise => exercise.id === nextExercise.id) + 1} de {exercises.length}{nextExercise.started ? " · En curso" : ""}</p></div><Button asChild><Link aria-description={nextExercise.title} href={`/ejercicios/${nextExercise.slug}?lenguaje=${language}&ruta=${encodeURIComponent(slug)}`}>Abrir ejercicio<ArrowRight aria-hidden="true" /></Link></Button></section>}
    <p className="mt-6 mb-3 px-3 text-xs text-muted-foreground">{exercises.filter(e => e.solved).length} de {exercises.length} completados · Sin prisa, sin bloqueos</p>
    <div className="route-content mt-6">
    {modules.map(module => {
      const entries = module.slugs.flatMap(slug => exercises.filter(exercise => exercise.slug === slug));
      const active = entries.some(exercise => exercise.id === nextExercise?.id);
      return <Disclosure key={`${language}-${module.slug}-${active}`} defaultOpen={active} className={`route-module rounded-xl${active ? " route-module-active" : ""}`} title={<span className="flex flex-1 flex-wrap items-center justify-between gap-2"><span>{module.title}{active && <span className="ml-2 text-xs font-normal text-primary-text">En curso</span>}</span><span className="text-xs font-normal tabular-nums text-muted-foreground">{entries.filter(exercise => exercise.solved).length} / {entries.length}</span></span>}>
        <section id={`module-${module.slug}`} aria-label={module.title}>
        <p className="learning-copy mt-2 text-muted-foreground">{module.objective.charAt(0).toUpperCase()}{module.objective.slice(1)}</p>
        {entries.map(exercise => <ExerciseRow key={exercise.id} exercise={{ ...exercise, order: exercises.findIndex(entry => entry.id === exercise.id) }} language={language} pathSlug={slug} recommended={exercise.id === nextExercise?.id} />)}
        </section>
      </Disclosure>;
    })}
    {exercises.filter(exercise => !modules.some(module => module.slugs.includes(exercise.slug))).map(exercise => <ExerciseRow key={exercise.id} exercise={exercise} language={language} pathSlug={slug} />)}
    {modules.length > 0 && <section className="mt-10 rounded-xl bg-surface p-5 wrap-anywhere" aria-labelledby="path-readiness">
      <h2 id="path-readiness" className="text-lg font-semibold">Pon en práctica lo aprendido</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">Intenta resolver los desafíos integradores sin consultar la solución y explica por qué funciona tu código. Completarlos registra práctica, no demuestra por sí solo dominio.</p>
      {firstIntegration ? <Link className="text-link mt-4 text-sm" href={`/ejercicios/${firstIntegration.slug}?lenguaje=${language}&ruta=${encodeURIComponent(slug)}`}>Abrir primer integrador<ArrowRight className="size-4" aria-hidden="true" /></Link> : <p className="mt-4 text-sm text-muted-foreground">Esta ruta todavía no tiene desafíos integradores publicados. Puedes repasar sus ejercicios.</p>}
      {next ? <Link className="text-link mt-5" href={`/rutas/${next.slug}?lenguaje=${language}`}>Continuar con {next.title}</Link> : <p className="mt-5 text-sm text-muted-foreground">Vuelve a los retos con otra estrategia y compara su corrección y coste.</p>}
    </section>}
    </div>
  </div>;
}
