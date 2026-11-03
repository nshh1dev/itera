import type { VersionContent } from "../prisma/editorial-revision";
import { beforePythonAlgorithmCopy } from "./python-algorithm-copy-baseline";

export const previousNestedCopy = {
  "python-clave-longitud": { description: "Pasar una función como clave de ordenación." },
  "python-lambda-desempate": { description: "Definir una clave compuesta con una función breve." },
  "python-formato-decimal": { description: "Formatear decimales sin confundir texto y valor numérico." },
  "python-consulta-anidada": { description: "Consultar dos niveles con respaldo sin perder el cero." },
  "python-inventario-valora": { description: "Integrar cálculo monetario entero y reporte con desempates." },
  "python-academia-inscribe": { description: "Integrar creación de claves anidadas sin reemplazar datos previos." },
  "python-academia-califica": { description: "Validar una actualización de estado anidado antes de aplicarla." },
  "python-academia-resume": { description: "Integrar ausencia, agregación y desempates sobre registros académicos." },
  "python-contactos-crea": { description: "Crear contactos con una política consistente de identidad." },
  "python-contactos-edita": { description: "Limitar una actualización a campos y tipos permitidos." },
  "python-contactos-borra": { description: "Aplicar una política de identidad consistente al eliminar contactos." },
  "python-contactos-busca": { description: "Combinar criterios de búsqueda sin introducir sintaxis nueva." },
  "python-transforma-campo": { description: "Aplicar una transformación puntual sobre una copia." },
  "python-transforma-registros": { description: "Integrar despacho por nombres y recuperación de errores por campo." },
} satisfies Record<string, Partial<VersionContent>>;

export function beforePythonNestedCopy(slug: string, content: VersionContent): VersionContent {
  content = beforePythonAlgorithmCopy(slug, content);
  const previous = previousNestedCopy[slug as keyof typeof previousNestedCopy];
  return previous ? { ...content, ...previous } : content;
}
