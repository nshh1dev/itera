import Link from "next/link";
import { languageNames, levelNames } from "@/lib/types";
import type { getLearningSummary } from "@/server/learning";

export type LearningSummary = Awaited<ReturnType<typeof getLearningSummary>>;

export function StartingPoint({ summary, saved = false }: { summary: LearningSummary; saved?: boolean }) {
  return <section aria-label="Ruta recomendada" className="space-y-5">
    {saved && <h3 className="text-sm font-medium">Tu punto de partida guardado</h3>}
    <dl className="flex flex-wrap gap-x-8 gap-y-3 text-sm"><div><dt className="text-muted-foreground">Lenguaje</dt><dd className="mt-1 font-medium">{languageNames[summary.language]}</dd></div><div><dt className="text-muted-foreground">Nivel declarado</dt><dd className="mt-1 font-medium">{summary.declaredLevel ? levelNames[summary.declaredLevel] : "Sin elegir"}</dd></div><div><dt className="text-muted-foreground">Nivel sugerido</dt><dd className="mt-1 font-medium">{summary.suggestedLevel ? levelNames[summary.suggestedLevel] : "Sin diagnóstico"}</dd></div></dl>
    <div className="rounded-xl bg-surface-inset p-5 sm:p-6"><h2 className="section-title">{summary.path.title}</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">{summary.reason}</p><p className="mt-3 text-sm leading-6">{summary.path.description}</p></div>
    <p className="text-sm leading-6 text-muted-foreground">Es una orientación, no una certificación. El progreso real solo cambia al completar ejercicios de práctica. <Link href="/rutas" className="text-primary-text hover:underline">Todas las rutas siguen disponibles.</Link></p>
  </section>;
}
