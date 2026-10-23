import "server-only";
import { conceptRules, conceptMessages, satisfiesConcept, type ConceptRule } from "@/lib/concept-validation";
import type { Language } from "@/lib/types";
import { availableRuntime, runCode, RunnerUnavailable } from "./piston";
import { pythonConceptParser, typescriptConceptParser } from "./concept-parsers";

export async function checkConcept(language: Language, code: string, policy: string): Promise<string | null> {
  if (!policy) return null; // Versiones anteriores: mismo contrato de evaluación.
  if (!conceptRules.includes(policy as ConceptRule)) throw new RunnerUnavailable("La regla educativa no está disponible. Este intento no cuenta como incorrecto.");
  const parserLanguage = language === "python" ? "python" : "typescript";
  const runtime = await availableRuntime(parserLanguage);
  const output = await runCode(parserLanguage, runtime, language === "python" ? pythonConceptParser : typescriptConceptParser, JSON.stringify(code), "PROGRAM");
  if (output.code !== 0 || output.signal || output.status) throw new RunnerUnavailable("No se pudo comprobar el concepto del ejercicio. Tu código sigue guardado; vuelve a intentarlo.");
  let program: unknown;
  try { program = JSON.parse(output.stdout); } catch { throw new RunnerUnavailable("La comprobación educativa se interrumpió. Vuelve a intentarlo."); }
  return satisfiesConcept(program, policy as ConceptRule) ? null : conceptMessages[policy as ConceptRule];
}
