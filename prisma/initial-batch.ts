import type { SeedExercise } from "./content";

type Revision = Pick<SeedExercise, "statement" | "objective" | "prerequisites" | "practiceGoals" | "prerequisiteSlugs" | "activityType" | "minutes" | "constraints" | "hints" | "tests" | "explanations"> & Partial<Pick<SeedExercise, "python" | "javascript">>;

const explanation = (reasoning: string, steps: string, mistakes: string, python: string, javascript: string) => {
  const shared = `Razonamiento\n${reasoning}\n\nPaso a paso\n${steps}\n\nCoste\nEl trabajo no aumenta con la entrada dentro de los límites indicados: tiempo O(1) y espacio auxiliar O(1). No necesitas memorizar esta notación todavía.\n\nErrores comunes\n${mistakes}`;
  return { python: `${shared}\n\nEn Python\n${python}`, javascript: `${shared}\n\nEn JavaScript\n${javascript}` };
};

// R1: se incorpora como una nueva versión, nunca sobre contenido histórico.
// Los dos primeros casos son ejemplos públicos; el resto permanece en el servidor.
export const initialBatchRevisions: Record<string, Revision> = {
  "tu-primer-resultado": {
    activityType: "OBSERVATION", minutes: 5,
    objective: "Observar cómo la aplicación ejecuta una función y recibe el valor de return.",
    practiceGoals: ["Ejecutar una plantilla sin modificarla.", "Reconocer el valor que entrega return."],
    prerequisites: [], prerequisiteSlugs: [],
    statement: "No necesitas saber programar todavía. En esta actividad de observación ejecutarás un programa que ya está completo y verás el resultado: 7. No tienes que resolver un problema ni cambiar el código.\n\nsolve es el nombre de una función: un bloque de instrucciones. La aplicación la llama por ti. return entrega un resultado; aquí entrega el número 7. Conserva la primera línea de la plantilla.\n\nEntrada\nCada prueba recibe un número llamado data. En esta actividad lo ignoramos.\n\nResultado esperado\nDevuelve siempre el número 7, no el texto \"7\".\n\nPulsa Ejecutar ejemplos para observarlo y después Comprobar solución para registrar esta actividad. Ejecutar ejemplos por sí solo no marca el paso como completado.",
    constraints: ["La entrada es un entero entre 0 y 4 y no se utiliza.", "Esta es la única actividad del lote que ya viene resuelta.", "No necesitas imprimir ni llamar a solve."],
    hints: ["Esta vez aprenderás observando: no falta ninguna instrucción.", "Busca la instrucción que entrega un valor a la aplicación.", "Compara ese valor con la salida de los ejemplos y comprueba sin editar."],
    tests: [
      { input: 0, expected: 7, explanation: "La entrada se ignora: la plantilla entrega el número 7." },
      { input: 1, expected: 7, explanation: "Aunque cambie la entrada, el resultado sigue siendo 7." },
      { input: 2, expected: 7 }, { input: 3, expected: 7 }, { input: 4, expected: 7 },
    ],
    explanations: explanation("La función puede entregar un resultado sin utilizar su entrada. Aquí basta con observar el programa escrito.", "1. La aplicación llama a solve.\n2. Se ejecuta return con el número 7.\n3. La aplicación recibe y muestra ese número.", "No hace falta escribir nada. Imprimir un valor no sustituye a devolverlo. Las comillas convertirían el número en texto.", "def inicia la función y la sangría indica qué instrucciones contiene.", "function inicia la función y las llaves delimitan sus instrucciones."),
  },
  "cambia-un-numero": {
    activityType: "GUIDED", minutes: 5,
    objective: "Cambiar un valor de la plantilla y relacionarlo con el resultado devuelto.",
    practiceGoals: ["Modificar un literal numérico.", "Distinguir un número de un texto entre comillas."],
    prerequisites: ["Ejecutar una plantilla", "Reconocer la instrucción return"], prerequisiteSlugs: ["tu-primer-resultado"],
    statement: "El programa anterior devolvía siempre 7. Ahora haz que devuelva siempre el número 10. Cambia únicamente el número de la línea de return y conserva el resto de la plantilla.\n\nEntrada\nRecibes un entero en data, pero todavía no lo utilizamos.\n\nResultado esperado\nEl número 10 para cualquier entrada. No escribas comillas: 10 es un número y \"10\" es texto.\n\nEjecuta los ejemplos después de editar. Si aún obtienes 7, revisa el valor que entrega tu programa.",
    constraints: ["La entrada es un entero entre 0 y 4 y se ignora.", "Conserva la primera línea y la estructura de la plantilla."],
    hints: ["El resultado todavía no depende de data.", "Solo cambia el valor numérico de la instrucción que entrega la respuesta.", "El nuevo valor es diez; escríbelo como número, sin añadir otra instrucción."],
    tests: [
      { input: 0, expected: 10, explanation: "El valor entregado ahora es 10; el cero de la entrada no se usa." },
      { input: 1, expected: 10, explanation: "La misma respuesta sirve aunque la entrada cambie." },
      { input: 2, expected: 10 }, { input: 3, expected: 10 }, { input: 4, expected: 10 },
    ],
    explanations: explanation("Un literal es un valor escrito directamente en el código. Cambiarlo modifica el resultado fijo.", "1. Localiza el número que seguía a return.\n2. Sustituye 7 por 10.\n3. Ejecuta y observa que ambas entradas producen 10.", "No uses comillas ni cambies el nombre de la función. Añadir una impresión no modifica el valor devuelto.", "Conserva los espacios al principio de la instrucción.", "Conserva las llaves y escribe el número dentro de la función."),
  },
  "devuelve-la-entrada": {
    activityType: "GUIDED", minutes: 7,
    objective: "Usar data para devolver la entrada de cada prueba en lugar de un valor fijo.",
    practiceGoals: ["Reconocer data como el valor recibido en cada prueba.", "Devolver una entrada variable sin modificarla."],
    prerequisites: ["Devolver un número con return"], prerequisiteSlugs: ["cambia-un-numero"],
    statement: "Hasta ahora devolvías siempre un número fijo. Ahora cada prueba entrega un número diferente y debes devolverlo sin cambiarlo. Ese número está disponible con el nombre data.\n\nEntrada\nUn número entero. data toma el valor de esa entrada cada vez que se llama a la función.\n\nResultado esperado\nEl mismo número recibido: con 4 devuelve 4; con 9 devuelve 9. La plantilla entrega siempre cero; sustituye ese valor fijo por el nombre de la entrada. No escribas comillas alrededor de los nombres.",
    constraints: ["−100 ≤ data ≤ 100; la entrada siempre es un entero.", "No leas datos manualmente ni llames a la función."],
    hints: ["La respuesta debe cambiar cuando cambia la entrada.", "Utiliza el nombre que recibe el dato en la primera línea.", "Sustituye solo el valor fijo de return por ese nombre, sin comillas ni operaciones."],
    tests: [
      { input: 4, expected: 4, explanation: "La función recibe 4 y lo devuelve sin ninguna operación." },
      { input: 9, expected: 9, explanation: "Ahora data vale 9; no conserva el valor de la prueba anterior." },
      { input: 0, expected: 0 }, { input: -2, expected: -2 }, { input: 100, expected: 100 }, { input: -100, expected: -100 },
    ],
    explanations: explanation("data representa la entrada de la llamada actual, no un número fijo ni un texto.", "1. La aplicación entrega un número a solve.\n2. Ese número queda disponible como data.\n3. return entrega el valor de ese nombre sin modificarlo.", "Devolver 4 solo resuelve una entrada. Devolver 'data' entrega texto, no el valor recibido.", "Los nombres no llevan comillas; no necesitas convertir la entrada.", "El parámetro data ya existe dentro de solve; no hace falta declararlo de nuevo."),
  },
  "suma-uno": {
    activityType: "GUIDED", minutes: 7,
    objective: "Construir una expresión que sume uno al número recibido.",
    practiceGoals: ["Utilizar el operador + entre números.", "Devolver el resultado de una expresión."],
    prerequisites: ["Usar data para devolver la entrada"], prerequisiteSlugs: ["devuelve-la-entrada"],
    statement: "Devuelve el número recibido más uno. El signo + suma dos números: por ejemplo, 4 + 1 produce 5.\n\nEntrada\nUn entero llamado data.\n\nResultado esperado\nUn entero que sea una unidad mayor. Con 4 devuelve 5; con 9 devuelve 10. Modifica la expresión de return para que no entregue la entrada sin cambios. También debes sumar uno si la entrada es cero o negativa.",
    constraints: ["−100 ≤ data ≤ 100; la entrada siempre es un entero.", "Devuelve un número, no texto."],
    hints: ["La respuesta no es fija: depende del número recibido.", "Combina el dato recibido con una unidad usando una suma.", "Conserva el nombre de la entrada en return y añade la operación necesaria a su derecha."],
    tests: [
      { input: 4, expected: 5, explanation: "Sumamos una unidad: 4 + 1 = 5." },
      { input: 9, expected: 10, explanation: "La misma operación transforma 9 en 10." },
      { input: 0, expected: 1 }, { input: -1, expected: 0 }, { input: 100, expected: 101 }, { input: -100, expected: -99 },
    ],
    explanations: explanation("Una expresión combina valores con operadores. La suma se calcula antes de entregar su resultado.", "1. Toma el valor de data.\n2. Súmale uno.\n3. Devuelve el número calculado.", "No devuelvas un número fijo ni sumes textos. Con −1 la respuesta es 0, no −2.", "+ suma los números y return entrega el resultado de esa suma.", "+ puede unir textos en otros contextos; aquí ambos operandos son números."),
  },
  "el-doble": {
    activityType: "PRACTICE", minutes: 7,
    objective: "Multiplicar la entrada por dos y devolver el resultado.",
    practiceGoals: ["Representar el doble mediante multiplicación.", "Aplicar una operación a entradas positivas, negativas y cero."],
    prerequisites: ["Utilizar data en una expresión", "Devolver un resultado con return"], prerequisiteSlugs: ["suma-uno"],
    statement: "Devuelve el doble del número recibido. El doble de 3 es 6 y el de 5 es 10. En código, el signo * significa multiplicar: por ejemplo, 3 * 2 produce 6.\n\nEntrada\nUn número entero disponible como data.\n\nResultado esperado\nEse número multiplicado por dos. La plantilla devuelve la entrada sin modificarla: construye la operación en la línea del resultado. Inténtalo antes de abrir las pistas.",
    constraints: ["−100 ≤ data ≤ 100; la entrada siempre es un entero.", "El doble de cero es cero; los negativos también se multiplican por dos."],
    hints: ["El doble equivale a reunir dos cantidades iguales.", "La multiplicación permite expresar esa idea con un solo operador.", "Usa la entrada como un factor y la cantidad de copias como el otro; devuelve lo calculado."],
    tests: [
      { input: 3, expected: 6, explanation: "Dos veces 3 es 6." },
      { input: 5, expected: 10, explanation: "Multiplicar 5 por dos da 10; sumar solo dos daría 7." },
      { input: 0, expected: 0 }, { input: -2, expected: -4 }, { input: 100, expected: 200 }, { input: -100, expected: -200 },
    ],
    explanations: explanation("El doble depende del valor recibido. Multiplicar por dos funciona también con cero y negativos.", "1. Lee data.\n2. Calcula el producto por dos.\n3. Devuelve ese producto.", "Sumar dos no calcula el doble en general. No uses un valor fijo como 6 ni escribas el signo ×: el operador es *.", "La multiplicación se escribe con un solo asterisco.", "* multiplica números; no necesitas convertir data."),
  },
  "guarda-un-resultado": {
    activityType: "GUIDED", minutes: 8,
    objective: "Guardar un cálculo en una variable y devolver el valor guardado.",
    practiceGoals: ["Leer una asignación y reconocer el valor guardado.", "Utilizar una variable en una instrucción posterior."],
    prerequisites: ["Sumar una unidad a la entrada", "Reconocer return"], prerequisiteSlugs: ["suma-uno"],
    statement: "Una variable es un nombre que usamos para guardar un valor y utilizarlo después. El signo = guarda en el nombre de la izquierda lo calculado a la derecha; aquí no significa comparar.\n\nLa plantilla ya guarda una suma en resultado. En Python escribe resultado = data + 1; en JavaScript, const resultado = data + 1. Lee esa línea y modifica solo qué valor se devuelve.\n\nEntrada\nUn entero disponible como data.\n\nResultado esperado\nEl valor guardado en resultado: es la entrada más uno. Con 4 devuelve 5. Esta actividad obtiene la misma respuesta que Un número más, pero ahora practicarás cómo utilizar una variable, no otra operación.",
    constraints: ["−100 ≤ data ≤ 100; la entrada siempre es un entero.", "La suma ya está escrita: utiliza el nombre que guarda su resultado."],
    hints: ["Guardar un cálculo no lo entrega automáticamente a la aplicación.", "La variable ya contiene la respuesta; no necesitas repetir la suma.", "Reemplaza el cero final por el nombre escrito a la izquierda de la asignación, sin comillas."],
    tests: [
      { input: 4, expected: 5, explanation: "La suma guarda 5 en resultado; después se entrega ese valor." },
      { input: 9, expected: 10, explanation: "En esta llamada resultado guarda 10." },
      { input: 0, expected: 1 }, { input: -1, expected: 0 }, { input: 100, expected: 101 }, { input: -100, expected: -99 },
    ],
    explanations: explanation("Nombrar un cálculo permite separar los pasos. La variable contiene un valor, no las letras de su nombre.", "1. Calcula data + 1.\n2. Guárdalo en resultado.\n3. Devuelve el valor guardado.", "No devuelvas cero ni el texto 'resultado'. = asigna un valor; no es una pregunta de igualdad.", "La asignación no necesita una palabra de declaración; conserva la sangría de las dos instrucciones.", "const crea un nombre que no vamos a reasignar. La variable se utiliza sin repetir const en return."),
  },
  "lee-un-dato-con-nombre": {
    activityType: "GUIDED", minutes: 10,
    objective: "Obtener una propiedad de un objeto o diccionario y devolver su valor.",
    practiceGoals: ["Reconocer una entrada que agrupa valores con nombre.", "Utilizar el valor de la propiedad a sin confundirlo con su clave."],
    prerequisites: ["Utilizar una variable", "Distinguir entrada y resultado"], prerequisiteSlugs: ["guarda-un-resultado"],
    statement: "Ahora data agrupa valores con nombre. La entrada {\"a\": 3, \"b\": 5} contiene a con valor 3 y b con valor 5. Esta agrupación es un diccionario en Python y un objeto en JavaScript.\n\nPara obtener a, Python usa data['a'] y JavaScript data.a. La plantilla ya guarda ese valor en primero. Modifica solo la respuesta para devolver lo guardado en esa variable.\n\nEntrada\nUn objeto con las propiedades a y b, ambas números enteros.\n\nResultado esperado\nEl valor de a, sin sumarlo ni cambiarlo. Con {\"a\": 3, \"b\": 5}, devuelve 3. No entregues todo el objeto ni el nombre de la propiedad.",
    constraints: ["a y b son enteros entre −100 y 100; ambas propiedades siempre existen.", "El orden de las propiedades no importa."],
    hints: ["Recibir dos valores no significa que debas utilizar ambos.", "El acceso a a ya está hecho antes de return.", "Devuelve el nombre que guarda ese acceso, no un texto ni toda la entrada."],
    tests: [
      { input: { a: 3, b: 5 }, expected: 3, explanation: "Solo se pide a; el valor 5 de b no interviene." },
      { input: { a: 9, b: 2 }, expected: 9, explanation: "primero guarda el valor 9 asociado a la clave a." },
      { input: { a: 0, b: 8 }, expected: 0 }, { input: { a: -2, b: 7 }, expected: -2 }, { input: { a: 100, b: 1 }, expected: 100 }, { input: { b: 100, a: -100 }, expected: -100 },
    ],
    explanations: explanation("Acceder por nombre selecciona un dato dentro de una entrada agrupada. El resultado es un número, no el objeto completo.", "1. Obtén a de data.\n2. Guárdalo en primero.\n3. Entrega primero sin utilizar b.", "No sumes todavía. Devolver 'a' o 'primero' entrega texto. Las claves se consultan por su nombre, no por su posición en el JSON.", "Los corchetes usan la clave de texto 'a'. El nombre de la variable primero va sin comillas.", "El punto accede a la propiedad a; las comillas del JSON no se escriben después del punto."),
  },
  "suma-de-dos-numeros": {
    activityType: "INTEGRATION", minutes: 10,
    python: "def solve(data):\n    primero = data['a']\n    segundo = data['b']\n    return primero + segundo\n",
    javascript: "function solve(data) {\n  const primero = data.a;\n  const segundo = data.b;\n  return primero + segundo;\n}\n",
    objective: "Combinar el acceso a dos propiedades con una suma y devolver el resultado.",
    practiceGoals: ["Obtener los dos números de una entrada agrupada.", "Combinar los valores guardados mediante una suma.", "Resolver entradas diferentes sin fijar la respuesta."],
    prerequisites: ["Acceder a propiedades", "Sumar números", "Utilizar variables y return"], prerequisiteSlugs: ["lee-un-dato-con-nombre", "suma-uno"],
    statement: "Combina lo aprendido: ahora utiliza los dos valores de la entrada para calcular una suma. La plantilla ya obtiene ambos y los llama primero y segundo. Modifica la respuesta para entregar su suma.\n\nEntrada\nUn objeto con dos enteros, a y b.\n\nResultado esperado\nUn número: a más b. Con {\"a\": 3, \"b\": 5}, devuelve 8. Cada prueba puede contener otros valores, incluidos cero y negativos. No escribas la respuesta de un ejemplo como valor fijo.",
    constraints: ["−10⁶ ≤ a, b ≤ 10⁶; ambos son enteros y siempre existen.", "Conserva solve(data); la aplicación proporciona los datos."],
    hints: ["Esta vez necesitas ambos valores, no solo el primero.", "La plantilla ya da nombre a cada número; combina esos nombres con el operador de suma.", "Comprueba qué valor falta en la expresión actual de return y úsalo para completar el cálculo."],
    tests: [
      { input: { a: 3, b: 5 }, expected: 8, explanation: "Obtenemos 3 y 5, y su suma es 8." },
      { input: { a: -2, b: 7 }, expected: 5, explanation: "Sumar 7 a −2 produce 5; los signos forman parte del cálculo." },
      { input: { a: 0, b: 0 }, expected: 0 }, { input: { a: -10, b: -8 }, expected: -18 }, { input: { a: 999, b: 1 }, expected: 1000 },
      { input: { a: 1000000, b: 1000000 }, expected: 2000000 }, { input: { a: -1000000, b: -1000000 }, expected: -2000000 }, { input: { a: 1000000, b: -1000000 }, expected: 0 },
    ],
    explanations: explanation("Accedemos a dos propiedades y combinamos sus valores. La misma expresión sirve para cualquier pareja permitida.", "1. Obtén a y guárdalo en primero.\n2. Obtén b y guárdalo en segundo.\n3. Suma ambos valores y devuelve el resultado.", "No devuelvas solo a ni escribas 8 como respuesta fija. No unas textos: la entrada ya contiene números.", "data['a'] y data['b'] obtienen los enteros. También es correcto sumarlos directamente sin variables intermedias.", "data.a y data.b obtienen los enteros. Las variables const facilitan leer los pasos, pero no son la única solución válida."),
  },
  "compara-con-cero": {
    activityType: "GUIDED", minutes: 10,
    objective: "Obtener un booleano al comparar si un número es mayor que cero.",
    practiceGoals: ["Utilizar una comparación mayor que.", "Distinguir un resultado booleano de un número o un texto."],
    prerequisites: ["Usar la entrada data", "Devolver una expresión"], prerequisiteSlugs: ["devuelve-la-entrada", "el-doble"],
    statement: "Una comparación pregunta si una relación se cumple y produce verdadero o falso. Ese resultado se llama booleano. El signo > significa «mayor que»: 3 > 0 es verdadero y −2 > 0 es falso.\n\nEntrada\nUn número entero disponible como data.\n\nResultado esperado\nUn booleano que indique si data es mayor que cero. El cero no es mayor que sí mismo. Modifica el valor fijo de la plantilla para devolver una comparación. No necesitas escribir un if.\n\nPython escribe True y False; JavaScript, true y false. Los ejemplos de Itera usan JSON y muestran true y false en ambos lenguajes.",
    constraints: ["−100 ≤ data ≤ 100; la entrada siempre es un entero.", "Devuelve un booleano, no las palabras 'true' o 'false' entre comillas."],
    hints: ["La comparación debe dar verdadero solo para números positivos.", "Compara la entrada con cero mediante el operador mayor que.", "Coloca la entrada a la izquierda del operador y el límite a su derecha; devuelve la comparación, no un texto."],
    tests: [
      { input: 3, expected: true, explanation: "3 está por encima de cero, así que la comparación es verdadera." },
      { input: -2, expected: false, explanation: "−2 está por debajo de cero: la comparación es falsa." },
      { input: 0, expected: false }, { input: 1, expected: true }, { input: -100, expected: false }, { input: 100, expected: true },
    ],
    explanations: explanation("La comparación produce directamente el valor booleano requerido; no hay que construir las palabras verdadero o falso.", "1. Toma data.\n2. Pregunta si supera cero.\n3. Devuelve el resultado de esa pregunta.", "No uses mayor o igual: cero debe dar falso. No devuelvas un texto ni el número original.", "El operador > produce True o False. Itera los muestra como true o false al convertirlos a JSON.", "El operador > produce true o false, sin comillas."),
  },
  "elige-con-una-condicion": {
    activityType: "GUIDED", minutes: 12,
    objective: "Elegir una respuesta de texto según se cumpla una condición.",
    practiceGoals: ["Seguir el bloque que selecciona una condición if.", "Devolver respuestas distintas según la entrada.", "Reconocer que return termina la función."],
    prerequisites: ["Comparaciones y booleanos", "Devolver un valor"], prerequisiteSlugs: ["compara-con-cero"],
    statement: "if significa «si»: ejecuta su bloque solo cuando una condición es verdadera. La plantilla ya pregunta si data es mayor que cero. Dentro de ese bloque sustituye el texto \"cambiar\" por \"positivo\". Si la condición no se cumple, el programa continúa y devuelve \"no positivo\".\n\nEntrada\nUn número entero.\n\nResultado esperado\nEl texto \"positivo\" si el número supera cero, o \"no positivo\" en cualquier otro caso, incluido cero. Ahora sí devolvemos textos: necesitan comillas.\n\nPython delimita el bloque con dos puntos y sangría; JavaScript, con llaves. Conserva esa estructura. Un return termina la función, así que no se devuelven las dos respuestas.",
    constraints: ["−100 ≤ data ≤ 100; la entrada siempre es un entero.", "Conserva exactamente los textos indicados, con su espacio y sin mayúsculas."],
    hints: ["Solo se ejecuta el bloque if cuando la comparación es verdadera.", "La respuesta para cero y negativos ya está preparada fuera del bloque.", "Cambia únicamente el texto del return interior por la etiqueta del caso positivo; conserva sus comillas."],
    tests: [
      { input: 3, expected: "positivo", explanation: "3 cumple la condición; el return interior entrega la respuesta y termina la función." },
      { input: -2, expected: "no positivo", explanation: "La condición es falsa, se omite el bloque if y se alcanza la respuesta final." },
      { input: 0, expected: "no positivo" }, { input: 1, expected: "positivo" }, { input: -100, expected: "no positivo" }, { input: 100, expected: "positivo" },
    ],
    explanations: explanation("Una condición permite elegir un camino. El primer return solo se alcanza con positivos; el segundo sirve para los demás.", "1. Evalúa si data supera cero.\n2. Si es así, devuelve 'positivo' y termina.\n3. Si no, continúa y devuelve 'no positivo'.", "Cero no es positivo. No quites las comillas de los textos ni coloques la respuesta final dentro del if.", "La sangría señala las instrucciones que dependen del if; el return final queda al nivel del if.", "Las llaves delimitan el bloque condicional; el return final queda fuera de ese bloque y dentro de solve."),
  },
  "compara-igualdad": {
    activityType: "GUIDED", minutes: 10,
    objective: "Distinguir la asignación de la comparación de igualdad en el lenguaje elegido.",
    practiceGoals: ["Preguntar si dos números son iguales.", "Distinguir asignación, igualdad y comparación de orden."],
    prerequisites: ["Asignar un valor a una variable", "Comparaciones y booleanos"], prerequisiteSlugs: ["guarda-un-resultado", "compara-con-cero"],
    statement: "Guardar un valor no es lo mismo que comparar. Ya usaste = para asignar. Para preguntar si dos números son iguales, Python utiliza == y JavaScript utiliza ===. Una igualdad también produce un booleano.\n\nEntrada\nUn número entero.\n\nResultado esperado\nVerdadero solo si el número es exactamente 10. Con 9 o 11 devuelve falso. La plantilla pregunta si la entrada es mayor que 10: cambia únicamente el operador para preguntar por igualdad. No uses un solo = ni devuelvas textos.",
    constraints: ["−100 ≤ data ≤ 100; la entrada siempre es un entero.", "La salida debe ser un booleano."],
    hints: ["Ser mayor que diez no significa ser igual a diez.", "Reemplaza el operador de orden por el operador de igualdad de tu lenguaje.", "Conserva ambos valores de la comparación. El operador tiene dos signos iguales en Python y tres en JavaScript."],
    tests: [
      { input: 10, expected: true, explanation: "La entrada coincide con el valor buscado: diez." },
      { input: 11, expected: false, explanation: "11 es mayor que 10, pero no es igual: debe dar falso." },
      { input: 9, expected: false }, { input: 0, expected: false }, { input: -10, expected: false }, { input: -100, expected: false }, { input: 100, expected: false },
    ],
    explanations: explanation("La igualdad comprueba coincidencia, no cercanía ni orden. Como la entrada siempre es numérica, comparamos dos números.", "1. Recibe data.\n2. Compara su valor con diez usando igualdad.\n3. Devuelve el booleano producido.", "Un solo = asigna y no sirve para esta comparación. > falla con once. El texto 'true' no es un booleano.", "== compara; = se utiliza para asignar un valor.", "Usamos === para igualdad estricta; no necesitamos conversiones de tipos."),
  },
  "tres-caminos": {
    activityType: "GUIDED", minutes: 12,
    objective: "Seleccionar entre varios bloques usando if, elif o else if, y else.",
    practiceGoals: ["Revisar condiciones en orden y escoger un único caso.", "Utilizar un caso final cuando ninguna condición se cumple."],
    prerequisites: ["Comparar números", "Seguir un bloque if", "Devolver textos"], prerequisiteSlugs: ["elige-con-una-condicion"],
    statement: "Ahora hay tres respuestas posibles. if prueba la primera condición; si no se cumple, elif en Python o else if en JavaScript prueba otra. else es el caso final: no lleva una condición.\n\nLa plantilla ya devuelve \"positivo\" si data supera cero y \"negativo\" si es menor. Completa el último caso sustituyendo el texto \"cambiar\".\n\nEntrada\nUn número entero.\n\nResultado esperado\nEl texto \"positivo\", \"negativo\" o \"cero\", según el valor recibido. Si ninguna de las dos primeras condiciones se cumple, el entero solo puede ser cero. Conserva el orden de los bloques y sus sangrías o llaves.",
    constraints: ["−100 ≤ data ≤ 100; la entrada siempre es un entero.", "Devuelve exactamente uno de los tres textos indicados, sin espacios adicionales."],
    hints: ["Los casos se revisan en orden; no se ejecutan todos.", "Las respuestas para positivos y negativos ya son correctas.", "Completa solo el texto del bloque else con la etiqueta del único entero que no es positivo ni negativo."],
    tests: [
      { input: 3, expected: "positivo", explanation: "Se cumple la primera condición; no se revisan las respuestas posteriores." },
      { input: -2, expected: "negativo", explanation: "La primera condición es falsa y la segunda es verdadera." },
      { input: 0, expected: "cero" }, { input: 100, expected: "positivo" }, { input: -100, expected: "negativo" }, { input: 1, expected: "positivo" }, { input: -1, expected: "negativo" },
    ],
    explanations: explanation("Los tres casos cubren todos los enteros y son excluyentes. El bloque final recoge el único valor que no supera cero ni está por debajo.", "1. Si la entrada es positiva, devuelve su etiqueta.\n2. En otro caso, comprueba si es negativa.\n3. Si tampoco lo es, devuelve 'cero'.", "else no lleva una comparación. No devuelvas 'negativo' para cero ni añadas un espacio al texto de salida.", "elif y else se alinean con if; cada return se escribe dentro de su bloque.", "else if permite una segunda condición y else expresa el caso final sin condición."),
  },
};

export const initialBatchSlugs = Object.keys(initialBatchRevisions);
