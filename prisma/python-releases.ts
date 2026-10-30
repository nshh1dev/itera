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
  // Reordenación y metadatos del recorrido intermedio (octubre de 2026).
  "49335ee4acfc5e699bd2bcdd1e3a793847daf7ea5500a80ad035a79f6ed74c5f",
];
