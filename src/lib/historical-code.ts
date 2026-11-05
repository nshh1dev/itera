import type { Language } from "./types";

// Vista de consulta: nunca convierte una instantánea histórica al contrato actual.
export function historicalCode(language: Language, code: string, files: unknown): string {
  if (language !== "python" || !Array.isArray(files) || !files.length) return code;
  const valid = files.every(file => file && typeof file === "object" && typeof file.path === "string" && typeof file.content === "string");
  if (!valid) return code;
  return files.map(file => `${file.path}${file.readOnly === true ? " · lectura" : ""}\n${file.content}`).join("\n\n");
}
