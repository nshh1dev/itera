"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { languages, languageNames, levelNames, type Language } from "@/lib/types";
import { Button } from "./ui/button";

export function ExerciseFilters({ query, language, level, category, status, order, categories }: { query: string; language: Language; level: string; category: string; status: string; order: string; categories: string[] }) {
  const [expanded, setExpanded] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const form = useRef<HTMLFormElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const requested = useRef("");
  const values = JSON.stringify({ q: query, lenguaje: language, nivel: level, categoria: category, estado: status, orden: order });
  useEffect(() => {
    // Sin remontar el campo: conserva el foco al buscar y restaura atrás/adelante.
    if (requested.current === values) return;
    const fields = JSON.parse(values) as Record<string, string>;
    for (const [name, value] of Object.entries(fields)) {
      const field = form.current?.elements.namedItem(name);
      if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement) field.value = value;
    }
  }, [values]);
  useEffect(() => () => clearTimeout(timer.current), []);
  function apply() {
    if (!form.current) return;
    const fields = Object.fromEntries(new FormData(form.current)) as Record<string, string>;
    requested.current = JSON.stringify(fields);
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(fields)) if (value.trim()) params.set(key, value.trim());
    startTransition(() => router.replace(`/ejercicios?${params}`, { scroll: false }));
  }
  const count = [level, category, status].filter(Boolean).length;
  return <form ref={form} action="/ejercicios" className="exercise-filter-form catalog-filter-bar" aria-label="Filtrar ejercicios" onSubmit={event => { event.preventDefault(); clearTimeout(timer.current); apply(); }} onChange={event => { clearTimeout(timer.current); if (event.target instanceof HTMLInputElement) timer.current = setTimeout(apply, 300); else apply(); }}>
    <div className="catalog-filter-search"><label htmlFor="search" className="field-label">Palabra clave</label><div className="relative"><Search className="pointer-events-none absolute top-3.5 left-3 size-4 text-muted-foreground md:top-3" aria-hidden="true" /><input id="search" name="q" type="search" defaultValue={query} className="field pl-9" placeholder="Título o concepto…" maxLength={100} /></div></div>
    <div><label htmlFor="language" className="field-label">Lenguaje</label><select id="language" name="lenguaje" defaultValue={language} className="field">{languages.map(item => <option key={item} value={item}>{languageNames[item]}</option>)}</select></div>
    <Button type="button" variant="outline" className="self-end md:hidden" aria-expanded={expanded} aria-controls="exercise-filter-options" onClick={() => setExpanded(!expanded)}><SlidersHorizontal data-icon="inline-start" />Filtros{count > 0 && ` (${count})`}</Button>
    <div id="exercise-filter-options" className="catalog-filter-options" data-expanded={expanded}>
      <div><label htmlFor="level" className="field-label">Nivel</label><select id="level" name="nivel" defaultValue={level} className="field"><option value="">Todos los niveles</option>{Object.entries(levelNames).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></div>
      <div><label htmlFor="category" className="field-label">Categoría</label><select id="category" name="categoria" defaultValue={category} className="field"><option value="">Todas las categorías</option>{categories.map(item => <option key={item}>{item}</option>)}</select></div>
      <div><label htmlFor="status" className="field-label">Estado</label><select id="status" name="estado" defaultValue={status} className="field"><option value="">Todos los estados</option><option value="sin-empezar">Sin empezar</option><option value="en-progreso">En progreso</option><option value="resueltos">Resueltos</option><option value="pendientes">Todos sin resolver</option></select></div>
      <div><label htmlFor="order" className="field-label">Ordenar por</label><select id="order" name="orden" defaultValue={order} className="field"><option value="curricular">Progresión curricular</option><option value="dificultad">Dificultad</option><option value="duracion">Duración</option></select></div>
    </div>
    <p role="status" className="col-span-full text-xs text-muted-foreground">{pending ? "Actualizando ejercicios…" : "Los filtros se aplican automáticamente."}</p>
    <noscript><Button type="submit">Aplicar filtros</Button></noscript>
  </form>;
}
