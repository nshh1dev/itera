import { isDeepStrictEqual } from "node:util";

/** El orden del selector y la marca pública readOnly no cambian el programa.
 * El contenido y los nombres sí: una clave idempotente nunca admite otro código.
 * La autorización y la validación contra el manifiesto siguen en el endpoint.
 */
export function sameSubmissionFiles(saved: unknown, incoming: unknown) {
  const normalize = (value: unknown) => {
    if (value === null || value === undefined) return null;
    if (!Array.isArray(value) || value.some(file => !file || typeof file.path !== "string" || typeof file.content !== "string")) return undefined;
    const paths = new Set(value.map(file => file.path));
    if (paths.size !== value.length) return undefined;
    return value.map(file => ({ path: file.path as string, content: file.content as string })).sort((a, b) => a.path.localeCompare(b.path));
  };
  const a = normalize(saved);
  const b = normalize(incoming);
  return a !== undefined && b !== undefined && isDeepStrictEqual(a, b);
}
