import { notFound } from "next/navigation";
import { currentUser } from "@/server/auth";
import { getExercise, getCatalog } from "@/server/catalog";
import { languageSchema } from "@/lib/validation";
import { Workspace } from "@/components/practice/workspace";
import type { Json } from "@/lib/types";
import { db } from "@/server/db";
import { getRecentSubmissions } from "@/server/activity";
import { exerciseHref, exercisePosition, nextExerciseSlug, previousExerciseSlug } from "@/lib/learning-paths";
import { educationalMetadataSchema } from "@/lib/learning-metadata";
import { languages, languageNames } from "@/lib/types";
import { moduleForExercise } from "@/lib/learning-modules";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Espacio de práctica" };
export default async function ExercisePage({ params, searchParams }: { params: Promise<{slug:string}>; searchParams: Promise<{lenguaje?:string; ruta?:string}> }) {
  const user = await currentUser();
  const {slug} = await params;
  const query = await searchParams;
  const language = languageSchema.catch("python").parse(query.lenguaje ?? user?.preference?.language ?? "python");
  const exercisePromise = getExercise(slug, language, user?.id);
  const [exercise, catalog, path, recentSubmissions] = await Promise.all([
    exercisePromise,
    getCatalog(user?.id, language),
    typeof query.ruta === "string" && query.ruta.length <= 100
      ? db.learningPath.findUnique({ where: { slug: query.ruta }, include: { items: { orderBy: { position: "asc" }, select: { exerciseId: true } } } })
      : null,
    exercisePromise.then(exercise => user && exercise ? getRecentSubmissions(user.id, 5, exercise.id) : []),
  ]);
  const version = exercise?.versions[0];
  if (!exercise || !version) notFound();
  const variant = exercise.variant;
  const availableLanguages = languages.filter(language => version.variants.some(variant => variant.language === language));
  if (!variant) return <main id="main-content" className="page-container"><h1 className="page-title">Esta versión todavía no está disponible en {languageNames[language]}</h1><p className="mt-4 text-sm leading-7 text-muted-foreground">La revisión de este lenguaje debe validarse y publicarse. No hemos cambiado tus ejercicios ni tu progreso.</p><nav aria-label="Lenguajes disponibles" className="mt-5 flex flex-wrap gap-4">{availableLanguages.map(language => <Link key={language} className="text-link" href={exerciseHref(slug, language, query.ruta)}>{languageNames[language]}</Link>)}<Link className="text-link" href="/rutas">Volver a las rutas</Link></nav></main>;
  const lessonModule = moduleForExercise(slug);
  const lesson = lessonModule ? { title: lessonModule.title, objective: lessonModule.objective, theory: lessonModule.theory, example: lessonModule.examples[language] } : undefined;
  const pathSlugs = path?.items.flatMap(item => { const entry = catalog.find(e => e.id === item.exerciseId); return entry ? [entry.slug] : []; });
  const pathSlug = pathSlugs?.includes(slug) ? path!.slug : undefined;
  const sequence = pathSlug ? pathSlugs! : catalog.map(e => e.slug);
  const nextSlug = nextExerciseSlug(slug, sequence);
  const nextHref = nextSlug ? exerciseHref(nextSlug, language, pathSlug) : undefined;
  const previousSlug = previousExerciseSlug(slug, sequence);
  const previousHref = previousSlug ? exerciseHref(previousSlug, language, pathSlug) : undefined;
  const { position, total } = exercisePosition(slug, sequence);
  const previousExercises = version.prerequisiteSlugs.flatMap(previousSlug => {
    const entry = catalog.find(item => item.slug === previousSlug);
    return entry ? [{ title: entry.title, href: exerciseHref(entry.slug, language, pathSlugs?.includes(entry.slug) ? pathSlug : undefined) }] : [];
  });
  const activityType = educationalMetadataSchema.shape.activityType.catch("PRACTICE").parse(version.activityType);
  return <Workspace userId={user?.id} user={user ? { name: user.name, email: user.email, role: user.role } : null} slug={slug} title={version.title} category={exercise.category} level={version.level} minutes={version.minutes} statement={variant.statement || version.statement} objective={version.objective} prerequisites={version.prerequisites} practiceGoals={version.practiceGoals} previousExercises={previousExercises} activityType={activityType} runtimeMode={version.runtimeMode} constraints={version.constraints} hints={version.hints} complexity={version.complexity} commonErrors={version.commonErrors} recentSubmissions={recentSubmissions} language={language} availableLanguages={availableLanguages} lesson={lesson} variantId={variant.id} starter={variant.starter} initialCode={variant.drafts[0]?.code ?? variant.starter} revision={variant.drafts[0]?.revision ?? 0} examples={variant.tests as {input:Json;expected:Json;explanation:string}[]} nextHref={nextHref} previousHref={previousHref} position={position} total={total} pathSlug={pathSlug} />;
}
