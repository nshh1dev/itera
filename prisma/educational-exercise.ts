import type { SeedExercise } from "./content";
import type { Json } from "../src/lib/types";

type Definition = {
  slug: string; title: string; level: SeedExercise["level"]; category?: string; minutes: number;
  problem: string; input: string; output: string; context: string;
  goals: string[]; previous: string[]; knowledge: string[];
  hints: [string, string, string]; reasoning: string; steps: string; cost: string; mistakes: string;
  python: string; javascript: string; pythonNote: string; javascriptNote: string;
  setup?: { python: string; javascript: string }; starters?: SeedExercise["starters"];
  tests: [Json, Json, string?][]; constraints: string[];
};

// Divide un texto breve en frases completas sin perder el punto final.
const sentences = (text: string) => text.split(/(?<=\.)\s+/).map(item => item.trim()).filter(Boolean);

// Solo composición editorial: las respuestas de los casos se escriben a mano,
// nunca se calculan ejecutando la referencia que deben verificar.
export function educationalExercise(d: Definition): SeedExercise {
  const shared = `Razonamiento\n${d.reasoning}\n\nPaso a paso\n${d.steps}\n\nCoste\n${d.cost}\n\nErrores comunes\n${d.mistakes}`;
  return {
    complexity: d.cost, commonErrors: sentences(d.mistakes),
    slug: d.slug, title: d.title, level: d.level, category: d.category ?? "Algoritmos", minutes: d.minutes,
    description: d.problem, objective: d.goals[0], practiceGoals: d.goals,
    prerequisites: d.knowledge, prerequisiteSlugs: d.previous, activityType: d.level === "BEGINNER" ? "GUIDED" : "PRACTICE",
    statement: `${d.problem}\n\n${d.context}\n\nEntrada\n${d.input}\n\nResultado esperado\n${d.output}`,
    constraints: ["Implementa solve(data) y devuelve JSON; la aplicación proporciona la entrada.", ...d.constraints],
    hints: d.hints, explanation: shared,
    explanations: { python: `${shared}\n\nEn Python\n${d.pythonNote}`, javascript: `${shared}\n\nEn JavaScript\n${d.javascriptNote}` },
    python: `def solve(data):\n${d.python.trimEnd()}\n`, javascript: `function solve(data) {\n${d.javascript.trimEnd()}\n}\n`,
    starters: d.starters ?? {
      python: `def solve(data):\n${d.setup?.python ?? "    # " + d.goals[0]}\n    return None\n`,
      javascript: `function solve(data) {\n${d.setup?.javascript ?? "  // " + d.goals[0]}\n  return null;\n}\n`,
    },
    tests: d.tests.map(([input, expected, explanation]) => ({ input, expected, ...(explanation ? { explanation } : {}) })),
  };
}
