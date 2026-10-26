import { test } from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";

test("la evaluación conserva su presupuesto y detiene el trabajo finalizado sin conceder progreso tardío", async t => {
  const start = Date.UTC(2026, 9, 25);
  let now = start;
  let status = "RUNNING";
  let createdAt = new Date(start);
  let mode = "submit";
  let diagnosticItemId: string | null = null;
  let language = "typescript";
  let conceptRule = "";
  let calls = 0;
  let concepts = 0;
  let runtimes = 0;
  let attempts = 0;
  let passed = false;
  let elapsed = 15000;
  let whileRunning: (() => Promise<void>) | null = null;
  let beforeTransaction: (() => void) | null = null;
  let results: unknown = null;
  let message = "";
  let runnerError = false;
  const cases = Array.from({ length: 10 }, (_, order) => ({ order, input: order, expected: order, visible: order < 2 }));
  type Where = { id?: string | { in: string[] }; status?: string; createdAt?: { lt?: Date; lte?: Date; gt?: Date; gte?: Date } };
  function matches(where: Where) {
    if (where.id && (typeof where.id === "string" ? where.id !== "intento" : !where.id.in.includes("intento"))) return false;
    if (where.status && where.status !== status) return false;
    const date = where.createdAt;
    return !(date?.lt && createdAt >= date.lt || date?.lte && createdAt > date.lte || date?.gt && createdAt <= date.gt || date?.gte && createdAt < date.gte);
  }
  function submission() {
    return { id: "intento", userId: "cuenta", code: "código privado", status, createdAt, mode, diagnosticItemId, totalCount: mode === "examples" ? 2 : 10,
      variant: { language, typeContract: "", tests: cases, version: { exerciseId: "ejercicio", runtimeMode: "FUNCTION", conceptRule } } };
  }
  const models = {
    submission: {
      findUnique: async () => submission(),
      findFirst: async ({ where }: { where: Where }) => matches(where) ? { id: "intento", status } : null,
      findMany: async ({ where }: { where: Where }) => matches(where) ? [submission()] : [],
      updateMany: async ({ where, data }: { where: Where; data: { status: string; results?: unknown; message?: string } }) => {
        if (!matches(where)) return { count: 0 };
        status = data.status;
        if (data.message) message = data.message;
        if (data.results) results = data.results;
        return { count: 1 };
      },
    },
    progress: {
      upsert: async () => { attempts++; },
      updateMany: async () => { passed = true; },
    },
  };
  const db = { ...models, $transaction: async <T>(callback: (tx: typeof models) => Promise<T>): Promise<T> => { beforeTransaction?.(); return callback(models); } };
  const key = Symbol.for("itera:test:execution-lifecycle");
  const globals = globalThis as typeof globalThis & { [key: symbol]: unknown };
  globals[key] = {
    db,
    availableRuntime: async () => { runtimes++; return { language, version: "1" }; },
    runCode: async (_language: string, _runtime: unknown, _code: string, input: unknown) => {
      calls++; now += elapsed; await whileRunning?.();
      if (runnerError) throw new Error("detalle privado del proveedor");
      return { stdout: JSON.stringify(input), stderr: "", code: 0 };
    },
    checkConcept: async (_language: string, _code: string, policy: string) => { if (!policy) return null; concepts++; now += 20000; await whileRunning?.(); return null; },
  };
  const hooks = registerHooks({
    resolve(specifier, context, next) {
      const parent = decodeURI(context.parentURL ?? "").replaceAll("\\", "/");
      if (parent.endsWith("/src/server/execution/service.ts")) {
        const targets: Record<string, string> = { "server-only": "empty", "@/server/db": "db", "./piston": "piston", "./concepts": "concepts" };
        if (targets[specifier]) return { url: `itera-execution-lifecycle:${targets[specifier]}`, shortCircuit: true };
      }
      return next(specifier, context);
    },
    load(url, context, next) {
      if (!url.startsWith("itera-execution-lifecycle:")) return next(url, context);
      const sources: Record<string, string> = {
        empty: "",
        db: "export const {db} = state;",
        piston: "export const {availableRuntime, runCode} = state; export class RunnerUnavailable extends Error {}",
        concepts: "export const {checkConcept} = state;",
      };
      return { format: "module", source: 'const state = globalThis[Symbol.for("itera:test:execution-lifecycle")];' + sources[url.split(":")[1]], shortCircuit: true };
    },
  });
  const originalNow = Date.now;
  Date.now = () => now;
  function reset() {
    now = start; status = "RUNNING"; createdAt = new Date(start); mode = "submit"; diagnosticItemId = null; language = "typescript"; conceptRule = "";
    calls = 0; concepts = 0; runtimes = 0; attempts = 0; passed = false; elapsed = 15000; whileRunning = null; beforeTransaction = null; results = null; message = ""; runnerError = false;
  }
  try {
    const { evaluateSubmission, expireInterruptedSubmissions } = await import("../src/server/execution/service");

    await t.test("diez casos TypeScript de 15 segundos sobreviven a la reconciliación de los 120 segundos", async () => {
      reset(); whileRunning = expireInterruptedSubmissions;
      await evaluateSubmission("intento");
      assert.equal(calls, 10); assert.equal(now - start, 150000);
      assert.equal(status, "PASSED"); assert.equal(attempts, 1); assert.equal(passed, true);
      await evaluateSubmission("intento");
      assert.equal(calls, 10); assert.equal(attempts, 1);
    });

    await t.test("reconciliación y evaluación usan el mismo límite exacto, incluido el análisis conceptual", async () => {
      for (const conceptual of [false, true]) {
        reset(); conceptRule = conceptual ? "regla" : "";
        const budget = conceptual ? 310000 : 282500;
        now = start + budget - 1; await expireInterruptedSubmissions(); assert.equal(status, "RUNNING");
        now++; await expireInterruptedSubmissions(); assert.equal(status, "ERROR");
        await evaluateSubmission("intento"); assert.equal(runtimes, 0); assert.equal(attempts, 0);
      }
      reset(); mode = "examples"; language = "python"; now = start + 120000;
      await expireInterruptedSubmissions(); assert.equal(status, "ERROR");
    });

    await t.test("no inicia el runtime de un intento ya caducado aunque nadie haya consultado su estado", async () => {
      reset(); createdAt = new Date(start - 600000);
      await evaluateSubmission("intento");
      assert.equal(status, "ERROR"); assert.equal(runtimes, 0); assert.equal(calls, 0); assert.equal(attempts, 0);
    });

    await t.test("un cambio de estado durante un caso impide los casos restantes y la comprobación conceptual", async () => {
      for (const terminal of ["ERROR", "FAILED", "PASSED"]) {
        reset(); conceptRule = "regla"; whileRunning = async () => { status = terminal; };
        await evaluateSubmission("intento");
        assert.equal(calls, 1); assert.equal(concepts, 0); assert.equal(status, terminal); assert.equal(attempts, 0);
      }
    });

    await t.test("superar el presupuesto durante un caso detiene el resto sin progreso", async () => {
      reset(); elapsed = 600000;
      await evaluateSubmission("intento");
      assert.equal(calls, 1); assert.equal(status, "ERROR"); assert.equal(attempts, 0); assert.equal(passed, false);
    });

    await t.test("si la transacción se retrasa más allá del presupuesto no finaliza ni concede progreso", async () => {
      reset(); elapsed = 1; beforeTransaction = () => { now += 600000; };
      await evaluateSubmission("intento");
      assert.equal(status, "ERROR"); assert.equal(attempts, 0); assert.equal(passed, false);
    });

    await t.test("la pérdida de estado durante el análisis conceptual tampoco finaliza", async () => {
      reset(); elapsed = 1; conceptRule = "regla";
      whileRunning = async () => { if (concepts) status = "ERROR"; };
      await evaluateSubmission("intento");
      assert.equal(concepts, 1); assert.equal(status, "ERROR"); assert.equal(attempts, 0);
    });

    await t.test("ejemplos y diagnósticos finalizan sin escribir progreso y filtran casos ocultos", async () => {
      for (const diagnostic of [false, true]) {
        reset(); elapsed = 1;
        if (diagnostic) diagnosticItemId = "ítem"; else mode = "examples";
        await evaluateSubmission("intento");
        assert.equal(status, "PASSED"); assert.equal(calls, diagnostic ? 10 : 2); assert.equal(attempts, 0);
        if (diagnostic) for (const entry of results as Record<string, unknown>[]) if (!entry.visible) assert.deepEqual(Object.keys(entry).sort(), ["index", "passed", "status", "visible"]);
      }
    });

    await t.test("los errores de infraestructura no conceden progreso ni revelan el detalle del proveedor", async () => {
      reset(); runnerError = true;
      await evaluateSubmission("intento");
      assert.equal(status, "ERROR"); assert.equal(attempts, 0); assert.equal(passed, false);
      assert.ok(!message.includes("detalle privado"));
    });
  } finally { Date.now = originalNow; hooks.deregister(); delete globals[key]; }
});
