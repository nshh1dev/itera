import type { SeedExercise } from "./content";

type Lesson = Pick<SeedExercise, "slug" | "title" | "statement" | "python" | "javascript" | "starters" | "tests" | "hints" | "explanation" | "constraints">;
const lesson = (data: Lesson): SeedExercise => ({
  ...data, category: "Arreglos", level: "INTERMEDIATE", minutes: 12,
  description: data.statement.split("\n")[0],
  constraints: ["Implementa solve(data) y devuelve el resultado, sin imprimirlo.", "Conserva la estructura de la plantilla y cambia el paso indicado.", ...data.constraints],
});

export const maximaExercises: SeedExercise[] = [
  lesson({
    slug: "maximo-de-una-lista", title: "Conserva el mayor",
    statement: "Encuentra el máximo de una lista no vacía.\n\nRetoma El mayor de tres, pero ahora la lista puede tener cualquier longitud entre 1 y 100. La plantilla empieza con mayor = data[0], un valor que sí pertenece a la entrada, y recorre todos los números. Si encuentra uno mayor que el candidato, lo guarda en mayor. Revisar de nuevo el primero no cambia nada.\n\nLa comparación está al revés: cambia numero < mayor por numero > mayor. No cambies la asignación ni muevas return dentro del bucle. Con [3, 9, 2, 9], la respuesta es 9: repetir el máximo no aumenta su valor.\n\nCon [-8, -2, -5], devuelve -2, no cero. Por eso no empezamos con mayor = 0. Esta actividad garantiza al menos un elemento; en la siguiente aprenderás a representar que no hay resultado cuando la lista está vacía.",
    python: "def solve(data):\n    mayor = data[0]\n    for numero in data:\n        if numero > mayor:\n            mayor = numero\n    return mayor\n",
    javascript: "function solve(data) {\n  let mayor = data[0];\n  for (const numero of data) {\n    if (numero > mayor) {\n      mayor = numero;\n    }\n  }\n  return mayor;\n}\n",
    starters: {
      python: "def solve(data):\n    mayor = data[0]\n    for numero in data:\n        if numero < mayor:\n            mayor = numero\n    return mayor\n",
      javascript: "function solve(data) {\n  let mayor = data[0];\n  for (const numero of data) {\n    if (numero < mayor) {\n      mayor = numero;\n    }\n  }\n  return mayor;\n}\n",
    },
    constraints: ["La entrada contiene de 1 a 100 enteros entre −1000 y 1000."],
    hints: ["mayor debe conservar el número más grande visitado.", "Solo reemplaza el candidato cuando numero sea mayor que él.", "Cambia < por > en el if."],
    explanation: "Con [3, 9, 2, 9], el candidato empieza en 3, sube a 9 y ya no cambia. Con negativos, empezar en el primer valor evita inventar un cero que no está en la lista. El recorrido tarda O(n) y usa espacio auxiliar O(1).",
    tests: [
      { input: [3,9,2,9], expected: 9 }, { input: [-8,-2,-5], expected: -2 },
      { input: [0], expected: 0 }, { input: [7,7], expected: 7 },
      { input: [9,2,1], expected: 9 }, { input: [1,2,9], expected: 9 },
    ],
  }),
  lesson({
    slug: "primer-valor-o-ausencia", title: "Cuando no hay un valor",
    statement: "Devuelve el primer número o indica que no existe.\n\nUna lista vacía no tiene posición cero. La plantilla comprueba primero su tamaño: len(data) en Python o data.length en JavaScript. Si es cero, termina la función antes de intentar leer data[0]. Si no, devuelve el primer número, no el mayor.\n\nCuando falta un valor, usaremos None en Python y null en JavaScript, sin comillas. Ambos se muestran como null en los resultados JSON de la aplicación. JSON es el formato con el que se muestran entradas y resultados: en código Python debes escribir None, no null. No es el texto 'null', ni cero ni falso. [0] tiene un primer valor y debe devolver 0; [] debe devolver null.\n\nCambia solo el return 0 del bloque de lista vacía por return None en Python o return null en JavaScript. El return data[0] final ya es correcto. Un return termina la función: si se devuelve la ausencia, no se ejecuta el acceso posterior.",
    python: "def solve(data):\n    if len(data) == 0:\n        return None\n    return data[0]\n",
    javascript: "function solve(data) {\n  if (data.length === 0) {\n    return null;\n  }\n  return data[0];\n}\n",
    starters: {
      python: "def solve(data):\n    if len(data) == 0:\n        return 0\n    return data[0]\n",
      javascript: "function solve(data) {\n  if (data.length === 0) {\n    return 0;\n  }\n  return data[0];\n}\n",
    },
    constraints: ["La entrada contiene de 0 a 100 enteros entre −1000 y 1000."],
    hints: ["El caso vacío no debe devolver un número inventado.", "None y null son valores especiales, no textos: no llevan comillas.", "En el primer return, sustituye 0 por None en Python o null en JavaScript."],
    explanation: "Con [], la condición de tamaño cero es verdadera y return entrega la ausencia sin acceder a una posición inexistente. Con [0, 8], la condición es falsa y data[0] devuelve cero: cero es un valor válido, no ausencia. La aplicación convierte None de Python al null de JSON. Tiempo y espacio auxiliar O(1).",
    tests: [
      { input: [], expected: null }, { input: [0,8], expected: 0 },
      { input: [-5,9], expected: -5 }, { input: [7], expected: 7 }, { input: [2,1], expected: 2 },
    ],
  }),
  lesson({
    slug: "maximo-bajo-un-limite", title: "El mayor por debajo del límite",
    statement: "Conserva el mayor número estrictamente menor que un límite.\n\nRecibes un objeto con numbers, una lista de enteros, y limit, un entero. Con numbers = [8, 3, 8, 5] y limit = 8, el resultado es 5. Los números iguales al límite no cuentan. Si ninguno sirve, devuelve None en Python o null en JavaScript. Una lista vacía tampoco tiene candidato.\n\nLa plantilla empieza con candidato = None o let candidato = null. Dentro del recorrido, el primer if filtra los números. Cambia numero <= limite por numero < limite para excluir la igualdad.\n\nEl resto ya está escrito: candidato is None en Python o candidato === null en JavaScript pregunta si todavía no se guardó un número. En ese caso se guarda el primero válido. Solo si ya existe candidato se evalúa elif numero > candidato o else if (numero > candidato), para mejorarlo. Nunca compares la ausencia con un número.\n\nHay un if dentro de otro: el bloque interior solo se ejecuta si el número pasa el filtro exterior. No cambies esos bloques. Con [0, -2] y límite 1, el candidato correcto es 0, aunque cero se interprete como falso en otras condiciones. Por eso comprobamos la ausencia explícitamente, no con if candidato.",
    python: "def solve(data):\n    limite = data['limit']\n    candidato = None\n    for numero in data['numbers']:\n        if numero < limite:\n            if candidato is None:\n                candidato = numero\n            elif numero > candidato:\n                candidato = numero\n    return candidato\n",
    javascript: "function solve(data) {\n  const limite = data.limit;\n  let candidato = null;\n  for (const numero of data.numbers) {\n    if (numero < limite) {\n      if (candidato === null) {\n        candidato = numero;\n      } else if (numero > candidato) {\n        candidato = numero;\n      }\n    }\n  }\n  return candidato;\n}\n",
    starters: {
      python: "def solve(data):\n    limite = data['limit']\n    candidato = None\n    for numero in data['numbers']:\n        if numero <= limite:\n            if candidato is None:\n                candidato = numero\n            elif numero > candidato:\n                candidato = numero\n    return candidato\n",
      javascript: "function solve(data) {\n  const limite = data.limit;\n  let candidato = null;\n  for (const numero of data.numbers) {\n    if (numero <= limite) {\n      if (candidato === null) {\n        candidato = numero;\n      } else if (numero > candidato) {\n        candidato = numero;\n      }\n    }\n  }\n  return candidato;\n}\n",
    },
    constraints: ["numbers contiene de 0 a 100 enteros entre −1000 y 1000; limit es un entero en ese rango."],
    hints: ["El cambio está en el filtro exterior, no en cómo se mejora el candidato.", "Un número igual al límite debe quedar fuera.", "Cambia <= por < en numero <= limite."],
    explanation: "Con [8, 3, 8, 5] y límite 8, se omiten ambos 8. El 3 inaugura el candidato y el 5 lo mejora. Con [8, 8] no se guarda ninguno y se devuelve ausencia. Si el candidato llega a cero, sigue siendo un número válido. Repetir el mismo valor no cambia el máximo. Tiempo O(n) y espacio auxiliar O(1).",
    tests: [
      { input: { numbers: [8,3,8,5], limit: 8 }, expected: 5 },
      { input: { numbers: [8,8], limit: 8 }, expected: null },
      { input: { numbers: [], limit: 0 }, expected: null },
      { input: { numbers: [-5,-1,-3], limit: -1 }, expected: -3 },
      { input: { numbers: [0,-2], limit: 1 }, expected: 0 },
      { input: { numbers: [5,7], limit: 3 }, expected: null },
      { input: { numbers: [2,2,1], limit: 3 }, expected: 2 },
      { input: { numbers: [-3,-5,-2], limit: -1 }, expected: -2 },
    ],
  }),
];

// Solo se incorpora a instalaciones existentes como una versión nueva en borrador.
export const maximaRevisions: Record<string, Pick<SeedExercise, "description" | "minutes" | "statement" | "python" | "javascript" | "starters" | "hints" | "explanation" | "tests">> = {
  "segundo-mayor": {
    description: "Combina dos recorridos para encontrar el segundo máximo distinto, sin ordenar.", minutes: 25,
    statement: "Combina Conserva el mayor, Cuando no hay un valor y El mayor por debajo del límite. Devuelve el segundo número distinto más grande de data. Si hay menos de dos valores distintos, devuelve None en Python o null en JavaScript, que se muestra como null en JSON.\n\nCon [8, 3, 8, 5], el mayor es 8 y el segundo distinto es 5, no el otro 8. Con [2, 2], [], o [7], no existe segundo lugar. Con [1, 0], sí existe: es 0, no ausencia.\n\nLa plantilla ya trata la lista vacía y prepara mayor con el primer elemento. Añade un primer recorrido para encontrar el máximo de toda la lista. Después inicializa candidato en None o null y haz un segundo recorrido: conserva solo números estrictamente menores que mayor y busca entre ellos el más grande, como en El mayor por debajo del límite. Devuelve candidato al terminar.\n\nComprueba candidato is None en Python o candidato === null en JavaScript antes de comparar números: guarda el primer candidato válido y usa elif o else if para mejorar uno que ya existe. No empieces el candidato en cero: puede haber negativos. No necesitas ordenar, quitar duplicados ni mantener dos máximos simultáneamente.",
    python: "def solve(data):\n    if len(data) == 0:\n        return None\n    mayor = data[0]\n    for numero in data:\n        if numero > mayor:\n            mayor = numero\n    candidato = None\n    for numero in data:\n        if numero < mayor:\n            if candidato is None:\n                candidato = numero\n            elif numero > candidato:\n                candidato = numero\n    return candidato\n",
    javascript: "function solve(data) {\n  if (data.length === 0) {\n    return null;\n  }\n  let mayor = data[0];\n  for (const numero of data) {\n    if (numero > mayor) {\n      mayor = numero;\n    }\n  }\n  let candidato = null;\n  for (const numero of data) {\n    if (numero < mayor) {\n      if (candidato === null) {\n        candidato = numero;\n      } else if (numero > candidato) {\n        candidato = numero;\n      }\n    }\n  }\n  return candidato;\n}\n",
    starters: {
      python: "def solve(data):\n    if len(data) == 0:\n        return None\n    mayor = data[0]\n    # Encuentra mayor; después busca el máximo estrictamente menor.\n    return None\n",
      javascript: "function solve(data) {\n  if (data.length === 0) {\n    return null;\n  }\n  let mayor = data[0];\n  // Encuentra mayor; después busca el máximo estrictamente menor.\n  return null;\n}\n",
    },
    hints: ["Primero calcula mayor con un recorrido completo, sin devolver todavía el resultado.", "En otro recorrido, filtra con numero < mayor. Empieza candidato en None o null, no en cero.", "Dentro del filtro, si candidato es ausencia, guarda numero; si no, mejóralo solo cuando numero > candidato. Devuelve candidato fuera de los bucles."],
    explanation: "En el primer recorrido se fija el máximo global. En el segundo solo compiten números menores que él, por lo que todas sus repeticiones quedan excluidas. Con [8, 3, 8, 5], compiten 3 y 5, y gana 5. Con [-5, -1, -3], gana -3; con [1, 0], gana 0. Si no compite ninguno, candidato conserva la ausencia. Son dos recorridos consecutivos, no anidados: tiempo O(n) y espacio auxiliar O(1).",
    tests: [
      { input: [8,3,8,5], expected: 5 }, { input: [2,2], expected: null },
      { input: [], expected: null }, { input: [-5,-1,-3], expected: -3 },
      { input: [1,2], expected: 1 }, { input: [7], expected: null },
      { input: [1,0], expected: 0 }, { input: [0,-2,-2], expected: -2 },
      { input: [5,5,3,3,4], expected: 4 }, { input: [0,0], expected: null },
    ],
  },
};
