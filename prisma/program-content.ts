import type { SeedExercise } from "./content";

// Apertura de «Desde cero» en modo programa: se escribe un programa completo y
// se corrige lo que imprime por la pantalla. Es el puente más corto hacia el
// modelo de la ruta: primero imprimir, después devolver valores con solve.
type Definition = {
  slug: string; title: string; description: string; minutes: number; activityType: SeedExercise["activityType"];
  statement: string; hints: [string, string, string]; constraints: string[];
  python: string; javascript: string; starters: { python: string; javascript: string };
  explanation: string; pythonNote: string; javascriptNote: string;
  goals: string[]; previous: string[]; knowledge: string[];
  tests: [string, string][]; commonErrors?: string[];
};

function program(d: Definition): SeedExercise {
  return {
    slug: d.slug, title: d.title, description: d.description, category: "Fundamentos", level: "BEGINNER", minutes: d.minutes,
    statement: d.statement, constraints: d.constraints, hints: d.hints,
    python: d.python, javascript: d.javascript, starters: d.starters,
    explanation: d.explanation,
    explanations: { python: `${d.explanation}\n\nEn Python\n${d.pythonNote}`, javascript: `${d.explanation}\n\nEn JavaScript\n${d.javascriptNote}` },
    objective: d.goals[0], practiceGoals: d.goals, prerequisites: d.knowledge, prerequisiteSlugs: d.previous,
    activityType: d.activityType, runtimeMode: "PROGRAM", commonErrors: d.commonErrors ?? [],
    tests: d.tests.map(([input, expected]) => ({ input, expected })),
  };
}

export const programExercises: SeedExercise[] = [
  program({
    slug: "imprime-un-saludo", title: "Tu primer programa", description: "Escribe un programa que muestre un saludo por la pantalla.",
    minutes: 5, activityType: "GUIDED",
    statement: "Vas a escribir tu primer programa completo. Un programa puede mostrar texto en la pantalla con una instrucción que se llama print en Python y console.log en JavaScript.\n\nEscribe esa instrucción con el texto Hola, mundo! entre comillas. Después pulsa Ejecutar ejemplos para ver la salida y Comprobar solución para guardar este paso.\n\nEntrada\nninguna\n\nResultado esperado\nHola, mundo!",
    hints: ["El programa se resuelve con una sola instrucción.", "El texto que quieres mostrar va entre comillas: \"Hola, mundo!\".", "En Python la instrucción es print(...). En JavaScript es console.log(...)."],
    constraints: ["Escribe un programa completo; no hace falta crear ninguna función.", "Escribe el texto entre comillas dobles.", "Escribe la salida exactamente como se pide."],
    python: "print(\"Hola, mundo!\")\n", javascript: "console.log(\"Hola, mundo!\");\n",
    starters: { python: "# Escribe tu primer programa aquí.\n", javascript: "// Escribe tu primer programa aquí.\n" },
    explanation: "print (Python) y console.log (JavaScript) escriben en la salida lo que aparece entre paréntesis. La aplicación lee esa salida y la compara con el resultado esperado.",
    pythonNote: "print(\"Hola, mundo!\") muestra el texto y añade un salto de línea al final.",
    javascriptNote: "console.log(\"Hola, mundo!\"); muestra el texto y añade un salto de línea. No olvides el punto y coma.",
    goals: ["Mostrar texto por la pantalla con print o console.log.", "Distinguir el texto entre comillas de la instrucción que lo muestra."],
    previous: [], knowledge: [],
    tests: [["", "Hola, mundo!\n"], ["", "Hola, mundo!\n"], ["", "Hola, mundo!\n"]],
    commonErrors: ["Escribir el texto sin comillas.", "Usar print en JavaScript o console.log en Python.", "Dejar un paréntesis sin cerrar."],
  }),
  program({
    slug: "imprime-un-resultado", title: "Muestra un cálculo", description: "Escribe un programa que calcule y muestre el resultado de una suma.",
    minutes: 6, activityType: "GUIDED",
    statement: "Print no solo muestra texto: también puede mostrar el resultado de una operación. El signo + suma dos números.\n\nEscribe dentro de print (o console.log) la suma 7 + 5, sin comillas. El programa debe mostrar el resultado de esa suma.\n\nEntrada\nninguna\n\nResultado esperado\n12",
    hints: ["No escribas el número 12 directamente: escribe la suma.", "La suma va sin comillas: 7 + 5.", "Muestra el cálculo con print(7 + 5) en Python o console.log(7 + 5) en JavaScript."],
    constraints: ["Escribe un programa completo.", "Deja la operación entre paréntesis, sin comillas.", "No escribas el resultado a mano."],
    python: "print(7 + 5)\n", javascript: "console.log(7 + 5);\n",
    starters: { python: "# Muestra el resultado de sumar 7 y 5.\n", javascript: "// Muestra el resultado de sumar 7 y 5.\n" },
    explanation: "Dentro de print la operación se calcula primero y el programa muestra su resultado. Sumar 7 y 5 da 12, así que la salida es 12.",
    pythonNote: "print(7 + 5) calcula la suma y muestra 12. Sin comillas; si escribes \"7 + 5\" se mostraría el texto tal cual.",
    javascriptNote: "console.log(7 + 5); calcula la suma y muestra 12. Las comillas convertirían la operación en texto.",
    goals: ["Mostrar el resultado de una operación en la pantalla.", "Comprobar que el programa muestra el valor calculado, no el número escrito a mano."],
    previous: ["imprime-un-saludo"], knowledge: ["Saber mostrar texto con print o console.log."],
    tests: [["", "12\n"], ["", "12\n"], ["", "12\n"]],
    commonErrors: ["Escribir las comillas alrededor de la suma.", "Escribir el resultado 12 en lugar de la operación.", "Olvidar la instrucción print o console.log."],
  }),
  program({
    slug: "imprime-dos-lineas", title: "Dos líneas", description: "Escribe un programa que muestre dos textos en líneas distintas.",
    minutes: 7, activityType: "PRACTICE",
    statement: "Cada instrucción de impresión muestra su texto y termina la línea. Para mostrar dos textos en líneas distintas, usa dos instrucciones.\n\nEl programa debe mostrar primero la palabra Primera y después la palabra Segunda, cada una en su propia línea.\n\nEntrada\nninguna\n\nResultado esperado\nPrimera\nSegunda",
    hints: ["Necesitas dos instrucciones, una por cada línea.", "Cada texto va entre comillas: \"Primera\" y \"Segunda\".", "El orden importa: primero Primera y después Segunda."],
    constraints: ["Escribe un programa completo.", "Usa una instrucción por línea de salida.", "Respeta el orden y las mayúsculas."],
    python: "print(\"Primera\")\nprint(\"Segunda\")\n", javascript: "console.log(\"Primera\");\nconsole.log(\"Segunda\");\n",
    starters: { python: "# Muestra Primera y Segunda en dos líneas.\n", javascript: "// Muestra Primera y Segunda en dos líneas.\n" },
    explanation: "Cada print o console.log muestra su texto y salta a la línea siguiente. Con dos instrucciones seguidas la salida tiene dos líneas, en el mismo orden en que aparecen.",
    pythonNote: "Dos llamadas seguidas a print producen dos líneas, en orden.",
    javascriptNote: "Dos llamadas seguidas a console.log producen dos líneas, en orden.",
    goals: ["Encadenar varias instrucciones para producir una salida de varias líneas.", "Cuidar el orden de las instrucciones."],
    previous: ["imprime-un-resultado"], knowledge: ["Mostrar texto y resultados con print o console.log."],
    tests: [["", "Primera\nSegunda\n"], ["", "Primera\nSegunda\n"], ["", "Primera\nSegunda\n"]],
    commonErrors: ["Escribir los dos textos en una sola instrucción.", "Invertir el orden de las líneas.", "Olvidar las comillas en alguno de los textos."],
  }),
  program({
    slug: "lee-y-saluda", title: "Lee un dato", description: "Lee un nombre de la entrada y muestra un saludo.",
    minutes: 9, activityType: "PRACTICE",
    statement: "Un programa puede leer datos de la entrada. En Python se leen con input(); en JavaScript, con una función que lee la entrada estándar.\n\nLa entrada contiene un nombre en una línea. El programa debe mostrar un saludo con ese nombre, exactamente Hola, seguido del nombre. Por ejemplo, si la entrada es Ana, la salida debe ser Hola, Ana.\n\nLa plantilla ya lee el nombre y lo guarda en una variable llamada nombre. Completa el programa para mostrar el saludo.\n\nEntrada\nAna\n\nResultado esperado\nHola, Ana",
    hints: ["La plantilla ya guarda el nombre leído en la variable nombre.", "El signo + une el texto \"Hola, \" con el nombre.", "Muestra el saludo con print(\"Hola, \" + nombre) en Python o console.log(\"Hola, \" + nombre) en JavaScript."],
    constraints: ["Escribe un programa completo.", "Usa la variable nombre que ya crea la plantilla.", "Cuidado con el espacio después de la coma en el saludo."],
    python: "nombre = input()\nprint(\"Hola, \" + nombre)\n",
    javascript: "const nombre = require('fs').readFileSync(0, 'utf8').trim();\nconsole.log(\"Hola, \" + nombre);\n",
    starters: {
      python: "# Lee un nombre y saluda con Hola y el nombre.\nnombre = input()\n",
      javascript: "// Lee un nombre y saluda con Hola y el nombre.\nconst nombre = require('fs').readFileSync(0, 'utf8').trim();\n",
    },
    explanation: "El programa lee el nombre de la entrada y lo guarda en la variable nombre. Después une el texto \"Hola, \" con el nombre y muestra el resultado. El mismo programa produce un saludo distinto para cada entrada.",
    pythonNote: "input() lee una línea de la entrada y la devuelve como texto. El operador + une dos textos: \"Hola, \" + nombre.",
    javascriptNote: "readFileSync(0, 'utf8') lee toda la entrada; trim() quita el salto de línea final. El operador + une dos textos.",
    goals: ["Leer un dato de la entrada del programa.", "Construir una salida a partir de un dato leído."],
    previous: ["imprime-dos-lineas"], knowledge: ["Mostrar texto por la pantalla."],
    tests: [["Ana\n", "Hola, Ana\n"], ["Luis\n", "Hola, Luis\n"], ["Mundo\n", "Hola, Mundo\n"]],
    commonErrors: ["Olvidar el espacio después de la coma en el saludo.", "Sumar el nombre como si fuera un número.", "No usar la variable que guarda el nombre leído."],
  }),
];
