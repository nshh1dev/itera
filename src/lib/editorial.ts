import { z } from "zod";
import { categories, levels, runtimeModes } from "./types";
import { editorialTextSchema, educationalMetadataSchema } from "./learning-metadata";
import { conceptRules } from "./concept-validation";
import { editorialTestsIssue } from "./editorial-tests";
import { projectDefinitionSchema, validateExpectedProjectFiles, validateProjectPersistence, validateProjectSolution } from "./project";

const variantSchema = z.object({ starter: z.string().min(1).max(30000), solution: z.string().min(1).max(30000), explanation: editorialTextSchema.min(10).max(5000), statement: editorialTextSchema.max(8000).default(""), typeContract: z.string().max(3000).default("") });
const projectMapSchema = z.object({ python: projectDefinitionSchema.optional(), javascript: projectDefinitionSchema.optional(), typescript: projectDefinitionSchema.optional() }).partial().optional();
const projectSolutionMapSchema = z.object({
  python: z.array(z.object({ path: z.string(), content: z.string(), readOnly: z.boolean().optional() }).strict()).optional(),
  javascript: z.array(z.object({ path: z.string(), content: z.string(), readOnly: z.boolean().optional() }).strict()).optional(),
  typescript: z.array(z.object({ path: z.string(), content: z.string(), readOnly: z.boolean().optional() }).strict()).optional(),
}).partial().optional();

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
  projects: projectMapSchema, projectSolutions: projectSolutionMapSchema,
   tests: z.array(z.object({ input: z.json(), expected: z.json(), expectedFiles: z.array(z.object({ path: z.string(), content: z.string() }).strict()).optional(), expectedPersistence: z.json().optional(), visible: z.boolean(), explanation: editorialTextSchema.max(1000).default("") })).min(1).max(10),
}).superRefine((data, context) => {
  const issue = editorialTestsIssue(data.tests, data.runtimeMode);
  if (issue) context.addIssue({ code: "custom", message: issue, path: ["tests"] });
  for (const language of ["python", "javascript", "typescript"] as const) {
    const project = data.projects?.[language];
    const solution = data.projectSolutions?.[language];
    if (solution && !project) context.addIssue({ code: "custom", path: ["projectSolutions", language], message: "La solución requiere un manifiesto de proyecto." });
    if (project && !solution) context.addIssue({ code: "custom", path: ["projectSolutions", language], message: "Añade la solución privada del proyecto antes de guardarlo." });
    if (project && solution) {
      try { validateProjectSolution(project, solution); }
      catch (error) { context.addIssue({ code: "custom", path: ["projectSolutions", language], message: error instanceof Error ? error.message : "Solución de proyecto inválida." }); }
    }
  }
  for (const [index, test] of data.tests.entries()) if (test.expectedFiles) {
    const projects = Object.values(data.projects ?? {}).filter((project): project is NonNullable<typeof project> => !!project);
    if (!projects.length) context.addIssue({ code: "custom", path: ["tests", index, "expectedFiles"], message: "Los archivos esperados requieren un proyecto." });
    for (const project of projects) {
      try { validateExpectedProjectFiles(project, test.expectedFiles); }
      catch (error) { context.addIssue({ code: "custom", path: ["tests", index, "expectedFiles"], message: error instanceof Error ? error.message : "Archivos esperados inválidos." }); break; }
    }
  }
  const projects = Object.values(data.projects ?? {}).filter((project): project is NonNullable<typeof project> => !!project);
  if (projects.some(project => project.verifyPersistence) && (projects.length !== 3 || projects.some(project => !project.verifyPersistence))) {
    context.addIssue({ code: "custom", path: ["projects"], message: "La persistencia debe activarse en las tres variantes del ejercicio." });
  }
  for (const [index, test] of data.tests.entries()) {
    if (projects.length) {
      for (const project of projects) {
        try { validateProjectPersistence(project, data.runtimeMode, test.input, test.expectedPersistence); }
        catch (error) { context.addIssue({ code: "custom", path: ["tests", index, "expectedPersistence"], message: error instanceof Error ? error.message : "Expectativa de persistencia inválida." }); break; }
      }
    } else if (test.expectedPersistence !== undefined) context.addIssue({ code: "custom", path: ["tests", index, "expectedPersistence"], message: "La persistencia requiere un manifiesto de proyecto." });
  }
}).refine(data => !data.conceptRule || (data.runtimeMode === "PROGRAM" && data.activityType === "GUIDED" && data.tests.every(test => test.input === "")), "La comprobación conceptual solo se aplica a prácticas guiadas secuenciales sin entrada.");

export const publicationMetadataSchema = educationalMetadataSchema.refine(data => data.practiceGoals.length > 0, {
  message: "Describe al menos un concepto que se practicará antes de publicar.", path: ["practiceGoals"],
});
