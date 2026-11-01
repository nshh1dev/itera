// Revisiones editoriales explícitas: no sustituyen términos dentro de código,
// ejemplos JSON, contratos PROGRAM ni contenido de otros lenguajes.
type EditorialRevision = { statement: string; hints?: string[]; constraints?: string[]; objective?: string };
const statement = (task: string, input: string, output: string) =>
  `Tu tarea\n${task}\n\nEntrada\n${input}\n\nResultado esperado\n${output}`;
const projectStatement = (task: string, input: string, output: string) => statement(
  `${task}\n\nCompleta solo los archivos editables; conserva las firmas, los nombres públicos y los recursos de solo lectura. Define solve(data) en main.py y entrega la respuesta con return: la aplicación proporciona data, sin input().`,
  input,
  `${output}\n\nCada caso parte de un disco aislado limpio dentro del sandbox, no del navegador, del servidor web ni de la base de datos de Itera. Los archivos no se conservan entre casos o envíos. No instales paquetes. Comprueba los límites y casos vacíos aplicables al contrato.`,
);
const compactJson = "Genera guardado.json durante la ejecución, no como recurso inicial. Se evalúa su contenido además del retorno: JSON UTF-8 compacto, sin espacios de separación ni salto final. Usa ensure_ascii=False y separators=(',', ':') al guardar con json.dump. Conserva el recurso inicial sin modificar.";
const persistence = "Persistencia entre procesos: cada caso llama primero a solve con sus comandos y después a solve([]) en un proceso nuevo sobre el mismo directorio, sin reconstruir recursos. cargar() debe preferir guardado.json si existe y usar estado.json solo antes del primer guardado. Recupera desde el archivo, no desde variables globales; conserva el contenido exacto de guardado.json tras ambas llamadas. El siguiente caso reinicia el disco; no se conserva entre envíos.";

export const pythonEditorialRevisions: Record<string, EditorialRevision> = {
  "logica-gastos-registro": { statement: projectStatement(
    "Gestor de gastos, hito 1: registra y resume movimientos. Es un registro de gastos, no un saldo que rechaza retiradas. Usa enteros en céntimos para evitar redondeos; no necesitas archivos de datos ni módulos propios todavía.",
    "data es una lista de hasta 100 fichas, cada una un diccionario con categoria (casa u ocio) e importe, un entero no negativo en céntimos. Se aplica el límite general de enteros hasta 1000.",
    "Devuelve un diccionario con total y porCategoria: suma global y sumas de las categorías presentes. Cero es válido; no añadas categorías ausentes. Para la lista vacía devuelve {'total': 0, 'porCategoria': {}}.",
  ) },
  "logica-gastos-validacion": { statement: projectStatement(
    "Gestor de gastos, hito 2: valida y resume movimientos. Completa pruebas.py para vacío, cero y rechazo; conserva la importación de solve ya preparada. continue salta el resto de la vuelta actual. Este hito tiene contrato e identidad independientes: copia explícitamente archivos del anterior o empieza con la plantilla, sin sobrescribir el original. No necesitas módulos propios ni archivos de datos.",
    "data es una lista de hasta 100 fichas, diccionarios con categoria, un texto, e importe, un entero en céntimos entre -1000 y 1000.",
    "Acepta solo casa u ocio con importe mayor o igual que cero; rechaza los demás sin interrumpir el recorrido. Devuelve un diccionario con total, porCategoria y rechazados: suma aceptada, sumas por categoría aceptada presente y cantidad rechazada. Cero es válido. Vacío devuelve {'total': 0, 'porCategoria': {}, 'rechazados': 0}. Ejecutar tus pruebas no sustituye los casos oficiales ni concede finalización.",
  ) },
  "logica-importa-preparado": { statement: projectStatement(
    "Importa transformar desde reglas.py, que ya está preparado y es de solo lectura. Un módulo es un archivo real con nombres reutilizables: importa y llama su función sin copiar su implementación en main.py. Para importar un nombre se usa from reglas import nombre.",
    "data es un entero entre -1000 y 1000.",
    "Devuelve el resultado de transformar(data), que multiplica el entero por cuatro. Conserva separados main.py y reglas.py. Los casos comprueban el resultado; no certifican por sí solos la organización de los módulos.",
  ) },
  "logica-extrae-modulo": { statement: projectStatement(
    "Separa cuadrado en reglas.py y úsala desde main.py. Completa ambos archivos editables, conservando sus firmas. El nombre que ofrece el módulo debe coincidir con el importado; from reglas import nombre permite reutilizarlo sin copiarlo.",
    "data es un entero entre -1000 y 1000.",
    "Devuelve el cuadrado del entero recibido mediante la función de reglas.py. Mantén separadas la regla y su llamada desde main.py; comparar el retorno no certifica por sí solo esa separación.",
  ) },
  "logica-separa-reglas-io": { statement: projectStatement(
    "Separa negocio y adaptación de entrada/salida. main.py recibe los datos, llama a coste de reglas.py y construye el texto; reglas.py calcula precio por unidades más 3 fijos, sin imprimir ni leer entrada. Una regla pura puede probarse sin terminal ni disco; no la dupliques entre archivos.",
    "data es un diccionario con precio y unidades, enteros entre -1000 y 1000.",
    "Devuelve el texto Total: seguido de un espacio y el coste calculado, sin salto final ni comillas. Conserva la función coste(precio, unidades) y el punto de entrada solve(data); la comparación del texto no certifica por sí sola la separación interna.",
  ) },
  "logica-repara-importacion": { statement: projectStatement(
    "Resuelve un nombre importado incorrecto: el fragmento conceptual pide transformarCuadrado a reglas, pero reglas.py ofrece cuadrado. La plantilla no ejecuta ese import defectuoso; añade la importación correcta. Distingue una ruta inexistente de un nombre no exportado; no sustituyas un módulo local por un paquete.",
    "data es un entero entre -1000 y 1000. reglas.py está preparado y es de solo lectura.",
    "Devuelve cuadrado(data) + 1 desde main.py, usando el nombre disponible en reglas.py. Conserva el recurso preparado y no copies su implementación.",
  ) },
  "logica-organiza-modulos": { statement: projectStatement(
    "Organiza tres módulos: reglas.py calcula el cuadrado, formato.py construye una etiqueta y main.py conecta ambos. Conserva cuadrado(n) y etiqueta(n). La dependencia va del adaptador a reglas y formato; evita imports circulares y trabajo de entrada/salida al importar. No necesitas paquetes externos.",
    "data es un entero entre -1000 y 1000.",
    "Devuelve el texto Resultado: seguido de un espacio y el cuadrado del entero, sin comillas ni salto final. Usa las funciones de los módulos; el retorno no certifica por sí solo su organización.",
  ) },
  "logica-lee-archivo": { statement: projectStatement(
    "Lee el archivo real datos.txt preparado. No sustituyas su lectura por respuestas escritas en el código. with open(ruta, encoding='utf-8') as archivo permite leer texto y cierra el recurso incluso ante un error.",
    "data es el índice -1, 0 o 1. datos.txt es de solo lectura y contiene Sol y Luna en líneas distintas, con salto tras cada línea.",
    "Devuelve la línea seleccionada sin su salto final. El índice -1 indica la última línea. La respuesta debe proceder del archivo leído, no de una lista fija en el código.",
  ) },
  "logica-escribe-archivo": { statement: projectStatement(
    "Lee mensaje.txt, concatena el sufijo, escribe resultado.txt, ciérralo y vuelve a abrirlo. with open cierra el recurso; el modo 'w' reemplaza el contenido. Lee y escribe texto con encoding='utf-8'.",
    "data es el texto del sufijo. mensaje.txt es de solo lectura y contiene Hola, sin salto final.",
    "Devuelve el contenido exacto recuperado de resultado.txt. Ese archivo debe crearse durante la ejecución, no como recurso inicial, y contener el mensaje más el sufijo en UTF-8 sin añadir salto final. Se comprueba tanto el archivo como el retorno: devolver el resultado sin escribir no basta. No modifiques mensaje.txt.",
  ) },
  "logica-valida-json": { statement: projectStatement(
    "Lee y analiza el recurso documento + '.json', y después valida su estructura. No decidas por el nombre del archivo: analizar JSON no valida sus datos. json.load permite analizar un archivo de texto abierto con encoding='utf-8'.",
    "data es un diccionario con documento (valido, negativo, texto, ausente, nulo o booleano) y cantidad, un entero entre -1000 y 1000. Todos esos archivos existen, son de solo lectura y contienen JSON sintácticamente válido. ausente.json existe, pero no contiene la clave limite.",
    "Devuelve exactamente configuracion invalida si el contenido no es un diccionario con limite entero no negativo. Un booleano no es un límite válido, aunque bool sea subclase de int en Python. Si la configuración es válida, devuelve aceptada cuando 0 ≤ cantidad ≤ limite y rechazada en otro caso. Conserva los recursos iniciales y los textos sin tildes ni comillas adicionales.",
  ) },
  "logica-guarda-recupera": { statement: projectStatement(
    "Guarda una lista como JSON, cierra y reabre guardado.json y analiza el texto recuperado. json.dump guarda y json.load analiza; with cierra cada recurso. Aquí controlas los datos escritos: la reapertura es en el mismo proceso, no una prueba de persistencia entre procesos o envíos.",
    "data es una lista de hasta 100 enteros entre -1000 y 1000; puede estar vacía.",
    `Devuelve la lista recuperada del archivo, no directamente data. Conserva su orden y sus repeticiones; vacío guarda [] y devuelve []. ${compactJson}`,
  ) },
  "logica-recupera-archivo-invalido": { statement: projectStatement(
    "Recupera errores esperados de lectura: archivo ausente o JSON que no se puede analizar. Lee y analiza el recurso elegido, sin devolver respuestas fijas por su nombre. No ocultes todos los errores: los fallos de programación deben seguir visibles.",
    "data es el modo ausente, roto o valido. Selecciona respectivamente falta.json, roto.json o valido.json. falta.json no existe; los recursos de solo lectura roto.json y valido.json contienen texto inválido y el número 7, respectivamente.",
    "Devuelve el entero leído o 0 si el archivo no existe o su JSON está roto. Son errores diferentes que requieren recuperación; no modifiques los recursos preparados.",
  ) },
  "logica-actualiza-persistidos": { statement: projectStatement(
    "Actualiza sin perder registros: carga historial.json, añade las entradas en orden, guarda una instantánea nueva en guardado.json y reábrela. Leer-modificar-escribir conserva el recurso inicial. Esta reapertura ocurre en el mismo proceso: no promete persistencia entre procesos, durabilidad ante fallos ni escritura atómica.",
    "data es una lista de hasta 100 enteros entre -1000 y 1000. historial.json es de solo lectura y empieza en [2,4].",
    `Devuelve todos los registros recuperados, incluidos los anteriores y los nuevos en su orden. Sin entradas nuevas conserva [2,4]. ${compactJson}`,
  ) },
  "logica-inventario-modular": { statement: projectStatement(
    "Inventario persistente, hito 1: separa reglas y adaptador, todavía sin almacenamiento. aplicar(stock, movimientos) de reglas.py modifica stock intencionalmente y devuelve el número de rechazos; main.py consulta el estado final. No es la actividad inventario que solo suma cambios y admite negativos.",
    "data es una lista de hasta 100 movimientos, diccionarios con producto (pan o sal) y cambio, un entero entre -1000 y 1000. Empieza con un diccionario stock vacío; un producto sin registrar tiene cero existencias.",
    "Procesa en orden: rechaza sin aplicar un cambio si dejaría existencias negativas; si se acepta, conserva el producto aunque termine en cero. Devuelve un diccionario con stock y rechazados. Sin movimientos devuelve {'stock': {}, 'rechazados': 0}. Mantén la mutación declarada y las reglas separadas del adaptador.",
  ) },
  "logica-inventario-persistente": { statement: projectStatement(
    "Inventario persistente, hito 2: conecta reglas y almacenamiento. aplicar modifica stock intencionalmente sin leer archivos; almacenamiento.py ofrece cargar() y guardar(datos). Puedes copiar explícitamente el hito anterior sin sobrescribirlo. Conserva pruebas.py con sus importaciones y comprobaciones de rechazo, cero y almacenamiento; ejecutar pruebas propias no concede progreso.",
    "data es una lista de hasta 100 movimientos, diccionarios con producto (pan o sal) y cambio, entero entre -1000 y 1000. Carga guardado.json si existe; si no, estado.json, recurso de solo lectura con {'pan': 2}. Los productos ausentes empiezan en cero.",
    `Procesa en orden rechazando, sin aplicar, los cambios que dejarían existencias negativas; conserva productos aceptados con saldo cero. Guarda y reabre la instantánea. Devuelve un diccionario con stock completo y rechazados de esta llamada, no acumulados. No empieces con stock vacío. ${compactJson} Conserva el orden de inserción: stock inicial antes de productos nuevos. ${persistence} La segunda llamada devuelve el mismo stock y rechazados igual a 0.`,
  ) },
  "logica-agenda-operaciones": { statement: projectStatement(
    "Agenda, hito 1: diseña crear y completar sin disco. Separa las reglas en aplicar(tareas, comandos) de reglas.py y conecta main.py. Probar reglas sin almacenamiento permite revisar cada responsabilidad. El acceso libre permite empezar con una plantilla propia.",
    "data es una lista de hasta 100 comandos, diccionarios con accion y titulo. Empieza sin tareas. Los títulos al crear son no vacíos y únicos.",
    "Devuelve la lista de tareas en orden de creación, cada una un diccionario con titulo y hecha, un booleano Python. crear añade al final una tarea con hecha igual a False; completar marca con True las tareas de ese título sin crear ninguna si falta. Ignora acciones desconocidas. Sin comandos devuelve []. True/False se muestran como true/false en JSON.",
  ) },
  "logica-agenda-almacenamiento": { statement: projectStatement(
    "Agenda, hito 2: separa reglas y disco. Continúa mediante una copia explícita del hito anterior, sin sobrescribirlo. almacenamiento.py ofrece cargar() y guardar(datos); aplica las reglas a las tareas cargadas, no a una lista vacía.",
    "data es una lista de hasta 100 comandos, diccionarios con accion y titulo. Los títulos nuevos son no vacíos y únicos. Carga guardado.json si existe; si no, estado.json, de solo lectura, con una tarea de titulo leer y hecha igual a False.",
    `crear añade al final un diccionario con titulo y hecha igual a False; completar pone hecha en True en las tareas de ese título sin crear ninguna si falta. Ignora acciones desconocidas. Guarda, reabre y devuelve todas las tareas en orden de creación, incluidas las anteriores. True/False se representan como true/false en JSON. ${compactJson} Conserva el orden de las tareas y las claves titulo antes de hecha. ${persistence} La segunda llamada devuelve las mismas tareas finales.`,
  ) },
  "logica-agenda-regresion": { statement: projectStatement(
    "Agenda, hito 3: corrige la conexión y conserva pruebas. El fragmento defectuoso aplicar([], comandos) pierde el estado: conecta cargar con aplicar antes de guardar y reabrir. La plantilla mantiene ese fragmento fuera de ejecución. Conserva pruebas.py y sus importaciones; mantén pruebas de reglas y de escritura/reapertura y comprueba completar dos veces sin duplicar ni borrar. Ejecutar pruebas propias no concede progreso ni sustituye los casos oficiales; copia explícitamente archivos del hito anterior sin sobrescribirlo.",
    "data es una lista de hasta 100 comandos, diccionarios con accion y titulo. Los títulos nuevos son no vacíos y únicos. Carga guardado.json si existe; si no, estado.json, de solo lectura, con la tarea leer pendiente (hecha igual a False).",
    `crear añade al final un diccionario con titulo y hecha igual a False; completar pone hecha en True en las tareas del título, sin crear otras. Ignora acciones desconocidas. Devuelve todas las tareas recuperadas en orden de creación; sin comandos conserva el estado cargado, incluida leer pendiente en el primer arranque. Completar dos veces deja la tarea completada una sola vez. True/False se representan como true/false en JSON. ${compactJson} Conserva las claves titulo antes de hecha y el orden de tareas. ${persistence} La segunda llamada devuelve las mismas tareas finales.`,
  ) },
  "logica-saludo": { statement: statement(
    "Escribe una instrucción que muestre el saludo Hola, mundo! en pantalla. Escribe el texto entre comillas en el código, pero no imprimas esas comillas.",
    "No hay datos de entrada. Escribe un programa completo, no una función solve(data).",
    "Muestra una sola línea con Hola, mundo!, respetando coma, espacio y exclamación. Termina la línea sin añadir texto ni líneas vacías.",
  ) },
  "logica-dos-lineas": { statement: statement(
    "Practica el orden de las instrucciones mostrando dos textos en líneas distintas.",
    "No hay datos de entrada. Escribe un programa completo.",
    "Muestra Primera en la primera línea y Segunda en la segunda, con esas mayúsculas y sin comillas. Termina cada línea sin añadir otras líneas ni texto.",
  ) },
  "logica-orden-mensaje": { statement: statement(
    "Reorganiza las instrucciones de la plantilla: las etapas de la receta están en un orden incorrecto.",
    "No hay datos de entrada. Trabaja sobre el programa completo de la plantilla.",
    "Muestra Preparar, Mezclar y Servir, en ese orden, cada palabra en su propia línea terminada. Conserva las mayúsculas y no añadas comillas ni otras líneas.",
  ) },
  "logica-texto-calculo": { statement: statement(
    "Distingue una expresión numérica de un texto: utiliza la suma de 4 y 6 sin comillas para calcular y entre comillas para mostrar sus caracteres.",
    "No hay datos de entrada. Corrige el orden del programa de la plantilla.",
    "Muestra 10 en la primera línea y el texto 4 + 6 en la segunda, con un espacio a cada lado de +. Termina ambas líneas, sin comillas ni texto adicional.",
  ) },
  "logica-guarda-nombre": { statement: statement(
    "Guarda el texto Ada en una variable y utiliza esa variable para mostrar su valor; no vuelvas a escribir el texto en la impresión.",
    "No hay datos de entrada. Completa el programa de la plantilla.",
    "Muestra Ada en una sola línea terminada, sin comillas ni texto adicional. La salida muestra el valor, no el nombre de la variable.",
  ) },
  "logica-guarda-cantidad": { statement: statement(
    "Corrige la impresión de la plantilla: puntos ya guarda 8, pero el programa muestra la palabra puntos en vez de su valor.",
    "No hay datos de entrada. Conserva la asignación preparada en el programa.",
    "Muestra 8 en una sola línea terminada. No muestres puntos ni añadas comillas o texto adicional.",
  ) },
  "logica-actualiza-puntos": { statement: statement(
    "Corrige la actualización de puntos: empieza en 8 y debe aumentar en 3, no reemplazarse por 3. Utiliza el valor actual de la variable para calcular, en lugar de escribir directamente el resultado.",
    "No hay datos de entrada. Trabaja sobre el programa de la plantilla.",
    "Muestra el valor actualizado de puntos: una línea terminada con 11, sin texto adicional.",
  ) },
  "logica-intercambia": { statement: statement(
    "Guarda 3 en una variable y 8 en otra. Intercambia sus valores usando una variable auxiliar y después muestra la primera y la segunda.",
    "No hay datos de entrada. Escribe un programa completo.",
    "Muestra 8 en la primera línea y 3 en la segunda. Termina ambas líneas sin comillas ni texto adicional.",
  ) },
  "logica-suma-cantidades": { statement: statement(
    "Guarda 7 y 5 en dos variables numéricas. Calcula la suma utilizando esas variables y muestra el resultado.",
    "No hay datos de entrada. Escribe un programa completo.",
    "Muestra una línea terminada con 12, sin comillas ni texto adicional.",
  ) },
  "logica-cambio": { statement: statement(
    "Guarda en variables el precio de una compra, 13, y el pago, 20. Calcula el cambio usando una resta entre esos valores.",
    "No hay datos de entrada. Escribe un programa completo.",
    "Muestra el cambio en una línea terminada con 7, sin comillas ni texto adicional.",
  ) },
  "logica-precio-unidades": { statement: statement(
    "Guarda en variables el precio por unidad, 4, y la cantidad comprada, 6. Utiliza una multiplicación entre esos valores para calcular el total.",
    "No hay datos de entrada. Escribe un programa completo.",
    "Muestra el total en una línea terminada con 24, sin comillas ni texto adicional.",
  ) },
  "logica-parentesis": { statement: statement(
    "Corrige la expresión de la plantilla para calcular el doble de la suma de 4 y 3: debe sumar primero y multiplicar después. Puedes usar paréntesis o guardar la suma en una variable.",
    "No hay datos de entrada. Conserva el programa completo de la plantilla.",
    "Muestra una línea terminada con 14, sin comillas ni texto adicional. Multiplicar solo el 3 no cumple el cálculo pedido.",
  ) },
  "python-constante": { statement: statement(
    "Guarda LAPICES_POR_CAJA = 6 y cajas = 3 y calcula el total con esos nombres. Un nombre en MAYÚSCULAS comunica una equivalencia fija por convención: Python no impide reasignarlo. En otro problema, IVA = 0.21 y precio * IVA seguirían el mismo patrón.",
    "No hay datos de entrada. Completa el programa de la plantilla; se compara lo que muestra, no un retorno.",
    "Muestra el total de lápices en una línea terminada con 18, sin texto adicional. La comprobación observa el resultado y no certifica que hayas escrito la constante; esa convención requiere revisar el código.",
  ) },
  "logica-lee-nombre": { statement: statement(
    "Completa el saludo usando la variable nombre que ya crea la plantilla.",
    "La entrada estándar contiene un nombre en una línea. La plantilla ya lo lee; no añadas mensajes para pedirlo.",
    "Muestra una línea con Hola, seguido de un espacio y el nombre recibido. Conserva sus mayúsculas y minúsculas, termina la línea y no añadas comillas ni texto adicional.",
  ) },
  "logica-lee-doble": { statement: statement(
    "Completa la impresión para calcular el doble usando numero. La lectura y la conversión a entero ya están preparadas; consérvalas.",
    "La entrada estándar contiene un entero entre -1000 y 1000 en una línea.",
    "Muestra su doble numérico en una línea terminada, no el texto repetido. Cero produce 0. No añadas mensajes para pedir datos ni texto adicional.",
  ) },
  "logica-lee-suma": { statement: statement(
    "Corrige la plantilla: lee dos valores como texto. Convierte ambos a número para sumar, en vez de unir sus dígitos.",
    "La entrada estándar contiene dos enteros entre -100 y 100, uno por línea.",
    "Muestra la suma numérica en una sola línea terminada. No muestres la concatenación de los textos ni añadas mensajes para pedir datos.",
  ) },
  "logica-mensaje-resultado": { statement: statement(
    "Completa el programa para construir un mensaje de destino usando la ciudad que ya lee la plantilla.",
    "La entrada estándar contiene una ciudad en una línea, sin espacios en los extremos. Puede tener espacios interiores.",
    "Muestra una línea con Destino: seguido de un espacio y la ciudad recibida. Conserva sus mayúsculas y espacios interiores. Termina la línea sin añadir comillas, mensajes de petición ni otras líneas.",
  ) },
  "python-decimal": { statement: statement(
    "Convierte el texto a float, súmale 0.5 y muestra el resultado. float('1.5') produce 1.5; int no acepta ese texto decimal. print muestra 2.0 al sumar 1.5 + 0.5 porque el resultado es float.",
    "La entrada estándar contiene un decimal finito entre -100 y 100 en una línea, con punto como separador. Siempre es válido. La plantilla ya lee el texto, pero no lo convierte.",
    "Muestra el resultado en una línea terminada, con la representación habitual de print para un float, incluido .0 cuando corresponde. No apliques un formato decimal fijo ni añadas mensajes para pedir datos. Escribe un programa completo: se compara su salida, no un retorno.",
  ) },
  "logica-numero-texto": { statement: statement(
    "Construye dos expresiones: suma los números 4 y 2 y une los textos '4' y '2'. No escribas directamente sus resultados.",
    "No hay datos de entrada. Escribe un programa completo.",
    "Muestra 6 en la primera línea y 42 en la segunda. Termina ambas líneas sin comillas ni texto adicional: la primera es una suma numérica y la segunda una unión de textos.",
  ) },
  "logica-booleano": { statement: statement(
    "Cambia listo a True, el booleano verdadero de Python, no el texto 'True'. Conserva la impresión preparada con str y lower; no necesitas modificarla.",
    "No hay datos de entrada. Corrige solo el valor asignado en el programa de la plantilla.",
    "Muestra true en una línea terminada, en minúsculas y sin comillas. Aunque el valor Python se escribe True, este programa exige el texto true en la salida.",
  ) },
  "logica-igualdad": { statement: statement(
    "Completa la comparación de igualdad. La plantilla ya prepara los números y el formato de salida; conserva ambas partes.",
    "La entrada estándar contiene dos enteros entre -1000 y 1000, uno por línea.",
    "Muestra true si son iguales y false si son distintos, en una sola línea terminada y sin comillas. Son los textos exactos en minúsculas que exige este programa, no las representaciones True y False de Python. No añadas mensajes para pedir datos.",
  ) },
  "logica-alcanza": { statement: statement(
    "Comprueba si una cantidad alcanza para pagar algo que cuesta 10. La plantilla ya prepara la lectura y el formato de salida; consérvalos.",
    "La entrada estándar contiene una cantidad entera entre 0 y 100 en una línea.",
    "Muestra true si alcanza, incluida la cantidad 10, y false si no alcanza. Usa una sola línea terminada, en minúsculas y sin comillas: se exigen esos textos, no True o False. No añadas mensajes para pedir datos.",
  ) },
  "logica-deshacer": { statement: statement(
    "Procesa operaciones con historial para poder restaurar estados anteriores. Empieza con valor cero.",
    "data es un diccionario con operaciones, una lista de hasta 100 operaciones. Cada una es una lista [\"sumar\", numero] o [\"deshacer\"].",
    "Devuelve el valor final. Sumar guarda el estado anterior y añade numero; deshacer restaura y retira el último estado guardado. Si no hay historial, deshacer no cambia nada. Sin operaciones devuelve 0.",
  ) },
  "logica-busqueda-recursiva": { statement: statement(
    "Encuentra un objetivo practicando búsqueda binaria recursiva. Las ayudas permiten repasar cómo reducir el intervalo y resolver su caso vacío.",
    "data es un diccionario con numbers, una lista ordenada de hasta 1000 enteros distintos, y target, el objetivo. La lista puede estar vacía; los índices empiezan en cero.",
    "Devuelve el índice de target en la lista original o -1 si no aparece. No devuelvas el valor almacenado en esa posición. Los casos comprueban el resultado, no certifican el uso de recursión.",
  ) },
  "logica-sin-repeticiones": { statement: statement(
    "Encuentra la longitud de la subcadena contigua más larga sin caracteres repetidos. No se permite saltar posiciones dentro de una subcadena.",
    "data es un texto ASCII de hasta 10000 caracteres; puede estar vacío.",
    "Devuelve la longitud máxima como entero, no el propio texto. Cada carácter cuenta, incluidos espacios y signos. Para el texto vacío devuelve 0.",
  ) },
  "logica-ranking": { statement: statement(
    "Ordena los valores distintos de una lista según su frecuencia. Elige cómo contar y después cómo ordenar.",
    "data es una lista de 0 a 1000 enteros entre -100 y 100.",
    "Devuelve cada valor distinto una sola vez, por frecuencia de mayor a menor. Si empatan, coloca primero el menor valor numérico, también con negativos. Para [4, 2, 4, 2, 7] devuelve [2, 4, 7]. Para la lista vacía devuelve [].",
  ) },
  "python-lambda-desempate": { statement: statement(
    "Ordena con dos criterios practicando lambda. lambda palabra: expresion equivale a una auxiliar que devuelve esa expresión. Las tuplas se comparan por su primer componente y después por el segundo; negar una longitud permite invertir solo ese criterio.",
    "data es una lista de hasta 100 palabras formadas por letras a-z; puede estar vacía.",
    "Devuelve una lista nueva por longitud descendente y, en empate, orden alfabético ascendente. Conserva repeticiones y no cambies la entrada. Los casos comprueban el orden, no certifican el uso de lambda.",
  ) },
  "python-formato-decimal": { statement: statement(
    "Practica el formato decimal de Python. f'{numero:.2f}' produce texto con dos decimales; f'{numero:.{d}f}' permite una precisión variable. round devuelve un número y no garantiza ceros finales al convertirlo a texto.",
    "data es un diccionario con numero, un número finito entre -1000 y 1000, y decimales, un entero entre 0 y 4.",
    "Devuelve un texto con exactamente esa cantidad de decimales y punto como separador, siguiendo el formato nativo de Python. Con cero decimales no hay parte decimal. Conserva los ceros finales requeridos. Se usa el redondeo de float, no una regla financiera decimal; los casos no certifican el uso de un f-string.",
  ) },
  "python-consulta-anidada": { statement: statement(
    "Consulta una nota en un registro anidado. get(clave, respaldo) usa el respaldo solo si falta la clave, no si su valor es cero o None. Un diccionario vacío como respaldo del alumno ausente permite continuar la consulta del curso; no convierte en diccionario un valor None ya guardado. En este modelo, los valores de alumno son diccionarios y None solo puede ser una nota. No uses la falsedad de una nota para decidir si está ausente.",
    "data es un diccionario con registro, alumno y curso. registro asocia alumnos con diccionarios de curso a nota. Cada nota es un entero entre 0 y 100 o None (null en JSON). Los diccionarios tienen hasta 100 elementos por nivel.",
    "Devuelve la nota del curso, o None si falta el alumno, el curso o su nota. Cero es una nota válida y debe conservarse. Los casos no certifican el uso de get.",
  ) },
  "logica-inventario": { statement: statement(
    "Acumula los movimientos de cada producto. Este ejercicio permite saldos negativos: no aplica la regla de saldo no negativo del ejercicio de saldo.",
    "data es una lista de hasta 100 movimientos. Cada movimiento es un diccionario con producto, un texto de letras a-z, y cambio, un entero entre -100 y 100.",
    "Devuelve un diccionario con el saldo acumulado por producto. Incluye también los productos cuyo saldo final sea cero; no rechaces cambios que produzcan negativos. Sin movimientos devuelve {}.",
  ) },
  "python-inventario-valora": { statement: statement(
    "Valora un inventario usando céntimos enteros para evitar redondeo de dinero. El valor de cada ficha es cantidad por precio_centimos; construye filas nuevas sin cambiar stock ni guardar archivos.",
    "data es una lista de hasta 100 fichas, cada una un diccionario con nombre, cantidad y precio_centimos. Los nombres son únicos y de letras a-z; cantidad y precio_centimos son enteros entre 0 y 10000.",
    "Devuelve un diccionario con total_centimos y productos. productos contiene diccionarios con nombre y valor_centimos por ficha, ordenados por valor descendente y nombre ascendente en empate. total_centimos suma esos valores. Sin fichas devuelve total_centimos igual a 0 y productos igual a []. No cambies la entrada.",
  ) },
  "python-academia-inscribe": { statement: statement(
    "Inscribe sin sobrescribir notas. El modelo es alumno → curso → nota; copia cada diccionario interior antes de modificarlo. setdefault conserva una clave existente: inscribir no equivale a calificar.",
    "data es un diccionario con registro, alumno y curso. registro es un diccionario de alumnos a diccionarios de cursos y notas, con hasta 100 elementos por nivel.",
    "Devuelve una copia del registro inscribiendo al alumno en el curso con nota None (null en JSON) solo si aún no está inscrito. Crea al alumno si falta. Si el curso ya existe, conserva su nota, incluso cero. No modifiques la entrada. Los casos no certifican el uso de setdefault.",
  ) },
  "python-academia-califica": { statement: statement(
    "Califica solo una inscripción existente. Inscripción y calificación tienen reglas distintas: valida existencia y rango antes de asignar. and evalúa de izquierda a derecha y no continúa cuando una condición es falsa. Comprobar primero que el alumno pertenece al registro permite consultar después su diccionario de cursos sin provocar KeyError por un alumno ausente. Cambiar el orden de esas comprobaciones pierde esa protección.",
    "data es un diccionario con registro, alumno, curso y nota, que es entera. registro asocia alumnos con diccionarios de cursos y notas, con hasta 100 elementos por nivel.",
    "Devuelve una copia: cambia la nota solo si alumno y curso ya existen y 0 ≤ nota ≤ 100, incluidos ambos extremos. En otro caso conserva el registro sin cambios. No inscribas automáticamente ni modifiques la entrada.",
  ) },
  "python-academia-resume": { statement: statement(
    "Resume notas sin confundir cero con ausencia. Excluye solo None al calcular; un promedio necesita al menos una nota. El diccionario de medias puede servir como índice al ordenar nombres.",
    "data es el registro: un diccionario de alumno a diccionario de curso a nota entera entre 0 y 100 o None (null en JSON). Los nombres son de letras a-z y los diccionarios tienen hasta 100 elementos por nivel.",
    "Devuelve un diccionario con medias y clasificacion. medias contiene cada alumno con su promedio de notas no None, o None si no tiene ninguna. clasificacion es una lista con solo los nombres de alumnos con promedio, por media descendente y nombre ascendente en empate. Con registro vacío, medias es {} y clasificacion es [].",
  ) },
  "python-contactos-crea": { statement: statement(
    "Añade un contacto sin duplicar nombres normalizados. Normaliza nombre con strip y lower antes de consultar: ' Ana ' y 'ana' identifican el mismo contacto. Copia también las fichas; los teléfonos son textos para conservar ceros iniciales.",
    "data es un diccionario con agenda, nombre, telefono y correo. agenda usa nombres ya normalizados como claves y diccionarios con telefono y correo como fichas. Los diccionarios tienen hasta 100 elementos por nivel.",
    "Devuelve una copia de agenda. Si el nombre normalizado queda vacío o ya existe, no cambies nada; en otro caso añade la ficha con telefono y correo recibidos. No modifiques la entrada.",
  ) },
  "python-contactos-edita": { statement: statement(
    "Edita solo los campos permitidos de un contacto existente. Normaliza nombre con strip y lower, como al crear. isinstance(valor, str) distingue un texto de None; comprobar solo su verdad rechazaría un texto vacío válido.",
    "data es un diccionario con agenda, nombre y cambios. agenda asocia nombres normalizados con fichas de telefono y correo; cambios es un diccionario de campos y valores. Los diccionarios tienen hasta 100 elementos por nivel.",
    "Devuelve una copia de agenda. Si el contacto existe, actualiza únicamente telefono y correo presentes en cambios con valor de texto; permite texto vacío e ignora otros campos y None (null en JSON). Si falta el contacto, conserva todo sin cambios. No modifiques la entrada.",
  ) },
  "python-contactos-borra": { statement: statement(
    "Elimina un contacto usando la misma normalización que al crear y editar: strip y lower. pop(nombre, None) permite eliminar sin fallar si falta; no se buscan coincidencias parciales.",
    "data es un diccionario con agenda y nombre. agenda asocia nombres normalizados con fichas que son diccionarios con telefono y correo. Los diccionarios tienen hasta 100 elementos por nivel.",
    "Devuelve una copia sin el contacto cuyo nombre completo coincida tras normalizar nombre. Si no existe, conserva todas las fichas. No modifiques la entrada ni borres otros contactos. Los casos no certifican el uso de pop.",
  ) },
  "python-contactos-busca": { statement: statement(
    "Busca contactos que cumplan todos los filtros. in sobre textos busca una parte; normaliza solo para comparar, sin cambiar los datos guardados. Una auxiliar puede rechazar una ficha al encontrar la primera condición incumplida.",
    "data es un diccionario con agenda y filtros. Cada ficha de agenda es un diccionario; telefono y correo pueden faltar y, si existen, son textos. filtros contiene esos campos con valores de texto. Los diccionarios tienen hasta 100 elementos por nivel.",
    "Devuelve una lista de nombres ordenados a-z que cumplan todos los filtros mediante coincidencia parcial e insensible a mayúsculas. Un campo filtrado ausente rechaza la ficha: no equivale a texto vacío. Sin filtros devuelve todos los nombres. No cambies los datos.",
  ) },
  "python-transforma-campo": { statement: statement(
    "Normaliza solo el campo indicado. dict(registro) basta para copiar aquí porque los valores son textos inmutables; strip y lower producen textos nuevos.",
    "data es un diccionario con registro, un diccionario de hasta 100 campos con valores de texto, y campo.",
    "Devuelve una copia donde, si campo existe, su texto quede sin espacios exteriores y en minúsculas. Conserva los demás campos. No crees una clave ausente ni modifiques el registro original.",
  ) },
  "python-transforma-registros": { statement: statement(
    "Aplica reglas a copias de registros. JSON transporta nombres de operaciones, no funciones. Captura ValueError solo en la conversión numérica para que un campo inválido no interrumpa los demás campos o registros.",
    "data es un diccionario con registros, una lista de diccionarios con valores de texto, y reglas, un diccionario que asocia campos con minusculas, trim o numerico. Listas y diccionarios tienen hasta 100 elementos por nivel.",
    "Devuelve las copias en el orden recibido. Aplica lower para minusculas, strip para trim e int para numerico; si int lanza ValueError, usa None (null en JSON) en ese campo. El texto numérico admite signo y espacios, no decimales. Conserva campos sin regla e ignora reglas de campos ausentes. No modifiques los originales. Esta conversión usa int nativo, no la gramática restringida de captura-conversion.",
  ) },
  "logica-busqueda-binaria": { statement: statement(
    "Completa la plantilla practicando búsqueda binaria. Conserva los índices originales: no ordenes ni cortes la lista.",
    "data es un diccionario con numbers, una lista de hasta 10000 enteros distintos en orden ascendente, y target, el objetivo. La lista puede estar vacía; los índices empiezan en cero.",
    "Devuelve el índice de target o -1 si no aparece. No devuelvas el valor de esa posición. Los casos comprueban la respuesta, no certifican la técnica interna.",
  ) },
  "logica-insercion-posicion": { statement: statement(
    "Encuentra la primera posición donde insertar un valor conservando el orden de una lista.",
    "data es un diccionario con numbers, una lista ordenada de hasta 1000 enteros que puede contener duplicados o estar vacía, y target, un entero.",
    "Devuelve el primer índice con valor mayor o igual que target, o la longitud de numbers si no existe. Si ya aparece varias veces, elige su primera posición. Para una lista vacía devuelve 0. No devuelvas cualquier coincidencia ni el valor almacenado.",
  ) },
  "logica-ordena-registros": { statement: statement(
    "Ordena registros respetando dos criterios y la estabilidad de los empates completos.",
    "data es una lista de hasta 100 registros. Cada registro es un diccionario con nombre, un texto de letras a-z, y puntos, un entero entre 0 y 1000.",
    "Devuelve los registros por puntos descendentes y, en empate, por nombre ascendente. Si ambos campos coinciden, conserva su orden original. No elimines registros repetidos; una lista vacía devuelve [].",
  ) },
  "logica-intervalos-suma": { statement: statement(
    "Responde consultas de suma sobre intervalos de una lista.",
    "data es un diccionario con numbers, una lista de hasta 1000 enteros, y consultas, una lista de hasta 100 pares [inicio, fin]. Los índices son válidos e incluyen ambos extremos del intervalo. Si numbers está vacía, consultas también lo está.",
    "Devuelve una lista con la suma de cada intervalo en el orden de las consultas. Un intervalo con inicio igual a fin contiene ese elemento. Sin consultas devuelve [].",
  ) },
  "logica-celda": { statement: statement(
    "Consulta el valor de una celda de una matriz.",
    "data es un diccionario con matriz, una matriz rectangular no vacía de enteros con hasta 20 filas y 20 columnas, y fila y columna, índices válidos desde cero. La matriz se representa como una lista de listas.",
    "Devuelve el entero de la celda indicada por fila y columna, no la fila completa ni sus índices.",
  ) },
  "logica-columnas": { statement: statement(
    "Suma por separado los valores de cada columna de una matriz.",
    "data es una matriz rectangular de enteros con hasta 20 filas y 20 columnas, representada como una lista de listas. Puede estar vacía; si tiene filas, cada una contiene al menos un elemento.",
    "Devuelve una lista con la suma de cada columna en su orden original, no las sumas de las filas. Para una matriz vacía devuelve [].",
  ) },
  "logica-transpuesta": { statement: statement(
    "Obtén la transpuesta de una matriz: sus columnas pasan a ser filas. La primera fila del resultado contiene la primera columna de la entrada, y así sucesivamente.",
    "data es una matriz rectangular de hasta 100 filas y 100 columnas, con al menos una fila y una columna, representada como una lista de listas.",
    "Devuelve una matriz con tantas filas como columnas tenía la entrada y tantas columnas como filas tenía. El elemento en fila i y columna j de la entrada queda en fila j y columna i del resultado.",
  ) },
  "logica-vecinos": { statement: statement(
    "Cuenta los vecinos con valor uno de cada celda de una matriz.",
    "data es una matriz rectangular de ceros y unos de hasta 20 filas y 20 columnas, representada como una lista de listas. Puede estar vacía.",
    "Devuelve una matriz del mismo tamaño con el conteo de cada celda. Solo cuentan sus vecinos válidos arriba, abajo, izquierda y derecha: no incluyas diagonales ni la propia celda. No hay vecinos fuera de la matriz. Para la matriz vacía devuelve [].",
  ) },
  "logica-copia-anidada": { statement: statement(
    "Practica una copia anidada después de aprender matrices: copia cada fila antes de cambiar una celda solo en la copia. Copiar únicamente el contenedor exterior con list o slice no basta. La plantilla solo prepara solve(data); añade las operaciones del reto.",
    "data es un diccionario con matriz, una matriz rectangular no vacía de filas de enteros, fila y columna, índices válidos, y valor. Los enteros están entre -1000 y 1000 y las colecciones tienen hasta 100 elementos por nivel.",
    "Devuelve un diccionario con original y copia. original conserva la matriz recibida; copia contiene valor en la celda indicada y conserva todas las demás celdas. No modifiques las filas originales. Los casos muestran contenidos, no certifican la identidad de las filas ni la ausencia de cualquier mutación intermedia.",
  ) },
  "logica-delimitadores": { statement: statement(
    "Comprueba si los delimitadores de un texto están equilibrados: cada apertura debe cerrarse con el mismo tipo y en el orden correcto.",
    "data es un texto de hasta 1000 caracteres del conjunto ()[]{}; puede estar vacío.",
    "Devuelve True si todas las aperturas y cierres están bien emparejados y anidados; en otro caso devuelve False. El texto vacío está equilibrado. True y False se representan como true y false en JSON. Tener la misma cantidad de aperturas y cierres no basta si el orden o los tipos no coinciden.",
  ) },
  "logica-saldo": { statement: statement(
    "Procesa movimientos en orden, rechazando los que dejarían un saldo negativo. Este modelo es distinto de la acumulación por producto, que sí admite saldos negativos.",
    "data es un diccionario con inicial, un entero entre 0 y 1000, y movimientos, una lista de hasta 100 enteros entre -100 y 100.",
    "Devuelve un diccionario con saldo, el saldo final, y rechazados, la cantidad de movimientos no aplicados. Acepta cada movimiento solo si el saldo resultante es no negativo; si lo rechazas, conserva el saldo y continúa. Alcanzar exactamente cero es válido. Sin movimientos conserva inicial y devuelve 0 rechazados.",
  ) },
  "python-conjunto-seguro": { statement: statement(
    "Practica conjuntos: set elimina duplicados, add incorpora un elemento y discard elimina si existe sin fallar si falta, a diferencia de remove. sorted convierte el conjunto en una lista ordenada serializable.",
    "data es un diccionario con valores, una lista de hasta 100 enteros, y agregar y quitar, dos enteros.",
    "Devuelve los elementos que quedan tras añadir agregar y después descartar quitar, sin repeticiones y de menor a mayor. Si agregar y quitar coinciden, ese valor no queda en el resultado. Quitar un valor ausente no produce error. Los casos no certifican el uso de set.",
  ) },
  "python-union": { statement: statement(
    "Calcula la unión de dos colecciones. Para conjuntos, A | B incluye lo que está en A, en B o en ambos; los elementos compartidos aparecen una sola vez.",
    "data es un diccionario con a y b, listas de hasta 100 enteros cada una. Pueden estar vacías.",
    "Devuelve una lista con todos los valores presentes en al menos una entrada, sin repeticiones y de menor a mayor. Si ambas están vacías, devuelve []. Los casos no certifican el uso de conjuntos ni del operador |.",
  ) },
  "python-interseccion": { statement: statement(
    "Calcula la intersección de dos colecciones. Para conjuntos, A & B conserva solo los elementos compartidos, sin contar sus repeticiones.",
    "data es un diccionario con a y b, listas de hasta 100 enteros cada una. Pueden estar vacías.",
    "Devuelve una lista con los valores presentes en ambas entradas, sin repeticiones y de menor a mayor. Si no comparten valores, devuelve []. Una entrada vacía no comparte valores con otra. Los casos no certifican el uso del operador &.",
  ) },
  "python-diferencia": { statement: statement(
    "Encuentra los requisitos que faltan. Para conjuntos, A - B conserva lo que está en A y no en B; el orden importa: requeridos - disponibles representa faltantes, no sobrantes.",
    "data es un diccionario con disponibles y requeridos, listas de hasta 100 textos de letras a-z cada una. Pueden estar vacías.",
    "Devuelve una lista con los requeridos que no están disponibles, sin repeticiones y en orden alfabético. Sin requisitos faltantes devuelve []. Los casos no certifican el uso de la resta de conjuntos.",
  ) },
  "python-simetrica": { statement: statement(
    "Calcula la diferencia simétrica. Para conjuntos, A ^ B excluye lo compartido y conserva los exclusivos de ambos lados; no equivale a A - B.",
    "data es un diccionario con a y b, listas de hasta 100 enteros cada una. Pueden estar vacías.",
    "Devuelve una lista de valores presentes en exactamente una de las entradas, sin duplicados y de menor a mayor. Los compartidos no aparecen; si no hay exclusivos devuelve []. Los casos no certifican el uso del operador ^.",
  ) },
  "python-subconjunto": { statement: statement(
    "Comprueba si todos los requisitos están disponibles. Para conjuntos, A <= B pregunta si cada elemento de A pertenece a B e incluye la igualdad; A < B exige además que no sean iguales. No compara tamaños: dos conjuntos con igual cantidad de elementos pueden contener valores distintos. El conjunto vacío es subconjunto de cualquier conjunto.",
    "data es un diccionario con disponibles y requeridos, listas de hasta 100 textos cada una. Pueden estar vacías.",
    "Devuelve True si todos los requeridos están disponibles y False en otro caso. Las repeticiones no cuentan como unidades: solo importa la pertenencia. Sin requisitos devuelve True. True y False se representan como true y false en JSON. Los casos no certifican el uso del operador <=.",
  ) },
  "logica-repetido": { statement: statement(
    "Detecta si una lista contiene algún valor repetido.",
    "data es una lista de hasta 1000 enteros; puede estar vacía.",
    "Devuelve True si algún valor aparece más de una vez y False en otro caso. La lista vacía no tiene repeticiones. True y False son booleanos de Python; en JSON se muestran como true y false, sin comillas.",
  ) },
  "logica-deduplica": { statement: statement(
    "Completa el recorrido de la plantilla para eliminar repeticiones. Ya prepara un conjunto para recordar valores y una lista para construir el resultado; no ordenes la entrada.",
    "data es una lista de hasta 1000 enteros; puede estar vacía.",
    "Devuelve otra lista con cada valor una sola vez, conservando el orden de su primera aparición, no el orden numérico. Para la lista vacía devuelve [].",
  ) },
  "logica-frecuencias": { statement: statement(
    "Completa el recorrido y la actualización de contadores de la plantilla. El diccionario de frecuencias ya está preparado.",
    "data es un texto de entre 0 y 1000 letras de a a z.",
    "Devuelve un diccionario que asocie cada letra presente con su cantidad de apariciones. No añadas letras ausentes; el orden de las claves no importa. Para el texto vacío devuelve {}.",
  ) },
  "logica-primer-unico": { statement: statement(
    "Encuentra el primer carácter que aparece exactamente una vez en todo el texto.",
    "data es un texto de letras a-z de hasta 1000 caracteres; puede estar vacío.",
    "Devuelve ese carácter según su posición en el texto, no el orden alfabético. Si no existe, devuelve None, representado como null en JSON. Una letra que reaparece después no es única, aunque se haya visto antes que las demás.",
  ) },
  "logica-anagramas": { statement: statement(
    "Completa el conteo y la comparación de la plantilla para reconocer anagramas. Ya prepara dos tablas con las 26 letras.",
    "data es un diccionario con a y b, textos de hasta 1000 caracteres cada uno, formados por letras ASCII y espacios normales.",
    "Devuelve True si contienen las mismas letras con las mismas cantidades, aunque cambie su orden; ignora mayúsculas y espacios normales. En otro caso devuelve False. Un texto vacío y otro de espacios cumplen la condición. True y False se representan como true y false en JSON.",
  ) },
  "python-crea-grupo": { statement: statement(
    "Añade un nombre a una categoría conservando las listas originales. Copiar solo el diccionario exterior comparte sus listas: crea una lista nueva por categoría. setdefault(categoria, []) devuelve la lista existente o inserta una vacía; append añade un nombre.",
    "data es un diccionario con grupos, un diccionario de categorías a listas de nombres, y categoria y nombre. Los diccionarios y listas tienen hasta 100 elementos por nivel.",
    "Devuelve una copia de grupos con nombre añadido al final de la lista de categoria; crea esa categoría si falta. Conserva las demás categorías, las listas originales y los nombres repetidos. Los casos no certifican el uso de setdefault ni la ausencia de cualquier mutación intermedia.",
  ) },
  "logica-agrupa-registros": { statement: statement(
    "Agrupa registros por categoría conservando el orden de sus nombres.",
    "data es una lista de hasta 100 registros. Cada registro es un diccionario con categoria y nombre, textos no vacíos de letras a-z.",
    "Devuelve un diccionario cuyas claves sean las categorías presentes y cuyos valores sean listas de nombres en orden de aparición dentro de cada categoría. Conserva los nombres repetidos. Sin registros devuelve {}.",
  ) },
  "python-comprension": { statement: statement(
    "Calcula cuadrados practicando una comprensión. [n * n for n in valores] obtiene un resultado por cada valor, igual que un bucle que los añade a una lista; sin filtro no elimina posiciones.",
    "data es una lista de hasta 100 enteros; puede estar vacía.",
    "Devuelve una lista con sus cuadrados en el mismo orden y con las mismas posiciones, incluidas repeticiones. No modifiques la entrada. Para una lista vacía devuelve []. Los casos comprueban la salida, no certifican el uso de una comprensión.",
  ) },
  "python-comprension-filtro": { statement: statement(
    "Selecciona vocales practicando una comprensión con filtro. El if posterior al for decide qué elementos entran; lower permite reconocer también las vocales mayúsculas.",
    "data es un texto ASCII; puede estar vacío.",
    "Devuelve una lista con sus vocales a, e, i, o, u en minúsculas y en orden de aparición. Conserva las vocales repetidas; si no hay vocales devuelve []. Los casos no certifican el uso de una comprensión.",
  ) },
  "python-comprension-condicional": { statement: statement(
    "Sustituye negativos practicando una comprensión condicional. [a if condicion else b for x in valores] obtiene un valor en cada posición; [x for x in valores if condicion] elimina posiciones. Aquí necesitas conservarlas.",
    "data es una lista de hasta 100 enteros; puede estar vacía.",
    "Devuelve otra lista del mismo tamaño, sustituyendo cada negativo por cero y conservando los demás valores en sus posiciones. No elimines elementos ni cambies la entrada. Para una lista vacía devuelve []. Los casos no certifican la sintaxis empleada.",
  ) },
  "python-comprension-dict": { statement: statement(
    "Asocia palabras con longitudes practicando una comprensión de diccionario. {clave: valor for elemento in datos} crea un diccionario, no un conjunto. Una clave repetida reemplaza su valor; la longitud de una misma palabra siempre coincide.",
    "data es una lista de hasta 100 palabras ASCII; puede estar vacía.",
    "Devuelve un diccionario con cada palabra como clave y su longitud como valor. Una palabra repetida aparece como una sola clave. Para la lista vacía devuelve {}. Los casos no certifican el uso de una comprensión.",
  ) },
  "python-iterador": { statement: statement(
    "Crea un único iterador con iter(data) y materialízalo dos veces, sin crear un segundo iterador. iter(lista) crea un recorrido consumible; list(iterador) lo consume hasta agotarlo. Volver a materializar el mismo iterador no reinicia el recorrido.",
    "data es una lista de hasta 100 enteros; puede estar vacía.",
    "Devuelve una lista [primera, resto]: primera contiene todos los elementos al materializar el iterador por primera vez y resto contiene lo que queda al materializarlo de nuevo, es decir, []. La lista original conserva sus elementos. Los casos comprueban los contenidos, no certifican cómo creaste el iterador.",
  ) },
  "python-generador": { statement: statement(
    "Suma cuadrados practicando un generador en lugar de construir una lista intermedia. (n * n for n in valores) entrega cuadrados bajo demanda; sum consume esos valores sin necesitar la lista completa de cuadrados.",
    "data es una lista de hasta 100 enteros; puede estar vacía y contener negativos.",
    "Devuelve la suma de los cuadrados como entero. Para una lista vacía devuelve 0. Las pruebas comprueban el resultado, no el consumo de memoria de una implementación alternativa ni el uso de un generador.",
  ) },
  "python-map": { statement: statement(
    "Practica map con una función auxiliar. map(funcion, valores) devuelve un iterador: llama a funcion al pedir cada resultado, no transforma todos los elementos al crearlo. Pasa la función por nombre, sin llamarla por adelantado. list consume ese iterador y construye la lista para devolver JSON; volver a consumir el mismo iterador ya agotado no repite la transformación.",
    "data es una lista de hasta 100 textos que representan enteros válidos entre -100 y 100. No requiere recuperación de errores; puede estar vacía.",
    "Devuelve una lista con esos enteros duplicados en el mismo orden, no textos repetidos. Para la lista vacía devuelve []. Los casos no certifican el uso de map ni de una auxiliar.",
  ) },
  "python-filter": { statement: statement(
    "Selecciona adultos practicando filter y una auxiliar booleana. filter(predicado, registros) devuelve un iterador: comprueba el predicado al pedir resultados y entrega los registros aceptados sin transformarlos. Para encontrar el siguiente aceptado puede comprobar varios registros; un rechazo no termina el recorrido. Después puedes extraer los nombres. Crear el iterador no construye ya una lista de seleccionados.",
    "data es una lista de hasta 100 registros. Cada registro es un diccionario con nombre y edad, un entero entre 0 y 120.",
    "Devuelve una lista de nombres de quienes tienen al menos 18 años, en orden original y sin quitar repeticiones. Un menor se omite, pero no termina el recorrido: puede haber adultos después. Sin adultos devuelve []. Los casos no certifican el uso de filter.",
  ) },
  "python-agrega": { statement: statement(
    "Resume una lista con sum, min y max. sum([]) es 0; min y max fallan con un iterable vacío si no se proporciona default. default=None representa un extremo ausente sin inventar cero.",
    "data es una lista de hasta 100 enteros; puede estar vacía. Los negativos y cero son datos válidos.",
    "Devuelve un diccionario con total, minimo y maximo: la suma y los dos extremos de la lista. Para una lista vacía, total es 0 y minimo y maximo son None (null en JSON). Los casos no certifican el uso de esas funciones.",
  ) },
  "python-clave-longitud": { statement: statement(
    "Ordena palabras por longitud practicando una clave de ordenación. sorted(palabras, key=len) pasa len sin llamarla: la ordenación la aplica a cada palabra. Es estable: conserva el orden de elementos cuyas claves coinciden.",
    "data es una lista de hasta 100 palabras ASCII; puede estar vacía.",
    "Devuelve una lista nueva ordenada por longitud ascendente. Para longitudes iguales conserva el orden original, no ordenes alfabéticamente los empates. No modifiques la entrada. Los casos comprueban el orden resultante, no certifican el uso de key=len.",
  ) },
  "logica-encadena-retornos": { statement: statement(
    "Pasa datos entre funciones sin variables compartidas: escribe una auxiliar que calcule el producto de precio y unidades y otra que añada 2 de embalaje al subtotal. La plantilla solo prepara solve(data).",
    "data es un diccionario con precio y unidades, enteros entre -1000 y 1000.",
    "Devuelve el entero obtenido al añadir 2 al producto recibido de la primera auxiliar. Usa los retornos para pasar el resultado entre funciones, no print. Los casos comprueban el resultado, no certifican la organización interna.",
  ) },
  "logica-dos-nombres-lista": { statement: statement(
    "Observa un alias: asigna la misma lista a otro nombre y añade nuevo mediante ese alias. No hagas una copia en esta actividad. La plantilla solo prepara solve(data).",
    "data es un diccionario con valores, una lista de hasta 100 enteros, y nuevo, un entero. Los enteros están entre -1000 y 1000.",
    "Devuelve la lista consultada desde el nombre original: debe contener los valores recibidos seguidos de nuevo. Aquí se pide modificar intencionalmente la lista compartida, incluso si estaba vacía. La salida muestra el efecto, pero no certifica identidad por sí sola.",
  ) },
  "logica-reasigna-o-muta": { statement: statement(
    "Distingue reasignación y mutación: conserva la lista en original, asigna su referencia a alias y después reasigna alias a una lista nueva que solo contenga nuevo. La plantilla solo prepara solve(data).",
    "data es un diccionario con valores, una lista de hasta 100 enteros, y nuevo, un entero. Los enteros están entre -1000 y 1000.",
    "Devuelve un diccionario con original y alias. original conserva todos los valores recibidos, sin cambios; alias contiene únicamente nuevo. Una entrada vacía conserva original como []. Los casos muestran los contenidos, no certifican la identidad de las listas.",
  ) },
  "logica-copia-plana": { statement: statement(
    "Copia la lista recibida con list(valores) y añade nuevo solo al final de la copia. Practica una copia independiente, no un alias.",
    "data es un diccionario con valores, una lista de enteros que puede estar vacía, y nuevo, otro entero.",
    "Devuelve un diccionario con original y copia. original conserva los valores recibidos sin el elemento nuevo; copia contiene esos valores seguidos de nuevo. La copia debe ser independiente también con entrada vacía. La comparación de contenidos no certifica identidad por sí sola.",
  ) },
  "logica-conserva-entrada": { statement: statement(
    "Escribe una transformación que conserve su entrada. La plantilla solo prepara solve(data); construye el resultado sin cambiar la lista recibida.",
    "data es un diccionario con valores, una lista de hasta 100 enteros, e incremento, un entero. Los enteros están entre -1000 y 1000.",
    "Devuelve un diccionario con original y ajustados. original conserva la lista recibida; ajustados contiene cada valor más incremento en el mismo orden. Si valores está vacía, ambas listas son []. No cambies valores. El resultado muestra contenidos, no certifica ausencia de cualquier mutación intermedia.",
  ) },
  "logica-registro-compartido": { statement: statement(
    "Crea un alias de ficha y suma cambio a alias['cantidad']. Aquí se pide modificar intencionalmente el diccionario compartido: ambos nombres observan la misma cantidad.",
    "data es un diccionario con ficha, otro diccionario que contiene cantidad, y cambio. cantidad y cambio son enteros entre -1000 y 1000.",
    "Devuelve una lista con ficha['cantidad'] y alias['cantidad'], en ese orden, después del cambio. Ambos valores deben reflejar la cantidad actualizada. La salida muestra el efecto, pero no certifica identidad por sí sola.",
  ) },
  "python-identidad": { statement: statement(
    "Compara contenido e identidad: == compara contenido; is pregunta si es el mismo objeto. Construye original = list(data['valores']), alias = original y copia = list(original). Conserva antes = list(original) y añade nuevo solo al alias. list(...) crea otra lista exterior; si contiene listas o diccionarios, conserva las referencias a esos elementos interiores: es una copia superficial. Asignar alias no crea ninguna copia. Aquí añades un elemento a la lista exterior, sin modificar elementos interiores.",
    "data es un diccionario con valores, una lista de hasta 100 elementos, y nuevo, el elemento que se añade. No modifiques data.",
    "Devuelve un diccionario con antes, original, copia, igual, misma y copiaMisma. antes y copia conservan los valores previos; original refleja el añadido mediante alias. igual compara original y copia por contenido; misma indica si alias is original; copiaMisma indica si copia is original (False). Los booleanos Python True y False se muestran como true y false en JSON. El JSON muestra los efectos; la identidad se entiende revisando el código y sus comparaciones is.",
  ) },
  "python-opcional-seguro": { statement: statement(
    "Define agregar(valor, base=None) para crear una lista nueva cuando se omite base. Llámala una vez por entero sin pasar base. Los valores predeterminados se calculan al definir la función: base=[] compartiría una lista entre llamadas; None permite crearla dentro de cada llamada.",
    "data es una lista de exactamente dos enteros.",
    "Devuelve una lista con los resultados de ambas llamadas, en el mismo orden. Cada resultado contiene solo el entero de esa llamada; la segunda no hereda el primero. Los casos comprueban las listas devueltas, no certifican la firma ni la técnica interna.",
  ) },
  "python-actualiza-diccionario": { statement: statement(
    "Actualiza una copia de un diccionario sin cambiar el original. dict(original) crea un diccionario exterior nuevo y conserva las referencias a sus valores: es una copia superficial. Aquí los valores son enteros inmutables y asignar copia[clave] = nuevo cambia solo esa asociación en la copia, tanto al insertar como al reemplazar, sin eliminar primero la clave. No generalices esta independencia a modificar listas o diccionarios interiores compartidos.",
    "data es un diccionario con valores, un diccionario de hasta 100 claves de texto a enteros, clave, un texto, y nuevo, un entero.",
    "Devuelve una copia de valores con clave asociada a nuevo: reemplaza su valor si ya existía o añade la pareja si faltaba. Conserva las demás parejas y no modifiques el original. Los casos no certifican la técnica interna empleada.",
  ) },
  "python-borra-clave": { statement: statement(
    "Elimina una clave de una copia del diccionario. pop(clave, None) elimina y devuelve el valor si existe o devuelve None sin error si falta. Un valor eliminado igual a cero no indica que faltase la clave.",
    "data es un diccionario con valores, un diccionario de hasta 100 claves de texto a enteros, y clave, el texto que quieres borrar.",
    "Devuelve una copia de valores sin clave. Si no existe, conserva todas las parejas. No modifiques el original; si no quedan parejas, devuelve un diccionario vacío. Los casos no certifican el uso de pop.",
  ) },
  "python-recorre-pares": { statement: statement(
    "Recorre las parejas de un diccionario. d.items() devuelve una vista de parejas (clave, valor); d.keys() y d.values() ofrecen vistas de claves y valores. Se llaman con paréntesis: d.items sin ellos es el método, no la vista. sorted(d.items()) construye una lista de parejas ordenadas por clave; puedes desempaquetar cada pareja durante el recorrido. Aquí no se modifica d mientras se recorre.",
    "data es un diccionario de hasta 100 claves formadas por letras a-z y valores enteros; puede estar vacío.",
    "Devuelve una lista de textos con el formato 'clave: valor', ordenados por clave ascendente. Respeta los dos puntos y el espacio posterior, sin añadir comillas ni saltos de línea. Para un diccionario vacío devuelve []. Los casos no certifican el uso de items.",
  ) },
  "python-lista-registros": { statement: statement(
    "Suma las cantidades de una lista de registros. En el recorrido, cada ficha es un diccionario: ficha['cantidad'] consulta ese campo, no una posición de la lista. Un acumulador se prepara antes del recorrido y se devuelve al terminar.",
    "data es una lista de hasta 100 diccionarios con nombre, un texto, y cantidad, un entero no negativo. Puede estar vacía.",
    "Devuelve el total de cantidades como entero. Cada registro cuenta, aunque se repita el nombre o el registro completo: no agrupes ni elimines repeticiones. Para la lista vacía devuelve 0.",
  ) },
  "logica-valida-divisor": { statement: statement(
    "Valida el divisor antes de calcular un cociente. Distingue un divisor cero de un total cero válido.",
    "data es un diccionario con total y divisor, enteros entre -1000 y 1000. Cuando divisor no es cero, el cociente es entero.",
    "Devuelve None si divisor es cero; en otro caso devuelve total / divisor. Un total cero con divisor válido devuelve 0. None se representa como null en JSON; no escribas null en el código Python.",
  ) },
  "logica-valido-cero-ausente": { statement: statement(
    "Distingue una cantidad ausente, una inválida y una válida. La clave siempre existe: un valor ausente no es una clave que falta.",
    "data es un diccionario con cantidad, un entero entre -1000 y 1000 o None (null en JSON).",
    "Devuelve exactamente el texto ausente si cantidad es None, invalido si es negativa y valido en los demás casos, incluido cero. No añadas tildes, comillas ni espacios a esas etiquetas.",
  ) },
  "logica-localiza-error": { statement: statement(
    "Localiza un error sin provocarlo: el fragmento conceptual consulta valores[indice] sin comprobar límites. La plantilla solo prepara solve(data); escribe la comprobación antes de consultar la posición.",
    "data es un diccionario con valores, una lista de hasta 100 enteros, e indice, un entero. Los enteros están entre -1000 y 1000.",
    "Devuelve el elemento si 0 ≤ indice < longitud de valores. Si indice es negativo o alcanza o supera la longitud, devuelve exactamente el texto indice fuera de rango. Aquí no se aceptan los índices negativos de Python. Una lista vacía no tiene posiciones válidas.",
  ) },
  "logica-captura-conversion": { statement: statement(
    "Define una auxiliar que lance ValueError ante un formato inválido y captura solo ese error desde solve. Convierte con int, sin pasar por float.",
    "data es un texto. Tras quitar espacios exteriores con strip, un entero válido contiene un signo + o - opcional y una o más cifras ASCII del 0 al 9. Se admiten ceros iniciales. Rechaza vacío, palabras, punto decimal, exponentes y guiones bajos.",
    "Devuelve el entero convertido o None si el formato es inválido (null en JSON). Un signo sin cifras no es un entero válido. La comprobación evalúa el resultado; no certifica el uso exacto de try/except.",
  ) },
  "logica-error-dominio": { statement: statement(
    "Define validar(edad): si la edad es negativa, debe lanzar un error con el mensaje edad negativa. Desde solve, llama a esa función y captura ese error para devolver su mensaje.",
    "data es una edad entera.",
    "Devuelve exactamente el texto edad negativa para una edad negativa y aceptada para una edad igual o mayor que cero. La comprobación observa el mensaje; no certifica el uso de raise.",
  ) },
  "logica-recupera-elementos": { statement: statement(
    "Convierte cada texto de forma independiente, capturando solo ValueError por elemento. Usa int sin float; un fallo no debe impedir procesar los siguientes.",
    "data es una lista de hasta 100 textos. Tras strip, cada entero válido tiene un signo + o - opcional y una o más cifras ASCII del 0 al 9. Se admiten ceros iniciales; rechaza vacío, signos sin cifras, palabras, decimales, exponentes y guiones bajos.",
    "Devuelve un diccionario con validos, los enteros convertidos en orden, y rechazados, el número de textos inválidos. Para una lista vacía, validos es [] y rechazados es 0. La comprobación evalúa lista y conteo; no certifica el alcance exacto del try.",
  ) },
  "logica-asercion-normal": { statement: statement(
    "Define una auxiliar triple(n) que multiplique por tres. Dentro de solve, antes de atender data, escribe una aserción que compruebe triple(4) igual a 12. Una aserción fallida interrumpe el programa; imprimir un mensaje de aprobado no la sustituye.",
    "data es un entero.",
    "Devuelve triple(data), no el resultado de la aserción ni un contador de pruebas. La comprobación evalúa el resultado; no certifica que la aserción esté presente.",
  ) },
  "logica-pruebas-limites": { statement: statement(
    "La función mayor de la plantilla contiene un defecto. Escribe aserciones para [], [-4] y [-8, -2], localiza qué supuesto falla y corrige la implementación.",
    "data es la lista de números cuyo máximo debes calcular; puede estar vacía o contener solo negativos.",
    "Devuelve el mayor valor de data o None si está vacía (null en JSON). Las pruebas oficiales cambian la entrada y comparan el resultado; no cuentan las aserciones ni los mensajes que declares.",
  ) },
  "logica-reproduce-fallo": { statement: statement(
    "Reproduce con un caso mínimo el fallo del contador de la plantilla, explica qué supuesto es incorrecto y corrígelo. Debe contar elementos estrictamente positivos.",
    "data es una lista de números que puede estar vacía y contener ceros o negativos.",
    "Devuelve cuántos elementos son mayores que cero. No cuentes el cero ni sumes los valores; para una lista vacía devuelve 0. Un mensaje que declare que las pruebas pasan no acredita la corrección; los casos comprueban el conteo, no certifican tu explicación del fallo.",
  ) },
  "logica-conserva-regresion": { statement: statement(
    "Implementa un descuento y conserva pruebas de sus límites. La plantilla solo prepara solve(data), no contiene una implementación defectuosa. Añade aserciones para total 10, limite 10 → 8 y total 0, limite 0 → 0.",
    "data es un diccionario con total y limite, enteros entre 0 y 1000.",
    "Devuelve el importe después de descontar 2 si total alcanza limite, incluida la igualdad, sin bajar de cero. Si no alcanza el límite, conserva total. La comprobación evalúa el resultado; no certifica que las aserciones de regresión estén presentes.",
  ) },
  "logica-factorial": { statement: statement(
    "Completa el recorrido de la plantilla para calcular un factorial. Ya prepara producto = 1; conserva ese acumulador y devuelve su valor después del bucle.",
    "data es un entero n entre 0 y 15.",
    "Devuelve el producto de los enteros desde 1 hasta n, incluido. Por ejemplo, para 4 es 1 * 2 * 3 * 4 = 24. El factorial de cero se define como 1: no hay vueltas y se conserva el valor inicial.",
  ) },
  "logica-fizzbuzz": { statement: statement(
    "Completa la decisión dentro del bucle de la plantilla para construir FizzBuzz. El recorrido ya está preparado; añade un único valor por número y devuelve la lista al terminar.",
    "data es un entero n entre 0 y 100.",
    "Devuelve una lista para los números de 1 a n, incluidos y en orden: sustituye múltiplos de 3 por el texto Fizz, múltiplos de 5 por Buzz y múltiplos de ambos por FizzBuzz. Conserva los demás como números, no textos. Por ejemplo, 15 debe producir FizzBuzz, no solo Fizz. Para cero devuelve []. Respeta las mayúsculas indicadas.",
  ) },
  "logica-posicion": { statement: statement(
    "Consulta el elemento situado en una posición de una lista. Distingue la posición del valor que contiene.",
    "data es un diccionario con numbers, una lista no vacía de hasta 100 enteros, e index, una posición válida numerada desde cero.",
    "Devuelve el entero de numbers situado en index, no el propio índice ni una lista de un elemento.",
  ) },
  "logica-indices": { statement: statement(
    "Corrige el acceso de la plantilla: ya recorre las posiciones de la lista, pero copia siempre el primer elemento. Conserva su estructura y copia el valor de la posición actual.",
    "data es una lista de 0 a 100 enteros entre -1000 y 1000.",
    "Devuelve una copia con los mismos valores en el mismo orden, incluidas las repeticiones. Para la lista vacía devuelve []. No devuelvas las posiciones en lugar de sus valores.",
  ) },
  "logica-suma-lista": { statement: statement(
    "Completa el recorrido que acumula los valores de una lista. La plantilla ya prepara el total y su devolución.",
    "data es una lista de hasta 1000 enteros entre -1000 y 1000; puede estar vacía.",
    "Devuelve la suma de todos sus elementos como entero. Si está vacía, devuelve 0. Suma los valores, no la cantidad de elementos.",
  ) },
  "logica-maximo": { statement: statement(
    "Corrige la comparación de la plantilla: ya guarda un candidato y recorre la lista, pero compara al revés. Conserva su estructura y cambia solo ese paso.",
    "data es una lista de entre 1 y 100 enteros entre -1000 y 1000. Puede contener negativos y valores repetidos.",
    "Devuelve el valor máximo, no su posición. El máximo puede ser negativo o aparecer varias veces; devuélvelo una sola vez como entero.",
  ) },
  "logica-cuenta-condicion": { statement: statement(
    "Cuenta los valores estrictamente positivos de una lista.",
    "data es una lista de hasta 1000 enteros entre -1000 y 1000; puede estar vacía.",
    "Devuelve cuántos elementos son mayores que cero, no su suma. El cero no cuenta como positivo. Para una lista vacía devuelve 0.",
  ) },
  "logica-longitud-texto": { statement: statement(
    "Calcula la cantidad de caracteres de un texto.",
    "data es un texto ASCII de hasta 1000 caracteres; puede estar vacío.",
    "Devuelve su longitud como entero, contando también espacios y signos. El texto vacío tiene longitud 0.",
  ) },
  "logica-minusculas": { statement: statement(
    "Completa el retorno de la plantilla para convertir el texto a minúsculas. Conserva su estructura y cambia solo ese paso.",
    "data es un texto ASCII de hasta 100 caracteres; puede estar vacío.",
    "Devuelve el texto en minúsculas, conservando espacios, números y signos. No elimines caracteres ni añadas otros. Usa return para entregar el texto convertido.",
  ) },
  "logica-vocales": { statement: statement(
    "Completa el recorrido y su condición para contar vocales. La plantilla ya prepara la conversión a minúsculas y el contador.",
    "data es un texto ASCII de hasta 1000 caracteres; puede estar vacío.",
    "Devuelve cuántas apariciones de a, e, i, o, u contiene, tanto en mayúsculas como en minúsculas. No cuentes otras letras ni vocales acentuadas. El texto vacío devuelve 0.",
  ) },
  "logica-invierte": { statement: statement(
    "Corrige cómo se construye el resultado de la plantilla: ya recorre los caracteres, pero los añade en el orden original.",
    "data es un texto ASCII de hasta 1000 caracteres; puede estar vacío.",
    "Devuelve el texto en orden inverso, conservando todos sus caracteres, incluidos espacios, signos y mayúsculas. El texto vacío devuelve un texto vacío.",
  ) },
  "logica-elimina-caracter": { statement: statement(
    "Elimina todas las apariciones de un carácter de un texto.",
    "data es un diccionario con texto y caracter, ambos textos ASCII. texto tiene hasta 1000 caracteres y caracter tiene exactamente uno.",
    "Devuelve texto sin ninguna aparición de caracter, conservando el orden y los demás caracteres. Distingue mayúsculas de minúsculas. Si no aparece, devuelve el mismo contenido; si no queda ningún carácter, devuelve un texto vacío.",
  ) },
  "logica-palabras": { statement: statement(
    "Cuenta las palabras de un texto: cada palabra es un grupo no vacío de letras separado por espacios.",
    "data es un texto ASCII de hasta 1000 caracteres formado por letras y espacios simples. Puede estar vacío o tener varios espacios seguidos y en los extremos.",
    "Devuelve el número de grupos de letras. Los espacios repetidos no crean palabras vacías. Un texto vacío o formado solo por espacios devuelve 0.",
  ) },
  "python-ordena-numeros": { statement: statement(
    "Ordena números conservando la entrada. En Python, sorted(lista) crea una lista nueva; lista.sort() modifica esa lista y devuelve None. No son intercambiables. Los resultados con nombre se representan con claves de diccionario.",
    "data es una lista de hasta 100 enteros entre -100 y 100; puede estar vacía.",
    "Devuelve un diccionario con original y ordenados. original conserva los valores de entrada en su orden; ordenados contiene esos valores de menor a mayor, con sus repeticiones. Para una lista vacía, ambos valores son []. No modifiques la entrada. Los casos no certifican la técnica interna.",
  ) },
  "python-recorta": { statement: statement(
    "Obtén un tramo de una lista practicando el corte: lista[a:b] copia las posiciones desde a hasta antes de b. A diferencia de consultar un índice, el resultado es otra lista.",
    "data es un diccionario con valores, una lista de hasta 100 enteros, e inicio y fin, enteros que cumplen 0 ≤ inicio ≤ fin ≤ longitud de valores.",
    "Devuelve la lista del tramo desde inicio incluido hasta fin excluido, en el orden original. Si inicio y fin coinciden, devuelve []. No modifiques valores. Los casos no certifican el uso de la sintaxis de corte.",
  ) },
  "python-une-palabras": { statement: statement(
    "Normaliza los espacios de un texto. En Python, texto.split() sin argumento separa por espacios en blanco y omite grupos vacíos; join une textos con un separador. No equivale a split(' '), que puede conservar posiciones vacías.",
    "data es un texto ASCII con palabras separadas por espacios, tabulaciones o saltos de línea. Puede no contener palabras.",
    "Devuelve las mismas palabras separadas por un único espacio, sin espacios en los extremos. Conserva mayúsculas y signos. Si no hay palabras, devuelve un texto vacío. Los casos comprueban el texto, no certifican el uso de split o join.",
  ) },
  "python-desempaqueta": { statement: statement(
    "Desempaqueta los dos valores en a y b y practica su intercambio. a, b = pareja requiere exactamente dos elementos; a, b = b, a calcula primero la derecha y después asigna.",
    "data es una lista de exactamente dos enteros.",
    "Devuelve la pareja invertida, primero el segundo valor y después el primero, sin modificar la lista original. Una tupla devuelta se representa como una lista en JSON; el juez comprueba los valores, no la sintaxis usada.",
  ) },
  "python-enumera": { statement: statement(
    "Numera palabras desde uno practicando enumerate. enumerate(valores, 1) entrega parejas de posición y valor; su segundo argumento cambia el inicio de la numeración y cada pareja se puede desempaquetar en el for.",
    "data es una lista de hasta 100 palabras. Puede estar vacía y contener palabras repetidas.",
    "Devuelve una lista de parejas [posición, palabra] en el orden original, numeradas desde 1. Conserva cada aparición repetida con su posición correspondiente. Para una lista vacía devuelve []. Los casos no certifican el uso de enumerate.",
  ) },
  "python-empareja": { statement: statement(
    "Empareja posiciones de dos listas practicando zip. zip(a, b) entrega valores correspondientes y termina al agotarse cualquiera de las entradas; las parejas pueden desempaquetarse durante el recorrido.",
    "data es un diccionario con a y b, listas de hasta 100 enteros cada una. Pueden tener distinta longitud o estar vacías.",
    "Devuelve una lista de parejas con un elemento de a y otro de b, en ese orden y respetando sus posiciones. Termina al agotarse la lista más corta, sin rellenar posiciones con ceros ni None. Si alguna está vacía, devuelve []. Los casos no certifican el uso de zip.",
  ) },
  "python-retorno-multiple": { statement: statement(
    "Define una función auxiliar que reciba dos enteros y devuelva juntos su suma y su producto. Un return con valores separados por coma devuelve una tupla, que puede desempaquetarse en la llamada; no son dos retornos separados. Ejecutar return termina esa llamada: si hay varios en ramas distintas, la condición decide cuál se alcanza, no su orden de escritura. Una instrucción posterior no continúa esa misma llamada.",
    "data es una lista de exactamente dos enteros. Conserva solve(data) y llama desde ella a la auxiliar.",
    "Devuelve los dos resultados en este orden: suma y producto. Itera representa la tupla como una lista de dos números en JSON. Los casos comprueban los resultados, no certifican la organización en funciones ni el uso de una tupla.",
  ) },
  "logica-ficha-producto": { statement: statement(
    "Consulta el precio de un producto a partir de su ficha.",
    "data es una ficha representada por un diccionario con nombre, un texto ASCII, y precio, un entero entre 0 y 1000.",
    "Devuelve únicamente el precio como entero, incluido 0 si corresponde. El nombre no interviene en el resultado.",
  ) },
  "logica-ausencia": { statement: statement(
    "Distingue un número de la ausencia de valor. Comprueba la ausencia de forma explícita: cero es un número válido, no un dato ausente.",
    "data es un entero entre -100 y 100 o None. En JSON, None se representa como null.",
    "Si hay número, devuelve ese número más uno; si está ausente, devuelve -1. En particular, cero debe producir 1. No uses la falsedad del cero como señal de ausencia.",
  ) },
  "logica-variable-local": { statement: statement(
    "Corrige el uso del parámetro en la función auxiliar de la plantilla: utiliza por error un valor local fijo. Conserva la auxiliar y devuelve su resultado desde solve(data).",
    "data es un entero entre -100 y 100.",
    "La auxiliar debe devolver el número recibido más uno. Devuelve ese resultado, no el valor local fijo de la plantilla.",
  ) },
  "logica-parametro-exterior": { statement: statement(
    "Escribe dentro de solve(data) una auxiliar llamada doble que utilice su parámetro, no el valor exterior. La plantilla solo prepara solve(data): añade las operaciones y la auxiliar del reto.",
    "data es un diccionario con exterior y argumento, enteros entre -1000 y 1000.",
    "Devuelve una lista con dos enteros: el doble de argumento y el valor original de exterior, en ese orden. No cambies exterior. Los casos comprueban los valores, no certifican el uso interno del parámetro.",
  ) },
  "logica-llamadas-independientes": { statement: statement(
    "Escribe una auxiliar cuyo contador empiece en cero en cada llamada y se incremente n veces. Llámala para cada valor recibido: la segunda llamada no hereda el contador de la primera. La plantilla solo prepara solve(data).",
    "data es una lista de exactamente dos enteros entre 0 y 1000.",
    "Devuelve una lista con los resultados de ambas llamadas en el mismo orden. Cada resultado cuenta únicamente sus propios incrementos; una llamada con cero incrementos devuelve 0. Los casos comprueban el resultado, no certifican la organización de las llamadas.",
  ) },
  "logica-sin-estado-global": { statement: statement(
    "Construye una auxiliar que reciba base y tasa como argumentos, sin depender de una tasa exterior fija. La plantilla no contiene aún esa auxiliar.",
    "data es un diccionario con base, un entero, y tasas, una lista de hasta 100 enteros. Todos los enteros están entre -1000 y 1000.",
    "Devuelve una lista con base más cada tasa, en el orden recibido y usando siempre la misma base. No acumules las tasas unas sobre otras. Para tasas vacía devuelve []. La comprobación evalúa los resultados, no la organización interna.",
  ) },
  "logica-retorno": { statement: statement(
    "Practica cómo entregar un resultado desde solve(data) usando return.",
    "data es un entero entre -1000 y 1000. La aplicación proporciona ese valor; no necesitas pedirlo con input().",
    "Devuelve el mismo entero recibido, sin modificarlo. Mostrarlo con print no sustituye al retorno.",
  ) },
  "logica-parametro": { statement: statement(
    "Modifica el retorno de la plantilla para calcular el doble del número recibido.",
    "data es un entero entre -100 y 100; puede ser positivo, negativo o cero.",
    "Devuelve un entero con el doble de data. El doble de cero es cero. Conserva solve(data) y entrega el resultado con return.",
  ) },
  "logica-dos-parametros": { statement: statement(
    "Completa la plantilla para sumar los dos valores recibidos. Ya están guardados en primero y segundo; conserva esos accesos y la función solve(data).",
    "data es un diccionario con las claves a y b, ambas siempre presentes. Sus valores son enteros entre -1000000 y 1000000; pueden ser positivos, negativos o cero.",
    "Devuelve la suma de ambos enteros con return. No devuelvas solo uno de ellos ni un texto con la operación.",
  ) },
  "logica-imprimir-devolver": { statement: statement(
    "Corrige la plantilla: calcula el número recibido más uno, pero lo imprime y devuelve cero. Distingue mostrar un valor de devolverlo.",
    "data es el número que proporciona la aplicación a solve(data).",
    "Devuelve con return el número recibido más uno. El valor mostrado con print no es el resultado que compara la evaluación.",
  ) },
  "logica-predice-valores": { statement: statement(
    "Antes de ejecutar, predice el resultado de esta secuencia: guarda data en x, suma 3 a x y multiplica el valor actualizado por 2. Implementa la secuencia y contrasta tu predicción con los ejemplos.",
    "data es un entero entre -1000 y 1000 que proporciona la aplicación.",
    "Devuelve el entero obtenido al terminar la secuencia. La multiplicación usa el valor posterior a la suma, no el original. La comprobación evalúa el resultado, no si hiciste primero la predicción.",
  ) },
  "logica-tabla-valores": { statement: statement(
    "Construye una tabla de seguimiento: empieza en data, suma 2 y multiplica el valor actualizado por 3. Guarda el estado inicial y cada estado posterior en una variable; no necesitas listas ni bucles.",
    "data es un entero entre -1000 y 1000.",
    "Devuelve un texto con los tres estados separados exactamente por ' -> ', con un espacio a cada lado de la flecha. Por ejemplo, desde 2 devuelve el texto 2 -> 4 -> 12, sin comillas ni salto de línea. La comprobación observa esa traza, no cómo guardaste los estados.",
  ) },
  "logica-minutos-segundos": { statement: statement(
    "Convierte una duración expresada en minutos a segundos. Cada minuto tiene 60 segundos.",
    "data es un entero entre 0 y 1000 que representa la cantidad de minutos.",
    "Devuelve su equivalencia en segundos como entero, sin texto de unidades. Para cero minutos devuelve 0.",
  ) },
  "logica-perimetro": { statement: statement(
    "Calcula el perímetro de un rectángulo: la suma de sus cuatro lados, no su área.",
    "data es un diccionario con base y altura, enteros entre 1 y 1000. Puedes consultar las medidas con data['base'] y data['altura'].",
    "Devuelve el perímetro como entero. Los lados opuestos tienen la misma medida.",
  ) },
  "logica-repara-presupuesto": { statement: statement(
    "Corrige la plantilla de un presupuesto: cobra el envío por cada unidad, pero debe cobrarlo una sola vez.",
    "data es un diccionario con precio (precio por unidad), unidades y envio. precio y unidades son enteros entre 0 y 1000; envio es un entero entre 0 y 100. Puedes consultar cada valor con su clave, por ejemplo data['envio'].",
    "Devuelve el coste total como entero: el coste de las unidades más un único envío. Aunque no haya unidades, se cobra el envío.",
  ) },
  "logica-merienda": { statement: statement(
    "Calcula el coste de una compra y construye un mensaje con su total. No hay descuentos ni envío.",
    "data es un diccionario con unidades y precio, enteros entre 0 y 100. Consulta los valores con data['unidades'] y data['precio']; precio es el importe por unidad.",
    "Devuelve un texto con 'Total: ' seguido del importe entero, sin comillas ni salto de línea. Respeta la mayúscula y el espacio después de los dos puntos. Con cero unidades o precio cero, el texto es Total: 0.",
  ) },
  "logica-elige-mensaje": { statement: statement(
    "Corrige la respuesta del bloque que comprueba si el número es mayor que cero. Conserva la respuesta ya preparada para los demás números.",
    "data es un entero entre -100 y 100.",
    "Devuelve el texto positivo cuando data sea mayor que 0 y no positivo cuando sea 0 o negativo. Conserva exactamente las minúsculas y el espacio de no positivo, sin comillas ni espacios adicionales. Usa return, no print.",
  ) },
  "logica-signo": { statement: statement(
    "Completa la respuesta del último caso de la plantilla. Las respuestas para positivos y negativos ya son correctas.",
    "data es un entero entre -100 y 100.",
    "Devuelve exactamente uno de estos textos: positivo si el número es mayor que 0, negativo si es menor que 0, o cero si es 0. No añadas espacios ni cambies las mayúsculas.",
  ) },
  "logica-dos-requisitos": { statement: statement(
    "Completa el retorno de la plantilla para combinar dos requisitos que deben cumplirse al mismo tiempo. Las dos comparaciones ya están calculadas; conserva su estructura.",
    "data es un entero entre 0 y 100.",
    "Devuelve True si data es múltiplo de 3 y de 5 a la vez; en otro caso devuelve False. Cero cumple ambas condiciones. Devuelve un booleano, no un texto: en JSON, True y False se representan como true y false.",
  ) },
  "logica-alternativas": { statement: statement(
    "Decide si una persona puede acceder: basta con tener invitación o entrada comprada, pero el bloqueo impide siempre el acceso. Practica cómo combinar alternativas y negar una condición.",
    "data es un diccionario con invitacion, entrada y bloqueado. Las tres claves siempre existen y contienen booleanos True o False en Python (true o false en JSON).",
    "Devuelve True si hay al menos una de las dos formas de acceso y la persona no está bloqueada; devuelve False en cualquier otro caso. No devuelvas los textos true o false.",
  ) },
  "logica-tarifa": { statement: statement(
    "Determina la tarifa que corresponde a una edad.",
    "data es una edad entera entre 0 y 120.",
    "Devuelve el entero 0 si la edad es menor de 6, 5 si está entre 6 y 17 (ambos incluidos), y 10 desde los 18 años. No devuelvas un texto ni añadas unidades.",
  ) },
  "python-condicional": { statement: statement(
    "Clasifica una edad practicando una expresión condicional sencilla. La forma 'sí' if condicion else 'no' comprueba la condición y obtiene uno de los dos textos; equivale a un if/else con dos retornos, sin anidar expresiones.",
    "data es una edad entera entre 0 y 120. Conserva solve(data): la aplicación proporciona el valor, sin usar input().",
    "Devuelve el texto adulto desde los 18 años y menor en otro caso, sin comillas ni espacios adicionales. Usa return. Las pruebas comprueban la respuesta, no certifican el uso de una expresión condicional.",
  ) },
  "logica-uno-n": { statement: statement(
    "Corrige el valor que la plantilla añade a la lista: ya recorre el intervalo necesario, pero añade siempre cero. Conserva la estructura y cambia solo ese paso.",
    "data es un entero entre 0 y 100 que proporciona la aplicación a solve(data).",
    "Devuelve la lista de enteros desde 1 hasta data, incluido, en orden ascendente. Para cero devuelve []. Devuelve la lista con return, no cada número por separado.",
  ) },
  "logica-cuenta-atras": { statement: statement(
    "Construye una cuenta atrás que incluya el cero.",
    "data es un entero entre 0 y 100 que indica el número inicial.",
    "Devuelve una lista con data, el entero anterior y así sucesivamente hasta 0, incluido. Para cero devuelve [0], no una lista vacía.",
  ) },
  "logica-suma-uno-n": { statement: statement(
    "Completa la actualización del acumulador en la plantilla: ya recorre los números, pero todavía no los añade al total.",
    "data es un entero entre 0 y 100.",
    "Devuelve la suma de los enteros desde 1 hasta data, incluido. Para cero devuelve 0. Conserva el recorrido de la plantilla y entrega el total con return.",
  ) },
  "logica-tabla": { statement: statement(
    "Construye la tabla de multiplicar del número recibido.",
    "data es un entero entre -10 y 10.",
    "Devuelve una lista de diez enteros: sus productos por 1, 2 y así hasta 10, en ese orden. Conserva los resultados negativos o cero que correspondan; no devuelvas un texto con las operaciones.",
  ) },
  "logica-multiplos": { statement: statement(
    "Cuenta los múltiplos de un divisor en un intervalo. Un múltiplo deja resto cero al dividir por ese divisor.",
    "data es un diccionario con n, un entero entre 0 y 100, y divisor, un entero entre 1 y 20.",
    "Devuelve cuántos enteros entre 1 y n, ambos incluidos, son múltiplos de divisor. No incluyas el cero en el intervalo. Para n igual a cero devuelve 0; se pide la cantidad, no la lista de múltiplos.",
  ) },
  "logica-bucle-roto": { statement: statement(
    "Corrige la actualización del contador: la plantilla intenta sumar desde 1 hasta data, pero avanza de dos en dos y omite valores. No elimines el avance: el bucle no terminaría para entradas positivas.",
    "data es un entero entre 0 y 100.",
    "Devuelve la suma de todos los enteros desde 1 hasta data, incluido, sin saltarte ninguno. Para cero devuelve 0. Conserva el bucle y corrige su avance.",
  ) },
  "python-centinela": { statement: statement(
    "Recoge los elementos anteriores al primer cero, que actúa como centinela. Practica break: termina inmediatamente el bucle más cercano.",
    "data es una lista de hasta 100 enteros entre -100 y 100. Puede estar vacía. Conserva solve(data); no necesitas input().",
    "Devuelve una lista con los elementos anteriores al primer cero, en su orden original. No incluyas ese cero ni los elementos posteriores. Si no hay cero, devuelve todos; para una lista vacía devuelve []. No modifiques la entrada. Las pruebas no certifican el uso de break.",
  ) },
  "python-omite-negativos": { statement: statement(
    "Filtra los valores negativos practicando continue: salta a la siguiente vuelta sin terminar el bucle, a diferencia de break.",
    "data es una lista de hasta 100 enteros entre -100 y 100. Puede estar vacía. Conserva solve(data); la aplicación proporciona los datos.",
    "Devuelve una lista con los valores no negativos en su orden original, conservando ceros y repeticiones. Un negativo no impide recoger valores posteriores. Para una lista vacía devuelve []. Las pruebas comprueban la salida, no certifican el uso de continue.",
  ) },
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
