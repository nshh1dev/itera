// Revisiones editoriales explícitas: no sustituyen términos dentro de código,
// ejemplos JSON, contratos PROGRAM ni contenido de otros lenguajes.
type EditorialRevision = { statement: string; hints?: string[]; constraints?: string[]; objective?: string };
const statement = (task: string, input: string, output: string) =>
  `Tu tarea\n${task}\n\nEntrada\n${input}\n\nResultado esperado\n${output}`;

export const pythonEditorialRevisions: Record<string, EditorialRevision> = {
  "logica-mayor-tres": { statement: statement(
    "Encuentra el mayor de tres valores usando comparaciones.",
    "data es un diccionario con las claves a, b y c, enteros entre -1000 y 1000. Puede haber valores repetidos o negativos.",
    "Devuelve el mayor de los tres enteros.",
  ) },
  "logica-filtra-lista": { statement: statement(
    "Selecciona los valores que alcanzan o superan un mínimo.",
    "data es un diccionario con values, una lista de hasta 1000 enteros, y minimo, el entero que fija el límite.",
    "Devuelve una lista nueva con los valores mayores o iguales que minimo, en el orden original y conservando repeticiones. Si ninguno cumple o values está vacía, devuelve [].",
  ) },
  "logica-busqueda-lineal": { statement: statement(
    "Encuentra la primera aparición de un valor en una lista sin ordenar.",
    "data es un diccionario con values, una lista de hasta 10000 valores, y target, el valor buscado. Los índices empiezan en cero.",
    "Devuelve el índice de la primera coincidencia exacta con target, o -1 si no aparece, también si la lista está vacía.",
  ) },
  "logica-ficha-resultado": { statement: statement(
    "Construye una ficha de resultado. En esta actividad, una ficha se representa mediante un diccionario con claves con nombre.",
    "data es un diccionario con precio y unidades, enteros entre 0 y 1000.",
    "Devuelve un diccionario con total, igual a precio multiplicado por unidades, y unidades, igual a la cantidad recibida.",
  ), hints: ["El diccionario de retorno agrupa dos resultados con nombre.", "Solo total necesita una multiplicación.", "Construye las claves total y unidades con esos valores."] },
  "logica-opcional": { statement: statement(
    "Consulta una cantidad opcional sin confundir cero con una clave ausente.",
    "data es un diccionario que puede incluir la clave cantidad. Si existe, su valor es un entero entre 0 y 100; nunca es None (null en JSON).",
    "Devuelve cantidad si la clave existe, incluso si vale cero. Si la clave falta, devuelve 1.",
  ), objective: "Consultar una clave opcional de un diccionario con un valor de respaldo.",
  constraints: ["La clave cantidad, si existe, contiene un entero de 0 a 100.", "No hay valores None (null en JSON) en esta actividad."],
  hints: ["Una clave puede no estar presente en el diccionario.", "Conserva cero: no es lo mismo que una clave ausente.", "Consulta cantidad y utiliza uno como respaldo solo cuando falte esa clave."] },
  "logica-auxiliares": { statement: statement(
    "Calcula el total de un pedido practicando la separación del cálculo en funciones auxiliares.",
    "data es un diccionario con precio, un entero de 0 a 10000 céntimos, y cantidad, un entero de 0 a 100.",
    "Devuelve precio multiplicado por cantidad, más 300 céntimos de envío si ese subtotal es menor que 2000. Con subtotal de 2000 o más, el envío es cero. Un pedido de cantidad cero también paga los 300 céntimos. Los casos comprueban el resultado, no la organización interna de las funciones.",
  ) },
  "logica-mediciones": { statement: statement(
    "Resume una serie de mediciones, incluidas las vacías o negativas.",
    "data es una lista de hasta 100 enteros entre -100 y 100.",
    "Devuelve un diccionario con total (suma de todos), positivos (cantidad de valores estrictamente mayores que cero) y mayor (máximo). Si la lista está vacía, total y positivos valen 0 y mayor es None, representado como null en JSON.",
  ) },
  "logica-carrito": { statement: statement(
    "Calcula el total de un carrito después de aplicar un descuento al subtotal completo.",
    "data es un diccionario con items, una lista de hasta 100 artículos, y descuento, un entero de 0 a 100. Cada artículo es un diccionario con precio y cantidad, enteros de 0 a 100.",
    "Devuelve la suma de precio por cantidad de todos los artículos tras aplicar el porcentaje descuento. El resultado puede ser decimal. Un carrito vacío devuelve 0.",
  ) },
  "logica-notas": { statement: statement(
    "Resume cuántas notas aprueban y cuál es su promedio.",
    "data es una lista de hasta 100 notas enteras entre 0 y 10.",
    "Devuelve un diccionario con aprobados (cantidad de notas mayores o iguales que 5) y media (promedio). Si la lista está vacía, aprobados es 0 y media es None, representado como null en JSON. No trunques el promedio a un entero.",
  ), hints: ["Necesitas un contador y una suma.", "La lista vacía no permite dividir por su longitud.", "Devuelve None para la media si no hay notas; en otro caso divide la suma por la cantidad."] },
  "logica-ordena-insercion": { statement: statement(
    "Ordena una lista practicando la ordenación por inserción.",
    "data es una lista de hasta 1000 enteros; puede estar vacía y contener negativos o repeticiones.",
    "Devuelve una lista nueva ordenada de menor a mayor, conservando todos los elementos. No modifiques la lista recibida. La técnica recomendada se explica en las pistas; los casos evalúan el resultado.",
  ) },
  "logica-combina": { statement: statement(
    "Combina dos listas ya ordenadas sin volver a ordenarlas, practicando el avance de dos índices.",
    "data es un diccionario con a y b, listas de hasta 5000 enteros cada una, ordenadas de menor a mayor. Cualquiera de ellas puede estar vacía.",
    "Devuelve una lista ordenada con todos los valores de ambas listas, incluidas las repeticiones. Los casos comprueban la salida, no el método utilizado.",
  ) },
  "logica-palindromo": { statement: statement(
    "Comprueba si un texto se lee igual desde ambos extremos, practicando dos índices que se acercan.",
    "data es un texto ASCII de hasta 1000 caracteres. Distingue mayúsculas y conserva espacios y signos; no normalices el texto.",
    "Devuelve True si es un palíndromo y False si no lo es. El texto vacío es un palíndromo. En JSON, True y False aparecen como true y false, sin comillas. Los casos comprueban el resultado, no el método.",
  ) },
  "logica-pareja": { statement: statement(
    "Encuentra dos posiciones distintas cuyos valores sumen el objetivo, practicando dos índices desde los extremos.",
    "data es un diccionario con numbers, una lista de hasta 10000 enteros ordenados de menor a mayor, y target, el objetivo. Los valores pueden repetirse y los índices empiezan en cero.",
    "Devuelve [i, j], con i < j, o [] si no existe pareja. Si hay varias, elige el menor i y, para ese i, el mayor j válido. No modifiques la entrada. La comprobación del resultado no certifica la técnica interna.",
  ) },
  "logica-prefijos": { statement: statement(
    "Construye las sumas de los prefijos de una lista. Un prefijo es una parte inicial de la lista, incluido el prefijo vacío.",
    "data es una lista de hasta 10000 enteros.",
    "Devuelve una lista de longitud n + 1, donde n es la longitud de data. La posición 0 contiene 0; la posición i contiene la suma de los primeros i elementos. Para data vacía devuelve [0]. Conserva las sumas como enteros, sin convertirlas a float.",
  ) },
  "logica-ventana-fija": { statement: statement(
    "Encuentra la mayor suma de un tramo de k elementos consecutivos. Ese tramo es una ventana de tamaño fijo.",
    "data es un diccionario con numbers, una lista no vacía de hasta 100000 enteros, y k, un entero entre 1 y la longitud de la lista.",
    "Devuelve la mayor suma de todas las ventanas de tamaño k. Los valores pueden ser negativos: no se permite elegir un tramo vacío.",
  ) },
  "logica-ventana-suma": { statement: statement(
    "Encuentra el tramo consecutivo más corto cuya suma alcance el objetivo. Alcanzar significa sumar al menos el objetivo, no necesariamente igualarlo.",
    "data es un diccionario con numbers, una lista de hasta 100000 enteros positivos, y target, un entero positivo. La lista puede estar vacía.",
    "Devuelve la longitud mínima del tramo, o 0 si no existe, también cuando numbers está vacía. No devuelvas la suma ni el propio tramo.",
  ) },
  "logica-filas": { statement: statement(
    "Calcula un total independiente para cada fila de una matriz, representada como una lista de listas.",
    "data tiene entre 1 y 100 filas, con hasta 100 enteros por fila. Las filas pueden tener longitudes diferentes o estar vacías.",
    "Devuelve una lista con la suma de cada fila, en el mismo orden. Una fila vacía aporta 0 y conserva su posición en el resultado.",
  ) },
  "logica-diagonales": { statement: statement(
    "Obtén las dos diagonales de una matriz cuadrada.",
    "data es una lista de listas de enteros que representa una matriz cuadrada no vacía de hasta 20 por 20.",
    "Devuelve un diccionario con principal y secundaria, listas de sus diagonales de arriba abajo. La principal va de arriba a la izquierda a abajo a la derecha; la secundaria, de arriba a la derecha a abajo a la izquierda. El centro pertenece a ambas si el tamaño es impar.",
  ) },
  "logica-pila": { statement: statement(
    "Simula una pila: el último valor en entrar es el primero en salir (LIFO).",
    "data es un diccionario con operaciones, una lista de hasta 10000 operaciones. Cada una es una lista ['push', valor], con valor entero, o ['pop']. La pila empieza vacía.",
    "Devuelve una lista con los valores extraídos, en el orden de extracción. push añade un valor; pop retira el más reciente. Un pop sobre la pila vacía se ignora. No incluyas valores que quedan sin extraer.",
  ) },
  "logica-cola": { statement: statement(
    "Simula una cola: el primer valor en entrar es el primero en salir (FIFO).",
    "data es un diccionario con operaciones, una lista de hasta 2000 operaciones. Cada una es una lista ['push', valor], con valor entero, o ['pop']. La cola empieza vacía.",
    "Devuelve una lista con los valores atendidos, en el orden de atención. push añade un valor; pop retira el más antiguo. Un pop sobre la cola vacía se ignora. No incluyas valores que quedan sin atender.",
  ) },
  "logica-suma-recursiva": { statement: statement(
    "Suma los elementos de una lista practicando una función que se llama a sí misma (recursión).",
    "data es una lista de hasta 900 enteros, incluidos ceros y negativos; puede estar vacía.",
    "Devuelve la suma de todos sus elementos. Para la lista vacía devuelve 0. Los casos evalúan el total, no certifican que se haya usado recursión.",
  ) },
  "logica-une-intervalos": { statement: statement(
    "Fusiona intervalos que se solapan o se tocan.",
    "data es una lista de hasta 1000 intervalos. Cada intervalo es una lista [inicio, fin] de enteros con inicio menor o igual que fin. La entrada no tiene que estar ordenada.",
    "Devuelve la lista de intervalos fusionados, ordenada por inicio. Los intervalos que comparten un extremo también se fusionan. Si la entrada está vacía, devuelve [].",
  ) },
  "logica-segundo-maximo": { statement: statement(
    "Encuentra el segundo valor distinto más grande de una lista.",
    "data es una lista de hasta 1000 enteros entre -10000 y 10000. Puede estar vacía y contener valores repetidos, negativos o cero.",
    "Devuelve el segundo valor distinto más grande, o None si no existe. None se representa como null en JSON. Repetir el máximo no cuenta como un segundo valor.",
  ) },
  "logica-suma-maxima": { statement: statement(
    "Encuentra la mayor suma de un tramo consecutivo no vacío de una lista.",
    "data es una lista no vacía de hasta 10000 enteros de valor absoluto como máximo 1000. Puede contener negativos y ceros.",
    "Devuelve la mayor suma que puede obtenerse sin saltar elementos dentro del tramo elegido. Si todos los valores son negativos, el resultado también es negativo; no se permite elegir un tramo vacío.",
  ) },
};
