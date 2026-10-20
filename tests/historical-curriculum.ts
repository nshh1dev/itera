// Las referencias archivadas siguen comprobándose con su secuencia original.
import { stepsForPath } from "../prisma/legacy-learning-modules";
import { exercisePosition as position } from "../src/lib/learning-paths";
export { learningModules, modulesForPath } from "../prisma/legacy-learning-modules";
export { exerciseHref, nextExerciseSlug, previousExerciseSlug } from "../src/lib/learning-paths";
export const introductorySteps = stepsForPath("desde-cero");
export const foundationSteps = stepsForPath("primeros-pasos");
export const intermediateSteps = stepsForPath("pensar-en-soluciones");
export const learningPaths = [
  { slug: "desde-cero", level: "BEGINNER", slugs: introductorySteps },
  { slug: "primeros-pasos", level: "BEGINNER", slugs: foundationSteps },
  { slug: "pensar-en-soluciones", level: "INTERMEDIATE", slugs: intermediateSteps },
  { slug: "un-paso-mas", level: "ADVANCED", slugs: stepsForPath("un-paso-mas") },
];
export const exercisePosition = position;
