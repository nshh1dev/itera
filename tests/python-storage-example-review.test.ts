import { test } from "node:test";
import assert from "node:assert/strict";
import { pythonCatalog } from "../prisma/python-content";
import { pythonReleaseFingerprint } from "../prisma/python-releases";
import { beforePythonFinalExamples } from "./python-final-example-baseline";

type Review = { cases: [unknown, unknown][]; reason: RegExp };

// Parejas públicas contrastadas con los contratos, sin generar respuestas
// ejecutando referencias ni código de alumnos. Los artefactos se revisan aparte.
const reviewed: Record<string, Review> = {
  "python-clave-longitud": { cases: [[["sol", "a", "luz"], ["a", "sol", "luz"]], [[], []]], reason: /empate.*conserva su orden.*vacía/s },
  "python-lambda-desempate": { cases: [[["sol", "a", "luz"], ["luz", "sol", "a"]], [[], []]], reason: /tres letras van primero.*alfabeto.*vacía/s },
  "python-formato-decimal": { cases: [[{ numero: 3.5, decimales: 2 }, "3.50"], [{ numero: 2.5, decimales: 0 }, "2"]], reason: /segundo decimal.*cero.*hacia el par/s },
  "python-consulta-anidada": { cases: [[{ registro: { ana: { mate: 0 } }, alumno: "ana", curso: "mate" }, 0], [{ registro: {}, alumno: "ana", curso: "mate" }, null]], reason: /cero existe.*alumno ausente produce None/s },
  "logica-inventario": { cases: [[[{ producto: "pan", cambio: 3 }, { producto: "pan", cambio: -3 }, { producto: "agua", cambio: 2 }], { pan: 0, agua: 2 }], [[], {}]], reason: /3 - 3 = 0.*clave se conserva.*Sin movimientos/s },
  "logica-importa-preparado": { cases: [[3, 12], [0, 0]], reason: /3 por cuatro.*12.*0 por cuatro da 0/s },
  "logica-extrae-modulo": { cases: [[3, 9], [0, 0]], reason: /3 × 3 = 9.*cuadrado de cero es cero/s },
  "logica-separa-reglas-io": { cases: [[{ precio: 2, unidades: 4 }, "Total: 11"], [{ precio: 0, unidades: 0 }, "Total: 3"]], reason: /2 × 4 \+ 3 = 11.*prefijo Total:.*cargo fijo de 3/s },
  "logica-repara-importacion": { cases: [[2, 5], [0, 1]], reason: /cuadrado de 2 es 4.*sumar 1.*cero es 0.*1 sigue aplicándose/s },
  "logica-organiza-modulos": { cases: [[3, "Resultado: 9"], [0, "Resultado: 0"]], reason: /3 × 3 = 9.*Resultado:.*no trata ese valor como.*ausente/s },
  "logica-lee-archivo": { cases: [[0, "Sol"], [1, "Luna"]], reason: /primera línea.*Sol.*no incluye su salto.*segunda línea, Luna/s },
  "logica-escribe-archivo": { cases: [[" Ada", "Hola Ada"], ["", "Hola"]], reason: /espacio inicial.*exactamente Hola Ada, sin salto final.*sin añadir espacios ni saltos/s },
  "logica-valida-json": { cases: [[{ documento: "valido", cantidad: 0 }, "aceptada"], [{ documento: "texto", cantidad: 1 }, "configuracion invalida"]], reason: /extremo inferior.*incluido.*sintácticamente válido, pero no la ficha/s },
  "logica-guarda-recupera": { cases: [[[1, 2], [1, 2]], [[], []]], reason: /1 y 2, en el mismo orden.*\[\], no como None/s },
  "logica-recupera-archivo-invalido": { cases: [["ausente", 0], ["roto", 0]], reason: /ausente no puede leerse.*respaldo 0.*roto no contiene JSON utilizable/s },
  "logica-actualiza-persistidos": { cases: [[[6], [2, 4, 6]], [[], [2, 4]]], reason: /\[2, 4\].*6 recibido.*\[2, 4, 6\].*conservarse en lugar de reiniciarse/s },
  "logica-inventario-modular": { cases: [[[{ producto: "pan", cambio: 3 }, { producto: "pan", cambio: -4 }, { producto: "pan", cambio: -1 }], { stock: { pan: 2 }, rechazados: 1 }], [[], { stock: {}, rechazados: 0 }]], reason: /-4 se rechaza.*no modifica.*acepta -1.*Sin movimientos/s },
  "logica-inventario-persistente": { cases: [[[{ producto: "pan", cambio: -1 }, { producto: "sal", cambio: 3 }], { stock: { pan: 1, sal: 3 }, rechazados: 0 }], [[], { stock: { pan: 2 }, rechazados: 0 }]], reason: /pan es 2.*retirar 1 deja 1.*sal crea esa clave.*no se reinicia/s },
  "python-inventario-valora": { cases: [[[{ nombre: "pan", cantidad: 2, precio_centimos: 125 }, { nombre: "agua", cantidad: 1, precio_centimos: 100 }], { total_centimos: 350, productos: [{ nombre: "pan", valor_centimos: 250 }, { nombre: "agua", valor_centimos: 100 }] }], [[], { total_centimos: 0, productos: [] }]], reason: /250 céntimos.*agua 100.*mayor a menor.*total es cero/s },
  "python-academia-inscribe": { cases: [[{ registro: {}, alumno: "ana", curso: "mate" }, { ana: { mate: null } }], [{ registro: { ana: { mate: 0 } }, alumno: "ana", curso: "mate" }, { ana: { mate: 0 } }]], reason: /nota pendiente.*conserva la nota cero/s },
  "python-academia-califica": { cases: [[{ registro: { ana: { mate: null } }, alumno: "ana", curso: "mate", nota: 0 }, { ana: { mate: 0 } }], [{ registro: { ana: { mate: 8 } }, alumno: "ana", curso: "mate", nota: 101 }, { ana: { mate: 8 } }]], reason: /cero es una calificación válida.*fuera del rango.*nota anterior/s },
  "python-academia-resume": { cases: [[{ ana: { mate: 0, arte: 100 }, bea: { mate: null } }, { medias: { ana: 50, bea: null }, clasificacion: ["ana"] }], [{}, { medias: {}, clasificacion: [] }]], reason: /cero participa.*pendiente no clasifica.*vacío no produce medias/s },
  "python-contactos-crea": { cases: [[{ agenda: {}, nombre: " ANA ", telefono: "012", correo: "a@b.es" }, { ana: { telefono: "012", correo: "a@b.es" } }], [{ agenda: { ana: { telefono: "1", correo: "x" } }, nombre: "Ana", telefono: "2", correo: "y" }, { ana: { telefono: "1", correo: "x" } }]], reason: /cero inicial.*texto.*ya existe.*no se reemplaza/s },
  "python-contactos-edita": { cases: [[{ agenda: { ana: { telefono: "1", correo: "x" } }, nombre: "  ANA  ", cambios: { telefono: "", otro: "no" } }, { ana: { telefono: "", correo: "x" } }], [{ agenda: {}, nombre: "ana", cambios: { correo: "y" } }, {}]], reason: /vacío permite borrar.*desconocido se ignora.*No se crea automáticamente/s },
  "python-contactos-borra": { cases: [[{ agenda: { ana: { telefono: "1", correo: "a" }, anabel: { telefono: "2", correo: "b" } }, nombre: " ANA " }, { anabel: { telefono: "2", correo: "b" } }], [{ agenda: {}, nombre: "ana" }, {}]], reason: /anabel no coincide.*clave completa ana.*vacía/s },
  "python-contactos-busca": { cases: [[{ agenda: { ana: { telefono: "123", correo: "A@EX.es" }, bea: { telefono: "456", correo: "b@x.es" } }, filtros: { correo: "ex", telefono: "2" } }, ["ana"]], [{ agenda: {}, filtros: {} }, []]], reason: /a la vez.*correo.*teléfono.*vacía no tiene coincidencias/s },
  "logica-agenda-operaciones": { cases: [[[{ accion: "crear", titulo: "leer" }, { accion: "completar", titulo: "leer" }], [{ titulo: "leer", hecha: true }]], [[], []]], reason: /crea leer.*completa esa misma.*True \(true en JSON\).*permanece vacía/s },
  "logica-agenda-almacenamiento": { cases: [[[{ accion: "completar", titulo: "leer" }], [{ titulo: "leer", hecha: true }]], [[], [{ titulo: "leer", hecha: false }]]], reason: /ya existe.*sin crear otra ficha.*False \(false en JSON\)/s },
  "logica-agenda-regresion": { cases: [[[{ accion: "completar", titulo: "leer" }], [{ titulo: "leer", hecha: true }]], [[], [{ titulo: "leer", hecha: false }]]], reason: /una sola ficha, no un duplicado.*sin cambios.*pendiente/is },
  "python-transforma-campo": { cases: [[{ registro: { nombre: " ANA ", ciudad: "Quito" }, campo: "nombre" }, { nombre: "ana", ciudad: "Quito" }], [{ registro: {}, campo: "nombre" }, {}]], reason: /Solo nombre.*ciudad permanece igual.*No se crea/s },
  "python-transforma-registros": { cases: [[{ registros: [{ nombre: "ANA", edad: " 18 " }], reglas: { nombre: "minusculas", edad: "numerico" } }, [{ nombre: "ana", edad: 18 }]], [{ registros: [], reglas: {} }, []]], reason: /nombre a minúsculas.*edad a entero.*lista vacía de copias/s },
  "logica-busqueda-binaria": { cases: [[{ numbers: [1, 3, 5, 7, 9], target: 7 }, 3], [{ numbers: [2, 4], target: 3 }, -1]], reason: /cuarta posición.*índice es 3.*no una posición de inserción/s },
};

test("el quinto bloque contrasta 64 ejemplos y alcanza 305 de 160 actividades", () => {
  const batch = pythonCatalog.slice(128, 160);
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
  assert.equal(pythonCatalog.slice(0, 160).reduce((sum, entry) => sum + entry.content.variants[0].tests.filter(item => item.visible).length, 0), 305);
});

test("los ejemplos de disco conservan artefactos exactos y alcance de persistencia", () => {
  const content = (slug: string) => pythonCatalog.find(entry => entry.slug === slug)!.content;
  const artifacts: Record<string, [string, string[]]> = {
    "logica-escribe-archivo": ["resultado.txt", ["Hola Ada", "Hola"]],
    "logica-guarda-recupera": ["guardado.json", ["[1,2]", "[]"]],
    "logica-actualiza-persistidos": ["guardado.json", ["[2,4,6]", "[2,4]"]],
    "logica-inventario-persistente": ["guardado.json", ['{"pan":1,"sal":3}', '{"pan":2}']],
    "logica-agenda-almacenamiento": ["guardado.json", ['[{"titulo":"leer","hecha":true}]', '[{"titulo":"leer","hecha":false}]']],
    "logica-agenda-regresion": ["guardado.json", ['[{"titulo":"leer","hecha":true}]', '[{"titulo":"leer","hecha":false}]']],
  };
  for (const [slug, [path, texts]] of Object.entries(artifacts)) {
    const visible = content(slug).variants[0].tests.filter(item => item.visible);
    assert.deepEqual(visible.map(item => item.expectedFiles), texts.map(text => [{ path, content: text }]), slug);
    if (["logica-inventario-persistente", "logica-agenda-almacenamiento", "logica-agenda-regresion"].includes(slug)) {
      assert.deepEqual(visible.map(item => item.expectedPersistence), visible.map(item => item.expected), slug);
      assert.match(content(slug).statement, /proceso nuevo.*no se conserva entre envíos/s, slug);
    }
  }
  assert.match(content("logica-guarda-recupera").statement, /mismo proceso, no una prueba de persistencia entre procesos/);
  assert.match(content("logica-actualiza-persistidos").statement, /no promete persistencia entre procesos/);
  assert.match(content("logica-inventario-modular").statement, /modifica stock intencionalmente/);
});

test("el quinto bloque conserva íntegro el catálogo anterior", () => {
  const previous = pythonCatalog.map(entry => ({ ...entry, content: beforePythonFinalExamples(entry.slug, entry.content) }));
  assert.equal(pythonReleaseFingerprint(previous), "f5d67f389e846bb978604ce2a5e9dc8ad695a40699153b79c2edc57bf3834d10");
});
