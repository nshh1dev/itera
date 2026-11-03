// Comparación conservadora: omite duplicados literales, no conceptos distintos.
import type { Language } from "./types";

const normalize = (text: string) => text.trim().toLocaleLowerCase("es").replace(/\s+/g, " ").replace(/[.,;:!?]+$/, "").trim();

export function uniqueHelp(items: string[], alreadyShown: string[] = []) {
  const seen = new Set(alreadyShown.map(normalize));
  return items.map(item => item.trim()).filter(item => {
    const key = normalize(item);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function exerciseConditions(constraints: string[], statement: string, language: Language) {
  const conditions = uniqueHelp(constraints, statement.split(/\n+/));
  // Solo este respaldo editorial no añade una regla. No inferir equivalencias
  // semánticas ni ocultar límites, formatos, técnicas o instrucciones concretas.
  return language === "python" ? conditions.filter(item => item !== "Usa únicamente los datos y límites descritos en el enunciado.") : conditions;
}

export function learningHelp({ title = "", statement = "", objective, practiceGoals = [], prerequisites }: { title?: string; statement?: string; objective: string; practiceGoals?: string[]; prerequisites: string[] }) {
  const shown = [title, ...statement.split(/\n+/)];
  // Los objetivos concretos ya desarrollan el objetivo general: no mostrar ambos.
  const specificGoals = uniqueHelp(practiceGoals, shown)
    .filter(goal => !/utilizando los datos y reglas del problema\.?$/i.test(goal));
  const goals = specificGoals.length ? specificGoals : uniqueHelp([objective], shown)
    .filter(goal => !/utilizando los datos y reglas del problema\.?$/i.test(goal));
  return { goals, prerequisites: uniqueHelp(prerequisites, [...shown, ...goals]) };
}
