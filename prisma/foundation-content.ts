import type { SeedExercise } from "./content";
import type { Json } from "../src/lib/types";

type Lesson = {
  slug: string; title: string; statement: string; explanation: string;
  python: string; javascript: string; starters: { python: string; javascript: string };
  tests: { input: Json; expected: Json }[]; hints: string[];
};
const cases = (inputs: Json[], expected: Json[]) => inputs.map((input, index) => ({ input, expected: expected[index] }));
const lesson = (data: Lesson): SeedExercise => ({
  ...data, category: "Fundamentos", level: "BEGINNER", minutes: 10,
  description: data.statement.split("\n")[0],
  constraints: ["La aplicación llama a solve(data). Devuelve el resultado con return.", "Lee la plantilla antes de editar: conserva su estructura y cambia solo el paso indicado."],
});

export const foundationExercises: SeedExercise[] = [
  lesson({
    slug: "compara-con-cero", title: "¿Es mayor que cero?",
    statement: "Aprende a comparar un número y devolver verdadero o falso.\n\nEl signo > pregunta si el valor de la izquierda es mayor que el de la derecha. Por ejemplo, 3 > 0 es verdadero y -2 > 0 es falso. El resultado de una comparación se llama booleano.\n\nEn Python estos valores se escriben True y False; en JavaScript, true y false. Los ejemplos de la aplicación usan JSON, que los muestra como true y false incluso si programas en Python.\n\nModifica la plantilla para devolver si data es mayor que cero. El cero no es mayor que sí mismo.",
    python: "def solve(data):\n    return data > 0\n", javascript: "function solve(data) {\n  return data > 0;\n}\n",
    starters: { python: "def solve(data):\n    # Compara data con cero usando >.\n    return False\n", javascript: "function solve(data) {\n  // Compara data con cero usando >.\n  return false;\n}\n" },
    hints: ["No tienes que devolver un texto como 'verdadero'.", "La comparación ya produce el booleano que necesitas.", "Devuelve data > 0."],
    explanation: "La comparación produce verdadero solo cuando data supera cero. Devolver directamente esa comparación evita tener que escribir los valores booleanos a mano.",
    tests: cases([3,-2,0,1,-100],[true,false,false,true,false]),
  }),
  lesson({
    slug: "elige-con-una-condicion", title: "Elige con una condición",
    statement: "Usa una condición para elegir entre dos respuestas.\n\nif significa «si»: ejecuta su bloque solo cuando la comparación es verdadera. La plantilla comprueba si data > 0. Dentro de ese bloque debes devolver el texto \"positivo\". Si la condición no se cumple, continúa la siguiente instrucción y devuelve \"no positivo\".\n\nUn texto se escribe entre comillas. No es lo mismo el número 3 que el texto \"3\". Cambia solo el texto \"cambiar\" por \"positivo\" y observa cómo cambia el camino según la entrada. En Python los dos puntos y la sangría delimitan el bloque; en JavaScript lo delimitan las llaves.",
    python: "def solve(data):\n    if data > 0:\n        return 'positivo'\n    return 'no positivo'\n", javascript: "function solve(data) {\n  if (data > 0) {\n    return 'positivo';\n  }\n  return 'no positivo';\n}\n",
    starters: { python: "def solve(data):\n    if data > 0:\n        return 'cambiar'\n    return 'no positivo'\n", javascript: "function solve(data) {\n  if (data > 0) {\n    return 'cambiar';\n  }\n  return 'no positivo';\n}\n" },
    hints: ["La condición ya está escrita.", "Cambia el texto que está dentro del bloque if.", "En el bloque if, devuelve 'positivo'; conserva la otra respuesta."],
    explanation: "Con 3 se entra en el bloque if y se devuelve 'positivo'. Con cero o un negativo se omite ese bloque y se devuelve 'no positivo'. return termina la función: no se ejecutan las instrucciones posteriores.",
    tests: cases([3,-2,0,1,-100],["positivo","no positivo","no positivo","positivo","no positivo"]),
  }),
  lesson({
    slug: "resto-entre-dos", title: "Lo que sobra al repartir",
    statement: "Descubre el resto de dividir entre dos.\n\nEl operador % devuelve lo que sobra al repartir en grupos iguales. Con 7 elementos podemos formar tres parejas y sobra 1: 7 % 2 da 1. Con 8 formamos cuatro parejas y sobra 0: 8 % 2 da 0.\n\nDevuelve el resto de dividir data entre 2. Utiliza %; no necesitas escribir un if. En esta actividad solo recibes enteros no negativos. Después podrás combinar el resto con una comparación para reconocer números pares.",
    python: "def solve(data):\n    return data % 2\n", javascript: "function solve(data) {\n  return data % 2;\n}\n",
    starters: { python: "def solve(data):\n    # Devuelve lo que sobra al dividir data entre 2.\n    return data\n", javascript: "function solve(data) {\n  // Devuelve lo que sobra al dividir data entre 2.\n  return data;\n}\n" },
    hints: ["La respuesta será 0 o 1.", "No uses /: necesitas el operador de resto %.", "Devuelve data % 2."],
    explanation: "Un resto cero indica que podemos formar parejas sin que sobre nada. Este es el concepto que usarás en paridad y, más adelante, en FizzBuzz.",
    tests: cases([7,8,0,1,100],[1,0,0,1,0]),
  }),
  lesson({
    slug: "primer-elemento", title: "El primer elemento de una lista",
    statement: "Aprende a acceder a una posición de una lista.\n\nUna lista agrupa valores en orden: [4, 9, 2] tiene tres elementos. En Python se llama lista y en JavaScript arreglo o array. Las posiciones, también llamadas índices, empiezan en cero: data[0] es 4, data[1] es 9 y data[2] es 2.\n\nDevuelve el primer elemento de la entrada. En esta actividad la lista nunca está vacía. La plantilla devuelve el segundo; cambia su índice por el del primero.",
    python: "def solve(data):\n    return data[0]\n", javascript: "function solve(data) {\n  return data[0];\n}\n",
    starters: { python: "def solve(data):\n    # Cambia el índice para obtener el primer elemento.\n    return data[1]\n", javascript: "function solve(data) {\n  // Cambia el índice para obtener el primer elemento.\n  return data[1];\n}\n" },
    hints: ["Los índices no empiezan en uno.", "La posición inicial tiene índice cero.", "Devuelve data[0]."],
    explanation: "Los corchetes permiten obtener un elemento por su posición. Con índice 0 se obtiene el primero, independientemente de su valor o del tamaño de la lista.",
    tests: cases([[4,9,2],[7,3],[0,5],[-2,8],[100,1]],[4,7,0,-2,100]),
  }),
  lesson({
    slug: "cuenta-los-elementos", title: "Recorre y cuenta",
    statement: "Aprende cómo un bucle repite instrucciones para cada elemento.\n\nUn bucle for recorre una lista. En Python se escribe for elemento in data:; en JavaScript, for (const elemento of data). En cada vuelta, elemento representa el valor que estamos visitando. La lista puede estar vacía: entonces no hay ninguna vuelta.\n\nLa plantilla empieza con contador = 0. Dentro del bucle, cambia la suma + 0 por + 1 para contar una visita por elemento. Después del bucle se devuelve el contador. Con [4, 9, 2] el contador pasa por 0, 1, 2 y 3. La respuesta es 3, no la suma de los valores.",
    python: "def solve(data):\n    contador = 0\n    for elemento in data:\n        contador = contador + 1\n    return contador\n", javascript: "function solve(data) {\n  let contador = 0;\n  for (const elemento of data) {\n    contador = contador + 1;\n  }\n  return contador;\n}\n",
    starters: { python: "def solve(data):\n    contador = 0\n    for elemento in data:\n        contador = contador + 0\n    return contador\n", javascript: "function solve(data) {\n  let contador = 0;\n  for (const elemento of data) {\n    contador = contador + 0;\n  }\n  return contador;\n}\n" },
    hints: ["La instrucción dentro del bucle se ejecuta una vez por elemento.", "Aumenta contador en uno en cada visita.", "Cambia contador + 0 por contador + 1."],
    explanation: "El contador conserva su valor entre vueltas. En JavaScript usamos let porque vamos a actualizarlo; const se usa para nombres que no reasignamos. return queda fuera del bucle para esperar a que termine el recorrido. Una lista vacía devuelve cero.",
    tests: cases([[4,9,2],[],[7],[0,0],[-1,2,3,4]],[3,0,1,2,4]),
  }),
  lesson({
    slug: "construye-una-lista", title: "Construye una lista paso a paso",
    statement: "Guarda resultados en una lista nueva mientras recorres la entrada.\n\nresultado = [] crea una lista vacía. Dentro del bucle, Python usa resultado.append(numero) y JavaScript resultado.push(numero) para añadir un valor al final. Añadir no es lo mismo que reemplazar la lista.\n\nLa plantilla copia cada número de la entrada a la salida. Modifica solo el valor añadido para guardar su doble: numero * 2. Con [1, 3] debes obtener [2, 6]. No cambies return de lugar: se devuelve la lista después del recorrido.",
    python: "def solve(data):\n    resultado = []\n    for numero in data:\n        resultado.append(numero * 2)\n    return resultado\n", javascript: "function solve(data) {\n  const resultado = [];\n  for (const numero of data) {\n    resultado.push(numero * 2);\n  }\n  return resultado;\n}\n",
    starters: { python: "def solve(data):\n    resultado = []\n    for numero in data:\n        resultado.append(numero)\n    return resultado\n", javascript: "function solve(data) {\n  const resultado = [];\n  for (const numero of data) {\n    resultado.push(numero);\n  }\n  return resultado;\n}\n" },
    hints: ["La estructura para recorrer y añadir ya está escrita.", "Multiplica el valor añadido, no toda la lista.", "Añade numero * 2 usando append en Python o push en JavaScript."],
    explanation: "Cada vuelta calcula un doble y lo añade a la salida. El orden se conserva. Con una entrada vacía no se añade nada y se devuelve []. En JavaScript const permite modificar el contenido de la lista; lo que no permite es reasignar ese nombre a otra lista.",
    tests: cases([[1,3],[],[0],[-2,4],[1,2,3]],[[2,6],[],[0],[-4,8],[2,4,6]]),
  }),
];
