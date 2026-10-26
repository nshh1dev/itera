import { z } from "zod";
import type { Language } from "./types";

export type ProjectFile = { path: string; content: string; readOnly?: boolean };
export type ProjectDefinition = {
  version: 1;
  entrypoint: string;
  files: ProjectFile[];
  testEntrypoint?: string;
  previousStep?: string;
};

export const projectLimits = {
  files: 20,
  fileBytes: 64 * 1024,
  totalBytes: 256 * 1024,
} as const;

const projectFileSchema = z.object({
  path: z.string().min(1).max(120),
  content: z.string(),
  readOnly: z.boolean().optional(),
}).strict();

export const projectDefinitionSchema = z.object({
  version: z.literal(1),
  entrypoint: z.string().min(1).max(120),
  files: z.array(projectFileSchema).min(1).max(projectLimits.files),
  testEntrypoint: z.string().min(1).max(120).optional(),
  previousStep: z.string().min(1).max(160).optional(),
}).strict().superRefine((project, context) => {
  const paths = new Set<string>();
  let totalBytes = 0;
  for (const [index, file] of project.files.entries()) {
    const normalized = normalizeProjectPath(file.path);
    if (!normalized) {
      context.addIssue({ code: "custom", path: ["files", index, "path"], message: "La ruta debe ser relativa, plana y segura." });
      continue;
    }
    if (paths.has(normalized)) context.addIssue({ code: "custom", path: ["files", index, "path"], message: "La ruta está duplicada." });
    paths.add(normalized);
    const bytes = new TextEncoder().encode(file.content).byteLength;
    totalBytes += bytes;
    if (bytes > projectLimits.fileBytes) context.addIssue({ code: "custom", path: ["files", index, "content"], message: "El archivo supera el límite de tamaño." });
  }
  if (totalBytes > projectLimits.totalBytes) context.addIssue({ code: "custom", path: ["files"], message: "El proyecto supera el tamaño total permitido." });
  if (!paths.has(normalizeProjectPath(project.entrypoint) ?? "")) context.addIssue({ code: "custom", path: ["entrypoint"], message: "El punto de entrada debe existir en los archivos del proyecto." });
  if (project.testEntrypoint && !paths.has(normalizeProjectPath(project.testEntrypoint) ?? "")) context.addIssue({ code: "custom", path: ["testEntrypoint"], message: "El punto de pruebas debe existir en los archivos del proyecto." });
});

/** Permite únicamente nombres de archivo relativos en una carpeta, sin traversal. */
export function normalizeProjectPath(path: string): string | null {
  if (!path || path.includes("\\") || path.startsWith("/") || /^[a-zA-Z]:/.test(path) || path.includes("\0")) return null;
  const parts = path.split("/");
  if (parts.length !== 1 || parts.some(part => !part || part === "." || part === "..")) return null;
  if (/^submission(?:\.|$)|^__itera/i.test(path)) return null;
  return path.toLowerCase();
}

export function validateProjectDefinition(value: unknown): ProjectDefinition {
  return projectDefinitionSchema.parse(value);
}

/** Valida la referencia editorial privada sin incorporarla al manifiesto público. */
export function validateProjectSolution(project: ProjectDefinition, value: unknown): ProjectFile[] {
  const files = z.array(projectFileSchema).min(1).max(projectLimits.files).parse(value);
  const templatePaths = new Set(project.files.map(file => normalizeProjectPath(file.path)));
  const solutionPaths = new Set<string>();
  let totalBytes = 0;
  for (const file of files) {
    const path = normalizeProjectPath(file.path);
    if (!path || !templatePaths.has(path) || solutionPaths.has(path)) throw new Error("La solución debe contener archivos únicos definidos por el proyecto.");
    if (project.files.find(template => normalizeProjectPath(template.path) === path)?.readOnly) throw new Error("La solución no puede cambiar archivos de solo lectura.");
    solutionPaths.add(path);
    const bytes = new TextEncoder().encode(file.content).byteLength;
    if (bytes > projectLimits.fileBytes || (totalBytes += bytes) > projectLimits.totalBytes) throw new Error("La solución supera el tamaño permitido.");
  }
  const editableCount = project.files.filter(file => !file.readOnly).length;
  if (solutionPaths.size !== editableCount) throw new Error("La solución debe incluir una versión de cada archivo editable.");
  return project.files.map(template => {
    if (template.readOnly) return { ...template };
    const solution = files.find(file => normalizeProjectPath(file.path) === normalizeProjectPath(template.path));
    if (!solution) throw new Error("La solución no incluye todos los archivos editables.");
    return { path: template.path, content: solution.content };
  });
}

export function projectFilesForLanguage(projects: Partial<Record<Language, ProjectDefinition>> | null | undefined, language: Language): readonly ProjectFile[] {
  return projects?.[language]?.files ?? [];
}

/** Devuelve un conjunto de archivos coherente; no modifica ni completa el original. */
export function snapshotProjectFiles(files: readonly ProjectFile[]): ProjectFile[] {
  return files.map(file => ({ ...file }));
}
