import "server-only";
import { db } from "@/server/db";
import { judge } from "./judge";
import { availableRuntime, runCode, RunnerUnavailable } from "./piston";
import type { Json, Language, TestResult } from "@/lib/types";

export async function evaluateSubmission(id: string) {
  const submission = await db.submission.findUnique({ where: { id }, include: { variant: { include: { tests: { orderBy: { order: "asc" } }, version: { select: { exerciseId: true } } } } } });
  if (!submission || submission.status !== "RUNNING") return;
  const { variant } = submission;
  try {
    const runtime = await availableRuntime(variant.language as Language);
    const tests = variant.tests.filter(test => submission.mode === "submit" || test.visible);
    if (!tests.length) throw new RunnerUnavailable("Este ejercicio todavía no tiene pruebas configuradas.");
    const results: TestResult[] = [];
    for (const test of tests) {
      const output = await runCode(variant.language as Language, runtime, submission.code, test.input as Json);
      results.push(judge(output, { ...test, input: test.input as Json, expected: test.expected as Json }));
    }
    const passedCount = results.filter(r => r.passed).length;
    const passed = passedCount === tests.length;
    await db.$transaction(async tx => {
      const finalized = await tx.submission.updateMany({ where: { id, status: "RUNNING" }, data: { status: passed ? "PASSED" : "FAILED", passedCount, totalCount: tests.length, results, finishedAt: new Date() } });
      if (!finalized.count || submission.mode !== "submit") return;
      const key = { userId: submission.userId, exerciseId: variant.version.exerciseId, language: variant.language };
      await tx.progress.upsert({ where: { userId_exerciseId_language: key },
        create: { ...key, attempts: 1, firstPassedAt: passed ? new Date() : null },
        update: { attempts: { increment: 1 }, lastAttemptAt: new Date() },
      });
      if (passed) await tx.progress.updateMany({ where: { ...key, firstPassedAt: null }, data: { firstPassedAt: new Date() } });
    });
  } catch (error) {
    await db.submission.updateMany({ where: { id, status: "RUNNING" }, data: { status: "ERROR", finishedAt: new Date(), message: error instanceof RunnerUnavailable ? error.message : "No pudimos terminar la evaluación. Tu código está a salvo; vuelve a intentarlo." } });
  }
}

export async function expireInterruptedSubmissions() {
  await db.submission.updateMany({ where: { status: "RUNNING", createdAt: { lt: new Date(Date.now() - 120000) } }, data: { status: "ERROR", finishedAt: new Date(), message: "La evaluación se interrumpió. No cuenta como un resultado incorrecto; puedes volver a intentarlo." } });
}
