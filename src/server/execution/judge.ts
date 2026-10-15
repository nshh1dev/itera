import { isDeepStrictEqual } from "node:util";
import type { Json, TestResult } from "@/lib/types";

export type RunOutput = { stdout: string; stderr: string; code: number | null; signal?: string | null; status?: string | null };
export type JudgeTest = { input: Json; expected: Json; visible: boolean; order: number };

const normalize = (text: string) => text.replace(/\r\n?/g, "\n");
// Forma canónica de una salida de texto: fin de línea uniforme, sin espacios al
// final de cada línea y sin líneas vacías sobrantes al final.
const canonical = (text: string) => normalize(text).split("\n").map(line => line.trimEnd()).join("\n").trimEnd();
// En modo FUNCTION el envoltorio imprime el resultado como última línea. Todo lo
// anterior son print/console.log de depuración, que mostramos en el panel.
function logs(stdout: string) {
  const trimmed = canonical(stdout);
  const index = trimmed.lastIndexOf("\n");
  return index < 0 ? "" : trimmed.slice(0, index);
}

export function judge(output: RunOutput, test: JudgeTest): TestResult {
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
      if (test.visible) { result.actual = actual; const debug = logs(output.stdout); if (debug) result.output = debug; }
    } catch {
      if (test.visible) result.error = "Tu función debe devolver un valor que pueda representarse en JSON. Usa return, no solo print o console.log.";
    }
  }
  return result;
}

// Modo PROGRAM: se ejecuta el archivo como programa completo y se compara lo que
// imprime por la salida estándar con el texto esperado del caso.
export function judgeProgram(output: RunOutput, test: JudgeTest): TestResult {
  const result: TestResult = { index: test.order + 1, visible: test.visible, passed: false, status: "wrong" };
  if (test.visible) { result.input = test.input; result.expected = test.expected; }
  if (output.status === "TO") {
    result.status = "timeout";
    if (test.visible) result.error = "Se alcanzó el límite de tiempo. Revisa tus bucles y condiciones de salida.";
  } else if (output.code !== 0 || output.signal || output.status) {
    result.status = "runtime";
    if (test.visible) result.error = output.stderr.slice(0, 2500) || "El programa terminó con un error.";
  } else {
    const actual = canonical(output.stdout);
    result.passed = actual === canonical(String(test.expected ?? ""));
    result.status = result.passed ? "passed" : "wrong";
    if (test.visible) { result.actual = actual; result.output = normalize(output.stdout); }
  }
  return result;
}
