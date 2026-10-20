import Link from "next/link";
import { ArrowRight, ChartNoAxesCombined } from "lucide-react";
import { currentUser } from "@/server/auth";
import { db } from "@/server/db";
import { getRecentSubmissions } from "@/server/activity";
import { getCatalog } from "@/server/catalog";
import { languageNames, type Language } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ActivityList } from "@/components/activity-list";
import { Progress } from "@/components/arc/progress";
import { Disclosure } from "@/components/arc/disclosure";

export const metadata = { title: "Mi progreso" };
export default async function ProgressPage() {
  const user = await currentUser();
  if (!user) return <div className="page-container"><h1 className="page-title">Mi progreso</h1><div className="empty-state mt-6 rounded-xl bg-surface"><ChartNoAxesCombined className="size-7 text-muted-foreground" /><h2 className="section-title">Guarda tu aprendizaje</h2><p className="max-w-sm text-sm leading-6 text-muted-foreground">Crea una cuenta local para guardar tus intentos y ver cómo avanzas.</p><Button asChild className="mt-2"><Link href="/registro?volver=/progreso">Crear cuenta<ArrowRight /></Link></Button></div></div>;
  const language = (user.preference?.language ?? "python") as Language;
  const [catalog, attempts, recent, help, archivedProgress, archivedDrafts, archivedSubmissions] = await Promise.all([
    getCatalog(user.id, language),
    db.submission.count({ where: { userId: user.id, mode: "submit", status: { in: ["PASSED", "FAILED"] }, variant: { version: { exercise: { published: true } } } } }),
    getRecentSubmissions(user.id, 10),
    db.helpUsage.findMany({ where: { userId: user.id, language }, select: { exerciseId: true, kind: true } }),
    db.progress.count({ where: { userId: user.id, language, firstPassedAt: { not: null }, exercise: { published: false } } }),
    db.draft.findMany({ where: { userId: user.id, variant: { version: { exercise: { published: false } } } }, orderBy: { updatedAt: "desc" }, take: 20, select: { id: true, code: true, variant: { select: { language: true, version: { select: { title: true } } } } } }),
    db.submission.findMany({ where: { userId: user.id, variant: { version: { exercise: { published: false } } } }, orderBy: { createdAt: "desc" }, take: 20, select: { id: true, code: true, status: true, variant: { select: { language: true, version: { select: { title: true } } } } } }),
  ]);
  const solved = catalog.filter(e => e.solved).length;
  return <div className="page-container">
    <h1 className="page-title">Progreso</h1>
    <p className="mt-3 text-sm text-muted-foreground">{languageNames[language]} · <Link href="/configuracion" className="text-primary-text underline underline-offset-4">Cambiar</Link></p>
    {attempts === 0 && <section className="mt-6 rounded-xl bg-surface p-5" aria-labelledby="first-attempt-title"><h2 id="first-attempt-title" className="section-title">Aún no hay comprobaciones</h2><Link href={`/ejercicios?lenguaje=${language}`} className="text-link mt-3">Elegir primer ejercicio<ArrowRight className="size-4" aria-hidden="true" /></Link></section>}
    <Link href={`/ejercicios?lenguaje=${language}&estado=pendientes`} className="text-link mt-4">Elegir el siguiente ejercicio<ArrowRight aria-hidden="true" className="size-4" /></Link>
    <dl className="progress-summary">
      <div><dt className="text-xs text-muted-foreground">Resueltos en {languageNames[language]}</dt><dd className="mt-3 text-3xl font-semibold tracking-tight">{solved}<span className="ml-1 text-sm font-normal text-muted-foreground">/ {catalog.length}</span></dd></div>
      <div><dt className="text-xs text-muted-foreground">Comprobaciones del catálogo actual · todos los lenguajes</dt><dd className="mt-3 text-3xl font-semibold tracking-tight">{attempts}</dd></div>
      <div><dt className="text-xs text-muted-foreground">Resueltos con ayuda · {languageNames[language]}</dt><dd className="mt-3 text-3xl font-semibold tracking-tight">{catalog.filter(e => e.solved && help.some(h => h.exerciseId === e.id)).length}</dd></div>
    </dl>
    <div className="progress-layout"><section><h2 className="section-title">Por categoría</h2><p className="mt-2 text-xs leading-5 text-muted-foreground">Completados, no una medida de dominio.</p><div className="mt-6 grid gap-7">{[...new Set(catalog.map(e => e.category))].map(category => { const items = catalog.filter(e => e.category === category); const done = items.filter(e => e.solved).length; return <div key={category}><div className="mb-3 flex items-center justify-between gap-3 text-sm"><span>{category}</span><span className="text-xs text-muted-foreground">{done} / {items.length}</span></div><Progress label={category} value={done} max={items.length} /></div>; })}</div></section>
    <section className="activity-journal"><h2 className="section-title">Tus últimos intentos</h2><p className="mt-2 mb-4 text-xs text-muted-foreground">Incluye ejemplos y comprobaciones de todos los lenguajes.</p><ActivityList entries={recent} /></section></div>
    {(archivedProgress > 0 || archivedDrafts.length > 0 || archivedSubmissions.length > 0) && <section id="historial-anterior" className="mt-10" aria-labelledby="archive-title">
      <h2 id="archive-title" className="section-title">Tu catálogo anterior</h2>
      <p className="mt-2 max-w-prose text-sm leading-7 text-muted-foreground">Tus registros anteriores se conservan y no completan los ejercicios nuevos. Resueltos en el catálogo anterior: {archivedProgress} en {languageNames[language]}. Aquí puedes consultar tus últimos 20 borradores y 20 intentos archivados, de todos los lenguajes.</p>
      <div className="mt-5 flex flex-col gap-3">{archivedDrafts.map(draft => <Disclosure key={draft.id} title={`Borrador · ${draft.variant.version.title} · ${languageNames[draft.variant.language as Language]}`}><pre tabIndex={0} aria-label={`Código guardado de ${draft.variant.version.title}`} className="code-block mt-2"><code>{draft.code}</code></pre></Disclosure>)}</div>
      <div className="mt-5 flex flex-col gap-3">{archivedSubmissions.map(submission => <Disclosure key={submission.id} title={`Intento · ${submission.variant.version.title} · ${languageNames[submission.variant.language as Language]}`}><p className="text-sm text-muted-foreground">{submission.status === "PASSED" ? "Pruebas superadas" : submission.status === "FAILED" ? "Pruebas no superadas" : "Sin evaluación completada"}</p><pre tabIndex={0} aria-label={`Código enviado a ${submission.variant.version.title}`} className="code-block mt-2"><code>{submission.code}</code></pre></Disclosure>)}</div>
    </section>}
  </div>;
}
