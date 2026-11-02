import type { VersionContent } from "../prisma/editorial-revision";
import { beforePythonFlowCopy } from "./python-flow-copy-baseline";

export const previousIntroCopy = {
  "logica-texto-calculo": { description: "Muestra primero el número obtenido al sumar 4 y 6. En la segunda línea muestra el texto literal 4 + 6. El resultado debe tener dos líneas: 10 y 4 + 6. No hay entrada." },
  "logica-guarda-cantidad": { description: "La plantilla guarda 8 en la variable puntos. Muestra el valor de puntos, no la palabra puntos. No hay entrada. Una variable se usa sin comillas; las comillas producen texto literal." },
  "logica-actualiza-puntos": { description: "Empiezas con 8 puntos y ganas 3 más. Actualiza puntos y muestra el total: 11. En Python se reasigna con =; en JavaScript y TypeScript una variable que cambia se declara con let, no const." },
  "python-constante": { description: "Representar una equivalencia fija con un nombre significativo." },
  "logica-mensaje-resultado": { description: "La entrada contiene una ciudad en una línea, sin espacios al principio ni al final. Muestra Destino: seguido de un espacio y la ciudad. Conserva mayúsculas y espacios interiores. Para Lima, muestra Destino: Lima." },
  "python-decimal": { description: "Convertir texto decimal antes de calcular." },
  "logica-booleano": { hints: ["Solo necesitas cambiar el valor asignado a listo.", "Un booleano se escribe sin comillas; no es un texto.", "Consulta el valor verdadero en la teoría del lenguaje seleccionado y conserva la impresión de la plantilla."] },
  "logica-igualdad": { hints: ["Los dos números ya están disponibles en la plantilla.", "Necesitas una comparación que produzca un booleano, no una asignación.", "Utiliza la comparación de igualdad del lenguaje seleccionado y conserva el formato de salida preparado."] },
} satisfies Record<string, Partial<VersionContent>>;

export function beforePythonIntroCopy(slug: string, content: VersionContent): VersionContent {
  content = beforePythonFlowCopy(slug, content);
  const previous = previousIntroCopy[slug as keyof typeof previousIntroCopy];
  return previous ? { ...content, ...previous } : content;
}
