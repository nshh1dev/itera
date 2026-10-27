import { logicExercises } from "./logic-content";
import { seedVersionContent, type VersionContent } from "./editorial-revision";
import { pythonLessons } from "./python-lessons";
import { pythonCurriculumUnits, pythonStepSlug } from "../src/lib/python-curriculum";
import { editorialSchema, publicationMetadataSchema } from "../src/lib/editorial";
import { editorialTestsIssue } from "../src/lib/editorial-tests";
import { prerequisiteIssue } from "../src/lib/curriculum";
import type { Json } from "../src/lib/types";
import { pythonMistakes, pythonCaseHelp } from "./python-help";

function pythonOnly(content: VersionContent): VersionContent {
  return { ...content, variants: content.variants.filter(variant => variant.language === "python") };
}
const reference = (body: string) => `def solve(data):\n${body.split("\n").map(line => `    ${line}`).join("\n")}\n`;
const bridges: Record<string, string> = {
  "logica-ordena-registros": "sorted crea una lista nueva. key recibe una función que obtiene la clave: lambda item: (-item['puntos'], item['nombre']) equivale a una auxiliar con ese return. La tupla compara primero puntos negados y después nombre. Así se invierte solo la puntuación; cuando ambos campos coinciden, la ordenación estable conserva el orden original.",
  "logica-intervalos-suma": "Empieza con prefijos = [0] y añade cada suma acumulada. La consulta [inicio, fin] tiene extremos incluidos: resta prefijos[inicio] a prefijos[fin + 1]. for inicio, fin in consultas desempaqueta cada pareja. La comprensión construye una respuesta por consulta; también puedes usar un bucle con append. La consulta vacía produce [].",
  "logica-diagonales": "En una matriz de tamaño n, la diagonal principal usa [i][i] y la secundaria [i][n - 1 - i]. Una comprensión crea un valor por cada i de range(n). El centro de una matriz impar pertenece a ambas salidas: no lo elimines. Para una matriz de una celda, ambas listas contienen ese mismo valor.",
  "logica-agrupa-registros": "Cada categoría guarda una lista de nombres. grupos.setdefault(categoria, []) devuelve la lista existente o inserta una vacía antes de append. Recorrer la entrada en orden conserva el orden dentro de cada categoría, incluidas las repeticiones. Las categorías son claves dinámicas, no nombres de campos fijos. Un recorrido basta y el resultado vacío es {}.",
};

export const pythonCatalog = pythonCurriculumUnits.flatMap(unit => unit.steps.map(step => {
  const slug = pythonStepSlug(step.key);
  const existing = logicExercises.find(exercise => exercise.slug === slug);
  const addition = pythonLessons.get(slug);
  if (!existing && !addition) throw new Error(`Falta la actividad Python ${slug}`);
  const baseline = existing ? pythonOnly(seedVersionContent(existing)) : undefined;
  let content: VersionContent;
  if (addition) {
    const key = slug.replace(/^python-/, "");
    if (!pythonMistakes[key] || !pythonCaseHelp[key]) throw new Error(`${slug}: falta ayuda editorial específica.`);
    const metadata = {
      title: step.title, description: addition.objective, objective: addition.objective,
      statement: `${addition.task}\n\nAntes de resolver:\n${addition.theory}${addition.runtimeMode === "FUNCTION" ? "\n\nConserva solve(data); Itera proporciona data. Devuelve el resultado con return, sin usar input()." : "\n\nEscribe un programa completo: se compara lo que muestra en la salida."}`,
      level: unit.level, minutes: unit.slug.includes("academia") || unit.slug.includes("contactos") || unit.slug.includes("transformacion") ? 20 : unit.level === "INITIATION" ? 5 : 10,
      prerequisites: ["Las prácticas anteriores de este bloque y los conceptos ya presentados en la ruta de Python."],
      practiceGoals: [addition.objective], prerequisiteSlugs: [], activityType: unit.slug.includes("academia") || unit.slug.includes("contactos") || unit.slug.includes("transformacion") ? "INTEGRATION" : "PRACTICE",
      runtimeMode: addition.runtimeMode, conceptRule: "", complexity: unit.level === "INITIATION" ? "" : "Explica cuántos datos recorres y qué contenedores nuevos construyes; el resultado no certifica una complejidad concreta.",
      commonErrors: pythonMistakes[key],
      hints: addition.hints, constraints: ["Listas y diccionarios de hasta 100 elementos por nivel, salvo límites más específicos del enunciado.", "Las pruebas oficiales comprueban el resultado; no certifican la técnica interna empleada."],
    };
    content = { ...metadata, variants: [{ language: "python", statement: metadata.statement,
      starter: addition.runtimeMode === "PROGRAM" ? `${addition.starter}\n` : reference(addition.starter), solution: addition.runtimeMode === "PROGRAM" ? `${addition.code}\n` : reference(addition.code),
      explanation: `${addition.theory}\n\n${addition.explanation}`,
      tests: addition.cases.map(([input, expected], order) => ({ input, expected, order, visible: order < 2, explanation: pythonCaseHelp[key][order] ?? "" })),
    }] };
  } else {
    content = { ...baseline!, variants: baseline!.variants.map(variant => ({ ...variant })) };
    if (bridges[slug]) content.variants[0].explanation = bridges[slug];
  }
  return { slug, category: existing?.category ?? "Fundamentos", content, baseline };
}));

// Prerrequisitos Python independientes de los de las versiones compartidas.
for (const [index, entry] of pythonCatalog.entries()) entry.content.prerequisiteSlugs = index ? [pythonCatalog[index - 1].slug] : [];

export function validatePythonCatalog() {
  const entries = pythonCatalog.map((entry, order) => ({ slug: entry.slug, order }));
  if (new Set(entries.map(entry => entry.slug)).size !== entries.length) throw new Error("Hay identidades Python repetidas.");
  for (const entry of pythonCatalog) {
    const content = entry.content;
    publicationMetadataSchema.parse(content);
    for (const key of ["title", "description", "statement", "level", "minutes", "hints", "constraints"] as const) editorialSchema.shape[key].parse(content[key]);
    if (content.variants.length !== 1 || content.variants[0].language !== "python") throw new Error(`${entry.slug}: el lote debe contener solo Python.`);
    const variant = content.variants[0];
    editorialSchema.shape.python.parse(variant);
    const issue = editorialTestsIssue(variant.tests.map(test => ({ ...test, input: test.input as Json, expected: test.expected as Json })), content.runtimeMode);
    if (issue) throw new Error(`${entry.slug}: ${issue}`);
    const prerequisite = prerequisiteIssue(entry.slug, content.prerequisiteSlugs, entries, entries.map(entry => entry.slug));
    if (prerequisite) throw new Error(`${entry.slug}: ${prerequisite}`);
  }
}
