import type { VersionContent } from "../prisma/editorial-revision";
import { pythonLessons } from "../prisma/python-lessons";
import { pythonRecordExplanations } from "../prisma/python-record-explanations";
import { beforePythonIntro } from "./python-intro-baseline";

// Esta práctica ya tenía una explicación específica aplicada por pythonOverrides.
const previousSearch = "La auxiliar recorre todos los filtros y devuelve False ante un campo ausente o un fragmento que no coincide. Los campos presentes son textos según el contrato; lower normaliza solo para comparar y no cambia la agenda. Sin filtros, todas las fichas cumplen. Se ordenan los nombres aceptados; no basta con que coincida un solo filtro.";

// Reconstrucción de prosa previa solo para huellas históricas, nunca para publicar.
export function beforePythonRecords(slug: string, content: VersionContent): VersionContent {
  content = beforePythonIntro(slug, content);
  if (!(slug in pythonRecordExplanations)) return content;
  const lesson = pythonLessons.get(slug);
  if (!lesson) throw new Error(`Falta la lección original de ${slug}`);
  return { ...content, variants: content.variants.map(variant => ({
    ...variant, explanation: slug === "python-contactos-busca" ? previousSearch : `${lesson.theory}\n\n${lesson.explanation}`,
  })) };
}
