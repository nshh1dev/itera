import { after, NextResponse } from "next/server";
import { currentUser } from "@/server/auth";
import { db } from "@/server/db";
import { executionSchema } from "@/lib/validation";
import { availableRuntime, RunnerUnavailable } from "@/server/execution/piston";
import { evaluateSubmission, expireInterruptedSubmissions } from "@/server/execution/service";
import type { Language } from "@/lib/types";
import { readLimitedJson, RequestBodyTooLarge } from "@/lib/request-body";
import { maximumExecutionBodyBytes } from "@/lib/execution-limits";
import { isDeepStrictEqual } from "node:util";
import { validateProjectDefinition, validateProjectSnapshot } from "@/lib/project";
import { Prisma } from "@/generated/prisma/client";

export const runtime = "nodejs";

export async function POST(request: Request) {
  // Las cookies no bastan: los endpoints de mutación también comprueban el origen.
  const origin = request.headers.get("origin");
  if (!origin || !["http://localhost:3000", "http://127.0.0.1:3000"].includes(origin)) return NextResponse.json({ error: "Origen no permitido." }, { status: 403 });
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Inicia sesión para ejecutar y guardar tu progreso." }, { status: 401 });
  let body;
  try { body = await readLimitedJson(request, maximumExecutionBodyBytes); }
  catch (error) {
    if (error instanceof RequestBodyTooLarge) return NextResponse.json({ error: "El cuerpo de la solicitud es demasiado grande." }, { status: 413 });
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
  const parsed = executionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Revisa el código o los archivos del proyecto y vuelve a intentarlo." }, { status: 400 });
  const input = parsed.data;
  const existing = await db.submission.findUnique({ where: { userId_idempotencyKey: { userId: user.id, idempotencyKey: input.idempotencyKey } }, select: { id: true, variantId: true, code: true, files: true, mode: true, diagnosticItemId: true } });
  if (existing) {
    if (existing.variantId !== input.variantId || existing.code !== (input.code ?? "") || !isDeepStrictEqual(existing.files, input.files ?? null) || existing.mode !== input.mode || existing.diagnosticItemId !== (input.diagnosticItemId ?? null)) return NextResponse.json({ error: "La clave del intento ya fue utilizada con otro programa." }, { status: 409 });
    return NextResponse.json({ id: existing.id }, { status: 202 });
  }
  const diagnosticWhere = { id: input.diagnosticItemId, variantId: input.variantId, diagnostic: { userId: user.id, finishedAt: null } };
  if (input.diagnosticItemId && !await db.diagnosticItem.findFirst({ where: diagnosticWhere })) return NextResponse.json({ error: "Diagnóstico no disponible." }, { status: 404 });
  const variant = await db.exerciseVariant.findFirst({ where: { id: input.variantId, ...(!input.diagnosticItemId ? { version: { published: true, exercise: { published: true } } } : {}) }, select: { id: true, language: true, project: true, tests: { select: { visible: true } } } });
  if (!variant) return NextResponse.json({ error: "Ejercicio no disponible." }, { status: 404 });
  let projectFiles: ReturnType<typeof validateProjectSnapshot> | undefined;
  try {
    if (input.mode === "tests" && (input.diagnosticItemId || !variant.project)) return NextResponse.json({ error: "Las pruebas propias solo están disponibles en proyectos publicados." }, { status: 400 });
    if (variant.project) {
      if (!input.files) return NextResponse.json({ error: "Este ejercicio requiere el proyecto completo." }, { status: 400 });
      projectFiles = validateProjectSnapshot(validateProjectDefinition(variant.project), input.files);
      if (input.mode === "tests" && !validateProjectDefinition(variant.project).testEntrypoint) return NextResponse.json({ error: "Este proyecto no tiene un archivo de pruebas propias." }, { status: 400 });
    } else if (input.files || !input.code) return NextResponse.json({ error: "Este ejercicio requiere código de un archivo." }, { status: 400 });
  } catch { return NextResponse.json({ error: "Los archivos del proyecto no coinciden con su manifiesto publicado." }, { status: 400 }); }
  try { await availableRuntime(variant.language as Language); }
  catch (error) { return NextResponse.json({ error: error instanceof RunnerUnavailable ? error.message : "El ejecutor no está disponible." }, { status: 503 }); }
  await expireInterruptedSubmissions();
  const result = await db.$transaction(async tx => {
    // Un bloqueo corto serializa las reservas. Nunca se mantiene durante la ejecución.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(742901)`;
    const duplicate = await tx.submission.findUnique({ where: { userId_idempotencyKey: { userId: user.id, idempotencyKey: input.idempotencyKey } } });
     if (duplicate) return duplicate.code === (input.code ?? "") && isDeepStrictEqual(duplicate.files, input.files ?? null) && duplicate.variantId === input.variantId && duplicate.mode === input.mode && duplicate.diagnosticItemId === (input.diagnosticItemId ?? null) ? { id: duplicate.id, created: false } : { error: "La clave del intento ya fue utilizada." };
    if (input.diagnosticItemId && !await tx.diagnosticItem.findFirst({ where: diagnosticWhere })) return { error: "El diagnóstico ya terminó. Vuelve a Aprendizaje." };
    const active = await tx.submission.count({ where: { status: "RUNNING" } });
    const userActive = await tx.submission.count({ where: { userId: user.id, status: "RUNNING" } });
    if (active >= 4 || userActive >= 1) return { error: "Ya hay una evaluación en curso. Espera a que termine antes de iniciar otra." };
    const submission = await tx.submission.create({ data: { variantId: input.variantId, code: input.code ?? "", ...(projectFiles ? { files: projectFiles as Prisma.InputJsonValue } : {}), mode: input.mode, idempotencyKey: input.idempotencyKey, ...(input.diagnosticItemId ? { diagnosticItemId: input.diagnosticItemId } : {}), userId: user.id, totalCount: input.mode === "tests" ? 1 : variant.tests.filter(t => input.mode === "submit" || t.visible).length } });
    return { id: submission.id, created: true };
  });
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 429 });
  if (result.created) after(() => evaluateSubmission(result.id));
  return NextResponse.json({ id: result.id }, { status: 202 });
}
