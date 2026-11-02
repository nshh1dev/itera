import { test } from "node:test";
import assert from "node:assert/strict";
import { pythonCatalog } from "../prisma/python-content";
import { pythonReleaseFingerprint } from "../prisma/python-releases";
import { beforePythonExampleReview } from "./python-example-review-baseline";

type ReviewedExamples = { cases: [unknown, unknown][]; reason: RegExp };

// Contraste editorial independiente de las referencias: salidas escritas desde
// los contratos. PROGRAM conserva saltos y textos; FUNCTION conserva tipos JSON.
const reviewed: Record<string, ReviewedExamples> = {
  "logica-saludo": { cases: [["", "Hola, mundo!\n"]], reason: /comillas.*no se imprimen/ },
  "logica-dos-lineas": { cases: [["", "Primera\nSegunda\n"]], reason: /cada instrucción.*propia línea/ },
  "logica-orden-mensaje": { cases: [["", "Preparar\nMezclar\nServir\n"]], reason: /preparación precede.*mezcla.*servicio/ },
  "logica-texto-calculo": { cases: [["", "10\n4 + 6\n"]], reason: /Sin comillas.*10.*Entre comillas.*espacios/ },
  "logica-guarda-nombre": { cases: [["", "Ada\n"]], reason: /valor no imprime el nombre de la variable/ },
  "logica-guarda-cantidad": { cases: [["", "8\n"]], reason: /ese valor, no la palabra puntos/ },
  "logica-actualiza-puntos": { cases: [["", "11\n"]], reason: /se conservan.*se añaden 3.*no a 3/ },
  "logica-intercambia": { cases: [["", "8\n3\n"]], reason: /segunda conserva el 3 inicial.*líneas distintas/ },
  "logica-suma-cantidades": { cases: [["", "12\n"]], reason: /7 \+ 5 produce 12/ },
  "logica-cambio": { cases: [["", "7\n"]], reason: /20 se resta.*13.*7/ },
  "logica-precio-unidades": { cases: [["", "24\n"]], reason: /6 × 4.*24/ },
  "logica-parentesis": { cases: [["", "14\n"]], reason: /suma es 14.*solo el 3 no/ },
  "python-constante": { cases: [["", "18\n"]], reason: /tres grupos de seis/ },
  "logica-lee-nombre": { cases: [["Ana\n", "Hola, Ana\n"], ["Luis\n", "Hola, Luis\n"]], reason: /mayúscula inicial.*entrada, no queda fijado/s },
  "logica-lee-doble": { cases: [["3\n", "6\n"], ["0\n", "0\n"]], reason: /no el texto 33.*no se sustituye/s },
  "logica-lee-suma": { cases: [["3\n5\n", "8\n"], ["0\n0\n", "0\n"]], reason: /35, que no es la suma.*no el texto 00/s },
  "logica-mensaje-resultado": { cases: [["Lima\n", "Destino: Lima\n"], ["Madrid\n", "Destino: Madrid\n"]], reason: /espacio antes de Lima.*dato recibido/s },
  "python-decimal": { cases: [["0.5\n", "1.0\n"], ["-0.5\n", "0.0\n"]], reason: /print conserva el \.0.*-0\.5 \+ 0\.5 da 0\.0/s },
  "logica-numero-texto": { cases: [["", "6\n42\n"]], reason: /textos se unen sin sumar/ },
  "logica-booleano": { cases: [["", "true\n"]], reason: /True, el booleano de Python.*minúsculas true/ },
  "logica-igualdad": { cases: [["3\n3\n", "true\n"], ["3\n4\n", "false\n"]], reason: /produce True.*como true.*produce False.*muestra false/s },
  "logica-alcanza": { cases: [["9\n", "false\n"], ["10\n", "true\n"]], reason: /falta una unidad.*límite está incluido/s },
  "logica-retorno": { cases: [[4, 4], [0, 0]], reason: /imprimirlo no sustituye.*no como None/s },
  "logica-parametro": { cases: [[3, 6], [5, 10]], reason: /sumar solo dos daría 7/ },
  "logica-dos-parametros": { cases: [[{ a: 3, b: 5 }, 8], [{ a: -2, b: 7 }, 5]], reason: /signos forman parte del cálculo/ },
  "logica-imprimir-devolver": { cases: [[4, 5], [0, 1]], reason: /pantalla no es el resultado.*sumar 1 da 1/s },
  "logica-predice-valores": { cases: [[2, 10], [0, 6]], reason: /obtener 5 y después se duplica.*no cero/s },
  "logica-tabla-valores": { cases: [[1, "1 -> 3 -> 9"], [0, "0 -> 2 -> 6"]], reason: /multiplicar ese 3 por 3.*primer estado no desaparece/s },
  "logica-minutos-segundos": { cases: [[2, 120], [0, 0]], reason: /2 × 60 = 120.*no se añade un minuto/s },
  "logica-perimetro": { cases: [[{ base: 3, altura: 4 }, 14], [{ base: 1, altura: 1 }, 4]], reason: /3 \+ 4 \+ 3 \+ 4 = 14.*área no es el perímetro/s },
  "logica-repara-presupuesto": { cases: [[{ precio: 3, unidades: 4, envio: 2 }, 14], [{ precio: 0, unidades: 0, envio: 5 }, 5]], reason: /una sola vez.*envío de 5 sigue sumándose/s },
  "logica-merienda": { cases: [[{ unidades: 3, precio: 4 }, "Total: 12"], [{ unidades: 0, precio: 7 }, "Total: 0"]], reason: /espacio y ese importe.*aunque el precio sea 7/s },
};

test("la revisión pública inicial cubre 49 ejemplos de las primeras 32 actividades", () => {
  const batch = pythonCatalog.slice(0, 32);
  assert.deepEqual(batch.map(entry => entry.slug), Object.keys(reviewed));
  let count = 0;
  for (const entry of batch) {
    const visible = entry.content.variants[0].tests.filter(item => item.visible);
    assert.deepEqual(visible.map(item => [item.input, item.expected]), reviewed[entry.slug].cases, entry.slug);
    assert.ok(visible.every(item => item.explanation?.trim()), entry.slug);
    count += visible.length;
  }
  assert.equal(count, 49);
});

test("las explicaciones conservadas justifican operaciones, formatos y fronteras", () => {
  for (const entry of pythonCatalog.slice(0, 32)) {
    const text = entry.content.variants[0].tests.filter(item => item.visible).map(item => item.explanation).join("\n");
    assert.match(text, reviewed[entry.slug].reason, entry.slug);
  }
});

test("la revisión editorial inicial de ejemplos no cambia el catálogo", () => {
  // Esta prueba no ejecuta referencias ni código de alumnos. Las tablas fijan
  // los datos públicos revisados; no certifican calidad global ni aislamiento.
  const previous = pythonCatalog.map(entry => ({ ...entry, content: beforePythonExampleReview(entry.slug, entry.content) }));
  assert.equal(pythonReleaseFingerprint(previous), "c7720201bb98fc7c81aa6a646952ba7c73486200121d43d0f8292a9eaf7e9c29");
});
