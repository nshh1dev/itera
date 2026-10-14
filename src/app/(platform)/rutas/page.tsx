import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { db } from "@/server/db";
import { currentUser } from "@/server/auth";
import { levelNames } from "@/lib/types";

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
  return <div className="page-container"><p className="eyebrow">Una idea lleva a otra</p><h1 className="page-title mt-3">Encuentra tu camino.</h1><p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">Ejercicios conectados para construir conocimiento, paso a paso. Elige dónde empezar; siempre puedes cambiar de ruta.</p><div className="mt-10 space-y-5">{paths.map((path,i) => { const done = path.items.filter(item => item.exercise.progress.length > 0).length; return <Link href={`/rutas/${path.slug}?lenguaje=${language}`} key={path.id} className="group flex flex-col gap-7 rounded-2xl border p-6 transition-colors hover:bg-surface sm:flex-row sm:p-8"><span className="font-mono text-3xl tracking-tight text-muted-foreground/60">0{i + 1}</span><div className="flex-1"><p className="eyebrow">{Object.values(levelNames)[i]}</p><h2 className="mt-3 text-2xl font-medium tracking-tight">{path.title}</h2><p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">{path.description}</p><div className="mt-6 flex items-center gap-4"><div className="h-1 w-32 overflow-hidden rounded-full bg-border"><div className="h-full bg-primary" style={{ width: `${path.items.length ? done / path.items.length * 100 : 0}%` }} /></div><span className="text-xs text-muted-foreground">{done} de {path.items.length} ejercicios</span></div></div><ArrowRight className="size-5 self-end text-muted-foreground group-hover:text-primary sm:self-center" /></Link>; })}</div></div>;
}
