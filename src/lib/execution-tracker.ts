import type { ExecutionResult } from "./types";
import { normalizeProjectPath, projectLimits, type ProjectFile } from "./project";

type Context = { variantId: string; diagnosticItemId?: string };
export type ExecutionRequest = Context & ({ code: string; files?: never } | { files: ProjectFile[]; code?: never }) & { mode: "examples" | "submit" | "tests"; idempotencyKey: string };
type PendingExecution = { version: 1; request?: ExecutionRequest; id?: string; uncertain?: boolean };
type Storage = Pick<globalThis.Storage, "getItem" | "setItem" | "removeItem">;
type State = { pending: PendingExecution | null; result: ExecutionResult | null; error: string; storageError: string; completed: number };

function validProjectFiles(files: unknown): files is ProjectFile[] {
  if (!Array.isArray(files) || files.length === 0 || files.length > projectLimits.files) return false;
  const paths = new Set<string>();
  let total = 0;
  for (const file of files) {
    if (!file || typeof file.path !== "string" || typeof file.content !== "string" || (file.readOnly !== undefined && typeof file.readOnly !== "boolean")) return false;
    const path = normalizeProjectPath(file.path);
    if (!path || paths.has(path)) return false;
    paths.add(path);
    const size = new TextEncoder().encode(file.content).byteLength;
    if (size > projectLimits.fileBytes || (total += size) > projectLimits.totalBytes) return false;
  }
  return true;
}

export function readPendingExecution(raw: string | null, context: Context): PendingExecution | null {
  if (!raw) return null;
  // Compatibilidad con la clave anterior de práctica: solo contenía el id remoto.
  if (!["null", "true", "false"].includes(raw) && !raw.startsWith("{") && /^[\w-]{1,100}$/.test(raw)) return { version: 1, id: raw };
  try {
    const value = JSON.parse(raw) as PendingExecution;
    if (value.version !== 1 || (value.id !== undefined && (typeof value.id !== "string" || !/^[\w-]{1,100}$/.test(value.id)))) return null;
    const request = value.request;
    const validFiles = validProjectFiles(request?.files);
    const validCode = typeof request?.code === "string" && request.code.length > 0 && request.code.length <= 30000;
    if (request && (request.variantId !== context.variantId || request.diagnosticItemId !== context.diagnosticItemId || validCode === validFiles || (request.mode === "tests" && !validFiles) || !["examples", "submit", "tests"].includes(request.mode) || typeof request.idempotencyKey !== "string" || !/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(request.idempotencyKey))) return null;
    return request || value.id ? { version: 1, request, id: value.id, uncertain: !!request && !value.id } : null;
  } catch { return null; }
}

// El transporte y el almacenamiento se inyectan para probar respuestas inciertas
// sin servidor ni sandbox. La instantánea no vuelve a leer el código del editor.
export function createExecutionTracker(options: Context & { key: string; storage: () => Storage; fetch: typeof fetch; initialResult?: ExecutionResult | null }) {
  let state: State = { pending: null, result: options.initialResult ?? null, error: "", storageError: "", completed: 0 };
  let inFlight = false;
  let failures = 0;
  const listeners = new Set<() => void>();
  const update = (patch: Partial<State>) => { state = { ...state, ...patch }; listeners.forEach(listener => listener()); };
  function persist(pending: PendingExecution) {
    try { options.storage().setItem(options.key, JSON.stringify({ ...pending, uncertain: !pending.id })); update({ storageError: "" }); return true; }
    catch { update({ storageError: "No se pudo guardar el seguimiento del intento en este navegador. No cierres esta página hasta recuperar el resultado." }); return false; }
  }
  try {
    const raw = options.storage().getItem(options.key);
    state.pending = readPendingExecution(raw, options);
    if (raw && !state.pending) state.storageError = "No se pudo leer el seguimiento anterior. No se ha enviado ningún programa nuevo.";
  } catch { state.storageError = "No se puede leer el seguimiento de intentos en este navegador."; }
  if (!state.pending && options.initialResult?.status === "RUNNING") state.pending = { version: 1, id: options.initialResult.id };

  function finish(patch: Partial<State>) {
    // Si falla la limpieza, la recarga solo volverá a consultar el mismo intento.
    try {
      const saved = readPendingExecution(options.storage().getItem(options.key), options);
      const pending = state.pending;
      if (saved && ((saved.id && saved.id === pending?.id) || (saved.request && saved.request.idempotencyKey === pending?.request?.idempotencyKey))) options.storage().removeItem(options.key);
      update({ storageError: "" });
    }
    catch { update({ storageError: "El resultado está disponible, pero no se pudo retirar su seguimiento local. Al recargar se consultará el mismo intento." }); }
    failures = 0;
    update({ pending: null, ...patch });
  }

  return {
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    getSnapshot: () => state,
    getDelay: () => failures ? Math.min(1000 * 2 ** Math.min(failures - 1, 5), 30000) : 1000,
    start(code: string, mode: "examples" | "submit" | "tests", files?: ProjectFile[]) {
      if (state.pending || inFlight) return false;
      // Releer antes de reservar evita ignorar un intento abierto en otra pestaña.
      try {
        const raw = options.storage().getItem(options.key);
        const existing = readPendingExecution(raw, options);
        if (existing) { update({ pending: existing, error: "Recuperando el intento pendiente, sin enviar el código actual." }); return false; }
        if (raw) { update({ error: "El seguimiento anterior no es válido. Revisa los intentos recientes antes de iniciar otro." }); return false; }
      } catch { update({ error: "No se ha enviado el programa: habilita el almacenamiento del navegador y vuelve a intentarlo." }); return false; }
      if (files ? code.length > 0 || !validProjectFiles(files) : !code.trim() || mode === "tests") { update({ error: "La instantánea del intento no es válida." }); return false; }
      const pending: PendingExecution = { version: 1, request: { variantId: options.variantId, ...(options.diagnosticItemId ? { diagnosticItemId: options.diagnosticItemId } : {}), ...(files ? { files: files.map(file => ({ ...file })) } : { code }), mode, idempotencyKey: crypto.randomUUID() } };
      // Si no podemos persistir ANTES del POST, no creamos un intento irrecuperable.
      if (!persist(pending)) { update({ error: "No se ha enviado el programa. Habilita el almacenamiento y vuelve a intentarlo." }); return false; }
      failures = 0; update({ pending, result: null, error: "" }); return true;
    },
    async step() {
      const pending = state.pending;
      if (!pending || inFlight) return;
      inFlight = true;
      try {
        const response = pending.id
          ? await options.fetch(`/api/executions/${encodeURIComponent(pending.id)}`, { cache: "no-store", signal: AbortSignal.timeout(8000) })
          : await options.fetch("/api/executions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(pending.request), signal: AbortSignal.timeout(15000) });
        const payload = await response.json();
        if (!response.ok) {
          // Solo un rechazo explícito del POST libera la instantánea. Un GET
          // fallido (incluso sesión caducada) nunca autoriza una nueva evaluación.
          if (!pending.id && !pending.uncertain && [400, 401, 403, 404, 409, 413, 429, 503].includes(response.status)) {
            finish({ error: typeof payload.error === "string" ? payload.error : "No se pudo iniciar la ejecución." }); return;
          }
          throw new Error(typeof payload.error === "string" ? payload.error : "No pudimos consultar el intento.");
        }
        if (!pending.id) {
          if (typeof payload.id !== "string" || !/^[\w-]{1,100}$/.test(payload.id)) throw new Error("Respuesta de inicio incompleta.");
          const accepted = { ...pending, id: payload.id };
          update({ pending: accepted, error: "" }); persist(accepted);
        } else {
          if (payload.id !== pending.id || !["RUNNING", "PASSED", "FAILED", "ERROR"].includes(payload.status) || !Array.isArray(payload.results)) throw new Error("Respuesta de evaluación incompleta.");
          if (payload.status !== "RUNNING") { finish({ result: payload, error: "", completed: state.completed + 1 }); return; }
          update({ error: "" });
        }
        failures = 0;
      } catch (error) {
        failures++;
        if (!pending.id && !pending.uncertain) {
          const uncertain = { ...pending, uncertain: true };
          update({ pending: uncertain }); persist(uncertain);
        }
        update({ error: `${error instanceof Error ? error.message : "Se perdió la conexión."} Conservamos el intento y reintentaremos automáticamente, sin enviar otra solución.` });
      } finally { inFlight = false; }
    },
  };
}
