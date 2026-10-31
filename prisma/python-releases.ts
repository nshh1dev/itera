import { createHash } from "node:crypto";
import { catalogRevisionFingerprint } from "./editorial-revision";

export function pythonReleaseFingerprint(entries: readonly { slug: string; content: Parameters<typeof catalogRevisionFingerprint>[0] }[]) {
  const revisions = entries.map(entry => [entry.slug, catalogRevisionFingerprint(entry.content)]).sort(([a], [b]) => a.localeCompare(b));
  return createHash("sha256").update(JSON.stringify(revisions)).digest("hex");
}

// Huellas de fuentes ya publicadas y verificadas. Permiten revisar nuestro lote
// sin confundirlo con contenido local distinto ni sobrepasar borradores ajenos.
export const knownPythonReleases: readonly string[] = [
  "a64d5e9ffde482605295def1c7740daef36787a1c7ce6a3706c4ec4f276245b4",
  // Entrega anterior conservada para poder revisar instalaciones que la publicaron.
  "49335ee4acfc5e699bd2bcdd1e3a793847daf7ea5500a80ad035a79f6ed74c5f",
  // Reordenación, contratos prioritarios y modelo de árboles (octubre de 2026).
  "e2cd539e00a8cacad4bc7d5619b3f9c7445d704d666928236d0e03ef1833c29e",
  // Explicaciones de todos los ejemplos públicos del recorrido Python.
  "158b71f24f4c58e7094e02005764008b2726c611a1e48cb7e24a145b9c13bcd0",
  // Coste concreto u omisión explícita en actividades propias y proyectos Python.
  "0aadf92e9a9d76acc7ccb74e749b8444720b4ac17458bb212cc4a34d0897e4e5",
  // Aclaraciones de enunciado tras la auditoría individual de iniciación.
  "525bb2fd44a0485e8474c0aa7ae87c05ba7c64ef7a8fab51b9dca9bbbfd0d550",
  // Auditoría de principiante: conversiones Python y casos discriminantes.
  "a076fff6c27b83d86483946b95d5b9dd347a2c692ac2c0953647a563626fd407",
  // Auditoría intermedia de colecciones: conservación, orden y selección.
  "e59cbd277aa70f38b783ccdfa346e4b730c100bf46cee4dacfac7b9ea9f13b02",
];
