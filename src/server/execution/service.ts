import "server-only";
import { db } from "@/server/db";
import { judge, judgeProgram } from "./judge";
import { availableRuntime, runCode, RunnerUnavailable } from "./piston";
import type { Json, Language, RuntimeMode, TestResult } from "@/lib/types";
import { checkConcept } from "./concepts";
import { minimumSubmissionBudgetMs, submissionBudgetMs } from "@/lib/execution-limits";
import { reportOperationalFailure, type OperationalPhase } from "@/server/operational-failure";

const interrupted = { status: "ERROR" as const, message: "La evaluación se interrumpió. No cuenta como un resultado incorrecto; puedes volver a intentarlo." };

export async function evaluateSubmission(id: string) {
  const submission = await db.submission.findUnique({ where: { id }, include: { variant: { include: { tests: { orderBy: { order: "asc" } }, version: { select: { exerciseId: true, runtimeMode: true, conceptRule: true } } } } } }).catch(error => {
    reportOperationalFailure("execution.load", id);
    throw error;
  });
  if (!submission || submission.status !== "RUNNING") return;
  const { variant } = submission;
  const mode = variant.version.runtimeMode as RuntimeMode;
  const budget = submissionBudgetMs({ language: variant.language, totalCount: submission.totalCount, mode: submission.mode, conceptRule: variant.version.conceptRule });
  const deadline = submission.createdAt.getTime() + budget;
  let phase: OperationalPhase = "execution.state";
  async function expireOwn() {
    phase = "execution.state";
    await db.submission.updateMany({ where: { id, status: "RUNNING", createdAt: { lte: new Date(Date.now() - budget) } }, data: { ...interrupted, finishedAt: new Date() } });
  }
  async function canContinue() {
    phase = "execution.state";
    if (Date.now() >= deadline) { await expireOwn(); return false; }
    const running = await db.submission.findFirst({ where: { id, status: "RUNNING" }, select: { id: true } });
    if (!running) return false;
    if (Date.now() >= deadline) { await expireOwn(); return false; }
    return true;
  }
  try {
    if (!await canContinue()) return;
    phase = "execution.runtime";
    const runtime = await availableRuntime(variant.language as Language);
    const tests = variant.tests.filter(test => submission.mode === "submit" || test.visible);
    if (!tests.length) throw new RunnerUnavailable("Este ejercicio todavía no tiene pruebas configuradas.");
    const results: TestResult[] = [];
    for (const test of tests) {
      // Un trabajo en vuelo conserva su límite de Piston; no lanzar el siguiente
      // caso si la reconciliación ya finalizó o caducó este intento.
      if (!await canContinue()) return;
      phase = "execution.case";
      const output = await runCode(variant.language as Language, runtime, submission.code, test.input as Json, mode, variant.typeContract);
      const entry = { ...test, input: test.input as Json, expected: test.expected as Json };
      results.push(mode === "PROGRAM" ? judgeProgram(output, entry) : judge(output, entry));
    }
    const passedCount = results.filter(r => r.passed).length;
    if (!await canContinue()) return;
    phase = "execution.concept";
    const conceptMessage = passedCount === tests.length && submission.mode === "submit" ? await checkConcept(variant.language as Language, submission.code, variant.version.conceptRule) : null;
    const passed = passedCount === tests.length && !conceptMessage;
    if (!await canContinue()) return;
    phase = "execution.finalize";
    const completed = await db.$transaction(async tx => {
      const finalized = await tx.submission.updateMany({ where: { id, status: "RUNNING", createdAt: { gt: new Date(Date.now() - budget) } }, data: { status: passed ? "PASSED" : "FAILED", passedCount, totalCount: tests.length, results, message: conceptMessage, finishedAt: new Date() } });
      if (!finalized.count) return false;
      if (submission.mode !== "submit" || submission.diagnosticItemId) return true;
      const key = { userId: submission.userId, exerciseId: variant.version.exerciseId, language: variant.language };
      await tx.progress.upsert({ where: { userId_exerciseId_language: key },
        create: { ...key, attempts: 1, firstPassedAt: passed ? new Date() : null },
        update: { attempts: { increment: 1 }, lastAttemptAt: new Date() },
      });
      if (passed) await tx.progress.updateMany({ where: { ...key, firstPassedAt: null }, data: { firstPassedAt: new Date() } });
      return true;
    });
    if (!completed) await expireOwn();
  } catch (error) {
    reportOperationalFailure(phase, id);
    await db.submission.updateMany({ where: { id, status: "RUNNING" }, data: { status: "ERROR", finishedAt: new Date(), message: error instanceof RunnerUnavailable ? error.message : "No pudimos terminar la evaluación. Tu código está a salvo; vuelve a intentarlo." } }).catch(persistenceError => {
      reportOperationalFailure("execution.error.persist", id);
      throw persistenceError;
    });
  }
}

export async function expireInterruptedSubmissions() {
  try {
    const now = Date.now();
    const candidates = await db.submission.findMany({ where: { status: "RUNNING", createdAt: { lte: new Date(now - minimumSubmissionBudgetMs) } }, select: { id: true, createdAt: true, totalCount: true, mode: true, variant: { select: { language: true, version: { select: { conceptRule: true } } } } } });
    const expired = candidates.filter(candidate => now >= candidate.createdAt.getTime() + submissionBudgetMs({ language: candidate.variant.language, totalCount: candidate.totalCount, mode: candidate.mode, conceptRule: candidate.variant.version.conceptRule }));
    if (expired.length) await db.submission.updateMany({ where: { id: { in: expired.map(candidate => candidate.id) }, status: "RUNNING" }, data: { ...interrupted, finishedAt: new Date() } });
  } catch (error) {
    reportOperationalFailure("execution.reconcile");
    throw error;
  }
}
