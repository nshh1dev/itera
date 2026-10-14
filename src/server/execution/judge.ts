import { isDeepStrictEqual } from "node:util";
import type { Json, TestResult } from "@/lib/types";

export type RunOutput = { stdout: string; stderr: string; code: number | null; signal?: string | null; status?: string | null };

export function judge(output: RunOutput, test: { input: Json; expected: Json; visible: boolean; order: number }): TestResult {
  const result: TestResult = { index: test.order + 1, visible: test.visible, passed: false, status: "wrong" };
  if (test.visible) { result.input = test.input; result.expected = test.expected; }
  if (output.status === "TO") {
    result.status = "timeout";
    if (test.visible) result.error = "Se alcanzó el límite de tiempo. Revisa tus bucles y condiciones de salida.";
  } else if (output.code !== 0 || output.signal || output.status) {
    result.status = "runtime";
    if (test.visible) result.error = output.stderr.slice(0, 2500) || "El programa terminó con un error.";
  } else {
    try {
      const lastLine = output.stdout.trim().split(/\r?\n/).at(-1);
      if (!lastLine) throw new Error("missing output");
      const actual = JSON.parse(lastLine) as Json;
      result.passed = isDeepStrictEqual(actual, test.expected);
      result.status = result.passed ? "passed" : "wrong";
      if (test.visible) result.actual = actual;
    } catch {
      if (test.visible) result.error = "Tu función debe devolver un valor que pueda representarse en JSON. Usa return, no solo print o console.log.";
    }
  }
  return result;
}
