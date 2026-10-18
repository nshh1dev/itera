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

export default async function PathPage({ params, searchParams }: { params: Promise<{slug:string}>; searchParams: Promise<{lenguaje?:string}> }) {
  const {slug} = await params;
  const user = await currentUser();
  const language = languageSchema.catch("python").parse((await searchParams).lenguaje ?? user?.preference?.language);
  const path = await db.learningPath.findUnique({ where: { slug }, include: { items: { orderBy: { position: "asc" } } } });
  if (!path) notFound();
  const catalog = await getCatalog(user?.id, language);
  const exercises = path.items.flatMap(item => { const exercise = catalog.find(e => e.id === item.exerciseId); return exercise ? [exercise] : []; });
  const modules = modulesForPath(slug);
  const definition = learningPaths.find(path => path.slug === slug);
  const next = definition ? learningPaths.find(path => path.order > definition.order) : undefined;
  const nextExercise = exercises.find(exercise => !exercise.solved);
  return <div className="page-container">
    <Link href={`/rutas?lenguaje=${language}`} className="text-link text-xs"><ArrowLeft className="size-3.5" aria-hidden="true" />Todas las rutas</Link>
    <h1 className="page-title mt-5">{path.title}</h1>
    {definition && <p className="mt-3 text-xs font-medium text-muted-foreground">{levelNames[definition.level]} · Fundamentos de programación y algoritmos</p>}
    <p className="page-description">{path.description}</p>
    <nav aria-label="Lenguaje de la ruta" className="segmented-control mt-5 flex-wrap">{languages.map(lang => <Link key={lang} href={`?lenguaje=${lang}`} aria-current={language === lang ? "page" : undefined} className="segment">{languageNames[lang]}</Link>)}</nav>
    <p className="mt-4 text-sm leading-6 text-muted-foreground">{language === "typescript" ? "Puedes empezar aquí sin conocer JavaScript. Aprenderás los tipos a medida que los necesites. Las versiones antiguas necesitan una revisión publicada para ofrecer este lenguaje." : "Entender → observar → completar → resolver → integrar. Las ayudas disminuyen a medida que practicas."}</p>
    {nextExercise && <section className="surface-panel mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-surface p-5" aria-label="Siguiente ejercicio de la ruta"><div><p className="text-xs text-muted-foreground">{exercises.some(exercise => exercise.solved) ? "Sigue practicando" : "Empieza la ruta"}</p><h2 className="mt-2 text-lg font-semibold">{nextExercise.title}</h2></div><Button asChild><Link href={`/ejercicios/${nextExercise.slug}?lenguaje=${language}&ruta=${encodeURIComponent(slug)}`}>Abrir ejercicio<ArrowRight aria-hidden="true" /></Link></Button></section>}
    <p className="mt-6 mb-3 px-3 text-xs text-muted-foreground">{exercises.filter(e => e.solved).length} de {exercises.length} completados · Sin prisa, sin bloqueos</p>
    <div className="route-layout">
    {modules.length > 0 && <nav className="route-outline" aria-label="Módulos de la ruta"><p className="section-title">Tu recorrido</p><ol>{modules.map(module => <li key={module.slug}><a href={`#module-${module.slug}`}>{module.title}</a></li>)}</ol><p className="text-xs leading-6 text-muted-foreground">Cada módulo combina una idea, ejemplos y práctica. No necesitas completarlos en una sola sesión.</p></nav>}
    <div className="route-content">
    {modules.map(module => {
      const entries = module.slugs.flatMap(slug => exercises.filter(exercise => exercise.slug === slug));
      return <section key={module.slug} aria-labelledby={`module-${module.slug}`} className="route-module">
        <h2 id={`module-${module.slug}`} className="text-lg font-semibold">{module.title}</h2>
        <p className="learning-copy mt-2 text-muted-foreground">{module.objective}</p>
        <p className="mt-2 mb-3 text-xs text-muted-foreground">{entries.filter(exercise => exercise.solved).length} de {entries.length} completados en {languageNames[language]}</p>
        {entries.map(exercise => <ExerciseRow key={exercise.id} exercise={{ ...exercise, order: exercises.findIndex(entry => entry.id === exercise.id) }} language={language} pathSlug={slug} />)}
      </section>;
    })}
    {exercises.filter(exercise => !modules.some(module => module.slugs.includes(exercise.slug))).map(exercise => <ExerciseRow key={exercise.id} exercise={exercise} language={language} pathSlug={slug} />)}
    {modules.length > 0 && <section className="mt-10 rounded-xl bg-surface p-5" aria-labelledby="path-readiness">
      <h2 id="path-readiness" className="text-lg font-semibold">Estás preparado para continuar si puedes…</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">Autoevaluación orientativa. Completar ejercicios no demuestra por sí solo dominio; intenta explicar y resolver sin consultar la solución. Estas casillas no guardan progreso ni bloquean rutas.</p>
      <div className="mt-4 flex flex-col gap-3">{modules.flatMap(module => module.readiness).map((goal, index) => <label key={goal} className="flex min-h-11 items-start gap-3 text-sm leading-6"><input key={`${language}-${index}`} type="checkbox" className="mt-1 size-4 shrink-0 accent-primary" />{goal}</label>)}</div>
      {next ? <Link className="text-link mt-5" href={`/rutas/${next.slug}?lenguaje=${language}`}>Continuar con {next.title}</Link> : <p className="mt-5 text-sm text-muted-foreground">Vuelve a los retos con otra estrategia y compara su corrección y coste.</p>}
    </section>}
    </div></div>
  </div>;
}
