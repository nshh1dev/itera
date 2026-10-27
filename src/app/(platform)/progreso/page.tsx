import Link from "next/link";
import { ArrowRight, ChartNoAxesCombined } from "lucide-react";
import { currentUser } from "@/server/auth";
import { db } from "@/server/db";
import { getHistoryGroups } from "@/server/progress-history";
import { getCatalog } from "@/server/catalog";
import { languageNames, type Language } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ExerciseHistory } from "@/components/exercise-history";
import { LanguageNavigation } from "@/components/language-navigation";
import { languageSchema } from "@/lib/validation";
import { Progress } from "@/components/arc/progress";
import { Disclosure } from "@/components/arc/disclosure";
import { languagePaths } from "@/lib/language-curriculum";

export const metadata = { title: "Mi progreso" };
export default async function ProgressPage({ searchParams }: { searchParams: Promise<{ lenguaje?: string; pagina?: string; archivo?: string; borradores?: string }> }) {
  const user = await currentUser();
  if (!user) return <div className="page-container"><h1 className="page-title">Mi progreso</h1><div className="empty-state mt-6 rounded-xl bg-surface"><ChartNoAxesCombined className="size-7 text-muted-foreground" aria-hidden="true" /><h2 className="section-title">Entra para ver tu progreso</h2><p className="max-w-prose text-sm leading-6 text-muted-foreground">Inicia sesión para consultar tus intentos y ejercicios resueltos en cada lenguaje. Sin sesión, los borradores solo quedan en este navegador y no registran finalizaciones.</p><Button asChild className="mt-2"><Link href="/iniciar-sesion?volver=%2Fprogreso">Iniciar sesión<ArrowRight /></Link></Button><Link href="/registro?volver=%2Fprogreso" className="text-link text-sm">Crear una cuenta local</Link><Link href="/rutas" className="text-link text-sm">Explorar rutas sin cuenta</Link></div></div>;
  const params = await searchParams;
  const language = languageSchema.catch((user.preference?.language ?? "python") as Language).parse(params.lenguaje);
  const archivePage = Math.min(100000, Math.max(1, Number.parseInt(params.archivo ?? "1") || 1));
  const draftPage = Math.min(100000, Math.max(1, Number.parseInt(params.borradores ?? "1") || 1));
  const [catalog, history, storedPaths, help, archivedProgress, archivedDrafts, archivedSubmissions, currentVersions] = await Promise.all([
    getCatalog(user.id, language),
    getHistoryGroups(user.id, language),
    db.learningPath.findMany({ orderBy: { order: "asc" }, select: { slug: true, title: true, items: { select: { exerciseId: true } } } }),
    db.helpUsage.findMany({ where: { userId: user.id, language }, select: { exerciseId: true, kind: true } }),
    db.progress.count({ where: { userId: user.id, language, firstPassedAt: { not: null }, exercise: { published: false } } }),
    db.draft.findMany({ where: { userId: user.id, variant: { language, version: { exercise: { published: false } } } }, orderBy: [{ updatedAt: "desc" }, { id: "desc" }], skip: (archivePage - 1) * 20, take: 21, select: { id: true, code: true, variant: { select: { language: true, version: { select: { title: true } } } } } }),
    db.submission.findMany({ where: { userId: user.id, diagnosticItemId: null, variant: { language, version: { exercise: { published: false } } } }, orderBy: [{ createdAt: "desc" }, { id: "desc" }], skip: (archivePage - 1) * 20, take: 21, select: { id: true, code: true, status: true, variant: { select: { language: true, version: { select: { title: true } } } } } }),
    db.exerciseVersion.findMany({ where: { published: true, variants: { some: { language } }, exercise: { published: true } }, distinct: ["exerciseId"], orderBy: { number: "desc" }, select: { id: true } }),
  ]);
  const paths = languagePaths(storedPaths, catalog, language);
  const historicalDrafts = await db.draft.findMany({ where: { userId: user.id, variant: { language, version: { id: { notIn: currentVersions.map(version => version.id) }, exercise: { published: true } } } }, orderBy: [{ updatedAt: "desc" }, { id: "desc" }], skip: (draftPage - 1) * 20, take: 21, select: { id: true, code: true, updatedAt: true, variant: { select: { version: { select: { title: true, number: true } } } } } });
  const solved = catalog.filter(e => e.solved).length;
  const pages = Math.max(1, Math.ceil(history.length / 10));
  const page = Math.min(pages, Math.max(1, Number.parseInt(params.pagina ?? "1") || 1));
  const toReview = catalog.filter(exercise => exercise.started && !exercise.solved);
  return <div className="page-container">
    <h1 className="page-title">Progreso</h1>
    <LanguageNavigation language={language} pathname="/progreso" />
    {history.length === 0 && <section className="mt-6 rounded-xl bg-surface p-5" aria-labelledby="first-attempt-title"><h2 id="first-attempt-title" className="section-title">Aún no hay intentos en {languageNames[language]}</h2><p className="mt-2 max-w-prose text-sm leading-6 text-muted-foreground">{toReview.length ? "Tienes borradores guardados. Retoma uno y ejecuta los ejemplos; sus resultados aparecerán aquí." : "Empieza con un ejercicio y prueba tu código. Los ejemplos guardan un intento; superar la comprobación completa registra el ejercicio como resuelto."}</p><Link href={`/ejercicios?lenguaje=${language}${toReview.length ? "&estado=en-progreso" : ""}`} className="text-link mt-3">{toReview.length ? "Retomar un borrador" : "Elegir primer ejercicio"}<ArrowRight className="size-4" aria-hidden="true" /></Link></section>}
    {history.length > 0 && <Link href={`/ejercicios?lenguaje=${language}&estado=pendientes`} className="text-link mt-4">Elegir el siguiente ejercicio<ArrowRight aria-hidden="true" className="size-4" /></Link>}
    <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4 rounded-xl bg-surface p-6">
      <div><dt className="text-xs text-muted-foreground">Resueltos en {languageNames[language]}</dt><dd className="mt-3 text-3xl font-semibold tracking-tight">{solved}<span className="ml-1 text-sm font-normal text-muted-foreground">/ {catalog.length}</span></dd></div>
      <div><dt className="text-xs text-muted-foreground">En progreso</dt><dd className="mt-3 text-3xl font-semibold tracking-tight">{toReview.length}</dd></div>
    </dl>
    <p className="mt-4 text-sm leading-6 text-muted-foreground">Completados, no una medida de dominio. Resolver desde una ruta o desde práctica libre cuenta una sola vez por lenguaje.</p>
    <div className="progress-layout"><section><h2 className="section-title">Por ruta</h2><div className="mt-5 grid gap-5">{paths.map(path => { const items = catalog.filter(exercise => path.items.some(item => item.exerciseId === exercise.id)); const done = items.filter(exercise => exercise.solved).length; return <div key={path.slug}><div className="mb-2 flex justify-between gap-3 text-sm"><Link className="text-link" href={`/rutas/${path.slug}?lenguaje=${language}`}>{path.title}</Link><span className="text-muted-foreground">{done} / {items.length}</span></div><Progress label={path.title} value={done} max={items.length} /></div>; })}</div>
    <h2 className="section-title mt-8">Por categoría</h2><div className="mt-5 grid gap-5">{[...new Set(catalog.map(e => e.category))].map(category => { const items = catalog.filter(e => e.category === category); const done = items.filter(e => e.solved).length; return <div key={category}><div className="mb-2 flex items-center justify-between gap-3 text-sm"><span>{category}</span><span className="text-xs text-muted-foreground">{done} / {items.length}</span></div><Progress label={category} value={done} max={items.length} /></div>; })}</div>
    {toReview.length > 0 && <div className="mt-8"><h2 className="section-title">Para retomar</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Tienes ejercicios iniciados sin resolver. Es un punto de partida para repasar, no un diagnóstico de conocimientos.</p><Link href={`/ejercicios?lenguaje=${language}&estado=en-progreso`} className="text-link mt-3 text-sm">Ver ejercicios en progreso<ArrowRight className="size-4" /></Link></div>}
    <Disclosure title="Cómo interpretar tu progreso" className="mt-6"><p className="text-sm leading-6 text-muted-foreground">Has resuelto {catalog.filter(e => e.solved && help.some(h => h.exerciseId === e.id)).length} ejercicios después de consultar ayuda. Las pistas son parte del aprendizaje; este dato no permite medir dominio. Prueba a reconstruir una solución y explicar sus decisiones.</p></Disclosure></section>
    <section className="activity-journal"><h2 className="section-title">Historial por ejercicio</h2><p className="mt-2 text-sm text-muted-foreground">{history.length ? `${languageNames[language]} · Despliega un ejercicio para consultar sus intentos.` : `Aquí aparecerán tus ejecuciones en ${languageNames[language]}, agrupadas por ejercicio. Cambiar de lenguaje no borra tu historial.`}</p>{history.slice((page - 1) * 10, page * 10).map(group => { const exercise = catalog.find(item => item.id === group.exerciseId); return exercise ? <ExerciseHistory key={`${language}-${group.exerciseId}`} {...group} title={exercise.title} slug={exercise.slug} language={language} solved={exercise.solved} /> : null; })}{pages > 1 && <nav aria-label="Paginación del historial" className="mt-4 flex flex-wrap items-center justify-between gap-3">{page > 1 ? <Link className="text-link" href={`/progreso?lenguaje=${language}&pagina=${page - 1}`}>Anterior</Link> : <span />}<span className="text-xs text-muted-foreground">{page} de {pages}</span>{page < pages && <Link className="text-link" href={`/progreso?lenguaje=${language}&pagina=${page + 1}`}>Siguiente</Link>}</nav>}</section></div>
    {(historicalDrafts.length > 0 || draftPage > 1) && <Disclosure key={`drafts-${language}-${draftPage}`} defaultOpen={draftPage > 1} title="Borradores de versiones anteriores" className="mt-10"><p className="text-sm leading-6 text-muted-foreground">Borradores históricos en {languageNames[language]}, en páginas de 20. Puedes copiar su código para consultarlo; no reemplazan el borrador de la versión actual.</p>{historicalDrafts.slice(0, 20).map(draft => <Disclosure key={draft.id} title={`${draft.variant.version.title} · Versión ${draft.variant.version.number}`}><time dateTime={draft.updatedAt.toISOString()} className="text-xs text-muted-foreground">{new Intl.DateTimeFormat("es", { dateStyle: "medium", timeZone: "UTC" }).format(draft.updatedAt)}</time><pre tabIndex={0} className="code-block mt-3" aria-label={`Borrador de ${draft.variant.version.title}, versión ${draft.variant.version.number}`}><code>{draft.code}</code></pre></Disclosure>)}<ArchivePagination language={language} page={draftPage} more={historicalDrafts.length > 20} parameter="borradores" /></Disclosure>}
    {(archivedProgress > 0 || archivedDrafts.length > 0 || archivedSubmissions.length > 0 || archivePage > 1) && <section id="historial-anterior" className="mt-10" aria-labelledby="archive-title">
      <Disclosure key={`archive-${language}-${archivePage}`} defaultOpen={archivePage > 1} title="Tu catálogo anterior">
      <h2 id="archive-title" className="sr-only">Archivo del catálogo anterior</h2>
      <p className="mt-2 max-w-prose text-sm leading-7 text-muted-foreground">Tus registros anteriores se conservan y no completan los ejercicios nuevos. Resueltos en el catálogo anterior: {archivedProgress} en {languageNames[language]}. Consulta borradores e intentos archivados en páginas de 20 por tipo.</p>
      <div className="mt-5 flex flex-col gap-3">{archivedDrafts.slice(0, 20).map(draft => <Disclosure key={draft.id} title={`Borrador · ${draft.variant.version.title} · ${languageNames[draft.variant.language as Language]}`}><pre tabIndex={0} aria-label={`Código guardado de ${draft.variant.version.title}`} className="code-block mt-2"><code>{draft.code}</code></pre></Disclosure>)}</div>
      <div className="mt-5 flex flex-col gap-3">{archivedSubmissions.slice(0, 20).map(submission => <Disclosure key={submission.id} title={`Intento · ${submission.variant.version.title} · ${languageNames[submission.variant.language as Language]}`}><p className="text-sm text-muted-foreground">{submission.status === "PASSED" ? "Pruebas superadas" : submission.status === "FAILED" ? "Pruebas no superadas" : "Sin evaluación completada"}</p><pre tabIndex={0} aria-label={`Código enviado a ${submission.variant.version.title}`} className="code-block mt-2"><code>{submission.code}</code></pre></Disclosure>)}</div>
      <ArchivePagination language={language} page={archivePage} more={archivedDrafts.length > 20 || archivedSubmissions.length > 20} parameter="archivo" />
      </Disclosure>
    </section>}
  </div>;
}

function ArchivePagination({ language, page, more, parameter }: { language: Language; page: number; more: boolean; parameter: "archivo" | "borradores" }) {
  if (page === 1 && !more) return null;
  return <nav aria-label={parameter === "archivo" ? "Paginación del archivo" : "Paginación de borradores históricos"} className="mt-4 flex items-center justify-between gap-3 text-sm">{page > 1 ? <Link className="text-link" href={`/progreso?lenguaje=${language}&${parameter}=${page - 1}`}>Anterior</Link> : <span />}<span className="text-muted-foreground">Página {page}</span>{more && <Link className="text-link" href={`/progreso?lenguaje=${language}&${parameter}=${page + 1}`}>Siguiente</Link>}</nav>;
}
