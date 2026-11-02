import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { pythonCatalog } from "../prisma/python-content";
import { pythonReleaseFingerprint } from "../prisma/python-releases";
import { beforePythonCollectionExamples, previousCollectionExamples } from "./python-collection-example-baseline";

type ReviewedExamples = { cases: [unknown, unknown][]; reason: RegExp };

// Datos públicos contrastados manualmente con los contratos. No se generan
// respuestas con referencias ni se ejecuta código de alumnos.
const reviewed: Record<string, ReviewedExamples> = {
  "logica-reproduce-fallo": { cases: [[[0], 0], [[1, -1, 0, 2], 2]], reason: /cero y no es estrictamente positivo.*-1 y 0 quedan fuera/s },
  "logica-conserva-regresion": { cases: [[{ total: 10, limite: 10 }, 8], [{ total: 0, limite: 0 }, 0]], reason: /exactamente el límite.*no puede dejar un total negativo/s },
  "logica-factorial": { cases: [[5, 120], [0, 1]], reason: /1 × 2 × 3 × 4 × 5 = 120.*producto inicial/s },
  "logica-fizzbuzz": { cases: [[5, [1, 2, "Fizz", 4, "Buzz"]], [3, [1, 2, "Fizz"]]], reason: /demás conservan su valor y posición.*límite 3 se incluye/s },
  "logica-mediciones": { cases: [[[-2, 0, 5], { total: 3, positivos: 1, mayor: 5 }], [[], { total: 0, positivos: 0, mayor: null }]], reason: /solo 5 es estrictamente positivo.*no existe máximo.*None/s },
  "logica-carrito": { cases: [[{ items: [{ precio: 10, cantidad: 2 }], descuento: 10 }, 18], [{ items: [], descuento: 30 }, 0]], reason: /10 % resta 2 y deja 18.*porcentaje de cero/s },
  "logica-notas": { cases: [[[4, 5, 9], { aprobados: 2, media: 6 }], [[], { aprobados: 0, media: null }]], reason: /media incluye las tres notas.*None.*no 0/s },
  "logica-saldo": { cases: [[{ inicial: 10, movimientos: [-15, 5, -10] }, { saldo: 5, rechazados: 1 }], [{ inicial: 0, movimientos: [] }, { saldo: 0, rechazados: 0 }]], reason: /rechaza -15.*Desde 10 se aceptan.*no se rechaza nada/s },
  "logica-gastos-registro": { cases: [[[{ categoria: "casa", importe: 4 }, { categoria: "ocio", importe: 2 }, { categoria: "casa", importe: 1 }], { total: 7, porCategoria: { casa: 5, ocio: 2 } }], [[], { total: 0, porCategoria: {} }]], reason: /4 \+ 1 = 5.*total.*7.*no hay categorías/s },
  "logica-gastos-validacion": { cases: [[[{ categoria: "casa", importe: 5 }, { categoria: "ocio", importe: -1 }, { categoria: "otra", importe: 3 }], { total: 5, porCategoria: { casa: 5 }, rechazados: 2 }], [[], { total: 0, porCategoria: {}, rechazados: 0 }]], reason: /importe negativo.*no es una categoría permitida.*rechazan dos/s },
  "python-conjunto-seguro": { cases: [[{ valores: [2, 2], agregar: 3, quitar: 9 }, [2, 3]], [{ valores: [], agregar: 1, quitar: 1 }, []]], reason: /se añade 3.*9 no está.*orden ascendente.*Añadir y luego quitar/s },
  "python-union": { cases: [[{ a: [1, 2], b: [2, 3] }, [1, 2, 3]], [{ a: [], b: [] }, []]], reason: /compartido aparece una sola vez.*vacíos no aportan/s },
  "python-interseccion": { cases: [[{ a: [1, 2, 2], b: [2, 3] }, [2]], [{ a: [], b: [2] }, []]], reason: /independencia de sus repeticiones.*vacía no comparte/s },
  "python-diferencia": { cases: [[{ disponibles: ["oro"], requeridos: ["oro", "mapa"] }, ["mapa"]], [{ disponibles: [], requeridos: [] }, []]], reason: /mapa es el único requisito pendiente.*Sin requisitos/s },
  "python-simetrica": { cases: [[{ a: [1, 2], b: [2, 3] }, [1, 3]], [{ a: [], b: [2, 2] }, [2]]], reason: /compartido desaparece.*exclusivo de b.*una sola vez/s },
  "python-subconjunto": { cases: [[{ disponibles: ["a", "b"], requeridos: ["b"] }, true], [{ disponibles: [], requeridos: [] }, true]], reason: /único requisito.*No tener requisitos.*incluso sin disponibles/s },
  "logica-repetido": { cases: [[[1, 2, 1], true], [[], false]], reason: /primera y tercera posición.*True \(true en JSON\).*False \(false en JSON\)/s },
  "logica-deduplica": { cases: [[[3, 1, 3, 2, 1], [3, 1, 2]], [[4, 4, 4], [4]]], reason: /sin ordenar los valores.*solo la primera/s },
  "logica-frecuencias": { cases: [["banana", { b: 1, a: 3, n: 2 }], ["abc", { a: 1, b: 1, c: 1 }]], reason: /repeticiones se acumulan bajo la misma clave.*frecuencias valen 1/s },
  "logica-primer-unico": { cases: [["abac", "b"], ["aabb", null]], reason: /antes que c.*no hay carácter único.*None/s },
  "logica-anagramas": { cases: [[{ a: "amor", b: "roma" }, true], [{ a: "casa", b: "cosa" }, false]], reason: /mismas frecuencias.*casa contiene dos a.*frecuencias difieren/s },
  "python-crea-grupo": { cases: [[{ grupos: { a: ["ana"] }, categoria: "a", nombre: "bea" }, { a: ["ana", "bea"] }], [{ grupos: {}, categoria: "b", nombre: "ana" }, { b: ["ana"] }]], reason: /\['ana', 'bea'\].*minúsculas recibidas.*categoría nueva/s },
  "logica-agrupa-registros": { cases: [[[{ categoria: "fruta", nombre: "pera" }, { categoria: "pan", nombre: "barra" }, { categoria: "fruta", nombre: "uva" }], { fruta: ["pera", "uva"], pan: ["barra"] }], [[], {}]], reason: /mantienen su orden.*otra lista.*Sin registros/s },
  "python-comprension": { cases: [[[-2, 0, 3], [4, 0, 9]], [[], []]], reason: /cuadrado por posición.*negativo produce un cuadrado positivo.*vacía/s },
  "python-comprension-filtro": { cases: [["HOLA Mundo", ["o", "a", "u", "o"]], ["xyz", []]], reason: /mayúsculas también cuentan.*orden de las vocales.*Sin vocales/s },
  "python-comprension-condicional": { cases: [[[-2, 3, 0], [0, 3, 0]], [[], []]], reason: /sin eliminar su posición.*No hay posiciones/s },
  "python-comprension-dict": { cases: [[["sol", "a", "sol"], { sol: 3, a: 1 }], [[], {}]], reason: /sol tiene tres caracteres y a tiene uno.*sin duplicar claves.*Sin palabras/s },
  "python-iterador": { cases: [[[1, 2], [[1, 2], []]], [[], [[], []]]], reason: /no quedan para la segunda.*ninguna materialización/s },
  "python-generador": { cases: [[[-2, 3], 13], [[], 0]], reason: /cuatro y nueve.*trece.*neutro cero/s },
  "python-map": { cases: [[["2", "-1"], [4, -2]], [[], []]], reason: /convierte antes de multiplicar.*signo negativo.*entrada vacía/s },
  "python-filter": { cases: [[[{ nombre: "ana", edad: 18 }, { nombre: "bea", edad: 17 }], ["ana"]], [[], []]], reason: /dieciocho años sí.*diecisiete no.*no devuelve nombres/s },
  "python-agrega": { cases: [[[-4, -2], { total: -6, minimo: -4, maximo: -2 }], [[], { total: 0, minimo: null, maximo: null }]], reason: /suma de -4 y -2 es -6.*-4 es el mínimo y -2 el máximo.*extremos no existen/s },
};

test("el cuarto bloque contrasta 64 ejemplos y alcanza 241 ejemplos de 128 actividades", () => {
  const batch = pythonCatalog.slice(96, 128);
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
  assert.equal(pythonCatalog.slice(0, 128).reduce((sum, entry) => sum + entry.content.variants[0].tests.filter(item => item.visible).length, 0), 241);
});

test("solo cambian cuatro explicaciones públicas y se reconstruye la entrega anterior", () => {
  assert.equal(Object.keys(previousCollectionExamples).length, 4);
  const payload = pythonCatalog.map(entry => !(entry.slug in previousCollectionExamples) ? entry : ({ ...entry, content: {
    ...entry.content, variants: entry.content.variants.map(variant => ({ ...variant, tests: variant.tests.map(item =>
      item.visible && item.order === 0 ? { ...item, explanation: "" } : item),
    })),
  } }));
  // Calculada antes de editar: conserva los otros 60 textos públicos del bloque,
  // casos ocultos, datos, contratos, código y todo campo ajeno a esas posiciones.
  assert.equal(createHash("sha256").update(JSON.stringify(payload)).digest("hex"), "55062fbe91d06411b40effab29d0793f39d672d9c0a3141c8ae9e996cd68b8f2");
  const previous = pythonCatalog.map(entry => ({ ...entry, content: beforePythonCollectionExamples(entry.slug, entry.content) }));
  assert.equal(pythonReleaseFingerprint(previous), "01eca6dbf731d8cfba0fd748dbcda27c9763654b05b55f18775ed38778852816");
});
