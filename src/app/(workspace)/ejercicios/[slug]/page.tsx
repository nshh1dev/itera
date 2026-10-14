import { notFound } from "next/navigation";
import { currentUser } from "@/server/auth";
import { getExercise, getCatalog } from "@/server/catalog";
import { languageSchema } from "@/lib/validation";
import { Workspace } from "@/components/practice/workspace";
import type { Json } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Espacio de práctica" };
export default async function ExercisePage({ params, searchParams }: { params: Promise<{slug:string}>; searchParams: Promise<{lenguaje?:string}> }) {
  const user = await currentUser();
  const {slug} = await params;
  const language = languageSchema.catch("python").parse((await searchParams).lenguaje ?? user?.preference?.language ?? "python");
  const exercise = await getExercise(slug,language,user?.id);
  const version = exercise?.versions[0];
  const variant = version?.variants[0];
  if (!exercise || !version || !variant) notFound();
  const catalog = await getCatalog(user?.id, language);
  const next = catalog[catalog.findIndex(e=>e.slug===slug)+1];
  return <Workspace userId={user?.id} slug={slug} title={version.title} category={exercise.category} level={version.level} minutes={version.minutes} statement={version.statement} constraints={version.constraints} hints={version.hints} language={language} variantId={variant.id} starter={variant.starter} initialCode={variant.drafts[0]?.code ?? variant.starter} revision={variant.drafts[0]?.revision ?? 0} examples={variant.tests as {input:Json;expected:Json}[]} nextSlug={next?.slug} />;
}
