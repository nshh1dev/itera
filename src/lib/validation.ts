import { z } from "zod";
import { languages } from "./types";
import { maximumExecutionCodeLength } from "./execution-limits";
import { projectLimits } from "./project";

const codeSchema = z.string().max(maximumExecutionCodeLength).refine(code => code.length <= maximumExecutionCodeLength, "El código admite como máximo 30 000 caracteres.");
const projectFilesSchema = z.array(z.object({ path: z.string().min(1).max(120), content: z.string().max(projectLimits.fileBytes), readOnly: z.boolean().optional() }).strict()).min(1).max(projectLimits.files).superRefine((files, context) => {
  let total = 0;
  const seen = new Set<string>();
  for (const [index, file] of files.entries()) {
    const normalized = file.path.toLowerCase();
    if (seen.has(normalized)) context.addIssue({ code: "custom", path: [index, "path"], message: "Hay rutas duplicadas." });
    seen.add(normalized);
    total += new TextEncoder().encode(file.content).byteLength;
  }
  if (total > projectLimits.totalBytes) context.addIssue({ code: "custom", message: "El proyecto supera el tamaño permitido." });
});

export const languageSchema = z.enum(languages);
export const executionSchema = z.object({
  variantId: z.string().min(1).max(100),
  // El editor y las copias recuperables limitan String.length (unidades UTF-16).
  // Zod cuenta puntos Unicode: .max() no expresa ese mismo contrato.
  code: codeSchema.min(1, "Escribe una solución antes de ejecutarla.").optional(),
  files: projectFilesSchema.optional(),
  mode: z.enum(["examples", "submit", "tests"]),
  idempotencyKey: z.uuid(),
  diagnosticItemId: z.string().min(1).max(100).optional(),
}).refine(value => Boolean(value.code) !== Boolean(value.files), "Envía código de un archivo o una instantánea de proyecto.");
export const draftSchema = z.object({ variantId: z.string().min(1).max(100), code: codeSchema.optional(), files: projectFilesSchema.optional(), revision: z.number().int().nonnegative() }).refine(value => (value.code !== undefined) !== (value.files !== undefined), "Envía código de un archivo o una instantánea de proyecto.");
