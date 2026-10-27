"use client";
import Link from "next/link";
import { Check, CircleX, Loader2, Terminal, LockKeyhole, ArrowRight, Info, ChevronDown, ChevronUp } from "lucide-react";
import { memo, useId } from "react";
import type { ExecutionResult, Json, RuntimeMode } from "@/lib/types";
import { firstDifference, firstTextDifference } from "@/lib/json-diff";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MotionRegion } from "@/components/motion-region";
import { Disclosure } from "@/components/arc/disclosure";
import { executionFeedback } from "@/lib/execution-feedback";

export const Results = memo(function Results({ result, busy, error, notice, nextHref, nextLabel = "Practicar un ejercicio relacionado", collapsed = false, onToggle, runtimeMode = "FUNCTION", diagnostic = false }: { result: ExecutionResult | null; busy: boolean; error: string; notice?: string; nextHref?: string; nextLabel?: string; collapsed?: boolean; onToggle?: () => void; runtimeMode?: RuntimeMode; diagnostic?: boolean }) {
  const contentId = useId();
  const visible = result?.results.filter(test => test.visible) ?? [];
  const singleProgram = runtimeMode === "PROGRAM" && result?.mode !== "tests" && visible.length === 1 && !visible[0].expectedFiles?.length && !visible[0].actualFiles?.length;
  const output = singleProgram ? visible[0].output ?? ("actual" in visible[0] ? String(visible[0].actual ?? "") : undefined) : undefined;
  return <section aria-label="Resultados de ejecución">
    <div className="results-toolbar flex h-[42px] items-center gap-2 px-4 text-xs font-medium">
      <Terminal className="size-3.5 text-muted-foreground" aria-hidden="true" />Resultados
      <span className="ml-auto font-normal text-muted-foreground">{busy ? "Evaluando…" : error ? "No se pudo ejecutar" : result ? result.mode === "tests" ? "Archivo de pruebas" : `${result.passedCount} / ${result.totalCount} pruebas` : "Sin ejecuciones"}</span>
      {onToggle && <Button variant="ghost" size="icon" className="hidden min-[1200px]:inline-flex" aria-label={collapsed ? "Expandir resultados" : "Contraer resultados"} aria-expanded={!collapsed} aria-controls={contentId} title={collapsed ? "Expandir resultados" : "Contraer resultados"} onClick={onToggle}>{collapsed ? <ChevronUp /> : <ChevronDown />}</Button>}
    </div>
    <div id={contentId} className={cn("p-4", collapsed && "min-[1200px]:hidden")}>
      {notice && <p role="status" className="mb-3 text-sm leading-6">{notice}</p>}
       <p role="status" className="sr-only">{busy ? "Evaluando tu solución." : error ? "No se pudo ejecutar el programa." : result ? `${result.status === "ERROR" ? "La evaluación se interrumpió." : result.mode === "tests" ? result.status === "PASSED" ? "El archivo de pruebas propias terminó correctamente; esto no certifica su cobertura ni concede progreso." : "Las pruebas propias encontraron un fallo. No concede progreso." : result.status === "PASSED" ? result.mode === "submit" ? diagnostic ? "Reto de diagnóstico superado. No concede progreso." : "Ejercicio resuelto. Progreso guardado." : "Los ejemplos funcionan." : "Revisa tu solución."} ${result.mode === "tests" ? "" : `${result.passedCount} de ${result.totalCount} pruebas superadas.`}` : ""}</p>
      <MotionRegion motionKey={busy ? "busy" : error || (result ? `${result.status}:${result.mode}:${result.passedCount}` : "empty")}>
      {busy ? <div className="flex items-center gap-3 py-4"><Loader2 className="size-5 shrink-0 arc-spin text-primary" aria-hidden="true" /><p className="text-sm font-medium">Probando tu idea…</p></div>
        : error ? <div className="rounded-lg bg-surface p-3"><div className="flex items-center gap-2 text-sm font-medium"><Info className="size-4 text-destructive" aria-hidden="true" />No pudimos ejecutar el programa</div><p className="mt-2 text-sm leading-6 text-muted-foreground">{error}</p><p className="mt-3 text-xs text-muted-foreground">Puedes seguir escribiendo, explorar pistas o consultar la solución.</p></div>
        : !result ? <div className="py-4"><p className="text-sm">Aquí verás el resultado de tu código.</p><p className="mt-2 text-xs leading-6 text-muted-foreground">{diagnostic ? "Pulsa «Comprobar respuesta» cuando quieras probarlo." : "Pulsa «Comprobar solución» cuando quieras probarlo."}</p></div>
        : <>
          {output !== undefined && <div className="mb-4"><h3 className="text-xs font-medium text-muted-foreground">Salida de tu programa</h3><pre className="mt-2 overflow-x-auto rounded-lg bg-surface-inset p-3 font-mono text-sm">{output.length ? output : "(el programa no mostró nada)"}</pre></div>}
          <div className="flex items-start gap-2.5">
            {result.status === "PASSED" ? <Check className="mt-0.5 size-5 shrink-0 text-success-text" aria-hidden="true" /> : result.status === "ERROR" ? <Info className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden="true" /> : <CircleX className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />}
             <div><h3 className="text-sm font-medium">{result.mode === "tests" ? result.status === "PASSED" ? "Tus pruebas terminaron correctamente." : result.results[0]?.status === "assertion" ? "Falló una aserción." : result.status === "ERROR" ? "La ejecución de pruebas se interrumpió." : "El archivo de pruebas produjo un error." : result.status === "PASSED" ? result.mode === "submit" ? diagnostic ? "Reto de diagnóstico superado." : "Un paso más. Ejercicio resuelto." : "Los ejemplos funcionan." : result.status === "ERROR" ? "La evaluación se interrumpió." : result.message && result.passedCount === result.totalCount ? "La salida coincide; falta aplicar el concepto." : "Tu solución todavía puede mejorar."}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{result.mode === "tests" ? result.message || "Este resultado solo confirma cómo terminó tu archivo público de pruebas; no comprueba cobertura ni guarda progreso." : result.status === "PASSED" ? result.mode === "submit" ? diagnostic ? "Este resultado orienta tu recomendación; no completa el ejercicio de práctica." : "Tu progreso está guardado. Quédate con lo que aprendiste." : "Comprobar solución revisa todos los casos y, en prácticas guiadas, el concepto solicitado. Ejecutar ejemplos no completa el ejercicio." : result.message || "Revisa el resultado y prueba una nueva idea."}</p></div>
          </div>
          <div className="mt-4 flex flex-col gap-2">{visible.filter(test => !singleProgram || !test.passed).map((test, visibleIndex) => {
            const asText = runtimeMode === "PROGRAM";
            const plain = (value: Json | undefined) => String(value ?? "");
            const diff = !test.passed && "actual" in test
              ? asText
                ? test.status === "wrong" && typeof test.actual === "string" ? firstTextDifference(plain(test.expected), test.actual) : null
                : firstDifference(test.expected as Json, test.actual as Json)
              : null;
            return <Disclosure key={test.index} defaultOpen={!test.passed || visibleIndex === 0 && visible.length === 1} className="result-case rounded-lg bg-control px-3" triggerClassName="text-xs" title={<>
              {test.passed ? <Check className="size-3.5 shrink-0 text-success-text" aria-hidden="true" /> : <CircleX className="size-3.5 shrink-0 text-destructive" aria-hidden="true" />}{result.mode === "tests" ? "Archivo de pruebas" : singleProgram ? "Qué debes revisar" : `Comprobación ${test.index}`}
              <span className="ml-auto text-right text-muted-foreground">{test.passed ? result.mode === "tests" ? "Terminó con éxito" : "Correcto" : test.status === "timeout" ? "Límite de tiempo" : test.status === "assertion" ? "Falló una aserción" : test.status === "runtime" ? "Error de ejecución" : asText ? "La salida no coincide" : "Resultado diferente"}</span>
            </>}>
            <div className="mb-3 flex min-w-0 flex-col gap-3 rounded-lg bg-surface-inset p-3 text-xs">
              {asText ? <>
                {plain(test.input).length > 0 && <div><span className="text-muted-foreground">Entrada</span><pre className="mt-1 overflow-x-auto font-mono">{plain(test.input)}</pre></div>}
                <div className="result-comparison">
                  {!singleProgram && "actual" in test && <div className="result-value"><span className="text-muted-foreground">Salida de tu programa</span><pre>{test.output ?? plain(test.actual)}</pre></div>}
                  <div className="result-value"><span className="text-muted-foreground">Salida esperada</span><pre>{plain(test.expected)}</pre></div>
                </div>
              </> : <>
                <div><span className="text-muted-foreground">Entrada</span><pre className="mt-1 overflow-x-auto font-mono">{JSON.stringify(test.input)}</pre></div>
                <div className="result-comparison">
                  {"actual" in test && <div className="result-value"><span className="text-muted-foreground">Tu resultado</span><pre>{JSON.stringify(test.actual)}</pre></div>}
                  <div className="result-value"><span className="text-muted-foreground">Resultado esperado</span><pre>{JSON.stringify(test.expected)}</pre></div>
                </div>
                {test.output !== undefined && <div><span className="text-muted-foreground">Salida del programa</span><pre className="mt-1 overflow-x-auto font-mono">{test.output.length ? test.output : "(sin salida)"}</pre></div>}
              </>}
              {(test.expectedFiles?.length || test.actualFiles?.length) ? <div className="grid gap-3 sm:grid-cols-2">
                {test.expectedFiles?.length ? <div><span className="text-muted-foreground">Archivos esperados</span>{test.expectedFiles.map(file=><div key={file.path} className="mt-2"><p className="font-mono">{file.path}</p><pre className="mt-1 overflow-x-auto whitespace-pre-wrap break-all">{file.content}</pre></div>)}</div> : null}
                {test.actualFiles?.length ? <div><span className="text-muted-foreground">Archivos generados</span>{test.actualFiles.map(file=><div key={file.path} className="mt-2"><p className="font-mono">{file.path}</p><pre className="mt-1 overflow-x-auto whitespace-pre-wrap break-all">{file.content}</pre></div>)}</div> : null}
              </div> : null}
              {diff && <div className="flex items-start gap-2 rounded-lg bg-surface p-2.5"><Info className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" /><div className="min-w-0 flex-1 break-words"><span className="text-muted-foreground">Primera diferencia</span><p className="mt-1 leading-6">{diff.message}</p></div></div>}
              {!test.passed && <p className="text-sm leading-6 text-muted-foreground">{executionFeedback(test.status, test.error)}</p>}
              {test.error && <Disclosure title="Detalle del error"><pre className="max-h-44 overflow-auto font-mono leading-6 whitespace-pre-wrap text-destructive">{test.error}</pre></Disclosure>}
            </div>
          </Disclosure>; })}</div>
          {result.results.some(r => !r.visible) && <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground"><LockKeyhole className="size-3.5 shrink-0" aria-hidden="true" />{result.results.filter(r => !r.visible && r.passed).length} de {result.results.filter(r => !r.visible).length} pruebas ocultas superadas</p>}
          {result.status === "PASSED" && result.mode === "submit" && nextHref && <Link className="text-link mt-4 text-xs" href={nextHref}>{nextLabel}<ArrowRight className="size-3.5" /></Link>}
        </>}
      </MotionRegion>
    </div>
  </section>;
});
