import type { Json } from "./types";

export type PublicExample = { input: Json; expected: Json; expectedFiles?: { path: string; content: string }[]; explanation?: string };

// Solo cambia espacios de presentación. Las listas planas y los valores simples
// siguen compactos; diccionarios y listas anidadas se leen con sangrado.
export function exampleJson(value: Json, readable = false) {
  const structured = value !== null && typeof value === "object" && (
    Array.isArray(value)
      ? value.some(item => item !== null && typeof item === "object")
      : Object.keys(value).length > 0
  );
  return JSON.stringify(value, null, readable && structured ? 2 : undefined);
}

// Solo presentación de casos ya públicos. No se reciben ni procesan ocultos.
export function distinctExamples(examples: PublicExample[]) {
  const seen = new Set<string>();
  return examples.filter(example => {
    const key = JSON.stringify([example.input, example.expected, example.expectedFiles]);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
