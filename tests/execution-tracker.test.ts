import { test } from "node:test";
import assert from "node:assert/strict";
import { createExecutionTracker, readPendingExecution } from "../src/lib/execution-tracker";

const key = "itera:execution:cuenta:variante";
const context = { variantId: "variante" };
const done = { id: "intento", status: "PASSED", mode: "submit", passedCount: 1, totalCount: 1, results: [] };
const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status });
function fixture(fetcher: typeof fetch, initial?: string) {
  const values = new Map<string, string>(initial ? [[key, initial]] : []);
  const storage = { getItem: (name: string) => values.get(name) ?? null, setItem: (name: string, value: string) => { values.set(name, value); }, removeItem: (name: string) => { values.delete(name); } };
  const options = { ...context, key, storage: () => storage, fetch: fetcher };
  return { tracker: createExecutionTracker(options), options, storage, values };
}

test("persiste clave y contenido antes del POST y no admite otro código o modo pendiente", async () => {
  const calls: string[] = [];
  const { tracker, values } = fixture(async (_url, init) => {
    const saved = JSON.parse(values.get(key)!);
    assert.deepEqual(JSON.parse(init!.body as string), saved.request);
    calls.push(init!.body as string); return json({ id: "intento" }, 202);
  });
  assert.equal(tracker.start("código original", "submit"), true);
  assert.equal(calls.length, 0);
  assert.equal(tracker.start("otro código", "examples"), false);
  await tracker.step();
  assert.equal(calls.length, 1);
  assert.equal(tracker.getSnapshot().pending?.request?.code, "código original");
  assert.equal(tracker.getSnapshot().pending?.id, "intento");
});

test("una respuesta perdida se reintenta con el mismo cuerpo tras recargar", async () => {
  const bodies: string[] = [];
  let first = true;
  const { tracker, options } = fixture(async (_url, init) => {
    bodies.push(init!.body as string);
    if (first) { first = false; throw new TypeError("Respuesta perdida"); }
    return json({ id: "intento" }, 202);
  });
  tracker.start("instantánea", "examples"); await tracker.step();
  assert.match(tracker.getSnapshot().error, /reintentaremos automáticamente/);
  assert.ok(tracker.getSnapshot().pending);
  const reloaded = createExecutionTracker(options);
  assert.equal(reloaded.start("nuevo código", "submit"), false);
  await reloaded.step();
  assert.deepEqual(bodies, [bodies[0], bodies[0]]);
  assert.equal(reloaded.getSnapshot().pending?.id, "intento");
});

test("un GET temporal, una sesión caducada y una consulta inexistente no habilitan otro envío", async () => {
  const replies = [() => { throw new TypeError("Sin red"); }, () => json({ error: "Inicia sesión" }, 401), () => json({ error: "No disponible" }, 404), () => json(done)];
  const urls: string[] = [];
  const { tracker, values } = fixture(async url => { urls.push(String(url)); return replies.shift()!(); }, "intento");
  for (let i = 0; i < 3; i++) { await tracker.step(); assert.ok(tracker.getSnapshot().pending); assert.equal(tracker.start("nuevo", "submit"), false); }
  await tracker.step();
  assert.equal(tracker.getSnapshot().pending, null);
  assert.equal(tracker.getSnapshot().result?.id, "intento");
  assert.equal(tracker.getSnapshot().error, "");
  assert.equal(values.has(key), false);
  assert.deepEqual(urls, Array(4).fill("/api/executions/intento"));
});

test("un fallo de almacenamiento antes de enviar no crea una petición irrecuperable", async () => {
  let calls = 0;
  const { tracker, storage } = fixture(async () => { calls++; return json({ id: "intento" }); });
  storage.setItem = () => { throw new Error("Cuota llena"); };
  assert.equal(tracker.start("código", "submit"), false);
  await tracker.step();
  assert.equal(calls, 0);
  assert.match(tracker.getSnapshot().error, /No se ha enviado/);
});

test("un id aceptado sigue en memoria aunque falle persistirlo, y la copia previa recupera la clave", async () => {
  const { tracker, storage, options, values } = fixture(async (_url, init) => init?.method === "POST" ? json({ id: "intento" }, 202) : json(done));
  tracker.start("código", "submit");
  const original = storage.setItem;
  storage.setItem = () => { throw new Error("Sin espacio"); };
  await tracker.step();
  assert.equal(tracker.getSnapshot().pending?.id, "intento");
  assert.match(tracker.getSnapshot().storageError, /No cierres/);
  assert.equal(JSON.parse(values.get(key)!).id, undefined);
  const reloaded = createExecutionTracker(options);
  await reloaded.step();
  assert.equal(reloaded.getSnapshot().pending?.id, "intento");
  storage.setItem = original;
  await tracker.step();
  assert.equal(tracker.getSnapshot().result?.status, "PASSED");
});

test("un fallo al limpiar no oculta el resultado ni reevalúa tras recargar", async () => {
  let gets = 0;
  const { tracker, options, storage } = fixture(async (_url, init) => { assert.notEqual(init?.method, "POST"); gets++; return json(done); }, "intento");
  storage.removeItem = () => { throw new Error("Denegado"); };
  await tracker.step();
  assert.equal(tracker.getSnapshot().result?.status, "PASSED");
  assert.equal(tracker.getSnapshot().pending, null);
  assert.match(tracker.getSnapshot().storageError, /resultado está disponible/);
  const reloaded = createExecutionTracker(options); await reloaded.step();
  assert.equal(gets, 2);
});

test("el rechazo explícito de una primera petición libera el envío sin reintentar", async () => {
  for (const status of [400, 401, 403, 404, 409, 413, 429, 503]) {
    const { tracker } = fixture(async () => json({ error: "Rechazado" }, status));
    tracker.start("código", "submit"); await tracker.step();
    assert.equal(tracker.getSnapshot().pending, null);
    assert.equal(tracker.getSnapshot().error, "Rechazado");
  }
});

test("un rechazo posterior a respuesta incierta no descarta una reserva que podría seguir en vuelo", async () => {
  let calls = 0;
  const { tracker } = fixture(async () => { if (++calls === 1) throw new Error("Sin respuesta"); return json({ error: "Ocupado" }, 429); });
  tracker.start("código", "submit"); await tracker.step(); await tracker.step();
  assert.ok(tracker.getSnapshot().pending);
  assert.equal(tracker.start("otro", "submit"), false);
});

test("respuestas truncadas, no JSON o con estado desconocido conservan el seguimiento", async () => {
  for (const response of [new Response("<html>Error</html>"), json({}), json({ ...done, status: "DESCONOCIDO" }), json({ ...done, id: "ajeno" })]) {
    const { tracker } = fixture(async () => response, "intento"); await tracker.step();
    assert.ok(tracker.getSnapshot().pending); assert.equal(tracker.getSnapshot().result, null);
  }
  const { tracker } = fixture(async () => json({})); tracker.start("código", "examples"); await tracker.step();
  assert.ok(tracker.getSnapshot().pending?.request);
});

test("reintenta con espera creciente acotada, sin abandonar el intento", async () => {
  const { tracker } = fixture(async () => { throw new Error("Sin conexión"); }, "intento");
  const delays = [];
  for (let i = 0; i < 10; i++) { await tracker.step(); delays.push(tracker.getDelay()); }
  assert.deepEqual(delays, [1000, 2000, 4000, 8000, 16000, 30000, 30000, 30000, 30000, 30000]);
  assert.ok(tracker.getSnapshot().pending);
});

test("una evaluación RUNNING no se abandona por un número arbitrario de consultas", async () => {
  const { tracker } = fixture(async () => json({ ...done, status: "RUNNING" }), "intento");
  for (let i = 0; i < 110; i++) await tracker.step();
  assert.equal(tracker.getSnapshot().pending?.id, "intento");
  assert.equal(tracker.getSnapshot().error, "");
});

test("evita peticiones simultáneas y genera una clave nueva solo tras finalizar", async () => {
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  let calls = 0;
  const { tracker } = fixture(async (_url, init) => { calls++; await gate; return init?.method === "POST" ? json({ id: "intento" }) : json(done); });
  tracker.start("código", "submit"); const firstKey = tracker.getSnapshot().pending?.request?.idempotencyKey;
  const first = tracker.step(); await tracker.step(); assert.equal(calls, 1);
  release(); await first; await tracker.step();
  tracker.start("otro código", "examples");
  assert.notEqual(tracker.getSnapshot().pending?.request?.idempotencyKey, firstKey);
});

test("aísla cuenta y contexto y relee un intento abierto antes de crear otro", () => {
  const { tracker, options, values } = fixture(async () => json({}));
  tracker.start("original", "submit");
  const raw = values.get(key)!;
  assert.ok(readPendingExecution(raw, context));
  assert.equal(readPendingExecution(raw, { variantId: "ajena" }), null);
  assert.equal(readPendingExecution(raw, { ...context, diagnosticItemId: "diagnóstico" }), null);
  assert.equal(createExecutionTracker({ ...options, key: "otra-cuenta" }).getSnapshot().pending, null);
  const before = createExecutionTracker({ ...options, key: "otra-ficha" });
  values.set("otra-ficha", raw);
  assert.equal(before.start("otro", "examples"), false);
  assert.equal(before.getSnapshot().pending?.request?.code, "original");
});

test("recupera un diagnóstico RUNNING desde el servidor sin volver a enviarlo", async () => {
  const { options } = fixture(async (_url, init) => { assert.notEqual(init?.method, "POST"); return json(done); });
  const tracker = createExecutionTracker({ ...options, initialResult: { ...done, status: "RUNNING" } });
  assert.equal(tracker.start("otro", "submit"), false); await tracker.step();
  assert.equal(tracker.getSnapshot().result?.status, "PASSED");
});

test("rechaza seguimientos dañados sin enviar código automáticamente", async () => {
  for (const raw of ["{", "null", "[]", JSON.stringify({ version: 2, id: "id" }), JSON.stringify({ version: 1, request: { ...context, code: 1 } })]) {
    assert.equal(readPendingExecution(raw, context), null);
    let calls = 0;
    const { tracker } = fixture(async () => { calls++; return json({}); }, raw);
    assert.equal(tracker.start("nuevo", "submit"), false); await tracker.step(); assert.equal(calls, 0);
  }
});
