import "dotenv/config";
import { randomUUID } from "node:crypto";
import { createServer, type Server } from "node:http";
import { test as base, expect, type APIRequestContext } from "@playwright/test";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { postAuth } from "./auth-request";
import { openSimpleEditor } from "../workspace";
import type { ExecutionResult, Language } from "../../src/lib/types";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const slug = `python-evaluation-${randomUUID()}`;
const hiddenMarker = "ENTRADA_OCULTA_NO_PUBLICAR";
const hiddenDebug = "DEPURACION_OCULTA_NO_PUBLICAR";
const hiddenError = "ERROR_OCULTO_NO_PUBLICAR";
const languages = ["python", "javascript", "typescript"] as const;
const variants = new Map<Language, string>();
let exerciseId = "";
let provider: Server;
let online = true;
let executions = 0;
const headers = { origin: "http://127.0.0.1:3000" };
const code = (language: Language, marker = "DOBLE_OK") => language === "python"
  ? `# ${marker}\ndef solve(data):\n    return data['a'] + data['b']\n`
  : `// ${marker}\nfunction solve(data${language === "typescript" ? ": { a: number; b: number }" : ""}) { return data.a + data.b; }`;

const test = base.extend<{ account: string }>({
  account: async ({ page }, runTest) => {
    const email = `python-evaluation-${randomUUID()}@example.test`;
    try {
      const response = await postAuth(page.request, "/api/auth/sign-up/email", { email, password: "Itera-evaluacion-12345", name: "Evaluación temporal" });
      expect(response.ok(), await response.text()).toBe(true);
      await runTest((await db.user.findUniqueOrThrow({ where: { email } })).id);
    } finally { await db.user.deleteMany({ where: { email } }); }
  },
});

test.beforeAll(async () => {
  // Fixture de protocolo, no revisión ni activación de una actividad del catálogo.
  const exercise = await db.exercise.create({ data: {
    slug, category: "Prueba de evaluación", order: 20000,
    versions: { create: {
      published: true, title: "Evaluación temporal", description: "Prueba aislada del protocolo.",
      statement: "Tu tarea\nDevuelve la suma de a y b.", level: "INITIATION", minutes: 5, constraints: [], hints: [],
      variants: { create: languages.map(language => ({
        language, starter: code(language), solution: code(language), explanation: "Suma ambos valores.",
        tests: { create: [
          { order: 0, visible: true, input: { a: 2, b: 3 }, expected: 5, explanation: "Dos más tres." },
          { order: 1, visible: false, input: { a: 37001, b: 11, marker: hiddenMarker }, expected: 37012 },
        ] },
      })) },
    } },
  }, include: { versions: { include: { variants: true } } } });
  exerciseId = exercise.id;
  for (const variant of exercise.versions[0].variants) variants.set(variant.language as Language, variant.id);
  // No evalúa, compila ni interpreta programas: responde según marcadores fijos.
  provider = createServer(async (request, response) => {
    response.setHeader("Content-Type", "application/json");
    if (!online) { response.writeHead(503); response.end("{}"); return; }
    if (request.url === "/api/v2/runtimes") {
      response.end(JSON.stringify(languages.map(language => ({ language, version: language === "python" ? "3.12.0" : language === "javascript" ? "22.0.0" : "5.0.3", aliases: [] })))); return;
    }
    if (request.url !== "/api/v2/execute") { response.writeHead(404); response.end("{}"); return; }
    executions++;
    let raw = "";
    for await (const chunk of request) raw += chunk;
    const payload = JSON.parse(raw) as { files: { content: string }[]; stdin: string };
    const source = payload.files.map(file => file.content).join("\n");
    if (source.includes("DOBLE_INFRA")) { response.writeHead(503); response.end("{}"); return; }
    const input = JSON.parse(payload.stdin) as { a: number; b: number; marker?: string };
    const hidden = input.marker === hiddenMarker;
    const runtimeError = hidden && source.includes("DOBLE_RUNTIME");
    const value = hidden && source.includes("DOBLE_WRONG") ? -987654321 : input.a + input.b;
    response.end(JSON.stringify({ run: {
      stdout: `${hidden ? hiddenDebug : "DEPURACION_VISIBLE"}\n${JSON.stringify(value)}\n`,
      stderr: runtimeError ? hiddenError : "", code: runtimeError ? 1 : 0, signal: null,
    } }));
  });
  await new Promise<void>((resolve, reject) => { provider.once("error", reject); provider.listen(2001, "127.0.0.1", resolve); });
});
test.afterAll(async () => {
  if (provider?.listening) await new Promise<void>(resolve => provider.close(() => resolve()));
  await db.exercise.deleteMany({ where: { slug } });
  await db.$disconnect();
});

async function submit(request: APIRequestContext, language: Language, marker = "DOBLE_OK", extra = {}) {
  const body = { variantId: variants.get(language)!, code: code(language, marker), mode: "submit", idempotencyKey: randomUUID(), ...extra };
  const response = await request.post("/api/executions", { headers, data: body });
  expect(response.status(), await response.text()).toBe(202);
  return { body, id: (await response.json()).id as string };
}
async function finished(request: APIRequestContext, id: string) {
  let result: ExecutionResult;
  await expect.poll(async () => {
    const response = await request.get(`/api/executions/${id}`);
    expect(response.ok()).toBe(true);
    result = await response.json();
    return result.status;
  }).not.toBe("RUNNING");
  return result!;
}
async function privateResults(request: APIRequestContext, id: string, status: string) {
  const result = await finished(request, id);
  expect(result.status).toBe("FAILED");
  expect(result.results[0]).toMatchObject({ input: { a: 2, b: 3 }, expected: 5, actual: 5, output: "DEPURACION_VISIBLE", passed: true });
  expect(result.results[1]).toEqual({ index: 2, visible: false, passed: false, status });
  const stored = await db.submission.findUniqueOrThrow({ where: { id } });
  expect(stored.results).toEqual(result.results);
  for (const marker of [hiddenMarker, hiddenDebug, hiddenError, "37012", "-987654321"]) expect(JSON.stringify(result)).not.toContain(marker);
  return result;
}

test("ejemplos y diagnóstico aprobados no conceden progreso de práctica", async ({ page, account }) => {
  const examples = await submit(page.request, "python", "DOBLE_OK", { mode: "examples" });
  expect(await finished(page.request, examples.id)).toMatchObject({ status: "PASSED", mode: "examples", totalCount: 1, passedCount: 1 });
  const diagnostic = await db.diagnostic.create({ data: {
    userId: account, language: "python", declaredLevel: "BEGINNER",
    items: { create: [0, 1, 2].map(position => ({ variantId: variants.get("python")!, code: code("python"), position })) },
  }, include: { items: { orderBy: { position: "asc" } } } });
  const attempt = await submit(page.request, "python", "DOBLE_OK", { diagnosticItemId: diagnostic.items[0].id });
  expect(await finished(page.request, attempt.id)).toMatchObject({ status: "PASSED", totalCount: 2, passedCount: 2 });
  expect(await db.progress.count({ where: { userId: account } })).toBe(0);
  expect(await db.submission.count({ where: { userId: account } })).toBe(2);
});

test("los casos ocultos fallidos no filtran datos, depuración ni errores en API, base o interfaz", async ({ page, account }) => {
  await page.goto(`/ejercicios/${slug}?lenguaje=python`);
  expect(await (await page.request.get(`/ejercicios/${slug}?lenguaje=python`)).text()).not.toContain(hiddenMarker);
  await openSimpleEditor(page);
  await page.getByRole("textbox", { name: "Editor sencillo de Python", exact: true }).fill(code("python", "DOBLE_WRONG"));
  await page.getByRole("button", { name: "Comprobar solución", exact: true }).click();
  const results = page.getByRole("region", { name: "Resultados de ejecución", exact: true });
  await expect(results.getByText("Tu solución todavía puede mejorar.", { exact: true })).toBeVisible();
  await expect(results.getByText("0 de 1 pruebas ocultas superadas", { exact: true })).toBeVisible();
  await expect(results.getByText("DEPURACION_VISIBLE", { exact: true })).toBeVisible();
  const wrong = await db.submission.findFirstOrThrow({ where: { userId: account } });
  await privateResults(page.request, wrong.id, "wrong");
  for (const marker of [hiddenMarker, hiddenDebug, hiddenError, "37012", "-987654321"]) await expect(page.getByText(marker, { exact: false })).toHaveCount(0);
  const runtime = await submit(page.request, "python", "DOBLE_RUNTIME");
  await privateResults(page.request, runtime.id, "runtime");
  expect(await db.progress.findUniqueOrThrow({ where: { userId_exerciseId_language: { userId: account, exerciseId, language: "python" } } })).toMatchObject({ attempts: 2, firstPassedAt: null });
});

test("una reserva concurrente y sus consultas no duplican finalización; cada lenguaje conserva su progreso", async ({ page, account }) => {
  const body = { variantId: variants.get("python")!, code: code("python"), mode: "submit", idempotencyKey: randomUUID() };
  const before = executions;
  const responses = await Promise.all([page.request.post("/api/executions", { headers, data: body }), page.request.post("/api/executions", { headers, data: body })]);
  for (const response of responses) expect(response.status(), await response.text()).toBe(202);
  const ids = await Promise.all(responses.map(async response => (await response.json()).id as string));
  expect(ids[0]).toBe(ids[1]);
  expect((await finished(page.request, ids[0])).status).toBe("PASSED");
  expect(executions - before).toBe(2);
  for (let retry = 0; retry < 3; retry++) {
    const response = await page.request.post("/api/executions", { headers, data: body });
    expect(response.status()).toBe(202);
    expect((await response.json()).id).toBe(ids[0]);
    expect((await finished(page.request, ids[0])).status).toBe("PASSED");
  }
  expect(executions - before).toBe(2);
  expect(await db.submission.count({ where: { userId: account } })).toBe(1);
  expect((await page.request.post("/api/executions", { headers, data: { ...body, code: "otro código" } })).status()).toBe(409);
  for (const language of ["javascript", "typescript"] as const) {
    const attempt = await submit(page.request, language);
    expect((await finished(page.request, attempt.id)).status).toBe("PASSED");
  }
  const progress = await db.progress.findMany({ where: { userId: account }, orderBy: { language: "asc" } });
  expect(progress.map(row => row.language)).toEqual(["javascript", "python", "typescript"]);
  for (const row of progress) { expect(row.attempts).toBe(1); expect(row.firstPassedAt).not.toBeNull(); }
});

test("la indisponibilidad anterior y posterior a reservar no concede progreso ni cuenta como respuesta incorrecta", async ({ page, account }) => {
  online = false;
  try {
    const response = await page.request.post("/api/executions", { headers, data: { variantId: variants.get("python"), code: code("python"), mode: "submit", idempotencyKey: randomUUID() } });
    expect(response.status()).toBe(503);
    expect(await db.submission.count({ where: { userId: account } })).toBe(0);
  } finally { online = true; }
  const attempt = await submit(page.request, "python", "DOBLE_INFRA");
  expect(await finished(page.request, attempt.id)).toMatchObject({ status: "ERROR", results: [], passedCount: 0 });
  expect(await db.progress.count({ where: { userId: account } })).toBe(0);
  expect(await db.submission.count({ where: { userId: account, status: "FAILED" } })).toBe(0);
  const beforeRetry = executions;
  const duplicate = await page.request.post("/api/executions", { headers, data: attempt.body });
  expect(duplicate.status()).toBe(202);
  expect((await duplicate.json()).id).toBe(attempt.id);
  expect((await finished(page.request, attempt.id)).status).toBe("ERROR");
  expect(executions).toBe(beforeRetry);
  const recovered = await submit(page.request, "python");
  expect((await finished(page.request, recovered.id)).status).toBe("PASSED");
  const progress = await db.progress.findUniqueOrThrow({ where: { userId_exerciseId_language: { userId: account, exerciseId, language: "python" } } });
  expect(progress.attempts).toBe(1);
  expect(progress.firstPassedAt).not.toBeNull();
});
