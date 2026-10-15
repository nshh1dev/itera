import { notFound } from "next/navigation";
import { currentUser } from "@/server/auth";
import { getExercise, getCatalog } from "@/server/catalog";
import { languageSchema } from "@/lib/validation";
import { Workspace } from "@/components/practice/workspace";
import type { Json } from "@/lib/types";
import { db } from "@/server/db";
import { exerciseHref, exercisePosition, nextExerciseSlug, previousExerciseSlug } from "@/lib/learning-paths";
import { educationalMetadataSchema } from "@/lib/learning-metadata";

export const dynamic = "force-dynamic";
export const metadata = { title: "Espacio de práctica" };
export default async function ExercisePage({ params, searchParams }: { params: Promise<{slug:string}>; searchParams: Promise<{lenguaje?:string; ruta?:string}> }) {
  const user = await currentUser();
  const {slug} = await params;
  const query = await searchParams;
  const language = languageSchema.catch("python").parse(query.lenguaje ?? user?.preference?.language ?? "python");
  const exercise = await getExercise(slug,language,user?.id);
  const version = exercise?.versions[0];
  const variant = version?.variants[0];
  if (!exercise || !version || !variant) notFound();
  const catalog = await getCatalog(user?.id, language);
  const path = typeof query.ruta === "string" && query.ruta.length <= 100
    ? await db.learningPath.findUnique({ where: { slug: query.ruta }, include: { items: { orderBy: { position: "asc" }, select: { exerciseId: true } } } })
    : null;
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
  const recentSubmissions = user ? await db.submission.findMany({
    where: { userId: user.id, variant: { version: { exerciseId: exercise.id } } }, orderBy: { createdAt: "desc" }, take: 5,
    select: { id: true, status: true, mode: true, createdAt: true, passedCount: true, totalCount: true,
      variant: { select: { language: true, version: { select: { title: true, exercise: { select: { slug: true } } } } } } },
  }) : [];
  const activityType = educationalMetadataSchema.shape.activityType.catch("PRACTICE").parse(version.activityType);
  return <Workspace userId={user?.id} user={user ? { name: user.name, email: user.email, role: user.role } : null} slug={slug} title={version.title} category={exercise.category} level={version.level} minutes={version.minutes} statement={version.statement} objective={version.objective} prerequisites={version.prerequisites} practiceGoals={version.practiceGoals} previousExercises={previousExercises} activityType={activityType} constraints={version.constraints} hints={version.hints} complexity={version.complexity} commonErrors={version.commonErrors} recentSubmissions={recentSubmissions} language={language} variantId={variant.id} starter={variant.starter} initialCode={variant.drafts[0]?.code ?? variant.starter} revision={variant.drafts[0]?.revision ?? 0} examples={variant.tests as {input:Json;expected:Json;explanation:string}[]} nextHref={nextHref} previousHref={previousHref} position={position} total={total} pathSlug={pathSlug} />;
}
