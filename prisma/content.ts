import type { Json, Level } from "../src/lib/types";
import { programExercises } from "./program-content";
import { introductoryExercises } from "./introductory-content";
import { foundationExercises } from "./foundation-content";
import { beginnerRevisions } from "./beginner-revisions";
import { learningMetadata, historicalPracticeGoals } from "./learning-metadata";
import { collectionsExercises, collectionsRevisions } from "./collections-content";
import { textExercises, textRevisions } from "./text-content";
import { maximaExercises, maximaRevisions } from "./maxima-content";
import { searchExercises, searchRevisions } from "./search-content";
import { rotationExercises, rotationRevisions } from "./rotation-content";
import { initialBatchRevisions } from "./initial-batch";
import { beginnerExpansion } from "./beginner-expansion";
import { intermediateExpansion } from "./intermediate-expansion";
import { advancedExpansion } from "./advanced-expansion";
import type { ActivityType } from "../src/lib/types";
import type { RuntimeMode } from "../src/lib/types";
import { curriculumExpansion } from "./curriculum-expansion";
import { typescriptVariant } from "./typescript-content";

// Reclasificación editorial acordada al completar el currículo. Se aplica sobre el
// catálogo ya compuesto para no reescribir las fuentes históricas ni los identificadores:
// ocho intermedios pasan a principiantes y tres avanzados altos a intermedios.
const levelOverrides: Record<string, Level> = {
  "repite-con-while": "BEGINNER",
  "recorre-por-indices": "BEGINNER",
  "maximo-de-una-lista": "BEGINNER",
  "primer-valor-o-ausencia": "BEGINNER",
  "quita-los-espacios": "BEGINNER",
  "filtra-letras-y-digitos": "BEGINNER",
  "compara-dos-textos": "BEGINNER",
  "reduce-vueltas-completas": "BEGINNER",
  "ventana-sin-repeticiones": "INTERMEDIATE",
  "unir-intervalos": "INTERMEDIATE",
  "suma-maxima": "INTERMEDIATE",
};

export type SeedExercise = {
  slug: string; title: string; description: string; category: string; level: Level; minutes: number;
  statement: string; constraints: string[]; hints: string[]; python: string; javascript: string; typescript?: string; explanation: string;
  tests: { input: Json; expected: Json; explanation?: string }[];
  starters?: { python: string; javascript: string; typescript?: string };
  objective?: string; prerequisites?: string[];
  practiceGoals?: string[]; prerequisiteSlugs?: string[]; activityType?: ActivityType;
  runtimeMode?: RuntimeMode;
  typescriptContract?: string;
  complexity?: string; commonErrors?: string[];
  explanations?: { python: string; javascript: string; typescript?: string };
  statements?: { python: string; javascript: string; typescript: string };
};

const t = (input: Json, expected: Json) => ({ input, expected });
const base = (slug: string, title: string, category: string, level: Level, minutes: number, statement: string,
  python: string, javascript: string, tests: SeedExercise["tests"], hints: string[], explanation: string, constraints: string[] = [], starters?: SeedExercise["starters"]): SeedExercise => ({
  slug, title, description: statement.split(". ")[0] + ".", category, level, minutes, statement, python, javascript, tests, hints, explanation, starters,
  constraints: ["Implementa solve(data) y devuelve el resultado; no leas la entrada manualmente.", ...constraints],
});

export const exercises: SeedExercise[] = [
  ...programExercises,
  ...introductoryExercises,
  base("suma-de-dos-numeros", "Dos números, una suma", "Fundamentos", "BEGINNER", 5,
    "Recibe un objeto con dos números enteros, a y b, y devuelve su suma. Un primer paso pequeño para empezar a pensar en entradas, operaciones y resultados.",
    "def solve(data):\n    return data['a'] + data['b']",
    "function solve(data) {\n  return data.a + data.b;\n}",
    [t({a: 3,b: 5},8),t({a: -2,b: 7},5),t({a: 0,b: 0},0),t({a: -10,b: -8},-18),t({a: 999,b: 1},1000)],
    ["data contiene dos propiedades: a y b.", "Accede a ambos valores y utiliza el operador +.", "Devuelve la suma con return, en lugar de imprimirla."],
    "Primero obtenemos a y b de la entrada. Después usamos + para sumar sus valores y return para entregar el resultado. Si a vale 3 y b vale 5, obtenemos 8. En Python se accede con data['a']; en JavaScript, con data.a.", ["−10⁶ ≤ a, b ≤ 10⁶."], {
      python: "def solve(data):\n    primero = data['a']\n    segundo = data['b']\n    # Devuelve la suma de primero y segundo.\n    return primero\n",
      javascript: "function solve(data) {\n  const primero = data.a;\n  const segundo = data.b;\n  // Devuelve la suma de primero y segundo.\n  return primero;\n}\n",
    }),
  base("par-o-impar", "¿Par o impar?", "Fundamentos", "BEGINNER", 5,
    "Recibe un número entero y devuelve true si es par o false si es impar. El cero también es par.",
    "def solve(data):\n    return data % 2 == 0", "function solve(data) {\n  return data % 2 === 0;\n}",
    [t(8,true),t(3,false),t(0,true),t(-4,true),t(-7,false)],
    ["Un número par puede dividirse entre dos sin resto.", "El operador % devuelve el resto de una división.", "Compara data % 2 con cero."],
    "El resto de dividir por dos identifica la paridad, también para negativos. Tiempo y espacio O(1).", ["La entrada es un entero entre −10⁶ y 10⁶."]),
  base("el-mayor-de-tres", "El mayor de tres", "Fundamentos", "BEGINNER", 8,
    "Recibe un arreglo de exactamente tres números y devuelve el mayor. Puede haber números repetidos o negativos.",
    "def solve(data):\n    mayor = data[0]\n    for numero in data:\n        if numero > mayor:\n            mayor = numero\n    return mayor", "function solve(data) {\n  let mayor = data[0];\n  for (const numero of data) {\n    if (numero > mayor) {\n      mayor = numero;\n    }\n  }\n  return mayor;\n}",
    [t([3,9,2],9),t([-8,-2,-5],-2),t([1,1,1],1),t([0,4,4],4),t([100,2,3],100)],
    ["Empieza considerando el primer número como candidato.", "Compara ese candidato con cada uno de los restantes.", "Actualiza el candidato solo cuando encuentres un valor mayor."],
    "Podemos mantener el máximo mientras recorremos los tres valores o utilizar la función estándar. Al ser tres elementos, el coste es constante.", ["El arreglo siempre contiene tres enteros."]),
  base("contar-vocales", "Cuenta las vocales", "Cadenas", "BEGINNER", 10,
    "Recibe una cadena y devuelve cuántas vocales contiene. Cuenta a, e, i, o, u tanto en mayúscula como en minúscula; las vocales acentuadas no forman parte de este ejercicio.",
    "def solve(data):\n    contador = 0\n    for letra in data.lower():\n        if letra in 'aeiou':\n            contador = contador + 1\n    return contador", "function solve(data) {\n  let contador = 0;\n  for (const letra of data.toLowerCase()) {\n    if ('aeiou'.includes(letra)) {\n      contador = contador + 1;\n    }\n  }\n  return contador;\n}",
    [t("Hola mundo",4),t("Itera",3),t("",0),t("AEIOU",5),t("rhythm",0)],
    ["Convierte el texto a minúsculas para simplificar las comparaciones.", "Recorre el texto y comprueba si cada carácter pertenece a aeiou.", "Incrementa un contador por cada vocal encontrada."],
    "Normalizamos mayúsculas y contamos caracteres del conjunto de cinco vocales. El recorrido tarda O(n).", ["0 ≤ longitud ≤ 1000; caracteres ASCII."]),
  base("invertir-cadena", "Palabras al revés", "Cadenas", "BEGINNER", 8,
    "Recibe una cadena y devuelve otra con sus caracteres en orden inverso. Conserva los espacios y las mayúsculas.",
    "def solve(data):\n    resultado = ''\n    for letra in data:\n        resultado = letra + resultado\n    return resultado", "function solve(data) {\n  let resultado = '';\n  for (const letra of data) {\n    resultado = letra + resultado;\n  }\n  return resultado;\n}",
    [t("itera","areti"),t("Hola mundo","odnum aloH"),t("",""),t("a","a"),t("123","321")],
    ["El último carácter de la entrada debe ser el primero de la salida.", "Puedes recorrer los índices desde el final hasta el principio.", "También puedes usar slicing en Python o invertir un arreglo de caracteres en JavaScript."],
    "Empezamos con un texto vacío. Colocamos cada letra delante del resultado anterior: con abc obtenemos a, después ba y finalmente cba. Esta versión prioriza la claridad; construir repetidamente cadenas puede costar tiempo cuadrático. Más adelante puedes comparar alternativas como slicing o reverse.", ["Cadena ASCII de hasta 1000 caracteres."]),
  base("factorial", "Un producto en cadena", "Fundamentos", "BEGINNER", 10,
    "Recibe un entero n y devuelve su factorial: el producto de todos los enteros desde 1 hasta n. Por definición, el factorial de cero es 1.",
    "def solve(data):\n    result = 1\n    for n in range(2, data + 1):\n        result *= n\n    return result", "function solve(data) {\n  let result = 1;\n  for (let n = 2; n <= data; n++) result *= n;\n  return result;\n}",
    [t(5,120),t(0,1),t(1,1),t(8,40320),t(10,3628800)],
    ["Necesitas un acumulador para el producto.", "Inicialízalo en 1, no en 0.", "Multiplica el acumulador por cada entero desde 2 hasta n."],
    "Un acumulador guarda el producto parcial. Si n es cero, el bucle no se ejecuta y el resultado sigue siendo 1. Tiempo O(n), espacio O(1).", ["0 ≤ n ≤ 15."]),
  base("suma-del-arreglo", "Todo suma", "Arreglos", "BEGINNER", 8,
    "Recibe un arreglo de números y devuelve la suma de todos sus elementos. Un arreglo vacío debe devolver cero.",
    "def solve(data):\n    total = 0\n    for numero in data:\n        total = total + numero\n    return total", "function solve(data) {\n  let total = 0;\n  for (const numero of data) {\n    total = total + numero;\n  }\n  return total;\n}",
    [t([1,2,3,4],10),t([],0),t([-3,3],0),t([9],9),t([-1,-2,-3],-6)],
    ["Piensa en una suma que se va construyendo paso a paso.", "Empieza en cero para cubrir el arreglo vacío.", "Acumula cada valor con un bucle o una operación de reducción."],
    "Recorremos todos los elementos y mantenemos una suma acumulada. Tiempo O(n), espacio auxiliar O(1).", ["Hasta 1000 enteros de valor absoluto ≤ 1000."]),
  base("fizzbuzz", "El clásico FizzBuzz", "Fundamentos", "BEGINNER", 12,
    "Recibe un entero n y devuelve un arreglo desde 1 hasta n. Sustituye los múltiplos de 3 por Fizz, los de 5 por Buzz y los de ambos por FizzBuzz; conserva los demás valores como números.",
    "def solve(data):\n    resultado = []\n    for numero in range(1, data + 1):\n        if numero % 15 == 0:\n            resultado.append('FizzBuzz')\n        elif numero % 3 == 0:\n            resultado.append('Fizz')\n        elif numero % 5 == 0:\n            resultado.append('Buzz')\n        else:\n            resultado.append(numero)\n    return resultado", "function solve(data) {\n  const resultado = [];\n  for (let numero = 1; numero <= data; numero++) {\n    if (numero % 15 === 0) {\n      resultado.push('FizzBuzz');\n    } else if (numero % 3 === 0) {\n      resultado.push('Fizz');\n    } else if (numero % 5 === 0) {\n      resultado.push('Buzz');\n    } else {\n      resultado.push(numero);\n    }\n  }\n  return resultado;\n}",
    [t(5,[1,2,"Fizz",4,"Buzz"]),t(3,[1,2,"Fizz"]),t(0,[]),t(1,[1]),t(15,[1,2,"Fizz",4,"Buzz","Fizz",7,8,"Fizz","Buzz",11,"Fizz",13,14,"FizzBuzz"])],
    ["La condición de múltiplo se comprueba con el resto.", "Comprueba primero el caso que cumple ambas condiciones.", "Un múltiplo de 15 es múltiplo de 3 y de 5."],
    "La condición más específica debe evaluarse antes que las otras. Recorremos n valores: tiempo y espacio O(n).", ["0 ≤ n ≤ 100."]),
  ...collectionsExercises,
  ...textExercises,
  ...maximaExercises,
  ...searchExercises,
  ...rotationExercises,
  base("palindromo", "De ida y vuelta", "Cadenas", "INTERMEDIATE", 15,
    "Determina si una cadena es un palíndromo después de convertirla a minúsculas y quitar todos los caracteres que no sean letras a-z o dígitos. Devuelve un booleano.",
    "def solve(data):\n    import re\n    text = re.sub('[^a-z0-9]', '', data.lower())\n    return text == text[::-1]", "function solve(data) {\n  const text = data.toLowerCase().replace(/[^a-z0-9]/g, '');\n  return text === [...text].reverse().join('');\n}",
    [t("Anita lava la tina",true),t("programar",false),t("",true),t("A man, a plan, a canal: Panama",true),t("0P",false)],
    ["Primero normaliza la cadena según las reglas del enunciado.", "Compara la versión normalizada con su versión invertida.", "Otra opción usa dos índices, uno al inicio y otro al final."],
    "La normalización evita diferencias de mayúsculas y puntuación. Comparar la cadena con su inversa cuesta O(n) en tiempo y espacio.", ["Cadena ASCII de hasta 1000 caracteres."]),
  base("sin-duplicados", "Una sola vez", "Arreglos", "INTERMEDIATE", 15,
    "Elimina los números repetidos de un arreglo conservando el orden de su primera aparición. Devuelve un nuevo arreglo.",
    "def solve(data):\n    return list(dict.fromkeys(data))", "function solve(data) {\n  return [...new Set(data)];\n}",
    [t([3,1,3,2,1],[3,1,2]),t([4,4,4],[4]),t([],[]),t([-1,0,-1],[-1,0]),t([5,4,3],[5,4,3])],
    ["Necesitas recordar qué valores ya aparecieron.", "Un conjunto permite comprobar pertenencia eficientemente.", "Recorre la entrada y añade a la salida solo valores no vistos."],
    "Un conjunto o un diccionario con orden de inserción conserva la primera aparición. Tiempo esperado O(n), espacio O(n).", ["Hasta 1000 números enteros."]),
  base("frecuencia-caracteres", "Cada letra cuenta", "Cadenas", "INTERMEDIATE", 15,
    "Recibe una cadena de letras minúsculas y devuelve un objeto con la frecuencia de cada letra. El orden de las propiedades no importa.",
    "def solve(data):\n    result = {}\n    for c in data:\n        result[c] = result.get(c, 0) + 1\n    return result", "function solve(data) {\n  const result = {};\n  for (const c of data) result[c] = (result[c] || 0) + 1;\n  return result;\n}",
    [t("banana",{b:1,a:3,n:2}),t("abc",{a:1,b:1,c:1}),t("",{}),t("aaaa",{a:4}),t("xyxy",{x:2,y:2})],
    ["Cada letra puede ser la clave de un diccionario.", "El valor asociado a cada clave será su contador.", "Si una letra no existe todavía, usa cero antes de incrementar."],
    "Contamos una aparición por carácter con un diccionario. Tiempo O(n); el espacio está acotado por las 26 letras.", ["Solo letras a-z; longitud de 0 a 1000."]),
  base("segundo-mayor", "El segundo lugar", "Arreglos", "INTERMEDIATE", 18,
    "Devuelve el segundo número distinto más grande de un arreglo. Si no existen al menos dos valores distintos, devuelve null (None en Python).",
    "def solve(data):\n    values = sorted(set(data), reverse=True)\n    return values[1] if len(values) > 1 else None", "function solve(data) {\n  const values = [...new Set(data)].sort((a, b) => b - a);\n  return values.length > 1 ? values[1] : null;\n}",
    [t([8,3,8,5],5),t([2,2],null),t([],null),t([-5,-1,-3],-3),t([1,2],1)],
    ["Las repeticiones del máximo no cuentan como segundo lugar.", "Puedes quitar duplicados y ordenar.", "También puedes mantener los dos máximos distintos en un único recorrido."],
    "Ordenar los valores únicos simplifica la solución y cuesta O(n log n). Una mejora mantiene los dos mayores en O(n).", ["Hasta 1000 enteros; puede estar vacío."]),
  base("busqueda-binaria", "Busca a la mitad", "Algoritmos", "INTERMEDIATE", 20,
    "Recibe un objeto con numbers, un arreglo ordenado de enteros distintos, y target. Devuelve el índice de target o −1 si no existe. Utiliza búsqueda binaria.",
    "def solve(data):\n    values, target = data['numbers'], data['target']\n    left, right = 0, len(values) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if values[mid] == target: return mid\n        if values[mid] < target: left = mid + 1\n        else: right = mid - 1\n    return -1", "function solve(data) {\n  let left = 0, right = data.numbers.length - 1;\n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (data.numbers[mid] === data.target) return mid;\n    if (data.numbers[mid] < data.target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}",
    [t({numbers:[1,3,5,7,9],target:7},3),t({numbers:[2,4],target:3},-1),t({numbers:[],target:0},-1),t({numbers:[5],target:5},0),t({numbers:[-9,0,8],target:-9},0)],
    ["Aprovecha que los valores ya están ordenados.", "Compara el objetivo con el valor central y descarta una mitad.", "Mantén límites inclusivos left y right mientras left <= right."],
    "Cada paso descarta la mitad del intervalo. Tiempo O(log n), espacio O(1). Los tests verifican resultados; revisa esta complejidad al comparar tu solución.", ["Hasta 10 000 enteros distintos en orden ascendente."]),
  base("anagramas", "Las mismas letras", "Cadenas", "INTERMEDIATE", 15,
    "Recibe dos cadenas a y b y determina si son anagramas. Ignora espacios y diferencias entre mayúsculas y minúsculas.",
    "def solve(data):\n    return sorted(data['a'].lower().replace(' ', '')) == sorted(data['b'].lower().replace(' ', ''))", "function solve(data) {\n  const normalize = s => [...s.toLowerCase().replace(/ /g, '')].sort().join('');\n  return normalize(data.a) === normalize(data.b);\n}",
    [t({a:"amor",b:"roma"},true),t({a:"casa",b:"cosa"},false),t({a:"Dormitory",b:"Dirty room"},true),t({a:"",b:" "},true),t({a:"aa",b:"a"},false)],
    ["Dos anagramas contienen las mismas letras con las mismas frecuencias.", "Normaliza primero espacios y mayúsculas.", "Ordenar ambas cadenas permite compararlas directamente."],
    "Las formas normalizadas y ordenadas coinciden si cada letra aparece las mismas veces. Tiempo O(n log n + m log m).", ["Letras ASCII y espacios; hasta 1000 caracteres por cadena."]),
  base("rotar-arreglo", "Un giro a la derecha", "Arreglos", "INTERMEDIATE", 18,
    "Recibe numbers, un arreglo, y k, un entero no negativo. Rota el arreglo k posiciones a la derecha y devuelve el resultado. Los elementos que salen por el final regresan al inicio.",
    "def solve(data):\n    values = data['numbers']\n    if not values: return []\n    k = data['k'] % len(values)\n    return values[-k:] + values[:-k] if k else values[:]", "function solve(data) {\n  const values = data.numbers;\n  if (!values.length) return [];\n  const k = data.k % values.length;\n  return k ? [...values.slice(-k), ...values.slice(0, -k)] : [...values];\n}",
    [t({numbers:[1,2,3,4,5],k:2},[4,5,1,2,3]),t({numbers:[1,2,3],k:3},[1,2,3]),t({numbers:[],k:5},[]),t({numbers:[1,2],k:5},[2,1]),t({numbers:[9],k:0},[9])],
    ["Rotar tantas veces como elementos tiene el arreglo no cambia nada.", "Reduce k usando el resto respecto a la longitud.", "Separa los últimos k elementos y colócalos antes del resto."],
    "El módulo elimina rotaciones completas. Unimos dos segmentos y tratamos por separado el arreglo vacío. Tiempo y espacio O(n).", ["Hasta 1000 enteros; 0 ≤ k ≤ 10⁶."]),
  base("parentesis-equilibrados", "Todo en su lugar", "Algoritmos", "INTERMEDIATE", 20,
    "Determina si una cadena de paréntesis, corchetes y llaves está bien equilibrada. Cada apertura debe cerrarse con el mismo tipo y en el orden correcto.",
    "def solve(data):\n    stack = []\n    pairs = {')': '(', ']': '[', '}': '{'}\n    for c in data:\n        if c in '([{': stack.append(c)\n        elif not stack or stack.pop() != pairs[c]: return False\n    return not stack", "function solve(data) {\n  const stack = [], pairs = { ')': '(', ']': '[', '}': '{' };\n  for (const c of data) {\n    if ('([{'.includes(c)) stack.push(c);\n    else if (stack.pop() !== pairs[c]) return false;\n  }\n  return stack.length === 0;\n}",
    [t("([]){}",true),t("([)]",false),t("",true),t("((",false),t("]",false)],
    ["La última apertura debe ser la primera en cerrarse.", "Una pila modela ese comportamiento.", "Al cerrar, comprueba la cima; al terminar, la pila debe estar vacía."],
    "La pila conserva las aperturas pendientes. Cada símbolo entra y sale como máximo una vez. Tiempo y espacio O(n).", ["Hasta 1000 caracteres del conjunto ()[]{}."]),
  base("ventana-sin-repeticiones", "Sin repetir el camino", "Algoritmos", "ADVANCED", 30,
    "Devuelve la longitud de la subcadena contigua más larga que no repite caracteres. No se pide devolver la subcadena.",
    "def solve(data):\n    seen, left, best = {}, 0, 0\n    for right, c in enumerate(data):\n        left = max(left, seen.get(c, -1) + 1)\n        seen[c] = right\n        best = max(best, right - left + 1)\n    return best", "function solve(data) {\n  const seen = new Map();\n  let left = 0, best = 0;\n  for (let right = 0; right < data.length; right++) {\n    const c = data[right];\n    left = Math.max(left, (seen.get(c) ?? -1) + 1);\n    seen.set(c, right);\n    best = Math.max(best, right - left + 1);\n  }\n  return best;\n}",
    [t("abcabcbb",3),t("bbbbb",1),t("",0),t("pwwkew",3),t("abba",2)],
    ["Mantén una ventana que siempre contenga caracteres distintos.", "Recuerda el último índice en el que apareció cada carácter.", "Si se repite dentro de la ventana, mueve el límite izquierdo después de su aparición anterior."],
    "Una ventana deslizante evita volver a revisar subcadenas. El límite izquierdo nunca retrocede. Tiempo O(n), espacio O(k), donde k es el alfabeto.", ["Cadena ASCII de hasta 10 000 caracteres."]),
  base("unir-intervalos", "Encuentra lo común", "Algoritmos", "ADVANCED", 30,
    "Recibe un arreglo de intervalos [inicio, fin] y fusiona los que se solapan o se tocan. Devuelve los intervalos resultantes ordenados por inicio.",
    "def solve(data):\n    result = []\n    for start, end in sorted(data):\n        if result and start <= result[-1][1]:\n            result[-1][1] = max(result[-1][1], end)\n        else: result.append([start, end])\n    return result", "function solve(data) {\n  const result = [];\n  for (const [start, end] of [...data].sort((a, b) => a[0] - b[0])) {\n    const last = result[result.length - 1];\n    if (last && start <= last[1]) last[1] = Math.max(last[1], end);\n    else result.push([start, end]);\n  }\n  return result;\n}",
    [t([[1,3],[2,6],[8,10]],[[1,6],[8,10]]),t([[1,4],[4,5]],[[1,5]]),t([],[]),t([[5,8],[1,10]],[[1,10]]),t([[2,2]],[[2,2]])],
    ["Ordenar los intervalos simplifica las comparaciones.", "Solo necesitas comparar el nuevo intervalo con el último de la salida.", "Si se tocan, extiende el final al máximo de ambos."],
    "Tras ordenar, los intervalos que pueden fusionarse aparecen consecutivos. Ordenar domina el coste: O(n log n).", ["Hasta 1000 intervalos; inicio ≤ fin; extremos enteros."]),
  base("cambio-minimo", "El cambio justo", "Algoritmos", "ADVANCED", 35,
    "Recibe coins, las denominaciones disponibles, y amount, una cantidad. Devuelve el mínimo número de monedas para formar la cantidad, o −1 si es imposible. Puedes usar cada moneda tantas veces como quieras.",
    "def solve(data):\n    amount = data['amount']\n    dp = [0] + [amount + 1] * amount\n    for value in range(1, amount + 1):\n        for coin in data['coins']:\n            if coin <= value: dp[value] = min(dp[value], dp[value - coin] + 1)\n    return dp[amount] if dp[amount] <= amount else -1", "function solve(data) {\n  const dp = Array(data.amount + 1).fill(Infinity);\n  dp[0] = 0;\n  for (let value = 1; value <= data.amount; value++) {\n    for (const coin of data.coins) {\n      if (coin <= value) dp[value] = Math.min(dp[value], dp[value - coin] + 1);\n    }\n  }\n  return Number.isFinite(dp[data.amount]) ? dp[data.amount] : -1;\n}",
    [t({coins:[1,2,5],amount:11},3),t({coins:[2],amount:3},-1),t({coins:[1],amount:0},0),t({coins:[1,3,4],amount:6},2),t({coins:[],amount:7},-1)],
    ["Elegir siempre la moneda mayor no funciona para todas las denominaciones.", "Guarda la mejor respuesta para cada cantidad más pequeña.", "Para cada moneda c, prueba dp[valor - c] + 1."],
    "Programación dinámica: cada cantidad aprovecha soluciones anteriores. Tiempo O(amount × número de monedas), espacio O(amount).", ["Monedas enteras positivas; 0 ≤ amount ≤ 1000; hasta 20 denominaciones."]),
  base("subsecuencia-creciente", "Siempre hacia arriba", "Algoritmos", "ADVANCED", 35,
    "Devuelve la longitud de la subsecuencia estrictamente creciente más larga. Puedes omitir elementos, pero no cambiar su orden original.",
    "def solve(data):\n    if not data: return 0\n    dp = [1] * len(data)\n    for i in range(len(data)):\n        for j in range(i):\n            if data[j] < data[i]: dp[i] = max(dp[i], dp[j] + 1)\n    return max(dp)", "function solve(data) {\n  if (!data.length) return 0;\n  const dp = Array(data.length).fill(1);\n  for (let i = 0; i < data.length; i++) {\n    for (let j = 0; j < i; j++) {\n      if (data[j] < data[i]) dp[i] = Math.max(dp[i], dp[j] + 1);\n    }\n  }\n  return Math.max(...dp);\n}",
    [t([10,9,2,5,3,7,101,18],4),t([7,7,7],1),t([],0),t([1,2,3,4],4),t([4,3,2,1],1)],
    ["Define la mejor subsecuencia que termina exactamente en cada posición.", "Una posición puede extender una subsecuencia anterior si su valor es mayor.", "Inicializa todas las longitudes en uno y compara cada posición con las anteriores."],
    "dp[i] representa la mejor subsecuencia que termina en i. La solución presentada tarda O(n²); puede mejorarse a O(n log n).", ["Hasta 500 números enteros."]),
  base("suma-maxima", "La mejor racha", "Arreglos", "ADVANCED", 25,
    "Recibe un arreglo no vacío y devuelve la mayor suma que puede obtenerse con un subarreglo contiguo no vacío. Puede contener números negativos.",
    "def solve(data):\n    current = best = data[0]\n    for value in data[1:]:\n        current = max(value, current + value)\n        best = max(best, current)\n    return best", "function solve(data) {\n  let current = data[0], best = data[0];\n  for (const value of data.slice(1)) {\n    current = Math.max(value, current + value);\n    best = Math.max(best, current);\n  }\n  return best;\n}",
    [t([-2,1,-3,4,-1,2,1,-5,4],6),t([-4,-2,-7],-2),t([5],5),t([0,0],0),t([1,2,3],6)],
    ["En cada posición decide si conviene continuar o empezar de nuevo.", "Guarda la mejor suma que termina en la posición actual.", "current = max(valor, current + valor); conserva también el mejor resultado global."],
    "El algoritmo de Kadane mantiene el mejor segmento que termina en cada posición. Inicializar con el primer valor cubre arreglos completamente negativos. Tiempo O(n), espacio auxiliar O(1) si se itera sin copiar.", ["Entre 1 y 10 000 enteros de valor absoluto ≤ 1000."]),
  base("caminos-cuadricula", "Más de un camino", "Algoritmos", "ADVANCED", 30,
    "Recibe rows y cols, las dimensiones de una cuadrícula. Cuenta las formas de ir de la esquina superior izquierda a la inferior derecha, moviéndote únicamente a la derecha o hacia abajo.",
    "def solve(data):\n    dp = [1] * data['cols']\n    for _ in range(1, data['rows']):\n        for c in range(1, data['cols']):\n            dp[c] += dp[c - 1]\n    return dp[-1]", "function solve(data) {\n  const dp = Array(data.cols).fill(1);\n  for (let row = 1; row < data.rows; row++) {\n    for (let col = 1; col < data.cols; col++) dp[col] += dp[col - 1];\n  }\n  return dp[data.cols - 1];\n}",
    [t({rows:3,cols:3},6),t({rows:3,cols:2},3),t({rows:1,cols:1},1),t({rows:1,cols:8},1),t({rows:4,cols:4},20)],
    ["Solo puedes llegar a una celda desde arriba o desde la izquierda.", "El número de caminos es la suma de los caminos hacia esas dos celdas.", "La primera fila y la primera columna tienen exactamente un camino."],
    "Sumamos posibilidades reutilizando una sola fila de memoria. Tiempo O(rows × cols), espacio O(cols).", ["1 ≤ rows, cols ≤ 15; no hay obstáculos."]),
  base("orden-de-tareas", "Primero lo primero", "Algoritmos", "ADVANCED", 40,
    "Recibe n tareas numeradas de 0 a n−1 y dependencies, pares [a, b] que indican que a debe hacerse antes que b. Devuelve un orden válido eligiendo siempre la tarea disponible de menor número. Si hay un ciclo, devuelve un arreglo vacío.",
    "def solve(data):\n    import heapq\n    n = data['n']\n    edges = [[] for _ in range(n)]\n    degree = [0] * n\n    for a, b in data['dependencies']:\n        edges[a].append(b)\n        degree[b] += 1\n    ready = [i for i in range(n) if degree[i] == 0]\n    heapq.heapify(ready)\n    result = []\n    while ready:\n        a = heapq.heappop(ready)\n        result.append(a)\n        for b in edges[a]:\n            degree[b] -= 1\n            if degree[b] == 0: heapq.heappush(ready, b)\n    return result if len(result) == n else []", "function solve(data) {\n  const edges = Array.from({ length: data.n }, () => []), degree = Array(data.n).fill(0);\n  for (const [a, b] of data.dependencies) { edges[a].push(b); degree[b]++; }\n  const ready = degree.flatMap((d, i) => d === 0 ? [i] : []), result = [];\n  while (ready.length) {\n    ready.sort((a, b) => a - b);\n    const a = ready.shift();\n    result.push(a);\n    for (const b of edges[a]) if (--degree[b] === 0) ready.push(b);\n  }\n  return result.length === data.n ? result : [];\n}",
    [t({n:4,dependencies:[[0,2],[1,2],[2,3]]},[0,1,2,3]),t({n:2,dependencies:[[0,1],[1,0]]},[]),t({n:0,dependencies:[]},[]),t({n:3,dependencies:[]},[0,1,2]),t({n:3,dependencies:[[2,0]]},[1,2,0])],
    ["Una tarea está disponible cuando no le quedan dependencias pendientes.", "Mantén el número de entradas pendientes para cada nodo.", "Aplica el algoritmo de Kahn eligiendo siempre el menor nodo disponible."],
    "Kahn elimina las dependencias al completar cada tarea. Si quedan nodos sin visitar, existe un ciclo. Python usa una cola de prioridad; la versión JavaScript ordena la lista por sencillez para este límite.", ["0 ≤ n ≤ 100; dependencias válidas sin pares repetidos."]),
  base("distancia-edicion", "Una palabra de distancia", "Cadenas", "ADVANCED", 40,
    "Recibe dos cadenas a y b. Devuelve el mínimo número de inserciones, eliminaciones o sustituciones de un carácter necesarias para transformar a en b.",
    "def solve(data):\n    a, b = data['a'], data['b']\n    prev = list(range(len(b) + 1))\n    for i, x in enumerate(a, 1):\n        row = [i]\n        for j, y in enumerate(b, 1):\n            row.append(min(row[-1] + 1, prev[j] + 1, prev[j - 1] + (x != y)))\n        prev = row\n    return prev[-1]", "function solve(data) {\n  const { a, b } = data;\n  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);\n  for (let i = 1; i <= a.length; i++) {\n    const row = [i];\n    for (let j = 1; j <= b.length; j++) {\n      row[j] = Math.min(row[j - 1] + 1, prev[j] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));\n    }\n    prev = row;\n  }\n  return prev[b.length];\n}",
    [t({a:"gato",b:"pato"},1),t({a:"kitten",b:"sitting"},3),t({a:"",b:"abc"},3),t({a:"itera",b:"itera"},0),t({a:"abc",b:""},3)],
    ["Resuelve primero el problema para prefijos más cortos.", "Si las últimas letras coinciden, no necesitas una operación nueva.", "En otro caso toma el mínimo entre insertar, eliminar y sustituir, sumando uno."],
    "La distancia de Levenshtein compara prefijos. Cada celda depende de la izquierda, arriba y diagonal. Tiempo O(nm), espacio O(m) al conservar solo una fila anterior.", ["Cadenas ASCII de hasta 200 caracteres."]),
  ...foundationExercises,
  ...beginnerExpansion,
  ...intermediateExpansion,
  ...advancedExpansion,
  ...curriculumExpansion,
].map(exercise => ({
  ...exercise,
  ...beginnerRevisions[exercise.slug], ...collectionsRevisions[exercise.slug], ...textRevisions[exercise.slug],
  ...maximaRevisions[exercise.slug], ...searchRevisions[exercise.slug], ...rotationRevisions[exercise.slug],
  ...learningMetadata[exercise.slug],
  ...(historicalPracticeGoals[exercise.slug] ? { practiceGoals: historicalPracticeGoals[exercise.slug] } : {}),
  ...initialBatchRevisions[exercise.slug],
  ...(levelOverrides[exercise.slug] ? { level: levelOverrides[exercise.slug] } : {}),
})).map(exercise => {
  const variant = typescriptVariant(exercise);
  return { ...exercise, typescript: variant.solution, typescriptContract: variant.contract,
    starters: { python: exercise.starters?.python ?? "def solve(data):\n    return None\n", javascript: exercise.starters?.javascript ?? "function solve(data) {\n  return null;\n}\n", typescript: variant.starter },
    explanations: { python: exercise.explanations?.python ?? exercise.explanation, javascript: exercise.explanations?.javascript ?? exercise.explanation, typescript: variant.explanation },
  };
});

export const starter = {
  python: "def solve(data):\n    # Escribe tu solución aquí\n    pass\n",
  javascript: "function solve(data) {\n  // Escribe tu solución aquí\n  \n}\n",
  typescript: "function solve(data: number): number {\n  return 0;\n}\n",
};
