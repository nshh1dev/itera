import type { Language } from "./types";

export const runtimeLookupTimeoutMs = 2500;
export const minimumSubmissionBudgetMs = 120000;
export const executionRequestTimeoutMs = (language: Language) => language === "typescript" ? 25000 : 12000;

// Los casos se evalúan secuencialmente. Presupuestar solo dos minutos para el
// conjunto podía interrumpir peticiones que seguían dentro de sus límites HTTP.
// El margen cubre consultas y finalización; no amplía los límites del sandbox.
export function submissionBudgetMs(input: { language: string; totalCount: number; mode: string; conceptRule: string }) {
  const count = Number.isSafeInteger(input.totalCount) && input.totalCount > 0 ? input.totalCount : 10;
  const requestTimeout = executionRequestTimeoutMs(input.language === "python" || input.language === "javascript" ? input.language : "typescript");
  const conceptBudget = input.mode === "submit" && input.conceptRule ? runtimeLookupTimeoutMs + executionRequestTimeoutMs(input.language === "python" ? "python" : "typescript") : 0;
  return Math.max(minimumSubmissionBudgetMs, runtimeLookupTimeoutMs + count * requestTimeout + conceptBudget + 30000);
}
