import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { pythonCatalog } from "../prisma/python-content";
import { pythonReleaseFingerprint } from "../prisma/python-releases";
import { beforePythonExampleReview, previousReviewedExamples } from "./python-example-review-baseline";
import { beforePythonCollectionExamples } from "./python-collection-example-baseline";

type ReviewedExamples = { cases: [unknown, unknown][]; reason: RegExp };

// Valores públicos contrastados desde los contratos, no generados con soluciones.
const reviewed: Record<string, ReviewedExamples> = {
  "logica-elige-mensaje": { cases: [[3, "positivo"], [-2, "no positivo"]], reason: /termina la función.*se omite el bloque if/s },
  "logica-signo": { cases: [[3, "positivo"], [-2, "negativo"]], reason: /no se revisan las respuestas posteriores.*segunda es verdadera/s },
  "logica-mayor-tres": { cases: [[{ a: 3, b: 9, c: 2 }, 9], [{ a: -8, b: -2, c: -5 }, -2]], reason: /supera a los otros dos.*sin introducir un cero/s },
  "logica-dos-requisitos": { cases: [[15, true], [3, false]], reason: /True \(true en JSON\).*solo una condición no basta/s },
  "logica-alternativas": { cases: [[{ invitacion: true, entrada: false, bloqueado: false }, true], [{ invitacion: true, entrada: true, bloqueado: true }, false]], reason: /invitación basta.*bloqueo impide/s },
  "logica-tarifa": { cases: [[0, 0], [5, 0]], reason: /menor de 6.*aún no se alcanza el límite/s },
  "python-condicional": { cases: [[18, "adulto"], [17, "menor"]], reason: /incluye el 18.*texto, no un booleano.*otro lado del límite/s },
  "logica-uno-n": { cases: [[3, [1, 2, 3]], [1, [1]]], reason: /incluye el límite 3.*único valor/s },
  "logica-cuenta-atras": { cases: [[3, [3, 2, 1, 0]], [0, [0]]], reason: /incluir el cero.*debe aparecer una vez/s },
  "logica-suma-uno-n": { cases: [[3, 6], [0, 0]], reason: /1 \+ 2 \+ 3 = 6.*acumulador conserva/s },
  "logica-tabla": { cases: [[2, [2, 4, 6, 8, 10, 12, 14, 16, 18, 20]], [0, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]], reason: /diez resultados.*diez ceros, no una lista vacía/s },
  "logica-multiplos": { cases: [[{ n: 10, divisor: 3 }, 3], [{ n: 0, divisor: 2 }, 0]], reason: /3, 6 y 9.*no se cuenta cero/s },
  "logica-bucle-roto": { cases: [[3, 6], [0, 0]], reason: /una vez cada uno.*no necesita vueltas/s },
  "python-centinela": { cases: [[[2, 0, 8], [2]], [[0, 4], []]], reason: /antes de llegar al ocho.*no se conserva ninguno/s },
  "python-omite-negativos": { cases: [[[-1, 0, 3], [0, 3]], [[], []]], reason: /cero y tres se conservan.*no produce vueltas/s },
  "logica-posicion": { cases: [[{ numbers: [4, 8, 2], index: 1 }, 8], [{ numbers: [0], index: 0 }, 0]], reason: /posiciones empiezan en cero.*no una señal de ausencia/s },
  "logica-indices": { cases: [[[4, 9, 2], [4, 9, 2]], [[], []]], reason: /no sus índices.*no tiene índices válidos/s },
  "logica-suma-lista": { cases: [[[1, 2, 3, 4], 10], [[], 0]], reason: /1 \+ 2 \+ 3 \+ 4 = 10.*total inicial de 0/s },
  "logica-maximo": { cases: [[[3, 9, 2, 9], 9], [[-8, -2, -5], -2]], reason: /dos veces no cambia.*valor que no está en la lista/s },
  "logica-cuenta-condicion": { cases: [[[1, -2, 0, 3], 2], [[], 0]], reason: /-2 y 0 no cuentan.*conteo es 0/s },
  "logica-filtra-lista": { cases: [[{ values: [3, 8, 1, 5], minimo: 5 }, [8, 5]], [{ values: [1, 2], minimo: 3 }, []]], reason: /8 supera.*5 lo iguala.*en ese orden.*Se omiten 3 y 1/s },
  "logica-busqueda-lineal": { cases: [[{ values: [4, 9, 2, 7], target: 2 }, 2], [{ values: [1, 2, 3], target: 5 }, -1]], reason: /posición dos \(el tercer elemento\).*no aparece/s },
  "logica-longitud-texto": { cases: [["Hola", 4], ["", 0]], reason: /mayúscula H cuenta igual.*no contiene caracteres/s },
  "logica-minusculas": { cases: [["HoLa", "hola"], ["AEIOU", "aeiou"]], reason: /ya lo estaban se conservan.*manteniendo su orden/s },
  "logica-vocales": { cases: [["Hola mundo", 4], ["Itera", 3]], reason: /contando las repeticiones.*mayúscula inicial también/s },
  "logica-invierte": { cases: [["itera", "areti"], ["Hola mundo", "odnum aloH"]], reason: /último carácter hasta el primero.*espacio y las mayúsculas/s },
  "logica-elimina-caracter": { cases: [[{ texto: "banana", caracter: "a" }, "bnn"], [{ texto: "", caracter: "x" }, ""]], reason: /tres apariciones.*b, n y n en su orden.*permanece vacío/s },
  "logica-palabras": { cases: [["hola mundo", 2], ["  uno   dos ", 2]], reason: /dos palabras.*repetidos no crean palabras vacías/s },
  "python-ordena-numeros": { cases: [[[3, 1, 3], { original: [3, 1, 3], ordenados: [1, 3, 3] }], [[], { original: [], ordenados: [] }]], reason: /conservando los dos treses.*original conserva \[\].*no hay elementos que ordenar/s },
  "python-recorta": { cases: [[{ valores: [4, 8, 2], inicio: 1, fin: 3 }, [8, 2]], [{ valores: [], inicio: 0, fin: 0 }, []]], reason: /índices uno y dos, no el límite tres.*tramo vacío/s },
  "python-une-palabras": { cases: [["  Hola   Mundo ", "Hola Mundo"], ["\tuno\ndos", "uno dos"]], reason: /único separador.*Tabulación y salto de línea/s },
  "python-desempaqueta": { cases: [[[3, 8], [8, 3]], [[0, 0], [0, 0]]], reason: /segundo valor pasa a la primera.*dos posiciones/s },
};

test("el segundo bloque contrasta 64 ejemplos de las siguientes 32 actividades", () => {
  const batch = pythonCatalog.slice(32, 64);
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
  assert.equal(pythonCatalog.slice(0, 64).reduce((sum, entry) => sum + entry.content.variants[0].tests.filter(item => item.visible).length, 0), 113);
});

test("el bloque solo cambia tres explicaciones públicas y recupera la entrega anterior", () => {
  const payload = pythonCatalog.map(entry => ({ ...entry, content: beforePythonCollectionExamples(entry.slug, entry.content) })).map(entry => !(entry.slug in previousReviewedExamples) ? entry : ({ ...entry, content: {
    ...entry.content, variants: entry.content.variants.map(variant => ({ ...variant, tests: variant.tests.map(item =>
      item.visible && item.order === previousReviewedExamples[entry.slug].order ? { ...item, explanation: "" } : item),
    })),
  } }));
  // Calculada antes de editar. Protege ejemplos conservados, casos ocultos,
  // entradas/salidas, contratos, código y toda superficie ajena a los tres textos.
  assert.equal(createHash("sha256").update(JSON.stringify(payload)).digest("hex"), "77877c060cce6288f9f1b7aa1e224554406d55cfbfa1125f5f12ecc5094660da");
  const previous = pythonCatalog.map(entry => ({ ...entry, content: beforePythonExampleReview(entry.slug, entry.content) }));
  assert.equal(pythonReleaseFingerprint(previous), "c7720201bb98fc7c81aa6a646952ba7c73486200121d43d0f8292a9eaf7e9c29");
});
