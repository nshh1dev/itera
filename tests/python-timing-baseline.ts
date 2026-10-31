import type { VersionContent } from "../prisma/editorial-revision";
import { pythonTimingRevisions } from "../prisma/python-timing";

// Las huellas editoriales anteriores siguen verificando su catálogo original.
// La prueba de tiempos protege por separado todos los campos salvo los minutos
// de las 54 identidades revisadas y comprueba la procedencia de sus valores previos.
export function beforePythonTiming(slug: string, content: VersionContent): VersionContent {
  const revision = pythonTimingRevisions[slug];
  return revision ? { ...content, minutes: revision.previousMinutes } : content;
}
