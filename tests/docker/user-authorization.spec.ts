import { randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { test, expect, type APIRequestContext, type BrowserContext, type Request } from "@playwright/test";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { postAuth } from "../e2e/auth-request";
import { openSimpleEditor } from "../workspace";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const origin = "http://127.0.0.1:3000";
test.afterAll(async () => { await db.$disconnect(); });

// Captura el identificador vigente desde una acción normal de la interfaz, sin
// fijarlo al build. La repetición mantiene las cookies del contexto destinatario,
// nunca las del propietario de la petición original. No intercepta respuestas.
async function replay(request: APIRequestContext, captured: Request, changes: Record<string, unknown>) {
  const args: unknown[] = JSON.parse(captured.postData() ?? "null");
  expect(Array.isArray(args)).toBe(true);
  expect(args).toHaveLength(1);
  expect(typeof args[0]).toBe("object");
  const headers = await captured.allHeaders();
  expect(headers["next-action"]).toBeTruthy();
  const response = await request.post(captured.url(), {
    headers: { origin, "next-action": headers["next-action"], "content-type": headers["content-type"] },
    data: JSON.stringify([{ ...args[0] as object, ...changes }]),
  });
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("text/x-component");
  return response.text();
}

test("dos cuentas no comparten intentos ni borradores aunque se falsifique el propietario", async ({ browser }) => {
  const run = randomUUID();
  const userIds = [randomUUID(), randomUUID()];
  const exerciseId = randomUUID();
  const variantId = randomUUID();
  const slug = `authorization-${run}`;
  const title = `Autorización temporal ${run}`;
  const markerA = `PRIVADO_A_${run}`;
  const markerB = `PRIVADO_B_${run}`;
  const codeA = `// ${markerA}\nfunction solve(data) { return data; }`;
  const codeB = `// ${markerB}\nfunction solve(data) { return data; }`;
  const password = "cuatro faros iluminan el camino";
  const contexts: BrowserContext[] = [];
  try {
    const hash = await hashPassword(password);
    for (const [index, id] of userIds.entries()) {
      await db.user.create({ data: {
        id, email: `authorization-${index}-${run}@example.test`, name: `Autorización ${index}`, onboardingStep: 4,
        accounts: { create: { id: randomUUID(), accountId: id, providerId: "credential", password: hash } },
      } });
    }
    // Contenido e intentos sintéticos, solo para probar autorización. No se evalúa
    // código, no se conceden finalizaciones ni se modifica el catálogo existente.
    await db.exercise.create({ data: {
      id: exerciseId, slug, category: "Prueba temporal", order: 100000, published: true,
      versions: { create: {
        published: true, title, description: "Prueba temporal de autorización", statement: "Devuelve el dato recibido.",
        level: "BEGINNER", minutes: 1, constraints: [], hints: [],
        variants: { create: {
          id: variantId, language: "javascript", starter: "function solve(data) { return data; }",
          solution: "function solve(data) { return data; }", explanation: "Prueba temporal.",
          tests: { create: { input: 1, expected: 1, visible: true, order: 0 } },
        } },
      } },
    } });
    await db.draft.create({ data: { userId: userIds[0], variantId, code: "// borrador inicial A", revision: 7 } });
    const attempt = await db.submission.create({ data: {
      userId: userIds[0], variantId, code: codeA, mode: "examples", status: "FAILED", idempotencyKey: randomUUID(),
      totalCount: 1, finishedAt: new Date(), results: [{ visible: true, syntheticDetail: "DETALLE_SOLO_ENDPOINT" }],
    } });

    for (const [index] of userIds.entries()) {
      const context = await browser.newContext({ baseURL: origin });
      contexts.push(context);
      const login = await postAuth(context.request, "/api/auth/sign-in/email", { email: `authorization-${index}-${run}@example.test`, password });
      expect(login.ok()).toBe(true);
    }
    const anonymous = await browser.newContext({ baseURL: origin });
    contexts.push(anonymous);
    const [a, b] = contexts;
    const pageA = await a.newPage();
    const pageB = await b.newPage();
    const path = `/ejercicios/${slug}?lenguaje=javascript`;
    const editor = (page: typeof pageA) => page.getByRole("textbox", { name: "Editor sencillo de JavaScript" });
    const draftA = () => db.draft.findUniqueOrThrow({ where: { userId_variantId: { userId: userIds[0], variantId } } });
    const draftB = () => db.draft.findUnique({ where: { userId_variantId: { userId: userIds[1], variantId } } });

    await test.step("la lectura HTTP de intentos distingue propietario, otra cuenta e invitado", async () => {
      const own = await a.request.get(`/api/executions/${attempt.id}`);
      expect(own.status()).toBe(200);
      expect(own.headers()["cache-control"]).toBe("no-store");
      expect((await own.json()).id).toBe(attempt.id);
      const foreign = await b.request.get(`/api/executions/${attempt.id}?userId=${userIds[0]}`);
      const missing = await b.request.get(`/api/executions/${randomUUID()}`);
      expect(foreign.status()).toBe(404);
      expect(missing.status()).toBe(404);
      expect(await foreign.json()).toEqual(await missing.json());
      expect((await anonymous.request.get(`/api/executions/${attempt.id}`)).status()).toBe(401);
    });

    await test.step("el historial real ignora userId ajeno y solo devuelve el resumen propio", async () => {
      await pageA.goto("/progreso?lenguaje=javascript");
      const captured = pageA.waitForRequest(request => request.method() === "POST" && (request.postData() ?? "").includes(exerciseId));
      await pageA.getByRole("button", { name: new RegExp(title) }).click();
      const history = await captured;
      const own = await replay(a.request, history, {});
      expect(own).toContain(markerA);
      expect(own).not.toContain("DETALLE_SOLO_ENDPOINT");
      const foreign = await replay(b.request, history, { userId: userIds[0] });
      expect(foreign).toContain('"entries":[]');
      expect(foreign).not.toContain(markerA);
      expect(foreign).not.toContain(attempt.id);
      await pageB.goto("/progreso?lenguaje=javascript");
      await expect(pageB.getByRole("button", { name: new RegExp(title) })).toHaveCount(0);
    });

    let save: Request;
    await test.step("el guardado normal proporciona una petición real y la otra cuenta no recibe el borrador", async () => {
      await pageA.goto(path);
      await openSimpleEditor(pageA);
      const captured = pageA.waitForRequest(request => request.method() === "POST" && (request.postData() ?? "").includes(markerA));
      await editor(pageA).fill(codeA);
      save = await captured;
      await expect.poll(async () => (await draftA()).revision).toBe(8);
      expect((await draftA()).code).toBe(codeA);
      const responseB = await pageB.goto(path);
      expect(await responseB!.text()).not.toContain(markerA);
      await openSimpleEditor(pageB);
      await expect(editor(pageB)).toHaveValue("function solve(data) { return data; }");
    });

    await test.step("revisión ajena e invitado no escriben ni reciben el código del propietario", async () => {
      const baseline = await draftA();
      const foreign = await replay(b.request, save, { userId: userIds[0], code: "// intrusión", revision: 8 });
      expect(foreign).toContain('"kind":"conflict"');
      expect(foreign).not.toContain(markerA);
      expect(await draftA()).toEqual(baseline);
      expect(await draftB()).toBeNull();
      const guest = await replay(anonymous.request, save, { userId: userIds[0], code: "// invitado", revision: 0 });
      expect(guest).toContain('"kind":"auth"');
      expect(guest).not.toContain(markerA);
      expect(await draftA()).toEqual(baseline);
    });

    await test.step("crear y actualizar con userId falsificado solo afecta a la cuenta autenticada", async () => {
      const baseline = await draftA();
      const created = await replay(b.request, save, { userId: userIds[0], code: codeB, revision: 0 });
      expect(created).toContain('"revision":1');
      expect(await draftB()).toMatchObject({ userId: userIds[1], code: codeB, revision: 1 });
      const updated = await replay(b.request, save, { userId: userIds[0], code: `${codeB}\n// actualizado`, revision: 1 });
      expect(updated).toContain('"revision":2');
      const baselineB = await draftB();
      expect(baselineB).toMatchObject({ code: `${codeB}\n// actualizado`, revision: 2 });
      const stale = await replay(b.request, save, { userId: userIds[0], code: "// obsoleto", revision: 1 });
      expect(stale).toContain('"kind":"conflict"');
      expect(await draftB()).toEqual(baselineB);
      expect(await draftA()).toEqual(baseline);
      // Eliminar la copia del navegador obliga a comprobar el borrador del servidor.
      for (const [page, ownMarker, otherMarker] of [[pageA, markerA, markerB], [pageB, markerB, markerA]] as const) {
        await page.evaluate(() => localStorage.clear());
        const response = await page.reload();
        const html = await response!.text();
        expect(html).toContain(ownMarker);
        expect(html).not.toContain(otherMarker);
        await openSimpleEditor(page);
        await expect(editor(page)).toHaveValue(new RegExp(ownMarker));
      }
      expect(await db.progress.count({ where: { userId: { in: userIds } } })).toBe(0);
    });

    await test.step("el aislamiento también se conserva al invertir propietario y solicitante", async () => {
      const other = await db.submission.create({ data: {
        userId: userIds[1], variantId, code: codeB, mode: "examples", status: "FAILED", idempotencyKey: randomUUID(), finishedAt: new Date(),
      } });
      expect((await b.request.get(`/api/executions/${other.id}`)).status()).toBe(200);
      expect((await a.request.get(`/api/executions/${other.id}?userId=${userIds[1]}`)).status()).toBe(404);
      // Capturar de nuevo desde la interfaz: no se conservan IDs de acción entre builds.
      await pageA.goto("/progreso?lenguaje=javascript");
      const pending = pageA.waitForRequest(request => request.method() === "POST" && (request.postData() ?? "").includes(exerciseId));
      await pageA.getByRole("button", { name: new RegExp(title) }).click();
      const history = await pending;
      for (const [context, forgedId, ownMarker, otherMarker] of [[a, userIds[1], markerA, markerB], [b, userIds[0], markerB, markerA]] as const) {
        const result = await replay(context.request, history, { userId: forgedId });
        expect(result).toContain(ownMarker);
        expect(result).not.toContain(otherMarker);
      }
    });
  } finally {
    // Cerrar navegadores antes de borrar fixtures evita guardados tardíos.
    try { await Promise.all(contexts.map(context => context.close())); }
    finally {
      try { await db.exercise.deleteMany({ where: { id: exerciseId } }); }
      finally {
        await db.auditLog.deleteMany({ where: { userId: { in: userIds } } });
        await db.user.deleteMany({ where: { id: { in: userIds } } });
      }
    }
  }
});
