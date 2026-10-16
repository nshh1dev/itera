"use client";
import { useState } from "react";
import Form from "next/form";
import { useFormStatus } from "react-dom";
import { Search, SlidersHorizontal } from "lucide-react";
import { languages, languageNames, levelNames, type Language } from "@/lib/types";
import { Button } from "./ui/button";

function SearchButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" aria-busy={pending} disabled={pending} className="self-start min-[1024px]:w-full">{pending ? "Buscando ejercicios…" : "Buscar ejercicios"}</Button>;
}

export function ExerciseFilters({ query, language, level, category, status, categories }: { query: string; language: Language; level: string; category: string; status: string; categories: string[] }) {
  const [expanded, setExpanded] = useState(false);
  const count = [level, category, status].filter(Boolean).length;
  return <Form action="/ejercicios" scroll={false} className="exercise-filter-form mt-6 flex flex-col gap-4 rounded-2xl bg-surface p-4 sm:p-5" aria-label="Filtrar ejercicios">
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-0 basis-full sm:flex-1"><label htmlFor="search" className="mb-1.5 block text-xs text-muted-foreground">Buscar ejercicios</label><div className="relative"><Search className="absolute top-3.5 left-3 size-4 text-muted-foreground md:top-3" aria-hidden="true" /><input id="search" name="q" type="search" defaultValue={query} className="field pl-9" placeholder="Título o concepto…" maxLength={100} /></div></div>
      <div className="w-full sm:w-40"><label htmlFor="language" className="mb-1.5 block text-xs text-muted-foreground">Lenguaje</label><select id="language" name="lenguaje" defaultValue={language} className="field">{languages.map(language => <option key={language} value={language}>{languageNames[language]}</option>)}</select></div>
      <Button type="button" variant="outline" className="md:hidden" aria-expanded={expanded} aria-controls="exercise-filter-options" onClick={() => setExpanded(!expanded)}><SlidersHorizontal />Filtros{count > 0 && ` (${count})`}</Button>
    </div>
    <div id="exercise-filter-options" className="filter-disclosure" data-expanded={expanded}><div className="filter-disclosure-content flex flex-col gap-3 md:flex-row md:flex-wrap">
      <div className="min-w-0 md:w-44"><label htmlFor="level" className="mb-1.5 block text-xs text-muted-foreground">Nivel</label><select id="level" name="nivel" defaultValue={level} className="field"><option value="">Todos los niveles</option>{Object.entries(levelNames).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></div>
      <div className="min-w-0 md:w-52"><label htmlFor="category" className="mb-1.5 block text-xs text-muted-foreground">Categoría</label><select id="category" name="categoria" defaultValue={category} className="field"><option value="">Todas las categorías</option>{categories.map(c => <option key={c}>{c}</option>)}</select></div>
      <div className="min-w-0 md:w-44"><label htmlFor="status" className="mb-1.5 block text-xs text-muted-foreground">Estado</label><select id="status" name="estado" defaultValue={status} className="field"><option value="">Todos los estados</option><option value="pendientes">Pendientes</option><option value="resueltos">Resueltos</option><option value="en-progreso">En progreso</option></select></div>
    </div></div>
    <SearchButton />
  </Form>;
}
