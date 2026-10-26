import { randomUUID } from "node:crypto";

const phases = ["draft.save", "editorial.save", "editorial.publish", "editorial.prepare", "execution.load", "execution.state", "execution.runtime", "execution.case", "execution.concept", "execution.finalize", "execution.error.persist", "execution.reconcile"] as const;
export type OperationalPhase = (typeof phases)[number];

// No recibe el error ni un objeto de contexto: pueden contener SQL, código,
// credenciales o entradas/salidas ocultas. Solo admite campos enumerados.
export function reportOperationalFailure(phase: OperationalPhase, submissionId?: string) {
  try {
    if (!phases.includes(phase)) return;
    const safeId = typeof submissionId === "string" && /^(?:c[a-z0-9]{24,31}|[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12})$/i.test(submissionId) ? submissionId : undefined;
    console.error(JSON.stringify({ event: "itera.operational_failure", id: randomUUID(), phase, ...(safeId ? { submissionId: safeId } : {}) }));
  } catch {
    // Un fallo del destino de logs no debe cambiar guardado ni evaluación.
  }
}
