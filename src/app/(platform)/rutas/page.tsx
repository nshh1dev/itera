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
    <h1 className="page-title">Rutas de aprendizaje</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Empieza por Desde cero si nunca has programado. Las rutas ordenan la práctica, sin bloquear tu exploración.</p>
    <div className="mt-6 flex flex-col gap-4">{paths.map((path,i) => {
      const done = path.items.filter(item => item.exercise.progress.length > 0).length;
      const level = learningPathLevel(path.slug);
      return <Link href={`/rutas/${path.slug}?lenguaje=${language}`} key={path.id} className="surface-panel surface-interactive group flex flex-col gap-5 rounded-2xl bg-surface p-5 transition-colors hover:bg-surface-secondary sm:flex-row sm:items-center sm:gap-7 sm:p-6">
        <div className="min-w-0 flex-1"><div className="mb-3 flex items-center gap-3"><span className="text-xs text-muted-foreground">Ruta {i + 1}</span><Badge variant="outline">{level ? levelNames[level] : "A tu ritmo"}</Badge></div><h2 className="text-xl font-semibold tracking-tight">{path.title}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{path.description}</p></div>
        <div className="flex shrink-0 items-center gap-5 sm:w-56"><div className="flex-1"><p className="mb-3 text-sm font-medium">{done}<span className="ml-1 text-xs font-normal text-muted-foreground">de {path.items.length} ejercicios</span></p><div role="progressbar" aria-label={`Progreso en ${path.title}`} aria-valuemin={0} aria-valuemax={path.items.length || 1} aria-valuenow={done} className="progress-track"><div className="progress-fill" style={{ width: `${path.items.length ? done / path.items.length * 100 : 0}%` }} /></div></div><ArrowRight className="size-4 shrink-0 text-muted-foreground group-hover:text-primary-text" /></div>
      </Link>;
    })}</div>
  </div>;
}
