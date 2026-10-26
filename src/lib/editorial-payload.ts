import type { EditorialData } from "@/components/admin-editor";
import { languages, type Language } from "./types";

export const maximumEditorialPayloadBytes = 11 * 1024 * 1024;

export function editorialPayloadBytes(input: unknown) {
  return new TextEncoder().encode(JSON.stringify(input) ?? "").byteLength;
}

/** Convierte los editores JSON a la forma validada que recibe la acción editorial. */
export function buildEditorialSavePayload(data: EditorialData) {
  let tests: unknown;
  try { tests = JSON.parse(data.tests); }
  catch { return { error: "Los casos de prueba no tienen un JSON válido." } as const; }

  const parseLanguageMap = (field: "projects" | "projectSolutions", label: string) => {
    const result: Partial<Record<Language, unknown>> = {};
    for (const language of languages) {
      const text = data[field][language].trim();
      if (!text) continue;
      try { result[language] = JSON.parse(text); }
      catch { throw new Error(`El JSON de ${label} para ${languageNames[language]} no es válido.`); }
    }
    return Object.keys(result).length ? result : undefined;
  };

  try {
    const projects = parseLanguageMap("projects", "manifiesto");
    const projectSolutions = parseLanguageMap("projectSolutions", "solución privada");
    return { data: { ...data, tests, projects, projectSolutions } } as const;
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Revisa el JSON del proyecto." } as const;
  }
}

const languageNames: Record<Language, string> = { python: "Python", javascript: "JavaScript", typescript: "TypeScript" };
