import type { VersionContent } from "../prisma/editorial-revision";

export const previousRecordTheoryTasks: Record<string, string> = {
  "python-filter": "Selecciona adultos practicando filter y una auxiliar booleana. filter(predicado, registros) conserva los registros cuyo predicado es verdadero, sin transformarlos; después puedes extraer sus nombres.",
  "python-consulta-anidada": "Consulta una nota en un registro anidado. get permite dar un respaldo si falta una clave; un diccionario vacío como respaldo permite continuar la consulta. No uses la falsedad de una nota para decidir si está ausente.",
  "python-academia-califica": "Califica solo una inscripción existente. Inscripción y calificación tienen reglas distintas: valida existencia y rango antes de asignar. Una condición con and puede evitar consultar un alumno ausente.",
};

// Restaura solo Tu tarea; los contratos actuales siguen incluidos en las huellas.
export function beforePythonRecordTheory(slug: string, content: VersionContent): VersionContent {
  if (!(slug in previousRecordTheoryTasks)) return content;
  const restore = (text: string) => {
    const index = text.indexOf("\n\nEntrada\n");
    if (index < 0) throw new Error(`Falta Entrada en ${slug}`);
    return `Tu tarea\n${previousRecordTheoryTasks[slug]}${text.slice(index)}`;
  };
  return { ...content, statement: restore(content.statement), variants: content.variants.map(variant => {
    if (!variant.statement) throw new Error(`Falta el enunciado Python de ${slug}`);
    return { ...variant, statement: restore(variant.statement) };
  }) };
}
