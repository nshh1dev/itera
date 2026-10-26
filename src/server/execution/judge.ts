import { isDeepStrictEqual } from "node:util";
import type { Json, TestResult } from "@/lib/types";

export type RunOutput = { stdout: string; stderr: string; code: number | null; signal?: string | null; status?: string | null };
export type JudgeTest = { input: Json; expected: Json; expectedFiles?: { path: string; content: string }[] | null; expectedPersistence?: Json; visible: boolean; order: number };

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

/** Solo describe el cierre del archivo público de pruebas del alumno; no concede progreso. */
export function judgeOwnTests(output: RunOutput): TestResult {
  if (output.status === "TO") return { index: 1, visible: true, passed: false, status: "timeout", input: "", expected: "El archivo de pruebas termina correctamente", output: output.stdout.slice(0, 4000), error: "Las pruebas propias superaron el límite de ejecución." };
  if (output.code === 0 && !output.signal && !output.status) return { index: 1, visible: true, passed: true, status: "passed", input: "", expected: "El archivo de pruebas termina correctamente", actual: "Finalizó con código 0", output: output.stdout.slice(0, 4000) };
  const detail = `${output.stderr}\n${output.stdout}`.slice(0, 4000);
  const assertion = /AssertionError|ERR_ASSERTION|FAIL:/i.test(detail);
  return { index: 1, visible: true, passed: false, status: assertion ? "assertion" : "runtime", input: "", expected: "El archivo de pruebas termina correctamente", actual: output.code, output: output.stdout.slice(0, 4000), error: detail || "El archivo de pruebas terminó con un error." };
}

export function judgeProject(output: RunOutput, test: JudgeTest, mode: "FUNCTION" | "PROGRAM"): TestResult {
  const base: TestResult = { index: test.order + 1, visible: test.visible, passed: false, status: "wrong" };
  if (test.visible) { base.input = test.input; base.expected = test.expected; if (test.expectedFiles) base.expectedFiles = test.expectedFiles; }
  if (output.status === "TO") {
    base.status = "timeout";
    if (test.visible) base.error = "El proyecto superó el límite de ejecución.";
    return base;
  }
  if (output.code !== 0 || output.signal || output.status) {
    base.status = "runtime";
    if (test.visible) base.error = output.stderr.slice(0, 2500) || "El proyecto terminó con un error.";
    return base;
  }
  const lines = output.stdout.replace(/\r\n?/g, "\n").trimEnd().split("\n");
  const marker = lines.at(-1) ?? "";
  const prefix = "__ITERA_PROJECT__";
  let payload: { kind?: unknown; value?: unknown; persistence?: unknown; stdout?: unknown; stderr?: unknown; code?: unknown; timeout?: unknown; files?: unknown };
  try {
    if (!marker.startsWith(prefix)) throw new Error();
    payload = JSON.parse(marker.slice(prefix.length)) as typeof payload;
    if (!payload || !Array.isArray(payload.files) || !payload.files.every(file => file && typeof file === "object" && typeof (file as {path?:unknown}).path === "string" && typeof (file as {content?:unknown}).content === "string")) throw new Error();
  } catch {
    base.status = "runtime";
    if (test.visible) base.error = "El conductor del proyecto no pudo recoger su resultado.";
    return base;
  }
  if (payload.timeout === true) {
    base.status = "timeout";
    if (test.visible) base.error = "El programa del proyecto superó el límite de ejecución.";
    return base;
  }
  if (payload.kind !== mode.toLowerCase() || (mode === "PROGRAM" && (typeof payload.code !== "number" || payload.code !== 0))) {
    base.status = "runtime";
    if (test.visible) base.error = typeof payload.stderr === "string" ? payload.stderr.slice(0, 2500) : "El programa terminó con un error.";
    return base;
  }
  const files = (payload.files as { path: string; content: string }[]).slice().sort((a, b) => a.path.localeCompare(b.path));
  const expectedFiles = (test.expectedFiles ?? []).map(({ path, content }) => ({ path, content })).sort((a, b) => a.path.localeCompare(b.path));
  if (mode === "PROGRAM") {
    const actual = typeof payload.stdout === "string" ? canonical(payload.stdout) : "";
    base.passed = actual === canonical(String(test.expected ?? "")) && isDeepStrictEqual(files, expectedFiles);
    if (test.visible) { base.actual = actual; base.output = typeof payload.stdout === "string" ? payload.stdout : ""; base.actualFiles = files; }
  } else {
    const persistencePassed = test.expectedPersistence === undefined || isDeepStrictEqual(payload.persistence, test.expectedPersistence);
    base.passed = isDeepStrictEqual(payload.value, test.expected) && isDeepStrictEqual(files, expectedFiles) && persistencePassed;
    if (test.visible) { base.actual = payload.value as Json; base.actualFiles = files; const logs = lines.slice(0, -1).join("\n"); if (logs) base.output = logs; }
    if (!persistencePassed && test.visible) base.error = "El resultado del segundo proceso no coincide con la persistencia esperada.";
  }
  base.status = base.passed ? "passed" : "wrong";
  return base;
}
