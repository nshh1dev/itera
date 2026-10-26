import type { Json, RuntimeMode, TestResult } from "./types";

// Una plantilla puede acertar casos triviales, pero no resolver toda la suite.
// Un diagnóstico de diferencia (incluida persistencia) no es un fallo operativo.
export function projectStarterIssue(results: readonly TestResult[]): "runtime" | "solved" | null {
  if (!results.length || results.some(result => result.status === "runtime" || result.status === "timeout")) return "runtime";
  return results.every(result => result.passed) ? "solved" : null;
}

// JSON por estructura, no por el orden de las propiedades de un objeto.
function canonicalJson(value: Json): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
}

export function editorialTestsIssue(tests: readonly { input: Json; expected: Json; visible: boolean }[], mode: RuntimeMode): string | null {
  if (!tests.length || tests.length > 10) return "Incluye entre una y diez pruebas.";
  if (mode === "PROGRAM" && tests.some(test => typeof test.input !== "string" || typeof test.expected !== "string")) return "En un programa, la entrada y la salida esperada se escriben como texto entre comillas.";
  const expectedByInput = new Map<string, string>();
  for (const test of tests) {
    const input = canonicalJson(test.input);
    // Misma equivalencia de texto que judgeProgram: no confundir finales de línea
    // o espacios finales con dos respuestas realmente contradictorias.
    const expected = mode === "PROGRAM" ? String(test.expected).replace(/\r\n?/g, "\n").split("\n").map(line => line.trimEnd()).join("\n").trimEnd() : canonicalJson(test.expected);
    if (expectedByInput.has(input) && expectedByInput.get(input) !== expected) return "Una misma entrada no puede tener resultados esperados contradictorios.";
    expectedByInput.set(input, expected);
  }
  if (!tests.some(test => test.visible)) return "Incluye al menos un ejemplo visible.";
  const fixed = mode === "PROGRAM" && tests.every(test => test.input === "");
  if (!fixed && (expectedByInput.size < 3 || !tests.some(test => !test.visible))) return "Los ejercicios con entrada necesitan al menos tres entradas distintas y alguna prueba oculta.";
  return null;
}
