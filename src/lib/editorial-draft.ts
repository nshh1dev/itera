import type { EditorialData } from "@/components/admin-editor";

export function editorialHasChanges(data: EditorialData, initial: EditorialData) {
  const content = (value: EditorialData) => JSON.stringify({ ...value, id: undefined, versionId: undefined, versionNumber: undefined, published: undefined });
  return content(data) !== content(initial);
}

// Valida la forma, no las reglas de publicación: una copia recuperable puede
// contener campos vacíos, JSON incompleto o una referencia todavía sin terminar.
export function readEditorialDraft(raw: string | null, initial: EditorialData): EditorialData | null {
  try {
    if (!raw || raw.length > 300000) return null;
    const saved = JSON.parse(raw) as Record<string, unknown>;
    if (!saved || typeof saved !== "object") return null;
    const strings = ["slug", "title", "description", "statement", "objective", "complexity", "activityType", "runtimeMode", "category", "level", "tests"] as const;
    const arrays = ["prerequisites", "practiceGoals", "prerequisiteSlugs", "commonErrors", "hints", "constraints"] as const;
    if (strings.some(key => typeof saved[key] !== "string")) return null;
    if (arrays.some(key => !Array.isArray(saved[key]) || !(saved[key] as unknown[]).every(value => typeof value === "string"))) return null;
    if (typeof saved.minutes !== "number" || !Number.isFinite(saved.minutes)) return null;
    if (saved.conceptRule !== undefined && typeof saved.conceptRule !== "string") return null;
    for (const language of ["python", "javascript", "typescript"] as const) {
      const variant = saved[language];
      if (!variant || typeof variant !== "object") return null;
      const fields = variant as Record<string, unknown>;
      if (["starter", "solution", "explanation"].some(key => typeof fields[key] !== "string")) return null;
      if (["statement", "typeContract"].some(key => fields[key] !== undefined && typeof fields[key] !== "string")) return null;
    }
    // Nunca restaurar identidad, permisos ni estado de publicación desde el navegador.
    const restored = { ...initial };
    for (const key of [...strings, ...arrays, "minutes", "conceptRule", "python", "javascript", "typescript"] as const) {
      Object.assign(restored, { [key]: saved[key] });
    }
    if (initial.id) restored.slug = initial.slug;
    return restored;
  } catch { return null; }
}
