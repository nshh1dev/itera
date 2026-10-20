"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowLeft, ArrowRight, ChevronLeft, Play, Check, Lightbulb, Code2, Clock3, ChevronRight, BookOpen, GripVertical, GripHorizontal } from "lucide-react";
import type { ExecutionResult, Language, Level, RuntimeMode } from "@/lib/types";
import { activityNames, type ActivityType } from "@/lib/types";
import { languageNames, levelNames } from "@/lib/types";
import { cn } from "@/lib/utils";
import { exerciseHref } from "@/lib/learning-paths";
import { uniqueHelp } from "@/lib/learning-help";
import { saveDraft, recordHint, revealSolution, rememberPractice } from "@/server/actions";
import { Button } from "@/components/ui/button";
import { MotionReveal } from "@/components/motion-reveal";
import { AppShell, type ShellUser } from "@/components/app-shell";
import { Results } from "./results";
import { Statement } from "./statement";
import { LearningGuide, type PreviousExercise } from "./learning-guide";
import { Examples, type PublicExample } from "./examples";
import { EditorOptions } from "./editor-options";
import { ExerciseNotes } from "./exercise-notes";
import type { Activity } from "@/components/activity-list";
import { Badge } from "@/components/ui/badge";
import { ModuleLesson, type Lesson } from "./module-lesson";
import { usePanelSize } from "./use-panel-size";
import { Disclosure } from "@/components/arc/disclosure";
import { Selection } from "@/components/arc/selection";
import { LayoutGroup } from "motion/react";

const CodeEditor = dynamic(() => import("./code-editor"), { ssr: false, loading: () => <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Preparando tu editor…</div> });
const subscribe = () => () => {};
const settingsKey = "itera:workspace";
// Preferencias de la interfaz compartidas por todos los ejercicios. Se leen y
// escriben solo en el cliente, cuando el espacio ya está hidratado.
function readLayout() {
  const fallback = { simple: false, fontSize: 14, width: 35, resultsHeight: 240 };
  try {
    const saved = JSON.parse(localStorage.getItem(settingsKey) ?? "null") as Record<string, unknown> | null;
    const number = (value: unknown, min: number, max: number, initial: number) => typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : initial;
    return { simple: saved?.simple === true, fontSize: number(saved?.fontSize, 12, 22, 14), width: number(saved?.width, 28, 55, 35), resultsHeight: number(saved?.resultsHeight, 140, 400, 240) };
  } catch { return fallback; }
}
type Props = { userId?: string; user: ShellUser | null; slug: string; title: string; category: string; level: Level; minutes: number; statement: string; objective: string; prerequisites: string[]; practiceGoals: string[]; previousExercises: PreviousExercise[]; activityType: ActivityType; constraints: string[]; hints: string[]; complexity: string; commonErrors: string[]; recentSubmissions: Activity[]; language: Language; availableLanguages: Language[]; lesson?: Lesson; runtimeMode: RuntimeMode; variantId: string; starter: string; initialCode: string; revision: number; examples: PublicExample[]; nextHref?: string; previousHref?: string; position: number; total: number; pathSlug?: string };
type LocalDraft = { code: string; revision: number };

export function Workspace(props: Props) {
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  if (!hydrated) return <AppShell user={props.user} workspace header={<p className="text-sm font-medium">{props.title}</p>}>
    <main id="main-content" className="workspace-main">
      <div className="workspace-mobile-tabs" aria-hidden="true"><span className="flex min-h-11 flex-1 items-center justify-center text-sm">Enunciado</span><span className="flex min-h-11 flex-1 items-center justify-center text-sm">Código</span><span className="flex min-h-11 flex-1 items-center justify-center text-sm">Resultados</span></div>
      <div className="workspace-grid" style={{ "--statement-width": "35%" } as React.CSSProperties}>
        <section className="workspace-statement px-5 py-6 sm:px-7" aria-label="Enunciado"><Challenge exercise={props} /></section>
        <div className="hidden min-[1200px]:block" />
        <div className="workspace-editor-column"><p role="status" className="p-5 text-sm text-muted-foreground">Preparando tu editor…</p></div>
      </div>
    </main>
  </AppShell>;
  return <WorkspaceReady key={props.variantId} {...props} />;
}

function WorkspaceReady(props: Props) {
  const router = useRouter();
  const [showCommonErrors, setShowCommonErrors] = useState(false);
  const commonErrors = uniqueHelp(props.commonErrors, props.hints);
  const storageKey = `itera:draft:${props.userId ?? "guest"}:${props.variantId}`;
  const executionKey = `itera:execution:${props.userId ?? "guest"}:${props.variantId}`;
  const transferKey = `itera:transfer:${props.variantId}`;
  const [code, setCode] = useState(() => {
    if (props.userId && props.revision === 0) {
      try { const transferred = sessionStorage.getItem(transferKey); if (transferred !== null && transferred.length <= 30000) return transferred; } catch {}
    }
    try { const saved: LocalDraft = JSON.parse(localStorage.getItem(storageKey) ?? "null"); if (saved && typeof saved.code === "string" && saved.code.length <= 30000 && saved.revision >= props.revision) return saved.code; } catch {}
    return props.initialCode;
  });
  const codeRef = useRef(code);
  const revision = useRef(props.revision);
  const lastSaved = useRef(props.initialCode);
  const saving = useRef(false);
  const conflict = useRef(false);
  const retryDelay = useRef(900);
  const [saveTick, setSaveTick] = useState(0);
  const [saveState, setSaveState] = useState(props.userId ? code === props.initialCode ? "Guardado" : "Pendiente de sincronizar" : "En este navegador");
  const [saveError, setSaveError] = useState("");
  const [mobileTab, setMobileTab] = useState("statement");
  const [layout] = useState(readLayout);
  const [simple, setSimple] = useState(layout.simple);
  const [fontSize, setFontSize] = useState(layout.fontSize);
  const statementSize = usePanelSize(layout.width, 28, 55);
  const resultSize = usePanelSize(layout.resultsHeight, 140, 400);
  const width = statementSize.value;
  const resultsHeight = resultSize.value;
  const savedWidth = statementSize.committed;
  const savedResultsHeight = resultSize.committed;
  const [resultsCollapsed, setResultsCollapsed] = useState(false);
  const toggleResults = useCallback(() => setResultsCollapsed(value => !value), []);
  const codePanel = useRef<HTMLDivElement>(null);
  const [focusCodeRequest, setFocusCodeRequest] = useState(0);
  const grid = useRef<HTMLDivElement>(null);
  const editorColumn = useRef<HTMLDivElement>(null);
  const [posting, setPosting] = useState(false);
  const postingRef = useRef(false);
  const [activeId, setActiveId] = useState<string | null>(() => { try { return localStorage.getItem(executionKey); } catch { return null; } });
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [error, setError] = useState("");
  const [executedCode, setExecutedCode] = useState<string | null>(null);
  const [hintCount, setHintCount] = useState(0);
  const [solution, setSolution] = useState<{ code?: string; explanation?: string; error?: string } | null>(null);
  const [solutionBusy, setSolutionBusy] = useState(false);
  const busy = posting || !!activeId;

  useEffect(() => {
    if (props.userId) void rememberPractice({ variantId: props.variantId, language: props.language, pathSlug: props.pathSlug }).catch(() => setSaveError("No se pudo guardar dónde continuar. Tu código se conserva por separado."));
  }, [props.userId, props.variantId, props.language, props.pathSlug]);

  useEffect(() => { if (props.userId) { try { sessionStorage.removeItem(transferKey); } catch {} } }, [props.userId, transferKey]);
  useEffect(() => { try { localStorage.setItem(settingsKey, JSON.stringify({ simple, fontSize, width: savedWidth, resultsHeight: savedResultsHeight })); } catch {} }, [simple, fontSize, savedWidth, savedResultsHeight]);
  useEffect(() => {
    if (focusCodeRequest && mobileTab === "code") {
      // El panel es un destino estable incluso mientras Monaco se descarga.
      const target = codePanel.current?.querySelector<HTMLTextAreaElement>("textarea");
      (target ?? codePanel.current)?.focus();
    }
  }, [focusCodeRequest, mobileTab]);

  function preserveGuestCode() {
    if (!props.userId) { try { sessionStorage.setItem(transferKey, codeRef.current); } catch {} }
  }

  function updateCode(value: string) {
    if (value.length > 30000) { setSaveError("El editor admite hasta 30 000 caracteres."); return; }
    codeRef.current = value; setCode(value);
    try { localStorage.setItem(storageKey, JSON.stringify({ code: value, revision: revision.current })); }
    catch { setSaveError("El navegador no pudo guardar la copia local. Copia tu código antes de cerrar."); }
    if (props.userId && !conflict.current) setSaveState("Pendiente de sincronizar");
  }

  useEffect(() => {
    if (!props.userId || conflict.current || code === lastSaved.current) return;
    const timer = setTimeout(async () => {
      if (saving.current) return;
      saving.current = true; setSaveState("Guardando…");
      try {
        const saved = await saveDraft({ variantId: props.variantId, code, revision: revision.current });
        if ("revision" in saved && saved.revision !== undefined) {
          revision.current = saved.revision; lastSaved.current = code; retryDelay.current = 900;
          setSaveState(codeRef.current === code ? "Guardado" : "Pendiente de sincronizar");
          try { localStorage.setItem(storageKey, JSON.stringify({ code: codeRef.current, revision: revision.current })); }
          catch { setSaveError("El código está en la base de datos, pero no se pudo actualizar la copia del navegador."); }
        } else { setSaveError(saved.error ?? "No se pudo guardar."); setSaveState("Copia local"); conflict.current = true; }
      } catch { retryDelay.current = Math.min(retryDelay.current * 2, 30000); setSaveState("Copia local"); setSaveError("Sin conexión con la base de datos. Conservamos una copia en este navegador."); }
      finally { saving.current = false; setSaveTick(t => t + 1); }
    }, retryDelay.current);
    return () => clearTimeout(timer);
  }, [code, saveTick, props.userId, props.variantId, storageKey]);

  useEffect(() => {
    if (!activeId) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    let count = 0;
    async function poll() {
      try {
        const response = await fetch(`/api/executions/${encodeURIComponent(activeId!)}`, { cache: "no-store", signal: AbortSignal.timeout(8000) });
        const payload = await response.json();
        if (stopped) return;
        if (!response.ok) throw new Error(payload.error || "No pudimos consultar el resultado.");
        if (payload.status !== "RUNNING") {
          setResult(payload); setActiveId(null); localStorage.removeItem(executionKey); router.refresh(); return;
        }
        if (++count > 90) throw new Error("La evaluación sigue pendiente. Recarga para consultar el resultado.");
        timer = setTimeout(poll, Math.min(800 + count * 100, 2000));
      } catch (error) {
        if (!stopped) { setError(error instanceof Error ? error.message : "Se perdió la conexión."); setActiveId(null); }
      }
    }
    timer = setTimeout(poll, 300);
    return () => { stopped = true; clearTimeout(timer); };
  }, [activeId, executionKey, router]);

  async function execute(mode: "examples" | "submit") {
    if (postingRef.current || activeId) return;
    if (!props.userId) { preserveGuestCode(); router.push(`/iniciar-sesion?volver=${encodeURIComponent(exerciseHref(props.slug, props.language, props.pathSlug))}`); return; }
    postingRef.current = true; setPosting(true); setError(""); setResult(null); setMobileTab("results"); setResultsCollapsed(false); setExecutedCode(codeRef.current);
    try {
      const response = await fetch("/api/executions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ variantId: props.variantId, code: codeRef.current, mode, idempotencyKey: crypto.randomUUID() }), signal: AbortSignal.timeout(15000) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "No se pudo iniciar la ejecución.");
      setActiveId(payload.id); localStorage.setItem(executionKey, payload.id);
    } catch (error) { setError(error instanceof Error ? error.message : "No se pudo conectar con el ejecutor."); }
    finally { postingRef.current = false; setPosting(false); }
  }

  return <AppShell user={props.user} workspace header={
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <Link href={props.pathSlug ? `/rutas/${encodeURIComponent(props.pathSlug)}?lenguaje=${props.language}` : `/ejercicios?lenguaje=${props.language}`} className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground hover:text-foreground" aria-label={props.pathSlug ? "Volver a la ruta" : "Volver a ejercicios"}><ArrowLeft className="size-4" /><span className="hidden sm:inline">{props.pathSlug ? "Mi ruta" : "Ejercicios"}</span></Link>
          <ChevronRight className="hidden size-3 shrink-0 text-muted-foreground sm:block" /><span className="min-w-0 flex-1 truncate text-sm font-medium" title={props.title}>{props.title}</span>
         <div className="ml-auto flex shrink-0 items-center gap-1">
            {props.pathSlug && props.position > 0 && <span className="px-1 text-xs tabular-nums text-muted-foreground"><span className="sr-only">Ejercicio </span>{props.position} de {props.total}</span>}
           <nav aria-label="Navegación entre ejercicios" className="flex items-center">
             {props.previousHref ? <Button asChild variant="ghost" size="icon" className="size-8"><Link href={props.previousHref} aria-label="Ejercicio anterior" title="Ejercicio anterior"><ChevronLeft /></Link></Button> : <Button variant="ghost" size="icon" className="size-8" disabled aria-label="No hay ejercicio anterior" title="No hay ejercicio anterior"><ChevronLeft /></Button>}
             {props.nextHref ? <Button asChild variant="ghost" size="icon" className="size-8"><Link href={props.nextHref} aria-label="Ejercicio siguiente" title="Ejercicio siguiente"><ChevronRight /></Link></Button> : <Button variant="ghost" size="icon" className="size-8" disabled aria-label="No hay ejercicio siguiente" title="No hay ejercicio siguiente"><ChevronRight /></Button>}
           </nav>
           {!props.userId && <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex"><Link onClick={preserveGuestCode} href={`/registro?volver=${encodeURIComponent(exerciseHref(props.slug, props.language, props.pathSlug))}`}>Guardar mi progreso</Link></Button>}
         </div>
      </div>
    }>
    <main id="main-content" className="workspace-main">
      <p className="sr-only" role="status">Borrador: {saveError || saveState}</p>
      <LayoutGroup id="workspace-sections"><div className="workspace-mobile-tabs" role="group" aria-label="Secciones del ejercicio">{[{id:"statement",name:"Enunciado"},{id:"code",name:"Código"},{id:"results",name:"Resultados"}].map(tab=><button className="relative isolate" key={tab.id} onClick={()=>setMobileTab(tab.id)} aria-pressed={mobileTab === tab.id} aria-controls={`workspace-${tab.id}`}>{mobileTab === tab.id && <Selection id="workspace-selection" className="bg-control shadow-control" />}{tab.name}</button>)}</div></LayoutGroup>
      <div ref={grid} className="workspace-grid" style={{"--statement-width":`${width}%`} as React.CSSProperties}>
        <section id="workspace-statement" className={cn("workspace-statement px-5 py-6 sm:px-7 min-[1200px]:block", mobileTab !== "statement" && "hidden")} aria-label="Enunciado">
          <Challenge exercise={props} />
          <Button variant="outline" className="mt-6 w-full min-[1200px]:hidden" onClick={()=>{setMobileTab("code");setFocusCodeRequest(value=>value+1);}}>Ir al código<ArrowRight /></Button>
          <div className="workspace-reference">
          <LearningGuide title={props.title} statement={props.statement} objective={props.objective} prerequisites={props.prerequisites} practiceGoals={props.practiceGoals} previousExercises={props.previousExercises}>
            {props.lesson && <ModuleLesson lesson={props.lesson} language={props.language} />}
            {props.complexity.trim() && <ExerciseNotes complexity={props.complexity} commonErrors={[]} />}
          </LearningGuide>
                  <Disclosure title="Pistas progresivas">
                    {hintCount === 0 && props.hints.length > 0 && <p className="py-4 text-base leading-7 text-muted-foreground">Descubre una pista cada vez, solo si la necesitas.</p>}
                    {props.hints.slice(0,hintCount).map((hint,index)=><MotionReveal key={index}><div className="mb-3 rounded-lg bg-surface p-4"><h3 className="text-sm font-medium">Pista {index+1}</h3><p className="mt-2 text-base leading-7">{hint}</p></div></MotionReveal>)}
                    {hintCount < props.hints.length ? <Button variant="secondary" className="mt-3" onClick={()=>{setHintCount(n=>n+1); recordHint(props.variantId,hintCount).catch(()=>setSaveError("No se pudo registrar el uso de la pista."));}}><Lightbulb />{hintCount === 0 ? "Descubrir la primera pista" : "Una pista más"}</Button> : <p className="mt-4 text-sm text-muted-foreground">{props.hints.length ? "Ya tienes todas las pistas. Prueba tu idea en el código." : "Esta versión no tiene pistas publicadas. Puedes consultar la teoría o la solución explicada."}</p>}
                    {commonErrors.length > 0 && (showCommonErrors ? <ExerciseNotes complexity="" commonErrors={commonErrors} /> : <Button variant="ghost" className="mt-3" onClick={() => setShowCommonErrors(true)}>Revisar errores comunes</Button>)}
                  </Disclosure>
                  <Disclosure title="Solución explicada">
                    {solution?.code ? <><p className="whitespace-pre-line text-base leading-7 text-muted-foreground">{solution.explanation}</p><pre className="code-block mt-5 max-h-80">{solution.code}</pre><p className="mt-4 text-sm text-muted-foreground">Leer una solución no marca el ejercicio como resuelto.</p></> : <><p className="text-base leading-7 text-muted-foreground">Consulta una posible solución y entiende cómo funciona. Después, intenta reconstruirla con tus propias palabras y tu propio código.</p>{solution?.error && <p role="alert" className="mt-3 text-sm text-destructive">{solution.error}</p>}<Button className="mt-5" variant="secondary" loading={solutionBusy} onClick={async()=>{setSolutionBusy(true);try{setSolution(await revealSolution(props.variantId));}catch{setSolution({error:"No pudimos cargar la solución. Inténtalo de nuevo."});}finally{setSolutionBusy(false);}}}><BookOpen />Ver solución explicada</Button></>}
                  </Disclosure>
          </div>
          {!props.userId && <Link onClick={preserveGuestCode} href={`/registro?volver=${encodeURIComponent(exerciseHref(props.slug, props.language, props.pathSlug))}`} className="text-link mt-5 text-xs sm:hidden">Guardar mi progreso<ArrowRight className="size-3.5" /></Link>}
        </section>
        <div role="separator" aria-label="Ajustar ancho de los paneles" aria-orientation="vertical" aria-valuenow={width} aria-valuemin={28} aria-valuemax={55} aria-valuetext={`${Math.round(width)} % del ancho`} tabIndex={0} className="panel-resizer hidden cursor-col-resize items-center justify-center min-[1200px]:flex" onKeyDown={event=>{if(event.key==="ArrowLeft"||event.key==="ArrowRight"){event.preventDefault();statementSize.step(event.key==="ArrowRight"?1:-1);}}} onPointerDown={event=>event.currentTarget.setPointerCapture(event.pointerId)} onPointerMove={event=>{if(event.currentTarget.hasPointerCapture(event.pointerId)&&grid.current){const rect=grid.current.getBoundingClientRect();statementSize.move((event.clientX-rect.left)/rect.width*100);}}} onPointerUp={event=>{statementSize.finish();event.currentTarget.releasePointerCapture(event.pointerId);}} onLostPointerCapture={statementSize.finish} onPointerCancel={statementSize.finish}><GripVertical className="size-3 shrink-0 text-muted-foreground" /></div>
        <div ref={editorColumn} className="workspace-editor-column min-w-0" style={{"--results-height":`${resultsHeight}px`} as React.CSSProperties}>
          <div ref={codePanel} id="workspace-code" tabIndex={-1} aria-label="Tu código" className={cn("workspace-code",mobileTab !== "code" && "hidden")}>
            <div className="workspace-toolbar flex min-h-12 shrink-0 flex-wrap items-center gap-2 px-4 py-1"><Code2 className="size-4 text-muted-foreground" /><span className="mr-2 hidden text-sm font-medium sm:inline">Tu solución</span><label className="sr-only" htmlFor="workspace-language">Lenguaje del ejercicio</label><select id="workspace-language" value={props.language} onChange={event=>router.push(exerciseHref(props.slug, event.target.value as Language, props.pathSlug))} className="min-h-11 rounded-md bg-surface-secondary px-2 text-xs font-medium md:min-h-8" disabled={busy}>{props.availableLanguages.map(language => <option key={language} value={language}>{languageNames[language]}</option>)}</select><span className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">{saveState === "Guardado" && <Check className="size-3" />}{saveState}</span><EditorOptions fontSize={fontSize} onFontSize={setFontSize} code={code} onReset={()=>updateCode(props.starter)} /></div>
            {saveError && <p role="alert" className="border-b bg-surface px-4 py-3 text-xs leading-6">{saveError}</p>}
            <div className="editor-region">{simple ? <textarea aria-label={`Editor sencillo de ${languageNames[props.language]}`} className="h-full w-full resize-none bg-editor-background px-5 py-5 font-mono leading-7 focus-visible:-outline-offset-2" style={{fontSize}} value={code} onChange={event=>updateCode(event.target.value)} onKeyDown={event=>{if(event.key === "Enter" && (event.ctrlKey || event.metaKey) && !event.nativeEvent.isComposing){event.preventDefault();if(!event.repeat && code.trim()) void execute(event.shiftKey ? "submit" : "examples");}}} spellCheck={false} autoCapitalize="off" autoCorrect="off" /> : <CodeEditor code={code} language={props.language} onChange={updateCode} fontSize={fontSize} onRun={()=>execute("examples")} onSubmit={()=>execute("submit")} />}</div>
            <div className="workspace-editor-footer flex shrink-0 flex-wrap items-center gap-2 px-4 py-1"><Button variant="ghost" size="sm" className="text-xs" aria-pressed={simple} onClick={()=>setSimple(!simple)}>{simple ? "Usar editor avanzado" : "Editor sencillo"}</Button><Disclosure className="ml-auto text-xs text-muted-foreground" title="Atajos de teclado" triggerClassName="text-xs md:min-h-8"><p className="max-w-sm pb-3 leading-6">Ctrl / ⌘ + Enter: ejecutar ejemplos.<br />Ctrl / ⌘ + Shift + Enter: comprobar solución.{!simple && <><br />Ctrl + M: permitir que Tab salga del editor.</>}</p></Disclosure></div>
          </div>
          <div className={cn("workspace-actions flex shrink-0 flex-wrap items-center justify-end gap-2 px-4 py-3 min-[1200px]:flex",mobileTab === "statement" && "hidden")}>
            <p id="execution-help" className="w-full text-xs leading-6 text-muted-foreground">Solo una comprobación con todas las pruebas superadas marca el ejercicio como resuelto.{!props.userId && " Para ejecutar, inicia sesión. Tu código queda en este navegador."}</p>
            <Button aria-describedby="execution-help" className="min-w-0 flex-1 whitespace-normal px-2 text-xs [&_svg]:hidden min-[380px]:[&_svg]:block sm:flex-none sm:px-3" variant="outline" disabled={busy || !code.trim()} onClick={()=>execute("examples")}><Play data-icon="inline-start" />Ejecutar ejemplos</Button>
            <Button aria-describedby="execution-help" className="min-w-0 flex-1 whitespace-normal px-2 text-xs [&_svg]:hidden min-[380px]:[&_svg]:block sm:flex-none sm:px-3" loading={busy} disabled={!code.trim()} onClick={()=>execute("submit")}><Check data-icon="inline-start" />Comprobar solución</Button>
          </div>
          {!resultsCollapsed && <div role="separator" aria-label="Ajustar altura de resultados" aria-orientation="horizontal" aria-valuenow={resultsHeight} aria-valuemin={140} aria-valuemax={400} aria-valuetext={`${resultsHeight} píxeles`} tabIndex={0} className="panel-resizer hidden h-[7px] shrink-0 cursor-row-resize items-center justify-center min-[1200px]:flex" onKeyDown={event=>{if(event.key==="ArrowUp"||event.key==="ArrowDown"){event.preventDefault();resultSize.step(event.key==="ArrowUp"?20:-20);}}} onPointerDown={event=>event.currentTarget.setPointerCapture(event.pointerId)} onPointerMove={event=>{if(event.currentTarget.hasPointerCapture(event.pointerId)&&editorColumn.current){const rect=editorColumn.current.getBoundingClientRect();resultSize.move(rect.bottom-event.clientY);}}} onPointerUp={event=>{resultSize.finish();event.currentTarget.releasePointerCapture(event.pointerId);}} onLostPointerCapture={resultSize.finish} onPointerCancel={resultSize.finish}><GripHorizontal className="size-3 text-muted-foreground" /></div>}
          <div id="workspace-results" data-collapsed={resultsCollapsed} className={cn("workspace-results min-[1200px]:block",mobileTab !== "results" && "hidden")}><Results result={result} busy={busy} error={error} nextHref={props.nextHref ?? (props.pathSlug ? `/rutas/${encodeURIComponent(props.pathSlug)}?lenguaje=${props.language}` : undefined)} nextLabel={props.pathSlug ? props.nextHref ? "Siguiente ejercicio de la ruta" : "Volver a la ruta" : "Practicar un ejercicio relacionado"} collapsed={resultsCollapsed} onToggle={toggleResults} runtimeMode={props.runtimeMode} recentSubmissions={props.recentSubmissions} />{executedCode !== null && executedCode !== code && (result || error) && <p className={cn("px-5 pb-4 text-xs text-muted-foreground", resultsCollapsed && "min-[1200px]:hidden")}>Has editado el código desde la última ejecución. Vuelve a comprobarlo.</p>}</div>
        </div>
      </div>
    </main>
  </AppShell>;
}

const Challenge = memo(function Challenge({ exercise: props }: { exercise: Props }) {
  return <div className="challenge-sheet">
    <h1 className="text-2xl leading-tight font-semibold tracking-[-0.035em]">{props.title}</h1><div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><Badge>{levelNames[props.level]}</Badge><span>{props.category}</span><span className="flex items-center gap-1.5"><Clock3 className="size-3.5" />{props.minutes} min orientativos</span></div>
    <h2 className="mt-6 text-base font-semibold">Tu reto</h2><Statement text={props.statement} />
    {uniqueHelp(props.constraints, props.statement.split(/\n+/)).length > 0 && <section className="mt-5" aria-label="Condiciones del ejercicio"><h3 className="text-sm font-semibold">Condiciones</h3><ul className="mt-2 list-disc space-y-1 pl-4 text-base leading-7 text-muted-foreground">{uniqueHelp(props.constraints, props.statement.split(/\n+/)).map(constraint => <li key={constraint}>{constraint}</li>)}</ul></section>}
    <p className="mt-4 text-xs font-medium text-muted-foreground">{activityNames[props.activityType]}</p>
    <Examples examples={props.examples} runtimeMode={props.runtimeMode} />
  </div>;
});
