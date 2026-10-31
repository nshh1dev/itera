import type { VersionContent } from "./editorial-revision";

// Revisiones explícitas de metadatos y ayudas, nunca sustituciones dentro de
// código, ejemplos, JSON ni salidas exactas de programas.
type VocabularyRevision = Partial<Pick<VersionContent,
  "description" | "objective" | "constraints" | "hints" | "commonErrors" | "practiceGoals"
>>;

export const pythonVocabularyRevisions: Record<string, VocabularyRevision> = {
  "logica-booleano": {
    description: "Guarda True, el booleano de Python, en listo. Conserva la impresión preparada: muestra true en minúsculas, como exige este programa.",
  },
  "logica-dos-parametros": {
    objective: "Consultar dos claves de un diccionario, sumar sus valores y devolver el resultado.",
  },
  "logica-perimetro": {
    description: "Recibe un diccionario con base y altura, enteros de 1 a 1000, y calcula el perímetro del rectángulo.",
  },
  "logica-mayor-tres": {
    description: "Recibe un diccionario con a, b y c, enteros entre -1000 y 1000, y encuentra el mayor.",
  },
  "logica-alternativas": {
    constraints: ["Las tres claves siempre existen y sus valores son booleanos True o False (true o false en JSON)."],
    practiceGoals: ["Combinar alternativas con or y excluir con not.", "Agrupar condiciones para expresar una regla sin ambigüedad."],
  },
  "logica-indices": {
    hints: ["indice ya avanza de cero a la última posición válida.", "Añade el valor en esa posición, no la posición misma.", "Cambia data[0] por data[indice] en la llamada a append."],
  },
  "logica-ficha-producto": {
    hints: ["Una ficha se representa como un diccionario: cada clave identifica un valor.", "No necesitas combinar los valores de ambas claves.", "Devuelve el valor asociado a la clave precio."],
    practiceGoals: ["Consultar el valor numérico asociado a una clave de diccionario."],
  },
  "logica-ausencia": {
    constraints: ["La entrada es None (null en JSON) o un entero entre −100 y 100."],
    commonErrors: ["Tratar cero como ausencia.", "Sumar antes de comprobar si el valor es None."],
    practiceGoals: ["Tratar None sin descartar cero.", "Distinguir un número de la ausencia antes de operar."],
  },
  "logica-reasigna-o-muta": {
    hints: ["Reasignar cambia a qué lista apunta alias.", "No llames append sobre original: debes cambiar la referencia de alias, no modificar la lista compartida.", "La lista original conserva todos sus valores."],
  },
  "logica-valido-cero-ausente": {
    description: "Clasifica cantidad, un entero o None (null en JSON), sin confundir el cero válido con la ausencia.",
  },
  "logica-mediciones": {
    practiceGoals: ["Construir un diccionario de resumen con varias claves.", "Probar una lista vacía y valores negativos."],
  },
  "logica-carrito": {
    description: "Calcula el total de un carrito: items es una lista de diccionarios con precio y cantidad, enteros de 0 a 100; descuento es un entero de 0 a 100.",
  },
  "logica-frecuencias": {
    description: "Construye un diccionario y acumula las apariciones de cada letra bajo su clave.",
  },
  "logica-ordena-insercion": {
    description: "Ordena una lista insertando cada valor en la parte ya ordenada.",
  },
  "logica-combina": {
    description: "Combina dos listas ya ordenadas en una sola, también ordenada.",
  },
  "logica-prefijos": {
    description: "Construye la lista de sumas de prefijos de una lista de números.",
  },
  "logica-filas": {
    description: "Suma los valores de cada fila de una matriz y devuelve una lista con esos totales.",
  },
  "logica-suma-recursiva": {
    description: "Suma los elementos de una lista con una función que se llama a sí misma.",
  },
  "logica-une-intervalos": {
    description: "Recibe una lista de intervalos [inicio, fin] y fusiona los que se solapan o se tocan.",
  },
  "logica-suma-maxima": {
    description: "Recibe una lista no vacía y encuentra la mayor suma de un tramo contiguo no vacío.",
  },
  "logica-cuenta-nodos": {
    description: "Cuenta los nodos de un árbol binario representado por diccionarios, o None si está vacío (null en JSON).",
  },
  "logica-mezcla": {
    description: "Ordena una lista dividiéndola en mitades y combinando las partes ordenadas.",
  },
};

// Texto posterior a consultar la solución. No modifica la referencia ejecutable.
export const pythonSolutionExplanations: Record<string, string> = {
  "logica-dos-parametros": "primero y segundo reciben los valores de las claves a y b del diccionario data. return primero + segundo suma los enteros y entrega el resultado; no une textos ni devuelve una respuesta fija. La misma operación admite cero y negativos. El número de accesos y sumas es constante dentro de los límites de esta actividad.",
  "python-desempaqueta": "a, b = data asigna los dos elementos a nombres separados. En a, b = b, a se calculan primero los dos valores de la derecha: el intercambio no pierde el valor anterior de a. return a, b crea una tupla que se representa como una lista en JSON. No se escribe sobre data; los casos comparan los valores, no certifican el uso de esta sintaxis.",
  "logica-ficha-resultado": "La ficha devuelta es un diccionario: total guarda precio por unidades y unidades conserva la cantidad recibida. Los nombres de las claves dan significado a ambos valores; su orden no cambia la comparación de este resultado. La referencia consulta data sin modificarlo y crea el diccionario de salida con return.",
  "python-recorre-pares": "data.items() ofrece parejas de clave y valor. sorted ordena esas parejas por clave; el for desempaqueta cada una en clave y valor. str(valor) permite construir el texto con dos puntos y un espacio, sin intentar sumar un texto y un entero. salida acumula los textos con append; sin parejas permanece vacía. El orden final no depende del orden de inserción de las claves. Los resultados no certifican el uso de items.",
  "logica-notas": "El recorrido suma todas las notas en total y cuenta en aprobados las mayores o iguales que 5. Si hay notas, total / len(data) calcula la media sin truncarla. Si no hay, la expresión condicional devuelve None (null en JSON) sin dividir entre cero. Una media válida de 0 no es ausencia: con [0], la salida tiene aprobados igual a 0 y media igual a 0.",
  "python-contactos-edita": "Primero se crea otra agenda y se copia cada ficha con dict(ficha): cambiar la copia no escribe en los diccionarios originales. El nombre buscado se normaliza con strip y lower. Si existe, el recorrido de cambios acepta solo telefono y correo con valor de tipo str. isinstance(valor, str) permite el texto vacío y rechaza None; if valor descartaría un borrado intencional. Las claves desconocidas se ignoran. Si falta el contacto, se devuelve la copia sin cambios; los resultados no certifican identidad ni toda posible mutación intermedia.",
  "logica-prefijos": "resultado empieza en [0], la suma del prefijo vacío. Por cada numero, resultado[-1] recupera el total anterior y append añade ese total más numero. Tras procesar i elementos, la posición i contiene su suma; por eso se devuelven n + 1 valores, o [0] sin datos. Reutilizar el total evita sumar cada prefijo desde cero: tiempo O(n) y espacio O(n) para la lista devuelta.",
  "logica-copia-anidada": "El bucle crea una lista nueva para cada fila mediante list(fila) y la añade a copia. Después solo cambia la celda indicada de esa copia. Copiar únicamente la lista exterior dejaría las filas compartidas: escribir una celda también cambiaría la matriz original. Dos niveles bastan aquí porque las celdas son enteros; no es una receta para estructuras anidadas arbitrarias. El resultado conserva los contenidos de original, pero compararlos no demuestra identidad ni descarta cualquier mutación intermedia.",
  "logica-suma-maxima": "current guarda la mejor suma de un tramo que termina en el valor actual; best guarda la mejor encontrada. Para cada value se elige entre empezar un tramo en value o prolongar el anterior con current + value. Inicializar ambos con data[0] obliga a elegir un tramo no vacío y cubre listas completamente negativas. La referencia recorre data[1:]: tarda O(n), pero esa copia por slice ocupa O(n) de espacio auxiliar. El algoritmo puede usar O(1) auxiliar si evita la copia; esta referencia no lo hace.",
  "logica-cuenta-nodos": "contar devuelve 0 si recibe None (null en JSON), antes de consultar claves. Para un nodo devuelve 1 más los recuentos de left y right. value no interviene: dos nodos con el mismo valor se cuentan por separado. Se visita cada nodo una vez, en tiempo O(n); las llamadas pendientes ocupan espacio proporcional a la altura. La referencia usa value, left y right como modelo del árbol, no las claves históricas v, izq y der.",
};
