import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { logicExercises } from "../prisma/logic-content";
import { seedVersionContent } from "../prisma/editorial-revision";
import { pythonCurriculumUnits, pythonCurriculumSlugs, pythonStepSlug, hasPythonCurriculum, pythonPrerequisiteSlugs, pythonStepMetadata } from "../src/lib/python-curriculum";
import { languagePaths, orderLanguageCatalog } from "../src/lib/language-curriculum";
import { learningPaths } from "../src/lib/learning-paths";
import { modulesForPath, moduleForExercise, learningModules } from "../src/lib/learning-modules";
import { categories } from "../src/lib/types";

test("Python conserva las 176 identidades y añade 48 pasos exclusivos sin cambiar las otras fuentes", async () => {
  const before = JSON.stringify(logicExercises.map(seedVersionContent));
  const { pythonCatalog, validatePythonCatalog } = await import("../prisma/python-content");
  validatePythonCatalog();
  assert.equal(JSON.stringify(logicExercises.map(seedVersionContent)), before);
  assert.equal(pythonCatalog.length, 224);
  assert.equal(new Set(pythonCurriculumSlugs).size, 224);
  for (const exercise of logicExercises) assert.ok(pythonCurriculumSlugs.includes(exercise.slug), exercise.slug);
  assert.deepEqual(pythonCatalog.map(entry => entry.slug), pythonCurriculumSlugs);
  const contractRevisions = new Set(["logica-altura", "logica-preorden", "logica-niveles", "logica-arbol-busqueda"]);
  for (const entry of pythonCatalog) {
    assert.deepEqual(entry.content.variants.map(variant => variant.language), ["python"]);
    assert.deepEqual(entry.content.prerequisiteSlugs, pythonPrerequisiteSlugs(entry.slug));
    if (entry.baseline) {
      if (!contractRevisions.has(entry.slug)) assert.deepEqual(entry.content.variants[0].tests, entry.baseline.variants[0].tests);
      assert.equal(entry.content.runtimeMode, entry.baseline.runtimeMode);
      assert.equal(entry.content.conceptRule, entry.baseline.conceptRule);
    }
  }
  for (const language of ["javascript", "typescript"] as const) {
    for (const path of learningPaths) assert.deepEqual(modulesForPath(path.slug, language), learningModules.filter(module => module.path === path.slug));
    assert.equal(moduleForExercise("python-union", language), undefined);
  }
});

test("el recorrido intermedio agrupa colecciones, proyectos y algoritmos con dependencias relevantes", async () => {
  const { pythonCatalog } = await import("../prisma/python-content");
  const position = new Map(pythonCurriculumSlugs.map((slug, index) => [slug, index]));
  for (const entry of pythonCatalog) {
    for (const prerequisite of entry.content.prerequisiteSlugs) {
      assert.ok(position.has(prerequisite), `${entry.slug}: ${prerequisite} no existe`);
      assert.ok(position.get(prerequisite)! < position.get(entry.slug)!, `${entry.slug}: ${prerequisite} debe ir antes`);
    }
  }
  assert.ok(pythonPrerequisiteSlugs("python-comprension").length >= 2);
  assert.ok(pythonPrerequisiteSlugs("python-academia-inscribe").length >= 3);
  assert.ok(position.get("logica-filtra-lista")! < position.get("logica-busqueda-lineal")!);
  assert.ok(position.get("logica-busqueda-lineal")! < position.get("logica-busqueda-binaria")!);
  assert.ok(position.get("logica-copia-anidada")! > position.get("logica-transpuesta")!);
  assert.ok(position.get("logica-inventario")! < position.get("logica-inventario-modular")!);
  assert.ok(position.get("logica-inventario-persistente")! < position.get("python-inventario-valora")!);

  const modules = modulesForPath("pensar-en-soluciones", "python");
  assert.deepEqual([...new Set(modules.map(module => module.group))], ["Colecciones y transformación", "Proyectos y persistencia", "Algoritmos y estructuras"]);
  const referencias = pythonCurriculumUnits.find(unit => unit.slug === "referencias")!;
  assert.match(referencias.theory, /copia exterior/);
  assert.ok(pythonCurriculumUnits.findIndex(unit => unit.slug === "referencias") < pythonCurriculumUnits.findIndex(unit => unit.slug === "python-agrupacion"));

  assert.equal(pythonStepMetadata("python-union")?.category, "Colecciones");
  assert.equal(pythonStepMetadata("python-academia-inscribe")?.category, "Proyectos");
  assert.equal(pythonStepMetadata("logica-celda")?.category, "Algoritmos");
  assert.equal(pythonStepMetadata("logica-pila")?.category, "Estructuras");
  assert.equal(pythonStepMetadata("logica-dijkstra")?.category, "Grafos");
  assert.equal(pythonStepMetadata("python-constante")?.activityType, "GUIDED");
  assert.equal(pythonStepMetadata("python-constante")?.minutes, 5);
  assert.equal(pythonStepMetadata("python-academia-resume")?.activityType, "INTEGRATION");

  // La categoría persistida sigue siendo una del catálogo compartido para no
  // romper el editor; la proyección Python es la que ve el estudiante.
  for (const entry of pythonCatalog) assert.ok((categories as readonly string[]).includes(entry.category), `${entry.slug}: ${entry.category}`);
  assert.notEqual(pythonCatalog.find(entry => entry.slug === "python-academia-inscribe")?.category, "Proyectos");
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

test("las referencias Python nuevas y revisadas superan casos; las plantillas terminan sin resolverlos todos", async () => {
  const { pythonCatalog } = await import("../prisma/python-content");
  const entries = pythonCatalog.filter(entry => !entry.baseline || ["logica-ordena-registros", "logica-intervalos-suma", "logica-diagonales", "logica-agrupa-registros", "logica-pruebas-limites", "logica-reproduce-fallo", "logica-altura", "logica-preorden", "logica-niveles", "logica-arbol-busqueda"].includes(entry.slug));
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

test("las actividades prioritarias hacen observable el contrato y no anticipan el diagnóstico", async () => {
  const { pythonLessons } = await import("../prisma/python-lessons");
  const identidad = pythonLessons.get("python-identidad")!;
  assert.ok(identidad.cases.length >= 3);
  for (const [, expected] of identidad.cases) {
    const value = expected as { antes: number[]; original: number[]; copia: number[]; igual: boolean; misma: boolean; copiaMisma: boolean };
    assert.equal(value.igual, false);
    assert.equal(value.misma, true);
    assert.equal(value.copiaMisma, false);
    assert.deepEqual(value.antes, value.copia);
    assert.notDeepEqual(value.original, value.copia);
  }
  const decimal = pythonLessons.get("python-decimal")!;
  assert.ok(!decimal.starter.includes("float("));
  assert.ok(decimal.cases.some(([, expected]) => expected === "1.0\n" || expected === "0.0\n"));
  assert.ok(decimal.cases.some(([input]) => input === "-0.5\n"));
  const resume = pythonLessons.get("python-academia-resume")!;
  assert.ok(resume.cases.some(([, expected]) => (expected as { medias: Record<string, number | null> }).medias.ana === 85.5));
  const califica = pythonLessons.get("python-academia-califica")!;
  assert.ok(califica.cases.some(([input]) => (input as { nota: number }).nota === 75));
  assert.ok(califica.cases.some(([input]) => (input as { nota: number }).nota === 100));
  assert.ok(califica.cases.some(([input]) => (input as { nota: number }).nota === -1));
  const contactos = pythonLessons.get("python-contactos-edita")!;
  const cambios = contactos.cases.map(([input]) => (input as { cambios: Record<string, unknown> }).cambios);
  assert.ok(cambios.some(cambio => cambio.correo === "nuevo@x"));
  assert.ok(cambios.some(cambio => cambio.telefono === "2" && cambio.correo === "y"));
  assert.ok(cambios.some(cambio => typeof cambio.correo === "number"));

  const { pythonCatalog } = await import("../prisma/python-content");
  const fallo = pythonCatalog.find(entry => entry.slug === "logica-reproduce-fallo")!;
  assert.doesNotMatch(fallo.content.statement, /n >= 0|incluye cero|Cambia la condici[oó]n/i);
  assert.match(fallo.content.hints[0], /cero/i);
  const pruebas = pythonCatalog.find(entry => entry.slug === "logica-pruebas-limites")!;
  assert.doesNotMatch(pruebas.content.variants[0].starter, /len\(valores\)/);
  assert.match(pruebas.content.variants[0].starter, /actual = 0/);
  assert.match(pruebas.content.variants[0].statement ?? "", /defecto/i);
  const constante = pythonLessons.get("python-constante")!;
  assert.ok(!constante.starter.includes("LAPICES_POR_CAJA"));

  const altura = pythonCatalog.find(entry => entry.slug === "logica-altura")!;
  assert.ok(altura.content.variants[0].tests.length >= 7);
  assert.match(altura.content.statement, /500 nodos/);
  assert.match(altura.content.constraints.join(" "), /cadena sesgada/);
  const preorden = pythonCatalog.find(entry => entry.slug === "logica-preorden")!;
  assert.ok(preorden.content.variants[0].tests.some(test => Array.isArray(test.expected) && test.expected.length === 50));
  for (const slug of ["logica-asercion-normal", "logica-conserva-regresion", "logica-captura-conversion", "logica-error-dominio", "logica-recupera-elementos"]) {
    assert.match(pythonCatalog.find(entry => entry.slug === slug)!.content.statement, /no certifica/, slug);
  }

  for (const slug of ["logica-altura", "logica-preorden", "logica-niveles", "logica-arbol-busqueda"]) {
    const entry = pythonCatalog.find(item => item.slug === slug)!;
    const variant = entry.content.variants[0];
    assert.match(variant.solution, /\[['"]left['"]\]/, `${slug}: solución`);
    assert.doesNotMatch(variant.solution, /\[['"](?:v|izq|der)['"]\]/, `${slug}: claves antiguas`);
    assert.match(variant.statement ?? "", /value/, `${slug}: enunciado`);
    assert.doesNotMatch(variant.statement ?? "", /10000 nodos/, `${slug}: límite anterior`);
    assert.ok(JSON.stringify(variant.tests.map(test => test.input)).includes('"value"'), `${slug}: entradas`);
    assert.ok(!JSON.stringify(variant.tests.map(test => test.input)).includes('"v"'), `${slug}: entrada antigua`);
  }
  assert.match(pythonCatalog.find(entry => entry.slug === "logica-ancestro")!.content.statement, /value, left y right/);
});
