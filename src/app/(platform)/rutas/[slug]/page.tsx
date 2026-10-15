import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/server/db";
import { currentUser } from "@/server/auth";
import { getCatalog } from "@/server/catalog";
import { languageSchema } from "@/lib/validation";
import { ExerciseRow } from "@/components/exercise-row";

export default async function PathPage({ params, searchParams }: { params: Promise<{slug:string}>; searchParams: Promise<{lenguaje?:string}> }) {
  const {slug} = await params;
  const user = await currentUser();
  const language = languageSchema.catch("python").parse((await searchParams).lenguaje ?? user?.preference?.language);
  const path = await db.learningPath.findUnique({ where: { slug }, include: { items: { orderBy: { position: "asc" } } } });
  if (!path) notFound();
  const catalog = await getCatalog(user?.id, language);
  const exercises = path.items.flatMap(item => { const exercise = catalog.find(e => e.id === item.exerciseId); return exercise ? [exercise] : []; });
  return <div className="page-container">
    <Link href="/rutas" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary"><ArrowLeft className="size-3.5" />Todas las rutas</Link>
    <h1 className="page-title mt-5">{path.title}</h1>
    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{path.description}</p>
    <nav aria-label="Lenguaje de la ruta" className="segmented-control mt-5">{["python", "javascript"].map(lang => <Link key={lang} href={`?lenguaje=${lang}`} aria-current={language === lang ? "page" : undefined} className="segment">{lang === "python" ? "Python" : "JavaScript"}</Link>)}</nav>
    <p className="mt-6 mb-3 px-3 text-xs text-muted-foreground">{exercises.filter(e => e.solved).length} de {exercises.length} completados · Sin prisa, sin bloqueos</p>
    {exercises.map((e, index) => <ExerciseRow key={e.id} exercise={{ ...e, order: index }} language={language} pathSlug={slug} />)}
  </div>;
}
