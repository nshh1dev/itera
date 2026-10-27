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
import { languageNames } from "@/lib/types";
import { moduleForExercise } from "@/lib/learning-modules";
import { theoryForLanguage } from "@/lib/lesson-language";
import Link from "next/link";
import { relatedExercise } from "@/lib/practice-navigation";
import { validateProjectDefinition, validateProjectSnapshot, type ProjectFile } from "@/lib/project";
import { languagePaths } from "@/lib/language-curriculum";
import { hasPythonCurriculum } from "@/lib/python-curriculum";

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
    exercisePromise.then(exercise => user && exercise ? getRecentSubmissions(user.id, 5, exercise.id, language) : []),
  ]);
  const version = exercise?.versions[0];
  if (!exercise || !version) notFound();
  const variant = version.variants.find(variant => variant.language === language);
  const availableLanguages = exercise.availableLanguages;
  if (!variant) return <main id="main-content" className="page-container"><h1 className="page-title">Esta versión todavía no está disponible en {languageNames[language]}</h1><p className="mt-4 text-sm leading-7 text-muted-foreground">La revisión de este lenguaje debe validarse y publicarse. No hemos cambiado tus ejercicios ni tu progreso.</p><nav aria-label="Lenguajes disponibles" className="mt-5 flex flex-wrap gap-4">{availableLanguages.map(language => <Link key={language} className="text-link" href={exerciseHref(slug, language, query.ruta)}>{languageNames[language]}</Link>)}<Link className="text-link" href="/rutas">Volver a las rutas</Link></nav></main>;
  const lessonModule = moduleForExercise(slug, hasPythonCurriculum(catalog) ? language : undefined);
  const lesson = lessonModule ? { title: lessonModule.title, objective: lessonModule.objective, theory: theoryForLanguage(lessonModule, language), example: lessonModule.examples[language] } : undefined;
  const resolvedPath = path ? languagePaths([path], catalog, language)[0] : undefined;
  const pathSlugs = resolvedPath?.items.flatMap(item => { const entry = catalog.find(e => e.id === item.exerciseId); return entry ? [entry.slug] : []; });
  const pathSlug = pathSlugs?.includes(slug) ? path!.slug : undefined;
  const sequence = pathSlug ? pathSlugs! : catalog.map(e => e.slug);
  const current = catalog.find(item => item.slug === slug);
  const nextSlug = pathSlug ? nextExerciseSlug(slug, sequence) : current ? relatedExercise(catalog, current)?.slug : undefined;
  const nextHref = nextSlug ? exerciseHref(nextSlug, language, pathSlug) : undefined;
  const previousSlug = previousExerciseSlug(slug, sequence);
  const previousHref = previousSlug ? exerciseHref(previousSlug, language, pathSlug) : undefined;
  const { position, total } = exercisePosition(slug, sequence);
  const previousExercises = version.prerequisiteSlugs.flatMap(previousSlug => {
    const entry = catalog.find(item => item.slug === previousSlug);
    return entry ? [{ title: entry.title, href: exerciseHref(entry.slug, language, pathSlugs?.includes(entry.slug) ? pathSlug : undefined) }] : [];
  });
  const activityType = educationalMetadataSchema.shape.activityType.catch("PRACTICE").parse(version.activityType);
  const project = variant.project ? validateProjectDefinition(variant.project) : undefined;
  let initialFiles: ProjectFile[] | undefined;
  let previousFiles: ProjectFile[] | undefined;
  let previousProject: ReturnType<typeof validateProjectDefinition> | undefined;
  let previousVariantId: string | undefined;
  if (project) {
    const stored = variant.drafts[0]?.files;
    if (stored) initialFiles = validateProjectSnapshot(project, stored);
    else if (variant.drafts[0]?.code) initialFiles = validateProjectSnapshot(project, project.files.map(file => ({ ...file, content: file.path === project.entrypoint ? variant.drafts[0]!.code : file.content })));
    else initialFiles = project.files;
    if (project.previousStep) {
      const previous = await db.exercise.findUnique({ where: { slug: project.previousStep, published: true }, select: { versions: { where: { published: true, variants: { some: { language } } }, orderBy: { number: "desc" }, take: 1, select: { variants: { where: { language }, take: 1, select: { id: true, project: true, drafts: { where: { userId: user?.id ?? "__guest__" }, take: 1, select: { code: true, files: true } } } } } } } });
      const priorVariant = previous?.versions[0]?.variants[0];
      if (priorVariant?.project) {
        try {
          const priorProject = validateProjectDefinition(priorVariant.project);
          previousProject = priorProject;
          previousVariantId = priorVariant.id;
          const saved = priorVariant.drafts[0];
          if (saved?.files) previousFiles = validateProjectSnapshot(priorProject, saved.files);
          else if (saved?.code) previousFiles = validateProjectSnapshot(priorProject, priorProject.files.map(file => ({ ...file, content: file.path === priorProject.entrypoint ? saved.code : file.content })));
          else previousFiles = priorProject.files;
        } catch { previousFiles = undefined; }
      }
    }
  }
  return <Workspace userId={user?.id} user={user ? { name: user.name, email: user.email, role: user.role } : null} slug={slug} title={version.title} category={exercise.category} level={version.level} minutes={version.minutes} statement={variant.statement || version.statement} objective={version.objective} prerequisites={version.prerequisites} practiceGoals={version.practiceGoals} previousExercises={previousExercises} activityType={activityType} runtimeMode={version.runtimeMode} constraints={version.constraints} hints={version.hints} complexity={version.complexity} commonErrors={version.commonErrors} recentSubmissions={recentSubmissions} language={language} availableLanguages={availableLanguages} lesson={lesson} variantId={variant.id} starter={variant.starter} initialCode={variant.drafts[0]?.code ?? variant.starter} project={project} initialFiles={initialFiles} previousFiles={previousFiles} previousProject={previousProject} previousStorageKey={previousVariantId ? `itera:draft:${user?.id ?? "guest"}:${previousVariantId}` : undefined} revision={variant.drafts[0]?.revision ?? 0} examples={variant.tests as {input:Json;expected:Json;expectedFiles?:ProjectFile[];explanation:string}[]} nextHref={nextHref} previousHref={previousHref} position={position} total={total} pathSlug={pathSlug} />;
}
