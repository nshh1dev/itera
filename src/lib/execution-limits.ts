import type { Language } from "./types";
import { projectLimits } from "./project";

export const maximumExecutionCodeLength = 30000;
// JSON puede representar cada unidad UTF-16 con seis bytes (\\uXXXX). Reservar
// además identificadores, modo y contexto; seguir limitando el transporte real.
export const maximumExecutionBodyBytes = projectLimits.totalBytes * 6 + 16_384;

export const runtimeLookupTimeoutMs = 2500;
export const minimumSubmissionBudgetMs = 120000;
export const executionRequestTimeoutMs = (language: Language, verifyPersistence = false) => language === "typescript" || verifyPersistence ? 25000 : 12000;

// Los casos se evalúan secuencialmente. Presupuestar solo dos minutos para el
// conjunto podía interrumpir peticiones que seguían dentro de sus límites HTTP.
// El margen cubre consultas y finalización; no amplía los límites del sandbox.
export function submissionBudgetMs(input: { language: string; totalCount: number; mode: string; conceptRule: string; verifyPersistence?: boolean }) {
  const count = Number.isSafeInteger(input.totalCount) && input.totalCount > 0 ? input.totalCount : 10;
  const requestTimeout = executionRequestTimeoutMs(input.language === "python" || input.language === "javascript" ? input.language : "typescript", input.verifyPersistence);
  const conceptBudget = input.mode === "submit" && input.conceptRule ? runtimeLookupTimeoutMs + executionRequestTimeoutMs(input.language === "python" ? "python" : "typescript") : 0;
  return Math.max(minimumSubmissionBudgetMs, runtimeLookupTimeoutMs + count * requestTimeout + conceptBudget + 30000);
}
