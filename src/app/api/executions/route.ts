import { after, NextResponse } from "next/server";
import { currentUser } from "@/server/auth";
import { db } from "@/server/db";
import { executionSchema } from "@/lib/validation";
import { availableRuntime, RunnerUnavailable } from "@/server/execution/piston";
import { evaluateSubmission, expireInterruptedSubmissions } from "@/server/execution/service";
import type { Language } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  // Las cookies no bastan: los endpoints de mutación también comprueban el origen.
  const origin = request.headers.get("origin");
  if (!origin || !["http://localhost:3000", "http://127.0.0.1:3000"].includes(origin)) return NextResponse.json({ error: "Origen no permitido." }, { status: 403 });
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Inicia sesión para ejecutar y guardar tu progreso." }, { status: 401 });
  if (Number(request.headers.get("content-length")) > 40000) return NextResponse.json({ error: "El programa es demasiado grande." }, { status: 413 });
  let body;
  try { const text = await request.text(); if (text.length > 40000) return NextResponse.json({ error: "El programa es demasiado grande." }, { status: 413 }); body = JSON.parse(text); }
  catch { return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 }); }
  const parsed = executionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Revisa el programa y vuelve a intentarlo (máximo 30 000 caracteres)." }, { status: 400 });
  const input = parsed.data;
  const existing = await db.submission.findUnique({ where: { userId_idempotencyKey: { userId: user.id, idempotencyKey: input.idempotencyKey } }, select: { id: true, variantId: true, code: true, mode: true, diagnosticItemId: true } });
  if (existing) {
    if (existing.variantId !== input.variantId || existing.code !== input.code || existing.mode !== input.mode || existing.diagnosticItemId !== (input.diagnosticItemId ?? null)) return NextResponse.json({ error: "La clave del intento ya fue utilizada con otro programa." }, { status: 409 });
    return NextResponse.json({ id: existing.id }, { status: 202 });
  }
  const diagnosticWhere = { id: input.diagnosticItemId, variantId: input.variantId, diagnostic: { userId: user.id, finishedAt: null } };
  if (input.diagnosticItemId && !await db.diagnosticItem.findFirst({ where: diagnosticWhere })) return NextResponse.json({ error: "Diagnóstico no disponible." }, { status: 404 });
  const variant = await db.exerciseVariant.findFirst({ where: { id: input.variantId, ...(!input.diagnosticItemId ? { version: { published: true, exercise: { published: true } } } : {}) }, select: { id: true, language: true, tests: { select: { visible: true } } } });
  if (!variant) return NextResponse.json({ error: "Ejercicio no disponible." }, { status: 404 });
  try { await availableRuntime(variant.language as Language); }
  catch (error) { return NextResponse.json({ error: error instanceof RunnerUnavailable ? error.message : "El ejecutor no está disponible." }, { status: 503 }); }
  await expireInterruptedSubmissions();
  const result = await db.$transaction(async tx => {
    // Un bloqueo corto serializa las reservas. Nunca se mantiene durante la ejecución.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(742901)`;
    const duplicate = await tx.submission.findUnique({ where: { userId_idempotencyKey: { userId: user.id, idempotencyKey: input.idempotencyKey } } });
    if (duplicate) return duplicate.code === input.code && duplicate.variantId === input.variantId && duplicate.mode === input.mode && duplicate.diagnosticItemId === (input.diagnosticItemId ?? null) ? { id: duplicate.id, created: false } : { error: "La clave del intento ya fue utilizada." };
    if (input.diagnosticItemId && !await tx.diagnosticItem.findFirst({ where: diagnosticWhere })) return { error: "El diagnóstico ya terminó. Vuelve a Aprendizaje." };
    const active = await tx.submission.count({ where: { status: "RUNNING" } });
    const userActive = await tx.submission.count({ where: { userId: user.id, status: "RUNNING" } });
    if (active >= 4 || userActive >= 1) return { error: "Ya hay una evaluación en curso. Espera a que termine antes de iniciar otra." };
    const submission = await tx.submission.create({ data: { ...input, userId: user.id, totalCount: variant.tests.filter(t => input.mode === "submit" || t.visible).length } });
    return { id: submission.id, created: true };
  });
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 429 });
  if (result.created) after(() => evaluateSubmission(result.id));
  return NextResponse.json({ id: result.id }, { status: 202 });
}
