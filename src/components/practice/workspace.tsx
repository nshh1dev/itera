"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowLeft, ArrowRight, ChevronLeft, Play, Check, Lightbulb, Loader2, Code2, Clock3, ChevronRight, BookOpen, GripVertical, GripHorizontal } from "lucide-react";
import type { ExecutionResult, Language, Level } from "@/lib/types";
import { activityNames, type ActivityType } from "@/lib/types";
import { languageNames, levelNames } from "@/lib/types";
import { cn } from "@/lib/utils";
import { exerciseHref } from "@/lib/learning-paths";
import { saveDraft, recordHint, revealSolution } from "@/server/actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AppShell, type ShellUser } from "@/components/app-shell";
import { Results } from "./results";
import { LearningGuide, type PreviousExercise } from "./learning-guide";
import { Examples, type PublicExample } from "./examples";
import { EditorOptions } from "./editor-options";
import { Badge } from "@/components/ui/badge";

const CodeEditor = dynamic(() => import("./code-editor"), { ssr: false, loading: () => <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Preparando tu editor…</div> });
const subscribe = () => () => {};
type Props = { userId?: string; user: ShellUser | null; slug: string; title: string; category: string; level: Level; minutes: number; statement: string; objective: string; prerequisites: string[]; practiceGoals: string[]; previousExercises: PreviousExercise[]; activityType: ActivityType; constraints: string[]; hints: string[]; language: Language; variantId: string; starter: string; initialCode: string; revision: number; examples: PublicExample[]; nextHref?: string; previousHref?: string; pathSlug?: string };
type LocalDraft = { code: string; revision: number };

export function Workspace(props: Props) {
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  if (!hydrated) return <main id="main-content" className="flex min-h-dvh items-center justify-center text-sm text-muted-foreground">Preparando tu espacio…</main>;
  return <WorkspaceReady key={props.variantId} {...props} />;
}

function WorkspaceReady(props: Props) {
  const router = useRouter();
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
  const [simple, setSimple] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [width, setWidth] = useState(35);
  const [resultsHeight, setResultsHeight] = useState(240);
  const [resultsCollapsed, setResultsCollapsed] = useState(false);
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

  useEffect(() => { if (props.userId) { try { sessionStorage.removeItem(transferKey); } catch {} } }, [props.userId, transferKey]);

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
         <ChevronRight className="hidden size-3 shrink-0 text-muted-foreground sm:block" /><span className="truncate text-[13px] font-medium">{props.title}</span>
         <div className="ml-auto flex shrink-0 items-center gap-1">
           <nav aria-label="Navegación entre ejercicios" className="flex items-center">
             {props.previousHref ? <Button asChild variant="ghost" size="icon" className="size-8"><Link href={props.previousHref} aria-label="Ejercicio anterior" title="Ejercicio anterior"><ChevronLeft /></Link></Button> : <Button variant="ghost" size="icon" className="size-8" disabled aria-label="No hay ejercicio anterior" title="No hay ejercicio anterior"><ChevronLeft /></Button>}
             {props.nextHref ? <Button asChild variant="ghost" size="icon" className="size-8"><Link href={props.nextHref} aria-label="Ejercicio siguiente" title="Ejercicio siguiente"><ChevronRight /></Link></Button> : <Button variant="ghost" size="icon" className="size-8" disabled aria-label="No hay ejercicio siguiente" title="No hay ejercicio siguiente"><ChevronRight /></Button>}
           </nav>
           {!props.userId && <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex"><Link onClick={preserveGuestCode} href={`/registro?volver=${encodeURIComponent(exerciseHref(props.slug, props.language, props.pathSlug))}`}>Guardar mi progreso</Link></Button>}
         </div>
      </div>
    }>
    <main id="main-content" className="workspace-main">
      <div className="workspace-mobile-tabs" role="group" aria-label="Secciones del ejercicio">{[{id:"statement",name:"Enunciado"},{id:"code",name:"Código"},{id:"results",name:"Resultados"}].map(tab=><button key={tab.id} onClick={()=>setMobileTab(tab.id)} aria-pressed={mobileTab === tab.id} aria-controls={`workspace-${tab.id}`}>{tab.name}</button>)}</div>
      <div ref={grid} className="workspace-grid" style={{"--statement-width":`${width}%`} as React.CSSProperties}>
        <section id="workspace-statement" className={cn("workspace-statement px-5 py-6 sm:px-7 min-[1200px]:block", mobileTab !== "statement" && "hidden")} aria-label="Enunciado">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><Badge>{levelNames[props.level]}</Badge><span>{props.category}</span><span className="flex items-center gap-1.5"><Clock3 className="size-3.5" />{props.minutes} min orientativos</span></div><h1 className="mt-5 text-2xl leading-tight font-semibold tracking-[-0.035em]">{props.title}</h1><p className="mt-4 whitespace-pre-line text-[15px] leading-7">{props.statement}</p>
          {props.practiceGoals.length > 0 && <p className="mt-4 text-xs font-medium text-muted-foreground">{activityNames[props.activityType]}</p>}
          <LearningGuide objective={props.objective} prerequisites={props.prerequisites} practiceGoals={props.practiceGoals} previousExercises={props.previousExercises} />
          <Examples examples={props.examples} />
          <details open={props.level === "BEGINNER"} className="mt-6"><summary className="min-h-11 cursor-pointer py-3 text-xs font-medium">Antes de empezar</summary><ul className="mt-1 flex list-disc flex-col gap-2 pl-4 text-xs leading-6 text-muted-foreground">{props.constraints.map((constraint,index)=><li key={index}>{constraint}</li>)}</ul>{props.level === "BEGINNER" && <p className="mt-3 text-xs leading-6 text-muted-foreground">La aplicación llama a solve(data) por ti. Conserva la primera línea de la plantilla y usa return para entregar el resultado. No necesitas leer la entrada ni imprimir la respuesta. {props.language === "python" ? "En Python, los espacios al principio de cada instrucción (la sangría) forman parte del código." : "En JavaScript, conserva las llaves que rodean las instrucciones."} El tiempo indicado es orientativo: puedes tomarte lo que necesites.</p>}</details>
          <div className="mt-7"><Dialog><DialogTrigger asChild><Button variant="secondary" className="w-full justify-between"><span className="flex items-center gap-2"><Lightbulb className="size-4" />Un pequeño empujón</span><ChevronRight /></Button></DialogTrigger><DialogContent className="max-w-xl"><DialogTitle className="pr-6 text-xl font-semibold tracking-tight">Hay más de una forma de avanzar.</DialogTitle><DialogDescription className="mt-2 text-sm leading-6 text-muted-foreground">Empieza por una pista. Dale espacio a tu propia solución.</DialogDescription><Tabs defaultValue="hints" className="mt-6"><TabsList><TabsTrigger value="hints">Pistas</TabsTrigger><TabsTrigger value="solution">Solución explicada</TabsTrigger></TabsList><TabsContent value="hints" className="mt-5">{hintCount === 0 && <p className="py-4 text-sm leading-7 text-muted-foreground">Las pistas van de lo general a lo concreto. Descubre solo lo que necesites.</p>}{props.hints.slice(0,hintCount).map((hint,index)=><div key={index} className="mb-3 rounded-lg bg-surface p-4"><span className="eyebrow">Pista {index+1}</span><p className="mt-2 text-sm leading-7">{hint}</p></div>)}{hintCount < props.hints.length ? <Button variant="secondary" className="mt-3" onClick={()=>{setHintCount(n=>n+1); recordHint(props.variantId,hintCount).catch(()=>setSaveError("No se pudo registrar el uso de la pista."));}}><Lightbulb />{hintCount === 0 ? "Descubrir la primera pista" : "Una pista más"}</Button> : <p className="mt-4 text-xs text-muted-foreground">Ya tienes todas las pistas. Vuelve al código y prueba tu idea.</p>}</TabsContent><TabsContent value="solution" className="mt-5">{solution?.code ? <><p className="whitespace-pre-line text-sm leading-7 text-muted-foreground">{solution.explanation}</p><pre className="code-block mt-5 max-h-80">{solution.code}</pre><p className="mt-4 text-xs text-muted-foreground">Leer una solución no marca el ejercicio como resuelto.</p></> : <><p className="text-sm leading-7 text-muted-foreground">Consulta una posible solución y entiende cómo funciona. Después, intenta reconstruirla con tus propias palabras y tu propio código.</p>{solution?.error && <p role="alert" className="mt-3 text-sm text-destructive">{solution.error}</p>}<Button className="mt-5" variant="secondary" disabled={solutionBusy} onClick={async()=>{setSolutionBusy(true);try{setSolution(await revealSolution(props.variantId));}catch{setSolution({error:"No pudimos cargar la solución. Inténtalo de nuevo."});}finally{setSolutionBusy(false);}}}>{solutionBusy ? <Loader2 className="animate-spin" /> : <BookOpen />}Ver solución explicada</Button></>}</TabsContent></Tabs></DialogContent></Dialog><p className="mt-3 text-center text-[11px] text-muted-foreground">Pedir ayuda también es aprender.</p></div>
          <Button variant="outline" className="mt-6 w-full min-[1200px]:hidden" onClick={()=>setMobileTab("code")}>Ir al código<ArrowRight /></Button>
          {!props.userId && <Link onClick={preserveGuestCode} href={`/registro?volver=${encodeURIComponent(exerciseHref(props.slug, props.language, props.pathSlug))}`} className="text-link mt-5 text-xs sm:hidden">Guardar mi progreso<ArrowRight className="size-3.5" /></Link>}
        </section>
        <div role="separator" aria-label="Ajustar ancho de los paneles" aria-orientation="vertical" aria-valuenow={width} aria-valuemin={28} aria-valuemax={55} tabIndex={0} className="panel-resizer hidden cursor-col-resize items-center justify-center min-[1200px]:flex" onKeyDown={event=>{if(event.key==="ArrowLeft"||event.key==="ArrowRight"){event.preventDefault();setWidth(w=>Math.min(55,Math.max(28,w+(event.key==="ArrowRight"?1:-1))));}}} onPointerDown={event=>event.currentTarget.setPointerCapture(event.pointerId)} onPointerMove={event=>{if(event.currentTarget.hasPointerCapture(event.pointerId)&&grid.current){const rect=grid.current.getBoundingClientRect();setWidth(Math.min(55,Math.max(28,(event.clientX-rect.left)/rect.width*100)));}}} onPointerUp={event=>event.currentTarget.releasePointerCapture(event.pointerId)}><GripVertical className="size-3 shrink-0 text-muted-foreground" /></div>
        <div ref={editorColumn} className="workspace-editor-column min-w-0" style={{"--results-height":`${resultsHeight}px`} as React.CSSProperties}>
          <div id="workspace-code" className={cn("workspace-code",mobileTab !== "code" && "hidden")}>
            <div className="workspace-toolbar flex min-h-12 shrink-0 flex-wrap items-center gap-2 px-4 py-1"><Code2 className="size-4 text-muted-foreground" /><label className="sr-only" htmlFor="workspace-language">Lenguaje del ejercicio</label><select id="workspace-language" value={props.language} onChange={event=>router.push(exerciseHref(props.slug, event.target.value as Language, props.pathSlug))} className="min-h-11 rounded-md bg-surface-secondary px-2 text-xs font-medium md:min-h-8" disabled={busy}><option value="python">Python</option><option value="javascript">JavaScript</option></select><span className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground" aria-live="polite">{saveState === "Guardado" && <Check className="size-3" />}{saveState}</span><EditorOptions fontSize={fontSize} onFontSize={setFontSize} onReset={()=>updateCode(props.starter)} /></div>
            {saveError && <p role="alert" className="border-b bg-surface px-4 py-3 text-xs leading-6">{saveError}</p>}
            <div className="editor-region">{simple ? <textarea aria-label={`Editor sencillo de ${languageNames[props.language]}`} className="h-full w-full resize-none bg-editor-background px-5 py-5 font-mono leading-7 focus-visible:-outline-offset-2" style={{fontSize}} value={code} onChange={event=>updateCode(event.target.value)} spellCheck={false} autoCapitalize="off" autoCorrect="off" /> : <CodeEditor code={code} language={props.language} onChange={updateCode} fontSize={fontSize} onRun={()=>execute("examples")} onSubmit={()=>execute("submit")} />}</div>
            <div className="workspace-editor-footer flex shrink-0 items-center gap-2 px-4 py-1"><button className="min-h-11 text-xs text-muted-foreground hover:text-primary-text md:min-h-8" onClick={()=>setSimple(!simple)}>{simple ? "Usar editor avanzado" : "Editor sencillo"}</button>{!simple && <span className="ml-auto hidden text-xs text-muted-foreground sm:inline">Ctrl / ⌘ + Enter: ejemplos</span>}</div>
          </div>
          {!resultsCollapsed && <div role="separator" aria-label="Ajustar altura de resultados" aria-orientation="horizontal" aria-valuenow={resultsHeight} aria-valuemin={140} aria-valuemax={400} tabIndex={0} className="panel-resizer hidden h-[7px] shrink-0 cursor-row-resize items-center justify-center min-[1200px]:flex" onKeyDown={event=>{if(event.key==="ArrowUp"||event.key==="ArrowDown"){event.preventDefault();setResultsHeight(h=>Math.min(400,Math.max(140,h+(event.key==="ArrowUp"?20:-20))));}}} onPointerDown={event=>event.currentTarget.setPointerCapture(event.pointerId)} onPointerMove={event=>{if(event.currentTarget.hasPointerCapture(event.pointerId)&&editorColumn.current){const rect=editorColumn.current.getBoundingClientRect();setResultsHeight(Math.min(400,Math.max(140,rect.bottom-event.clientY-61)));}}} onPointerUp={event=>event.currentTarget.releasePointerCapture(event.pointerId)}><GripHorizontal className="size-3 text-muted-foreground" /></div>}
          <div id="workspace-results" data-collapsed={resultsCollapsed} className={cn("workspace-results min-[1200px]:block",mobileTab !== "results" && "hidden")}><Results result={result} busy={busy} error={error} nextHref={props.nextHref} collapsed={resultsCollapsed} onToggle={()=>setResultsCollapsed(v=>!v)} />{executedCode !== null && executedCode !== code && (result || error) && <p className={cn("px-5 pb-4 text-xs text-muted-foreground", resultsCollapsed && "min-[1200px]:hidden")}>Has editado el código desde la última ejecución. Vuelve a comprobarlo.</p>}</div>
          <div className={cn("workspace-actions flex shrink-0 flex-wrap items-center justify-end gap-2 px-4 py-3 min-[1200px]:flex",mobileTab === "statement" && "hidden")}><span className="mr-auto hidden text-xs text-muted-foreground min-[1600px]:block">Ctrl / ⌘ + Enter para ejecutar</span><Button className="min-w-0 flex-1 px-2 text-xs [&_svg]:hidden min-[380px]:[&_svg]:block sm:flex-none sm:px-3 md:h-9" variant="outline" disabled={busy || !code.trim()} onClick={()=>execute("examples")}><Play data-icon="inline-start" />Ejecutar ejemplos</Button><Button className="min-w-0 flex-1 px-2 text-xs [&_svg]:hidden min-[380px]:[&_svg]:block sm:flex-none sm:px-3 md:h-9" disabled={busy || !code.trim()} onClick={()=>execute("submit")}>{busy ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Check data-icon="inline-start" />}Comprobar solución</Button></div>
        </div>
      </div>
    </main>
  </AppShell>;
}
