// Revisiones editoriales explícitas: no sustituyen términos dentro de código,
// ejemplos JSON, contratos PROGRAM ni contenido de otros lenguajes.
type EditorialRevision = { statement: string; hints?: string[]; constraints?: string[]; objective?: string };
const statement = (task: string, input: string, output: string) =>
  `Tu tarea\n${task}\n\nEntrada\n${input}\n\nResultado esperado\n${output}`;

export const pythonEditorialRevisions: Record<string, EditorialRevision> = {
  "logica-adyacencia": { statement: statement(
    "Representa las conexiones de un grafo no dirigido mediante las listas de vecinos de sus nodos.",
    "data es un diccionario con n, un entero entre 1 y 1000, y aristas, una lista de hasta 4000 aristas en forma de pares [a, b]. Los nodos se numeran de 0 a n - 1; los extremos son válidos y distintos. Puede haber aristas repetidas, incluso escritas al revés. Cada arista conecta ambos sentidos.",
    "Devuelve una lista de longitud n: la posición i contiene los vecinos distintos del nodo i en orden numérico ascendente. Un nodo aislado tiene []. No modifiques la entrada.",
  ) },
  "logica-alcanzables": { statement: statement(
    "Encuentra todos los nodos alcanzables desde un inicio en un grafo no dirigido, practicando la búsqueda en profundidad.",
    "data es un diccionario con n, un entero entre 1 y 1000, aristas, una lista de pares [a, b], e inicio. Los nodos se numeran de 0 a n - 1; inicio y los extremos son índices válidos. Cada arista conecta ambos sentidos. El grafo puede contener ciclos.",
    "Devuelve una lista de nodos alcanzables en orden numérico ascendente, incluido inicio. Cada nodo debe aparecer una sola vez. Si inicio está aislado, devuelve una lista que solo lo contenga. Los casos comprueban el resultado, no certifican la técnica de recorrido.",
  ) },
  "logica-distancias": { statement: statement(
    "Calcula las distancias mínimas desde un inicio en un grafo sin pesos, practicando el recorrido por niveles.",
    "data es un diccionario con n, un entero entre 1 y 1000, aristas, una lista de pares [a, b], e inicio. Los nodos se numeran de 0 a n - 1; inicio y los extremos son índices válidos. El grafo es no dirigido: cada arista conecta ambos sentidos.",
    "Devuelve una lista de longitud n. En la posición i indica la mínima cantidad de aristas desde inicio hasta i, o -1 si no se alcanza. La distancia de inicio a sí mismo es 0. No devuelvas el orden de visita: los casos comprueban distancias, no certifican el uso de una cola.",
  ) },
  "logica-ciclo-dirigido": { statement: statement(
    "Comprueba si un grafo dirigido contiene un ciclo en cualquiera de sus componentes.",
    "data es un diccionario con n, un entero entre 0 y 100, y aristas, una lista de pares [origen, destino]. Los nodos se numeran de 0 a n - 1 y los extremos son válidos. No hay aristas repetidas; puede haber lazos, aristas de un nodo hacia sí mismo.",
    "Devuelve True si existe un camino dirigido que vuelve al nodo del que partió, y False si no existe. Un lazo es un ciclo; compartir un descendiente no basta para formar uno. Un grafo sin nodos devuelve False. En JSON, True y False se representan como true y false.",
  ) },
  "logica-dependencias": { statement: statement(
    "Ordena tareas respetando sus dependencias y eligiendo en cada paso la disponible de menor número.",
    "data es un diccionario con n, un entero entre 0 y 100, y dependencies, una lista de pares [a, b] de índices válidos sin pares repetidos. Las tareas se numeran de 0 a n - 1. Cada par exige completar a antes que b.",
    "Devuelve una lista con todas las tareas. Una tarea está disponible cuando ya se han completado todos sus requisitos; elige siempre la menor entre las disponibles en ese momento, incluidas las recién liberadas. Si hay un ciclo, devuelve [] en vez de un orden parcial. Sin tareas también devuelve [].",
  ) },
  "logica-dijkstra": { statement: statement(
    "Encuentra el menor coste desde el nodo 0 hasta un destino en un grafo con pesos positivos, practicando el algoritmo de Dijkstra.",
    "data es un diccionario con n, un entero entre 1 y 200, aristas, una lista de ternas [a, b, peso] con pesos positivos, y destino. Los nodos se numeran de 0 a n - 1; destino y los extremos son índices válidos. El grafo es no dirigido: cada arista conecta ambos sentidos.",
    "Devuelve la menor suma de pesos de un camino desde 0 hasta destino, no la cantidad de aristas. Si no se puede llegar, devuelve -1. Para destino igual a 0 devuelve 0. Los casos comprueban costes, no certifican el algoritmo ni el uso de un montículo.",
  ) },
  "logica-islas": { statement: statement(
    "Cuenta las islas de una cuadrícula. Una isla es un grupo de celdas de tierra conectadas en horizontal o vertical; las diagonales no conectan islas.",
    "data es una cuadrícula rectangular de hasta 300 por 300, representada como una lista de listas. Cada celda contiene el entero 1 (tierra) o 0 (agua). Puede no tener filas o tener filas vacías.",
    "Devuelve el número de islas, no la cantidad de celdas de tierra. Si no hay celdas o todas contienen agua, devuelve 0. No modifiques la cuadrícula recibida: conserva sus valores originales.",
  ) },
  "logica-laberinto": { statement: statement(
    "Encuentra el mínimo número de movimientos desde la esquina superior izquierda hasta la inferior derecha de un laberinto.",
    "data es una cuadrícula rectangular no vacía de hasta 200 por 200, representada como una lista de listas con enteros 0 (celda libre) y 1 (muro). Puedes avanzar arriba, abajo, izquierda o derecha; no se permiten diagonales ni atravesar muros.",
    "Devuelve el mínimo número de movimientos, o -1 si no hay camino o alguna esquina es un muro. La celda inicial cuenta como cero movimientos: una única celda libre devuelve 0.",
  ) },
  "logica-capacidad": { statement: statement(
    "Encuentra la capacidad mínima de un transporte para repartir paquetes en los días disponibles, practicando la búsqueda binaria sobre la respuesta.",
    "data es un diccionario con pesos, una lista no vacía de pesos positivos, y dias, un entero entre 1 y el número de paquetes. Debes repartir los paquetes en su orden original, sin dividir ningún paquete. Cada día puedes transportar un tramo consecutivo de los paquetes pendientes hasta la capacidad elegida.",
    "Devuelve la menor capacidad que permite repartir todos los paquetes en como máximo dias días. No es necesario usar todos los días. La capacidad limita la suma de pesos transportada cada día, no el número de paquetes. Los casos comprueban el mínimo, no certifican la técnica de búsqueda.",
  ) },
  "logica-edicion": { statement: statement(
    "Calcula el mínimo número de operaciones para transformar un texto en otro.",
    "data es un diccionario con a y b, textos ASCII de hasta 200 caracteres; cualquiera puede estar vacío. Una operación inserta, elimina o sustituye un solo carácter y cuesta 1.",
    "Devuelve la menor cantidad total de operaciones para transformar a en b. No se permite intercambiar caracteres como una sola operación. Dos textos iguales requieren 0 operaciones; transformar un texto vacío en otro requiere tantas inserciones como caracteres tenga el segundo.",
  ) },
  "logica-subsecuencia-creciente": { statement: statement(
    "Calcula la longitud de la subsecuencia estrictamente creciente más larga de una lista.",
    "data es una lista de hasta 500 números enteros. Puede estar vacía y contener repeticiones. Una subsecuencia puede omitir elementos, pero conserva su orden original: no tiene que ser un tramo consecutivo.",
    "Devuelve la longitud máxima, no la propia subsecuencia. Cada valor elegido debe ser estrictamente mayor que el anterior; los valores iguales no prolongan la subsecuencia. Para la lista vacía devuelve 0.",
  ) },
  "logica-planifica-tareas": { statement: statement(
    "Calcula el tiempo mínimo para terminar todas las tareas respetando sus dependencias, con paralelismo ilimitado.",
    "data es un diccionario con duraciones, una lista de hasta 100 enteros no negativos, y dependencias, una lista de pares [a, b] de índices válidos. Cada par exige terminar a antes de iniciar b. Las tareas sin requisitos pueden empezar en tiempo cero y no hay límite de tareas simultáneas.",
    "Devuelve el tiempo mínimo para terminar todas las tareas, o -1 si hay un ciclo. Cada tarea debe esperar a que terminen todos sus requisitos. Sin tareas devuelve 0. No sumes duraciones de tareas que pueden ejecutarse en paralelo; una duración cero sigue respetando las dependencias.",
  ) },
  "logica-cuenta-nodos": { statement: statement(
    "Cuenta los nodos de un árbol binario, aunque varios tengan el mismo valor.",
    "data es un árbol binario de hasta 100 nodos y profundidad máxima 50, o None si está vacío. Cada nodo es un diccionario con value (entero), left y right (otro nodo o None). En JSON, None se representa como null.",
    "Devuelve el número de nodos. El árbol vacío tiene 0 nodos; cuenta los nodos, no la cantidad de valores distintos.",
  ) },
  "logica-altura": { statement: statement(
    "Calcula la altura de un árbol binario contando nodos, no enlaces.",
    "data es un árbol binario de hasta 500 nodos y profundidad máxima 50, o None si está vacío. Cada nodo es un diccionario con value (entero), left y right (otro nodo o None). En JSON, None se representa como null.",
    "Devuelve la cantidad de nodos del camino más largo desde la raíz hasta una hoja. Un árbol vacío tiene altura 0 y una hoja, altura 1.",
  ) },
  "logica-preorden": { statement: statement(
    "Obtén los valores de un árbol binario en preorden.",
    "data es un árbol binario de hasta 500 nodos y profundidad máxima 50, o None si está vacío. Cada nodo es un diccionario con value (entero), left y right (otro nodo o None). En JSON, None se representa como null.",
    "Devuelve una lista con el valor de la raíz, después todos los del subárbol izquierdo y finalmente todos los del derecho, siguiendo ese mismo orden en cada subárbol. Conserva valores repetidos. Para el árbol vacío devuelve [].",
  ) },
  "logica-niveles": { statement: statement(
    "Obtén los valores de un árbol binario nivel a nivel.",
    "data es un árbol binario de hasta 500 nodos y profundidad máxima 50, o None si está vacío. Cada nodo es un diccionario con value (entero), left y right (otro nodo o None). En JSON, None se representa como null.",
    "Devuelve una lista empezando por la raíz y continuando por niveles, de izquierda a derecha dentro de cada nivel. Conserva valores repetidos. Para el árbol vacío devuelve [].",
  ) },
  "logica-arbol-busqueda": { statement: statement(
    "Comprueba si un árbol binario cumple la propiedad de búsqueda en todos sus nodos.",
    "data es un árbol binario con valores enteros distintos, hasta 500 nodos y profundidad máxima 50, o None si está vacío. Cada nodo es un diccionario con value, left y right; los hijos son otro nodo o None. En JSON, None se representa como null.",
    "Devuelve True si, para cada nodo, todos los valores de su subárbol izquierdo son estrictamente menores que su value y todos los del derecho son estrictamente mayores. Los límites de todos los antecesores importan, no solo los hijos inmediatos. En otro caso devuelve False. El árbol vacío cumple la propiedad. True y False se muestran como true y false en JSON.",
  ) },
  "logica-ancestro": { statement: statement(
    "Encuentra el ancestro común más cercano de dos nodos. Un nodo es ancestro de sí mismo.",
    "data es un diccionario con tree, a y b. tree es un árbol binario no vacío de hasta 100 nodos, profundidad máxima 50 y valores enteros únicos. Cada nodo es un diccionario con value, left y right; sus hijos son otro nodo o None (null en JSON). a y b son valores de nodos existentes y pueden ser iguales. El árbol no tiene por qué ser de búsqueda.",
    "Devuelve el valor del ancestro común más profundo de los nodos a y b. La relación depende de las ramas del árbol, no de ordenar sus valores.",
  ) },
  "logica-monticulo-inserta": { statement: statement(
    "Inserta un valor en un montículo mínimo y devuelve su representación tras reparar el camino hacia la raíz.",
    "data es un diccionario con heap, una lista que representa un montículo mínimo válido de hasta 100 enteros, y value, el entero que se inserta. Para un índice i mayor que cero, su padre está en (i - 1) // 2.",
    "Devuelve la lista obtenida al añadir value al final y ascenderlo mientras sea estrictamente menor que su padre, intercambiando ambos valores. Detente en la raíz o si el padre es menor o igual. No intercambies iguales. Se pide esta representación concreta, no cualquier lista ordenada ni cualquier montículo válido.",
  ) },
  "logica-monticulo-extrae": { statement: statement(
    "Retira el mínimo de un montículo y devuelve también su representación reparada.",
    "data es una lista que representa un montículo mínimo válido de hasta 100 enteros; puede estar vacía.",
    "Devuelve un diccionario con minimo y heap. Si está vacío, minimo es None (null en JSON) y heap es []. En otro caso, retira la raíz y coloca el último valor en ella; desciéndelo intercambiando con el hijo menor hasta recuperar la propiedad. En empate entre hijos elige el izquierdo; no intercambies iguales. Se pide la lista concreta resultante de esa reparación, no cualquier montículo equivalente.",
  ) },
  "logica-prioridad": { statement: statement(
    "Determina el orden de atención de un lote de tareas según su prioridad.",
    "data es una lista de hasta 100 tareas. Cada tarea es un diccionario con id, un entero único, y prioridad, un entero.",
    "Devuelve la lista de ids: menor prioridad numérica primero y, si empatan, menor id. Una lista vacía de tareas devuelve []. La comparación es numérica, no textual.",
  ) },
  "logica-k-mayores": { statement: statement(
    "Selecciona los k valores mayores de una lista, practicando cómo limitar los candidatos conservados.",
    "data es un diccionario con numbers, una lista de hasta 1000 enteros, y k, un entero entre cero y su longitud.",
    "Devuelve una lista con los k mayores en orden descendente, conservando repeticiones. Para k igual a cero devuelve []; si k es la longitud, incluye todos los valores.",
  ) },
  "logica-actividades": { statement: statement(
    "Calcula el máximo número de actividades compatibles, sin solapamientos.",
    "data es una lista de hasta 10000 actividades. Cada una es una lista [inicio, fin] de enteros, con inicio menor que fin. Los extremos pueden ser negativos y la entrada no tiene que estar ordenada.",
    "Devuelve la mayor cantidad de actividades que puedes elegir. Una actividad puede empezar justo cuando termina otra: compartir ese extremo no es solaparse. Si no hay actividades, devuelve 0. No modifiques la entrada.",
  ) },
  "logica-combina-archivos": { statement: statement(
    "Encuentra el coste total mínimo de combinar todos los archivos en uno solo.",
    "data es una lista de hasta 100 tamaños enteros entre 0 y 1000. Son tamaños abstractos: no necesitas abrir ni escribir archivos reales.",
    "Combinar dos archivos cuesta la suma de sus tamaños y crea un archivo de ese tamaño, que puede participar en combinaciones posteriores. Devuelve el menor coste total posible. Con cero o un archivo no hay combinaciones y el coste es 0.",
  ) },
  "logica-potencia": { statement: statement(
    "Calcula una potencia practicando la reducción del exponente por mitades.",
    "data es un diccionario con base, un entero entre 0 y 10, y exponente, un entero entre 0 y 100. Las entradas garantizan que el resultado no supera 9007199254740991.",
    "Devuelve base elevada a exponente como entero. Para exponente cero devuelve 1, también si base es cero. Las pruebas de resultado no certifican el método de cálculo.",
  ) },
  "logica-mezcla": { statement: statement(
    "Ordena una lista practicando la ordenación por mezcla: divide el problema en mitades y combina las partes ordenadas.",
    "data es una lista de hasta 10000 enteros. Puede estar vacía y contener negativos o repeticiones.",
    "Devuelve una lista nueva ordenada de menor a mayor, con todos los elementos y sus repeticiones. No modifiques la lista original. La estrategia se desarrolla en las ayudas; los casos comprueban la salida, no certifican la técnica ni su complejidad.",
  ) },
  "logica-subconjuntos": { statement: statement(
    "Genera todos los subconjuntos de una lista, incluido el vacío.",
    "data es una lista de hasta 10 enteros distintos en orden ascendente.",
    "Devuelve una lista de listas en este orden concreto: empieza con [[]]; para cada número de la entrada, añade al final copias de los subconjuntos actuales con ese número al final de cada copia. Para [1, 2], el orden es [[], [1], [2], [1, 2]]. No agrupes por longitud ni elimines el subconjunto vacío.",
  ) },
  "logica-permutaciones": { statement: statement(
    "Genera todos los órdenes posibles de los elementos de una lista.",
    "data es una lista de hasta 6 enteros distintos entre -1000 y 1000, en orden ascendente.",
    "Devuelve una lista con todas las permutaciones, cada una como una lista que utiliza todos los elementos exactamente una vez. Ordénalas lexicográficamente por valores numéricos: compara el primer elemento diferente, no su texto. Por ejemplo, [2, 10] va antes de [10, 2]. Para una entrada vacía devuelve [[]].",
  ) },
  "logica-combinaciones": { statement: statement(
    "Encuentra todas las combinaciones que suman un objetivo, sin reutilizar elementos.",
    "data es un diccionario con numbers, una lista de hasta 15 enteros positivos distintos, y target, un entero entre 0 y 100. numbers puede estar vacía y no necesita venir ordenada.",
    "Devuelve una lista de combinaciones que sumen exactamente target; cada elemento se usa como máximo una vez por combinación. Ordena los valores dentro de cada combinación y la lista exterior lexicográficamente por valores numéricos, no por texto. Para target cero devuelve [[]]; si no hay soluciones, devuelve [].",
  ) },
  "logica-reinas": { statement: statement(
    "Cuenta las colocaciones válidas de n reinas en un tablero de n por n.",
    "data es el entero n, entre 1 y 8.",
    "Devuelve cuántas formas hay de colocar n reinas sin compartir fila, columna ni diagonal. Cuenta las simetrías como soluciones diferentes. Si no hay ninguna colocación válida, devuelve 0; no devuelvas los tableros.",
  ) },
  "logica-fibonacci": { statement: statement(
    "Calcula un término de Fibonacci practicando la reutilización de resultados ya obtenidos.",
    "data es un entero n entre 0 y 40.",
    "Devuelve F(n), con F(0) = 0, F(1) = 1 y cada término posterior igual a la suma de los dos anteriores. Las ayudas desarrollan la memoria de resultados; los casos no certifican cómo los guardas.",
  ) },
  "logica-escalera": { statement: statement(
    "Cuenta las formas de subir una escalera dando pasos de uno o dos escalones.",
    "data es un entero n entre 0 y 45, el número de escalones.",
    "Devuelve el número de secuencias de pasos que llegan exactamente al escalón n. El orden distingue formas: [1, 2] y [2, 1] son distintas. Con cero escalones hay una única forma de no subir, por lo que devuelve 1.",
  ) },
  "logica-caminos-obstaculos": { statement: statement(
    "Cuenta caminos que no atraviesen obstáculos, desde la esquina superior izquierda hasta la inferior derecha.",
    "data es una matriz rectangular no vacía de hasta 15 por 15, representada como una lista de listas. Cada celda contiene el entero 0 (libre) o 1 (obstáculo).",
    "Devuelve la cantidad de caminos moviéndote solo a la derecha o abajo. No se puede pisar ningún obstáculo, tampoco en el inicio o la meta. Si no hay camino, devuelve 0. Una única celda libre tiene un camino sin movimientos.",
  ) },
  "logica-monedas": { statement: statement(
    "Encuentra el mínimo número de monedas necesario para formar un importe.",
    "data es un diccionario con coins, una lista de hasta 20 denominaciones enteras positivas, y amount, un entero entre 0 y 1000. coins puede estar vacía. Cada denominación puede usarse tantas veces como haga falta.",
    "Devuelve la menor cantidad de monedas que suma exactamente amount, o -1 si es imposible. Para amount cero devuelve 0 incluso sin denominaciones. No se pide contar combinaciones de monedas.",
  ) },
  "logica-mochila": { statement: statement(
    "Elige un subconjunto de objetos que maximice el valor sin superar la capacidad. Cada objeto puede elegirse como máximo una vez.",
    "data es un diccionario con pesos y valores, listas de enteros no negativos de la misma longitud, hasta 200 objetos, y capacidad, un entero entre 0 y 1000. Las posiciones correspondientes de las listas describen el peso y valor de cada objeto.",
    "Devuelve el mayor valor total posible. Puedes no elegir ningún objeto y no es necesario llenar exactamente la capacidad. Los objetos de peso cero también pueden elegirse una vez cada uno, incluso con capacidad cero. No modifiques las listas recibidas.",
  ) },
  "logica-subsecuencia-comun": { statement: statement(
    "Calcula la longitud de la subsecuencia común más larga de dos textos. Una subsecuencia conserva el orden, pero puede saltar caracteres: no tiene que ser un tramo consecutivo.",
    "data es un diccionario con a y b, textos de hasta 500 caracteres; cualquiera puede estar vacío.",
    "Devuelve la longitud máxima, no el propio texto. Las apariciones repetidas cuentan si respetan el orden en ambos textos. Si alguno está vacío o no comparten ninguna subsecuencia no vacía, devuelve 0.",
  ) },
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
