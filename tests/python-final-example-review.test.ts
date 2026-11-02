import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { pythonCatalog } from "../prisma/python-content";
import { pythonReleaseFingerprint } from "../prisma/python-releases";
import { beforePythonFinalExamples } from "./python-final-example-baseline";
import { beforePythonRecordVocabulary } from "./python-record-vocabulary-baseline";

type Review = { cases: [unknown, unknown][]; reason: RegExp };
const leaf = (value: number) => ({ value, left: null, right: null });
const ancestorTree = { value: 5, left: { value: 2, left: leaf(1), right: leaf(3) }, right: leaf(8) };

// Parejas públicas fijadas desde los contratos. No se ejecuta la referencia
// para obtener respuestas ni se ejecuta código de alumnos.
const reviewed: Record<string, Review> = {
  "logica-arbol-busqueda": { cases: [[{ value: 2, left: leaf(1), right: leaf(3) }, true], [null, true]], reason: /menor que la raíz 2.*derecho es mayor.*vacío.*True/s },
  "logica-ancestro": { cases: [[{ tree: ancestorTree, a: 1, b: 3 }, 2], [{ tree: ancestorTree, a: 2, b: 3 }, 2]], reason: /5 también es ancestro.*2 es el común más cercano.*ancestro de sí mismo/s },
  "logica-monticulo-inserta": { cases: [[{ heap: [2, 4, 3], value: 1 }, [1, 2, 3, 4]], [{ heap: [], value: 0 }, [0]]], reason: /asciende hasta la raíz.*\[1, 2, 3, 4\].*única raíz/s },
  "logica-monticulo-extrae": { cases: [[[1, 3, 2, 7, 4], { minimo: 1, heap: [2, 3, 4, 7] }], [[], { minimo: null, heap: [] }]], reason: /mínimo 1.*\[2, 3, 4, 7\].*None \(null en JSON\)/s },
  "logica-prioridad": { cases: [[[{ id: 3, prioridad: 1 }, { id: 1, prioridad: 1 }, { id: 2, prioridad: 0 }], [2, 1, 3]], [[], []]], reason: /prioridad 0.*antes.*prioridad 1.*id ascendente.*Sin tareas/s },
  "logica-k-mayores": { cases: [[{ numbers: [3, 1, 5, 5, 2], k: 3 }, [5, 5, 3]], [{ numbers: [], k: 0 }, []]], reason: /dos cincos se conservan.*repeticiones cuentan.*cero valores/s },
  "logica-actividades": { cases: [[[[1, 2], [3, 4], [0, 6], [5, 7], [8, 9], [5, 9]], 4], [[], 0]], reason: /sin solapamientos.*quinta actividad no es posible.*máximo.*0/s },
  "logica-combina-archivos": { cases: [[[1, 2, 3], 9], [[], 0]], reason: /cuesta 3.*cuesta 6.*3 \+ 6 = 9.*coste es 0/s },
  "logica-potencia": { cases: [[{ base: 2, exponente: 10 }, 1024], [{ base: 5, exponente: 0 }, 1]], reason: /2 elevado a 10 es 1024.*cero es uno/s },
  "logica-mezcla": { cases: [[[3, 1, 2], [1, 2, 3]], [[], []]], reason: /mismos tres valores.*\[1, 2, 3\].*vacía ya está ordenada/s },
  "logica-subconjuntos": { cases: [[[], [[]]], [[1], [[], [1]]]], reason: /no tomar ninguno.*\[\[\]\].*no tomarlo o tomarlo/s },
  "logica-permutaciones": { cases: [[[1, 2], [[1, 2], [2, 1]]], [[1], [[1]]]], reason: /ambos una vez.*lexicográfico numérico.*única permutación/s },
  "logica-combinaciones": { cases: [[{ numbers: [5, 3, 2], target: 5 }, [[2, 3], [5]]], [{ numbers: [], target: 0 }, [[]]]], reason: /Sin reutilizar elementos.*2 \+ 3.*combinación vacía es una solución/s },
  "logica-reinas": { cases: [[1, 1], [2, 0]], reason: /única reina.*una solución.*dos reinas.*0 soluciones/s },
  "logica-fibonacci": { cases: [[0, 0], [1, 1]], reason: /índice 0.*base definido como 0.*índice 1.*vale 1/s },
  "logica-escalera": { cases: [[0, 1], [1, 1]], reason: /no dar ningún paso.*ausencia de soluciones.*tamaño 2 lo sobrepasaría/s },
  "logica-caminos-obstaculos": { cases: [[[[0, 0, 0], [0, 1, 0], [0, 0, 0]], 2], [[[1]], 0]], reason: /dos caminos.*por los bordes.*bloquea ya el inicio/s },
  "logica-monedas": { cases: [[{ coins: [1, 2, 5], amount: 11 }, 3], [{ coins: [2], amount: 3 }, -1]], reason: /5 \+ 5 \+ 1.*Ninguna pareja.*11.*importes pares.*-1/s },
  "logica-mochila": { cases: [[{ pesos: [1, 2, 3], valores: [6, 10, 12], capacidad: 5 }, 22], [{ pesos: [2], valores: [3], capacidad: 1 }, 0]], reason: /peso 2 y 3.*valen 22.*único objeto no cabe/s },
  "logica-subsecuencia-comun": { cases: [[{ a: "abcde", b: "ace" }, 3], [{ a: "", b: "abc" }, 0]], reason: /subsecuencia común es ace.*vacío no comparte/s },
  "logica-adyacencia": { cases: [[{ n: 3, aristas: [[0, 1], [1, 2]] }, [[1], [0, 2], [1]]], [{ n: 1, aristas: [] }, [[]]]], reason: /conecta a los dos nodos.*nodo sin aristas.*vacía/s },
  "logica-alcanzables": { cases: [[{ n: 3, aristas: [[0, 1], [1, 2]], inicio: 0 }, [0, 1, 2]], [{ n: 3, aristas: [[0, 1]], inicio: 2 }, [2]]], reason: /cadena conecta los tres nodos.*dos está aislado/s },
  "logica-distancias": { cases: [[{ n: 3, aristas: [[0, 1], [1, 2]], inicio: 0 }, [0, 1, 2]], [{ n: 4, aristas: [[0, 1]], inicio: 0 }, [0, 1, -1, -1]]], reason: /dos aristas.*aislados quedan en −1/s },
  "logica-ciclo-dirigido": { cases: [[{ n: 3, aristas: [[0, 1], [1, 2], [2, 0]] }, true], [{ n: 3, aristas: [[0, 1], [0, 2], [1, 2]] }, false]], reason: /0 → 1 → 2 → 0.*dos caminos hacia 2 no forman un ciclo/s },
  "logica-dependencias": { cases: [[{ n: 4, dependencies: [[0, 2], [1, 2], [2, 3]] }, [0, 1, 2, 3]], [{ n: 2, dependencies: [[0, 1], [1, 0]] }, []]], reason: /desempate.*empieza por 0.*dependencia circular.*\[\]/s },
  "logica-dijkstra": { cases: [[{ n: 3, aristas: [[0, 1, 2], [1, 2, 3], [0, 2, 10]], destino: 2 }, 5], [{ n: 3, aristas: [[0, 1, 1]], destino: 2 }, -1]], reason: /intermedio cuesta 5, menos que la arista directa.*destino está aislado/s },
  "logica-islas": { cases: [[[[1, 1, 0], [0, 1, 0], [0, 0, 1]], 2], [[[0]], 0]], reason: /tres celdas conectadas.*otra.*diagonales no conectan.*agua/s },
  "logica-laberinto": { cases: [[[[0, 0], [0, 0]], 2], [[[0, 1], [0, 0]], 2]], reason: /origen cuenta como cero.*bajar.*derecha.*dos movimientos/s },
  "logica-capacidad": { cases: [[{ pesos: [1, 2, 3, 4, 5], dias: 2 }, 9], [{ pesos: [3, 2, 2, 4, 1, 4], dias: 3 }, 6]], reason: /Con 8.*tres:.*mínimo es 9.*Con 5.*cuatro:.*mínimo es 6/s },
  "logica-edicion": { cases: [[{ a: "gato", b: "pato" }, 1], [{ a: "kitten", b: "sitting" }, 3]], reason: /una sustitución.*Sustituir k por s y e por i.*añadir g/s },
  "logica-subsecuencia-creciente": { cases: [[[10, 9, 2, 5, 3, 7, 101, 18], 4], [[7, 7, 7], 1]], reason: /\[2, 3, 7, 18\].*no sea un tramo consecutivo.*solo puede elegirse uno/s },
  "logica-planifica-tareas": { cases: [[{ duraciones: [3, 5, 2], dependencias: [[0, 2], [1, 2]] }, 7], [{ duraciones: [], dependencias: [] }, 0]], reason: /empezar juntas.*espera a ambas.*5 \+ 2 = 7, no 3 \+ 5 \+ 2.*total es 0/s },
};

test("el último bloque contrasta 64 ejemplos y completa 433 de 224 actividades", () => {
  const batch = pythonCatalog.slice(192);
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
  assert.equal(pythonCatalog.length, 224);
  assert.equal(pythonCatalog.reduce((sum, entry) => sum + entry.content.variants[0].tests.filter(item => item.visible).length, 0), 433);
});

test("solo cambian dos explicaciones públicas y se recupera la entrega anterior", () => {
  const payload = pythonCatalog.map(entry => ({ ...entry, content: beforePythonRecordVocabulary(entry.slug, entry.content) })).map(entry => entry.slug !== "logica-capacidad" ? entry : ({ ...entry, content: {
    ...entry.content, variants: entry.content.variants.map(variant => ({ ...variant, tests: variant.tests.map(item =>
      item.visible && (item.order === 0 || item.order === 1) ? { ...item, explanation: "" } : item),
    })),
  } }));
  // Calculada antes de editar; incluye todo campo salvo esas dos posiciones.
  assert.equal(createHash("sha256").update(JSON.stringify(payload)).digest("hex"), "76ba8ab429ed7eaf17e973b6f2094ac5dc941712be14acb2416c7a57256b9590");
  const previous = pythonCatalog.map(entry => ({ ...entry, content: beforePythonFinalExamples(entry.slug, entry.content) }));
  assert.equal(pythonReleaseFingerprint(previous), "f5d67f389e846bb978604ce2a5e9dc8ad695a40699153b79c2edc57bf3834d10");
});

test("las capacidades públicas mínimas se contrastan enumerando todos los cortes", () => {
  // Modelo fijo e independiente: todas las particiones consecutivas de estas
  // dos listas pequeñas. No usa búsqueda binaria ni código del catálogo.
  for (const { pesos, dias, expected } of [
    { pesos: [1, 2, 3, 4, 5], dias: 2, expected: 9 },
    { pesos: [3, 2, 2, 4, 1, 4], dias: 3, expected: 6 },
  ]) {
    let minimum = Infinity;
    for (let mask = 0; mask < 2 ** (pesos.length - 1); mask++) {
      const loads = [pesos[0]];
      for (let i = 1; i < pesos.length; i++) {
        if (mask & (1 << (i - 1))) loads.push(pesos[i]);
        else loads[loads.length - 1] += pesos[i];
      }
      if (loads.length <= dias) minimum = Math.min(minimum, Math.max(...loads));
    }
    assert.equal(minimum, expected);
  }
});
