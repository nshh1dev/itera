export type DraftSaveResult =
  | { revision: number }
  | { error: string; kind: "auth" | "invalid" | "unavailable" | "conflict" | "temporary" };

export const temporaryDraftFailure = {
  kind: "temporary" as const,
  error: "No se pudo sincronizar. Volveremos a intentarlo automáticamente. Copia tu código antes de cerrar si no se puede guardar en este navegador.",
};

// La misma política se aplica a errores devueltos por el servidor y a respuestas
// perdidas en el transporte. Solo los errores recuperables permiten reintentar.
export function draftSaveFeedback(result: DraftSaveResult, previousDelay: number) {
  if ("revision" in result) return { blocked: false, delay: 900, error: "" };
  const retry = result.kind === "temporary";
  return { blocked: !retry, delay: retry ? Math.min(previousDelay * 2, 30000) : previousDelay, error: result.error };
}
