import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { db } from "@/server/db";
import { currentUser } from "@/server/auth";
import { getPracticeNavigation } from "@/server/practice-navigation";
import { levelNames } from "@/lib/types";
import { learningPathLevel } from "@/lib/learning-paths";
import { languagePaths } from "@/lib/language-curriculum";
import { Badge } from "@/components/ui/badge";
import { languageSchema } from "@/lib/validation";
import { Progress } from "@/components/arc/progress";

export const metadata = { title: "Rutas de aprendizaje" };
export default async function PathsPage({ searchParams }: { searchParams: Promise<{ lenguaje?: string }> }) {
  const user = await currentUser();
  const preferredLanguage = languageSchema.catch("python").parse(user?.preference?.language);
  const language = languageSchema.catch(preferredLanguage).parse((await searchParams).lenguaje);
  const [storedPaths, { catalog, recommendation }] = await Promise.all([
    db.learningPath.findMany({ orderBy: { order: "asc" }, include: { items: { orderBy: { position: "asc" }, select: { exerciseId: true } } } }),
    getPracticeNavigation(user?.id, language),
  ]);
  const paths = languagePaths(storedPaths, catalog, language).map(path => ({ ...path, exercises: path.items.flatMap(item => catalog.filter(exercise => exercise.id === item.exerciseId)) }));
  const suggestedPath = recommendation ? paths.find(path => path.slug === recommendation.pathSlug)
    ?? paths.find(path => path.exercises.some(exercise => exercise.id === recommendation.exercise.id)) : undefined;
  return <div className="page-container">
    <h1 className="page-title">Rutas</h1><p className="page-description">Aprende con una guía o explora cualquier etapa a tu ritmo.</p>
    <div className="path-map">{paths.map((path,i) => {
      const done = path.exercises.filter(exercise => exercise.solved).length;
      const level = learningPathLevel(path.slug);
      return <Link href={`/rutas/${path.slug}?lenguaje=${language}`} key={path.id} className="path-map-entry group">
        <div className="path-map-heading"><span className="path-map-number" aria-hidden="true">{i + 1}</span><Badge variant="outline">{level ? levelNames[level] : "A tu ritmo"}</Badge><ArrowRight className="ml-auto size-5 shrink-0 text-muted-foreground group-hover:text-primary-text" aria-hidden="true" /></div>
        <div className="min-w-0 flex-1"><h2 className="text-2xl font-semibold tracking-tight">{path.title}</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">{path.description}</p>{suggestedPath?.slug === path.slug && <p className="mt-3 text-sm font-medium text-primary-text">Recomendada para continuar</p>}</div>
        <div className="mt-6"><p className="mb-3 text-sm font-medium">{done}<span className="ml-1 text-xs font-normal text-muted-foreground">de {path.exercises.length} ejercicios</span></p><Progress label={`Progreso en ${path.title}`} value={done} max={path.exercises.length} /></div>
      </Link>;
    })}</div>
  </div>;
}
