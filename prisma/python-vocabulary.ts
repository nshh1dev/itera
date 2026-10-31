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

const jsonSnapshot = "guardar usa json.dump con ensure_ascii=False y separators=(',', ':'): escribe JSON UTF-8 compacto sin salto final. with cierra el archivo antes de reabrirlo con json.load. El juez comprueba guardado.json además del retorno; devolver los datos sin escribir no basta.";
const secondProcess = "La segunda llamada solve([]) ocurre en un proceso nuevo sobre el mismo directorio. cargar intenta leer guardado.json y solo ante FileNotFoundError recurre a estado.json; así recupera el estado final sin variables globales ni reiniciar el recurso. Debe conservar guardado.json con el mismo contenido exacto tras ambas llamadas. El siguiente caso reinicia los archivos: no hay persistencia entre casos ni envíos.";

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
  "logica-gastos-registro": "main.py recorre las fichas, representadas como diccionarios. total suma todos los importes y por_categoria acumula por clave de categoria. get(categoria, 0) usa cero antes del primer movimiento de esa categoría; por eso solo aparecen las categorías presentes, incluso si su importe es cero. Sin movimientos, total permanece en 0 y por_categoria vacío. Los céntimos enteros evitan redondeos. Este hito no usa disco ni un archivo de pruebas: no requiere almacenamiento ni un saldo que rechace retiradas.",
  "logica-gastos-validacion": "main.py comprueba cada movimiento antes de sumar: un importe negativo o una categoria distinta de casa y ocio incrementa rechazados y ejecuta continue. Ese salto evita sumar el movimiento inválido y permite revisar los siguientes. Un importe de cero es válido y registra su categoría. get(c, 0) inicia cada acumulador; sin movimientos, ambos totales y rechazados conservan su estado inicial. pruebas.py importa solve y comprueba vacío, cero válido y categoría rechazada. Ejecutar pruebas propias no concede progreso ni sustituye los casos oficiales; esas tres aserciones no certifican cobertura completa.",
  "logica-importa-preparado": "En main.py, from reglas import transformar obtiene la función del archivo local reglas.py. solve le pasa data y devuelve su resultado; transformar multiplica por cuatro. reglas.py es de solo lectura y ya contiene la implementación: no se copia ni se instala un paquete. Los casos verifican el resultado, pero no certifican por sí solos que la llamada se haya organizado de esta manera.",
  "logica-extrae-modulo": "reglas.py define cuadrado(n) como n * n. main.py importa ese nombre, llama cuadrado(data) y devuelve el entero obtenido. La firma acordada conecta ambos archivos editables: cambiar el nombre en uno sin actualizar el otro rompe la importación. La regla no necesita leer entrada ni imprimir. Comparar el retorno no certifica por sí solo la separación en módulos; abre ambos archivos para seguir la llamada.",
  "logica-separa-reglas-io": "reglas.py calcula coste(precio, unidades) con precio * unidades + 3. main.py obtiene los dos valores del diccionario, llama a coste y convierte el entero con str antes de unirlo al texto 'Total: '. La regla no imprime ni conoce el formato de salida; el adaptador devuelve el texto, sin salto final. Así se puede probar el cálculo sin terminal ni disco. Los casos comparan ese texto, no certifican por sí solos la separación de responsabilidades.",
  "logica-repara-importacion": "reglas.py ofrece cuadrado, no transformarCuadrado. main.py importa el nombre existente con from reglas import cuadrado y devuelve cuadrado(data) + 1. Un archivo local puede existir y aun así no ofrecer el nombre solicitado: cambiarlo por un paquete no corrige ese error. El fragmento defectuoso es conceptual, no una línea activa de la plantilla. El módulo es de solo lectura; la reparación no consiste en renombrarlo ni copiar su cálculo.",
  "logica-organiza-modulos": "main.py importa cuadrado de reglas.py y etiqueta de formato.py. Primero calcula cuadrado(data) y pasa ese entero a etiqueta, que lo convierte con str y antepone 'Resultado: '. El return entrega el texto sin imprimir ni añadir salto final. reglas y formato no necesitan importarse entre sí ni importar main: esta dirección evita una dependencia circular. Los resultados no certifican por sí solos esa organización de los tres archivos.",
  "logica-lee-archivo": "main.py abre datos.txt con encoding='utf-8' y obtiene sus líneas con read().splitlines(). splitlines elimina los separadores: Sol y Luna quedan como textos sin salto final. with cierra el recurso antes de consultar lineas[data]. El índice -1 selecciona la última línea, igual que en una lista. La referencia lee el archivo real de solo lectura; no escribe archivos ni analiza JSON. Ese recurso pertenece al sandbox, no al navegador ni al disco del servidor web.",
  "logica-escribe-archivo": "main.py lee mensaje.txt, une su texto con data y escribe la concatenación en resultado.txt con modo 'w' y encoding='utf-8'. Al salir del segundo with, el archivo se cierra; un tercer with lo reabre y devuelve lo leído. write no añade salto final. mensaje.txt permanece intacto. El juez comprueba resultado.txt además del retorno: una concatenación devuelta sin escribir no basta. Es una reapertura en el mismo proceso, no una prueba de persistencia entre procesos o envíos; no interviene JSON.",
  "logica-valida-json": "main.py selecciona documento + '.json' y analiza el recurso con json.load. Todos los recursos contienen JSON válido, pero no todos tienen la estructura necesaria: primero isinstance(config, dict) descarta None (null en JSON); después get('limite') permite detectar la clave ausente. type(limite) is int excluye booleanos, que isinstance(limite, int) aceptaría, y limite < 0 excluye negativos. Solo entonces se comprueba 0 <= cantidad <= limite. Se devuelven los textos exactos configuracion invalida, aceptada o rechazada. ausente.json existe: le falta la clave, no el archivo. La referencia no escribe ni modifica los recursos.",
  "logica-guarda-recupera": "main.py guarda data en guardado.json mediante json.dump con ensure_ascii=False y separators=(',', ':'). Así produce JSON UTF-8 compacto, sin espacios de separación ni salto final. Después del cierre por with, vuelve a abrir el archivo y devuelve json.load: el retorno procede de lo recuperado, no directamente de data. El juez comprueba también el archivo. La lista conserva orden y repeticiones; vacía se guarda como []. Los datos proceden de la lista controlada por este contrato. La reapertura ocurre en el mismo proceso, no acredita persistencia entre procesos ni envíos.",
  "logica-recupera-archivo-invalido": "main.py elige falta.json, roto.json o valido.json según el modo y realiza la lectura real dentro de try. FileNotFoundError identifica el archivo ausente; json.JSONDecodeError identifica texto que no se puede analizar. Ambos casos esperados devuelven 0; el recurso válido se analiza como el entero 7. La captura no incluye todos los errores: un fallo de programación debe seguir visible. with cierra cualquier archivo abierto; no se escriben ni reparan los recursos de solo lectura.",
  "logica-actualiza-persistidos": "main.py carga la lista de historial.json, añade cada entero de data con append y guarda la lista completa en guardado.json. Conserva el orden y las repeticiones; sin entradas nuevas sigue conteniendo [2,4]. json.dump usa ensure_ascii=False y separators=(',', ':') para producir JSON UTF-8 compacto sin salto final. Tras cerrar con with, json.load reabre la instantánea que se devuelve. El juez comprueba el archivo además del retorno; historial.json permanece de solo lectura. Es lectura-modificación-escritura en un solo proceso, sin garantía de persistencia entre procesos, durabilidad ante fallos ni escritura atómica.",
  "logica-inventario-modular": "main.py crea stock vacío y se lo pasa a aplicar de reglas.py. La regla calcula siguiente con stock.get(clave, 0) más cambio. Si sería negativo, incrementa rechazados sin asignar; en otro caso escribe el nuevo saldo, incluido cero. Esa mutación intencional permite que main devuelva el stock actualizado junto al número de rechazos. Una retirada rechazada de un producto ausente no crea su clave. No se usa almacenamiento.py, estado.json ni guardado.json: este hito separa reglas y adaptador sin disco.",
  "logica-inventario-persistente": `main.py carga stock, llama a aplicar de reglas.py, guarda el stock actualizado y vuelve a cargarlo para construir el retorno. aplicar muta el diccionario solo si el saldo siguiente no es negativo; un rechazo conserva el anterior y cero se mantiene como saldo válido. almacenamiento.py concentra cargar y guardar; estado.json aporta pan con 2 unidades solo antes del primer guardado. Los rechazos se cuentan por llamada, no se guardan en el stock. ${jsonSnapshot} El orden de inserción conserva el stock inicial antes de los productos nuevos. ${secondProcess} En esa segunda llamada se devuelve el mismo stock con rechazados igual a 0. pruebas.py comprueba retirada rechazada sin cambio de stock, saldo cero y escritura/reapertura; no crea por sí sola un proceso nuevo. Ejecutar pruebas propias no concede progreso ni sustituye los casos oficiales.`,
  "logica-agenda-operaciones": "main.py empieza con una lista vacía y llama a aplicar de reglas.py. crear añade un diccionario con titulo y hecha igual a False; completar recorre las tareas y cambia hecha a True solo donde coincide el título. Si no existe, no crea otra tarea. Las acciones desconocidas no entran en ninguna rama y se ignoran. append conserva el orden de creación; sin comandos la lista queda vacía. True y False son booleanos de Python, representados como true y false en JSON. Este hito no carga ni guarda archivos.",
  "logica-agenda-almacenamiento": `main.py pasa cargar() a aplicar de reglas.py, guarda las tareas resultantes y devuelve una nueva carga. Empezar con [] descartaría leer, la tarea pendiente de estado.json. Las reglas añaden al final una tarea con titulo y hecha igual a False o marcan las existentes con True; no crean tareas al completar un título ausente e ignoran acciones desconocidas. Los booleanos se representan como false/true en JSON. almacenamiento.py concentra la lectura y escritura. ${jsonSnapshot} Se conserva el orden de tareas y las claves titulo antes de hecha. ${secondProcess} Sin comandos se devuelven las mismas tareas finales; no se reinicia la agenda.`,
  "logica-agenda-regresion": `La reparación en main.py conecta aplicar(cargar(), data) en vez de aplicar([], data): las reglas reciben el estado existente antes de guardar y reabrir. reglas.py crea tareas con hecha igual a False, completa las coincidentes con True sin crear otras y omite acciones desconocidas. Completar dos veces solo repite la asignación True; no duplica ni elimina tareas. True y False se representan como true y false en JSON. almacenamiento.py conserva la frontera de disco. ${jsonSnapshot} Mantiene el orden de tareas y las claves titulo antes de hecha. ${secondProcess} La segunda llamada devuelve las mismas tareas finales. pruebas.py cubre reglas y, después de guardar una tarea repasar, verifica solve([]) y completar dos veces. Esas llamadas propias son en el mismo proceso: no sustituyen la segunda invocación oficial en proceso nuevo. Ejecutar pruebas propias no concede progreso ni certifica cobertura completa.`,
};
