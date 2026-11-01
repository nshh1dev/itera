import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { pythonCatalog } from "../prisma/python-content";
import { pythonRecordExplanations } from "../prisma/python-record-explanations";
import { pythonCollectionExplanations } from "../prisma/python-collection-explanations";
import { pythonFoundationExplanations } from "../prisma/python-foundation-explanations";
import { pythonSolutionExplanations } from "../prisma/python-vocabulary";
import { pythonLessons } from "../prisma/python-lessons";
import { pythonReleaseFingerprint } from "../prisma/python-releases";
import type { Json } from "../src/lib/types";
import { beforePythonRecords } from "./python-record-baseline";

test("las 48 actividades propias tienen explicaciones revisadas, con 15 ajustes finales y edición conservada", () => {
  const own = pythonCatalog.filter(entry => pythonLessons.has(entry.slug));
  assert.equal(own.length, 48);
  const final = own.slice(32);
  assert.equal(Object.keys(pythonRecordExplanations).length, 15);
  assert.deepEqual(new Set(Object.keys(pythonRecordExplanations)), new Set(final.filter(entry => entry.slug !== "python-contactos-edita").map(entry => entry.slug)));
  assert.equal(final.find(entry => entry.slug === "python-contactos-edita")!.content.variants[0].explanation, pythonSolutionExplanations["python-contactos-edita"]);
  for (const entry of final.filter(entry => entry.slug !== "python-contactos-edita")) {
    const text = entry.content.variants[0].explanation;
    assert.equal(text, pythonRecordExplanations[entry.slug], entry.slug);
    assert.ok(!text.includes(pythonLessons.get(entry.slug)!.theory), entry.slug);
    assert.doesNotMatch(text, /\b(?:arreglos?|propiedades?|push)\b/i, entry.slug);
    if (/\bnull\b/.test(text)) assert.match(text, /None.*null.*JSON/, entry.slug);
  }
  const reviewed = new Set([...Object.keys(pythonRecordExplanations), ...Object.keys(pythonCollectionExplanations), ...Object.keys(pythonFoundationExplanations), ...Object.keys(pythonSolutionExplanations)]);
  assert.equal(reviewed.size, 73);
  for (const entry of own) assert.ok(reviewed.has(entry.slug), entry.slug);
});

test("los textos siguen referencias concretas sin confundir filtros, orden, ausencia y persistencia", () => {
  const text = pythonRecordExplanations;
  assert.match(text["python-filter"], /dos nombres ana.*18 años.*igualdad/);
  assert.match(text["python-agrega"], /maximo -2.*ambos extremos None.*\[0\]/);
  assert.match(text["python-clave-longitud"], /sol permanece antes que luz.*estable/);
  assert.match(text["python-lambda-desempate"], /reverse=True.*invertiría también el alfabético/);
  assert.match(text["python-formato-decimal"], /3.50.*2.5.*3.5.*redondeo al par/);
  assert.match(text["python-consulta-anidada"], /nota 0.*curso con nota None.*alumno ausente.*misma respuesta/);
  assert.match(text["python-inventario-valora"], /cantidad \* precio_centimos.*cero produce una fila.*archivos/);
  assert.match(text["python-academia-inscribe"], /dict\(cursos\).*incluida 0.*no guarda datos en disco/);
  assert.match(text["python-academia-califica"], /0 o 100.*-1 o 101.*no crea inscripciones/);
  assert.match(text["python-academia-resume"], /sin dividir entre cero.*media 0 sí aparece.*85.5/);
  assert.match(text["python-contactos-crea"], /duplicado no reemplaza.*vacía tampoco.*012/);
  assert.match(text["python-contactos-borra"], /elimina ana pero conserva anabel.*no se utiliza el valor retirado/);
  assert.match(text["python-contactos-busca"], /vacío coincide.*presente.*no con uno ausente.*Sin filtros/);
  assert.match(text["python-transforma-campo"], /ciudad sigue en 'Lima'.*no se crea.*textos inmutables/);
  assert.match(text["python-transforma-registros"], /Solo int.*ValueError.*demás campos y registros.*nativa.*gramática ASCII restringida/);
});

test("el quinto lote conserva las 58 explicaciones anteriores y todo salvo 15 textos", () => {
  const payload = pythonCatalog.map(entry => ({ ...entry, content: { ...entry.content, variants: entry.content.variants.map(variant => {
    if (!(entry.slug in pythonRecordExplanations)) return variant;
    const { explanation, ...rest } = variant;
    void explanation;
    return rest;
  }) } }));
  // Calculada antes de editar este lote; protege también los 151 textos pendientes.
  assert.equal(createHash("sha256").update(JSON.stringify(payload)).digest("hex"), "b3bbcc05e740c3f715761ed78873e262ef0a597062cbebd7ec3cca7857f80120");
  const previous = pythonCatalog.map(entry => ({ ...entry, content: beforePythonRecords(entry.slug, entry.content) }));
  assert.equal(pythonReleaseFingerprint(previous), "cf0e2664948c22a45d6f84e576e7db736aff53bcd89824dac03e4a8120be278d");
});

// Casos editoriales independientes. Solo se ejecutan referencias del repositorio;
// conservar la entrada al retornar no certifica ausencia de toda mutación intermedia.
const examples: Record<string, [Json, Json][]> = {
  "python-filter": [
    [[{ nombre: "menor", edad: 17 }, { nombre: "ana", edad: 18 }, { nombre: "ana", edad: 25 }], ["ana", "ana"]],
    [[{ nombre: "menor", edad: 0 }], []],
  ],
  "python-agrega": [[[-4, -2], { total: -6, minimo: -4, maximo: -2 }], [[], { total: 0, minimo: null, maximo: null }], [[0], { total: 0, minimo: 0, maximo: 0 }]],
  "python-clave-longitud": [[["sol", "a", "luz", "de"], ["a", "de", "sol", "luz"]], [[], []]],
  "python-lambda-desempate": [[["sol", "a", "luz", "luz"], ["luz", "luz", "sol", "a"]], [[], []]],
  "python-formato-decimal": [[{ numero: 3.5, decimales: 2 }, "3.50"], [{ numero: 2.5, decimales: 0 }, "2"], [{ numero: 3.5, decimales: 0 }, "4"]],
  "python-consulta-anidada": [
    [{ registro: { ana: { mate: 0 } }, alumno: "ana", curso: "mate" }, 0],
    [{ registro: { ana: { mate: null } }, alumno: "ana", curso: "mate" }, null],
    [{ registro: { ana: {} }, alumno: "ana", curso: "mate" }, null],
    [{ registro: {}, alumno: "ana", curso: "mate" }, null],
  ],
  "python-inventario-valora": [
    [[{ nombre: "pan", cantidad: 2, precio_centimos: 125 }, { nombre: "agua", cantidad: 1, precio_centimos: 250 }, { nombre: "sal", cantidad: 0, precio_centimos: 1 }],
      { total_centimos: 500, productos: [{ nombre: "agua", valor_centimos: 250 }, { nombre: "pan", valor_centimos: 250 }, { nombre: "sal", valor_centimos: 0 }] }],
    [[], { total_centimos: 0, productos: [] }],
  ],
  "python-academia-inscribe": [
    [{ registro: { ana: { mate: 0 }, bea: { arte: 90 } }, alumno: "ana", curso: "mate" }, { ana: { mate: 0 }, bea: { arte: 90 } }],
    [{ registro: {}, alumno: "ana", curso: "mate" }, { ana: { mate: null } }],
  ],
  "python-academia-califica": [
    [{ registro: { ana: { mate: null, arte: 75 } }, alumno: "ana", curso: "mate", nota: 0 }, { ana: { mate: 0, arte: 75 } }],
    [{ registro: { ana: { mate: 0 } }, alumno: "ana", curso: "mate", nota: 100 }, { ana: { mate: 100 } }],
    [{ registro: { ana: { mate: 8 } }, alumno: "ana", curso: "mate", nota: -1 }, { ana: { mate: 8 } }],
    [{ registro: { ana: { mate: 8 } }, alumno: "ana", curso: "mate", nota: 101 }, { ana: { mate: 8 } }],
    [{ registro: {}, alumno: "ana", curso: "mate", nota: 75 }, {}],
    [{ registro: { ana: {} }, alumno: "ana", curso: "mate", nota: 75 }, { ana: {} }],
  ],
  "python-academia-resume": [
    [{ ana: { mate: 0, arte: 100 }, bea: { mate: null }, carla: { mate: 0 } }, { medias: { ana: 50, bea: null, carla: 0 }, clasificacion: ["ana", "carla"] }],
    [{ bea: { mate: 85, arte: 86 }, ana: { mate: 85, arte: 86 }, carla: {} }, { medias: { bea: 85.5, ana: 85.5, carla: null }, clasificacion: ["ana", "bea"] }],
    [{}, { medias: {}, clasificacion: [] }],
  ],
  "python-contactos-crea": [
    [{ agenda: {}, nombre: " ANA ", telefono: "012", correo: "a@x" }, { ana: { telefono: "012", correo: "a@x" } }],
    [{ agenda: { ana: { telefono: "1", correo: "a@x" } }, nombre: " ANA ", telefono: "2", correo: "b@x" }, { ana: { telefono: "1", correo: "a@x" } }],
    [{ agenda: {}, nombre: "   ", telefono: "1", correo: "a@x" }, {}],
  ],
  "python-contactos-borra": [
    [{ agenda: { ana: { telefono: "1", correo: "a@x" }, anabel: { telefono: "2", correo: "b@x" } }, nombre: " ANA " }, { anabel: { telefono: "2", correo: "b@x" } }],
    [{ agenda: {}, nombre: "ana" }, {}],
  ],
  "python-contactos-busca": [
    [{ agenda: { bea: { correo: "EX@es" }, ana: { telefono: "12" }, carla: { telefono: "99", correo: "EX@es" } }, filtros: { telefono: "9", correo: "ex" } }, ["carla"]],
    [{ agenda: { bea: { correo: "" }, ana: {} }, filtros: { correo: "" } }, ["bea"]],
    [{ agenda: { bea: {}, ana: {} }, filtros: {} }, ["ana", "bea"]],
  ],
  "python-transforma-campo": [
    [{ registro: { nombre: " ANA ", ciudad: "Lima" }, campo: "nombre" }, { nombre: "ana", ciudad: "Lima" }],
    [{ registro: { ciudad: "Lima" }, campo: "nombre" }, { ciudad: "Lima" }],
  ],
  "python-transforma-registros": [
    [{ registros: [{ edad: "3.0", nombre: " X ", otro: " Y " }, { edad: " -7 " }, { edad: "0" }], reglas: { edad: "numerico", nombre: "trim" } },
      [{ edad: null, nombre: "X", otro: " Y " }, { edad: -7 }, { edad: 0 }]],
    [{ registros: [{ numero: "1_000", nombre: " ANA " }], reglas: { numero: "numerico", nombre: "minusculas", ausente: "trim" } }, [{ numero: 1000, nombre: " ana " }]],
    [{ registros: [], reglas: {} }, []],
  ],
};

test("las 15 referencias fijas confirman ejemplos, fronteras y contenido de entrada al retornar", () => {
  assert.deepEqual(new Set(Object.keys(examples)), new Set(Object.keys(pythonRecordExplanations)));
  const runner = `import sys,json,copy,io,contextlib
for entry in json.load(sys.stdin):
    namespace={}
    exec(entry['code'],namespace)
    for data,expected in entry['cases']:
        original=copy.deepcopy(data)
        output=io.StringIO()
        with contextlib.redirect_stdout(output):
            actual=namespace['solve'](data)
        assert actual==expected, (entry['slug'],original,actual,expected)
        assert data==original, (entry['slug'],'entrada modificada')
        assert output.getvalue()=='', (entry['slug'],'salida impresa')
print('ok')`;
  const result = spawnSync(process.env.PYTHON_BIN ?? "python", ["-c", runner], {
    encoding: "utf8", timeout: 30000,
    input: JSON.stringify(Object.entries(examples).map(([slug, cases]) => ({ slug, cases, code: pythonCatalog.find(entry => entry.slug === slug)!.content.variants[0].solution }))),
  });
  assert.equal(result.error, undefined);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), "ok");
});
