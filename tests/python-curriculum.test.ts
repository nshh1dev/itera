import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { logicExercises } from "../prisma/logic-content";
import { seedVersionContent } from "../prisma/editorial-revision";
import { pythonCurriculumUnits, pythonCurriculumSlugs, pythonStepSlug, hasPythonCurriculum } from "../src/lib/python-curriculum";
import { languagePaths, orderLanguageCatalog } from "../src/lib/language-curriculum";
import { learningPaths } from "../src/lib/learning-paths";
import { modulesForPath, moduleForExercise, learningModules } from "../src/lib/learning-modules";

test("Python conserva las 176 identidades y añade 48 pasos exclusivos sin cambiar las otras fuentes", async () => {
  const before = JSON.stringify(logicExercises.map(seedVersionContent));
  const { pythonCatalog, validatePythonCatalog } = await import("../prisma/python-content");
  validatePythonCatalog();
  assert.equal(JSON.stringify(logicExercises.map(seedVersionContent)), before);
  assert.equal(pythonCatalog.length, 224);
  assert.equal(new Set(pythonCurriculumSlugs).size, 224);
  for (const exercise of logicExercises) assert.ok(pythonCurriculumSlugs.includes(exercise.slug), exercise.slug);
  assert.deepEqual(pythonCatalog.map(entry => entry.slug), pythonCurriculumSlugs);
  for (const [index, entry] of pythonCatalog.entries()) {
    assert.deepEqual(entry.content.variants.map(variant => variant.language), ["python"]);
    assert.deepEqual(entry.content.prerequisiteSlugs, index ? [pythonCatalog[index - 1].slug] : []);
    if (entry.baseline) {
      assert.deepEqual(entry.content.variants[0].tests, entry.baseline.variants[0].tests);
      assert.equal(entry.content.runtimeMode, entry.baseline.runtimeMode);
      assert.equal(entry.content.conceptRule, entry.baseline.conceptRule);
    }
  }
  for (const language of ["javascript", "typescript"] as const) {
    for (const path of learningPaths) assert.deepEqual(modulesForPath(path.slug, language), learningModules.filter(module => module.path === path.slug));
    assert.equal(moduleForExercise("python-union", language), undefined);
  }
});

test("los puentes Python preceden a su primer uso y no adelantan persistencia ni recursión", () => {
  const before = (first: string, second: string) => {
    assert.ok(pythonCurriculumSlugs.indexOf(first) >= 0, first);
    assert.ok(pythonCurriculumSlugs.indexOf(first) < pythonCurriculumSlugs.indexOf(second), `${first} antes de ${second}`);
  };
  for (const pair of [
    ["logica-precio-unidades", "python-constante"], ["logica-lee-doble", "python-decimal"],
    ["logica-filtra-lista", "python-comprension"], ["python-desempaqueta", "python-enumera"],
    ["python-ordena-numeros", "python-union"], ["python-lista-registros", "logica-gastos-registro"],
    ["python-crea-grupo", "logica-agrupa-registros"], ["python-comprension", "logica-diagonales"],
    ["python-lambda-desempate", "logica-ordena-registros"], ["python-comprension", "logica-intervalos-suma"],
    ["logica-actualiza-persistidos", "logica-inventario-persistente"], ["logica-vecinos", "logica-copia-anidada"],
    ["python-consulta-anidada", "python-academia-inscribe"], ["python-academia-califica", "python-academia-resume"],
    ["python-iterador", "python-map"], ["python-contactos-crea", "python-contactos-edita"],
    ["python-transforma-campo", "python-transforma-registros"],
  ]) before(pair[0], pair[1]);
  assert.equal(pythonCurriculumUnits.filter(unit => unit.level === "ADVANCED").flatMap(unit => unit.steps.map(step => pythonStepSlug(step.key))).length, 36);
});

test("la proyección requiere catálogo publicado, conserva rutas ajenas y no pierde contenido personalizado", () => {
  const commonCatalog = logicExercises.map((entry, index) => ({ id: String(index), slug: entry.slug }));
  const paths = learningPaths.map(path => ({ slug: path.slug, items: path.slugs!.map(slug => ({ exerciseId: commonCatalog.find(entry => entry.slug === slug)!.id })) }));
  assert.equal(hasPythonCurriculum(commonCatalog), false);
  assert.equal(orderLanguageCatalog(commonCatalog, "python"), commonCatalog);
  assert.equal(languagePaths(paths, commonCatalog, "python"), paths);
  const catalog = [...commonCatalog, ...pythonCurriculumSlugs.filter(slug => slug.startsWith("python-")).map(slug => ({ id: slug, slug })), { id: "custom", slug: "personalizado" }];
  paths[0].items.push({ exerciseId: "custom" });
  for (const language of ["javascript", "typescript"] as const) {
    assert.equal(languagePaths(paths, catalog, language), paths);
    assert.equal(orderLanguageCatalog(commonCatalog, language), commonCatalog);
  }
  const projected = languagePaths(paths, catalog, "python");
  assert.deepEqual(projected.flatMap(path => path.items).filter(item => item.exerciseId !== "custom").map(item => catalog.find(entry => entry.id === item.exerciseId)!.slug), pythonCurriculumSlugs);
  assert.ok(projected[0].items.some(item => item.exerciseId === "custom"));
  assert.deepEqual(paths[0].items.at(-1), { exerciseId: "custom" });
});

test("las referencias Python nuevas y los cuatro puentes superan casos; las plantillas terminan sin resolverlos todos", async () => {
  const { pythonCatalog } = await import("../prisma/python-content");
  const entries = pythonCatalog.filter(entry => !entry.baseline || ["logica-ordena-registros", "logica-intervalos-suma", "logica-diagonales", "logica-agrupa-registros"].includes(entry.slug));
  const runner = `import sys,json,copy,contextlib,io
entries=json.load(sys.stdin)
results=[]
for entry in entries:
    variants=[]
    for kind in ('solution','starter'):
        values=[]
        for case in entry['tests']:
            scope={}
            data=copy.deepcopy(case['input'])
            captured=io.StringIO()
            with contextlib.redirect_stdout(captured):
                if entry['mode'] == 'PROGRAM':
                    lines=iter(data.splitlines())
                    scope['input']=lambda: next(lines)
                    exec(entry[kind],scope)
                    value=captured.getvalue()
                else:
                    exec(entry[kind],scope)
                    value=scope['solve'](data)
            assert data == case['input'], entry['slug'] + ': mutación de entrada'
            values.append(value)
        variants.append(values)
    results.append(variants)
print(json.dumps(results,allow_nan=False))`;
  const fixtures = entries.map(entry => ({ slug: entry.slug, mode: entry.content.runtimeMode, ...entry.content.variants[0] }));
  const result = spawnSync(process.env.PYTHON_BIN ?? "python", ["-c", runner], { input: JSON.stringify(fixtures), encoding: "utf8", timeout: 30000, maxBuffer: 4 * 1024 * 1024 });
  assert.equal(result.status, 0, result.stderr || String(result.error));
  const values = JSON.parse(result.stdout);
  for (const [index, entry] of entries.entries()) {
    const expected = entry.content.variants[0].tests.map(test => test.expected);
    assert.deepEqual(values[index][0], expected, `${entry.slug}: referencia`);
    assert.notDeepEqual(values[index][1], expected, `${entry.slug}: plantilla resuelta`);
  }
});
