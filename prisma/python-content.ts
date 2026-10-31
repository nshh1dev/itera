import { logicExercises } from "./logic-content";
import { seedVersionContent, type VersionContent } from "./editorial-revision";
import { pythonLessons } from "./python-lessons";
import { pythonCurriculumUnits, pythonStepSlug, pythonStepMetadata, pythonPrerequisiteSlugs } from "../src/lib/python-curriculum";
import { editorialSchema, publicationMetadataSchema } from "../src/lib/editorial";
import { editorialTestsIssue } from "../src/lib/editorial-tests";
import { prerequisiteIssue } from "../src/lib/curriculum";
import type { Json } from "../src/lib/types";
import { pythonMistakes, pythonCaseHelp, pythonSharedCaseHelp } from "./python-help";
import { pythonCosts } from "./python-costs";

function pythonOnly(content: VersionContent): VersionContent {
  return { ...content, variants: content.variants.filter(variant => variant.language === "python") };
}
const reference = (body: string) => `def solve(data):\n${body.split("\n").map(line => `    ${line}`).join("\n")}\n`;
const pythonIntegerConversion = "def convertir(texto):\n    texto = texto.strip()\n    digitos = texto\n    if texto.startswith('+') or texto.startswith('-'):\n        digitos = texto[1:]\n    if digitos == '':\n        raise ValueError('numero invalido')\n    for caracter in digitos:\n        if caracter not in '0123456789':\n            raise ValueError('numero invalido')\n    return int(texto)";
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
  "logica-repetido": {
    statement: "Recibes una lista de hasta 1000 enteros. Devuelve True si algún valor aparece más de una vez y False en otro caso. La lista vacía no tiene repeticiones. True y False son booleanos de Python; en JSON se muestran como true y false, sin comillas.",
  },
  "logica-frecuencias": {
    objective: "Acumular frecuencias usando cada carácter como clave de un diccionario.",
    statement: "Recibes un texto de entre 0 y 1000 letras de a a z. Devuelve un diccionario que asocie cada letra presente con su cantidad de apariciones. El orden de las claves no importa. Para el texto vacío devuelve {}. La plantilla prepara el diccionario: completa el recorrido y la actualización de los contadores.",
  },
  "logica-primer-unico": {
    statement: "Recibes un texto de letras a-z de hasta 1000 caracteres. Devuelve el primer carácter que aparece exactamente una vez, según su posición en el texto, no el orden alfabético. Si no existe, devuelve None, representado como null en JSON.",
    extraTests: [{ input: "cbba", expected: "c", explanation: "c y a aparecen una vez, pero c está antes en el texto aunque a preceda alfabéticamente." }],
  },
  "logica-agrupa-registros": {
    statement: "Recibes una lista de hasta 100 registros. Cada registro es un diccionario con categoria y nombre, textos no vacíos de letras a-z. Devuelve un diccionario cuyas claves sean las categorías y cuyos valores sean listas de nombres en orden de aparición. Conserva los nombres repetidos. Sin registros devuelve {}.",
  },
  "python-crea-grupo": { extraTests: [{
    input: { grupos: { a: ["ana"], b: ["luz", "sol"] }, categoria: "a", nombre: "bea" },
    expected: { a: ["ana", "bea"], b: ["luz", "sol"] },
    explanation: "Añadir bea al grupo a conserva también los dos nombres del grupo b, en su orden original.",
  }] },
  "python-filter": {
    statementNote: "Cada registro es un diccionario con las claves nombre y edad. Un menor se omite, pero no termina el recorrido: puede haber adultos después.",
    extraTests: [{
      input: [{ nombre: "menor", edad: 12 }, { nombre: "ana", edad: 18 }, { nombre: "bea", edad: 17 }, { nombre: "ana", edad: 30 }],
      expected: ["ana", "ana"],
      explanation: "Los registros menores se omiten sin detener el filtro; las dos apariciones adultas de ana se conservan en orden.",
    }],
  },
  "python-consulta-anidada": { extraTests: [{
    input: { registro: { ana: { mate: 75, arte: 0 }, bea: { mate: 90 } }, alumno: "ana", curso: "mate" },
    expected: 75,
    explanation: "La consulta selecciona mate de ana, no arte ni la nota de bea; una nota presente puede ser distinta de cero.",
  }] },
  "logica-signo": { objective: "Seleccionar entre varios bloques usando if, elif y else." },
  "logica-alternativas": {
    objective: "Combinar alternativas con or y excluir un bloqueo con not.",
    statement: "data es un diccionario con invitacion, entrada y bloqueado, valores booleanos True o False en Python (true o false en JSON). Permite acceder si hay invitación o entrada comprada, pero nunca si la persona está bloqueada. Devuelve un booleano. En Python, or combina alternativas y not niega una condición.",
    hints: ["El bloqueo invalida cualquiera de las dos formas de acceso.", "Agrupa las alternativas antes de aplicar la condición adicional.", "Combina las alternativas con or y exige además not bloqueado mediante and."],
  },
  "logica-ausencia": {
    hints: ["Comprueba la ausencia antes de sumar.", "No confundas cero con False: ambos son distintos de None.", "Si data is None, devuelve -1; en otro caso devuelve data + 1. JSON representa None como null."],
  },
  "logica-valida-divisor": {
    statement: "data es un diccionario con total y divisor, enteros entre -1000 y 1000. Devuelve None si divisor es cero; en otro caso devuelve total / divisor. Los cocientes válidos son enteros. Un total cero sí es válido. None se representa como null en JSON; no escribas null en el código Python.",
  },
  "logica-valido-cero-ausente": {
    statement: "data es un diccionario con cantidad, un entero entre -1000 y 1000 o None (null en JSON). Devuelve el texto 'ausente' si es None, 'invalido' si es negativo y 'valido' en los demás casos, incluido cero. La clave siempre existe: distingue su valor ausente de una clave que falta.",
  },
  "logica-sin-estado-global": {
    statement: "Construye una auxiliar que reciba base y tasa como argumentos, sin depender de una tasa exterior fija. data es un diccionario con base y tasas, una lista de hasta 100 enteros. Los enteros están entre -1000 y 1000. Devuelve una lista con base + tasa para cada tasa en orden, usando siempre la misma base. La plantilla no contiene aún la auxiliar. La comprobación evalúa los resultados, no la organización interna.",
  },
  "logica-registro-compartido": {
    statement: "data es un diccionario con ficha (otro diccionario que contiene cantidad) y cambio. Los enteros están entre -1000 y 1000. Crea un alias de ficha y suma cambio a alias['cantidad']. Devuelve [ficha['cantidad'], alias['cantidad']]. Aquí se pide modificar intencionalmente el diccionario compartido: ambos nombres observan la misma cantidad. La salida muestra el efecto; no certifica identidad por sí sola.",
  },
  "logica-conserva-regresion": {
    statement: "Implementa un descuento y conserva pruebas de sus límites. data es un diccionario con total y limite, enteros entre 0 y 1000. Descuenta 2 si total alcanza limite, incluida la igualdad, sin bajar de cero. Devuelve el importe. La plantilla solo prepara solve(data), no contiene una implementación defectuosa. Añade aserciones para total 10, limite 10 → 8 y total 0, limite 0 → 0. La comprobación evalúa el resultado; no certifica que las aserciones de regresión estén presentes.",
  },
  "logica-captura-conversion": {
    statement: "Recibes un texto. Tras quitar espacios exteriores, un entero válido contiene un signo + o - opcional y una o más cifras ASCII del 0 al 9. Se admiten ceros iniciales. Rechaza vacío, palabras, punto decimal, exponentes y guiones bajos. Devuelve el entero o None (null en JSON) si es inválido. Define una auxiliar que lance ValueError y captura solo ese error desde solve. Usa int para la conversión, sin pasar por float. La comprobación evalúa el resultado; no certifica que uses exactamente el mismo try/except.",
    hints: ["Quita los espacios exteriores y comprueba el formato completo antes de convertir.", "Si empieza por + o -, comprueba las cifras del tramo texto[1:]. Debe quedar al menos una cifra.", "Recorre las cifras y rechaza las que no pertenezcan a '0123456789' con ValueError. Convierte con int(texto) y captura solo ValueError en solve."],
    variant: {
      solution: reference(`${pythonIntegerConversion}\ntry:\n    return convertir(data)\nexcept ValueError:\n    return None`),
      explanation: "strip retira espacios exteriores. startswith comprueba si el texto empieza por un signo; texto[1:] permite revisar el resto sin el signo. Debe quedar al menos una cifra y todas deben pertenecer a '0123456789'. int convierte el texto original directamente, conservando su signo y sin redondearlo mediante float. La auxiliar lanza ValueError ante un formato inválido y solve captura solo ese error. Las pruebas observan el valor, no certifican la técnica de excepciones.",
    },
    extraTests: [
      { input: " +007 ", expected: 7, explanation: "Signo, ceros iniciales y espacios exteriores no alteran el entero 7." },
      { input: "3.0", expected: null, explanation: "El punto invalida el formato de entero aunque el valor numérico sea integral." },
      { input: "1.5", expected: null, explanation: "Una fracción no cumple el formato de entero." },
      { input: "1e2", expected: null, explanation: "La notación exponencial no forma parte del formato aceptado." },
      { input: "1_0", expected: null, explanation: "Los separadores con guion bajo no son cifras ASCII." },
    ],
  },
  "logica-recupera-elementos": {
    statement: "Recibes una lista de hasta 100 textos. Aplica a cada uno la regla de captura-conversion: tras strip, signo + o - opcional y una o más cifras ASCII; no se admiten decimales, exponentes ni guiones bajos. Convierte los válidos con int, sin float. Devuelve un diccionario con validos (enteros en orden) y rechazados (número de textos inválidos). Un fallo no impide procesar los siguientes. Captura solo ValueError por elemento. La comprobación evalúa lista y conteo; no certifica el alcance exacto del try.",
    variant: {
      solution: reference(`${pythonIntegerConversion}\nvalidos = []\nrechazados = 0\nfor texto in data:\n    try:\n        validos.append(convertir(texto))\n    except ValueError:\n        rechazados += 1\nreturn {'validos': validos, 'rechazados': rechazados}`),
      explanation: "La auxiliar quita espacios, separa el signo opcional y comprueba que queden solo cifras ASCII, igual que captura-conversion. Convierte con int, sin float. El try de cada vuelta conserva los enteros posteriores a un rechazo. Solo ValueError aumenta rechazados; no se ocultan otros errores. Devolver validos y rechazados muestra la recuperación, pero no demuestra el uso interno de try/except.",
    },
    hints: ["Trata cada texto por separado para no perder valores posteriores.", "Usa la misma validación completa y conversión con int que en captura-conversion.", "Añade solo después de convertir; ante ValueError incrementa rechazados y sigue con el siguiente texto."],
    extraTests: [{ input: ["3.0", " +007 ", "1e2", "-2", "1_0", "+", "１２", "0"], expected: { validos: [7, -2, 0], rechazados: 5 }, explanation: "Solo +007, -2 y 0 cumplen el formato; los cinco rechazos no impiden conservar los válidos posteriores." }],
  },
  "python-empareja": { extraTests: [
    { input: { a: [1, 2], b: [] }, expected: [], explanation: "Sin valores en b no se puede completar ninguna pareja." },
    { input: { a: [1, 2], b: [3, 4] }, expected: [[1, 3], [2, 4]], explanation: "Con igual longitud se emparejan todas las posiciones, sin perder la última." },
  ] },
  "logica-vocales": { extraTests: [{ input: "áéíóú AE", expected: 2, explanation: "Solo A y E cuentan; las vocales acentuadas quedan fuera del contrato." }] },
  "logica-carrito": { extraTests: [{ input: { items: [{ precio: 3, cantidad: 2 }, { precio: 5, cantidad: 1 }], descuento: 50 }, expected: 5.5, explanation: "Los subtotales 6 y 5 suman 11; descontar el 50 % deja 5.5." }] },
  "logica-notas": { extraTests: [{ input: [4, 5], expected: { aprobados: 1, media: 4.5 }, explanation: "Solo 5 aprueba; la media de ambas notas es 9 / 2, sin truncar a 4." }] },
  "logica-gastos-validacion": { extraTests: [{ input: [{ categoria: "otra", importe: 9 }, { categoria: "casa", importe: 2 }], expected: { total: 2, porCategoria: { casa: 2 }, rechazados: 1 }, explanation: "Rechazar otra no debe impedir aceptar los 2 céntimos de casa posteriores." }] },
  "logica-booleano": {
    statement: "Cambia el valor de listo a True, el booleano verdadero de Python, no el texto 'True'. Conserva la impresión preparada: convierte el valor a texto en minúsculas para mostrar true. No necesitas modificar str ni lower.",
  },
  "logica-dos-parametros": {
    statement: "data es un diccionario con dos enteros, en las claves a y b. La plantilla ya los guarda en primero y segundo: no necesitas cambiar esos accesos. Devuelve su suma. Los valores pueden ser positivos, negativos o cero.",
  },
  "logica-predice-valores": {
    statement: "Antes de ejecutar, predice qué ocurre si guardas data en x, sumas 3 a x y después multiplicas el valor actualizado por 2. Implementa esa secuencia y devuelve el resultado con return. Contrasta tu predicción con los ejemplos.\n\nEntrada y resultado: data es un entero entre -1000 y 1000; devuelve un entero. La comprobación evalúa el resultado, no si hiciste primero la predicción.",
  },
  "logica-tabla-valores": {
    statement: "Construye una tabla de seguimiento: empieza en data, suma 2 y después multiplica el valor actualizado por 3. Guarda el estado inicial y cada estado posterior en una variable; no necesitas listas ni bucles. Devuelve los tres valores en un texto separados exactamente por ' -> ', con un espacio a cada lado de la flecha. Por ejemplo, desde 2 se obtiene 2 -> 4 -> 12.\n\nEntrada y resultado: data es un entero entre -1000 y 1000; devuelve un texto con los tres estados. La comprobación observa esa traza, no cómo guardaste los estados.",
  },
  "logica-perimetro": {
    statement: "data es un diccionario con base y altura, enteros entre 1 y 1000 que describen un rectángulo. Consulta las medidas con data['base'] y data['altura']. Devuelve su perímetro: la suma de sus cuatro lados, no el área.",
  },
  "logica-repara-presupuesto": {
    statement: "data es un diccionario con precio por unidad, unidades y envio. Consulta cada dato con su clave, por ejemplo data['envio']. La plantilla cobra el envío por cada unidad: corrígela para cobrarlo una sola vez y devuelve el total. precio y unidades van de 0 a 1000; envio, de 0 a 100. Aunque no haya unidades, se cobra el envío.",
  },
  "logica-merienda": {
    statement: "data es un diccionario con unidades y precio, enteros entre 0 y 100. Consulta los valores con data['unidades'] y data['precio']. Calcula el coste y devuelve un texto con 'Total: ' seguido del importe, sin comillas ni salto de línea. No hay descuentos ni envío.",
  },
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
  "logica-error-dominio": { statementNote: "La comprobación observa el mensaje; no certifica que uses raise." },
  "logica-inventario": {
    description: "Acumula los cambios por producto y conserva saldos cero o negativos.",
    statement: "Recibes una lista de hasta 100 movimientos. Cada movimiento es un diccionario con producto, texto de letras a-z, y cambio, entero entre -100 y 100. Devuelve un diccionario con el saldo acumulado por producto. Incluye productos cuyo saldo final sea cero y permite negativos. Sin movimientos devuelve {}. Este ejercicio no aplica la regla de stock no negativo del ejercicio de saldo.",
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
    if (!(slug in pythonCosts)) throw new Error(`${slug}: falta decidir el coste orientativo o su omisión.`);
    const projection = pythonStepMetadata(slug);
    if (!projection) throw new Error(`${slug}: falta proyección Python.`);
    const metadata = {
      title: step.title, description: addition.objective, objective: addition.objective,
      statement: `${addition.task}\n\nAntes de resolver:\n${addition.theory}${addition.runtimeMode === "FUNCTION" ? "\n\nConserva solve(data); Itera proporciona data. Devuelve el resultado con return, sin usar input()." : "\n\nEscribe un programa completo: se compara lo que muestra en la salida."}`,
      level: unit.level, minutes: projection.minutes,
      prerequisites: ["Las prácticas anteriores de este bloque y los conceptos ya presentados en la ruta de Python."],
      practiceGoals: [addition.objective], prerequisiteSlugs: [], activityType: projection.activityType,
      runtimeMode: addition.runtimeMode, conceptRule: "", complexity: "",
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
    if (override.extraTests && !override.tree) {
      const tests = content.variants[0].tests;
      content.variants[0].tests = [...tests, ...override.extraTests.map((test, index) => ({
        ...test, order: tests.length + index, visible: false, explanation: test.explanation ?? "",
      }))];
    }
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
  if (slug in pythonCosts) content.complexity = pythonCosts[slug];
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
