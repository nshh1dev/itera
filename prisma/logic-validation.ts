import type { Language } from "../src/lib/types";

// Solo para validación editorial en Piston: conserva las firmas originales en
// ámbitos independientes y recibe todos los datos por stdin, nunca las respuestas.
// Agrupar referencias fijas evita recompilar TypeScript por cada caso pequeño.
export function functionBatch(language: Language, variants: { code: string; typeContract: string }[]): string {
  if (language === "python") {
    const functions = variants.map((variant, index) => `def __reference${index}(entrada):\n${variant.code.split("\n").map(line => `    ${line}`).join("\n")}\n    return solve(entrada)`);
    return `${functions.join("\n\n")}\n\ndef solve(data):\n    return [${variants.map((_, index) => `[__reference${index}(item) for item in data[${index}]]`).join(", ")}]\n`;
  }
  const functions = variants.map((variant, index) => `const __reference${index} = (() => {\n${variant.code}\n${language === "typescript" ? variant.typeContract : ""}\nreturn solve;\n})();`);
  const signature = language === "typescript" ? `data: [${variants.map((_, index) => `Parameters<typeof __reference${index}>[0][]`).join(", ")}]` : "data";
  return `${functions.join("\n")}\nfunction solve(${signature}) {\nreturn [${variants.map((_, index) => `data[${index}].map(item => __reference${index}(item))`).join(", ")}];\n}\n`;
}
