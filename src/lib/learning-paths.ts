import type { Language, Level } from "./types";

export const introductorySteps = ["imprime-un-saludo", "imprime-un-resultado", "imprime-dos-lineas", "lee-y-saluda", "tu-primer-resultado", "cambia-un-numero", "devuelve-la-entrada", "suma-uno", "el-doble", "guarda-un-resultado", "lee-un-dato-con-nombre", "suma-de-dos-numeros"];
export const foundationSteps = [
  "compara-con-cero", "elige-con-una-condicion", "compara-igualdad", "tres-caminos", "resto-entre-dos", "par-o-impar",
  "convierte-texto-a-numero", "cambio-de-una-compra", "cociente-entero", "reduce-vueltas-completas",
  "dos-condiciones-a-la-vez", "una-condicion-u-otra", "decisiones-anidadas",
  "primer-elemento", "cuenta-los-elementos", "suma-del-arreglo", "el-mayor-de-tres",
  "construye-una-lista", "repite-cada-letra", "invertir-cadena",
  "texto-en-minusculas", "reconoce-una-vocal", "contar-vocales", "quita-los-espacios", "filtra-letras-y-digitos", "compara-dos-textos",
  "maximo-de-una-lista", "primer-valor-o-ausencia",
  "numeros-del-uno-al-n", "repite-con-while", "recorre-por-indices", "producto-de-una-lista",
  "una-funcion-auxiliar", "dos-parametros", "descompone-un-calculo",
  "factorial", "fizzbuzz",
];

export const intermediateSteps = [
  "pertenece-al-conjunto", "cuenta-valores-distintos", "sin-duplicados",
  "guarda-con-una-clave", "incrementa-contadores", "frecuencia-caracteres",
  "palindromo", "compara-contadores", "anagramas",
  "filtra-mayores", "agrupa-por-paridad", "suma-de-prefijos", "maximo-bajo-un-limite", "segundo-mayor",
  "matriz-suma-de-filas", "matriz-diagonal", "matriz-transpuesta",
  "busqueda-lineal", "cuenta-operaciones", "ventana-de-tamano-fijo",
  "punto-medio-del-intervalo", "descarta-una-mitad", "busqueda-binaria", "pareja-con-suma",
  "ordena-por-seleccion", "ordena-por-insercion", "comparador-personalizado", "combina-ordenadas",
  "suma-recursiva", "factorial-recursivo",
  "pila-simple", "cola-simple",
  "siguiente-indice-circular", "recorre-en-circulo", "rotar-arreglo",
  "ventana-de-tamano-variable", "suma-maxima", "unir-intervalos", "ventana-sin-repeticiones",
  "parentesis-equilibrados",
];

export const advancedSteps = [
  "potencia-rapida", "ordena-por-mezcla", "subconjuntos", "permutaciones",
  "fibonacci-con-memoria", "escaleras-dp", "suma-de-subconjunto", "mochila-0-1", "formas-de-cambio",
  "subsecuencia-comun", "distancia-edicion",
  "arbol-altura", "arbol-preorden", "arbol-por-niveles", "arbol-es-busqueda", "arbol-cuenta-hojas",
  "grafo-lista-adyacencia", "grafo-alcanzables", "grafo-distancias", "grafo-tiene-ciclo", "camino-mas-largo-dag",
  "dijkstra-camino-minimo", "prim-coste-minimo",
  "k-esimo-mayor", "palindromo-mas-largo", "capacidad-minima", "laberinto-camino-minimo", "cuenta-islas",
  "multiplicacion-de-matrices", "rotar-matriz",
  "seleccion-de-actividades", "caminos-cuadricula", "cambio-minimo", "subsecuencia-creciente", "orden-de-tareas",
];

// No deducir el nivel a partir de la posición: puede haber varias rutas del mismo nivel.
export const learningPaths: { slug: string; title: string; description: string; level: Level; order: number; slugs?: string[] }[] = [
  { slug: "desde-cero", title: "Desde cero", description: "No necesitas experiencia. Escribe tu primer programa que muestra texto, aprende a leer entradas y, después, a devolver valores antes de sumar dos números.", level: "BEGINNER", order: -1, slugs: introductorySteps },
  { slug: "primeros-pasos", title: "Construye tus bases", description: "Después de Desde cero: aprende comparaciones, condiciones, listas, textos y bucles con actividades guiadas antes de combinar las ideas.", level: "BEGINNER", order: 0, slugs: foundationSteps },
  { slug: "pensar-en-soluciones", title: "Conecta las ideas", description: "Después de Construye tus bases: conecta conjuntos y mapas, agrega y ordena arreglos, recorre matrices y practica búsqueda, recursión, pilas, colas y ventanas.", level: "INTERMEDIATE", order: 1, slugs: intermediateSteps },
  { slug: "un-paso-mas", title: "Ve un paso más allá", description: "Recursión avanzada, programación dinámica, árboles, grafos y estrategias voraces. Problemas que invitan a mirar desde otro ángulo.", level: "ADVANCED", order: 2, slugs: advancedSteps },
];

export function learningPathLevel(slug: string): Level | undefined {
  return learningPaths.find(path => path.slug === slug)?.level;
}

export function exerciseHref(slug: string, language: Language, pathSlug?: string): string {
  const query = new URLSearchParams({ lenguaje: language });
  if (pathSlug) query.set("ruta", pathSlug);
  return `/ejercicios/${encodeURIComponent(slug)}?${query}`;
}

export function nextExerciseSlug(slug: string, slugs: string[]): string | undefined {
  const index = slugs.indexOf(slug);
  return index < 0 ? undefined : slugs[index + 1];
}

export function previousExerciseSlug(slug: string, slugs: string[]): string | undefined {
  const index = slugs.indexOf(slug);
  return index <= 0 ? undefined : slugs[index - 1];
}

// Posición 1-based dentro de la secuencia (ruta o catálogo). 0 si no pertenece.
export function exercisePosition(slug: string, slugs: string[]): { position: number; total: number } {
  const index = slugs.indexOf(slug);
  return { position: index < 0 ? 0 : index + 1, total: slugs.length };
}
