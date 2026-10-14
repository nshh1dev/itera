import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/server/db";
import { currentUser } from "@/server/auth";
import { getCatalog } from "@/server/catalog";
import { languageSchema } from "@/lib/validation";
import { ExerciseRow } from "@/components/exercise-row";
import { cn } from "@/lib/utils";

export default async function PathPage({ params, searchParams }: { params: Promise<{slug:string}>; searchParams: Promise<{lenguaje?:string}> }) {
  const {slug} = await params;
  const user = await currentUser();
  const language = languageSchema.catch("python").parse((await searchParams).lenguaje ?? user?.preference?.language);
  const path = await db.learningPath.findUnique({ where: { slug }, include: { items: { orderBy: { position: "asc" } } } });
  if (!path) notFound();
  const catalog = await getCatalog(user?.id, language);
  const exercises = path.items.flatMap(item => { const exercise = catalog.find(e => e.id === item.exerciseId); return exercise ? [exercise] : []; });
  return <div className="page-container"><Link href="/rutas" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary"><ArrowLeft className="size-3.5" />Todas las rutas</Link><h1 className="page-title mt-7">{path.title}</h1><p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">{path.description}</p><div className="mt-7 flex items-center gap-2">{["python", "javascript"].map(lang => <Link key={lang} href={`?lenguaje=${lang}`} className={cn("rounded-lg px-4 py-2.5 text-sm", language === lang ? "bg-surface font-medium" : "text-muted-foreground")}>{lang === "python" ? "Python" : "JavaScript"}</Link>)}</div><p className="mt-10 border-b pb-4 text-xs text-muted-foreground">{exercises.filter(e => e.solved).length} de {exercises.length} completados · Sin prisa, sin bloqueos</p>{exercises.map(e => <ExerciseRow key={e.id} exercise={e} language={language} />)}</div>;
}
