import { z } from "zod";
import { levels } from "./types";
import { editorialTextSchema, educationalMetadataSchema } from "./learning-metadata";

const variantSchema = z.object({ starter: z.string().min(1).max(30000), solution: z.string().min(1).max(30000), explanation: editorialTextSchema.min(10).max(5000) });

export const editorialSchema = educationalMetadataSchema.extend({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100),
  title: editorialTextSchema.min(3).max(100), description: editorialTextSchema.min(10).max(300),
  statement: editorialTextSchema.min(20).max(8000), category: z.enum(["Fundamentos", "Cadenas", "Arreglos", "Algoritmos"]),
  level: z.enum(levels), minutes: z.number().int().min(1).max(180),
  hints: z.array(editorialTextSchema.min(5).max(1000)).length(3, "Incluye exactamente tres pistas progresivas.").refine(
    items => new Set(items.map(item => item.toLocaleLowerCase("es"))).size === items.length, "No repitas pistas.",
  ),
  constraints: z.array(editorialTextSchema.min(1).max(500)).min(1).max(10),
  python: variantSchema, javascript: variantSchema,
  tests: z.array(z.object({ input: z.json(), expected: z.json(), visible: z.boolean(), explanation: editorialTextSchema.max(1000).default("") })).min(3).max(10),
}).refine(data => data.tests.some(test => test.visible) && data.tests.some(test => !test.visible), "Incluye pruebas visibles y ocultas.");

export const publicationMetadataSchema = educationalMetadataSchema.refine(data => data.practiceGoals.length > 0, {
  message: "Describe al menos un concepto que se practicará antes de publicar.", path: ["practiceGoals"],
});
