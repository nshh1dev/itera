import type { VersionContent } from "../prisma/editorial-revision";
import { beforePythonPrerequisiteVocabulary } from "./python-prerequisite-vocabulary-baseline";

export const previousRecordVocabulary = {
  "logica-ficha-producto": { description: "Recibe una ficha con nombre, texto ASCII, y precio, entero de 0 a 1000" },
  "logica-ficha-resultado": {
    objective: "Construir una ficha que agrupa un cálculo y un dato recibido.",
    practiceGoals: ["Construir una ficha que agrupa un cálculo y un dato recibido."],
  },
  "logica-registro-compartido": {
    description: "Modifica un registro intencionalmente",
    objective: "Modificar intencionalmente un registro y observarlo desde su alias.",
    hints: ["Ficha y alias son el mismo objeto.", "Cambia el valor asociado a la clave cantidad, no reasignes alias.", "Ambas consultas observan la cantidad actualizada."],
    practiceGoals: ["Modificar intencionalmente un registro y observarlo desde su alias."],
  },
  "python-lista-registros": {
    hints: ["Cada registro cuenta, aunque se repita el nombre.", "Accede a cantidad dentro de cada ficha.", "Acumula ficha['cantidad'] en total y devuelve total al terminar."],
  },
  "python-crea-grupo": {
    description: "Crear el contenedor interior antes de añadir un registro.",
    objective: "Crear el contenedor interior antes de añadir un registro.",
    practiceGoals: ["Crear el contenedor interior antes de añadir un registro."],
  },
  "logica-agrupa-registros": { description: "Recibe una lista de hasta 100 registros con categoria y nombre" },
  "logica-ordena-registros": { description: "Recibe hasta 100 registros con nombre, texto de letras a-z, y puntos, entero de 0 a 1000" },
  "logica-actualiza-persistidos": {
    description: "Actualiza datos sin perder registros anteriores",
    objective: "Actualiza datos sin perder registros anteriores",
    practiceGoals: ["Actualiza datos sin perder registros anteriores", "Comprobar casos límite y explicar el reparto de responsabilidades."],
  },
} satisfies Record<string, Partial<VersionContent>>;

export function beforePythonRecordVocabulary(slug: string, content: VersionContent): VersionContent {
  content = beforePythonPrerequisiteVocabulary(slug, content);
  const previous = previousRecordVocabulary[slug as keyof typeof previousRecordVocabulary];
  return previous ? { ...content, ...previous } : content;
}
