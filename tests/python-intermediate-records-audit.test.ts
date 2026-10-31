import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { pythonCatalog } from "../prisma/python-content";
import { projectExecutionFiles } from "../src/server/execution/harness";
import { judgeProject, judgeOwnTests, type JudgeTest } from "../src/server/execution/judge";
import { validateProjectDefinition, validateProjectSolution, validateExpectedProjectFiles } from "../src/lib/project";
import type { Json } from "../src/lib/types";

// Solo referencias y errores fijos del repositorio, nunca código de alumnos.
const mistakes: Record<string, string> = {
  "logica-importa-preparado": "return data * 2",
  "logica-extrae-modulo": "return abs(data)",
  "logica-separa-reglas-io": "return 'Total: ' + str(data['precio'] * data['unidades'])",
  "logica-repara-importacion": "return data * data",
  "logica-organiza-modulos": "return str(data * data)",
  "logica-lee-archivo": "return 'Sol'",
  "logica-escribe-archivo": "return 'Hola' + data",
  "logica-valida-json": "import json\nwith open(data['documento'] + '.json', encoding='utf-8') as archivo:\n    config = json.load(archivo)\nif not isinstance(config, dict): return 'configuracion invalida'\nlimite = config.get('limite')\nif not isinstance(limite, int) or limite < 0: return 'configuracion invalida'\nreturn 'aceptada' if 0 <= data['cantidad'] <= limite else 'rechazada'",
  "logica-guarda-recupera": "return data",
  "logica-recupera-archivo-invalido": "return 0",
  "logica-actualiza-persistidos": "return data",
  "logica-inventario-modular": "return {'stock': {}, 'rechazados': 0}",
  "logica-inventario-persistente": "from reglas import aplicar\nfrom almacenamiento import cargar, guardar\nstock = {}\nrechazados = aplicar(stock, data)\nguardar(stock)\nreturn {'stock': cargar(), 'rechazados': rechazados}",
  "python-inventario-valora": "productos = [{'nombre': p['nombre'], 'valor_centimos': p['cantidad'] * p['precio_centimos']} for p in data]\nproductos = sorted(productos, key=lambda p: (p['valor_centimos'], p['nombre']), reverse=True)\nreturn {'total_centimos': sum(p['valor_centimos'] for p in productos), 'productos': productos}",
  "python-academia-inscribe": "cursos = dict(data['registro'].get(data['alumno'], {}))\ncursos.setdefault(data['curso'], None)\nreturn {data['alumno']: cursos}",
  "python-academia-califica": "registro = {a: dict(c) for a, c in data['registro'].items() if a == data['alumno']}\nalumno, curso, nota = data['alumno'], data['curso'], data['nota']\nif alumno in registro and curso in registro[alumno] and 0 <= nota <= 100:\n    registro[alumno][curso] = nota\nreturn registro",
  "python-academia-resume": "medias = {}\nfor alumno, cursos in data.items():\n    if not cursos: continue\n    notas = [n for n in cursos.values() if n is not None]\n    medias[alumno] = sum(notas) / len(notas) if notas else None\nclasificacion = sorted((a for a in medias if medias[a] is not None), key=lambda a: (-medias[a], a))\nreturn {'medias': medias, 'clasificacion': clasificacion}",
  "python-contactos-crea": "agenda = {n: dict(f) for n, f in data['agenda'].items()}\nnombre = data['nombre'].strip().lower()\nif nombre and nombre not in agenda:\n    return {nombre: {'telefono': data['telefono'], 'correo': data['correo']}}\nreturn agenda",
  "python-contactos-edita": "agenda = {n: dict(f) for n, f in data['agenda'].items()}\nnombre = data['nombre'].strip().lower()\nif nombre in agenda:\n    for campo, valor in data['cambios'].items():\n        if campo in ('telefono', 'correo') and isinstance(valor, str):\n            agenda[nombre][campo] = valor\n    return {nombre: agenda[nombre]}\nreturn agenda",
  "python-contactos-borra": "nombre = data['nombre'].strip().lower()\nreturn {n: dict(f) for n, f in data['agenda'].items() if not n.startswith(nombre)}",
  "python-contactos-busca": "def cumple(ficha):\n    for campo, texto in data['filtros'].items():\n        if campo in ficha and texto.lower() not in ficha[campo].lower():\n            return False\n    return True\nreturn sorted(n for n, f in data['agenda'].items() if cumple(f))",
  "logica-agenda-operaciones": "return []",
  "logica-agenda-almacenamiento": "from reglas import aplicar\nfrom almacenamiento import cargar, guardar\nguardar(aplicar([], data))\nreturn cargar()",
  "logica-agenda-regresion": "from reglas import aplicar\nfrom almacenamiento import cargar, guardar\nguardar(aplicar([], data))\nreturn cargar()",
  "python-transforma-campo": "return {k: v.strip().lower() for k, v in data['registro'].items()}",
  "python-transforma-registros": "salida = []\nfor registro in data['registros']:\n    copia = dict(registro)\n    for campo, operacion in data['reglas'].items():\n        if campo not in copia: continue\n        if operacion == 'minusculas': copia[campo] = copia[campo].lower()\n        elif operacion == 'trim': copia[campo] = copia[campo].strip()\n        elif operacion == 'numerico':\n            try: copia[campo] = int(float(copia[campo]))\n            except ValueError: copia[campo] = None\n    salida.append(copia)\nreturn salida",
};
const revised = new Set(["logica-valida-json", "python-academia-inscribe", "python-academia-califica", "python-academia-resume", "python-contactos-crea", "python-contactos-edita", "python-contactos-busca", "python-transforma-registros"]);
const entries = pythonCatalog.filter(entry => Object.hasOwn(mistakes, entry.slug));
const code = (body: string) => `def solve(data):\n${body.split("\n").map(line => `    ${line}`).join("\n")}\n`;

test("intermedio: los 26 proyectos y registros tienen inventario explícito y conservan los casos históricos", () => {
  assert.equal(entries.length, 26);
  assert.deepEqual(entries.map(entry => entry.slug), pythonCatalog.filter(entry => entry.content.level === "INTERMEDIATE").slice(27, 53).map(entry => entry.slug));
  for (const entry of entries) {
    if (entry.baseline) for (const original of entry.baseline.variants[0].tests) {
      const current = entry.content.variants[0].tests.find(item => item.order === original.order)!;
      assert.deepEqual({ ...current, explanation: undefined }, { ...original, explanation: undefined }, entry.slug);
    }
    if (revised.has(entry.slug)) assert.equal(entry.content.variants[0].tests.at(-1)!.visible, false);
  }
  const variant = entries.find(entry => entry.slug === "logica-valida-json")!.content.variants[0];
  const resource = { path: "booleano.json", content: '{"limite":true}', readOnly: true };
  const project = validateProjectDefinition(variant.project);
  assert.deepEqual(project.files.find(file => file.path === resource.path), resource);
  assert.deepEqual(validateProjectSolution(project, variant.solutionFiles).find(file => file.path === resource.path), resource);
});

test("registros anidados: diez referencias y plantillas conservan entrada; siete errores antes aceptados fallan", () => {
  const records = entries.filter(entry => !entry.content.variants[0].project);
  assert.equal(records.length, 10);
  const fixtures = records.map(entry => ({ slug: entry.slug, ...entry.content.variants[0], mistake: code(mistakes[entry.slug]) }));
  const runner = `import sys,json,copy,contextlib,io
results=[]
for entry in json.load(sys.stdin):
    outcomes=[]
    for kind in ('solution','starter','mistake'):
        values=[]
        for case in entry['tests']:
            data=copy.deepcopy(case['input'])
            scope={}
            with contextlib.redirect_stdout(io.StringIO()):
                exec(entry[kind],scope)
                value=scope['solve'](data)
            if kind!='mistake':
                assert data==case['input'],entry['slug']+': mutación en '+kind
            values.append(value)
        outcomes.append(values)
    results.append(outcomes)
print(json.dumps(results,allow_nan=False))`;
  const result = spawnSync(process.env.PYTHON_BIN ?? "python", ["-c", runner], {
    input: JSON.stringify(fixtures), encoding: "utf8", timeout: 30000, maxBuffer: 1024 * 1024,
  });
  assert.equal(result.status, 0, result.stderr || String(result.error));
  const values = JSON.parse(result.stdout);
  for (const [index, entry] of records.entries()) {
    const expected = entry.content.variants[0].tests.map(item => item.expected);
    assert.deepEqual(values[index][0], expected, `${entry.slug}: referencia`);
    assert.notDeepEqual(values[index][1], expected, `${entry.slug}: plantilla resuelta`);
    assert.notDeepEqual(values[index][2], expected, `${entry.slug}: error no detectado`);
    if (revised.has(entry.slug)) {
      assert.deepEqual(values[index][2].slice(0, -1), expected.slice(0, -1), `${entry.slug}: el error pasaba todos los casos previos`);
    }
  }
});

test("proyectos Python revisados: conductor y juez comprueban referencias, plantillas, artefactos y persistencia local", () => {
  const projects = entries.filter(entry => entry.content.variants[0].project);
  assert.equal(projects.length, 16);
  const temporaryBase = process.platform === "win32" ? path.join(tmpdir(), "opencode") : tmpdir();
  mkdirSync(temporaryBase, { recursive: true });
  const root = mkdtempSync(path.join(temporaryBase, "itera-python-projects-"));
  try {
    for (const entry of projects) {
      const variant = entry.content.variants[0];
      const project = validateProjectDefinition(variant.project);
      const reference = validateProjectSolution(project, variant.solutionFiles);
      const mistakenFiles = reference.map(file => file.path === project.entrypoint ? { ...file, content: code(mistakes[entry.slug]) } : file);
      const run = (files: typeof reference, input: unknown, ownTests = false) => {
        const directory = mkdtempSync(path.join(root, "case-"));
        try {
          const generated = projectExecutionFiles("python", files, project, ownTests ? "tests" : entry.content.runtimeMode);
          for (const file of generated) writeFileSync(path.join(directory, file.name), file.content);
          const result = spawnSync(process.env.PYTHON_BIN ?? "python", ["-B", generated[0].name], {
            cwd: directory, input: JSON.stringify(input), encoding: "utf8", timeout: 20000, maxBuffer: 512 * 1024,
          });
          assert.ifError(result.error);
          return { stdout: result.stdout, stderr: result.stderr, code: result.status, signal: result.signal };
        } finally { rmSync(directory, { recursive: true, force: true }); }
      };
      // Compilar solo los archivos Python fijos comprueba también los módulos
      // que la plantilla todavía no importa desde su main incompleto.
      const compile = spawnSync(process.env.PYTHON_BIN ?? "python", ["-c", "import sys,json; [compile(f['content'],f['path'],'exec') for f in json.load(sys.stdin) if f['path'].endswith('.py')]"], {
        input: JSON.stringify([...project.files, ...reference]), encoding: "utf8", timeout: 20000,
      });
      assert.equal(compile.status, 0, `${entry.slug}: ${compile.stderr || compile.error}`);
      const passed = { starter: [] as boolean[], mistake: [] as boolean[] };
      for (const fixture of variant.tests) {
        const testCase: JudgeTest = { input: fixture.input as Json, expected: fixture.expected as Json,
          visible: true, order: fixture.order,
          expectedFiles: validateExpectedProjectFiles(project, fixture.expectedFiles ?? []),
          ...(Object.hasOwn(fixture, "expectedPersistence") ? { expectedPersistence: fixture.expectedPersistence as Json } : {}),
        };
        const correct = judgeProject(run(reference, fixture.input), testCase, entry.content.runtimeMode);
        assert.equal(correct.passed, true, `${entry.slug}, caso ${fixture.order}: ${JSON.stringify(correct)}`);
        const initial = judgeProject(run(project.files, fixture.input), testCase, entry.content.runtimeMode);
        assert.notEqual(initial.status, "runtime", `${entry.slug}: plantilla no ejecutable`);
        passed.starter.push(initial.passed);
        const mistake = judgeProject(run(mistakenFiles, fixture.input), testCase, entry.content.runtimeMode);
        assert.notEqual(mistake.status, "runtime", `${entry.slug}: el error fijo debe fallar por resultado o artefactos`);
        passed.mistake.push(mistake.passed);
      }
      assert.ok(passed.starter.includes(false), `${entry.slug}: plantilla resuelta`);
      assert.ok(passed.mistake.includes(false), `${entry.slug}: error no detectado`);
      if (entry.slug === "logica-valida-json") {
        assert.ok(passed.mistake.slice(0, -1).every(Boolean), "isinstance aceptaba el booleano sin fallar los ocho casos anteriores");
        assert.equal(passed.mistake.at(-1), false);
      }
      if (project.testEntrypoint) assert.equal(judgeOwnTests(run(reference, [], true)).passed, true, `${entry.slug}: pruebas propias de referencia`);
    }
  } finally { rmSync(root, { recursive: true, force: true }); }
});
