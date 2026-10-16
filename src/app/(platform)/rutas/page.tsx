import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { db } from "@/server/db";
import { currentUser } from "@/server/auth";
import { levelNames } from "@/lib/types";
import { learningPathLevel } from "@/lib/learning-paths";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Rutas de aprendizaje" };
export default async function PathsPage() {
  const user = await currentUser();
  const language = user?.preference?.language ?? "python";
  const paths = await db.learningPath.findMany({
    orderBy: { order: "asc" },
    include: {
      items: {
        where: { exercise: { published: true } },
        include: { exercise: { select: { progress: {
          where: { userId: user?.id ?? "__guest__", language, firstPassedAt: { not: null } },
          select: { id: true },
        } } } },
      },
    },
  });
  return <div className="page-container">
    <h1 className="page-title">Rutas de aprendizaje</h1><p className="page-description">Empieza por Desde cero si nunca has programado. Cada ruta conecta conceptos y ejercicios; puedes explorar cualquiera a tu ritmo.</p>
    <div className="path-map">{paths.map((path,i) => {
      const done = path.items.filter(item => item.exercise.progress.length > 0).length;
      const level = learningPathLevel(path.slug);
      return <Link href={`/rutas/${path.slug}?lenguaje=${language}`} key={path.id} className="path-map-entry group">
        <div className="path-map-heading"><span className="path-map-number" aria-hidden="true">{i + 1}</span><Badge variant="outline">{level ? levelNames[level] : "A tu ritmo"}</Badge><ArrowRight className="ml-auto size-5 shrink-0 text-muted-foreground group-hover:text-primary-text" aria-hidden="true" /></div>
        <div className="min-w-0 flex-1"><h2 className="text-2xl font-semibold tracking-tight">{path.title}</h2><p className="mt-3 text-base leading-7 text-muted-foreground">{path.description}</p></div>
        <div className="mt-6"><p className="mb-3 text-sm font-medium">{done}<span className="ml-1 text-xs font-normal text-muted-foreground">de {path.items.length} ejercicios</span></p><div role="progressbar" aria-label={`Progreso en ${path.title}`} aria-valuemin={0} aria-valuemax={path.items.length || 1} aria-valuenow={done} className="progress-track"><div className="progress-fill" style={{ width: `${path.items.length ? done / path.items.length * 100 : 0}%` }} /></div></div>
      </Link>;
    })}</div>
  </div>;
}
