import type { Json } from "./types";

export type PublicExample = { input: Json; expected: Json; explanation?: string };

// Solo presentación de casos ya públicos. No se reciben ni procesan ocultos.
export function distinctExamples(examples: PublicExample[]) {
  const seen = new Set<string>();
  return examples.filter(example => {
    const key = JSON.stringify([example.input, example.expected]);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
