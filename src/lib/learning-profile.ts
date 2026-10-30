import { levels, type Language, type Level } from "./types";

export const levelDescriptions: Record<Level, string> = {
  INITIATION: "Empieza con instrucciones, valores y variables. No necesitas conocimientos previos.",
  BEGINNER: "Ya conoces lo básico y quieres practicar condiciones, listas y bucles.",
  INTERMEDIATE: "Combinas funciones y estructuras de datos para resolver problemas.",
  ADVANCED: "Trabajas con algoritmos y quieres profundizar en árboles, grafos y optimización.",
};
export const declaredLevelNames: Record<Level, string> = { INITIATION: "Nunca he programado", BEGINNER: "Principiante", INTERMEDIATE: "Intermedio", ADVANCED: "Avanzado" };

// Dos retos del nivel declarado y un tercero de contraste, siempre opcional.
export const diagnosticExercises: Record<Level, readonly string[]> = {
  INITIATION: ["logica-saludo", "logica-actualiza-puntos", "logica-elige-mensaje"],
  BEGINNER: ["logica-signo", "logica-suma-lista", "logica-repetido"],
  INTERMEDIATE: ["logica-frecuencias", "logica-busqueda-binaria", "logica-cuenta-nodos"],
  ADVANCED: ["logica-altura", "logica-potencia", "logica-escalera"],
};

export function diagnosticRulesVersion(language: Language) {
  return language === "python" ? 2 : 1;
}

export function diagnosticRecommendation(declared: Level, outcomes: readonly ("PASSED" | "FAILED" | "ERROR" | "RUNNING" | null)[], rulesVersion = 1) {
  if (rulesVersion !== 1 && rulesVersion !== 2) return { level: null, reason: "No podemos interpretar esta versión del diagnóstico. Conservamos tu punto de partida declarado; puedes repetirlo desde Aprendizaje." };
  const valid = outcomes.slice(0, 2).filter(value => value === "PASSED" || value === "FAILED");
  if (valid.length < 2) return { level: null, reason: "No hay dos ejercicios evaluados. Conservamos tu nivel declarado; los errores del ejecutor y los ejercicios sin evaluar no cuentan como fallos." };
  const passed = valid.filter(value => value === "PASSED").length;
  const index = levels.indexOf(declared);
  if (rulesVersion === 2) {
    if (passed === 0) return { level: levels[Math.max(0, index - 1)], reason: "Los dos retos iniciales no se resolvieron. Te proponemos reforzar las bases como apoyo, sin bloquear la ruta que elegiste ni atribuir un nivel de conocimientos a este resultado." };
    return { level: declared, reason: passed === 2
      ? outcomes[2] === "PASSED"
        ? "Resolviste los dos retos iniciales y el contraste. Conservamos tu ruta: estas tareas breves, algunas con plantilla guiada, no bastan para saltar una etapa completa. Puedes explorar la siguiente ruta y volver cuando lo necesites."
        : "Resolviste los dos retos iniciales. Conservamos tu ruta para practicar con menos ayuda y consolidar lo aprendido; este diagnóstico breve no acredita toda la etapa."
      : "Resolviste uno de los dos retos iniciales. Conservamos tu ruta para reforzar las tareas pendientes; una plantilla completada no certifica dominio del resto de la etapa." };
  }
  if (passed === 0) return { level: levels[Math.max(0, index - 1)], reason: "Los dos retos iniciales necesitan más práctica. Te proponemos reforzar las bases antes de continuar." };
  if (passed === 2 && outcomes[2] === "PASSED" && index < levels.length - 1) return { level: levels[index + 1], reason: "Resolviste los dos retos de tu nivel y el reto de contraste. Puedes probar la siguiente ruta." };
  return { level: declared, reason: passed === 2 ? "Resolviste los dos retos iniciales. Tu nivel declarado es un buen punto de partida." : "Resolviste uno de los dos retos iniciales. Esta ruta te ayudará a afianzar lo que ya conoces." };
}

export function effectiveLevel(declared: Level | undefined, diagnostic?: { declaredLevel: Level; suggestedLevel: Level | null } | null) {
  return diagnostic && diagnostic.declaredLevel === declared && diagnostic.suggestedLevel ? diagnostic.suggestedLevel : declared ?? "INITIATION";
}
