import { test } from "node:test";
import assert from "node:assert/strict";
import { pythonCatalog } from "../prisma/python-content";
import { pythonReleaseFingerprint } from "../prisma/python-releases";
import { beforePythonCollectionExamples } from "./python-collection-example-baseline";

type ReviewedExamples = { cases: [unknown, unknown][]; reason: RegExp };

// Entradas/salidas públicas contrastadas desde el contrato. No se ejecuta la
// referencia para generar respuestas ni se infiere identidad desde JSON.
const reviewed: Record<string, ReviewedExamples> = {
  "python-enumera": { cases: [[["sol", "luz"], [[1, "sol"], [2, "luz"]]], [[], []]], reason: /desde uno.*orden.*lista vacía/s },
  "python-empareja": { cases: [[{ a: [1, 2], b: [3] }, [[1, 3]]], [{ a: [], b: [4] }, []]], reason: /primera posición.*ambas listas.*entrada vacía/s },
  "python-retorno-multiple": { cases: [[[2, 3], [5, 6]], [[0, 4], [4, 0]]], reason: /suma.*producto.*cero no elimina el otro resultado/s },
  "logica-ficha-producto": { cases: [[{ nombre: "Pan", precio: 3 }, 3], [{ nombre: "Agua", precio: 0 }, 0]], reason: /nombre Pan no forma parte.*sin tratarlo como un campo ausente/s },
  "logica-ficha-resultado": { cases: [[{ precio: 3, unidades: 4 }, { total: 12, unidades: 4 }], [{ precio: 0, unidades: 5 }, { total: 0, unidades: 5 }]], reason: /3 × 4 = 12.*no elimina las 5 unidades/s },
  "logica-opcional": { cases: [[{}, 1], [{ cantidad: 0 }, 0]], reason: /Falta la clave.*respaldo 1.*no debe sustituir ese cero/s },
  "logica-ausencia": { cases: [[null, -1], [0, 1]], reason: /null representa None.*Cero es un dato presente/s },
  "logica-auxiliares": { cases: [[{ precio: 500, cantidad: 2 }, 1300], [{ precio: 500, cantidad: 4 }, 2000]], reason: /1000.*300 de envío.*Exactamente 2000/s },
  "logica-variable-local": { cases: [[2, 3], [0, 1]], reason: /incrementa el 2 recibido.*no se omite la operación/s },
  "logica-parametro-exterior": { cases: [[{ exterior: 9, argumento: 2 }, [4, 9]], [{ exterior: 0, argumento: -3 }, [-6, 0]]], reason: /exterior 9 permanece separado.*exterior 0 se conserva/s },
  "logica-llamadas-independientes": { cases: [[[2, 3], [2, 3]], [[0, 1], [0, 1]]], reason: /no 2 y 5.*segunda empieza de nuevo/s },
  "logica-sin-estado-global": { cases: [[{ base: 10, tasas: [2, 4] }, [12, 14]], [{ base: 0, tasas: [] }, []]], reason: /misma base 10.*no 16.*Sin tasas no hay llamadas/s },
  "logica-encadena-retornos": { cases: [[{ precio: 3, unidades: 4 }, 14], [{ precio: 0, unidades: 0 }, 2]], reason: /cuestan 12.*añade 2.*sigue añadiendo 2/s },
  "logica-dos-nombres-lista": { cases: [[{ valores: [1, 2], nuevo: 3 }, [1, 2, 3]], [{ valores: [], nuevo: 0 }, [0]]], reason: /lista compartida.*vacía recibe 0 como elemento/s },
  "logica-reasigna-o-muta": { cases: [[{ valores: [1, 2], nuevo: 3 }, { original: [1, 2], alias: [3] }], [{ valores: [], nuevo: 0 }, { original: [], alias: [0] }]], reason: /no modifica la lista original.*no se añade el cero a la original/s },
  "logica-copia-plana": { cases: [[{ valores: [1], nuevo: 2 }, { original: [1], copia: [1, 2] }], [{ valores: [], nuevo: 0 }, { original: [], copia: [0] }]], reason: /original conserva \[1\].*sin añadir nada a la original/s },
  "logica-conserva-entrada": { cases: [[{ valores: [1, 2], incremento: 3 }, { original: [1, 2], ajustados: [4, 5] }], [{ valores: [], incremento: 2 }, { original: [], ajustados: [] }]], reason: /original conserva \[1, 2\].*tanto original como ajustados quedan vacíos/s },
  "logica-registro-compartido": { cases: [[{ ficha: { cantidad: 2 }, cambio: 3 }, [5, 5]], [{ ficha: { cantidad: 0 }, cambio: 0 }, [0, 0]]], reason: /2 \+ 3 = 5.*sin confundirlo con ausencia/s },
  "python-identidad": { cases: [[{ valores: [1, 2], nuevo: 3 }, { antes: [1, 2], original: [1, 2, 3], copia: [1, 2], igual: false, misma: true, copiaMisma: false }], [{ valores: [], nuevo: 0 }, { antes: [], original: [0], copia: [], igual: false, misma: true, copiaMisma: false }]], reason: /alias muta el original.*copia sigue vacía y la instantánea también/s },
  "python-opcional-seguro": { cases: [[[2, 5], [[2], [5]]], [[0, 0], [[0], [0]]]], reason: /Cada llamada.*propio valor.*no debe convertir dos llamadas en una acumulación/s },
  "python-actualiza-diccionario": { cases: [[{ valores: { a: 2 }, clave: "b", nuevo: 3 }, { a: 2, b: 3 }], [{ valores: { a: 2 }, clave: "a", nuevo: 0 }, { a: 0 }]], reason: /sin eliminar la pareja anterior.*cero se conserva/s },
  "python-borra-clave": { cases: [[{ valores: { a: 0, b: 2 }, clave: "a" }, { b: 2 }], [{ valores: { a: 1 }, clave: "z" }, { a: 1 }]], reason: /valor cero.*clave z no existe/s },
  "python-recorre-pares": { cases: [[{ b: 2, a: 0 }, ["a: 0", "b: 2"]], [{}, []]], reason: /a aparece antes de b aunque llegue después.*Sin parejas/s },
  "python-lista-registros": { cases: [[[{ nombre: "pan", cantidad: 2 }, { nombre: "pan", cantidad: 3 }], 5], [[], 0]], reason: /aunque tengan el mismo nombre.*acumulador permanece en cero/s },
  "logica-valida-divisor": { cases: [[{ total: 12, divisor: 3 }, 4], [{ total: 2, divisor: 0 }, null]], reason: /divisor 3 es válido.*No se divide entre cero.*None.*null en JSON/s },
  "logica-valido-cero-ausente": { cases: [[{ cantidad: 0 }, "valido"], [{ cantidad: null }, "ausente"]], reason: /0 está presente.*confundiría con ausencia.*null se recibe como None/s },
  "logica-localiza-error": { cases: [[{ valores: [8], indice: 0 }, 8], [{ valores: [], indice: 0 }, "indice fuera de rango"]], reason: /selecciona 8.*antes de intentar acceder/s },
  "logica-captura-conversion": { cases: [[" 12 ", 12], ["casa", null]], reason: /retirar los espacios exteriores.*entero válido.*None \(null en JSON\)/s },
  "logica-error-dominio": { cases: [[-1, "edad negativa"], [0, "aceptada"]], reason: /incumple la regla de no negatividad.*0 pertenece al dominio válido/s },
  "logica-recupera-elementos": { cases: [[["2", "x", "-1"], { validos: [2, -1], rechazados: 1 }], [[], { validos: [], rechazados: 0 }]], reason: /conservan el orden.*sin impedir recuperar -1.*contador en 0/s },
  "logica-asercion-normal": { cases: [[2, 6], [0, 0]], reason: /no un conteo de aserciones.*prueba local no cambia el dato/s },
  "logica-pruebas-limites": { cases: [[[3, 8, 1], 8], [[], null]], reason: /no revela por sí solo el defecto.*None \(null en JSON\), no el candidato inicial 0/s },
};

test("el tercer bloque contrasta 64 ejemplos de parejas, referencias y validación", () => {
  const batch = pythonCatalog.slice(64, 96);
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
  assert.equal(pythonCatalog.slice(0, 96).reduce((sum, entry) => sum + entry.content.variants[0].tests.filter(item => item.visible).length, 0), 177);
});

test("los ejemplos conservados distinguen contenido observable de identidad y técnica", () => {
  const content = (slug: string) => pythonCatalog.find(entry => entry.slug === slug)!.content;
  assert.match(content("logica-copia-plana").statement, /comparación de contenidos no certifica identidad/);
  assert.match(content("python-identidad").statement, /identidad se entiende revisando el código y sus comparaciones is/);
  assert.match(content("logica-valida-divisor").statement, /produce float.*JSON puede mostrarlo como 0/s);
  assert.match(content("logica-recupera-elementos").statement, /no certifica el alcance exacto del try/);
  assert.match(content("logica-pruebas-limites").statement, /no cuentan las aserciones ni los mensajes/);
});

test("el tercer bloque conserva íntegra la entrega anterior", () => {
  // No hay cambios de prosa ni nuevo eslabón de reconstrucción en este bloque.
  const previous = pythonCatalog.map(entry => ({ ...entry, content: beforePythonCollectionExamples(entry.slug, entry.content) }));
  assert.equal(pythonReleaseFingerprint(previous), "01eca6dbf731d8cfba0fd748dbcda27c9763654b05b55f18775ed38778852816");
});
