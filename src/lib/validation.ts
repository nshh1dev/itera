import { z } from "zod";
import { languages, levels } from "./types";

export const languageSchema = z.enum(languages);
export const executionSchema = z.object({
  variantId: z.string().min(1).max(100),
  code: z.string().min(1, "Escribe una solución antes de ejecutarla.").max(30000),
  mode: z.enum(["examples", "submit"]),
  idempotencyKey: z.uuid(),
  diagnosticItemId: z.string().min(1).max(100).optional(),
});
export const draftSchema = z.object({ variantId: z.string().min(1).max(100), code: z.string().max(30000), revision: z.number().int().nonnegative() });
export const preferenceSchema = z.object({ name: z.string().trim().min(2).max(60), language: languageSchema, level: z.enum(levels) });
