"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { finishDiagnostic, saveDiagnosticDraft } from "@/server/learning-actions";
import { languageNames, type Language, type RuntimeMode, type Json, type ExecutionResult } from "@/lib/types";
import { Button } from "./ui/button";
import { Results } from "./practice/results";
import { Statement } from "./practice/statement";
import { OnboardingProgress } from "./onboarding-progress";
import { useDraftRecovery } from "./practice/use-draft-recovery";
import { DraftRecovery } from "./practice/draft-recovery";
import type { DraftCopy } from "@/lib/draft-recovery";
import { useExecution } from "./practice/use-execution";

const CodeEditor = dynamic(() => import("./practice/code-editor"), { ssr: false, loading: () => <p className="p-5 text-sm text-muted-foreground">Preparando tu editor local…</p> });
const subscribe = () => () => {};
type Item = { id: string; variantId: string; code: string; revision: number; title: string; statement: string; runtimeMode: RuntimeMode; examples: { input: Json; expected: Json }[]; result: ExecutionResult | null };
type Props = { id: string; userId: string; language: Language; backHref: string; items: Item[]; onboarding?: boolean };

export function DiagnosticWorkspace(props: Props) {
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  const [index, setIndex] = useState(0);
  return <>{props.onboarding && <OnboardingProgress step={3} />}<h1 className="page-title">Descubre tu nivel</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">{languageNames[props.language]} · Dos retos y un tercero opcional. No cuenta como práctica completada. Puedes terminar sin responder.</p>
    {hydrated ? <DiagnosticEditor key={`${props.userId}:${props.items[index].id}`} {...props} item={props.items[index]} index={index} onNavigate={setIndex} /> : <p role="status" className="mt-8">Preparando el diagnóstico…</p>}
  </>;
}

function DiagnosticEditor({ id, userId, language, backHref, item, index, onNavigate }: Props & { item: Item; index: number; onNavigate: (index: number) => void }) {
  const router = useRouter();
  const key = `itera:diagnostic:${userId}:${item.id}`;
  const recovery = useDraftRecovery(key, { code: item.code, revision: item.revision });
  const [code, setCode] = useState(recovery.initialCode);
  const codeRef = useRef(code);
  const revision = useRef(item.revision);
  const [displayRevision, setDisplayRevision] = useState(item.revision);
  const lastSaved = useRef(item.code);
  const pending = useRef<Promise<boolean> | null>(null);
  const conflict = useRef(false);
  const [saveMessage, setSaveMessage] = useState("Copia del diagnóstico independiente de tus ejercicios.");
  const execution = useExecution({ key: `itera:diagnostic-execution:${userId}:${item.id}:${item.variantId}`, variantId: item.variantId, diagnosticItemId: item.id, initialResult: item.result });
  const { result } = execution;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const busyRef = useRef(false);
  const blocked = busy || execution.busy;
  const [simple, setSimple] = useState(() => { try { return JSON.parse(localStorage.getItem("itera:workspace") ?? "null")?.simple === true; } catch { return false; } });
  const [fontSize] = useState(() => {
    try {
      const value = JSON.parse(localStorage.getItem("itera:workspace") ?? "null")?.fontSize;
      if (typeof value === "number" && Number.isFinite(value)) return Math.min(22, Math.max(12, value));
    } catch { /* Usa el tamaño habitual si el navegador no puede leer preferencias. */ }
    return 14;
  });
  function toggleSimple() {
    const next = !simple;
    setSimple(next);
    try {
      const layout = JSON.parse(localStorage.getItem("itera:workspace") ?? "null");
      localStorage.setItem("itera:workspace", JSON.stringify({ ...(layout && typeof layout === "object" ? layout : {}), simple: next }));
    } catch { /* El editor sigue disponible aunque falle el almacenamiento. */ }
  }

  function update(value: string) {
    if (recovery.pending) return;
    if (value.length > 30000) { setError("El código admite como máximo 30 000 caracteres."); return; }
    codeRef.current = value; setCode(value); setSaveMessage("Pendiente de sincronizar.");
    recovery.persist(value, revision.current, lastSaved.current);
  }
  function recoverCode(copy: DraftCopy) {
    recovery.resolve(copy, { code: codeRef.current, revision: revision.current }, lastSaved.current);
    codeRef.current = copy.code; setCode(copy.code);
    setSaveMessage(copy.code === lastSaved.current ? "Diagnóstico guardado." : "Pendiente de sincronizar.");
  }
  async function save(): Promise<boolean> {
    if (pending.current) { await pending.current; return save(); }
    if (conflict.current || recovery.pending) return false;
    if (codeRef.current === lastSaved.current) return true;
    const snapshot = codeRef.current;
    const operation = (async () => {
      try {
        const saved = await saveDiagnosticDraft({ itemId: item.id, code: snapshot, revision: revision.current });
        if (!saved.revision) { conflict.current = true; setSaveMessage(saved.error!); return false; }
        revision.current = saved.revision; lastSaved.current = snapshot;
        setDisplayRevision(saved.revision);
        setSaveMessage("Diagnóstico guardado.");
        recovery.persist(codeRef.current, revision.current, lastSaved.current);
        return true;
      } catch { setSaveMessage("Sin conexión. Tu copia local se conserva; vuelve a intentar guardar."); return false; }
    })();
    pending.current = operation;
    try { return await operation; } finally { pending.current = null; }
  }
  useEffect(() => {
    const timer = setTimeout(() => { void save(); }, 900);
    return () => clearTimeout(timer);
    // El código determina el guardado; save usa refs para serializar las revisiones.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, recovery.pending]);

  async function execute(mode: "examples" | "submit") {
    if (busyRef.current || execution.busy) return;
    busyRef.current = true; setBusy(true); setError("");
    try {
      if (!await save()) { setError("Guarda o recupera tu borrador antes de evaluar."); return; }
      execution.start(codeRef.current, mode);
    } catch (failure) { setError(failure instanceof Error ? failure.message : "No se pudo conectar con el ejecutor."); }
    finally { busyRef.current = false; setBusy(false); }
  }
  async function navigate(next: number) {
    if (blocked) return;
    if (await save()) { router.refresh(); onNavigate(next); }
    else setError("No se pudo sincronizar. Copia tu código antes de recargar.");
  }
  async function finish() {
    if (busyRef.current || execution.busy) return;
    if (recovery.pending) { setError("Compara y recupera tu borrador antes de terminar el diagnóstico."); return; }
    busyRef.current = true; setBusy(true); setError("");
    try {
      // La copia local permanece aunque se decida terminar sin evaluar.
      await save();
      const result = await finishDiagnostic(id);
      if (result.error) { setError(result.error); return; }
      router.push(backHref); router.refresh();
    } catch { setError("No se pudo finalizar el diagnóstico. Inténtalo de nuevo."); }
    finally { busyRef.current = false; setBusy(false); }
  }
  return <div className="mt-7">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-4"><p className="text-sm font-medium">Reto {index + 1} de 3{index === 2 ? " · Opcional" : ""}</p><div className="flex flex-wrap gap-2"><Button variant="ghost" disabled={blocked || index === 0} onClick={() => navigate(index - 1)}><ArrowLeft aria-hidden="true" />Anterior</Button>{index < 2 && <Button variant="outline" disabled={blocked} onClick={() => navigate(index + 1)}>{index === 1 ? "Probar tercer reto" : "Siguiente reto"}<ArrowRight aria-hidden="true" /></Button>}</div></div>
    <div className="diagnostic-grid"><section className="min-w-0 rounded-xl bg-surface p-5 sm:p-6" aria-label="Enunciado del diagnóstico"><h2 className="section-title">{item.title}</h2><Statement text={item.statement} /><h3 className="mt-6 text-sm font-medium">Ejemplos visibles</h3>{item.examples.map((example, number) => <div key={number} className="mt-3 text-sm"><p>Ejemplo {number + 1}</p><pre className="mt-2 overflow-auto rounded-lg bg-surface-inset p-3 text-xs">{`Entrada: ${JSON.stringify(example.input)}\nEsperado: ${JSON.stringify(example.expected)}`}</pre></div>)}</section>
    <div className="min-w-0 overflow-hidden rounded-xl bg-editor-background"><div className="flex flex-wrap items-center justify-between gap-2 bg-surface px-4 py-2"><span className="text-sm">{languageNames[language]}</span><Button variant="ghost" size="sm" onClick={toggleSimple} aria-pressed={simple}>Editor sencillo</Button></div>
      <DraftRecovery pending={recovery.pending} copies={recovery.copies} current={{ code, revision: displayRevision, source: "local" }} onChoose={recoverCode} />
      {recovery.error && <p role="alert" className="bg-surface px-4 py-3 text-sm leading-6">{recovery.error}</p>}
      <div className="h-[360px]">{simple ? <textarea aria-label="Código del diagnóstico" readOnly={recovery.pending} className="h-full w-full resize-none bg-editor-background p-4 font-mono leading-6" style={{ fontSize }} value={code} onChange={event => update(event.target.value)} spellCheck={false} /> : <CodeEditor code={code} readOnly={recovery.pending} onChange={update} language={language} fontSize={fontSize} onRun={() => void execute("examples")} onSubmit={() => void execute("submit")} />}</div><div className="flex flex-wrap gap-2 bg-surface p-3"><Button variant="outline" disabled={blocked || recovery.pending} onClick={() => execute("examples")}>Probar ejemplos</Button><Button loading={blocked} disabled={recovery.pending} onClick={() => execute("submit")}>Evaluar reto</Button></div><Results result={result} busy={blocked} error={[error, execution.busy ? "" : execution.error].filter(Boolean).join(" ")} notice={[execution.busy ? execution.error : "", execution.storageError].filter(Boolean).join(" ")} runtimeMode={item.runtimeMode} diagnostic /></div></div>
    <p role="status" className="mt-4 text-sm leading-6 text-muted-foreground">{saveMessage}</p><div className="mt-7 flex flex-wrap items-center gap-4"><Button variant="outline" loading={busy} disabled={execution.busy} onClick={finish}>{index >= 1 ? "Ver mi recomendación" : "Terminar sin continuar"}</Button><p className="text-sm text-muted-foreground">Los retos sin evaluar no cuentan como fallos.</p></div>
  </div>;
}
