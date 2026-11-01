import type { VersionContent } from "../prisma/editorial-revision";

export const previousFileTheoryHints: Record<string, { index: number; text: string }> = {
  "logica-lee-archivo": { index: 2, text: "Consulta el índice recibido después de leer; normaliza -1 si tu lenguaje no admite índices negativos." },
};

// Reconstruye solo la pista Python heredada; enunciados y contratos intactos.
export function beforePythonFileTheory(slug: string, content: VersionContent): VersionContent {
  const hint = previousFileTheoryHints[slug];
  return hint ? { ...content, hints: content.hints.map((text, index) => index === hint.index ? hint.text : text) } : content;
}
