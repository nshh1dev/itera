import Link from "next/link";
import { Search, ArrowLeft, ArrowRight, X } from "lucide-react";
import { currentUser } from "@/server/auth";
import { getCatalog } from "@/server/catalog";
import { getLastDraft } from "@/server/activity";
import { languageSchema } from "@/lib/validation";
import { levelNames, type Language, type Level } from "@/lib/types";
import { exerciseHref } from "@/lib/learning-paths";
import { searchNormalize } from "@/lib/utils";
import { ExerciseRow } from "@/components/exercise-row";
import { Button } from "@/components/ui/button";
import { ExerciseFilters } from "@/components/exercise-filters";
import { Badge } from "@/components/ui/badge";
import { MotionRegion } from "@/components/motion-region";

export const metadata = { title: "Ejercicios" };
export default async function ExercisesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const user = await currentUser();
  const str = (key: string) => typeof params[key] === "string" ? params[key] as string : "";
  const language = languageSchema.catch((user?.preference?.language ?? "python") as Language).parse(str("lenguaje"));
  const [catalog, lastDraft] = await Promise.all([
    getCatalog(user?.id, language),
    user ? getLastDraft(user.id, language) : null,
  ]);
  const continueExercise = catalog.find(e => e.slug === lastDraft?.variant.version.exercise.slug && !e.solved);
  const query = str("q").trim().slice(0, 100);
  const level = str("nivel");
  const category = str("categoria");
  const status = str("estado");
  const filtered = catalog.filter(e => (!query || searchNormalize(`${e.title} ${e.description}`).includes(searchNormalize(query))) && (!level || e.level === level) && (!category || e.category === category) && (!status || (status === "resueltos" ? e.solved : status === "pendientes" ? !e.solved : e.started && !e.solved)));
  const pages = Math.max(1, Math.ceil(filtered.length / 12));
  const page = Math.min(pages, Math.max(1, Number.parseInt(str("pagina")) || 1));
  const pageLink = (n: number) => { const p = new URLSearchParams({ lenguaje: language, q: query, nivel: level, categoria: category, estado: status, pagina: String(n) }); return `/ejercicios?${p}`; };
  const activeFilters = [
    { key: "q", value: query, label: `Búsqueda: ${query}` },
    { key: "nivel", value: level, label: levelNames[level as Level] ?? level },
    { key: "categoria", value: category, label: category },
    { key: "estado", value: status, label: ({ resueltos: "Resueltos", pendientes: "Pendientes", "en-progreso": "En progreso" } as Record<string, string>)[status] ?? status },
  ].filter(f => f.value);
  function removeFilter(key: string) { const p = new URLSearchParams({ lenguaje: language, q: query, nivel: level, categoria: category, estado: status }); p.delete(key); return `/ejercicios?${p}`; }
  return <div className="page-container"><h1 className="page-title">Ejercicios</h1><p className="page-description">Busca un concepto, elige tu lenguaje y encuentra qué practicar.</p>
    {continueExercise && <Link href={exerciseHref(continueExercise.slug, language)} className="surface-panel mt-6 flex items-center justify-between gap-4 rounded-2xl bg-surface p-4"><div className="min-w-0"><p className="text-xs text-muted-foreground">Continúa donde lo dejaste</p><p className="mt-1 truncate text-sm font-medium">{continueExercise.title}</p></div><ArrowRight className="size-4 shrink-0 text-muted-foreground" /></Link>}
    <div className="catalog-layout">
    <aside className="catalog-tools" aria-label="Buscar y filtrar"><h2 className="section-title">Encuentra tu práctica</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Un concepto cada vez. Elige qué quieres trabajar hoy.</p><ExerciseFilters key={[query, language, level, category, status].join(":")} query={query} language={language} level={level} category={category} status={status} categories={[...new Set(catalog.map(e => e.category))]} /></aside>
    <section className="catalog-results" aria-label="Resultados de ejercicios">
    <MotionRegion motionKey={JSON.stringify(params)}>
    {activeFilters.length > 0 && <div role="group" className="mt-4 flex flex-wrap items-center gap-2" aria-label="Filtros activos">{activeFilters.map(filter => <Badge key={filter.key} variant="filter" asChild className="min-h-11 md:min-h-8"><Link href={removeFilter(filter.key)} aria-label={`Quitar filtro: ${filter.label}`}><span className="truncate">{filter.label}</span><X data-icon="inline-end" aria-hidden="true" /></Link></Badge>)}<Link className="px-2 py-2 text-xs text-primary-text hover:underline" href={`/ejercicios?lenguaje=${language}`}>Limpiar filtros</Link></div>}
    <div className="mt-6 mb-2 flex items-center justify-between px-3 text-xs text-muted-foreground"><span>{filtered.length} {filtered.length === 1 ? "ejercicio" : "ejercicios"}</span><span>Página {page} de {pages}</span></div>
    {filtered.length ? filtered.slice((page - 1) * 12, page * 12).map(e => <ExerciseRow key={e.id} exercise={e} language={language} />) : <div className="empty-state"><Search className="size-7 text-muted-foreground" /><h2 className="font-medium">Todavía no hay coincidencias.</h2><p className="text-sm text-muted-foreground">Prueba otra búsqueda o cambia los filtros.</p><Link href={`/ejercicios?lenguaje=${language}`} className="text-link">Ver todos los ejercicios</Link></div>}
    {pages > 1 && <nav aria-label="Paginación" className="mt-6 flex items-center justify-between gap-3">{page === 1 ? <Button variant="outline" disabled><ArrowLeft />Anterior</Button> : <Button variant="outline" asChild><Link href={pageLink(page - 1)}><ArrowLeft />Anterior</Link></Button>}<span className="text-xs text-muted-foreground">{page} de {pages}</span>{page === pages ? <Button variant="outline" disabled>Siguiente<ArrowRight /></Button> : <Button variant="outline" asChild><Link href={pageLink(page + 1)}>Siguiente<ArrowRight /></Link></Button>}</nav>}
    </MotionRegion></section></div>
  </div>;
}
