import { curriculumUnits, curriculumSlug, type CurriculumUnit } from "./curriculum-v2";

// Esta señal se publica junto al lote completo, nunca durante su preparación.
export const pythonCurriculumMarker = "python-constante";
export function hasPythonCurriculum(entries: readonly { slug: string }[]) {
  return entries.some(entry => entry.slug === pythonCurriculumMarker);
}

function unit(slug: string, title: string, level: CurriculumUnit["level"], theory: string, example: string, steps: [string, string][]): CurriculumUnit {
  return { slug: `python-${slug}`, title, level,
    path: level === "INITIATION" ? "desde-cero" : level === "BEGINNER" ? "primeros-pasos" : "pensar-en-soluciones",
    theory, examples: { python: example, javascript: "", typescript: "" },
    readiness: checkpoints[slug],
    steps: steps.map(([key, title]) => ({ key: `python-${key}`, title })),
  };
}

const checkpoints: Record<string, [string, string]> = {
  constantes: ["Puedo dar un nombre a una equivalencia fija.", "Distingo la convención de mayúsculas de una restricción del lenguaje."],
  decimales: ["Puedo convertir texto con punto decimal antes de calcular.", "Distingo un número float de su representación impresa."],
  "expresion-condicional": ["Puedo traducir dos ramas a una expresión condicional.", "Puedo decidir cuándo un bloque if resulta más legible."],
  "control-bucle": ["Puedo distinguir terminar el bucle de saltar una vuelta.", "Puedo conservar los datos posteriores a un elemento omitido."],
  secuencias: ["Puedo ordenar o recortar sin cambiar la lista original.", "Puedo reconstruir palabras respetando las reglas de espacios."],
  tuplas: ["Puedo desempaquetar una pareja y devolver varios resultados.", "Puedo explicar cómo enumerate y zip producen sus parejas."],
  identidad: ["Puedo distinguir igualdad de contenido e identidad.", "Puedo evitar que dos llamadas compartan una lista predeterminada."],
  diccionarios: ["Puedo consultar, actualizar y borrar sin perder el cero válido.", "Puedo recorrer parejas y extraer campos de una lista de fichas."],
  conjuntos: ["Puedo elegir la operación de conjuntos que representa el problema.", "Puedo producir una salida ordenada sin repeticiones."],
  agrupacion: ["Puedo crear la lista de una categoría antes de añadir.", "Puedo conservar el orden y las repeticiones dentro de cada grupo."],
  comprensiones: ["Puedo traducir un bucle con append a una comprensión.", "Distingo filtrar posiciones de transformar todos los elementos."],
  agregacion: ["Puedo definir extremos ausentes sin inventar cero.", "Puedo ordenar con una función clave y un desempate explícito."],
  formato: ["Puedo producir exactamente los decimales pedidos como texto.", "Distingo redondear un número de formatear su representación."],
  "registros-anidados": ["Puedo consultar dos niveles sin acceder a una clave ausente.", "Puedo conservar el cero y distinguirlo de una nota pendiente."],
  academia: ["Puedo inscribir y calificar sin borrar los datos anteriores.", "Puedo resumir notas pendientes, ceros y empates correctamente."],
  iteradores: ["Puedo explicar por qué un iterador consumido no se reinicia.", "Puedo distinguir transformación con map y selección con filter."],
  contactos: ["Puedo mantener la misma política de nombres al crear y editar.", "Puedo aplicar todos los criterios de una búsqueda sin cambiar los datos."],
  "reporte-inventario": ["Puedo calcular valor usando cantidades y céntimos enteros.", "Puedo ordenar un reporte sin cambiar las reglas del inventario anterior."],
  transformacion: ["Puedo transformar copias sin tocar los registros originales.", "Puedo recuperar un campo inválido sin perder los restantes."],
};

const additions = {
  constantes: unit("constantes", "Nombres que expresan una constante", "INITIATION", "En Python una constante es una convención: su nombre se escribe en MAYÚSCULAS para comunicar que no debe cambiar. El lenguaje no impide reasignarla. Dale un nombre a una equivalencia y utiliza ese nombre en el cálculo; no necesitas decisiones ni bucles.", "SEGUNDOS_POR_MINUTO = 60\nminutos = 3\nprint(minutos * SEGUNDOS_POR_MINUTO)", [["constante", "Calcula con una equivalencia constante"]]),
  decimales: unit("decimales", "Entrada decimal", "INITIATION", "input devuelve texto. int convierte enteros; float permite un punto decimal, como float('1.5'). En Python el separador decimal es el punto, no la coma. Un resultado float puede mostrarse como 3.0; no es lo mismo comparar un número devuelto que exigir un formato de texto.", "texto = '2.5'\nnumero = float(texto)\nprint(numero + 1)", [["decimal", "Convierte un texto decimal"]]),
  decisiones: unit("expresion-condicional", "De ramas a una expresión", "BEGINNER", "Después de dominar if y else puedes elegir un valor en una expresión: valor_si_cierto if condicion else valor_si_falso. La condición va en medio. No anides expresiones si un bloque normal se entiende mejor. La sangría agrupa instrucciones; cuatro espacios por nivel mantienen los bloques claros.", "edad = 20\netiqueta = 'adulto' if edad >= 18 else 'menor'", [["condicional", "Elige una etiqueta con una condición"]]),
  bucles: unit("control-bucle", "Salir y continuar un recorrido", "BEGINNER", "break termina el bucle más cercano; continue omite el resto de la vuelta actual y sigue con la siguiente. Primero practica cada uno por separado. En un while, continue no debe saltarse el avance necesario para terminar. [] crea una lista y append agrega un elemento al final.", "salida = []\nfor n in [2, -1, 4]:\n    if n < 0:\n        continue\n    salida.append(n)", [["centinela", "Detén la lectura ante un centinela"], ["omite-negativos", "Omite valores negativos"]]),
  secuencias: unit("secuencias", "Operaciones sobre secuencias", "BEGINNER", "sorted(valores) crea una lista nueva ordenada sin cambiar la original. lista[-1] consulta el último valor si existe. lista[inicio:fin] copia el tramo sin incluir fin y permite un tramo vacío. split() separa palabras por espacios y join une textos con un separador. Cada práctica introduce solo una de estas operaciones.", "valores = [8, 3, 5]\nordenados = sorted(valores)\ntramo = valores[0:2]", [["ordena-numeros", "Ordena números sin cambiar la entrada"], ["recorta", "Extrae un tramo de una lista"], ["une-palabras", "Normaliza los espacios de una frase"]]),
  tuplas: unit("tuplas", "Tuplas y desempaquetado", "BEGINNER", "Una tupla agrupa posiciones: (x, y). a, b = pareja desempaqueta exactamente dos valores. Python calcula primero la derecha: a, b = b, a intercambia valores sin auxiliar. return a, b devuelve una tupla; Itera la representa como una lista JSON. enumerate aporta índice y valor; zip empareja hasta agotar la secuencia más corta.", "pareja = (7, 4)\na, b = pareja\na, b = b, a\nprint(a, b)", [["desempaqueta", "Intercambia una pareja por desempaquetado"], ["enumera", "Numera los elementos de una lista"], ["empareja", "Empareja dos listas hasta la más corta"], ["retorno-multiple", "Devuelve suma y producto juntos"]]),
  identidad: unit("identidad", "Identidad y parámetros opcionales", "BEGINNER", "== compara valores; is compara si dos nombres designan el mismo objeto. Para ausencia utiliza is None, no una comprobación de falsedad que descarte cero. Un parámetro con valor predeterminado puede omitirse. No uses una lista mutable como predeterminado: se crea una sola vez; usa None y crea una lista dentro de cada llamada.", "def nueva_lista(valor, base=None):\n    if base is None:\n        base = []\n    base.append(valor)\n    return base", [["identidad", "Distingue una copia de un alias"], ["opcional-seguro", "Evita compartir un parámetro mutable"]]),
  diccionarios: unit("diccionarios", "Consultar, actualizar y recorrer diccionarios", "BEGINNER", "Un diccionario guarda pares clave-valor. d[clave] falla con KeyError si falta; d.get(clave, respaldo) permite un valor alternativo. clave in d consulta claves, no valores. d[clave] = valor añade o reemplaza; pop(clave, respaldo) elimina sin fallar si falta. items devuelve parejas; keys y values permiten recorrer claves y valores. El orden de inserción no determina la igualdad entre diccionarios.", "precios = {'pan': 2}\nprecios['agua'] = 1\nfor nombre, precio in precios.items():\n    print(nombre, precio)", [["actualiza-diccionario", "Añade y reemplaza un valor"], ["borra-clave", "Borra una clave sin error"], ["recorre-pares", "Construye líneas a partir de parejas"], ["lista-registros", "Suma cantidades de una lista de registros"]]),
  conjuntos: unit("conjuntos", "Operaciones entre conjuntos", "INTERMEDIATE", "set() crea un conjunto vacío; {} crea un diccionario. Los conjuntos no guardan duplicados ni tienen un orden de recorrido garantizado. Enteros y textos pueden ser elementos; listas y diccionarios no son hashables. add añade uno; discard elimina si existe. | une, & intersecta, - resta, ^ conserva los elementos de exactamente un conjunto. <= comprueba subconjunto. Devuelve sorted(conjunto) para una salida JSON determinista.", "a = set([1, 3])\nb = set([3, 5])\nprint(sorted(a & b))", [["conjunto-seguro", "Añade y descarta elementos"], ["union", "Reúne elementos sin repetir"], ["interseccion", "Encuentra elementos en común"], ["diferencia", "Encuentra los elementos que faltan"], ["simetrica", "Conserva los elementos no compartidos"], ["subconjunto", "Comprueba si están todos los requisitos"]]),
  agrupacion: unit("agrupacion", "Un diccionario con listas como valores", "INTERMEDIATE", "Un valor de diccionario también puede ser una lista. Antes de añadir debes crear la lista de una clave nueva. setdefault(clave, []) devuelve el valor existente o inserta una lista vacía si falta. Recorrer los registros en su orden y usar append conserva el orden de cada grupo. No ordenes ni elimines nombres repetidos si el contrato no lo pide.", "grupos = {}\nfor color, nombre in [('azul', 'Ana')]:\n    grupos.setdefault(color, []).append(nombre)", [["crea-grupo", "Crea la lista de una categoría nueva"]]),
  comprensiones: unit("comprensiones", "Del bucle a una comprensión", "INTERMEDIATE", "[expresion for x in valores] construye una lista nueva: equivale a crear una lista y añadir la expresión en un bucle. El if final filtra; el if/else antes de for transforma todos los elementos. {clave: valor for ...} construye un diccionario. Conserva un bucle normal cuando necesites varias instrucciones o tratar errores por elemento.", "dobles = [n * 2 for n in [1, 4]]\npositivos = [n for n in [-2, 3] if n > 0]", [["comprension", "Transforma una lista con una comprensión"], ["comprension-filtro", "Filtra vocales y normaliza mayúsculas"], ["comprension-condicional", "Sustituye negativos sin eliminar posiciones"], ["comprension-dict", "Asocia cada palabra con su longitud"]]),
  agregacion: unit("agregacion", "Agregación y claves de ordenación", "INTERMEDIATE", "sum suma un iterable y devuelve cero si está vacío. min y max necesitan elementos o default. sorted devuelve una lista; list.sort modifica la lista y devuelve None. key recibe una función, sin llamarla: key=len ordena por longitud. lambda x: expresion es una función breve equivalente a una auxiliar con return. Una tupla como clave permite desempatar; la ordenación es estable si las claves coinciden.", "palabras = ['sol', 'a', 'luz']\nordenadas = sorted(palabras, key=lambda p: (len(p), p))", [["agrega", "Suma y encuentra extremos con lista vacía"], ["clave-longitud", "Ordena palabras con una función clave"], ["lambda-desempate", "Ordena con longitud y desempate alfabético"]]),
  formato: unit("formato", "Redondear no es formatear", "INTERMEDIATE", "round(numero, d) redondea un número; en empates exactos usa el par. Los float representan fracciones binarias, por lo que algunos decimales no son exactos. f'{numero:.2f}' produce texto con dos decimales, incluidos ceros. floor baja al entero inferior; int trunca hacia cero. Para importes iniciales usa céntimos enteros, no supongas que float representa dinero exactamente.", "valor = 3.5\ntexto = f'{valor:.2f}'\nprint(texto)  # 3.50", [["formato-decimal", "Presenta exactamente los decimales pedidos"]]),
  anidados: unit("registros-anidados", "Registros dentro de registros", "INTERMEDIATE", "Un diccionario puede contener otro. Primero consulta la clave exterior y después la interior. None representa un dato aún no registrado, distinto de cero. Copiar solo el diccionario exterior comparte los interiores: para cambiar un campo sin alterar el original debes copiar también ese nivel. No necesitas recursión si la profundidad del modelo es fija.", "registro = {'ana': {'algebra': None}}\nregistro['ana']['algebra'] = 0\nprint(registro['ana']['algebra'])", [["consulta-anidada", "Consulta una nota sin confundir ausencia y cero"]]),
  academia: unit("academia", "Proyecto: registros académicos", "INTERMEDIATE", "Construye el modelo alumno → curso → nota. Inscribir crea un curso con None; calificar guarda un entero de 0 a 100. No borres datos anteriores. Una nota cero participa en el promedio; None no. Practica las operaciones por separado antes de resumir y ordenar. Cada hito recibe un estado inicial, de modo que puedes empezar sin copiar una solución anterior.", "registro = {'ana': {'algebra': None}}\nnotas = [n for n in registro['ana'].values() if n is not None]", [["academia-inscribe", "Academia: inscribe sin perder cursos"], ["academia-califica", "Academia: registra solo notas válidas"], ["academia-resume", "Academia: calcula medias y clasificación"]]),
  funcional: unit("iteradores", "Iteradores, map y filter", "INTERMEDIATE", "Una lista conserva sus elementos. Un iterador entrega valores conforme se consume y no se reinicia automáticamente. iter crea un iterador; next obtiene el siguiente. map(funcion, iterable) transforma; filter(predicado, iterable) selecciona. Ambos devuelven iteradores: list los materializa. Un generador (expresion for ...) también entrega valores bajo demanda y puede pasarse a sum. No es necesario usar lambda cuando ya tienes una función con nombre.", "dobles = map(lambda n: n * 2, [2, 3])\nprint(list(dobles))\nprint(list(dobles))  # agotado: []", [["iterador", "Observa cómo se consume un iterador"], ["generador", "Suma cuadrados sin una lista intermedia"], ["map", "Transforma textos numéricos con map"], ["filter", "Selecciona mayores de edad con filter"]]),
  contactos: unit("contactos", "Proyecto: contactos y criterios", "INTERMEDIATE", "Una agenda de contactos no es la agenda de tareas anterior: sus datos son nombre, teléfono y correo. Usa nombres normalizados con strip y lower como claves, rechaza duplicados y limita las actualizaciones a los campos permitidos. El retorno debe mostrar el estado actualizado, no solo anunciar éxito. La búsqueda por criterios combina operaciones de texto y recorridos ya practicados.", "agenda = {'ana': {'telefono': '123', 'correo': 'a@ejemplo.es'}}\nconsulta = ' ANa '.strip().lower()\nprint(agenda.get(consulta))", [["contactos-crea", "Contactos: crea sin reemplazar duplicados"], ["contactos-edita", "Contactos: modifica solo campos permitidos"], ["contactos-busca", "Contactos: combina criterios de búsqueda"]]),
  reporte: unit("reporte-inventario", "Ampliación: valor del inventario", "INTERMEDIATE", "Las cantidades y los precios en céntimos son enteros. El valor de una ficha es cantidad * precio_centimos. Un reporte se calcula sin modificar las existencias: copia o construye las filas de salida y ordena por el criterio indicado. No uses float ni reinterpretas los ejercicios anteriores de stock: esta práctica tiene una identidad propia.", "ficha = {'cantidad': 3, 'precio_centimos': 125}\nvalor = ficha['cantidad'] * ficha['precio_centimos']", [["inventario-valora", "Inventario: calcula valor y reporte por producto"]]),
  transformacion: unit("transformacion", "Proyecto: transformar registros", "INTERMEDIATE", "Construye una salida nueva: no modifiques los registros originales. Las operaciones llegan como nombres de texto, no como funciones JSON. Primero transforma un campo; luego combina reglas. Conserva campos que no tengan regla. Para convertir un dato inválido, aplica la política del contrato y captura solo la excepción esperada. Este proyecto reutiliza copias, textos, diccionarios y validación.", "original = {'nombre': ' ANA '}\ncopia = dict(original)\ncopia['nombre'] = copia['nombre'].strip().lower()", [["transforma-campo", "Transforma un campo sin cambiar el original"], ["transforma-registros", "Aplica reglas y recupera conversiones inválidas"]]),
};

const common = (slug: string) => {
  const entry = curriculumUnits.find(unit => unit.slug === slug);
  if (!entry) throw new Error(`Falta el bloque ${slug}`);
  return { ...entry, steps: [...entry.steps] };
};

// Pasos compartidos que el recorrido Python separa de su bloque original para
// acercarlos a las herramientas que necesitan. Conservan su identidad.
const busquedaBase = common("busqueda");
const busquedaLineal: CurriculumUnit = {
  slug: "python-busqueda-lineal", title: "Búsqueda lineal en una lista", path: "primeros-pasos", level: "BEGINNER",
  theory: "Para buscar en una lista sin orden, revisa las posiciones de izquierda a derecha. Devuelve el índice de la primera coincidencia, no el valor. Si terminas sin encontrarla, devuelve -1. enumerate permite obtener índice y valor en la misma vuelta; range(len(...)) también sirve si prefieres recorrer posiciones.",
  readiness: ["Puedo recorrer una lista comparando cada valor con un objetivo.", "Puedo devolver la primera posición o -1 sin confundir índice y valor."],
  examples: { python: "for indice, valor in enumerate([4, 9, 2]):\n    if valor == 2:\n        print(indice)", javascript: "", typescript: "" },
  steps: [busquedaBase.steps.find(step => step.key === "busqueda-lineal")!],
};
const busquedaBinaria: CurriculumUnit = {
  ...busquedaBase,
  theory: "La búsqueda binaria necesita datos ordenados y descarta mitades: O(log n). Ordenar puede facilitar consultas posteriores, pero también cuesta trabajo. Inserción desplaza valores hasta colocar cada elemento. Define límites que se acerquen sin salir del intervalo y criterios de desempate deterministas. La búsqueda lineal ya practicada revisa posiciones una a una; esta solo puede descartar cuando el orden está garantizado.",
  steps: busquedaBase.steps.filter(step => step.key !== "busqueda-lineal"),
};
const integracionIntermediaBase = common("integracion-intermedia");
const acumulacionInventario: CurriculumUnit = {
  slug: "python-acumulacion-inventario", title: "Acumulación por producto", path: "pensar-en-soluciones", level: "INTERMEDIATE",
  theory: "Un diccionario puede acumular un saldo por producto. Cada movimiento suma su cambio al valor anterior; un producto nuevo empieza en cero. Este modelo conserva también los saldos negativos y los ceros: es una acumulación, no una política de stock. El ejercicio de saldo, anterior, sí rechaza los movimientos que dejarían el saldo negativo. No mezcles ambos contratos.",
  readiness: ["Puedo acumular cambios por clave sin perder productos.", "Puedo distinguir una acumulación de una regla de stock no negativo."],
  examples: { python: "saldos = {}\nfor producto, cambio in [('pan', 3), ('pan', -1)]:\n    saldos[producto] = saldos.get(producto, 0) + cambio", javascript: "", typescript: "" },
  steps: [integracionIntermediaBase.steps.find(step => step.key === "inventario")!],
};
const integracionIntermedia: CurriculumUnit = {
  ...integracionIntermediaBase,
  steps: integracionIntermediaBase.steps.filter(step => step.key !== "inventario"),
};
// La explicación de copia exterior/interior llega antes de agrupar y de academia.
// La actividad que la aplica sobre matrices sigue después de ese bloque.
const referenciasConCopias: CurriculumUnit = (() => {
  const base = common("referencias");
  return {
    ...base,
    theory: "En Python, asignar una lista o un diccionario a otro nombre no copia su contenido: ambos nombres designan el mismo objeto. Mutar cambia ese objeto; reasignar cambia el nombre. list(...) y dict(...) crean una copia superficial: basta para una lista plana o un registro de campos simples, pero no para estructuras anidadas. Si una lista contiene listas, o un diccionario contiene diccionarios, la copia exterior comparte los interiores; copia también cada nivel que vayas a modificar. Los textos y las tuplas son inmutables. Aplicarás esta copia por niveles al trabajar con matrices, después de practicar agrupaciones y registros.",
    examples: { ...base.examples, python: "original = {'ana': {'nota': None}}\ncopia = dict(original)\ncopia['ana'] = dict(original['ana'])\ncopia['ana']['nota'] = 0" },
  };
})();

const sequence = [
  common("instrucciones"), common("variables"), common("operaciones"), additions.constantes,
  common("entrada"), additions.decimales, common("tipos-comparaciones"), common("funciones"), common("seguimiento"), common("integracion-inicial"),
  common("decisiones"), additions.decisiones, common("repeticion"), additions.bucles,
  common("listas"), busquedaLineal, common("textos"), additions.secuencias, additions.tuplas,
  common("funciones-datos"), common("alcance"), referenciasConCopias, additions.identidad, additions.diccionarios,
  common("errores"), common("pruebas"), common("integracion-bases"), common("integracion-gastos"),
  additions.conjuntos, { ...common("mapas"), steps: common("mapas").steps.filter(step => step.key !== "agrupa-registros") },
  { ...additions.agrupacion, steps: [...additions.agrupacion.steps, common("mapas").steps.find(step => step.key === "agrupa-registros")!] },
  additions.comprensiones, additions.funcional, additions.agregacion, additions.formato, additions.anidados, acumulacionInventario,
  common("modulos"), common("archivos"), common("integracion-inventario"), additions.reporte,
  additions.academia,
  { ...additions.contactos, steps: [...additions.contactos.steps.slice(0, 2), { key: "python-contactos-borra", title: "Contactos: borra sin afectar otras fichas" }, ...additions.contactos.steps.slice(2)] },
  common("integracion-agenda"), additions.transformacion,
  busquedaBinaria, common("recorridos"), common("matrices"), common("copias-anidadas"),
  common("estado-recursion"), integracionIntermedia,
  ...curriculumUnits.filter(unit => unit.level === "ADVANCED"),
];
const positions = new Map<string, number>();
export const pythonCurriculumUnits = sequence.map(unit => {
  const position = (positions.get(unit.path) ?? 0) + 1;
  positions.set(unit.path, position);
  return { ...unit, title: `${position}. ${unit.title.replace(/^\d+\.\s*/, "")}` };
});
export function pythonStepSlug(key: string) { return key.startsWith("python-") ? key : curriculumSlug(key); }
export const pythonCurriculumSlugs = pythonCurriculumUnits.flatMap(unit => unit.steps.map(step => pythonStepSlug(step.key)));

export type PythonActivityType = "GUIDED" | "PRACTICE" | "INTEGRATION";
type PythonUnitMetadata = { category: string; group?: string; minutes: number; activityType: PythonActivityType };

// Metadatos explícitos por módulo. Los ejercicios compartidos conservan los suyos
// salvo las excepciones puntuales de prisma/python-content.ts.
const unitMetadata: Record<string, Pick<PythonUnitMetadata, "minutes" | "activityType">> = {
  "python-constantes": { minutes: 5, activityType: "GUIDED" },
  "python-decimales": { minutes: 5, activityType: "PRACTICE" },
  "python-expresion-condicional": { minutes: 10, activityType: "PRACTICE" },
  "python-control-bucle": { minutes: 10, activityType: "PRACTICE" },
  "python-secuencias": { minutes: 10, activityType: "PRACTICE" },
  "python-tuplas": { minutes: 10, activityType: "PRACTICE" },
  "python-identidad": { minutes: 10, activityType: "PRACTICE" },
  "python-diccionarios": { minutes: 10, activityType: "PRACTICE" },
  "python-conjuntos": { minutes: 10, activityType: "PRACTICE" },
  "python-agrupacion": { minutes: 10, activityType: "PRACTICE" },
  "python-comprensiones": { minutes: 10, activityType: "PRACTICE" },
  "python-iteradores": { minutes: 10, activityType: "PRACTICE" },
  "python-agregacion": { minutes: 10, activityType: "PRACTICE" },
  "python-formato": { minutes: 10, activityType: "PRACTICE" },
  "python-registros-anidados": { minutes: 10, activityType: "PRACTICE" },
  "python-academia": { minutes: 20, activityType: "INTEGRATION" },
  "python-contactos": { minutes: 20, activityType: "INTEGRATION" },
  "python-reporte-inventario": { minutes: 15, activityType: "PRACTICE" },
  "python-transformacion": { minutes: 20, activityType: "INTEGRATION" },
};
const categoriesByUnit: Record<string, string> = {
  "python-conjuntos": "Colecciones", mapas: "Colecciones", "python-agrupacion": "Colecciones",
  "python-comprensiones": "Colecciones", "python-iteradores": "Colecciones", "python-agregacion": "Colecciones",
  "python-formato": "Colecciones", "python-registros-anidados": "Colecciones", "python-acumulacion-inventario": "Colecciones",
  modulos: "Proyectos", archivos: "Proyectos", "integracion-inventario": "Proyectos", "python-reporte-inventario": "Proyectos",
  "python-academia": "Proyectos", "python-contactos": "Proyectos", "integracion-agenda": "Proyectos", "python-transformacion": "Proyectos",
  busqueda: "Algoritmos", recorridos: "Algoritmos", matrices: "Algoritmos", "copias-anidadas": "Algoritmos",
  "integracion-intermedia": "Algoritmos", exploracion: "Algoritmos", dinamica: "Algoritmos", "integracion-avanzada": "Algoritmos",
  "estado-recursion": "Estructuras", arboles: "Estructuras", prioridades: "Estructuras",
  grafos: "Grafos",
};
const groupByUnit: Record<string, string> = {
  "python-conjuntos": "Colecciones y transformación", mapas: "Colecciones y transformación", "python-agrupacion": "Colecciones y transformación",
  "python-comprensiones": "Colecciones y transformación", "python-iteradores": "Colecciones y transformación",
  "python-agregacion": "Colecciones y transformación", "python-formato": "Colecciones y transformación",
  "python-registros-anidados": "Colecciones y transformación", "python-acumulacion-inventario": "Colecciones y transformación",
  modulos: "Proyectos y persistencia", archivos: "Proyectos y persistencia", "integracion-inventario": "Proyectos y persistencia",
  "python-reporte-inventario": "Proyectos y persistencia", "python-academia": "Proyectos y persistencia",
  "python-contactos": "Proyectos y persistencia", "integracion-agenda": "Proyectos y persistencia",
  "python-transformacion": "Proyectos y persistencia",
  busqueda: "Algoritmos y estructuras", recorridos: "Algoritmos y estructuras", matrices: "Algoritmos y estructuras",
  "copias-anidadas": "Algoritmos y estructuras", "estado-recursion": "Algoritmos y estructuras",
  "integracion-intermedia": "Algoritmos y estructuras",
};
const unitPrerequisites: Record<string, readonly string[]> = {
  instrucciones: [], variables: ["instrucciones"], operaciones: ["variables"], "python-constantes": ["operaciones"],
  entrada: ["python-constantes"], "python-decimales": ["entrada"], "tipos-comparaciones": ["python-decimales"],
  funciones: ["tipos-comparaciones"], seguimiento: ["funciones"], "integracion-inicial": ["seguimiento"],
  decisiones: ["integracion-inicial"], "python-expresion-condicional": ["decisiones"], repeticion: ["python-expresion-condicional"],
  "python-control-bucle": ["repeticion"], listas: ["python-control-bucle"], "python-busqueda-lineal": ["listas"],
  textos: ["listas"], "python-secuencias": ["textos"], "python-tuplas": ["python-secuencias"], "funciones-datos": ["python-tuplas"],
  alcance: ["funciones-datos"], referencias: ["alcance"], "python-identidad": ["referencias"], "python-diccionarios": ["python-identidad"],
  errores: ["python-diccionarios"], pruebas: ["errores"], "integracion-bases": ["pruebas"], "integracion-gastos": ["integracion-bases"],
  "python-conjuntos": ["integracion-gastos"], mapas: ["python-conjuntos"], "python-agrupacion": ["mapas"],
  "python-comprensiones": ["python-agrupacion", "listas"], "python-iteradores": ["python-comprensiones", "funciones"],
  "python-agregacion": ["python-agrupacion", "python-comprensiones"], "python-formato": ["python-decimales", "python-agregacion"],
  "python-registros-anidados": ["python-diccionarios", "python-agrupacion"], "python-acumulacion-inventario": ["mapas"],
  modulos: ["pruebas"], archivos: ["modulos"], "integracion-inventario": ["archivos", "python-acumulacion-inventario"],
  "python-reporte-inventario": ["integracion-inventario", "python-agregacion"],
  "python-academia": ["python-registros-anidados", "python-agregacion", "python-formato"],
  "python-contactos": ["python-diccionarios", "errores"], "integracion-agenda": ["archivos", "integracion-bases"],
  "python-transformacion": ["python-contactos", "referencias"],
  busqueda: ["listas", "python-busqueda-lineal"], recorridos: ["busqueda"], matrices: ["listas", "repeticion"],
  "copias-anidadas": ["matrices", "referencias"], "estado-recursion": ["pruebas", "listas"],
  "integracion-intermedia": ["recorridos", "estado-recursion"],
  arboles: ["estado-recursion"], prioridades: ["estado-recursion", "python-agregacion"],
  exploracion: ["estado-recursion"], dinamica: ["python-agregacion"], grafos: ["estado-recursion", "recorridos"],
  "integracion-avanzada": ["dinamica", "grafos"],
};
const unitBySlug = new Map(pythonCurriculumUnits.map(unit => [unit.slug, unit]));
const metadataBySlug = new Map<string, PythonUnitMetadata & { unitSlug: string }>();
const prerequisitesBySlug = new Map<string, string[]>();
for (const unit of pythonCurriculumUnits) {
  const metadata = unitMetadata[unit.slug];
  const category = categoriesByUnit[unit.slug] ?? (unit.level === "ADVANCED" ? "Algoritmos" : "Fundamentos");
  const activityType = metadata?.activityType ?? (unit.level === "INITIATION" ? "GUIDED" : "PRACTICE");
  const minutes = metadata?.minutes ?? (unit.level === "INITIATION" ? 5 : unit.level === "BEGINNER" ? 10 : 15);
  for (const step of unit.steps) {
    const slug = pythonStepSlug(step.key);
    metadataBySlug.set(slug, { unitSlug: unit.slug, category, group: groupByUnit[unit.slug], minutes, activityType });
  }
  unit.steps.forEach((step, index) => {
    const slug = pythonStepSlug(step.key);
    if (index > 0) { prerequisitesBySlug.set(slug, [pythonStepSlug(unit.steps[index - 1].key)]); return; }
    const prior = (unitPrerequisites[unit.slug] ?? []).flatMap(prerequisite => {
      const target = unitBySlug.get(prerequisite);
      return target ? [pythonStepSlug(target.steps.at(-1)!.key)] : [];
    });
    prerequisitesBySlug.set(slug, [...new Set(prior)]);
  });
}
export function pythonStepMetadata(slug: string) { return metadataBySlug.get(slug); }
export function pythonPrerequisiteSlugs(slug: string) { return prerequisitesBySlug.get(slug) ?? []; }
export function pythonGroupForUnit(unitSlug: string) { return groupByUnit[unitSlug]; }
