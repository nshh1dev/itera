import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
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
import { PathCompletion, PathReview } from "@/components/path-review";
import { languagePaths } from "@/lib/language-curriculum";
import { hasPythonCurriculum } from "@/lib/python-curriculum";

export default async function PathPage({ params, searchParams }: { params: Promise<{slug:string}>; searchParams: Promise<{lenguaje?:string}> }) {
  const {slug} = await params;
  const user = await currentUser();
  const language = languageSchema.catch("python").parse((await searchParams).lenguaje ?? user?.preference?.language);
  const [path, catalog] = await Promise.all([
    db.learningPath.findUnique({ where: { slug }, include: { items: { orderBy: { position: "asc" } } } }),
    getCatalog(user?.id, language),
  ]);
  if (!path) notFound();
  const exercises = languagePaths([path], catalog, language)[0].items.flatMap(item => { const exercise = catalog.find(e => e.id === item.exerciseId); return exercise ? [exercise] : []; });
  const modules = modulesForPath(slug, hasPythonCurriculum(catalog) ? language : undefined);
  const definition = learningPaths.find(path => path.slug === slug);
  const next = definition ? learningPaths.find(path => path.order > definition.order) : undefined;
  const nextExercise = activePathExercise(exercises);
  const completed = Boolean(user) && modules.length > 0 && exercises.length > 0 && exercises.every(exercise => exercise.solved);
  return <div className="page-container">
    <Link href={`/rutas?lenguaje=${language}`} className="text-link text-xs"><ArrowLeft className="size-3.5" aria-hidden="true" />Todas las rutas</Link>
    <h1 className="page-title mt-5">{path.title}</h1>
    {definition && <p className="mt-3 text-xs font-medium text-muted-foreground">{levelNames[definition.level]} · Fundamentos de programación y algoritmos</p>}
    <p className="page-description">{path.description}</p>
    <nav aria-label="Lenguaje de la ruta" className="segmented-control mt-5 flex-wrap">{languages.map(lang => <Link key={lang} href={`?lenguaje=${lang}`} aria-current={language === lang ? "page" : undefined} className="segment">{languageNames[lang]}</Link>)}</nav>
    <Disclosure title="Sobre esta ruta" className="mt-3 max-w-prose"><p className="pb-3 text-sm leading-6 text-muted-foreground">{language === "python" && hasPythonCurriculum(catalog) ? "Python incluye prácticas propias y una secuencia gradual para aprender sus herramientas antes de combinarlas." : "JavaScript y TypeScript conservan sus retos y su orden común."} El progreso se guarda por lenguaje y todas las etapas tienen acceso libre. {language === "typescript" ? "Puedes empezar sin conocer JavaScript: los tipos se presentan gradualmente." : "Las ayudas disminuyen a medida que practicas."}</p></Disclosure>
    {completed && <PathCompletion language={language} count={exercises.length} />}
    <p className="mt-6 mb-3 px-3 text-xs text-muted-foreground">{exercises.filter(e => e.solved).length} de {exercises.length} completados · Sin prisa, sin bloqueos</p>
    <div className="route-content mt-6">
    {modules.map(module => {
      const entries = module.slugs.flatMap(slug => exercises.filter(exercise => exercise.slug === slug));
      if (!entries.length) return null;
      const active = entries.some(exercise => exercise.id === nextExercise?.id);
      return <Disclosure key={`${language}-${module.slug}-${active}`} defaultOpen={active} className={`route-module rounded-xl${active ? " route-module-active" : ""}`} title={<span className="flex flex-1 flex-wrap items-center justify-between gap-2"><span>{module.title}{active && <span className="ml-2 text-xs font-normal text-primary-text">En curso</span>}</span><span className="text-xs font-normal tabular-nums text-muted-foreground">{entries.filter(exercise => exercise.solved).length} / {entries.length}</span></span>}>
        <section id={`module-${module.slug}`} aria-label={module.title}>
        <p className="learning-copy mt-2 text-muted-foreground">{module.objective.charAt(0).toUpperCase()}{module.objective.slice(1)}</p>
        {entries.map(exercise => <ExerciseRow key={exercise.id} exercise={{ ...exercise, order: exercises.findIndex(entry => entry.id === exercise.id) }} language={language} pathSlug={slug} recommended={exercise.id === nextExercise?.id} />)}
        </section>
      </Disclosure>;
    })}
    {exercises.filter(exercise => !modules.some(module => module.slugs.includes(exercise.slug))).map(exercise => <ExerciseRow key={exercise.id} exercise={exercise} language={language} pathSlug={slug} />)}
    {modules.length > 0 && <PathReview pathSlug={slug} language={language} modules={modules} exercises={exercises} next={next} />}
    </div>
  </div>;
}
