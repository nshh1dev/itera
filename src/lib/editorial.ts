import { z } from "zod";
import { categories, levels, runtimeModes } from "./types";
import { editorialTextSchema, educationalMetadataSchema } from "./learning-metadata";
import { conceptRules } from "./concept-validation";

const variantSchema = z.object({ starter: z.string().min(1).max(30000), solution: z.string().min(1).max(30000), explanation: editorialTextSchema.min(10).max(5000), statement: editorialTextSchema.max(8000).default(""), typeContract: z.string().max(3000).default("") });

export const editorialSchema = educationalMetadataSchema.extend({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100),
  title: editorialTextSchema.min(3).max(100), description: editorialTextSchema.min(10).max(300),
  statement: editorialTextSchema.min(20).max(8000), category: z.enum(categories),
  level: z.enum(levels), minutes: z.number().int().min(1).max(180),
  hints: z.array(editorialTextSchema.min(5).max(1000)).length(3, "Incluye exactamente tres pistas progresivas.").refine(
    items => new Set(items.map(item => item.toLocaleLowerCase("es"))).size === items.length, "No repitas pistas.",
  ),
  constraints: z.array(editorialTextSchema.min(1).max(500)).max(10),
  runtimeMode: z.enum(runtimeModes).default("FUNCTION"),
  conceptRule: z.union([z.literal(""), z.enum(conceptRules)]).default(""),
  python: variantSchema, javascript: variantSchema, typescript: variantSchema,
  tests: z.array(z.object({ input: z.json(), expected: z.json(), visible: z.boolean(), explanation: editorialTextSchema.max(1000).default("") })).min(1).max(10),
}).refine(data => data.tests.some(test => test.visible), "Incluye al menos un ejemplo visible.")
  .refine(data => (data.runtimeMode === "PROGRAM" && data.tests.every(test => test.input === "")) || (data.tests.length >= 3 && data.tests.some(test => !test.visible)), "Los ejercicios con entrada necesitan al menos tres pruebas y alguna oculta.")
  .refine(data => !data.conceptRule || (data.runtimeMode === "PROGRAM" && data.activityType === "GUIDED" && data.tests.every(test => test.input === "")), "La comprobación conceptual solo se aplica a prácticas guiadas secuenciales sin entrada.")
  .refine(data => data.runtimeMode !== "PROGRAM" || data.tests.every(test => typeof test.input === "string" && typeof test.expected === "string"), "En un programa, la entrada y la salida esperada se escriben como texto entre comillas.");

export const publicationMetadataSchema = educationalMetadataSchema.refine(data => data.practiceGoals.length > 0, {
  message: "Describe al menos un concepto que se practicará antes de publicar.", path: ["practiceGoals"],
});
