import type { Level } from "./types";

// Identidades nuevas: el prefijo separa el progreso del catálogo histórico.
export type CurriculumStep = { key: string; title: string; source?: string };
export type CurriculumUnit = {
  path: string; level: Level; slug: string; title: string; theory: string;
  readiness: [string, string]; examples: { python: string; javascript: string; typescript: string };
  steps: CurriculumStep[];
};
const step = (key: string, title: string, source?: string): CurriculumStep => ({ key, title, source });
export const curriculumSlug = (key: string) => `logica-${key}`;

export const curriculumUnits: CurriculumUnit[] = [
  {
    path: "desde-cero", level: "INITIATION", slug: "instrucciones", title: "1. Instrucciones y salida",
    theory: "Un programa ejecuta instrucciones de arriba abajo. El texto se escribe entre comillas; una expresión numérica se calcula antes de mostrarla. Cada impresión termina una línea. Predice la salida antes de ejecutar. En estos primeros pasos se comprueba la salida, no cómo has escrito cada instrucción.",
    readiness: ["Puedo predecir el orden de la salida.", "Distingo texto y cálculo."],
    examples: { python: 'print("Inicio")\nprint(3 + 6)', javascript: 'console.log("Inicio");\nconsole.log(3 + 6);', typescript: 'console.log("Inicio");\nconsole.log(3 + 6);' },
    steps: [step("saludo", "Muestra un saludo", "imprime-un-saludo"), step("dos-lineas", "Escribe dos líneas", "imprime-dos-lineas"), step("orden-mensaje", "Corrige el orden de un mensaje", "ordena-las-instrucciones"), step("texto-calculo", "Distingue texto y cálculo", "numero-y-texto")],
  },
  {
    path: "desde-cero", level: "INITIATION", slug: "variables", title: "2. Valores y variables",
    theory: "Una variable da nombre a un valor para usarlo después. Una asignación calcula primero la derecha y luego guarda el resultado. Puedes guardar el valor anterior en una variable auxiliar antes de reemplazarlo. En JavaScript y TypeScript usa let si el valor cambia y const si no cambia. TypeScript deduce el tipo del valor: : number lo hace explícito para números y : string para textos. No necesitas conocer JavaScript antes.",
    readiness: ["Puedo guardar y actualizar valores.", "Puedo seguir el valor de cada variable paso a paso."],
    examples: { python: 'puntos = 4\npuntos = puntos + 2\nprint(puntos)', javascript: 'let puntos = 4;\npuntos = puntos + 2;\nconsole.log(puntos);', typescript: 'let puntos: number = 4;\npuntos = puntos + 2;\nconsole.log(puntos);' },
    steps: [step("guarda-nombre", "Guarda un nombre"), step("guarda-cantidad", "Guarda una cantidad", "guarda-y-muestra"), step("actualiza-puntos", "Actualiza una puntuación", "actualiza-un-contador"), step("intercambia", "Intercambia dos valores")],
  },
  {
    path: "desde-cero", level: "INITIATION", slug: "operaciones", title: "3. Operaciones",
    theory: "La suma, resta y multiplicación transforman números. Los paréntesis indican qué calcular primero: no es lo mismo sumar un recargo a cada unidad que al total. Para practicar operaciones sin introducir todavía funciones, estos programas usan datos preparados. La comprobación ve el resultado; no puede demostrar que hayas utilizado la operación pedida.",
    readiness: ["Puedo traducir un cálculo a operaciones.", "Puedo justificar el uso de paréntesis."],
    examples: { python: 'precio = 3\nunidades = 4\nprint(precio * unidades)', javascript: 'const precio = 3;\nconst unidades = 4;\nconsole.log(precio * unidades);', typescript: 'const precio: number = 3;\nconst unidades: number = 4;\nconsole.log(precio * unidades);' },
    steps: [step("suma-cantidades", "Suma dos cantidades"), step("cambio", "Calcula el cambio"), step("precio-unidades", "Calcula un precio por unidades"), step("parentesis", "Corrige una fórmula con paréntesis", "respeta-los-parentesis")],
  },
  {
    path: "desde-cero", level: "INITIATION", slug: "entrada", title: "4. Entrada y conversión",
    theory: "La entrada cambia entre pruebas. Al leerla obtienes texto: conviértelo antes de sumar números. La plantilla de lectura está preparada y no exige conocer archivos ni Node. Una entrada con varias líneas puede separarse por saltos de línea. Construye la salida con los datos recibidos, no con una respuesta fija.",
    readiness: ["Puedo utilizar una entrada variable.", "Puedo convertir texto numérico antes de calcular."],
    examples: { python: 'texto = input()\nnumero = int(texto)\nprint(numero * 3)', javascript: "const texto = require('fs').readFileSync(0, 'utf8').trim();\nconsole.log(Number(texto) * 3);", typescript: "const texto: string = require('fs').readFileSync(0, 'utf8').trim();\nconsole.log(Number(texto) * 3);" },
    steps: [step("lee-nombre", "Lee un nombre y saluda", "lee-y-saluda"), step("lee-doble", "Lee un número y duplícalo"), step("lee-suma", "Suma dos números recibidos como texto", "lee-y-suma"), step("mensaje-resultado", "Construye un mensaje con el resultado", "construye-un-mensaje")],
  },
  {
    path: "desde-cero", level: "INITIATION", slug: "tipos-comparaciones", title: "5. Tipos y comparaciones",
    theory: "Un booleano expresa verdadero o falso. Comparar produce un booleano y no modifica las variables. La igualdad se escribe == en Python y === en JavaScript y TypeScript. >= incluye el límite. En TypeScript una anotación describe un contrato; no convierte el texto en número. Estos programas convierten el booleano a texto en minúsculas para comparar la misma salida en los tres lenguajes.",
    readiness: ["Distingo asignar y comparar.", "Puedo comprobar igualdad y límites."],
    examples: { python: 'cantidad = 6\nlisto = cantidad >= 4\nprint(str(listo).lower())', javascript: 'const cantidad = 6;\nconst listo = cantidad >= 4;\nconsole.log(listo);', typescript: 'const cantidad: number = 6;\nconst listo: boolean = cantidad >= 4;\nconsole.log(listo);' },
    steps: [step("numero-texto", "Diferencia número y texto"), step("booleano", "Guarda un verdadero o falso", "muestra-un-booleano"), step("igualdad", "Comprueba si dos valores son iguales"), step("alcanza", "Comprueba si se alcanza una cantidad")],
  },
  {
    path: "desde-cero", level: "INITIATION", slug: "funciones", title: "6. Primeras funciones",
    theory: "Una función recibe parámetros y entrega un valor con return. Imprimir sirve para observar, pero no sustituye el retorno. Desde aquí la aplicación llama a solve(data): no leas la entrada manualmente. Cuando data agrupa valores con nombre se accede con data['a'] en Python y data.a en JavaScript o TypeScript. La firma TypeScript describe esos nombres y sus tipos.",
    readiness: ["Puedo distinguir imprimir y devolver.", "Puedo usar parámetros y datos con nombre."],
    examples: { python: 'def triple(numero):\n    return numero * 3', javascript: 'function triple(numero) {\n  return numero * 3;\n}', typescript: 'function triple(numero: number): number {\n  return numero * 3;\n}' },
    steps: [step("retorno", "Devuelve un valor"), step("parametro", "Transforma un parámetro", "el-doble"), step("dos-parametros", "Calcula con dos parámetros", "suma-de-dos-numeros"), step("imprimir-devolver", "Corrige una función que imprime pero no devuelve")],
  },
  {
    path: "desde-cero", level: "INITIATION", slug: "integracion-inicial", title: "7. Tu primera solución independiente",
    theory: "Identifica entrada, transformación y salida antes de escribir. Utiliza solo operaciones, variables y funciones ya practicadas. Sigue los valores a mano y prueba cero cuando esté permitido. Si el programa falla, distingue un error de sintaxis, de tipos o de cálculo y cambia una sola hipótesis cada vez. Estos retos ya no dan una receta línea a línea.",
    readiness: ["Puedo resolver una transformación pequeña sin copiar.", "Puedo explicar mis instrucciones y corregir un error."],
    examples: { python: 'def coste(unidades):\n    return unidades * 3', javascript: 'function coste(unidades) { return unidades * 3; }', typescript: 'function coste(unidades: number): number { return unidades * 3; }' },
    steps: [step("minutos-segundos", "Convierte minutos en segundos"), step("perimetro", "Calcula el perímetro de un rectángulo"), step("repara-presupuesto", "Repara un cálculo de presupuesto"), step("merienda", "Prepara el presupuesto de una merienda", "presupuesto-de-merienda")],
  },
  {
    path: "primeros-pasos", level: "BEGINNER", slug: "decisiones", title: "1. Decisiones",
    theory: "Una condición elige qué instrucciones ejecutar. La primera rama que se cumple gana: ordena los casos más específicos antes que los generales. and y && exigen ambas condiciones; or y || aceptan una alternativa. Revisa igualdad, valor inferior y superior de cada límite. El resto % permite reconocer múltiplos y se utilizará en los bloques siguientes.",
    readiness: ["Puedo cubrir los límites de cada decisión.", "Puedo combinar requisitos sin confundir y con o."],
    examples: { python: 'def permitido(edad, permiso):\n    return edad >= 18 and permiso', javascript: 'function permitido(edad, permiso) { return edad >= 18 && permiso; }', typescript: 'function permitido(edad: number, permiso: boolean): boolean { return edad >= 18 && permiso; }' },
    steps: [step("elige-mensaje", "Elige entre dos mensajes", "elige-con-una-condicion"), step("signo", "Clasifica un número", "tres-caminos"), step("mayor-tres", "Encuentra el mayor de tres valores", "el-mayor-de-tres"), step("dos-requisitos", "Comprueba dos requisitos simultáneos", "dos-condiciones-a-la-vez"), step("alternativas", "Acepta una de dos condiciones", "una-condicion-u-otra"), step("tarifa", "Calcula una tarifa por tramos")],
  },
  {
    path: "primeros-pasos", level: "BEGINNER", slug: "repeticion", title: "2. Repetición y números",
    theory: "Un bucle repite instrucciones. Define el estado inicial, lo que cambia y cuándo termina. for recorre valores; while repite mientras una condición sea verdadera. Un contador cuenta pasos y un acumulador combina resultados. Las listas guardan una secuencia: [] crea una vacía y append en Python o push en JavaScript y TypeScript añade un elemento al final.",
    readiness: ["Puedo construir una secuencia y acumular valores.", "Puedo garantizar que un bucle termine."],
    examples: { python: 'total = 0\nfor numero in range(1, 4):\n    total += numero', javascript: 'let total = 0;\nfor (let numero = 1; numero <= 3; numero++) total += numero;', typescript: 'let total: number = 0;\nfor (let numero = 1; numero <= 3; numero++) total += numero;' },
    steps: [step("uno-n", "Genera los números del uno al N", "numeros-del-uno-al-n"), step("cuenta-atras", "Construye una cuenta atrás"), step("suma-uno-n", "Suma del uno al N", "repite-con-while"), step("tabla", "Genera una tabla de multiplicar"), step("multiplos", "Cuenta los múltiplos de un número"), step("bucle-roto", "Corrige el avance de un bucle")],
  },
  {
    path: "primeros-pasos", level: "BEGINNER", slug: "listas", title: "3. Listas",
    theory: "Los índices de una lista empiezan en cero y llegan hasta longitud menos uno. Distingue índice y valor. Para calcular un máximo utiliza el primer elemento real, no cero, y define qué pasa si la lista está vacía. Un filtro conserva los elementos que cumplen una condición, en el orden original. En TypeScript number[] describe una lista de números.",
    readiness: ["Puedo recorrer sin salir de los índices válidos.", "Puedo elegir el estado inicial de un acumulador."],
    examples: { python: 'numeros = [2, 4]\nfor indice in range(len(numeros)):\n    print(numeros[indice])', javascript: 'const numeros = [2, 4];\nfor (let i = 0; i < numeros.length; i++) console.log(numeros[i]);', typescript: 'const numeros: number[] = [2, 4];\nfor (let i = 0; i < numeros.length; i++) console.log(numeros[i]);' },
    steps: [step("posicion", "Obtén un elemento por su posición"), step("indices", "Recorre una lista con sus índices", "recorre-por-indices"), step("suma-lista", "Suma sus elementos", "suma-del-arreglo"), step("maximo", "Encuentra su máximo", "maximo-de-una-lista"), step("cuenta-condicion", "Cuenta los valores que cumplen una condición"), step("filtra-lista", "Construye una lista filtrada", "filtra-mayores")],
  },
  {
    path: "primeros-pasos", level: "BEGINNER", slug: "textos", title: "4. Textos",
    theory: "Un texto también se puede recorrer y tiene longitud. Normaliza solo lo que pide el enunciado: mayúsculas, espacios y puntuación no siempre se ignoran. Construye una salida nueva si necesitas modificar caracteres. Estos ejercicios limitan el alfabeto a ASCII para que un carácter signifique lo mismo en los tres lenguajes. Vacío, un carácter y ninguna coincidencia son pruebas útiles.",
    readiness: ["Puedo recorrer y construir textos.", "Puedo respetar exactamente las reglas de normalización."],
    examples: { python: 'resultado = ""\nfor letra in "Casa".lower():\n    if letra != "a": resultado += letra', javascript: 'let resultado = "";\nfor (const letra of "Casa".toLowerCase()) {\n  if (letra !== "a") resultado += letra;\n}', typescript: 'let resultado: string = "";\nfor (const letra of "Casa".toLowerCase()) {\n  if (letra !== "a") resultado += letra;\n}' },
    steps: [step("longitud-texto", "Cuenta caracteres"), step("minusculas", "Normaliza mayúsculas y minúsculas", "texto-en-minusculas"), step("vocales", "Cuenta vocales", "contar-vocales"), step("invierte", "Invierte un texto", "invertir-cadena"), step("elimina-caracter", "Elimina un carácter indicado"), step("palabras", "Cuenta palabras separadas por espacios")],
  },
  {
    path: "primeros-pasos", level: "BEGINNER", slug: "funciones-datos", title: "5. Funciones y datos con nombre",
    theory: "Un registro agrupa datos con nombre; un resultado puede ser otro registro. Una función auxiliar tiene una responsabilidad y sus variables locales pertenecen a esa llamada. La ausencia no equivale a cero. Python usa None; JavaScript y TypeScript usan null. Las propiedades opcionales pueden faltar: get en Python o ?? en JavaScript y TypeScript proporcionan un respaldo sin descartar cero.",
    readiness: ["Puedo separar una solución en funciones pequeñas.", "Puedo tratar valores opcionales sin perder el cero."],
    examples: { python: 'def cantidad(data):\n    return data.get("cantidad", 1)', javascript: 'function cantidad(data) { return data.cantidad ?? 1; }', typescript: 'function cantidad(data: { cantidad?: number }): number { return data.cantidad ?? 1; }' },
    steps: [step("ficha-producto", "Lee una ficha de producto"), step("ficha-resultado", "Construye una ficha de resultado"), step("opcional", "Usa un valor opcional con respaldo", "lee-un-opcional"), step("ausencia", "Distingue ausencia y cero", "valor-o-respaldo"), step("auxiliares", "Divide un cálculo en funciones auxiliares", "descompone-un-calculo"), step("variable-local", "Corrige una confusión entre variable local y parámetro")],
  },
  {
    path: "primeros-pasos", level: "BEGINNER", slug: "integracion-bases", title: "6. Combina y comprueba",
    theory: "Plantea los pasos en tus propias palabras antes de programar. Combina decisiones, recorridos y funciones ya conocidos. Para un producto el acumulador empieza en uno; para una suma empieza en cero. Prueba vacíos y límites cuando el contrato lo permita. Los tests comprueban resultados: explica también por qué tu recorrido cubre todos los casos.",
    readiness: ["Puedo combinar condiciones, bucles y funciones sin receta.", "Puedo proponer pruebas que descubran errores."],
    examples: { python: 'def positivos(numeros):\n    total = 0\n    for n in numeros:\n        if n > 0: total += 1\n    return total', javascript: 'function positivos(numeros) {\n  let total = 0;\n  for (const n of numeros) if (n > 0) total++;\n  return total;\n}', typescript: 'function positivos(numeros: number[]): number {\n  let total = 0;\n  for (const n of numeros) if (n > 0) total++;\n  return total;\n}' },
    steps: [step("factorial", "Calcula un factorial iterativo", "factorial"), step("fizzbuzz", "Resuelve FizzBuzz", "fizzbuzz"), step("mediciones", "Resume una lista de mediciones", "resumen-de-mediciones"), step("carrito", "Calcula un carrito con descuento"), step("notas", "Resume las notas de una clase"), step("saldo", "Procesa movimientos de un saldo")],
  },
  {
    path: "pensar-en-soluciones", level: "INTERMEDIATE", slug: "mapas", title: "1. Conjuntos y mapas",
    theory: "Un conjunto recuerda valores distintos y permite consultar pertenencia. Un mapa asocia claves y valores, por ejemplo contadores o grupos. Define qué ocurre con una clave nueva antes de actualizarla. Conservar el orden exige recorrer la entrada en ese orden. En TypeScript Record<string, number> describe contadores, mientras Map permite claves explícitas sin confundirlas con propiedades del objeto.",
    readiness: ["Puedo elegir conjunto o mapa según la operación.", "Puedo contar y agrupar sin perder elementos ni orden."],
    examples: { python: 'conteos = {}\nfor valor in [4, 4, 7]:\n    conteos[valor] = conteos.get(valor, 0) + 1', javascript: 'const conteos = new Map();\nfor (const valor of [4, 4, 7]) conteos.set(valor, (conteos.get(valor) ?? 0) + 1);', typescript: 'const conteos = new Map<number, number>();\nfor (const valor of [4, 4, 7]) conteos.set(valor, (conteos.get(valor) ?? 0) + 1);' },
    steps: [step("repetido", "Detecta un valor repetido"), step("deduplica", "Elimina duplicados conservando el orden", "sin-duplicados"), step("frecuencias", "Cuenta frecuencias", "frecuencia-caracteres"), step("primer-unico", "Encuentra el primer elemento no repetido"), step("anagramas", "Comprueba anagramas", "anagramas"), step("agrupa-registros", "Agrupa registros por categoría")],
  },
  {
    path: "pensar-en-soluciones", level: "INTERMEDIATE", slug: "busqueda", title: "2. Búsqueda y ordenación",
    theory: "La búsqueda lineal revisa elementos y cuesta O(n). La binaria necesita datos ordenados y descarta mitades: O(log n). Ordenar puede facilitar consultas posteriores, pero también cuesta trabajo. Inserción desplaza valores hasta colocar cada elemento. En JavaScript y TypeScript los números necesitan comparador numérico. Define criterios de desempate para obtener una respuesta determinista.",
    readiness: ["Puedo justificar cuándo utilizar búsqueda binaria.", "Puedo comparar un recorrido lineal con uno logarítmico."],
    examples: { python: 'ordenados = sorted([8, 2, 11])\nmedio = (izquierda + derecha) // 2', javascript: 'const ordenados = [8, 2, 11].sort((a, b) => a - b);\nconst medio = Math.floor((izquierda + derecha) / 2);', typescript: 'const ordenados: number[] = [8, 2, 11].sort((a, b) => a - b);\nconst medio: number = Math.floor((izquierda + derecha) / 2);' },
    steps: [step("busqueda-lineal", "Encuentra la primera coincidencia", "busqueda-lineal"), step("busqueda-binaria", "Busca mediante búsqueda binaria", "busqueda-binaria"), step("insercion-posicion", "Encuentra una posición de inserción"), step("ordena-insercion", "Ordena mediante inserción", "ordena-por-insercion"), step("ordena-registros", "Ordena registros por dos criterios"), step("combina", "Combina dos listas ordenadas", "combina-ordenadas")],
  },
  {
    path: "pensar-en-soluciones", level: "INTERMEDIATE", slug: "recorridos", title: "3. Recorridos eficientes",
    theory: "Dos índices permiten evitar comparaciones repetidas. Una suma de prefijos guarda el trabajo de los elementos anteriores y responde intervalos por diferencia. Una ventana representa un segmento contiguo: define sus límites y cuándo avanzan. La ventana por suma de este bloque exige números positivos; con negativos no se puede suponer que añadir un elemento aumenta la suma.",
    readiness: ["Puedo explicar qué intervalo representa mi estado.", "Puedo evitar repetir trabajo y justificar las restricciones."],
    examples: { python: 'prefijos = [0]\nfor n in [3, 5, 2]:\n    prefijos.append(prefijos[-1] + n)', javascript: 'const prefijos = [0];\nfor (const n of [3, 5, 2]) prefijos.push(prefijos[prefijos.length - 1] + n);', typescript: 'const prefijos: number[] = [0];\nfor (const n of [3, 5, 2]) prefijos.push(prefijos[prefijos.length - 1] + n);' },
    steps: [step("palindromo", "Comprueba un palíndromo con dos índices"), step("pareja", "Encuentra una pareja con suma objetivo", "pareja-con-suma"), step("prefijos", "Construye sumas de prefijos", "suma-de-prefijos"), step("intervalos-suma", "Responde sumas de intervalos"), step("ventana-fija", "Encuentra la mejor ventana de tamaño fijo", "ventana-de-tamano-fijo"), step("ventana-suma", "Encuentra el segmento mínimo que alcanza una suma", "ventana-de-tamano-variable")],
  },
  {
    path: "pensar-en-soluciones", level: "INTERMEDIATE", slug: "matrices", title: "4. Matrices",
    theory: "Una matriz es una lista de filas: la posición [fila][columna] requiere dos índices. Comprueba dimensiones y no supongas que todas las matrices son cuadradas. Un recorrido de R filas y C columnas cuesta O(R × C). Define los límites antes de consultar vecinos y decide si se incluyen diagonales. La transpuesta intercambia filas y columnas.",
    readiness: ["Puedo distinguir posición, fila y columna.", "Puedo comprobar límites en dos dimensiones."],
    examples: { python: 'matriz = [[2, 5], [1, 3]]\nfor fila in matriz:\n    print(sum(fila))', javascript: 'const matriz = [[2, 5], [1, 3]];\nfor (const fila of matriz) console.log(fila.reduce((a, b) => a + b, 0));', typescript: 'const matriz: number[][] = [[2, 5], [1, 3]];\nfor (const fila of matriz) console.log(fila.reduce((a, b) => a + b, 0));' },
    steps: [step("celda", "Consulta una celda"), step("filas", "Suma las filas", "matriz-suma-de-filas"), step("columnas", "Suma las columnas"), step("diagonales", "Recorre las diagonales"), step("transpuesta", "Transpone una matriz", "matriz-transpuesta"), step("vecinos", "Cuenta vecinos de cada celda")],
  },
  {
    path: "pensar-en-soluciones", level: "INTERMEDIATE", slug: "estado-recursion", title: "5. Pilas, colas y recursión",
    theory: "Una pila retira lo último que entró y una cola retira lo primero. Comprueba el vacío antes de retirar. Deshacer usa una pila de estados anteriores. Una función recursiva necesita un caso base y avanzar hacia él; las llamadas pendientes también ocupan memoria. En TypeScript pop y shift pueden devolver undefined: comprueba la ausencia antes de utilizar el elemento.",
    readiness: ["Puedo elegir entre pila y cola.", "Puedo seguir llamadas hasta un caso base."],
    examples: { python: 'pila = [3, 8]\nultimo = pila.pop()\nprint(ultimo)', javascript: 'const pila = [3, 8];\nconst ultimo = pila.pop();\nif (ultimo !== undefined) console.log(ultimo);', typescript: 'const pila: number[] = [3, 8];\nconst ultimo: number | undefined = pila.pop();\nif (ultimo !== undefined) console.log(ultimo);' },
    steps: [step("pila", "Procesa operaciones de una pila", "pila-simple"), step("cola", "Simula una cola de atención", "cola-simple"), step("delimitadores", "Comprueba delimitadores equilibrados", "parentesis-equilibrados"), step("deshacer", "Simula deshacer operaciones"), step("suma-recursiva", "Suma una lista recursivamente", "suma-recursiva"), step("busqueda-recursiva", "Busca con recursión en una lista ordenada")],
  },
  {
    path: "pensar-en-soluciones", level: "INTERMEDIATE", slug: "integracion-intermedia", title: "6. Elige una estrategia",
    theory: "Empieza por una solución sencilla y pregunta qué trabajo repite. Una invariante describe lo que sigue siendo cierto después de cada paso. Con duplicados y negativos suelen fallar supuestos que parecían obvios. Los tests no acreditan por sí solos una complejidad: explica también tu estrategia y compara el trabajo que crece con el tamaño de la entrada.",
    readiness: ["Puedo justificar mi estructura y mi recorrido.", "Puedo explicar corrección y coste de una solución sencilla."],
    examples: { python: 'vistos = set()\nfor valor in [1, 2, 1]:\n    vistos.add(valor)', javascript: 'const vistos = new Set();\nfor (const valor of [1, 2, 1]) vistos.add(valor);', typescript: 'const vistos = new Set<number>();\nfor (const valor of [1, 2, 1]) vistos.add(valor);' },
    steps: [step("une-intervalos", "Une intervalos", "unir-intervalos"), step("segundo-maximo", "Encuentra el segundo máximo distinto sin ordenar"), step("suma-maxima", "Encuentra la mayor suma contigua", "suma-maxima"), step("sin-repeticiones", "Encuentra la subcadena más larga sin repeticiones", "ventana-sin-repeticiones"), step("ranking", "Construye un ranking de frecuencias", "ranking-de-frecuencias"), step("inventario", "Consolida un inventario a partir de movimientos")],
  },
  {
    path: "un-paso-mas", level: "ADVANCED", slug: "arboles", title: "1. Árboles",
    theory: "Un árbol contiene un nodo y sus subárboles. null representa ausencia y debe comprobarse antes de acceder a un nodo. Un recorrido en profundidad usa recursión o pila; uno por niveles usa cola. La altura de este bloque cuenta nodos. Un árbol de búsqueda exige límites heredados de todos los antecesores, no solo comparar con el padre.",
    readiness: ["Puedo recorrer nodos sin acceder a una ausencia.", "Puedo mantener restricciones entre antecesores y descendientes."],
    examples: { python: 'def sumar_valores(nodo):\n    if nodo is None: return 0\n    return nodo["value"] + sumar_valores(nodo["left"]) + sumar_valores(nodo["right"])', javascript: 'function sumarValores(nodo) {\n  if (nodo === null) return 0;\n  return nodo.value + sumarValores(nodo.left) + sumarValores(nodo.right);\n}', typescript: 'type Nodo = { value: number; left: Nodo | null; right: Nodo | null };\nfunction sumarValores(nodo: Nodo | null): number {\n  if (nodo === null) return 0;\n  return nodo.value + sumarValores(nodo.left) + sumarValores(nodo.right);\n}' },
    steps: [step("cuenta-nodos", "Cuenta nodos"), step("altura", "Calcula la altura", "arbol-altura"), step("preorden", "Recorre en preorden", "arbol-preorden"), step("niveles", "Recorre por niveles", "arbol-por-niveles"), step("arbol-busqueda", "Valida un árbol binario de búsqueda", "arbol-es-busqueda"), step("ancestro", "Encuentra el ancestro común de dos nodos")],
  },
  {
    path: "un-paso-mas", level: "ADVANCED", slug: "prioridades", title: "2. Prioridades y decisiones voraces",
    theory: "Un montículo mínimo representa un árbol en una lista. El padre de i es (i−1)//2 y sus hijos son 2i+1 y 2i+2. El padre nunca supera a los hijos. Insertar asciende; extraer reemplaza la raíz y desciende. Una cola de prioridad añade desempates. Una elección voraz necesita justificar que la decisión local no elimina una solución mejor; no funciona para todos los problemas.",
    readiness: ["Puedo mantener la propiedad de un montículo.", "Puedo justificar o refutar una elección voraz."],
    examples: { python: 'import heapq\ncola = [3, 8, 5]\nheapq.heapify(cola)\nprint(heapq.heappop(cola))', javascript: 'const padre = i => Math.floor((i - 1) / 2);\nconst hijos = i => [2 * i + 1, 2 * i + 2];', typescript: 'const padre = (i: number): number => Math.floor((i - 1) / 2);\nconst hijos = (i: number): number[] => [2 * i + 1, 2 * i + 2];' },
    steps: [step("monticulo-inserta", "Inserta en un montículo mínimo"), step("monticulo-extrae", "Extrae su mínimo"), step("prioridad", "Simula una cola de prioridad"), step("k-mayores", "Encuentra los K mayores elementos"), step("actividades", "Selecciona actividades compatibles", "seleccion-de-actividades"), step("combina-archivos", "Minimiza el coste de combinar archivos")],
  },
  {
    path: "un-paso-mas", level: "ADVANCED", slug: "exploracion", title: "3. Divide y vencerás y exploración",
    theory: "Divide y vencerás resuelve partes menores y combina respuestas. Backtracking enumera decisiones y restaura el estado al regresar. Define caso base, avance y restauración. El número de alternativas puede crecer exponencialmente aunque cada paso sea sencillo: comprueba los límites. El orden de las respuestas forma parte del contrato cuando hay varias combinaciones válidas.",
    readiness: ["Puedo definir casos base y combinar resultados.", "Puedo deshacer decisiones sin compartir estado incorrecto."],
    examples: { python: 'def potencia_dos(n):\n    if n == 0: return 1\n    mitad = potencia_dos(n // 2)\n    return mitad * mitad * (2 if n % 2 else 1)', javascript: 'function potenciaDos(n) {\n  if (n === 0) return 1;\n  const mitad = potenciaDos(Math.floor(n / 2));\n  return mitad * mitad * (n % 2 ? 2 : 1);\n}', typescript: 'function potenciaDos(n: number): number {\n  if (n === 0) return 1;\n  const mitad = potenciaDos(Math.floor(n / 2));\n  return mitad * mitad * (n % 2 ? 2 : 1);\n}' },
    steps: [step("potencia", "Calcula una potencia rápidamente", "potencia-rapida"), step("mezcla", "Ordena por mezcla", "ordena-por-mezcla"), step("subconjuntos", "Genera subconjuntos", "subconjuntos"), step("permutaciones", "Genera permutaciones", "permutaciones"), step("combinaciones", "Encuentra combinaciones con una suma objetivo"), step("reinas", "Resuelve N reinas")],
  },
  {
    path: "un-paso-mas", level: "ADVANCED", slug: "dinamica", title: "4. Programación dinámica",
    theory: "Antes de escribir una tabla, define qué significa cada estado. Establece casos base y transiciones. La memoización recuerda resultados; la tabulación calcula en un orden que respeta dependencias. Cuenta, minimiza y maximiza son objetivos diferentes con distintos valores iniciales. Optimiza memoria solo después de entender qué estados anteriores necesitas.",
    readiness: ["Puedo explicar un estado sin referirme al código.", "Puedo justificar bases, transición y orden de cálculo."],
    examples: { python: 'formas = [1, 1]\nfor i in range(2, 6):\n    formas.append(formas[i - 1] + formas[i - 2])', javascript: 'const formas = [1, 1];\nfor (let i = 2; i < 6; i++) formas[i] = formas[i - 1] + formas[i - 2];', typescript: 'const formas: number[] = [1, 1];\nfor (let i = 2; i < 6; i++) formas[i] = formas[i - 1] + formas[i - 2];' },
    steps: [step("fibonacci", "Calcula Fibonacci con memoria", "fibonacci-con-memoria"), step("escalera", "Cuenta formas de subir una escalera", "escaleras-dp"), step("caminos-obstaculos", "Cuenta caminos con obstáculos"), step("monedas", "Calcula el mínimo de monedas", "cambio-minimo"), step("mochila", "Resuelve la mochila 0/1", "mochila-0-1"), step("subsecuencia-comun", "Encuentra la subsecuencia común más larga", "subsecuencia-comun")],
  },
  {
    path: "un-paso-mas", level: "ADVANCED", slug: "grafos", title: "5. Grafos",
    theory: "Un grafo representa conexiones: especifica si las aristas son dirigidas y si tienen pesos. DFS o BFS marcan visitados para evitar repeticiones. BFS encuentra distancias mínimas sin pesos. Los ciclos dirigidos requieren distinguir nodos en curso de nodos terminados. Un orden topológico respeta dependencias; Dijkstra exige pesos no negativos y utiliza prioridades.",
    readiness: ["Puedo modelar dirección, pesos y visitados.", "Puedo elegir un recorrido según el problema."],
    examples: { python: 'adyacencia = [[1], [0, 2], [1]]\nvisitados = {0}\ncola = [0]', javascript: 'const adyacencia = [[1], [0, 2], [1]];\nconst visitados = new Set([0]);\nconst cola = [0];', typescript: 'const adyacencia: number[][] = [[1], [0, 2], [1]];\nconst visitados = new Set<number>([0]);\nconst cola: number[] = [0];' },
    steps: [step("adyacencia", "Construye una lista de adyacencia", "grafo-lista-adyacencia"), step("alcanzables", "Encuentra nodos alcanzables", "grafo-alcanzables"), step("distancias", "Calcula distancias sin pesos", "grafo-distancias"), step("ciclo-dirigido", "Detecta ciclos dirigidos"), step("dependencias", "Ordena tareas por dependencias", "orden-de-tareas"), step("dijkstra", "Calcula caminos mínimos con pesos no negativos", "dijkstra-camino-minimo")],
  },
  {
    path: "un-paso-mas", level: "ADVANCED", slug: "integracion-avanzada", title: "6. Elige y defiende una solución",
    theory: "Traduce el problema a estados, relaciones o intervalos antes de elegir una técnica. Busca trabajo repetido y contraejemplos. La búsqueda sobre la respuesta necesita una condición monótona: si una capacidad sirve, una mayor también. Compara corrección, tiempo y memoria. Estos cierres integran lo practicado; terminarlos no equivale a dominar todas las áreas de programación.",
    readiness: ["Puedo defender por qué mi solución funciona.", "Puedo comparar alternativas y encontrar un contraejemplo."],
    examples: { python: 'intervalos = sorted([[2, 4], [1, 3]], key=lambda par: par[1])', javascript: 'const intervalos = [[2, 4], [1, 3]].sort((a, b) => a[1] - b[1]);', typescript: 'const intervalos: [number, number][] = [[2, 4], [1, 3]];\nintervalos.sort((a, b) => a[1] - b[1]);' },
    steps: [step("islas", "Cuenta islas", "cuenta-islas"), step("laberinto", "Encuentra la salida más corta de un laberinto", "laberinto-camino-minimo"), step("capacidad", "Calcula una capacidad mínima", "capacidad-minima"), step("edicion", "Calcula la distancia de edición", "distancia-edicion"), step("subsecuencia-creciente", "Encuentra la subsecuencia creciente más larga", "subsecuencia-creciente"), step("planifica-tareas", "Planifica tareas con dependencias y duraciones")],
  },
];
