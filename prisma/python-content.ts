import { logicExercises } from "./logic-content";
import { seedVersionContent, type VersionContent } from "./editorial-revision";
import { pythonLessons } from "./python-lessons";
import { pythonCurriculumUnits, pythonStepSlug, pythonStepMetadata, pythonPrerequisiteSlugs } from "../src/lib/python-curriculum";
import { editorialSchema, publicationMetadataSchema } from "../src/lib/editorial";
import { editorialTestsIssue } from "../src/lib/editorial-tests";
import { prerequisiteIssue } from "../src/lib/curriculum";
import type { Json } from "../src/lib/types";
import { pythonMistakes, pythonCaseHelp, pythonSharedCaseHelp } from "./python-help";

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

// Excepciones Python sobre actividades compartidas. No cambian el contenido ni
// las variantes de JavaScript o TypeScript.
type PythonVariantOverride = { starter?: string; solution?: string; explanation?: string; statement?: string; tests?: VersionContent["variants"][number]["tests"] };
type PythonOverride = { level?: VersionContent["level"]; minutes?: number; description?: string; objective?: string; statement?: string; statementNote?: string; hints?: string[]; constraints?: string[]; tree?: boolean; extraTests?: { input: Json; expected: Json; explanation?: string }[]; variant?: PythonVariantOverride };

const renameTreeKeys = (value: Json): Json => {
  if (Array.isArray(value)) return value.map(renameTreeKeys);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [
      key === "v" ? "value" : key === "izq" ? "left" : key === "der" ? "right" : key,
      renameTreeKeys(item as Json),
    ]));
  }
  return value;
};
const pythonTreeCode = (code: string) => code
  .replaceAll("['v']", "['value']")
  .replaceAll("['izq']", "['left']")
  .replaceAll("['der']", "['right']");
const chainTree = (depth: number): Json => {
  let node: Json = null;
  for (let value = depth; value >= 1; value--) node = { value, left: null, right: node };
  return node;
};
const balancedTree = (depth: number, value = 1): Json => depth === 0 ? null : {
  value,
  left: balancedTree(depth - 1, value * 2),
  right: balancedTree(depth - 1, value * 2 + 1),
};
const pythonOverrides: Record<string, PythonOverride> = {
  "logica-busqueda-lineal": { level: "BEGINNER", minutes: 12, description: "Recorre una lista sin ordenar y devuelve la primera posición que coincide." },
  "logica-pruebas-limites": {
    description: "Reproduce con pruebas los defectos de vacío y negativos y corrige la función.",
    objective: "Elegir casos que distingan supuestos y corregir una implementación a partir de ellos.",
    statement: "La función mayor debe devolver el mayor de una lista o None si está vacía. La plantilla contiene un defecto. Escribe aserciones para [], [-4] y [-8,-2], localiza qué supuesto falla, corrige la implementación y devuelve el resultado. Las pruebas oficiales cambian la entrada y comparan el resultado; no cuentan aserciones ni mensajes que declares.",
    hints: ["Prueba primero la lista vacía y una lista solo con negativos.", "Inicializar el máximo en cero supone que siempre hay un valor mayor o igual que cero.", "Resuelve el vacío y usa el primer elemento real como candidato antes de recorrer."],
    variant: {
      starter: "def solve(data):\n    def mayor(valores):\n        actual = 0\n        for n in valores:\n            if n > actual:\n                actual = n\n        return actual\n    return mayor(data)",
      explanation: "Con actual = 0, la lista vacía devuelve 0 en lugar de None y una lista negativa devuelve 0 aunque el máximo sea negativo. Las aserciones para [], [-4] y [-8,-2] reproducen esos defectos. La corrección comprueba el vacío y usa valores[0] como candidato. Las pruebas oficiales evalúan el resultado, no la calidad de tus aserciones.",
    },
  },
  "logica-reproduce-fallo": {
    description: "Investiga y corrige un contador que no cumple su contrato.",
    objective: "Investigar un fallo con un caso mínimo y conservar una regresión.",
    statement: "Un contador debe devolver cuántos elementos de una lista son estrictamente positivos. La implementación de la plantilla no cumple el contrato. Reproduce el fallo con un caso mínimo, explica qué supuesto es incorrecto y corrígelo. Las pruebas oficiales incluyen listas vacías, ceros y negativos; un mensaje que declare que las pruebas pasan no acredita la corrección.",
    hints: ["Busca un caso con cero y compáralo con el contrato.", "El caso [0] debería devolver 0; observa qué devuelve la plantilla.", "Ajusta la comparación para excluir el cero y conserva una aserción que lo compruebe."],
    variant: {
      explanation: "El caso [0] expone que la comparación n >= 0 incluye el cero; el contrato pide estrictamente positivos. Cambiar a n > 0 corrige el contador y la aserción contar([0]) == 0 conserva la regresión. El diagnóstico se apoya en un caso mínimo, no en un mensaje autodeclarado.",
    },
  },
  "logica-altura": {
    tree: true,
    statement: "Recibes un árbol binario o None. Cada nodo es un diccionario con value (entero), left y right (otro nodo o None). La altura cuenta nodos: un árbol vacío tiene 0, una hoja 1 y cada nodo suma uno a la mayor altura de sus hijos. Devuelve la altura del árbol. Hay hasta 500 nodos y profundidad máxima 50.",
    constraints: ["Hasta 500 nodos y profundidad máxima 50; los casos incluyen una cadena sesgada y un árbol equilibrado."],
    extraTests: [
      { input: chainTree(50), expected: 50, explanation: "Una cadena de 50 nodos comprueba que la recursión llega al límite declarado." },
      { input: balancedTree(5), expected: 5, explanation: "Un árbol equilibrado de altura 5 combina las dos ramas." },
    ],
  },
  "logica-preorden": {
    tree: true,
    constraints: ["Hasta 500 nodos y profundidad máxima 50; los casos incluyen una cadena sesgada."],
    extraTests: [
      { input: chainTree(50), expected: Array.from({ length: 50 }, (_, index) => index + 1), explanation: "Una cadena derecha produce los valores en orden creciente." },
    ],
  },
  "logica-niveles": {
    tree: true,
    constraints: ["Hasta 500 nodos y profundidad máxima 50; los casos incluyen una cadena sesgada."],
    extraTests: [
      { input: chainTree(50), expected: Array.from({ length: 50 }, (_, index) => index + 1), explanation: "La cola conserva el orden de una cadena sesgada." },
    ],
  },
  "logica-arbol-busqueda": {
    tree: true,
    constraints: ["Hasta 500 nodos, profundidad máxima 50 y valores distintos; los casos incluyen una cadena sesgada válida."],
    extraTests: [
      { input: chainTree(50), expected: true, explanation: "Una cadena derecha con valores crecientes respeta el rango heredado." },
    ],
  },
  "logica-ancestro": { statementNote: "Cada nodo de tree es un diccionario con value, left y right; left y right son otro nodo o None." },
  "logica-asercion-normal": { statementNote: "La comprobación evalúa el resultado; no certifica que la aserción esté presente en tu código." },
  "logica-conserva-regresion": { statementNote: "La comprobación evalúa el resultado; no certifica que las aserciones de regresión estén presentes." },
  "logica-captura-conversion": { statementNote: "La comprobación evalúa la conversión y el valor devuelto; no certifica que el código use exactamente el mismo try/except." },
  "logica-error-dominio": { statementNote: "La comprobación observa el mensaje; no certifica que uses raise." },
  "logica-recupera-elementos": { statementNote: "La comprobación evalúa la lista y el conteo; no certifica el alcance exacto del try." },
  "logica-inventario": {
    description: "Acumula los cambios por producto y conserva saldos cero o negativos.",
    statementNote: "Este ejercicio acumula saldos por producto y admite valores negativos. No aplica la regla de stock no negativo del ejercicio de saldo.",
  },
  "logica-saldo": {
    description: "Aplica movimientos a un saldo sin permitir que quede negativo.",
    statementNote: "Este ejercicio rechaza los movimientos que dejarían el saldo negativo. Es un modelo distinto de la acumulación por producto, que sí admite saldos negativos.",
  },
  "logica-inventario-modular": { statementNote: "Este proyecto aplica stock no negativo, no la acumulación con saldos negativos del ejercicio inventario." },
  "logica-inventario-persistente": { statementNote: "Este proyecto aplica stock no negativo, no la acumulación con saldos negativos del ejercicio inventario." },
  "logica-copia-anidada": { description: "Aplica la copia exterior e interior a una matriz después de practicarla con registros." },
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
    const projection = pythonStepMetadata(slug);
    if (!projection) throw new Error(`${slug}: falta proyección Python.`);
    const metadata = {
      title: step.title, description: addition.objective, objective: addition.objective,
      statement: `${addition.task}\n\nAntes de resolver:\n${addition.theory}${addition.runtimeMode === "FUNCTION" ? "\n\nConserva solve(data); Itera proporciona data. Devuelve el resultado con return, sin usar input()." : "\n\nEscribe un programa completo: se compara lo que muestra en la salida."}`,
      level: unit.level, minutes: projection.minutes,
      prerequisites: ["Las prácticas anteriores de este bloque y los conceptos ya presentados en la ruta de Python."],
      practiceGoals: [addition.objective], prerequisiteSlugs: [], activityType: projection.activityType,
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
  const override = pythonOverrides[slug];
  if (override) {
    content = {
      ...content,
      ...(override.level ? { level: override.level } : {}),
      ...(override.minutes ? { minutes: override.minutes } : {}),
      ...(override.description ? { description: override.description } : {}),
      ...(override.objective ? { objective: override.objective } : {}),
    };
    if (override.statement) {
      content.statement = override.statement;
      content.variants[0].statement = override.statement;
    } else if (override.statementNote) {
      content.statement = `${content.statement}\n\n${override.statementNote}`;
      if (content.variants[0].statement) content.variants[0].statement = `${content.variants[0].statement}\n\n${override.statementNote}`;
    }
    if (override.hints) content.hints = override.hints;
    if (override.constraints) content.constraints = override.constraints;
    if (override.variant) content.variants[0] = { ...content.variants[0], ...override.variant };
    if (override.tree) {
      const baseTests = content.variants[0].tests.map(test => ({ ...test, input: renameTreeKeys(test.input as Json) }));
      const extraTests = (override.extraTests ?? []).map((test, index) => ({
        input: renameTreeKeys(test.input), expected: test.expected,
        order: baseTests.length + index, visible: false, explanation: test.explanation ?? "",
      }));
      content.variants[0].tests = [...baseTests, ...extraTests];
      content.variants[0].solution = pythonTreeCode(content.variants[0].solution);
      const model = "En Python, cada nodo usa las claves value (entero), left y right (otro nodo o None).";
      const limit = "Los casos Python usan hasta 500 nodos y profundidad máxima 50.";
      const variantStatement = content.variants[0].statement ?? content.statement;
      content.statement = content.statement.replaceAll("10000 nodos", "500 nodos");
      content.variants[0].statement = variantStatement.replaceAll("10000 nodos", "500 nodos");
      if (!content.statement.includes("left")) {
        content.statement = `${content.statement}\n\n${model} ${limit}`;
        content.variants[0].statement = `${content.variants[0].statement}\n\n${model} ${limit}`;
      }
      content.variants[0].explanation = `${content.variants[0].explanation}\n\n${model} No uses v, izq o der en esta variante.`;
    }
  }
  const exampleHelp = pythonSharedCaseHelp[slug];
  if (exampleHelp) content.variants[0].tests = content.variants[0].tests.map(test => ({
    ...test,
    explanation: test.visible ? exampleHelp[test.order] ?? test.explanation : test.explanation,
  }));
  // `Exercise.category` se persiste con un valor del catálogo compartido para no
  // romper el editor; la categoría visible de Python se proyecta en el catálogo.
  return { slug, category: existing?.category ?? "Fundamentos", content, baseline };
}));

// Prerrequisitos Python independientes de los de las versiones compartidas. Cada
// módulo declara dependencias relevantes; dentro del módulo se conserva el orden.
for (const entry of pythonCatalog) entry.content.prerequisiteSlugs = pythonPrerequisiteSlugs(entry.slug);

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
