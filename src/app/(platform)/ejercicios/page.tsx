import Link from "next/link";
import { Search, ArrowLeft, ArrowRight, SlidersHorizontal } from "lucide-react";
import { currentUser } from "@/server/auth";
import { getCatalog } from "@/server/catalog";
import { languageSchema } from "@/lib/validation";
import { levelNames, type Language } from "@/lib/types";
import { ExerciseRow } from "@/components/exercise-row";
import { Button } from "@/components/ui/button";

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
  const filtered = catalog.filter(e => (!query || `${e.title} ${e.description}`.toLocaleLowerCase("es").includes(query.toLocaleLowerCase("es"))) && (!level || e.level === level) && (!category || e.category === category) && (!status || (status === "resueltos" ? e.solved : status === "pendientes" ? !e.solved : e.started && !e.solved)));
  const pages = Math.max(1, Math.ceil(filtered.length / 12));
  const page = Math.min(pages, Math.max(1, Number.parseInt(str("pagina")) || 1));
  const pageLink = (n: number) => { const p = new URLSearchParams({ lenguaje: language, q: query, nivel: level, categoria: category, estado: status, pagina: String(n) }); return `/ejercicios?${p}`; };
  return <div className="page-container"><p className="eyebrow">Aprende haciendo</p><h1 className="page-title mt-3">Un problema. Muchas posibilidades.</h1><p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">Elige un desafío que despierte tu curiosidad. Empieza por donde estés y avanza a tu ritmo.</p>
    <form action="/ejercicios" className="mt-9 space-y-4"><div className="flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search className="absolute top-3.5 left-3.5 size-4 text-muted-foreground" /><label htmlFor="search" className="sr-only">Buscar ejercicios</label><input id="search" name="q" defaultValue={query} className="field border-border pl-10" placeholder="Encuentra tu próximo desafío…" maxLength={100} /></div><label className="sr-only" htmlFor="language">Lenguaje</label><select id="language" name="lenguaje" defaultValue={language} className="field border-border sm:w-40"><option value="python">Python</option><option value="javascript">JavaScript</option></select></div>
      <div className="flex flex-wrap items-center gap-3"><SlidersHorizontal className="hidden size-4 text-muted-foreground sm:block" /><label htmlFor="level" className="sr-only">Nivel</label><select id="level" name="nivel" defaultValue={level} className="field w-auto min-w-36 border-border"><option value="">Todos los niveles</option>{Object.entries(levelNames).map(([value,label]) => <option value={value} key={value}>{label}</option>)}</select><label htmlFor="category" className="sr-only">Categoría</label><select id="category" name="categoria" defaultValue={category} className="field w-auto min-w-36 border-border"><option value="">Todas las categorías</option>{[...new Set(catalog.map(e => e.category))].map(c => <option key={c}>{c}</option>)}</select><label htmlFor="status" className="sr-only">Estado</label><select id="status" name="estado" defaultValue={status} className="field w-auto border-border"><option value="">Todos los estados</option><option value="pendientes">Pendientes</option><option value="resueltos">Resueltos</option><option value="en-progreso">En progreso</option></select><Button variant="secondary" type="submit">Aplicar filtros</Button>{(query || level || category || status) && <Link className="text-xs text-muted-foreground hover:underline" href={`/ejercicios?lenguaje=${language}`}>Limpiar</Link>}</div>
    </form>
    <div className="mt-9 flex items-center justify-between border-b pb-3 text-xs text-muted-foreground"><span>{filtered.length} {filtered.length === 1 ? "ejercicio" : "ejercicios"}</span><span>Un intento más cerca</span></div>
    {filtered.length ? filtered.slice((page - 1) * 12, page * 12).map(e => <ExerciseRow key={e.id} exercise={e} language={language} />) : <div className="empty-state"><Search className="size-7 text-muted-foreground" /><h2 className="font-medium">Todavía no hay coincidencias.</h2><p className="text-sm text-muted-foreground">Prueba otra búsqueda o cambia los filtros.</p><Link href="/ejercicios" className="text-link">Ver todos los ejercicios</Link></div>}
    {pages > 1 && <nav aria-label="Paginación" className="mt-7 flex items-center justify-between"><Button variant="outline" asChild disabled={page === 1}><Link href={pageLink(Math.max(1, page - 1))} aria-disabled={page === 1} tabIndex={page === 1 ? -1 : undefined}><ArrowLeft />Anterior</Link></Button><span className="text-xs text-muted-foreground">{page} de {pages}</span><Button variant="outline" asChild disabled={page === pages}><Link href={pageLink(Math.min(pages, page + 1))} aria-disabled={page === pages} tabIndex={page === pages ? -1 : undefined}>Siguiente<ArrowRight /></Link></Button></nav>}
  </div>;
}
