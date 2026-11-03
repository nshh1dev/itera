import type { VersionContent } from "../prisma/editorial-revision";

export const previousAlgorithmCopy = {
  "logica-pareja": { description: "Encuentra dos posiciones cuyo valores sumen un objetivo, aprovechando que la lista está ordenada." },
  "logica-ranking": {
    objective: "Combinar conteos y un comparador para construir una clasificación.",
    practiceGoals: ["Elegir un mapa y definir un desempate determinista."],
  },
  "logica-cuenta-nodos": { description: "Cuenta los nodos de un árbol binario representado por diccionarios, o None si está vacío (null en JSON)." },
} satisfies Record<string, Partial<VersionContent>>;

export function beforePythonAlgorithmCopy(slug: string, content: VersionContent): VersionContent {
  const previous = previousAlgorithmCopy[slug as keyof typeof previousAlgorithmCopy];
  return previous ? { ...content, ...previous } : content;
}
