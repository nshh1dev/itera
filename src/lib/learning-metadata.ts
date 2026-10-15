import { z } from "zod";

export const editorialTextSchema = z.string().trim().refine(
  text => !/esta versión (todavía no tiene|no especifica)|objetivo (editorial )?pendiente|por completar|lorem ipsum/i.test(text),
  "Sustituye el texto de relleno por contenido educativo real.",
);

export const learningMetadataSchema = z.object({
  objective: editorialTextSchema.min(10, "Describe qué se aprenderá (al menos 10 caracteres).").max(500),
  prerequisites: z.array(editorialTextSchema.min(2).max(120)).max(8).refine(
    items => new Set(items.map(item => item.toLocaleLowerCase("es"))).size === items.length,
    "No repitas conocimientos previos.",
  ),
});

// Los valores vacíos mantienen la compatibilidad de las revisiones anteriores.
// Publicar contenido nuevo exige además al menos un objetivo de práctica.
export const educationalMetadataSchema = learningMetadataSchema.extend({
  practiceGoals: z.array(editorialTextSchema.min(10).max(300)).max(4).default([]).refine(
    items => new Set(items.map(item => item.toLocaleLowerCase("es"))).size === items.length,
    "No repitas objetivos de práctica.",
  ),
  prerequisiteSlugs: z.array(z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100)).max(8).default([]).refine(
    items => new Set(items).size === items.length, "No repitas ejercicios previos.",
  ),
  activityType: z.enum(["OBSERVATION", "GUIDED", "PRACTICE", "INTEGRATION"]).default("PRACTICE"),
});

export type LearningMetadata = z.infer<typeof learningMetadataSchema>;
