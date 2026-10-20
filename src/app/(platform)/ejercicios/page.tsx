import Link from "next/link";
import { Search, ArrowLeft, ArrowRight, X } from "lucide-react";
import { currentUser } from "@/server/auth";
import { getCatalog } from "@/server/catalog";
import { languageSchema } from "@/lib/validation";
import { levelNames, type Language, type Level } from "@/lib/types";
import { searchNormalize } from "@/lib/utils";
import { ExerciseRow } from "@/components/exercise-row";
import { Button } from "@/components/ui/button";
import { ExerciseFilters } from "@/components/exercise-filters";
import { Badge } from "@/components/ui/badge";
import { MotionRegion } from "@/components/motion-region";
import { sortExercises } from "@/lib/practice-navigation";
import { exerciseSkillSummary } from "@/lib/exercise-skills";

export const metadata = { title: "Ejercicios" };
export default async function ExercisesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const user = await currentUser();
  const str = (key: string) => typeof params[key] === "string" ? params[key] as string : "";
  const language = languageSchema.catch((user?.preference?.language ?? "python") as Language).parse(str("lenguaje"));
  const catalog = await getCatalog(user?.id, language);
  const query = str("q").trim().slice(0, 100);
  const level = str("nivel");
  const category = str("categoria");
  const status = str("estado");
  const order = ["dificultad", "duracion"].includes(str("orden")) ? str("orden") : "curricular";
  const filtered = sortExercises(catalog.filter(e => (!query || searchNormalize(`${e.title} ${e.description} ${e.category} ${e.practiceGoals?.join(" ") ?? ""} ${exerciseSkillSummary(e)}`).includes(searchNormalize(query))) && (!level || e.level === level) && (!category || e.category === category) && (!status || (status === "resueltos" ? e.solved : status === "pendientes" ? !e.solved : status === "sin-empezar" ? !e.started && !e.solved : status === "en-progreso" ? e.started && !e.solved : true))), order);
  const pages = Math.max(1, Math.ceil(filtered.length / 12));
  const page = Math.min(pages, Math.max(1, Number.parseInt(str("pagina")) || 1));
  const pageLink = (n: number) => { const p = new URLSearchParams({ lenguaje: language, q: query, nivel: level, categoria: category, estado: status, orden: order, pagina: String(n) }); return `/ejercicios?${p}`; };
  const activeFilters = [
    { key: "q", value: query, label: `Búsqueda: ${query}` },
    { key: "nivel", value: level, label: levelNames[level as Level] ?? level },
    { key: "categoria", value: category, label: category },
    { key: "estado", value: status, label: ({ resueltos: "Resueltos", pendientes: "Todos sin resolver", "sin-empezar": "Sin empezar", "en-progreso": "En progreso" } as Record<string, string>)[status] ?? status },
  ].filter(f => f.value);
  function removeFilter(key: string) { const p = new URLSearchParams({ lenguaje: language, q: query, nivel: level, categoria: category, estado: status, orden: order }); p.delete(key); return `/ejercicios?${p}`; }
  return <div className="page-container"><h1 className="page-title">Ejercicios</h1>
    <div className="catalog-layout">
    <aside className="catalog-tools" aria-label="Buscar y filtrar"><h2 className="sr-only">Filtros</h2><ExerciseFilters query={query} language={language} level={level} category={category} status={status} order={order} categories={[...new Set(catalog.map(e => e.category))]} /></aside>
    <section className="catalog-results" aria-label="Resultados de ejercicios">
    <MotionRegion motionKey={JSON.stringify(params)}>
    {activeFilters.length > 0 && <div role="group" className="mt-4 flex flex-wrap items-center gap-2" aria-label="Filtros activos">{activeFilters.map(filter => <Badge key={filter.key} variant="filter" asChild className="min-h-11 md:min-h-8"><Link href={removeFilter(filter.key)} aria-label={`Quitar filtro: ${filter.label}`}><span className="truncate">{filter.label}</span><X data-icon="inline-end" aria-hidden="true" /></Link></Badge>)}<Link className="px-2 py-2 text-xs text-primary-text hover:underline" href={`/ejercicios?lenguaje=${language}`}>Limpiar filtros</Link></div>}
    <div className="mt-6 mb-2 flex items-center justify-between px-3 text-xs text-muted-foreground"><span role="status">{filtered.length} {filtered.length === 1 ? "ejercicio" : "ejercicios"}</span><span>Página {page} de {pages}</span></div>
    {filtered.length ? filtered.slice((page - 1) * 12, page * 12).map(e => <ExerciseRow key={e.id} exercise={e} language={language} />) : <div className="empty-state"><Search className="size-7 text-muted-foreground" /><h2 className="font-medium">Todavía no hay coincidencias.</h2><p className="text-sm text-muted-foreground">Prueba otra búsqueda o cambia los filtros.</p><Link href={`/ejercicios?lenguaje=${language}`} className="text-link">Ver todos los ejercicios</Link></div>}
    {pages > 1 && <nav aria-label="Paginación" className="mt-6 flex items-center justify-between gap-3">{page === 1 ? <Button variant="outline" disabled><ArrowLeft />Anterior</Button> : <Button variant="outline" asChild><Link href={pageLink(page - 1)}><ArrowLeft />Anterior</Link></Button>}<span className="text-xs text-muted-foreground">{page} de {pages}</span>{page === pages ? <Button variant="outline" disabled>Siguiente<ArrowRight /></Button> : <Button variant="outline" asChild><Link href={pageLink(page + 1)}>Siguiente<ArrowRight /></Link></Button>}</nav>}
    </MotionRegion></section></div>
  </div>;
}
