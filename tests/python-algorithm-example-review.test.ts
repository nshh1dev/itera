import { test } from "node:test";
import assert from "node:assert/strict";
import { pythonCatalog } from "../prisma/python-content";
import { pythonReleaseFingerprint } from "../prisma/python-releases";

type Review = { cases: [unknown, unknown][]; reason: RegExp };

// Parejas públicas contrastadas con sus contratos, sin ejecutar referencias
// para generar respuestas ni ejecutar código de alumnos.
const reviewed: Record<string, Review> = {
  "logica-insercion-posicion": { cases: [[{ numbers: [1, 3, 3, 5], target: 3 }, 1], [{ numbers: [], target: 2 }, 0]], reason: /antes de los dos 3.*índice 1.*vacía.*posición 0/s },
  "logica-ordena-insercion": { cases: [[[3, 1, 2], [1, 2, 3]], [[], []]], reason: /menor a mayor.*1 queda primero.*lista vacía/s },
  "logica-ordena-registros": { cases: [[[{ nombre: "ana", puntos: 3 }, { nombre: "bea", puntos: 5 }, { nombre: "alba", puntos: 5 }], [{ nombre: "alba", puntos: 5 }, { nombre: "bea", puntos: 5 }, { nombre: "ana", puntos: 3 }]], [[], []]], reason: /5 puntos.*antes.*3.*alba precede.*bea.*vacía/s },
  "logica-combina": { cases: [[{ a: [1, 3], b: [2, 4] }, [1, 2, 3, 4]], [{ a: [], b: [1] }, [1]]], reason: /intercalan.*\[1, 2, 3, 4\].*1 pendiente de b/s },
  "logica-palindromo": { cases: [["abba", true], ["Aa", false]], reason: /True \(true en JSON\).*Aa se invierte como aA.*no normaliza/s },
  "logica-pareja": { cases: [[{ numbers: [1, 2, 4, 7], target: 9 }, [1, 3]], [{ numbers: [1, 2], target: 10 }, []]], reason: /2 y 7.*objetivo 9.*posiciones, no esos valores.*no 10/s },
  "logica-prefijos": { cases: [[[1, 2, 3], [0, 1, 3, 6]], [[], [0]]], reason: /total anterior.*prefijo vacío/s },
  "logica-intervalos-suma": { cases: [[{ numbers: [2, -1, 4], consultas: [[0, 2], [1, 1]] }, [5, -1]], [{ numbers: [], consultas: [] }, []]], reason: /suma 5.*solo el -1.*extremos están incluidos.*No hay consultas/s },
  "logica-ventana-fija": { cases: [[{ numbers: [1, 2, 3, 4], k: 2 }, 7], [{ numbers: [5], k: 1 }, 5]], reason: /suman 3, 5 y 7.*mayor.*única ventana contiene 5/s },
  "logica-ventana-suma": { cases: [[{ numbers: [2, 3, 1, 2, 4, 3], target: 7 }, 2], [{ numbers: [1, 1], target: 5 }, 0]], reason: /\[4, 3\] alcanza 7 con dos elementos.*Ningún tramo alcanza/s },
  "logica-celda": { cases: [[{ matriz: [[1, 2], [3, 4]], fila: 1, columna: 0 }, 3], [{ matriz: [[0]], fila: 0, columna: 0 }, 0]], reason: /fila 1 selecciona.*columna 0.*valor, 3.*no debe confundirse.*ausente/s },
  "logica-filas": { cases: [[[[1, 2], [3, 4, 5]], [3, 12]], [[[]], [0]]], reason: /primera fila suma 3.*segunda 12.*vacía suma cero/s },
  "logica-columnas": { cases: [[[[1, 2, 3], [4, 5, 6]], [5, 7, 9]], [[], []]], reason: /1 \+ 4 = 5.*2 \+ 5 = 7.*3 \+ 6 = 9.*no dos sumas de filas.*vacía/s },
  "logica-diagonales": { cases: [[[[1, 2], [3, 4]], { principal: [1, 4], secundaria: [2, 3] }], [[[5]], { principal: [5], secundaria: [5] }]], reason: /primera fila a la última.*pertenece a las dos diagonales.*sin eliminarla/s },
  "logica-transpuesta": { cases: [[[[1, 2, 3], [4, 5, 6]], [[1, 4], [2, 5], [3, 6]]], [[[1]], [[1]]]], reason: /primera columna.*primera fila.*2 × 3 a 3 × 2.*único valor/s },
  "logica-vecinos": { cases: [[[[1, 0], [1, 1]], [[1, 2], [2, 1]]], [[], []]], reason: /ortogonales.*1, 2, 2 y 1.*diagonales no cuentan.*vacía/s },
  "logica-copia-anidada": { cases: [[{ matriz: [[1, 2], [3, 4]], fila: 0, columna: 1, valor: 9 }, { original: [[1, 2], [3, 4]], copia: [[1, 9], [3, 4]] }], [{ matriz: [[0]], fila: 0, columna: 0, valor: -1 }, { original: [[0]], copia: [[-1]] }]], reason: /solo en la copia.*compartir esa fila alteraría.*original sigue conteniendo 0/s },
  "logica-pila": { cases: [[{ operaciones: [["push", 1], ["push", 2], ["pop"], ["pop"]] }, [2, 1]], [{ operaciones: [["pop"]] }, []]], reason: /último apilado sale primero.*pila vacía no aporta/s },
  "logica-cola": { cases: [[{ operaciones: [["push", 1], ["push", 2], ["pop"], ["pop"]] }, [1, 2]], [{ operaciones: [["pop"]] }, []]], reason: /primero en entrar, primero en salir.*no se añade un valor ficticio/s },
  "logica-delimitadores": { cases: [["([]){}", true], ["([)]", false]], reason: /anidamiento es válido.*último delimitador abierto es un corchete.*iguales cantidades no basta/s },
  "logica-deshacer": { cases: [[{ operaciones: [["sumar", 3], ["sumar", 5], ["deshacer"]] }, 3], [{ operaciones: [["deshacer"]] }, 0]], reason: /lleva a 8.*última suma.*deja 3.*inicial sigue en 0/s },
  "logica-suma-recursiva": { cases: [[[1, 2, 3], 6], [[], 0]], reason: /1 \+ \(2 \+ \(3 \+ 0\)\) = 6.*vacía es el caso base/s },
  "logica-busqueda-recursiva": { cases: [[{ numbers: [1, 3, 7], target: 7 }, 2], [{ numbers: [], target: 0 }, -1]], reason: /posición, no el valor.*ausencia es -1/s },
  "logica-une-intervalos": { cases: [[[[1, 3], [2, 6], [8, 10]], [[1, 6], [8, 10]]], [[[1, 4], [4, 5]], [[1, 5]]]], reason: /solapan.*hueco entre 6 y 8.*tocan en 4.*1 a 5/s },
  "logica-segundo-maximo": { cases: [[[8, 3, 8, 5], 5], [[], null]], reason: /Repetir 8 no.*segundo valor distinto.*None \(null en JSON\)/s },
  "logica-suma-maxima": { cases: [[[-2, 1, -3, 4, -1, 2, 1, -5, 4], 6], [[-4, -2, -7], -2]], reason: /\[4, -1, 2, 1\] suma 6.*no vacío.*-2, no cero/s },
  "logica-sin-repeticiones": { cases: [["abcabcbb", 3], ["bbbbb", 1]], reason: /tres caracteres distintos.*consecutivo.*dos caracteres ya repite b.*máxima.*1/s },
  "logica-ranking": { cases: [[[4, 2, 4, 2, 7], [2, 4, 7]], [[], []]], reason: /dos veces.*una.*valor ascendente.*2 antes que 4.*Sin datos/s },
  "logica-cuenta-nodos": { cases: [[null, 0], [{ value: 0, left: null, right: null }, 1]], reason: /None en Python.*no hay raíz.*aunque su value sea 0.*un nodo/s },
  "logica-altura": { cases: [[{ value: 1, left: null, right: null }, 1], [null, 0]], reason: /nodos, no enlaces.*vale 1.*vacío es 0/s },
  "logica-preorden": { cases: [[{ value: 1, left: { value: 2, left: null, right: null }, right: { value: 3, left: null, right: null } }, [1, 2, 3]], [null, []]], reason: /raíz 1.*izquierdo 2.*derecho 3.*árbol vacío/s },
  "logica-niveles": { cases: [[{ value: 1, left: { value: 2, left: { value: 4, left: null, right: null }, right: null }, right: { value: 3, left: null, right: null } }, [1, 2, 3, 4]], [null, []]], reason: /nivel siguiente están 2 y 3.*solo después se visita 4.*Sin raíz/s },
};

test("el sexto bloque contrasta 64 ejemplos y alcanza 369 de 192 actividades", () => {
  const batch = pythonCatalog.slice(160, 192);
  assert.deepEqual(batch.map(entry => entry.slug), Object.keys(reviewed));
  let count = 0;
  for (const entry of batch) {
    const visible = entry.content.variants[0].tests.filter(item => item.visible);
    assert.deepEqual(visible.map(item => [item.input, item.expected]), reviewed[entry.slug].cases, entry.slug);
    assert.ok(visible.every(item => item.explanation?.trim()), entry.slug);
    assert.match(visible.map(item => item.explanation).join("\n"), reviewed[entry.slug].reason, entry.slug);
    count += visible.length;
  }
  assert.equal(count, 64);
  assert.equal(pythonCatalog.slice(0, 192).reduce((sum, entry) => sum + entry.content.variants[0].tests.filter(item => item.visible).length, 0), 369);
});

test("el bloque mantiene límites de contenido observable, técnica y mutación", () => {
  const statement = (slug: string) => pythonCatalog.find(entry => entry.slug === slug)!.content.statement;
  assert.match(statement("logica-copia-anidada"), /no certifican la identidad de las filas ni la ausencia de cualquier mutación intermedia/);
  assert.match(statement("logica-suma-recursiva"), /no certifican que se haya usado recursión/);
  assert.match(statement("logica-pareja"), /menor i.*mayor j.*no certifica la técnica interna/s);
  assert.match(statement("logica-ventana-fija"), /no se permite elegir un tramo vacío/);
  assert.match(statement("logica-niveles"), /izquierda a derecha dentro de cada nivel/);
});

test("el sexto bloque conserva íntegro el catálogo anterior", () => {
  assert.equal(pythonReleaseFingerprint(pythonCatalog), "f5d67f389e846bb978604ce2a5e9dc8ad695a40699153b79c2edc57bf3834d10");
});
