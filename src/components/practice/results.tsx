"use client";
import Link from "next/link";
import { Check, CircleX, Loader2, Terminal, LockKeyhole, ArrowRight, Info, ChevronDown, ChevronUp } from "lucide-react";
import { useId } from "react";
import type { ExecutionResult, Json, RuntimeMode } from "@/lib/types";
import { firstDifference } from "@/lib/json-diff";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Results({ result, busy, error, nextHref, collapsed = false, onToggle, runtimeMode = "FUNCTION" }: { result: ExecutionResult | null; busy: boolean; error: string; nextHref?: string; collapsed?: boolean; onToggle?: () => void; runtimeMode?: RuntimeMode }) {
  const contentId = useId();
  return <section aria-label="Resultados de ejecución">
    <div className="results-toolbar flex h-[42px] items-center gap-2 px-4 text-xs font-medium">
      <Terminal className="size-3.5 text-muted-foreground" aria-hidden="true" />Resultados
      <span className="ml-auto font-normal text-muted-foreground">{busy ? "Evaluando…" : result ? `${result.passedCount} / ${result.totalCount} pruebas` : "Sin ejecuciones"}</span>
      {onToggle && <Button variant="ghost" size="icon" className="hidden min-[1200px]:inline-flex" aria-label={collapsed ? "Expandir resultados" : "Contraer resultados"} aria-expanded={!collapsed} aria-controls={contentId} title={collapsed ? "Expandir resultados" : "Contraer resultados"} onClick={onToggle}>{collapsed ? <ChevronUp /> : <ChevronDown />}</Button>}
    </div>
    <div id={contentId} className={cn("p-4", collapsed && "min-[1200px]:hidden")} aria-live="polite" aria-busy={busy}>
      {busy ? <div className="flex items-center gap-3 py-4"><Loader2 className="size-5 shrink-0 animate-spin text-primary" aria-hidden="true" /><div><p className="text-sm font-medium">Probando tu idea…</p><p className="mt-1 text-xs text-muted-foreground">Ejecutando en el sandbox de tu computadora.</p></div></div>
        : error ? <div className="border-l-2 border-destructive py-1 pl-3"><div className="flex items-center gap-2 text-sm font-medium"><Info className="size-4 text-destructive" aria-hidden="true" />No pudimos ejecutar el programa</div><p className="mt-2 text-sm leading-6 text-muted-foreground">{error}</p><p className="mt-3 text-xs text-muted-foreground">Puedes seguir escribiendo, explorar pistas o consultar la solución.</p></div>
        : !result ? <div className="py-4 text-center"><span className="mx-auto mb-3 flex size-9 items-center justify-center rounded-lg bg-control"><Terminal className="size-4 text-muted-foreground" aria-hidden="true" /></span><p className="text-sm">Todo empieza con un intento.</p><p className="mt-2 text-xs leading-6 text-muted-foreground">Ejecuta los ejemplos para ver cómo se comporta tu código.</p></div>
        : <>
          <div className="flex items-start gap-2.5">
            {result.status === "PASSED" ? <Check className="mt-0.5 size-5 shrink-0 text-success-text" aria-hidden="true" /> : result.status === "ERROR" ? <Info className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden="true" /> : <CircleX className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />}
            <div><h3 className="text-sm font-medium">{result.status === "PASSED" ? result.mode === "submit" ? "Un paso más. Ejercicio resuelto." : "Los ejemplos funcionan." : result.status === "ERROR" ? "La evaluación se interrumpió." : "Tu solución todavía puede mejorar."}</h3><p className="mt-1 text-xs leading-6 text-muted-foreground">{result.status === "PASSED" ? result.mode === "submit" ? "Tu progreso está guardado. Quédate con lo que aprendiste." : "Ahora comprueba tu solución con todos los casos de prueba." : result.status === "ERROR" ? result.message : "Revisa el resultado y prueba una nueva idea."}</p></div>
          </div>
          <div className="mt-4 flex flex-col gap-2">{result.results.filter(r => r.visible).map(test => { const asText = runtimeMode === "PROGRAM"; const diff = !asText && !test.passed && "actual" in test ? firstDifference(test.expected as Json, test.actual as Json) : null; const plain = (value: Json | undefined) => String(value ?? ""); return <details key={test.index} open={!test.passed} className="result-case group rounded-lg bg-control px-3">
            <summary className="flex min-h-11 cursor-pointer items-center gap-2 py-2 text-xs">
              {test.passed ? <Check className="size-3.5 shrink-0 text-success-text" aria-hidden="true" /> : <CircleX className="size-3.5 shrink-0 text-destructive" aria-hidden="true" />}Ejemplo {test.index}
              <span className="ml-auto text-right text-muted-foreground">{test.passed ? "Correcto" : test.status === "timeout" ? "Límite de tiempo" : test.status === "runtime" ? "Error de ejecución" : asText ? "La salida no coincide" : "Resultado diferente"}</span>
              <ChevronDown className="size-3 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true" />
            </summary>
            <div className="mb-3 flex flex-col gap-3 rounded-lg bg-surface-inset p-3 text-xs">
              {asText ? <>
                <div><span className="text-muted-foreground">Entrada</span><pre className="mt-1 overflow-x-auto font-mono">{plain(test.input).length ? plain(test.input) : "(sin entrada)"}</pre></div>
                <div><span className="text-muted-foreground">Salida esperada</span><pre className="mt-1 overflow-x-auto font-mono">{plain(test.expected)}</pre></div>
                {"actual" in test && <div><span className="text-muted-foreground">Salida del programa</span><pre className="mt-1 overflow-x-auto font-mono">{test.output ?? plain(test.actual)}</pre></div>}
              </> : <>
                <div><span className="text-muted-foreground">Entrada</span><pre className="mt-1 overflow-x-auto font-mono">{JSON.stringify(test.input)}</pre></div>
                <div><span className="text-muted-foreground">Esperado</span><pre className="mt-1 overflow-x-auto font-mono">{JSON.stringify(test.expected)}</pre></div>
                {"actual" in test && <div><span className="text-muted-foreground">Tu resultado</span><pre className="mt-1 overflow-x-auto font-mono">{JSON.stringify(test.actual)}</pre></div>}
                {test.output !== undefined && <div><span className="text-muted-foreground">Salida del programa</span><pre className="mt-1 overflow-x-auto font-mono">{test.output.length ? test.output : "(sin salida)"}</pre></div>}
              </>}
              {diff && <div className="flex items-start gap-2 rounded-lg bg-surface p-2.5"><Info className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" /><div><span className="text-muted-foreground">Primera diferencia</span><p className="mt-1 leading-6">{diff.message}</p></div></div>}
              {test.error && <pre className="mt-2 max-h-44 overflow-auto font-mono leading-6 whitespace-pre-wrap text-destructive">{test.error}</pre>}
            </div>
          </details>; })}</div>
          {result.results.some(r => !r.visible) && <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground"><LockKeyhole className="size-3.5 shrink-0" aria-hidden="true" />{result.results.filter(r => !r.visible && r.passed).length} de {result.results.filter(r => !r.visible).length} pruebas ocultas superadas</p>}
          {result.status === "PASSED" && result.mode === "submit" && nextHref && <Link className="text-link mt-4 text-xs" href={nextHref}>Continuar con otro ejercicio<ArrowRight className="size-3.5" /></Link>}
        </>}
    </div>
  </section>;
}
