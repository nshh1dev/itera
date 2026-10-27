import type { SeedExercise } from "./content";
import type { Json, Language } from "../src/lib/types";
import type { ConceptRule } from "../src/lib/concept-validation";

// Revisiones del catálogo actual. Las fuentes históricas no se reescriben.
const statements: Record<string, string> = {
  saludo: 'Escribe una instrucción que muestre el saludo "Hola, mundo!" en la pantalla. El saludo debe ocupar una sola línea, con la coma, el espacio y el signo de exclamación que ves en la salida esperada.\n\nNo necesitas introducir ningún dato. Escribe el texto entre comillas dentro de la instrucción que lo muestra; las comillas no deben aparecer en la salida.',
  "dos-lineas": "Muestra Primera y Segunda, en ese orden y en líneas distintas.",
  "orden-mensaje": "La plantilla muestra las instrucciones de una receta en un orden incorrecto. Reorganízalas para mostrar Preparar, Mezclar y Servir, cada palabra en una línea.",
  "texto-calculo": "Muestra el resultado de sumar 4 y 6 en la primera línea. En la segunda, muestra el texto 4 + 6 sin calcularlo. Utiliza una expresión numérica para la suma y comillas para el texto.",
  "guarda-nombre": "Guarda el texto Ada en una variable y muestra su valor. Utiliza la variable al mostrarlo, no escribas de nuevo el texto.",
  "guarda-cantidad": "La plantilla guarda 8 en puntos, pero muestra la palabra puntos. Corrige la impresión para mostrar el valor de la variable.",
  "actualiza-puntos": "El código empieza guardando 8 puntos en la variable puntos. Después has ganado 3 puntos más, pero la siguiente instrucción reemplaza tu puntuación en lugar de aumentarla.\n\nCorrige esa actualización para sumar los 3 puntos nuevos a los que ya tenías. Después muestra el valor de puntos: debe ser 11. Utiliza la variable para hacer la suma, en lugar de escribir directamente el resultado.",
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
  "elige-mensaje": 'La función recibe un número entero en data y debe responder con uno de estos textos:\n\n- "positivo" cuando el número sea mayor que 0.\n- "no positivo" cuando sea 0 o negativo.\n\nEl código ya comprueba si el número es mayor que 0, pero el texto que devuelve en ese caso está equivocado. Corrige esa respuesta y conserva la respuesta para los demás números. Usa return para entregar el texto, no para mostrarlo en pantalla.',
  signo: 'Recibes un entero. Devuelve "positivo", "negativo" o "cero", según su valor. La plantilla ya distingue las dos primeras posibilidades. Completa la respuesta del último caso.',
  "uno-n": "Recibes un entero no negativo en data. Devuelve la lista de números desde 1 hasta data, incluido. Para cero devuelve []. La plantilla ya recorre ese intervalo, pero añade siempre cero. Corrige el valor que añade a la lista.",
  indices: "Recibes una lista. Devuelve una copia con los mismos valores y en el mismo orden. La plantilla recorre sus posiciones, pero copia siempre el primer elemento. Corrige el acceso para copiar el elemento de la posición actual. La lista vacía devuelve [].",
  "suma-lista": "Recibes una lista de números. Devuelve la suma de sus elementos, o cero si está vacía. La plantilla prepara el total y su devolución; completa el recorrido que acumula los valores.",
  maximo: "Recibes una lista de entre 1 y 100 enteros. Devuelve su valor máximo. La plantilla ya guarda un candidato y recorre la lista, pero compara al revés. Corrige esa comparación. Los números pueden ser negativos y el máximo puede repetirse.",
  minusculas: "Recibes un texto. Devuélvelo en minúsculas, conservando espacios, números y signos. La plantilla devuelve el texto original: añade la operación de conversión de tu lenguaje.",
  vocales: "Recibes un texto. Devuelve cuántas vocales contiene: a, e, i, o, u, en mayúsculas o minúsculas. No cuentes vocales acentuadas. La plantilla ya prepara la conversión a minúsculas y el contador; completa el recorrido y su condición.",
  frecuencias: "Recibes un texto formado por letras de a a z. Devuelve una ficha con la cantidad de apariciones de cada letra presente. El orden de las propiedades no importa. Para el texto vacío devuelve {}. La plantilla prepara la ficha: completa el recorrido y la actualización de los contadores.",
  anagramas: "Recibes dos textos, a y b, formados por letras ASCII y espacios. Devuelve verdadero si contienen las mismas letras con las mismas cantidades, aunque estén en distinto orden. Ignora mayúsculas y espacios normales. La plantilla prepara dos tablas con las 26 letras: completa el conteo y la comparación. Un texto vacío y otro de espacios sí cumplen la condición.",
  fizzbuzz: 'Recibes un entero n. Construye una lista con los números desde 1 hasta n, incluidos. Sustituye cada múltiplo de 3 por "Fizz", cada múltiplo de 5 por "Buzz" y los múltiplos de ambos por "FizzBuzz". Conserva los demás como números. Para cero, devuelve una lista vacía.\n\nLa plantilla ya recorre los números. Dentro del bucle, decide qué valor añadir. Comprueba primero si cumple ambas condiciones: 15 debe producir "FizzBuzz", no solo "Fizz". Devuelve la lista cuando termine el recorrido.',
  altura: "Recibes un árbol binario o ausencia si está vacío. Cada nodo tiene v, su valor, e izq y der, sus hijos o ausencia. Devuelve su altura contando nodos, no aristas: el árbol vacío tiene altura cero, una hoja tiene altura uno y cada nodo añade uno a la mayor altura de sus hijos. Usa los nombres v, izq y der de esta entrada; no value, left y right de otros retos.",
  preorden: "Recibes un árbol binario o ausencia si está vacío. Cada nodo tiene v, su valor, e izq y der, sus hijos o ausencia. Devuelve una lista de valores en preorden: primero v, después todos los del subárbol izq y finalmente los del subárbol der. El árbol vacío devuelve [].",
  niveles: "Recibes un árbol binario o ausencia si está vacío. Cada nodo tiene v, su valor, e izq y der, sus hijos o ausencia. Devuelve una lista de valores por niveles, empezando por la raíz y de izquierda a derecha en cada nivel. Una cola permite visitar antes los nodos descubiertos antes. El árbol vacío devuelve [].",
  "arbol-busqueda": "Recibes un árbol binario con valores distintos o ausencia si está vacío. Cada nodo tiene v, su valor, e izq y der, sus hijos o ausencia. Devuelve un booleano: todos los valores del subárbol izquierdo deben ser estrictamente menores que v y todos los del derecho, estrictamente mayores. Comprueba los límites heredados de todos los antecesores, no solo los hijos inmediatos. El árbol vacío cumple la propiedad.",
  permutaciones: "Recibes hasta 8 enteros distintos en orden ascendente. Devuelve todas sus permutaciones: cada una utiliza todos los elementos exactamente una vez. Ordena las permutaciones lexicográficamente por sus valores numéricos: compara el primer elemento diferente, no los números convertidos a texto. Por ejemplo, [2, 10] va antes de [10, 2]. Para una entrada vacía devuelve [[]].",
  distancias: "Recibes n, aristas e inicio de un grafo no dirigido y sin pesos. Los nodos están numerados de 0 a n - 1; cada par [a, b] conecta ambos sentidos. Devuelve una lista de longitud n: en la posición i, la mínima cantidad de aristas desde inicio hasta i, o -1 si no se alcanza. La distancia de inicio a sí mismo es cero. Recorre por niveles y marca cada nodo al descubrirlo.",
  dijkstra: "Recibes n, aristas y destino de un grafo no dirigido. Los nodos están numerados de 0 a n - 1 y cada arista [a, b, peso] conecta ambos sentidos con un peso positivo. Devuelve el menor coste desde el nodo 0 hasta destino, o -1 si no se puede llegar. Si destino es 0, devuelve cero. A diferencia de contar aristas, debes sumar sus pesos; Dijkstra elige el nodo pendiente con menor distancia conocida.",
  laberinto: "Recibes una cuadrícula rectangular no vacía: 0 indica una celda libre y 1 un muro. Devuelve el mínimo número de movimientos desde la esquina superior izquierda a la inferior derecha, avanzando arriba, abajo, izquierda o derecha; no se permiten diagonales ni atravesar muros. Devuelve -1 si no hay camino o alguna esquina es un muro. La celda inicial cuenta como cero movimientos: una única celda libre devuelve cero.",
  factorial: "Recibes un entero n entre 0 y 15. Devuelve su factorial: el producto de los enteros desde 1 hasta n. Por ejemplo, para 4 el cálculo es 1 * 2 * 3 * 4 = 24. El factorial de cero se define como 1.\n\nLa plantilla prepara producto = 1. Añade un recorrido desde 1 hasta el número recibido, incluido, y multiplica el acumulador por cada valor. Devuelve producto después del bucle. Con cero no hay vueltas y se conserva el valor inicial.",
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

const openingHelp: Record<string, Partial<SeedExercise>> = {
  "arbol-busqueda": {
    explanation: "Cada nodo debe respetar el rango impuesto por todos sus antecesores. Al bajar a izq, el valor actual pasa a ser el límite superior; al bajar a der, pasa a ser el inferior. Los límites son estrictos. Un nodo ausente cumple la propiedad. Comparar solo con los hijos inmediatos no detecta una infracción más profunda. Se visita cada nodo como máximo una vez: tiempo O(n) y memoria O(h) para las llamadas, con h la altura.",
  },
  alcanzables: {
    complexity: "Tiempo O(n + m + r log r), con n nodos, m aristas y r nodos alcanzables; la ordenación final también cuenta. Memoria O(n + m) para el grafo y el recorrido.",
    explanation: "Crea las conexiones en ambos sentidos y comienza con inicio marcado. Una pila guarda los nodos pendientes; marca cada vecino al descubrirlo para no añadirlo varias veces. Al terminar, ordena numéricamente los nodos alcanzables, incluido inicio. El recorrido cuesta O(n + m); ordenar los r alcanzables añade O(r log r). La memoria total, incluidas las conexiones, es O(n + m).",
  },
  permutaciones: {
    complexity: "Tiempo O(n × n!) y memoria O(n × n!) para la salida. La referencia además mantiene O(n²) de copias de candidatos a lo largo de una rama, con O(n) llamadas.",
    explanation: "Elige cada candidato disponible en orden numérico, añádelo a la combinación actual y explora con los restantes. Si no quedan candidatos, guarda una copia de la combinación. Después retira la última elección antes de probar otra. Como la entrada está ordenada, las respuestas salen en orden lexicográfico numérico. Para vacío se guarda la combinación vacía. Construir la salida cuesta O(n × n!) en tiempo y memoria; las copias de candidatos de una rama añaden O(n²) de memoria auxiliar.",
  },
  dijkstra: {
    complexity: "Tiempo O(n² + m) con selección lineal; memoria O(n + m) para distancias y conexiones. n es el número de nodos y m el de aristas.",
    explanations: {
      python: "Inicializa las distancias con float('inf') y la del nodo 0 con cero. Selecciona el nodo no fijado con menor distancia; si su distancia es infinita, el resto es inalcanzable. Fíjalo y mejora la distancia de cada vecino cuando pasar por él sea más barato. Los pesos positivos permiten dar su distancia por definitiva. Devuelve -1 si destino sigue infinito. La referencia busca el mínimo recorriendo los nodos, sin montículo: O(n² + m) en tiempo y O(n + m) en memoria.",
      javascript: "Inicializa las distancias con Infinity y la del nodo 0 con cero. Selecciona el nodo no fijado con menor distancia; si es Infinity, el resto es inalcanzable. Fíjalo y mejora cada vecino cuando distancia actual más peso sea menor. Los pesos positivos permiten fijar esa distancia definitivamente. Devuelve -1 si destino sigue en Infinity. Esta referencia selecciona el mínimo recorriendo los nodos, sin montículo: O(n² + m) en tiempo y O(n + m) en memoria.",
      typescript: "Inicializa una lista de distancias numéricas con Infinity y la del nodo 0 con cero. Selecciona el nodo no fijado con menor distancia, fíjalo y mejora las distancias vecinas si pasar por él abarata el coste. Detente si no quedan nodos alcanzables. Devuelve -1 cuando destino siga en Infinity. Los pesos positivos justifican fijar cada mínimo. La selección lineal de esta referencia cuesta O(n² + m) en tiempo; distancias y conexiones ocupan O(n + m).",
    },
  },
  "guarda-cantidad": {
    explanation: "La asignación guarda 8 en puntos. Mostrar puntos consulta ese valor; mostrar el texto entre comillas escribe la palabra puntos. Conserva la variable y úsala al mostrar el resultado: además de la salida, esta práctica comprueba el concepto de utilizar una variable.",
  },
  "valida-divisor": {
    hints: ["Comprueba el divisor antes de operar.", "Cero en total sí es válido.", "Devuelve ausencia solo cuando divisor vale cero; consulta su representación en la explicación de tu lenguaje."],
  },
  "valido-cero-ausente": {
    hints: ["No uses una comprobación genérica de falsedad.", "Comprueba primero si falta la cantidad.", "Después rechaza los negativos y acepta cero y positivos."],
  },
  "captura-conversion": {
    statement: "Recibes un texto que puede representar un entero decimal o contener una palabra no numérica. Devuelve el entero si la conversión es válida, o ausencia en caso contrario. El texto puede tener signo y espacios exteriores. Rechaza el texto vacío antes de convertir. Define una auxiliar que convierta o lance un error y captura ese error esperado desde solve.",
    hints: ["Limpia los espacios exteriores y rechaza el texto vacío.", "La auxiliar debe lanzar un error si el texto no representa un entero.", "Captura únicamente el error esperado y devuelve ausencia; consulta la sintaxis de tu lenguaje en la explicación."],
  },
  "error-dominio": {
    statement: "Recibes una edad entera. Define validar(edad): si la edad es negativa, debe lanzar un error con el mensaje edad negativa. Desde solve, llama a esa función y captura ese error para devolver su mensaje. Para una edad igual o mayor que cero, devuelve aceptada.",
    explanations: {
      python: "validar lanza ValueError('edad negativa') con raise cuando la edad es menor que cero. solve llama a validar dentro de try y devuelve 'aceptada' si no hay error. except ValueError as error trata el rechazo y devuelve str(error).",
      javascript: "validar lanza new Error('edad negativa') con throw. solve llama a validar dentro de try y devuelve 'aceptada' si no hay error. En catch, comprueba error instanceof Error antes de devolver error.message; vuelve a lanzar los errores que no puedas tratar.",
      typescript: "validar(edad: number): void lanza new Error('edad negativa') cuando la edad es negativa. En catch, error tiene tipo unknown: comprueba error instanceof Error antes de leer message. Si validar no lanza, devuelve 'aceptada'.",
    },
  },
  "ordena-registros": {
    hints: ["Un criterio puede empatar y necesitar otro.", "Ordena primero por puntos de mayor a menor; en empate, por nombre de menor a mayor.", "Conserva el orden original cuando ambos campos coincidan; no utilices el nombre para decidir antes de comparar los puntos."],
  },
  "monticulo-inserta": {
    statements: {
      python: "Recibes heap, un montículo mínimo válido con hasta 100 enteros, y value. Añade value al final y asciéndelo: mientras sea estrictamente menor que su padre, intercambia ambos valores. Devuelve la lista resultante. Para el índice i, el padre está en (i - 1) // 2. Detente al llegar a la raíz o cuando el padre sea menor o igual; no intercambies valores iguales.",
      javascript: "Recibes heap, un montículo mínimo válido con hasta 100 enteros, y value. Añade value al final y asciéndelo: mientras sea estrictamente menor que su padre, intercambia ambos valores. Devuelve la lista resultante. Para el índice i, el padre está en Math.floor((i - 1) / 2). Detente al llegar a la raíz o cuando el padre sea menor o igual; no intercambies valores iguales.",
      typescript: "Recibes heap, un montículo mínimo válido con hasta 100 enteros, y value. Añade value al final y asciéndelo: mientras sea estrictamente menor que su padre, intercambia ambos valores. Devuelve la lista resultante. Para el índice i, el padre está en Math.floor((i - 1) / 2). Detente al llegar a la raíz o cuando el padre sea menor o igual; no intercambies valores iguales.",
    },
  },
  deduplica: {
    explanation: "El conjunto recuerda qué valores has encontrado y la lista conserva su primera aparición. Solo añades un número al resultado cuando todavía no estaba en el conjunto. Con [3, 1, 3], la salida pasa por [3], [3, 1] y se mantiene en [3, 1]. El coste esperado es O(n) en tiempo y espacio; no necesitas ordenar ni recorrer el conjunto para construir la respuesta.",
    hints: ["Recorre los valores en el orden recibido.", "Usa el conjunto preparado para recordar qué números ya has añadido.", "Añade un número al resultado solo la primera vez que aparezca; no ordenes la lista."],
  },
  "dos-requisitos": {
    hints: ["No basta con que se cumpla una sola condición.", "Ambas comparaciones ya están guardadas en variables.", "Combina los dos booleanos con la conjunción lógica del lenguaje seleccionado."],
  },
  "copia-plana": {
    objective: "Crear una copia independiente de una lista plana.",
    practiceGoals: ["Copiar una lista de números antes de modificarla.", "Conservar la lista original sin el elemento nuevo."],
    hints: ["Un alias no es una copia independiente.", "Copia el contenedor antes de añadir.", "Añade nuevo únicamente a copia y devuelve ambas listas."],
    statements: {
      python: "Recibes valores, una lista de enteros, y nuevo, otro entero. Copia valores con list(valores), añade nuevo al final de la copia y devuelve {original, copia}. original conserva los valores recibidos sin el elemento nuevo. La copia debe ser una lista independiente, también cuando la entrada esté vacía.",
      javascript: "Recibes valores, una lista de enteros, y nuevo, otro entero. Copia valores con valores.slice(), añade nuevo al final de la copia y devuelve {original, copia}. original conserva los valores recibidos sin el elemento nuevo. La copia debe ser una lista independiente, también cuando la entrada esté vacía.",
      typescript: "Recibes valores, una lista de enteros, y nuevo, otro entero. Copia valores con valores.slice(), añade nuevo al final de la copia y devuelve {original, copia}. Ambas propiedades contienen number[], pero deben apuntar a listas independientes. original conserva los valores recibidos sin el elemento nuevo.",
    },
  },
  "asercion-normal": {
    objective: "Comprobar el resultado de una función mediante una aserción.",
    practiceGoals: ["Escribir una aserción para el caso conocido 4 → 12.", "Devolver el triple del dato recibido después de esa comprobación."],
    statement: "Recibes un entero y debes devolver su triple. Define una función auxiliar triple(n) que multiplique por tres. Dentro de solve, antes de atender data, escribe una aserción que compruebe el caso conocido triple(4) igual a 12. Después devuelve triple(data). Una aserción que falla interrumpe el programa; no basta con imprimir un mensaje de aprobado.",
    explanations: {
      python: "Define triple(n) para devolver n * 3. assert triple(4) == 12 comprueba un resultado conocido antes de devolver triple(data). Si la condición no se cumple, lanza AssertionError: te ayuda a localizar un fallo. La aserción no concede progreso por sí misma.",
      javascript: "Obtén assert con require('node:assert/strict') y define triple(n) para devolver n * 3. assert.equal(triple(4), 12) comprueba el caso conocido antes de devolver triple(data). Una aserción que falla lanza un error; no concede progreso por sí misma.",
      typescript: "Obtén assert con require('node:assert/strict') y define triple(n: number): number. assert.equal(triple(4), 12) comprueba el cálculo durante la ejecución: los tipos no garantizan que multipliques correctamente. Después devuelve triple(data).",
    },
  },
  "uno-n": {
    hints: ["numero cambia automáticamente en cada vuelta.", "Añade el número de la vuelta actual, no siempre cero.", "Conserva la operación de añadir de la plantilla y sustituye su argumento por numero."],
  },
  "longitud-texto": {
    hints: ["No necesitas recorrer ni modificar el texto.", "Los espacios también cuentan como caracteres.", "Devuelve la longitud del texto recibido, no un número escrito de antemano."],
  },
  minusculas: {
    hints: ["La plantilla devuelve el texto sin convertirlo.", "La operación de conversión devuelve otro texto; conserva sus paréntesis.", "Devuelve el texto convertido, no el original."],
  },
  vocales: {
    hints: ["No cuentes todas las letras: primero comprueba si son vocales.", "Comprueba si la letra actual aparece en el texto aeiou.", "Dentro de esa condición, suma uno al contador; devuélvelo después del recorrido."],
  },
  factorial: {
    hints: ["No empieces el producto en cero: cualquier número multiplicado por cero da cero.", "Recorre desde uno hasta el número recibido, incluido.", "En cada vuelta multiplica el producto anterior por el número actual. Devuelve el producto al terminar el bucle."],
    explanation: "El acumulador empieza en uno. Para n = 4, después de multiplicar por 1, 2, 3 y 4 pasa por 1, 2, 6 y 24. Si n es cero no hay vueltas y conserva uno. No necesitas recursividad: combina un recorrido numérico con multiplicaciones y devuelve el resultado cuando termine.",
  },
  opcional: {
    hints: ["Una propiedad puede no estar presente.", "Conserva cero: no es lo mismo que ausencia.", "Consulta cantidad y utiliza uno como respaldo solo cuando falte esa propiedad."],
    explanations: {
      python: "data.get('cantidad', 1) consulta la cantidad y devuelve 1 solo si falta la clave. Si la cantidad es cero, conserva cero: no hace una comprobación genérica de falsedad.",
      javascript: "data.cantidad ?? 1 consulta la cantidad y usa 1 cuando la propiedad está ausente. A diferencia de ||, ?? conserva cero. El contrato garantiza que la propiedad nunca contiene null.",
      typescript: "El tipo { cantidad?: number } permite omitir cantidad. data.cantidad ?? 1 entrega la cantidad presente o el respaldo 1; conserva cero. El operador comprueba ausencia, no falsedad.",
    },
  },
  ausencia: {
    explanations: {
      python: "Comprueba data is None antes de sumar. En ese caso devuelve -1; en los demás devuelve data + 1. No uses una comprobación de falsedad: perderías el cero válido.",
      javascript: "Comprueba data === null antes de sumar. En ese caso devuelve -1; en los demás devuelve data + 1. No uses !data: cero es un número válido, no ausencia.",
      typescript: "Comprueba data === null y devuelve -1 en esa rama. En la restante, el tipo number | null se estrecha a number y puedes devolver data + 1. La comprobación conserva el cero válido.",
    },
  },
  "ficha-producto": {
    explanations: {
      python: "data es un diccionario con nombre y precio. data['precio'] consulta el valor asociado a esa clave. Devuelve ese número con return, no la ficha completa ni el texto 'precio'.",
      javascript: "data es un objeto con nombre y precio. data.precio consulta la propiedad solicitada. Devuelve ese número con return, no el objeto completo ni el texto 'precio'.",
      typescript: "El contrato declara nombre como texto y precio como número. data.precio consulta la propiedad y conserva su tipo numérico. Devuelve ese valor con return, no el objeto completo.",
    },
  },
  dependencias: {
    explanations: {
      python: "Cuenta cuántos requisitos pendientes tiene cada tarea. Usa heapq para elegir la menor tarea disponible; al completarla, reduce los contadores de las que dependían de ella. Si no puedes completar las n tareas, hay un ciclo y devuelves [].",
      javascript: "Cuenta los requisitos pendientes de cada tarea. Ordena numéricamente las tareas disponibles y elige la menor; al completarla, reduce los contadores de las dependientes. Si no completas las n tareas, hay un ciclo y devuelves []. Para este límite, la referencia ordena la lista en cada paso.",
      typescript: "Guarda los requisitos pendientes en una lista de contadores y las dependencias en listas de vecinos. Ordena numéricamente las tareas disponibles y elige la menor. Reduce los contadores de las dependientes; si el resultado no contiene las n tareas, devuelve [] porque existe un ciclo.",
    },
  },
  "dos-lineas": {
    prerequisites: ["Mostrar un texto por la pantalla."],
    explanation: "Cada instrucción muestra su texto y termina la línea. El orden del código determina el orden de la salida: primero Primera y después Segunda.",
    explanations: {
      python: 'print("Primera") muestra la primera palabra y termina la línea. Después print("Segunda") muestra la segunda palabra en otra línea. Las instrucciones se ejecutan de arriba abajo.',
      javascript: 'console.log("Primera"); muestra la primera palabra y termina la línea. Después console.log("Segunda"); muestra la segunda palabra en otra línea. El orden de las instrucciones determina el de la salida.',
      typescript: 'console.log("Primera"); muestra la primera palabra y termina la línea. Después console.log("Segunda"); muestra la segunda palabra en otra línea. No necesitas una función: escribe ambas instrucciones de arriba abajo.',
    },
  },
  "lee-nombre": {
    hints: ["La plantilla ya guarda el texto recibido en nombre.", 'Une el texto "Hola, " con nombre. Conserva el espacio después de la coma.', "Muestra el texto que has construido, no la palabra nombre entre comillas."],
  },
  "lee-doble": {
    hints: ["La lectura y la conversión a número ya están preparadas.", "El doble se obtiene multiplicando numero por 2.", "Muestra el resultado de esa operación; no cambies la lectura de la entrada."],
  },
  booleano: {
    hints: ["Solo necesitas cambiar el valor asignado a listo.", "Un booleano se escribe sin comillas; no es un texto.", "Consulta el valor verdadero en la teoría del lenguaje seleccionado y conserva la impresión de la plantilla."],
  },
  igualdad: {
    hints: ["Los dos números ya están disponibles en la plantilla.", "Necesitas una comparación que produzca un booleano, no una asignación.", "Utiliza la comparación de igualdad del lenguaje seleccionado y conserva el formato de salida preparado."],
  },
  saludo: {
    objective: "Mostrar un texto por la pantalla.",
    practiceGoals: ["Mostrar un texto por la pantalla.", "Distinguir el texto entre comillas de la instrucción que lo muestra."],
    hints: ["Necesitas una instrucción que muestre texto.", 'Escribe "Hola, mundo!" entre los paréntesis de esa instrucción.', "Conserva las comillas alrededor del saludo y cierra los paréntesis."],
    commonErrors: ["Escribir el saludo sin comillas.", "Dejar un paréntesis sin cerrar.", "Cambiar una letra o un signo del saludo."],
    explanation: "La instrucción muestra el texto que recibe entre paréntesis y termina la línea. Las comillas indican dónde empieza y acaba el texto; no forman parte de la salida.",
    explanations: {
      python: 'print("Hola, mundo!") muestra el saludo y termina la línea. print es la instrucción; el saludo es el texto entre comillas. Las comillas no aparecen en la salida.',
      javascript: 'console.log("Hola, mundo!"); muestra el saludo y termina la línea. El texto va entre comillas dentro de los paréntesis. Las comillas no aparecen en la salida.',
      typescript: 'console.log("Hola, mundo!"); muestra el saludo y termina la línea. El texto va entre comillas dentro de los paréntesis. No hace falta declarar una variable ni una función para este primer programa.',
    },
  },
};

export function reviseLearningContent(exercise: SeedExercise, key: string): SeedExercise {
  const fixed = exercise.runtimeMode === "PROGRAM" && exercise.tests.every(test => test.input === "");
  const conceptRule = rules[key] ?? "";
  const tests = fixed ? [{ ...exercise.tests[0], visible: true }] : [
    ...exercise.tests.map((test, index) => ({ ...test, visible: index < 2 })),
    ...(extraCases[key] ?? []).map(([input, expected]) => ({ input, expected, visible: false })),
  ];
  const statement = statements[key];
  const statementsByLanguage = Object.fromEntries((["python", "javascript", "typescript"] as Language[]).map(language => [language, statement ?? exercise.statements?.[language] ?? exercise.statement])) as Record<Language, string>;
  const constraints = key === "saludo"
    // La primera práctica mantiene una condición concreta: no repite el enunciado y explica el criterio de salida.
    ? ["La salida debe coincidir exactamente con el texto esperado; no añadas líneas vacías ni texto adicional."]
    : fixed ? [] : key === "potencia"
      ? ["0 ≤ base ≤ 10; 0 ≤ exponente ≤ 100; enteros con resultado ≤ 9007199254740991."]
      : exercise.constraints.filter(text => !/^(Implementa solve\(data\)|Escribe un programa completo|Los casos de salida fija)/.test(text));
  // No adelantar complejidad a quien aún está aprendiendo instrucciones.
  const complexity = exercise.level === "INITIATION" ? "" : exercise.complexity;
  const help = openingHelp[key];
  const revisedStatements = help?.statements ?? (help?.statement ? { python: help.statement, javascript: help.statement, typescript: help.statement } : statementsByLanguage);
  const explanations = help?.explanations ?? (help?.explanation ? { python: help.explanation, javascript: help.explanation, typescript: help.explanation } : exercise.explanations);
  return { ...exercise, statements: revisedStatements, conceptRule, tests, constraints, complexity,
    activityType: guided.has(key) ? "GUIDED" : exercise.activityType,
    ...(key === "cambio" ? { practiceGoals: ["Representar una diferencia mediante una resta entre variables."] } : {}),
    ...help,
    statement: help?.statement ?? revisedStatements.python,
    explanations,
  };
}
