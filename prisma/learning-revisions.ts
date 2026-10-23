import type { SeedExercise } from "./content";
import type { Json, Language } from "../src/lib/types";
import type { ConceptRule } from "../src/lib/concept-validation";

// Revisiones del catálogo actual. Las fuentes históricas no se reescriben.
const statements: Record<string, string> = {
  saludo: "Muestra el texto Hola, mundo! en una sola línea. Respeta la coma, el espacio y el signo de exclamación.",
  "dos-lineas": "Muestra Primera y Segunda, en ese orden y en líneas distintas.",
  "orden-mensaje": "La plantilla muestra las instrucciones de una receta en un orden incorrecto. Reorganízalas para mostrar Preparar, Mezclar y Servir, cada palabra en una línea.",
  "texto-calculo": "Muestra el resultado de sumar 4 y 6 en la primera línea. En la segunda, muestra el texto 4 + 6 sin calcularlo. Utiliza una expresión numérica para la suma y comillas para el texto.",
  "guarda-nombre": "Guarda el texto Ada en una variable y muestra su valor. Utiliza la variable al mostrarlo, no escribas de nuevo el texto.",
  "guarda-cantidad": "La plantilla guarda 8 en puntos, pero muestra la palabra puntos. Corrige la impresión para mostrar el valor de la variable.",
  "actualiza-puntos": "Empiezas con 8 puntos y ganas 3. Corrige la actualización para sumar los nuevos puntos al valor anterior. Muestra el valor de la variable después de actualizarla.",
  intercambia: "Guarda 3 en una variable y 8 en otra. Intercambia sus valores usando una variable auxiliar. Después muestra el valor de la primera y el de la segunda, en líneas distintas.",
  "suma-cantidades": "Guarda 7 y 5 en dos variables. Calcula su suma utilizando esas variables y muestra el resultado.",
  cambio: "Una compra cuesta 13 y pagas con 20. Guarda ambas cantidades en variables. Calcula cuánto deben devolverte usando una resta entre esos valores y muestra el resultado.",
  "precio-unidades": "Cada unidad cuesta 4 y compras 6. Guarda el precio y la cantidad en variables. Utiliza una multiplicación entre esos valores para calcular el total y muéstralo.",
  parentesis: "La plantilla intenta calcular el doble de la suma de 4 y 3, pero multiplica antes de sumar. Corrige la expresión para sumar primero y multiplicar el resultado por dos. Puedes usar paréntesis o guardar la suma en una variable.",
  "lee-nombre": "La plantilla recibe un nombre y lo guarda en nombre. Muestra Hola, seguido de un espacio y el nombre recibido. Conserva las mayúsculas y minúsculas de la entrada.",
  "lee-doble": "La plantilla recibe un entero entre −1000 y 1000 y ya lo convierte en número. Utiliza numero para calcular y mostrar su doble.",
  "lee-suma": "Recibes dos enteros entre −100 y 100, uno por línea. La plantilla los lee como texto. Convierte ambos a número y muestra su suma, no la unión de sus dígitos.",
  "mensaje-resultado": "La plantilla recibe una ciudad. Muestra Destino: seguido de un espacio y la ciudad recibida. Conserva las mayúsculas y los espacios interiores. La entrada no tiene espacios en los extremos.",
  "numero-texto": 'Muestra dos líneas. En la primera, suma los números 4 y 2. En la segunda, une los textos "4" y "2". Construye ambas expresiones en lugar de escribir sus resultados.',
  booleano: "Cambia el valor de listo a verdadero y muestra esa variable. Utiliza un booleano, no un texto entre comillas. Conserva la impresión preparada en la plantilla.",
  igualdad: "Recibes dos enteros entre −1000 y 1000, uno por línea. Muestra true si son iguales y false si son distintos. La plantilla ya prepara los números y el formato de la salida.",
  alcanza: "Recibes una cantidad entera entre 0 y 100. Muestra true si es suficiente para pagar algo que cuesta 10, y false si no alcanza. La plantilla ya prepara la lectura y el formato de la salida.",
  retorno: "La función recibe un entero entre −1000 y 1000 en data. Devuelve ese mismo número con return, sin modificarlo.",
  parametro: "La función recibe un entero en data. Modifica el retorno de la plantilla para devolver su doble.",
  "dos-parametros": "Recibes dos enteros llamados a y b. La plantilla ya los guarda en primero y segundo. Devuelve su suma. Los valores pueden ser positivos, negativos o cero.",
  "imprimir-devolver": "La plantilla calcula el número recibido más uno, pero lo imprime y devuelve cero. Corrígela para devolver el resultado del cálculo con return.",
  "minutos-segundos": "Recibes una duración en minutos, un entero entre 0 y 1000. Devuelve su equivalencia en segundos. Cada minuto tiene 60 segundos.",
  perimetro: "Recibes la base y la altura de un rectángulo, enteros entre 1 y 1000. Devuelve su perímetro: la suma de sus cuatro lados.",
  "repara-presupuesto": "Un pedido tiene precio por unidad, cantidad de unidades y coste de envío. La plantilla cobra el envío por cada unidad. Corrígela para cobrarlo una sola vez y devuelve el total. precio y unidades van de 0 a 1000; envio, de 0 a 100. Aunque no haya unidades, se cobra el envío.",
  merienda: "Recibes unidades y precio, enteros entre 0 y 100. Calcula el coste de la compra y devuelve un texto con Total: seguido de un espacio y el importe. No hay descuentos ni envío.",
  "dos-requisitos": "Recibes un entero. Devuelve verdadero si es múltiplo de 3 y de 5 al mismo tiempo; en otro caso, falso. Cero cumple ambas condiciones. La plantilla ya calcula las dos comparaciones: completa el retorno para combinarlas.",
  alternativas: "Recibes invitacion, entrada y bloqueado, todos booleanos. Permite acceder si hay invitación o entrada comprada, pero nunca si la persona está bloqueada. Devuelve un booleano.",
  invierte: "Recibes un texto. Devuélvelo en orden inverso, conservando espacios y mayúsculas. La plantilla ya recorre sus letras, pero las añade en el orden original. Corrige cómo se construye el resultado.",
  deduplica: "Recibes una lista de enteros. Devuelve otra sin repeticiones, conservando el orden de la primera aparición. La plantilla prepara un conjunto para recordar los valores y una lista para construir el resultado. Completa el recorrido sin ordenar la entrada. La lista vacía devuelve [].",
  "busqueda-binaria": "Recibes numbers, una lista de enteros distintos en orden ascendente, y target. Devuelve el índice del objetivo o −1 si no aparece. Los índices empiezan en cero; la lista puede estar vacía. Completa la plantilla practicando búsqueda binaria: conserva los índices originales y no ordenes ni cortes la lista.",
  opcional: "Recibes una ficha que puede incluir cantidad, un entero entre 0 y 100. Devuelve esa cantidad si existe, o 1 si falta. Cero es una cantidad válida. La propiedad nunca contiene null.",
  "busqueda-recursiva": "Recibes numbers, una lista ordenada de hasta 1000 enteros distintos, y target. Devuelve su índice o −1 si no aparece. La lista puede estar vacía. Puedes repasar la búsqueda binaria recursiva en las ayudas.",
  "segundo-maximo": "Recibes hasta 1000 enteros entre −10000 y 10000. Devuelve el segundo valor distinto más grande, o null si no existe. Repetir el máximo no cuenta como un segundo valor.",
  "k-mayores": "Recibes numbers, una lista de hasta 1000 enteros, y k, entre cero y su longitud. Devuelve los k valores mayores en orden descendente. Conserva las repeticiones; para k igual a cero devuelve [].",
  "intervalos-suma": "Recibes numbers, una lista de hasta 1000 enteros, y consultas, hasta 100 pares [inicio, fin]. Devuelve la suma de cada intervalo en el orden de las consultas, incluyendo ambos extremos. Los índices son válidos. Si numbers está vacío, consultas también lo está.",
  potencia: "Recibes base y exponente, enteros entre 0 y 10 y entre 0 y 100, respectivamente. Devuelve base elevada a exponente. Las entradas garantizan que el resultado no supera 9007199254740991. Para exponente cero devuelve 1, también cuando la base es cero.",
  "elige-mensaje": 'Recibes un entero. Devuelve "positivo" si es mayor que cero y "no positivo" en otro caso. La plantilla ya comprueba la condición: corrige el texto de la primera respuesta.',
  signo: 'Recibes un entero. Devuelve "positivo", "negativo" o "cero", según su valor. La plantilla ya distingue las dos primeras posibilidades. Completa la respuesta del último caso.',
  "uno-n": "Recibes un entero no negativo en data. Devuelve la lista de números desde 1 hasta data, incluido. Para cero devuelve []. La plantilla ya recorre ese intervalo, pero añade siempre cero. Corrige el valor que añade a la lista.",
  indices: "Recibes una lista. Devuelve una copia con los mismos valores y en el mismo orden. La plantilla recorre sus posiciones, pero copia siempre el primer elemento. Corrige el acceso para copiar el elemento de la posición actual. La lista vacía devuelve [].",
  "suma-lista": "Recibes una lista de números. Devuelve la suma de sus elementos, o cero si está vacía. La plantilla prepara el total y su devolución; completa el recorrido que acumula los valores.",
  maximo: "Recibes una lista de entre 1 y 100 enteros. Devuelve su valor máximo. La plantilla ya guarda un candidato y recorre la lista, pero compara al revés. Corrige esa comparación. Los números pueden ser negativos y el máximo puede repetirse.",
  minusculas: "Recibes un texto. Devuélvelo en minúsculas, conservando espacios, números y signos. La plantilla devuelve el texto original: añade la operación de conversión de tu lenguaje.",
  vocales: "Recibes un texto. Devuelve cuántas vocales contiene: a, e, i, o, u, en mayúsculas o minúsculas. No cuentes vocales acentuadas. La plantilla ya prepara la conversión a minúsculas y el contador; completa el recorrido y su condición.",
  frecuencias: "Recibes un texto formado por letras de a a z. Devuelve una ficha con la cantidad de apariciones de cada letra presente. El orden de las propiedades no importa. Para el texto vacío devuelve {}. La plantilla prepara la ficha: completa el recorrido y la actualización de los contadores.",
  anagramas: "Recibes dos textos, a y b, formados por letras ASCII y espacios. Devuelve verdadero si contienen las mismas letras con las mismas cantidades, aunque estén en distinto orden. Ignora mayúsculas y espacios normales. La plantilla prepara dos tablas con las 26 letras: completa el conteo y la comparación. Un texto vacío y otro de espacios sí cumplen la condición.",
};

// Respuestas escritas y revisadas, no calculadas desde la referencia a validar.
// Casos ocultos que distinguen errores comunes, no repeticiones para inflar el total.
const extraCases: Record<string, [Json, Json][]> = {
  "lee-doble": [["17\n", "34\n"], ["-1000\n", "-2000\n"]],
  "lee-suma": [["-7\n-2\n", "-9\n"], ["100\n-100\n", "0\n"]],
  igualdad: [["-3\n-3\n", "true\n"], ["-1\n0\n", "false\n"]],
  alcanza: [["100\n", "true\n"], ["1\n", "false\n"]],
  retorno: [[1000, 1000], [-1000, -1000]],
  "imprimir-devolver": [[-1, 0], [1000, 1001]],
  "minutos-segundos": [[1000, 60000], [7, 420]],
  perimetro: [[{ base: 2, altura: 9 }, 22], [{ base: 1000, altura: 1000 }, 4000]],
  "repara-presupuesto": [[{ precio: 5, unidades: 3, envio: 4 }, 19], [{ precio: 9, unidades: 0, envio: 7 }, 7]],
  merienda: [[{ unidades: 7, precio: 2 }, "Total: 14"], [{ unidades: 100, precio: 100 }, "Total: 10000"]],
  "cuenta-atras": [[2, [2, 1, 0]], [5, [5, 4, 3, 2, 1, 0]]],
  tabla: [[3, [3, 6, 9, 12, 15, 18, 21, 24, 27, 30]], [-2, [-2, -4, -6, -8, -10, -12, -14, -16, -18, -20]]],
  posicion: [[{ numbers: [2, 4, 9], index: 2 }, 9], [{ numbers: [-1, 0], index: 1 }, 0]],
  "longitud-texto": [["  ", 2], ["!", 1]],
  "elimina-caracter": [[{ texto: "aaaa", caracter: "a" }, ""], [{ texto: "casa", caracter: "x" }, "casa"]],
  "ficha-producto": [[{ nombre: "Pan", precio: 8 }, 8], [{ nombre: "Otro", precio: 1000 }, 1000]],
  "ficha-resultado": [[{ precio: 7, unidades: 3 }, { total: 21, unidades: 3 }], [{ precio: 1, unidades: 1 }, { total: 1, unidades: 1 }]],
  saldo: [[{ inicial: 0, movimientos: [-1, -2, 5, -5, -1] }, { saldo: 0, rechazados: 3 }], [{ inicial: 7, movimientos: [0, -7, 2] }, { saldo: 2, rechazados: 0 }]],
  "agrupa-registros": [[[{ categoria: "b", nombre: "z" }, { categoria: "a", nombre: "y" }, { categoria: "b", nombre: "x" }], { b: ["z", "x"], a: ["y"] }]],
  "ordena-registros": [[[{ nombre: "z", puntos: 2 }, { nombre: "a", puntos: 2 }, { nombre: "m", puntos: 3 }], [{ nombre: "m", puntos: 3 }, { nombre: "a", puntos: 2 }, { nombre: "z", puntos: 2 }]]],
  "intervalos-suma": [[{ numbers: [3, -5, 8, 1], consultas: [[1, 3], [0, 0], [2, 3]] }, [4, 3, 9]]],
  celda: [[{ matriz: [[1], [-5], [8]], fila: 1, columna: 0 }, -5]],
  columnas: [[[[ -1, 3 ], [4, -2], [0, 7]], [3, 8]]],
  diagonales: [[[[0, -1], [3, 2]], { principal: [0, 2], secundaria: [-1, 3] }]],
  deshacer: [[{ operaciones: [["sumar", 4], ["sumar", -7], ["deshacer"], ["deshacer"], ["deshacer"]] }, 0], [{ operaciones: [["sumar", -3], ["sumar", 1]] }, -2]],
  inventario: [[[{ producto: "a", cambio: 2 }, { producto: "b", cambio: 5 }, { producto: "a", cambio: -1 }], { a: 1, b: 5 }]],
  "cuenta-nodos": [[{ value: 8, left: null, right: { value: 0, left: null, right: null } }, 2]],
  "monticulo-inserta": [[{ heap: [1, 4, 3, 5], value: 2 }, [1, 2, 3, 5, 4]]],
  prioridad: [[[{ id: 8, prioridad: 0 }, { id: 2, prioridad: 0 }, { id: 5, prioridad: -2 }], [5, 2, 8]]],
  subconjuntos: [[[0, 2], [[], [0], [2], [0, 2]]]],
  potencia: [[{ base: 0, exponente: 0 }, 1], [{ base: 0, exponente: 4 }, 0], [{ base: 7, exponente: 8 }, 5764801]],
};

const rules: Record<string, ConceptRule> = {
  "texto-calculo": "expression", "guarda-nombre": "variable", "guarda-cantidad": "variable", "actualiza-puntos": "update", intercambia: "swap",
  "suma-cantidades": "addition", cambio: "subtraction", "precio-unidades": "multiplication", parentesis: "grouping", "numero-texto": "number-text", booleano: "boolean",
};
const guided = new Set(["elige-mensaje", "signo", "uno-n", "suma-uno-n", "indices", "suma-lista", "maximo", "minusculas", "vocales", "frecuencias", "anagramas", "dos-requisitos", "alternativas", "invierte", "deduplica", "busqueda-binaria", "bucle-roto", "variable-local", "repara-presupuesto"]);

export function reviseLearningContent(exercise: SeedExercise, key: string): SeedExercise {
  const fixed = exercise.runtimeMode === "PROGRAM" && exercise.tests.every(test => test.input === "");
  const conceptRule = rules[key] ?? "";
  const tests = fixed ? [{ ...exercise.tests[0], visible: true }] : [
    ...exercise.tests.map((test, index) => ({ ...test, visible: index < 2 })),
    ...(extraCases[key] ?? []).map(([input, expected]) => ({ input, expected, visible: false })),
  ];
  const statement = statements[key];
  const statementsByLanguage = Object.fromEntries((["python", "javascript", "typescript"] as Language[]).map(language => [language, statement ?? exercise.statements?.[language] ?? exercise.statement])) as Record<Language, string>;
  const constraints = fixed ? [] : exercise.constraints.filter(text => !/^(Implementa solve\(data\)|Escribe un programa completo|Los casos de salida fija)/.test(text));
  // No adelantar complejidad a quien aún está aprendiendo instrucciones.
  const complexity = exercise.level === "INITIATION" ? "" : exercise.complexity;
  return { ...exercise, statement: statementsByLanguage.python, statements: statementsByLanguage, conceptRule, tests, constraints, complexity,
    activityType: guided.has(key) ? "GUIDED" : exercise.activityType,
    ...(key === "cambio" ? { practiceGoals: ["Representar una diferencia mediante una resta entre variables."] } : {}),
  };
}
