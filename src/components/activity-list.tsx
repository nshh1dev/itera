import Link from "next/link";
import { Check, Circle, Clock3 } from "lucide-react";
import { languageNames, type Language } from "@/lib/types";

export type Activity = { id: string; status: string; mode: string; createdAt: Date; passedCount: number; totalCount: number; variant: { language: string; version: { title: string; exercise: { slug: string } } } };

export function ActivityList({ entries, compact = false }: { entries: Activity[]; compact?: boolean }) {
  if (!entries.length) return <div className="flex flex-col items-start gap-2 py-5">
    <span className="mb-1 flex size-9 items-center justify-center rounded-lg bg-surface-secondary"><Clock3 className="size-4 text-muted-foreground" aria-hidden="true" /></span>
    <p className="text-sm">Todavía no hay actividad.</p>
    <p className="text-xs leading-6 text-muted-foreground">Tus ejecuciones y comprobaciones aparecerán aquí.</p>
    <Link href="/ejercicios" className="text-link mt-1 text-xs">Elegir un ejercicio</Link>
  </div>;
  return <ul className={compact ? "flex flex-col gap-1" : "flex max-w-4xl flex-col gap-2"}>{entries.map(item => {
    const solved = item.status === "PASSED" && item.mode === "submit";
    const status = item.status === "PASSED" ? solved ? "Resuelto" : "Ejemplos correctos" : item.status === "FAILED" ? `${item.passedCount}/${item.totalCount} pruebas` : item.status === "RUNNING" ? "En proceso" : "Sin evaluar";
    return <li key={item.id}><Link href={`/ejercicios/${item.variant.version.exercise.slug}?lenguaje=${item.variant.language}`} className="list-entry items-start gap-3">
      {solved ? <Check className="mt-0.5 size-4 shrink-0 text-success-text" aria-hidden="true" /> : <Circle className="mt-1 size-3 shrink-0 text-muted-foreground" aria-hidden="true" />}
      <div className="min-w-0 flex-1"><p className="text-sm font-medium">{item.variant.version.title}</p><p className="mt-1 text-xs text-muted-foreground">{languageNames[item.variant.language as Language]} · {item.mode === "submit" ? "Comprobación" : "Ejemplos"}</p><p className="mt-1.5 text-xs text-muted-foreground">{status}</p></div>
      <div className="shrink-0 text-right"><time dateTime={item.createdAt.toISOString()} className="mt-1 block text-xs text-muted-foreground">{new Intl.DateTimeFormat("es", { day: "numeric", month: "short", timeZone: "UTC" }).format(item.createdAt)}</time></div>
    </Link></li>;
  })}</ul>;
}
