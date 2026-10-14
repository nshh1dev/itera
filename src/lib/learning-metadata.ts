import { z } from "zod";

export const learningMetadataSchema = z.object({
  objective: z.string().trim().min(10, "Describe qué se aprenderá (al menos 10 caracteres).").max(500),
  prerequisites: z.array(z.string().trim().min(2).max(120)).max(8).refine(
    items => new Set(items.map(item => item.toLocaleLowerCase("es"))).size === items.length,
    "No repitas conocimientos previos.",
  ),
});

export type LearningMetadata = z.infer<typeof learningMetadataSchema>;
