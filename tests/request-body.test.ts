import { test } from "node:test";
import assert from "node:assert/strict";
import { readLimitedJson, RequestBodyTooLarge } from "../src/lib/request-body";
import { executionSchema } from "../src/lib/validation";
import { maximumExecutionBodyBytes, maximumExecutionCodeLength } from "../src/lib/execution-limits";

function streamed(chunks: Uint8Array[], headers?: HeadersInit) {
  let reads = 0;
  let cancelled = false;
  const body = new ReadableStream<Uint8Array>({
    pull(controller) {
      const chunk = chunks[reads++];
      if (chunk) controller.enqueue(chunk);
      else controller.close();
    },
    cancel() { cancelled = true; },
  }, { highWaterMark: 0 });
  const request = new Request("http://127.0.0.1/api/executions", { method: "POST", headers, body, duplex: "half" } as RequestInit);
  return { request, reads: () => reads, cancelled: () => cancelled };
}

const encode = (text: string) => new TextEncoder().encode(text);

const execution = (code: string) => ({ variantId: "v".repeat(100), diagnosticItemId: "d".repeat(100), mode: "submit", idempotencyKey: "00000000-0000-4000-8000-000000000001", code });

test("admite el código máximo con UTF-8, escapes JSON y todos los metadatos", async () => {
  for (const unit of ["a", "á", "漢", "🙂", "\\", '"', "\n", "\u0000", "\ud800"]) {
    const code = unit.repeat(Math.floor(maximumExecutionCodeLength / unit.length));
    const payload = execution(code);
    assert.equal(code.length, maximumExecutionCodeLength);
    const bytes = encode(JSON.stringify(payload));
    const decoded = await readLimitedJson(streamed([bytes]).request, maximumExecutionBodyBytes);
    assert.deepEqual(executionSchema.parse(decoded), payload);
    assert.equal(executionSchema.safeParse(execution(code + "a")).success, false);
  }
});

test("acepta escapes Unicode explícitos sin dejar que la codificación cambie el límite de código", async () => {
  const payload = execution("á".repeat(maximumExecutionCodeLength));
  const bytes = encode(JSON.stringify(payload).replaceAll("á", "\\u00e1"));
  assert.ok(bytes.length > 180000);
  assert.deepEqual(executionSchema.parse(await readLimitedJson(streamed([bytes]).request, maximumExecutionBodyBytes)), payload);
  const tooLong = execution("á".repeat(maximumExecutionCodeLength + 1));
  const decoded = await readLimitedJson(streamed([encode(JSON.stringify(tooLong))]).request, maximumExecutionBodyBytes);
  assert.equal(executionSchema.safeParse(decoded).success, false);
});

test("el presupuesto real sigue rechazando bytes sobrantes aunque el JSON tenga código corto", async () => {
  const bytes = encode(JSON.stringify(execution("a")).padEnd(maximumExecutionBodyBytes + 1, " "));
  for (const headers of [undefined, { "content-length": "1" }, { "content-length": String(bytes.length) }]) {
    await assert.rejects(readLimitedJson(streamed([bytes], headers).request, maximumExecutionBodyBytes), RequestBodyTooLarge);
  }
});

test("lee JSON en el límite exacto y conserva Unicode fragmentado", async () => {
  const bytes = encode('{"code":"á🙂"}');
  const input = streamed(Array.from(bytes, byte => Uint8Array.of(byte)));
  assert.deepEqual(await readLimitedJson(input.request, bytes.length), { code: "á🙂" });
});

for (const headers of [undefined, { "content-length": "1" }]) {
  test(`corta el flujo al superar bytes ${headers ? "con longitud falsa" : "sin longitud"}`, async () => {
    const input = streamed([encode('"'), encode("ááá"), encode('resto"')], headers);
    await assert.rejects(readLimitedJson(input.request, 5), RequestBodyTooLarge);
    assert.equal(input.reads(), 2);
    assert.equal(input.cancelled(), true);
  });
}

test("rechaza una longitud declarada excesiva sin leer", async () => {
  const input = streamed([encode("{}")], { "content-length": "100" });
  await assert.rejects(readLimitedJson(input.request, 10), RequestBodyTooLarge);
  assert.equal(input.reads(), 0);
  assert.equal(input.cancelled(), true);
});

test("rechaza JSON vacío, mal formado y UTF-8 inválido", async () => {
  for (const bytes of [encode(""), encode("{"), Uint8Array.of(0xff)]) {
    await assert.rejects(readLimitedJson(streamed([bytes]).request, 100));
  }
  await assert.rejects(readLimitedJson(new Request("http://127.0.0.1"), 100), SyntaxError);
});

test("un productor que no termina de cancelar no retrasa el rechazo", async () => {
  const body = new ReadableStream<Uint8Array>({
    start(controller) { controller.enqueue(encode("demasiado")); },
    cancel() { return new Promise(() => {}); },
  });
  const request = new Request("http://127.0.0.1", { method: "POST", body, duplex: "half" } as RequestInit);
  await assert.rejects(readLimitedJson(request, 2), RequestBodyTooLarge);
});
