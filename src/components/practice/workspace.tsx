"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowLeft, ArrowRight, ChevronLeft, Play, Check, Lightbulb, Code2, Clock3, ChevronRight, BookOpen, GripVertical, GripHorizontal } from "lucide-react";
import type { Language, Level, RuntimeMode } from "@/lib/types";
import { activityNames, type ActivityType } from "@/lib/types";
import { languages, languageNames, levelNames } from "@/lib/types";
import { cn } from "@/lib/utils";
import { exerciseHref } from "@/lib/learning-paths";
import { uniqueHelp } from "@/lib/learning-help";
import { draftSaveFeedback, temporaryDraftFailure } from "@/lib/draft-sync";
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
import { ActivityList, type Activity } from "@/components/activity-list";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ModuleLesson, type Lesson } from "./module-lesson";
import { usePanelSize } from "./use-panel-size";
import { Disclosure } from "@/components/arc/disclosure";
import { Selection } from "@/components/arc/selection";
import { LayoutGroup } from "motion/react";
import { useDraftRecovery } from "./use-draft-recovery";
import { DraftRecovery } from "./draft-recovery";
import type { DraftCopy } from "@/lib/draft-recovery";
import { useExecution } from "./use-execution";
import type { ProjectDefinition, ProjectFile } from "@/lib/project";
import { parseStoredProjectDraft, projectEditorSelection, sameProjectFiles, type ProjectDraftCopy } from "@/lib/project-draft-recovery";
import { useProjectDraftRecovery } from "./use-project-draft-recovery";
import { ProjectDraftRecovery, cloneProjectFiles } from "./project-draft-recovery";
import { projectLimits } from "@/lib/project";

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
type Props = { userId?: string; user: ShellUser | null; slug: string; title: string; category: string; level: Level; minutes: number; statement: string; objective: string; prerequisites: string[]; practiceGoals: string[]; previousExercises: PreviousExercise[]; activityType: ActivityType; constraints: string[]; hints: string[]; complexity: string; commonErrors: string[]; recentSubmissions: Activity[]; language: Language; availableLanguages: Language[]; lesson?: Lesson; runtimeMode: RuntimeMode; variantId: string; starter: string; initialCode: string; project?: ProjectDefinition; initialFiles?: ProjectFile[]; previousFiles?: ProjectFile[]; previousProject?: ProjectDefinition; previousStorageKey?: string; revision: number; examples: PublicExample[]; nextHref?: string; previousHref?: string; position: number; total: number; pathSlug?: string };

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
  return <WorkspaceReady key={`${props.userId ?? "guest"}:${props.variantId}`} {...props} />;
}

function WorkspaceReady(props: Props) {
  const router = useRouter();
  const singleAction = props.level === "INITIATION" && !props.project;
  const [showCommonErrors, setShowCommonErrors] = useState(false);
  const commonErrors = uniqueHelp(props.commonErrors, props.hints);
  const storageKey = `itera:draft:${props.userId ?? "guest"}:${props.variantId}`;
  const executionKey = `itera:execution:${props.userId ?? "guest"}:${props.variantId}`;
  const transferKey = `itera:transfer:${props.variantId}`;
  const recovery = useDraftRecovery(props.project ? `${storageKey}:legacy` : storageKey, { code: props.initialCode, revision: props.revision }, !!props.userId, transferKey);
  const projectTemplate = props.project?.files ?? [];
  const projectRecovery = useProjectDraftRecovery(props.project ? storageKey : `${storageKey}:files-v2`, { files: props.initialFiles ?? projectTemplate, revision: props.revision }, projectTemplate, !!props.userId, `${transferKey}:files-v2`, props.project?.entrypoint);
  const [projectFiles, setProjectFiles] = useState(projectRecovery.initialFiles);
  const projectFilesRef = useRef(projectFiles);
  const initialEntry = props.project ? projectFiles.find(file => file.path === props.project!.entrypoint)?.content ?? "" : recovery.initialCode;
  const [activeFile, setActiveFile] = useState(props.project?.entrypoint ?? "");
  const [code, setCode] = useState(initialEntry);
  const codeRef = useRef(code);
  const revision = useRef(props.revision);
  const [displayRevision, setDisplayRevision] = useState(props.revision);
  const lastSaved = useRef(props.initialCode);
  const lastSavedFiles = useRef(cloneProjectFiles(props.initialFiles ?? projectTemplate));
  const saving = useRef(false);
  const conflict = useRef(false);
  const retryDelay = useRef(900);
  const [saveTick, setSaveTick] = useState(0);
  const [saveState, setSaveState] = useState(recovery.pending || projectRecovery.pending ? "Pendiente de recuperar" : props.userId ? (props.project ? sameProjectFiles(projectFiles, props.initialFiles ?? projectTemplate) : code === props.initialCode) ? "Guardado" : "Pendiente de sincronizar" : "En este navegador");
  const [saveError, setSaveError] = useState("");
  const [syncError, setSyncError] = useState("");
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
  const execution = useExecution({ key: executionKey, variantId: props.variantId });
  const { result, busy } = execution;
  const error = busy ? "" : execution.error;
  const executionNotice = [busy ? execution.error : "", execution.storageError].filter(Boolean).join(" ");
  const [executedCode, setExecutedCode] = useState<string | null>(execution.pending?.request?.files ? JSON.stringify(execution.pending.request.files) : execution.pending?.request?.code ?? null);
  const [hintCount, setHintCount] = useState(0);
  const [solution, setSolution] = useState<{ code?: string; files?: ProjectFile[]; explanation?: string; error?: string } | null>(null);
  const [solutionBusy, setSolutionBusy] = useState(false);
  const saveNotice = [saveError, syncError, recovery.error, projectRecovery.error].filter(Boolean).join(" ");

  useEffect(() => {
    if (props.userId) void rememberPractice({ variantId: props.variantId, language: props.language, pathSlug: props.pathSlug }).catch(() => setSaveError("No se pudo guardar dónde continuar. Tu código se conserva por separado."));
  }, [props.userId, props.variantId, props.language, props.pathSlug]);

  useEffect(() => { try { localStorage.setItem(settingsKey, JSON.stringify({ simple, fontSize, width: savedWidth, resultsHeight: savedResultsHeight })); } catch {} }, [simple, fontSize, savedWidth, savedResultsHeight]);
  useEffect(() => {
    if (focusCodeRequest && mobileTab === "code") {
      // El panel es un destino estable incluso mientras Monaco se descarga.
      const target = codePanel.current?.querySelector<HTMLTextAreaElement>("textarea");
      (target ?? codePanel.current)?.focus();
    }
  }, [focusCodeRequest, mobileTab]);

  function preserveGuestCode() {
    if (!props.userId) {
      if (props.project) projectRecovery.preserveGuest(projectFilesRef.current);
      else { try { sessionStorage.setItem(transferKey, codeRef.current); } catch {} }
    }
  }

  function updateCode(value: string) {
    if (recovery.pending || projectRecovery.pending) return;
    if (props.project) {
      const bytes = new TextEncoder().encode(value).byteLength;
      const otherBytes = projectFilesRef.current.filter(file => file.path !== activeFile).reduce((total, file) => total + new TextEncoder().encode(file.content).byteLength, 0);
      if (bytes > projectLimits.fileBytes || otherBytes + bytes > projectLimits.totalBytes) { setSaveError("El proyecto admite hasta 64 KiB por archivo y 256 KiB en total."); return; }
      const next = projectFilesRef.current.map(file => file.path === activeFile ? { ...file, content: value } : file);
      projectFilesRef.current = next; setProjectFiles(next); projectRecovery.setFiles(next);
      projectRecovery.persist(next, revision.current, lastSavedFiles.current);
    } else if (value.length > 30000) { setSaveError("El editor admite hasta 30 000 caracteres."); return; }
    codeRef.current = value; setCode(value);
    if (!props.project) recovery.persist(value, revision.current, lastSaved.current);
    if (props.userId && !conflict.current) setSaveState("Pendiente de sincronizar");
  }

  function selectProjectFile(path: string) {
    const next = projectFilesRef.current.find(file => file.path === path);
    if (!next) return;
    setActiveFile(path); codeRef.current = next.content; setCode(next.content);
  }

  function recoverCode(copy: DraftCopy) {
    recovery.resolve(copy, { code: codeRef.current, revision: revision.current }, lastSaved.current);
    codeRef.current = copy.code; setCode(copy.code);
    setSaveState(props.userId ? copy.code === lastSaved.current ? "Guardado" : "Pendiente de sincronizar" : "En este navegador");
  }

  function recoverProject(copy: ProjectDraftCopy) {
    projectRecovery.resolve(copy, projectFilesRef.current, revision.current, lastSavedFiles.current);
    projectFilesRef.current = cloneProjectFiles(copy.files); setProjectFiles(projectFilesRef.current);
    const selected = projectEditorSelection(copy.files, activeFile);
    setActiveFile(selected.path); codeRef.current = selected.content; setCode(selected.content);
    setSaveState(props.userId ? sameProjectFiles(copy.files, lastSavedFiles.current) ? "Guardado" : "Pendiente de sincronizar" : "En este navegador");
  }

  function resetTemplate() {
    if (recovery.pending || projectRecovery.pending) return;
    if (props.project) recoverProject({ files: cloneProjectFiles(props.project.files), revision: revision.current, source: "local" });
    else updateCode(props.starter);
  }

  function offerPreviousProject() {
    if (!props.previousFiles || !props.project || projectRecovery.pending) return;
    const current = cloneProjectFiles(projectFilesRef.current);
    let previousFiles = props.previousFiles;
    if (props.previousProject && props.previousStorageKey) {
      try {
        const raw = localStorage.getItem(props.previousStorageKey);
        const restored = parseStoredProjectDraft(raw, props.previousProject.files, props.previousProject.entrypoint);
        if (restored) previousFiles = restored.files;
        else if (raw) setSaveError("La copia local del hito anterior tiene un formato desconocido. Se conserva sin aplicar.");
      }
      catch { setSaveError("No se pudo leer la copia del hito anterior; se conserva su versión guardada."); }
    }
    const prior = new Map(previousFiles.map(file => [file.path, file]));
    const copied = current.map(file => {
      const source = prior.get(file.path);
      return !file.readOnly && source && !source.readOnly ? { ...file, content: source.content } : file;
    });
    if (sameProjectFiles(current, copied)) { setSaveError("No hay archivos editables coincidentes para copiar del hito anterior."); return; }
    projectRecovery.offerCopies([
      { files: current, revision: revision.current, source: "local" },
      { files: copied, revision: revision.current, source: "previous" },
    ]);
    setSaveError("");
  }

  useEffect(() => {
    const changed = props.project ? !sameProjectFiles(projectFiles, lastSavedFiles.current) : code !== lastSaved.current;
    if (!props.userId || recovery.pending || projectRecovery.pending || conflict.current || !changed) return;
    const timer = setTimeout(async () => {
      if (saving.current) return;
      saving.current = true; setSaveState("Guardando…");
      try {
        const submittedFiles = props.project ? cloneProjectFiles(projectFiles) : undefined;
        const saved = await saveDraft({ variantId: props.variantId, ...(submittedFiles ? { files: submittedFiles } : { code }), revision: revision.current });
        const feedback = draftSaveFeedback(saved, retryDelay.current);
        conflict.current = feedback.blocked; retryDelay.current = feedback.delay;
        setSyncError(feedback.error);
        if ("revision" in saved && saved.revision !== undefined) {
          revision.current = saved.revision;
          if (submittedFiles) lastSavedFiles.current = submittedFiles;
          else lastSaved.current = code;
          setDisplayRevision(saved.revision);
          const stillSame = submittedFiles ? sameProjectFiles(projectFilesRef.current, submittedFiles) : codeRef.current === code;
          setSaveState(stillSame ? "Guardado" : "Pendiente de sincronizar");
          if (submittedFiles) projectRecovery.persist(projectFilesRef.current, revision.current, submittedFiles);
          else recovery.persist(codeRef.current, revision.current, lastSaved.current);
        } else { setSaveState("Copia local"); }
      } catch {
        const feedback = draftSaveFeedback(temporaryDraftFailure, retryDelay.current);
        retryDelay.current = feedback.delay; setSaveState("Copia local"); setSyncError(feedback.error);
      }
      finally { saving.current = false; setSaveTick(t => t + 1); }
    }, retryDelay.current);
    return () => clearTimeout(timer);
    // persist lee las alternativas del navegador en cada escritura.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, projectFiles, saveTick, props.userId, props.variantId, storageKey, recovery.pending, projectRecovery.pending]);

  function execute(mode: "examples" | "submit" | "tests") {
    if (busy || recovery.pending || projectRecovery.pending || (mode === "tests" && !props.project?.testEntrypoint)) return;
    if (!props.userId) { preserveGuestCode(); router.push(`/iniciar-sesion?volver=${encodeURIComponent(exerciseHref(props.slug, props.language, props.pathSlug))}`); return; }
    setMobileTab("results"); setResultsCollapsed(false);
    const codeKey = props.project ? JSON.stringify(projectFilesRef.current) : codeRef.current;
    if (execution.start(props.project ? "" : codeRef.current, mode, props.project ? cloneProjectFiles(projectFilesRef.current) : undefined)) setExecutedCode(codeKey);
  }

  async function loadSolution() {
    if (solution?.code || solution?.files || solutionBusy) return;
    setSolutionBusy(true);
    try { setSolution(await revealSolution(props.variantId)); }
    catch { setSolution({ error: "No pudimos cargar la solución. Inténtalo de nuevo." }); }
    finally { setSolutionBusy(false); }
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
      <p className="sr-only" role="status">Borrador: {saveNotice || saveState}</p>
      {(recovery.pending || projectRecovery.pending) && <p role="status" className="bg-surface px-4 py-2 text-sm min-[1200px]:hidden">Hay copias pendientes de comparar. Abre la sección Código para elegir cuál continuar.</p>}
      <LayoutGroup id="workspace-sections"><div className="workspace-mobile-tabs" role="group" aria-label="Secciones del ejercicio">{[{id:"statement",name:"Enunciado"},{id:"code",name:"Código"},{id:"results",name:"Resultados"}].map(tab=><button className="relative isolate" key={tab.id} onClick={()=>setMobileTab(tab.id)} aria-pressed={mobileTab === tab.id} aria-controls={`workspace-${tab.id}`}>{mobileTab === tab.id && <Selection id="workspace-selection" className="bg-control shadow-control" />}{tab.name}</button>)}</div></LayoutGroup>
      <div ref={grid} className="workspace-grid" style={{"--statement-width":`${width}%`} as React.CSSProperties}>
        <section id="workspace-statement" className={cn("workspace-statement px-5 py-6 sm:px-7 min-[1200px]:block", mobileTab !== "statement" && "hidden")} aria-label="Enunciado">
          <Challenge exercise={props} />
          {props.availableLanguages.length < languages.length && <nav aria-label="Continuar en otro lenguaje" className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs"><span className="w-full text-muted-foreground">Este reto tiene variantes propias. Para otros lenguajes, continúa en su ruta:</span>{languages.filter(language => !props.availableLanguages.includes(language)).map(language => <Link key={language} className="text-link" href={`${props.pathSlug ? `/rutas/${encodeURIComponent(props.pathSlug)}` : "/rutas"}?lenguaje=${language}`}>{languageNames[language]} · ir a su ruta</Link>)}</nav>}
          <Button variant="outline" className="mt-6 w-full min-[1200px]:hidden" onClick={()=>{setMobileTab("code");setFocusCodeRequest(value=>value+1);}}>Ir al código<ArrowRight /></Button>
          <div className="workspace-reference">
          <LearningGuide title={props.title} statement={props.statement} objective={props.objective} prerequisites={props.prerequisites} practiceGoals={props.practiceGoals} previousExercises={props.previousExercises}>
            {props.lesson && <ModuleLesson lesson={props.lesson} language={props.language} />}
            {props.complexity.trim() && <ExerciseNotes complexity={props.complexity} commonErrors={[]} />}
          </LearningGuide>
                  <section className="py-5" aria-label="Pistas">
                    {hintCount === 0 && props.hints.length > 0 && <p className="py-4 text-base leading-7 text-muted-foreground">Descubre una pista cada vez, solo si la necesitas.</p>}
                    {props.hints.slice(0,hintCount).map((hint,index)=><MotionReveal key={index}><div className="mb-3 rounded-lg bg-surface p-4"><h3 className="text-sm font-medium">Pista {index+1}</h3><p className="mt-2 text-base leading-7">{hint}</p></div></MotionReveal>)}
                    {hintCount < props.hints.length ? <Button variant="secondary" onClick={()=>{setHintCount(n=>n+1); recordHint(props.variantId,hintCount).catch(()=>setSaveError("No se pudo registrar el uso de la pista."));}}><Lightbulb />{hintCount === 0 ? "Mostrar una pista" : "Mostrar otra pista"}</Button> : <p className="mt-4 text-sm text-muted-foreground">{props.hints.length ? "Ya tienes todas las pistas. Prueba tu idea en el código." : "Esta versión no tiene pistas publicadas. Puedes consultar la teoría o la solución explicada."}</p>}
                    {commonErrors.length > 0 && (showCommonErrors ? <ExerciseNotes complexity="" commonErrors={commonErrors} /> : <Button variant="ghost" className="mt-3" onClick={() => setShowCommonErrors(true)}>Revisar errores comunes</Button>)}
                  </section>
                  <Dialog><DialogTrigger asChild><Button variant="ghost" onClick={() => void loadSolution()}><BookOpen />Ver solución explicada</Button></DialogTrigger><DialogContent><DialogTitle className="pr-7 text-lg font-semibold">Solución explicada</DialogTitle><DialogDescription className="mt-2 mb-4 text-sm text-muted-foreground">Una posible solución para {props.title} en {languageNames[props.language]}. Leerla no marca el ejercicio como resuelto.</DialogDescription>
                    {solution?.code || solution?.files ? <><p className="whitespace-pre-line text-base leading-7 text-muted-foreground">{solution.explanation}</p>{solution.files ? solution.files.map(file=><div key={file.path} className="mt-4"><h3 className="text-xs font-medium">{file.path}</h3><pre className="code-block mt-2 max-h-80">{file.content}</pre></div>) : <pre className="code-block mt-5 max-h-80">{solution.code}</pre>}<p className="mt-4 text-sm text-muted-foreground">Leer una solución no marca el ejercicio como resuelto.</p></> : solution?.error ? <><p role="alert" className="text-sm text-destructive">{solution.error}</p><Button className="mt-4" variant="secondary" loading={solutionBusy} onClick={() => void loadSolution()}>Reintentar</Button></> : <p role="status" className="text-sm text-muted-foreground">Cargando la solución…</p>}
                  </DialogContent></Dialog>
          </div>
          {!props.userId && <Link onClick={preserveGuestCode} href={`/registro?volver=${encodeURIComponent(exerciseHref(props.slug, props.language, props.pathSlug))}`} className="text-link mt-5 text-xs sm:hidden">Guardar mi progreso<ArrowRight className="size-3.5" /></Link>}
        </section>
        <div role="separator" aria-label="Ajustar ancho de los paneles" aria-orientation="vertical" aria-valuenow={width} aria-valuemin={28} aria-valuemax={55} aria-valuetext={`${Math.round(width)} % del ancho`} tabIndex={0} className="panel-resizer hidden cursor-col-resize items-center justify-center min-[1200px]:flex" onKeyDown={event=>{if(event.key==="ArrowLeft"||event.key==="ArrowRight"){event.preventDefault();statementSize.step(event.key==="ArrowRight"?1:-1);}}} onPointerDown={event=>event.currentTarget.setPointerCapture(event.pointerId)} onPointerMove={event=>{if(event.currentTarget.hasPointerCapture(event.pointerId)&&grid.current){const rect=grid.current.getBoundingClientRect();statementSize.move((event.clientX-rect.left)/rect.width*100);}}} onPointerUp={event=>{statementSize.finish();event.currentTarget.releasePointerCapture(event.pointerId);}} onLostPointerCapture={statementSize.finish} onPointerCancel={statementSize.finish}><GripVertical className="size-3 shrink-0 text-muted-foreground" /></div>
        <div ref={editorColumn} className="workspace-editor-column min-w-0" style={{"--results-height":`${resultsHeight}px`} as React.CSSProperties}>
          <div ref={codePanel} id="workspace-code" tabIndex={-1} aria-label="Tu código" className={cn("workspace-code",mobileTab !== "code" && "hidden")}>
            <div className="workspace-toolbar flex min-h-12 shrink-0 flex-wrap items-center gap-2 px-4 py-1"><Code2 className="size-4 text-muted-foreground" /><span className="mr-2 hidden text-sm font-medium sm:inline">{props.project ? "Archivos del proyecto" : "Tu solución"}</span><span className="rounded-md bg-surface-secondary px-2 py-1 text-xs font-medium"><span className="sr-only">Lenguaje del ejercicio: </span>{languageNames[props.language]}</span>{props.project && <><label className="sr-only" htmlFor="project-file">Archivo del proyecto</label><select id="project-file" value={activeFile} onChange={event=>selectProjectFile(event.target.value)} className="min-h-11 max-w-40 truncate rounded-md bg-surface-secondary px-2 text-xs font-medium md:min-h-8">{projectFiles.map(file=><option key={file.path} value={file.path}>{file.path}{file.readOnly ? " · lectura" : ""}</option>)}</select>{props.previousFiles && <Button variant="ghost" size="sm" disabled={busy || projectRecovery.pending} onClick={offerPreviousProject}>Copiar hito anterior</Button>}</>}<span className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">{saveState === "Guardado" && <Check className="size-3" />}{saveState}</span>{props.recentSubmissions.length > 0 && <Dialog><DialogTrigger asChild><Button variant="ghost" size="sm">Historial</Button></DialogTrigger><DialogContent><DialogTitle className="pr-7 text-lg font-semibold">Historial de este ejercicio</DialogTitle><DialogDescription className="mt-2 text-sm text-muted-foreground">Últimas ejecuciones en {languageNames[props.language]}. No es el resultado del código que estás editando.</DialogDescription><ActivityList entries={props.recentSubmissions} compact /></DialogContent></Dialog>}<EditorOptions fontSize={fontSize} onFontSize={setFontSize} code={code} onReset={resetTemplate} /></div>
            {saveNotice && <p role="alert" className="border-b bg-surface px-4 py-3 text-xs leading-6">{saveNotice}</p>}
            {props.project ? <ProjectDraftRecovery pending={projectRecovery.pending} copies={projectRecovery.copies} current={{ files: projectFiles, revision: displayRevision, source: "local" }} unknownRaw={projectRecovery.unknownRaw} onChoose={recoverProject} /> : <DraftRecovery pending={recovery.pending} copies={recovery.copies} current={{ code, revision: displayRevision, source: "local" }} onChoose={recoverCode} />}
            <div className="editor-region">{simple ? <textarea aria-label={`${props.project ? `Editor sencillo de ${activeFile}` : `Editor sencillo de ${languageNames[props.language]}`}`} readOnly={recovery.pending || projectRecovery.pending || !!projectFiles.find(file=>file.path===activeFile)?.readOnly} className="h-full w-full resize-none bg-editor-background px-5 py-5 font-mono leading-7 focus-visible:-outline-offset-2" style={{fontSize}} value={code} onChange={event=>updateCode(event.target.value)} onKeyDown={event=>{if(event.key === "Enter" && (event.ctrlKey || event.metaKey) && !event.nativeEvent.isComposing){event.preventDefault();if(!event.repeat && code.trim()) void execute(singleAction || event.shiftKey ? "submit" : "examples");}}} spellCheck={false} autoCapitalize="off" autoCorrect="off" /> : <CodeEditor code={code} readOnly={recovery.pending || projectRecovery.pending || !!projectFiles.find(file=>file.path===activeFile)?.readOnly} language={props.language} modelPath={props.project ? `${props.variantId}/${activeFile}` : undefined} projectFiles={props.project ? projectFiles : undefined} onChange={updateCode} fontSize={fontSize} onRun={()=>execute(singleAction ? "submit" : "examples")} onSubmit={()=>execute("submit")} />}</div>
            <div className="workspace-editor-footer flex shrink-0 flex-wrap items-center gap-2 px-4 py-1"><Button variant="ghost" size="sm" className="text-xs" aria-pressed={simple} onClick={()=>setSimple(!simple)}>{simple ? "Usar editor avanzado" : "Editor sencillo"}</Button><Disclosure className="ml-auto text-xs text-muted-foreground" title="Atajos de teclado" triggerClassName="text-xs md:min-h-8"><p className="max-w-sm pb-3 leading-6">Ctrl / ⌘ + Enter: {singleAction ? "comprobar solución" : "ejecutar ejemplos"}.<br />Ctrl / ⌘ + Shift + Enter: comprobar solución.{!simple && <><br />Ctrl + M: permitir que Tab salga del editor.</>}</p></Disclosure></div>
          </div>
          <div className={cn("workspace-actions flex shrink-0 flex-wrap items-center justify-end gap-2 px-4 py-3 min-[1200px]:flex",mobileTab === "statement" && "hidden")}>
            <p id="execution-help" className="mr-auto text-xs leading-6 text-muted-foreground">{singleAction ? "Comprueba tu código para ver el resultado y guardar tu avance." : "Ejecutar ejemplos permite probar. Comprobar solución guarda tu avance si resuelves el reto."}{props.project?.testEntrypoint && " Ejecutar mis pruebas no completa el ejercicio ni comprueba la cobertura."}{!props.userId && " Para ejecutar, inicia sesión. Tu código queda en este navegador."}</p>
            {props.project?.testEntrypoint && <Button aria-describedby="execution-help" className="min-w-0 flex-1 whitespace-normal px-2 text-xs sm:flex-none sm:px-3" variant="secondary" disabled={busy || recovery.pending || projectRecovery.pending} onClick={()=>execute("tests")}><Play data-icon="inline-start" />Ejecutar mis pruebas</Button>}
            {!singleAction && <Button aria-describedby="execution-help" className="min-w-0 flex-1 whitespace-normal px-2 text-xs [&_svg]:hidden min-[380px]:[&_svg]:block sm:flex-none sm:px-3" variant="outline" disabled={busy || recovery.pending || projectRecovery.pending || (!props.project && !code.trim())} onClick={()=>execute("examples")}><Play data-icon="inline-start" />Ejecutar ejemplos</Button>}
            <Button aria-describedby="execution-help" className="min-w-0 flex-1 whitespace-normal px-2 text-xs [&_svg]:hidden min-[380px]:[&_svg]:block sm:flex-none sm:px-3" loading={busy} disabled={recovery.pending || projectRecovery.pending || (!props.project && !code.trim())} onClick={()=>execute("submit")}><Check data-icon="inline-start" />Comprobar solución</Button>
          </div>
          {!resultsCollapsed && <div role="separator" aria-label="Ajustar altura de resultados" aria-orientation="horizontal" aria-valuenow={resultsHeight} aria-valuemin={140} aria-valuemax={400} aria-valuetext={`${resultsHeight} píxeles`} tabIndex={0} className="panel-resizer hidden h-[7px] shrink-0 cursor-row-resize items-center justify-center min-[1200px]:flex" onKeyDown={event=>{if(event.key==="ArrowUp"||event.key==="ArrowDown"){event.preventDefault();resultSize.step(event.key==="ArrowUp"?20:-20);}}} onPointerDown={event=>event.currentTarget.setPointerCapture(event.pointerId)} onPointerMove={event=>{if(event.currentTarget.hasPointerCapture(event.pointerId)&&editorColumn.current){const rect=editorColumn.current.getBoundingClientRect();resultSize.move(rect.bottom-event.clientY);}}} onPointerUp={event=>{resultSize.finish();event.currentTarget.releasePointerCapture(event.pointerId);}} onLostPointerCapture={resultSize.finish} onPointerCancel={resultSize.finish}><GripHorizontal className="size-3 text-muted-foreground" /></div>}
           <div id="workspace-results" data-collapsed={resultsCollapsed} className={cn("workspace-results min-[1200px]:block",mobileTab !== "results" && "hidden")}><Results result={result} busy={busy} error={error} notice={executionNotice} nextHref={props.nextHref ?? (props.pathSlug ? `/rutas/${encodeURIComponent(props.pathSlug)}?lenguaje=${props.language}` : undefined)} nextLabel={props.pathSlug ? props.nextHref ? "Siguiente ejercicio de la ruta" : "Volver a la ruta" : "Practicar un ejercicio relacionado"} collapsed={resultsCollapsed} onToggle={toggleResults} runtimeMode={props.runtimeMode} />{executedCode !== null && executedCode !== (props.project ? JSON.stringify(projectFiles) : code) && (result || error) && <p className={cn("px-5 pb-4 text-xs text-muted-foreground", resultsCollapsed && "min-[1200px]:hidden")}>Has editado el código desde la última ejecución. Vuelve a comprobarlo.</p>}</div>
        </div>
      </div>
    </main>
  </AppShell>;
}

const Challenge = memo(function Challenge({ exercise: props }: { exercise: Props }) {
  return <div className="challenge-sheet">
    <h1 className="text-2xl leading-tight font-semibold tracking-[-0.035em]">{props.title}</h1><div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground"><span className="font-medium text-foreground">{props.activityType === "PRACTICE" || props.activityType === "INTEGRATION" ? "Desafío independiente" : activityNames[props.activityType]}</span><Badge>{levelNames[props.level]}</Badge><span className="flex items-center gap-1.5"><Clock3 className="size-3.5" />{props.minutes} min orientativos</span></div>
    <h2 className="mt-6 text-base font-semibold">Tu reto</h2><Statement text={props.statement} />
    {uniqueHelp(props.constraints, props.statement.split(/\n+/)).length > 0 && <section className="mt-5" aria-label="Condiciones del ejercicio"><h3 className="text-sm font-semibold">Condiciones</h3><ul className="mt-2 list-disc space-y-1 pl-4 text-base leading-7 text-muted-foreground">{uniqueHelp(props.constraints, props.statement.split(/\n+/)).map(constraint => <li key={constraint}>{constraint}</li>)}</ul></section>}
    <Examples examples={props.examples} runtimeMode={props.runtimeMode} />
  </div>;
});
