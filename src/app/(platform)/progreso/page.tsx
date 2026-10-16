import Link from "next/link";
import { ArrowRight, ChartNoAxesCombined } from "lucide-react";
import { currentUser } from "@/server/auth";
import { db } from "@/server/db";
import { getCatalog } from "@/server/catalog";
import { languageNames, type Language } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ActivityList } from "@/components/activity-list";

export const metadata = { title: "Mi progreso" };
export default async function ProgressPage() {
  const user = await currentUser();
  if (!user) return <div className="page-container"><h1 className="page-title">Mi progreso</h1><div className="empty-state mt-6 rounded-xl bg-surface"><ChartNoAxesCombined className="size-7 text-muted-foreground" /><h2 className="section-title">Guarda tu aprendizaje</h2><p className="max-w-sm text-sm leading-6 text-muted-foreground">Crea una cuenta local para guardar tus intentos y ver cómo avanzas.</p><Button asChild className="mt-2"><Link href="/registro?volver=/progreso">Crear cuenta<ArrowRight /></Link></Button></div></div>;
  const language = (user.preference?.language ?? "python") as Language;
  const [catalog, attempts, recent, help] = await Promise.all([
    getCatalog(user.id, language),
    db.submission.count({ where: { userId: user.id, mode: "submit", status: { in: ["PASSED", "FAILED"] } } }),
    db.submission.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 10, select: { id: true, status: true, mode: true, createdAt: true, passedCount: true, totalCount: true, variant: { select: { language: true, version: { select: { title: true, exercise: { select: { slug: true } } } } } } } }),
    db.helpUsage.findMany({ where: { userId: user.id, language }, select: { exerciseId: true, kind: true } }),
  ]);
  const solved = catalog.filter(e => e.solved).length;
  return <div className="page-container">
    <h1 className="page-title">Mi progreso</h1><p className="page-description">Observa lo que has practicado y elige dónde seguir. Los ejercicios resueltos no son una medida de dominio.</p>
    <Link href={`/ejercicios?lenguaje=${language}&estado=pendientes`} className="text-link mt-4">Elegir el siguiente ejercicio<ArrowRight aria-hidden="true" className="size-4" /></Link>
    <dl className="progress-summary">
      <div><dt className="text-xs text-muted-foreground">Resueltos en {languageNames[language]}</dt><dd className="mt-3 text-3xl font-semibold tracking-tight">{solved}<span className="ml-1 text-sm font-normal text-muted-foreground">/ {catalog.length}</span></dd></div>
      <div><dt className="text-xs text-muted-foreground">Comprobaciones evaluadas · todos los lenguajes</dt><dd className="mt-3 text-3xl font-semibold tracking-tight">{attempts}</dd></div>
      <div><dt className="text-xs text-muted-foreground">Resueltos con ayuda · {languageNames[language]}</dt><dd className="mt-3 text-3xl font-semibold tracking-tight">{catalog.filter(e => e.solved && help.some(h => h.exerciseId === e.id)).length}</dd></div>
    </dl>
    <div className="progress-layout"><section><h2 className="section-title">Progreso por categorías</h2><p className="mt-2 text-xs leading-5 text-muted-foreground">Ejercicios completados en {languageNames[language]}; no equivale a una medida de dominio.</p><div className="mt-6 grid gap-7">{[...new Set(catalog.map(e => e.category))].map(category => { const items = catalog.filter(e => e.category === category); const done = items.filter(e => e.solved).length; return <div key={category}><div className="mb-3 flex items-center justify-between gap-3 text-sm"><span>{category}</span><span className="text-xs text-muted-foreground">{done} / {items.length}</span></div><div className="progress-track" role="progressbar" aria-label={category} aria-valuemin={0} aria-valuemax={items.length} aria-valuenow={done}><div className="progress-fill" style={{ width: `${done / items.length * 100}%` }} /></div></div>; })}</div></section>
    <section className="activity-journal"><h2 className="section-title mb-4">Tus últimos intentos</h2><ActivityList entries={recent} /></section></div>
  </div>;
}
