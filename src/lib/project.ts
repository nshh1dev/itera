import { z } from "zod";
import type { Language } from "./types";

export type ProjectFile = { path: string; content: string; readOnly?: boolean };
export type ProjectDefinition = {
  version: 1;
  entrypoint: string;
  files: ProjectFile[];
  testEntrypoint?: string;
  previousStep?: string;
  /** Ejecuta además solve([]) en un proceso hijo para comprobar persistencia por archivos. */
  verifyPersistence?: boolean;
};

export const projectLimits = {
  files: 20,
  fileBytes: 64 * 1024,
  totalBytes: 256 * 1024,
} as const;

export const projectArtifactLimits = { files: 20, fileBytes: 32 * 1024, totalBytes: 32 * 1024 } as const;

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
  verifyPersistence: z.boolean().optional(),
}).strict().superRefine((project, context) => {
  const paths = new Set<string>();
  let totalBytes = 0;
  for (const [index, file] of project.files.entries()) {
    const normalized = normalizeProjectPath(file.path);
    if (!normalized) {
      context.addIssue({ code: "custom", path: ["files", index, "path"], message: "La ruta debe ser relativa, plana y segura." });
      continue;
    }
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,119}$/.test(file.path)) context.addIssue({ code: "custom", path: ["files", index, "path"], message: "Usa nombres planos con letras, números, punto, guion o guion bajo." });
    if (paths.has(normalized)) context.addIssue({ code: "custom", path: ["files", index, "path"], message: "La ruta está duplicada." });
    paths.add(normalized);
    const bytes = new TextEncoder().encode(file.content).byteLength;
    totalBytes += bytes;
    if (bytes > projectLimits.fileBytes) context.addIssue({ code: "custom", path: ["files", index, "content"], message: "El archivo supera el límite de tamaño." });
  }
  if (totalBytes > projectLimits.totalBytes) context.addIssue({ code: "custom", path: ["files"], message: "El proyecto supera el tamaño total permitido." });
  if (!project.files.some(file => file.path === project.entrypoint)) context.addIssue({ code: "custom", path: ["entrypoint"], message: "El punto de entrada debe coincidir exactamente con un archivo del proyecto." });
  if (project.testEntrypoint && !project.files.some(file => file.path === project.testEntrypoint)) context.addIssue({ code: "custom", path: ["testEntrypoint"], message: "El punto de pruebas debe coincidir exactamente con un archivo del proyecto." });
});

/** Permite únicamente nombres de archivo relativos en una carpeta, sin traversal. */
export function normalizeProjectPath(path: string): string | null {
  if (!path || path.includes("\\") || path.startsWith("/") || /^[a-zA-Z]:/.test(path) || path.includes("\0")) return null;
  const parts = path.split("/");
  if (parts.length !== 1 || parts.some(part => !part || part === "." || part === "..")) return null;
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,119}$/.test(path)) return null;
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
  const seenPaths = new Set<string>();
  const solutionPaths = new Set<string>();
  let totalBytes = 0;
  for (const file of files) {
    const path = normalizeProjectPath(file.path);
    const template = path ? project.files.find(candidate => normalizeProjectPath(candidate.path) === path) : undefined;
    if (!path || !templatePaths.has(path) || seenPaths.has(path) || !template) throw new Error("La solución debe contener archivos únicos definidos por el proyecto.");
    seenPaths.add(path);
    if (template.readOnly) {
      if (file.content !== template.content) throw new Error("La solución no puede cambiar archivos de solo lectura.");
      continue;
    }
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

/** Valida una instantánea completa recibida del navegador contra el manifiesto publicado. */
export function validateProjectSnapshot(project: ProjectDefinition, value: unknown): ProjectFile[] {
  const files = z.array(projectFileSchema).min(1).max(projectLimits.files).parse(value);
  const byPath = new Map<string, ProjectFile>();
  let totalBytes = 0;
  for (const file of files) {
    const path = normalizeProjectPath(file.path);
    if (!path || byPath.has(path)) throw new Error("El borrador contiene rutas inválidas o duplicadas.");
    const template = project.files.find(candidate => normalizeProjectPath(candidate.path) === path);
    if (!template || template.path !== file.path) throw new Error("El borrador contiene un archivo ajeno al proyecto.");
    if (template.readOnly && template.content !== file.content) throw new Error("No se puede modificar un archivo de solo lectura.");
    const bytes = new TextEncoder().encode(file.content).byteLength;
    if (bytes > projectLimits.fileBytes || (totalBytes += bytes) > projectLimits.totalBytes) throw new Error("El proyecto supera el tamaño permitido.");
    byPath.set(path, { path: template.path, content: file.content, ...(template.readOnly ? { readOnly: true } : {}) });
  }
  if (byPath.size !== project.files.length || project.files.some(file => !byPath.has(normalizeProjectPath(file.path) ?? ""))) throw new Error("El borrador debe conservar todos los archivos del proyecto.");
  return project.files.map(file => byPath.get(normalizeProjectPath(file.path)!)!);
}

export function validateExpectedProjectFiles(project: ProjectDefinition, value: unknown): ProjectFile[] {
  const files = z.array(projectFileSchema).max(projectArtifactLimits.files).parse(value);
  const paths = new Set<string>();
  let total = 0;
  for (const file of files) {
    const path = normalizeProjectPath(file.path);
    const source = project.files.find(candidate => normalizeProjectPath(candidate.path) === path);
    const codeFile = /\.(?:py|pyw|js|jsx|mjs|cjs|ts|tsx|mts|cts)$/i.test(file.path);
    if (!path || paths.has(path) || file.readOnly || codeFile || (source && (source.readOnly || source.path !== file.path))) throw new Error("Los artefactos esperados deben ser archivos de datos nuevos o recursos editables con su ruta exacta; no pueden ser código ni solo lectura.");
    paths.add(path);
    const bytes = new TextEncoder().encode(file.content).byteLength;
    if (bytes > projectArtifactLimits.fileBytes || (total += bytes) > projectArtifactLimits.totalBytes) throw new Error("Los artefactos esperados superan el límite de 32 KiB por archivo o en total.");
  }
  return files.map(file => ({ path: file.path, content: file.content }));
}

export function validateProjectPersistence(project: ProjectDefinition, runtimeMode: string, input: unknown, expectedPersistence: unknown): void {
  if (!project.verifyPersistence) {
    if (expectedPersistence !== undefined) throw new Error("expectedPersistence requiere verifyPersistence en el proyecto.");
    return;
  }
  if (runtimeMode !== "FUNCTION") throw new Error("verifyPersistence solo funciona con runtime FUNCTION.");
  if (!Array.isArray(input)) throw new Error("verifyPersistence requiere entradas JSON de tipo array.");
  if (expectedPersistence === undefined) throw new Error("Cada caso de verifyPersistence debe declarar expectedPersistence, incluso si su valor es JSON null.");
}

export function projectFilesForLanguage(projects: Partial<Record<Language, ProjectDefinition>> | null | undefined, language: Language): readonly ProjectFile[] {
  return projects?.[language]?.files ?? [];
}

/** Devuelve un conjunto de archivos coherente; no modifica ni completa el original. */
export function snapshotProjectFiles(files: readonly ProjectFile[]): ProjectFile[] {
  return files.map(file => ({ ...file }));
}
