import type { SeedExercise } from "./content";

type Contract = { input: string; output: string; empty: string };
const contracts: Record<string, Contract> = {};
function group(slugs: string, input: string, output: string, empty: string) {
  for (const slug of slugs.split(" ")) contracts[slug] = { input, output, empty };
}

// Contratos editoriales explícitos, independientes de las respuestas de los tests.
// Se comparte el algoritmo con JavaScript, no se infieren tipos desde casos privados.
group("tu-primer-resultado cambia-un-numero devuelve-la-entrada suma-uno el-doble guarda-un-resultado factorial repite-con-while resto-entre-dos una-funcion-auxiliar cuenta-operaciones factorial-recursivo fibonacci-con-memoria escaleras-dp", "number", "number", "0");
group("par-o-impar compara-con-cero compara-igualdad dos-condiciones-a-la-vez", "number", "boolean", "false");
group("elige-con-una-condicion tres-caminos", "number", "string", '""');
group("fizzbuzz", "number", "(number | string)[]", "[]");
group("numeros-del-uno-al-n", "number", "number[]", "[]");
group("el-mayor-de-tres suma-del-arreglo cuenta-valores-distintos maximo-de-una-lista primer-elemento cuenta-los-elementos producto-de-una-lista suma-recursiva subsecuencia-creciente suma-maxima", "number[]", "number", "0");
group("primer-valor-o-ausencia segundo-mayor", "number[]", "number | null", "null");
group("recorre-por-indices sin-duplicados construye-una-lista suma-de-prefijos ordena-por-seleccion ordena-por-insercion ordena-por-mezcla ranking-de-frecuencias", "number[]", "number[]", "[]");
group("subconjuntos permutaciones", "number[]", "number[][]", "[]");
group("agrupa-por-paridad", "number[]", "{ pares: number[]; impares: number[] }", "{ pares: [], impares: [] }");
group("resumen-de-mediciones", "number[]", "{ total: number; positivos: number; mayor: number | null }", "{ total: 0, positivos: 0, mayor: null }");
group("contar-vocales ventana-sin-repeticiones convierte-texto-a-numero palindromo-mas-largo", "string", "number", "0");
group("invertir-cadena quita-los-espacios filtra-letras-y-digitos repite-cada-letra texto-en-minusculas", "string", "string", '""');
group("palindromo parentesis-equilibrados reconoce-una-vocal", "string", "boolean", "false");
group("guarda-con-una-clave incrementa-contadores frecuencia-caracteres", "string", "Record<string, number>", "{}");
group("lee-un-dato-con-nombre suma-de-dos-numeros", "{ a: number; b: number }", "number", "0");
group("compara-dos-textos anagramas", "{ a: string; b: string }", "boolean", "false");
group("distancia-edicion subsecuencia-comun", "{ a: string; b: string }", "number", "0");
group("compara-contadores", "{ a: Record<string, number>; b: Record<string, number> }", "boolean", "false");
group("pertenece-al-conjunto", "{ numbers: number[]; target: number }", "boolean", "false");
group("busqueda-binaria ventana-de-tamano-variable", "{ numbers: number[]; target: number }", "number", "0");
group("pareja-con-suma descarta-una-mitad", "{ numbers: number[]; target: number }", "number[]", "[]");
group("maximo-bajo-un-limite", "{ numbers: number[]; limit: number }", "number | null", "null");
group("punto-medio-del-intervalo", "{ left: number; right: number }", "number", "0");
group("reduce-vueltas-completas", "{ k: number; size: number }", "number", "0");
group("siguiente-indice-circular", "{ index: number; size: number }", "number", "0");
group("recorre-en-circulo", "{ numbers: number[]; start: number }", "number[]", "[]");
group("rotar-arreglo", "{ numbers: number[]; k: number }", "number[]", "[]");
group("ventana-de-tamano-fijo", "{ numbers: number[]; k: number }", "number", "0");
group("unir-intervalos", "number[][]", "number[][]", "[]");
group("cambio-minimo formas-de-cambio", "{ coins: number[]; amount: number }", "number", "0");
group("caminos-cuadricula", "{ rows: number; cols: number }", "number", "0");
group("orden-de-tareas", "{ n: number; dependencies: number[][] }", "number[]", "[]");
group("cambio-de-una-compra", "{ precio: number; pago: number }", "number", "0");
group("cociente-entero", "{ cantidad: number; tamano: number }", "number", "0");
group("una-condicion-u-otra", "{ invitacion: boolean; entrada: boolean; bloqueado: boolean }", "boolean", "false");
group("decisiones-anidadas", "{ edad: number; socio: boolean }", "number", "0");
group("dos-parametros", "{ base: number; altura: number }", "number", "0");
group("descompone-un-calculo", "{ precio: number; cantidad: number }", "number", "0");
group("busqueda-lineal", "{ values: number[]; target: number }", "number", "0");
group("filtra-mayores", "{ values: number[]; minimo: number }", "number[]", "[]");
group("matriz-suma-de-filas matriz-diagonal", "number[][]", "number[]", "[]");
group("matriz-transpuesta rotar-matriz", "number[][]", "number[][]", "[]");
group("comparador-personalizado", "string[]", "string[]", "[]");
group("combina-ordenadas", "{ a: number[]; b: number[] }", "number[]", "[]");
group("pila-simple cola-simple", '{ operaciones: (["push", number] | ["pop"])[] }', "(number | null)[]", "[]");
group("potencia-rapida", "{ base: number; exponente: number }", "number", "0");
group("mochila-0-1", "{ pesos: number[]; valores: number[]; capacidad: number }", "number", "0");
group("suma-de-subconjunto", "{ numbers: number[]; objetivo: number }", "boolean", "false");
group("arbol-altura arbol-cuenta-hojas", "Nodo | null", "number", "0");
group("arbol-preorden arbol-por-niveles", "Nodo | null", "number[]", "[]");
group("arbol-es-busqueda", "Nodo | null", "boolean", "false");
group("grafo-lista-adyacencia", "{ n: number; aristas: number[][] }", "number[][]", "[]");
group("grafo-alcanzables grafo-distancias", "{ n: number; aristas: number[][]; inicio: number }", "number[]", "[]");
group("grafo-tiene-ciclo", "{ n: number; aristas: number[][] }", "boolean", "false");
group("camino-mas-largo-dag prim-coste-minimo", "{ n: number; aristas: number[][] }", "number", "0");
group("dijkstra-camino-minimo", "{ n: number; aristas: number[][]; destino: number }", "number", "0");
group("seleccion-de-actividades laberinto-camino-minimo cuenta-islas planifica-entregas", "number[][]", "number", "0");
group("capacidad-minima", "{ pesos: number[]; dias: number }", "number", "0");
group("k-esimo-mayor", "{ values: number[]; k: number }", "number | null", "null");
group("multiplicacion-de-matrices", "{ a: number[][]; b: number[][] }", "number[][]", "[]");
group("valor-o-respaldo", "number | null", "number", "0");
group("lee-un-opcional", "{ cantidad?: number }", "number", "0");
group("reutiliza-una-funcion", "{ numeros: number[]; textos: string[] }", "{ numero: number; texto: string }", '{ numero: 0, texto: "" }');

// Anotaciones locales necesarias para colecciones inicialmente vacías, recursión
// y valores ausentes. Cada referencia pasa --strict en la suite editorial.
const annotations: Record<string, [string, string][]> = {
  "resumen-de-mediciones": [["mayor = null", "mayor: number | null = null"]],
  "reutiliza-una-funcion": [["primero(valores)", "primero<T>(valores: T[]): T"]],
  "una-funcion-auxiliar": [["cuadrado(x)", "cuadrado(x: number): number"]],
  "dos-parametros": [["area(base, altura)", "area(base: number, altura: number): number"]],
  "descompone-un-calculo": [["subtotal(precio, cantidad)", "subtotal(precio: number, cantidad: number): number"], ["envio(total)", "envio(total: number): number"]],
  "suma-recursiva": [["total(valores)", "total(valores: number[]): number"]],
  "factorial-recursivo": [["factorial(numero)", "factorial(numero: number): number"]],
  "fibonacci-con-memoria": [["memoria =", "memoria: Record<number, number> ="], ["fib(n)", "fib(n: number): number"]],
  "arbol-altura": [["altura(nodo)", "altura(nodo: Nodo | null): number"]],
  "arbol-cuenta-hojas": [["hojas(nodo)", "hojas(nodo: Nodo | null): number"]],
  "arbol-es-busqueda": [["valido(nodo, minimo, maximo)", "valido(nodo: Nodo | null, minimo: number, maximo: number): boolean"]],
  "arbol-preorden": [["resultado = []", "resultado: number[] = []"], ["recorrer(nodo)", "recorrer(nodo: Nodo | null): void"]],
  "permutaciones": [["resultado = []", "resultado: number[][] = []"], ["generar(actual, restantes)", "generar(actual: number[], restantes: number[]): void"]],
  "ordena-por-mezcla": [["mezclar(valores)", "mezclar(valores: number[]): number[]"]],
  "grafo-tiene-ciclo": [["raiz(x)", "raiz(x: number): number"]],
  "capacidad-minima": [["viajes(capacidad)", "viajes(capacidad: number): number"]],
  "guarda-con-una-clave": [["marcas = {}", "marcas: Record<string, number> = {}"]],
  "incrementa-contadores": [["frecuencias = {}", "frecuencias: Record<string, number> = {}"]],
  "frecuencia-caracteres": [["frecuencias = {}", "frecuencias: Record<string, number> = {}"]],
  "anagramas": [["primero = {}", "primero: Record<string, number> = {}"], ["segundo = {}", "segundo: Record<string, number> = {}"]],
  "parentesis-equilibrados": [["pairs =", "pairs: Record<string, string> ="]],
  "sin-duplicados": [["resultado = []", "resultado: number[] = []"]],
  "rotar-arreglo": [["resultado = []", "resultado: number[] = []"]],
  "grafo-lista-adyacencia": [["new Set()", "new Set<number>()"]],
  "grafo-alcanzables": [["() => []", "(): number[] => []"], ["const nodo = pila.pop();", "const nodo = pila.pop();\n    if (nodo === undefined) continue;"]],
  "grafo-distancias": [["() => []", "(): number[] => []"]],
  "camino-mas-largo-dag": [["() => []", "(): number[] => []"], ["const cola = []", "const cola: number[] = []"]],
  "dijkstra-camino-minimo": [["() => []", "(): [number, number][] => []"]],
  "prim-coste-minimo": [["() => []", "(): [number, number][] => []"]],
  "orden-de-tareas": [["() => []", "(): number[] => []"], ["const a = ready.shift();", "const a = ready.shift();\n    if (a === undefined) continue;"]],
  "cuenta-islas": [["const [fila, columna] = pila.pop();", "const posicion = pila.pop();\n          if (posicion === undefined) continue;\n          const [fila, columna] = posicion;"]],
  "pila-simple": [["else if (pila.length) salida.push(pila.pop());", "else if (pila.length) {\n      const extraido = pila.pop();\n      if (extraido !== undefined) salida.push(extraido);\n    }"]],
  "cola-simple": [["else if (cola.length) salida.push(cola.shift());", "else if (cola.length) {\n      const extraido = cola.shift();\n      if (extraido !== undefined) salida.push(extraido);\n    }"]],
};

export function typescriptVariant(exercise: SeedExercise) {
  const contract = contracts[exercise.slug];
  const programTypes = (source: string) => source
    .replace(/\b(const|let) puntos =/g, "$1 puntos: number =")
    .replace(/\bconst listo =/g, "const listo: boolean =")
    .replace(/\bconst (nombre|ciudad) =/g, "const $1: string =")
    .replace(/\bconst (numero|lado|total) =/g, "const $1: number =");
  if (exercise.runtimeMode === "PROGRAM") return {
    contract: "",
    solution: programTypes(exercise.javascript),
    starter: programTypes(exercise.starters!.javascript),
    explanation: `${exercise.explanation}\n\nEn TypeScript\nconsole.log muestra valores. const crea un nombre fijo y let permite reasignarlo. El compilador infiere tipos; puedes escribir : number, : string o : boolean para hacerlos explícitos. Si un tipo no coincide, corrige el diagnóstico antes de ejecutar. La lectura de entrada ya está preparada y no exige conocer Node.`,
  };
  if (!contract) throw new Error(`Falta el contrato TypeScript de ${exercise.slug}`);
  const preamble = contract.input.includes("Nodo") ? 'type Nodo = { v: number; izq: Nodo | null; der: Nodo | null };\n\n' : "";
  const signature = `function solve(data: ${contract.input}): ${contract.output} {`;
  function typed(source: string) {
    let result = source.replace("function solve(data) {", signature);
    for (const [from, to] of annotations[exercise.slug] ?? []) result = result.replace(from, to);
    return preamble + result;
  }
  return {
    contract: `${contract.input.includes("Nodo") ? 'type __IteraNodo = { v: number; izq: __IteraNodo | null; der: __IteraNodo | null };\n' : ""}const __iteraContract: (data: ${contract.input.replaceAll("Nodo", "__IteraNodo")}) => ${contract.output} = solve;\nvoid __iteraContract;${exercise.slug === "reutiliza-una-funcion" ? '\nconst __iteraGeneric: <T>(valores: T[]) => T = primero;\nvoid __iteraGeneric;' : ""}`,
    solution: typed(exercise.javascript),
    starter: typed((exercise.starters?.javascript ?? `function solve(data) {\n  return ${contract.empty};\n}`)
      .replace(/return null;/g, `return ${contract.empty};`)),
    explanation: `${(exercise.explanations?.javascript ?? exercise.explanation).replaceAll("JavaScript", "TypeScript")}\n\nEn TypeScript\nEl parámetro data tiene tipo ${contract.input} y el retorno tiene tipo ${contract.output}. Las anotaciones describen el contrato y no transforman los valores. Conserva estos tipos, usa las comprobaciones de ausencia cuando proceda y corrige los errores de compilación antes de revisar el resultado.`,
  };
}
