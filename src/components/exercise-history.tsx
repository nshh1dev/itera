"use client";
import Link from "next/link";
import { useState } from "react";
import { ChevronDown, ArrowRight } from "lucide-react";
import { getExerciseAttempts } from "@/server/actions";
import { Disclosure } from "@/components/arc/disclosure";
import { Button } from "@/components/ui/button";
import type { Language } from "@/lib/types";
import { exerciseHref } from "@/lib/learning-paths";

type Attempts = Awaited<ReturnType<typeof getExerciseAttempts>>["entries"];
export function ExerciseHistory({ exerciseId, title, slug, language, solved, count, date, lastResult }: { exerciseId: string; title: string; slug: string; language: Language; solved: boolean; count: number; date: string; lastResult: string }) {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<Attempts>([]);
  const [more, setMore] = useState(true);
  const [page, setPage] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function load() {
    if (busy) return;
    setBusy(true); setError("");
    try {
      const response = await getExerciseAttempts({ exerciseId, language, page });
      if ("error" in response) setError(response.error ?? "No se pudo cargar el historial.");
      else { setEntries(previous => [...previous, ...response.entries]); setMore(response.more); setPage(previous => previous + 1); }
    } catch { setError("No se pudo cargar el historial. Vuelve a intentarlo."); }
    finally { setBusy(false); }
  }
  const contentId = `history-${exerciseId}`;
  const dateLabel = (value: string) => new Intl.DateTimeFormat("es", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
  return <article className="py-3">
    <button className="flex min-h-11 w-full items-start gap-3 rounded-lg p-3 text-left hover:bg-selection" aria-expanded={open} aria-controls={contentId} onClick={() => { setOpen(!open); if (!open && !entries.length) void load(); }}>
      <span className="min-w-0 flex-1"><span className="block text-sm font-medium">{title}</span><span className="mt-1 block text-xs text-muted-foreground">{solved ? "Resuelto" : "En progreso"} · {count} {count === 1 ? "intento" : "intentos"}</span><span className="mt-1 block text-xs text-muted-foreground">Último intento · {lastResult}</span><time dateTime={date} className="mt-1 block text-xs text-muted-foreground">{dateLabel(date)}</time></span><ChevronDown className="mt-1 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
    </button>
    <div id={contentId} hidden={!open} className="px-3 pb-3" aria-busy={busy}>
      <Link href={exerciseHref(slug, language)} className="text-link my-3 text-sm">Abrir ejercicio<ArrowRight className="size-4" aria-hidden="true" /></Link>
      <p className="text-xs leading-6 text-muted-foreground">{solved ? "La finalización se conserva aunque un intento posterior falle." : "Ejecutar ejemplos no marca el ejercicio como resuelto."}</p>
      {entries.map((entry, index) => <Disclosure key={entry.id} title={<span className="flex flex-wrap gap-x-3 gap-y-1"><span>{entry.mode === "submit" ? "Comprobación" : "Ejemplos"} · {entry.status === "PASSED" ? "Pruebas superadas" : entry.status === "FAILED" ? "Pruebas no superadas" : entry.status === "RUNNING" ? "En evaluación" : "Evaluación interrumpida"}{index === 0 ? " · Último intento" : ""}</span><time dateTime={entry.createdAt} className="text-xs font-normal text-muted-foreground">{dateLabel(entry.createdAt)}</time></span>}>
        <p className="text-sm text-muted-foreground">{entry.passedCount} de {entry.totalCount} pruebas superadas · Versión {entry.variant.version.number}</p><pre className="code-block mt-3" tabIndex={0} aria-label={`Código del intento del ${dateLabel(entry.createdAt)}`}><code>{entry.code}</code></pre>
      </Disclosure>)}
      {error && <p role="alert" className="my-3 text-sm text-destructive">{error}</p>}
      {busy && <p role="status" className="py-3 text-sm text-muted-foreground">Cargando intentos…</p>}
      {(more || error) && <Button variant="secondary" className="mt-3" disabled={busy} onClick={() => void load()}>{error ? "Reintentar" : "Ver más intentos"}</Button>}
    </div>
  </article>;
}
