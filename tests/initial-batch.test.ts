import { test } from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { spawnSync } from "node:child_process";
import { renderToStaticMarkup } from "react-dom/server";
import { exercises } from "../prisma/content";
import { initialBatchSlugs } from "../prisma/initial-batch";
import { seedVersionContent, catalogRevisionDecision } from "../prisma/editorial-revision";
import { editorialSchema, publicationMetadataSchema } from "../src/lib/editorial";
import { educationalMetadataSchema } from "../src/lib/learning-metadata";
import { prerequisiteIssue } from "../src/lib/curriculum";
import { LearningGuide } from "../src/components/practice/learning-guide";
import { Examples } from "../src/components/practice/examples";
import type { Json } from "../src/lib/types";

const batch = initialBatchSlugs.map(slug => exercises.find(exercise => exercise.slug === slug)!);
const entries = exercises.map((exercise, order) => ({ slug: exercise.slug, order }));

test("R1 revisa doce identidades existentes con contenido completo en ambos lenguajes", () => {
  assert.equal(batch.length, 12);
  assert.equal(exercises.length, 140, "se conservan las 124 actividades y se añaden 16");
  for (const exercise of batch) {
    assert.ok(exercise);
    const version = seedVersionContent(exercise);
    const [python, javascript, typescript] = version.variants;
    assert.equal(publicationMetadataSchema.safeParse(version).success, true, exercise.slug);
    assert.equal(editorialSchema.safeParse({ ...exercise, ...version, python, javascript, typescript, tests: python.tests }).success, true, exercise.slug);
    assert.equal(prerequisiteIssue(exercise.slug, version.prerequisiteSlugs, entries), undefined, exercise.slug);
    assert.match(exercise.statement, /Entrada\n/);
    assert.match(exercise.statement, /Resultado esperado\n/);
    assert.equal(exercise.hints.length, 3);
    assert.equal(new Set(exercise.hints).size, 3);
    assert.equal(exercise.hints.some(hint => /return\s+(?:data|\d|primero|resultado)/i.test(hint)), false, `${exercise.slug}: pista con respuesta completa`);
    assert.ok(version.variants.every(variant => variant.tests.filter(test => test.visible).every(test => test.explanation)));
    for (const variant of version.variants) {
      for (const section of ["Razonamiento\n", "Paso a paso\n", "Coste\n", "Errores comunes\n"]) assert.ok(variant.explanation.includes(section), `${exercise.slug}: ${section}`);
      assert.ok(variant.explanation.includes(variant.language === "python" ? "En Python\n" : variant.language === "typescript" ? "En TypeScript\n" : "En JavaScript\n"));
    }
    assert.notEqual(python.explanation, javascript.explanation, exercise.slug);
    assert.deepEqual(python.tests, javascript.tests, exercise.slug);
  }
  assert.deepEqual(batch.filter(exercise => exercise.activityType === "OBSERVATION").map(exercise => exercise.slug), ["tu-primer-resultado"]);
});

test("la validación rechaza relleno, pistas incompletas y referencias mal formadas", () => {
  const source = seedVersionContent(batch[0]);
  for (const text of ["Esta versión todavía no tiene un objetivo editorial descrito.", "Esta versión no especifica conocimientos previos.", "Objetivo pendiente por completar."]) {
    assert.equal(publicationMetadataSchema.safeParse({ ...source, objective: text }).success, false);
    assert.equal(publicationMetadataSchema.safeParse({ ...source, practiceGoals: [text] }).success, false);
  }
  assert.equal(publicationMetadataSchema.safeParse({ ...source, practiceGoals: [] }).success, false);
  assert.equal(educationalMetadataSchema.safeParse({ ...source, practiceGoals: [source.practiceGoals[0], source.practiceGoals[0]] }).success, false);
  assert.equal(educationalMetadataSchema.safeParse({ ...source, prerequisiteSlugs: ["/ejercicios/suma-uno"] }).success, false);
  assert.equal(educationalMetadataSchema.safeParse({ ...source, prerequisiteSlugs: ["suma-uno", "suma-uno"] }).success, false);
  assert.equal(educationalMetadataSchema.safeParse({ ...source, activityType: "UNKNOWN" }).success, false);
  const input = { ...batch[0], ...source, python: source.variants[0], javascript: source.variants[1], tests: source.variants[0].tests };
  for (const hints of [[], ["Una sola pista"], [...source.hints, "Una cuarta pista"]]) assert.equal(editorialSchema.safeParse({ ...input, hints }).success, false);
  assert.equal(editorialSchema.safeParse({ ...input, hints: Array(3).fill("La misma pista repetida.") }).success, false);
  assert.equal(editorialSchema.safeParse({ ...input, statement: "Esta versión todavía no tiene un objetivo editorial descrito." }).success, false);
  assert.equal(editorialSchema.safeParse({ ...input, python: { ...input.python, explanation: "Explicación por completar." } }).success, false);
});

test("los prerrequisitos no admiten autorreferencias, destinos inexistentes ni saltos hacia delante", () => {
  assert.match(prerequisiteIssue("suma-uno", ["suma-uno"], entries)!, /sí mismo/);
  assert.match(prerequisiteIssue("suma-uno", ["no-existe"], entries)!, /no está publicado/);
  assert.match(prerequisiteIssue("suma-uno", ["suma-de-dos-numeros"], entries)!, /antes/);
  assert.equal(prerequisiteIssue("suma-uno", ["devuelve-la-entrada"], entries), undefined);
  assert.equal(prerequisiteIssue("nuevo-ejercicio", ["suma-uno"], entries), undefined);
});

test("importar conserva objetivos, enlaces, actividad y explicaciones sin alterar versiones previas", () => {
  const source = seedVersionContent(batch[0]);
  for (const key of ["practiceGoals", "prerequisiteSlugs", "activityType"] as const) {
    const current = { ...structuredClone(source), id: "anterior", published: true };
    if (key === "activityType") current[key] = "GUIDED";
    else current[key] = ["contenido-anterior"];
    const previous = structuredClone(current);
    assert.equal(catalogRevisionDecision(current, source, current.id), "create");
    assert.deepEqual(current, previous);
  }
  const current = { ...structuredClone(source), id: "anterior", published: true };
  current.variants[0].tests[0].explanation = "Otra explicación";
  assert.equal(catalogRevisionDecision(current, source, current.id), "create");
  assert.equal(catalogRevisionDecision({ ...source, id: "nueva", published: false }, source, "anterior"), "unchanged");
});

test("la guía y los ejemplos muestran contenido y enlaces como texto seguro", () => {
  const guide = renderToStaticMarkup(LearningGuide({ objective: "Practicar el acceso a una entrada.", prerequisites: ["Usar return"], practiceGoals: ["Seleccionar <script> sin ejecutar HTML."], previousExercises: [{ title: "Un número más", href: "/ejercicios/suma-uno?lenguaje=javascript" }] }));
  assert.match(guide, /Seleccionar &lt;script&gt;/);
  assert.match(guide, /Ejercicios previos recomendados/);
  assert.match(guide, /href="\/ejercicios\/suma-uno\?lenguaje=javascript"/);
  assert.doesNotMatch(guide, /todavía no tiene|no especifica|<script>/);
  const examples = renderToStaticMarkup(Examples({ examples: [{ input: 3, expected: 6, explanation: "Dos veces <3> es seis." }] }));
  assert.match(examples, /Dos veces &lt;3&gt; es seis/);
});

// Oráculos independientes de las referencias; solo se ejecuta código fijo del repo.
function oracle(slug: string, input: Json): Json {
  if (slug === "tu-primer-resultado") return 7;
  if (slug === "cambia-un-numero") return 10;
  if (slug === "devuelve-la-entrada") return input;
  if (slug === "suma-uno" || slug === "guarda-un-resultado") return Number(BigInt(input as number) + 1n);
  if (slug === "el-doble") return Number(BigInt(input as number) + BigInt(input as number));
  if (slug === "lee-un-dato-con-nombre") return (input as { a: number }).a;
  if (slug === "suma-de-dos-numeros") {
    const { a, b } = input as { a: number; b: number };
    return Number(BigInt(a) + BigInt(b));
  }
  if (slug === "compara-con-cero") return Math.sign(input as number) === 1;
  if (slug === "compara-igualdad") return new Set([10]).has(input as number);
  const sign = Math.sign(input as number);
  if (slug === "elige-con-una-condicion") return sign === 1 ? "positivo" : "no positivo";
  return ({ "-1": "negativo", "0": "cero", "1": "positivo" })[String(sign) as "-1" | "0" | "1"];
}

const enumerations = batch.map(exercise => {
  let inputs: Json[];
  if (["tu-primer-resultado", "cambia-un-numero"].includes(exercise.slug)) inputs = [0, 1, 2, 3, 4];
  else if (exercise.slug === "suma-de-dos-numeros" || exercise.slug === "lee-un-dato-con-nombre") {
    const limit = exercise.slug === "suma-de-dos-numeros" ? 1000000 : 100;
    const values = [-limit, -1, 0, 1, limit];
    inputs = values.flatMap(a => values.map(b => ({ a, b })));
  } else inputs = Array.from({ length: 201 }, (_, index) => index - 100);
  return { slug: exercise.slug, python: exercise.python, javascript: exercise.javascript, starters: exercise.starters!, tests: inputs.map(input => ({ input, expected: oracle(exercise.slug, input) })) };
});

test("las referencias y plantillas R1 cubren el dominio pequeño y sus límites en ambos lenguajes", () => {
  for (const exercise of enumerations) {
    let solved = true;
    for (const fixture of exercise.tests) {
      const run = (code: string) => new vm.Script(`${code}\nsolve(data)`).runInNewContext({ data: structuredClone(fixture.input) }, { timeout: 1000 });
      assert.deepEqual(run(exercise.javascript), fixture.expected, `${exercise.slug}: ${JSON.stringify(fixture.input)}`);
      const initial = run(exercise.starters.javascript);
      assert.notEqual(JSON.stringify(initial), undefined, exercise.slug);
      solved &&= initial === fixture.expected;
    }
    assert.equal(solved, exercise.slug === "tu-primer-resultado", exercise.slug);
  }
  const driver = `import json,sys
items=json.load(sys.stdin)
for item in items:
 scope={}
 initial={}
 exec(item['python'],scope)
 exec(item['starters']['python'],initial)
 solved=True
 for case in item['tests']:
  actual=scope['solve'](case['input'])
  assert type(actual) is type(case['expected']) and actual == case['expected'], item['slug']
  first=initial['solve'](case['input'])
  json.dumps(first,allow_nan=False)
  solved = solved and type(first) is type(case['expected']) and first == case['expected']
 assert solved == (item['slug'] == 'tu-primer-resultado'), item['slug']
print('R1 correcto')`;
  const result = spawnSync(process.env.PYTHON_BIN || "python", ["-c", driver], { input: JSON.stringify(enumerations), encoding: "utf8", timeout: 15000 });
  assert.equal(result.status, 0, result.error?.message || result.stderr);
  assert.match(result.stdout, /R1 correcto/);
});
