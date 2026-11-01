import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { pythonCurriculumUnits } from "../src/lib/python-curriculum";
import { pythonModuleTheory } from "../src/lib/python-module-theory";
import { modulesForPath } from "../src/lib/learning-modules";

test("la teoría de 57 módulos usa Python: 31 revisiones explícitas y 26 textos conservados", () => {
  assert.equal(pythonCurriculumUnits.length, 57);
  assert.equal(Object.keys(pythonModuleTheory).length, 31);
  assert.equal(Object.values(pythonModuleTheory).filter(revision => revision.example !== undefined).length, 8);
  for (const [slug, revision] of Object.entries(pythonModuleTheory)) {
    const unit = pythonCurriculumUnits.find(unit => unit.slug === slug);
    assert.ok(unit, slug);
    assert.equal(unit.theory, revision.theory, slug);
    if (revision.example !== undefined) assert.equal(unit.examples.python, revision.example, slug);
  }
  for (const unit of pythonCurriculumUnits) {
    assert.doesNotMatch(unit.theory, /JavaScript|TypeScript|\bNode\b|\bpush\b|\bundefined\b|JSON\.parse|\bpropiedades\b|\bmapa\b/i, unit.slug);
    if (/\bnull\b/.test(unit.theory)) {
      assert.match(unit.theory, /\bNone\b/, unit.slug);
      assert.match(unit.theory, /\bJSON\b/, unit.slug);
    }
    const learningModule = modulesForPath(unit.path, "python").find(module => module.slug === unit.slug)!;
    assert.equal(learningModule.theory, unit.theory);
    assert.equal(learningModule.examples.python, unit.examples.python);
  }
  assert.match(pythonModuleTheory.arboles.theory, /value, left y right.*None.*JSON/);
  assert.match(pythonModuleTheory["funciones-datos"].theory, /ficha o registro.*diccionario/);
  assert.match(pythonModuleTheory["integracion-inventario"].theory, /solve\(\[\]\).*proceso nuevo/);
  assert.match(pythonModuleTheory["integracion-agenda"].theory, /mismo proceso.*proceso nuevo/);
  assert.match(pythonModuleTheory["python-contactos"].theory, /tareas que practicarás después/);
  assert.match(pythonModuleTheory.prioridades.theory, /i > 0.*raíz no tiene padre.*no está totalmente ordenada/);
  assert.doesNotMatch(pythonModuleTheory["python-formato"].theory, /floor/);
  assert.doesNotMatch(pythonModuleTheory["python-iteradores"].example!, /lambda/);
});

test("la revisión conserva todo salvo 31 teorías y ocho ejemplos Python de módulo", () => {
  const payload = pythonCurriculumUnits.map(unit => {
    const revision = pythonModuleTheory[unit.slug];
    return Object.fromEntries(Object.entries(unit)
      .filter(([key]) => key !== "theory" || !revision)
      .map(([key, value]) => [key, key === "examples" && revision?.example !== undefined
        ? Object.fromEntries(Object.entries(unit.examples).filter(([language]) => language !== "python")) : value]));
  });
  assert.equal(createHash("sha256").update(JSON.stringify(payload)).digest("hex"), "c51c971bf6a28cea951cec72ada50e937673b4fef7ddb49bb7b0c393d3e7c3a7");
});

// Solo ejemplos fijos del repositorio; nunca código enviado por estudiantes.
const stdout: Record<string, string> = {
  instrucciones: "Inicio\n9\n", variables: "6\n", operaciones: "12\n", "python-constantes": "180\n",
  entrada: "12\n", "python-decimales": "3.5\n", "tipos-comparaciones": "true\n", seguimiento: "6\n",
  listas: "2\n4\n", "python-busqueda-lineal": "2\n", "python-tuplas": "4 7\n", alcance: "6\n",
  "python-diccionarios": "pan 2\nagua 1\n", errores: "0\n", "python-conjuntos": "[3]\n",
  "python-iteradores": "[2, 3]\n[]\n", "python-formato": "3.50\n", "python-registros-anidados": "0\n",
  modulos: "5.0\n", archivos: "Listo\n",
  "python-contactos": "{'telefono': '123', 'correo': 'a@ejemplo.es'}\n", matrices: "7\n4\n",
  "copias-anidadas": "[[7, 9], [2, 4]] [[7, 11], [2, 4]]\n", "estado-recursion": "8\n", prioridades: "3\n",
};
const checks: Record<string, string> = {
  funciones: "assert triple(4) == 12",
  "integracion-inicial": "assert coste(0) == 0 and coste(3) == 9",
  decisiones: "assert permitido(18, True) and not permitido(18, False)",
  "python-expresion-condicional": "assert etiqueta == 'adulto'",
  repeticion: "assert total == 6", "python-control-bucle": "assert salida == [2, 4]",
  textos: "assert resultado == 'cs'",
  "python-secuencias": "assert valores == [8, 3, 5] and ordenados == [3, 5, 8] and tramo == [8, 3]",
  "funciones-datos": "assert cantidad({}) == 1 and cantidad({'cantidad': 0}) == 0",
  referencias: "assert alias is original and copia is not original and copia == [1, 2]",
  "python-identidad": "assert nueva_lista(1) == [1] and nueva_lista(2) == [2]",
  "integracion-bases": "assert positivos([-1, 0, 3]) == 1",
  pruebas: "assert resta(5, 8) == -3",
  "integracion-gastos": "assert por_categoria == {'casa': 250}",
  mapas: "assert conteos == {4: 2, 7: 1}", "python-agrupacion": "assert grupos == {'azul': ['Ana']}",
  "python-comprensiones": "assert dobles == [2, 8] and positivos == [3]",
  "python-agregacion": "assert ordenadas == ['a', 'luz', 'sol']",
  "python-acumulacion-inventario": "assert saldos == {'pan': 2}",
  "integracion-inventario": "assert recuperado == {'pan': 2}", "python-reporte-inventario": "assert valor == 375",
  "python-academia": "assert notas == []",
  "integracion-agenda": "assert tarea == {'titulo': 'repasar', 'hecha': True}",
  "python-transformacion": "assert original['nombre'] == ' ANA ' and copia['nombre'] == 'ana'",
  busqueda: "assert (izquierda, derecha, medio) == (0, 2, 1)", recorridos: "assert prefijos == [0, 3, 8, 10]",
  "integracion-intermedia": "assert vistos == {1, 2}",
  arboles: "assert sumar_valores(None) == 0 and sumar_valores({'value': 7, 'left': None, 'right': None}) == 7",
  exploracion: "assert potencia_dos(0) == 1 and potencia_dos(5) == 32",
  dinamica: "assert formas == [1, 1, 2, 3, 5, 8]", grafos: "assert adyacencia == [[1], [0, 2], [1]] and visitados == {0}",
  "integracion-avanzada": "assert not cabe_en_un_viaje(0) and cabe_en_un_viaje(100)",
};

test("los 57 ejemplos fijos de módulo se ejecutan con salidas e invariantes independientes", () => {
  assert.deepEqual(new Set([...Object.keys(stdout), ...Object.keys(checks)]), new Set(pythonCurriculumUnits.map(unit => unit.slug)));
  const root = mkdtempSync(path.join(tmpdir(), "itera-python-module-theory-"));
  try {
    const runner = `import sys,json,os,tempfile,io,contextlib
root=os.getcwd()
entries=json.load(sys.stdin)
for entry in entries:
    with tempfile.TemporaryDirectory(dir=root) as folder:
        os.chdir(folder)
        try:
            code=entry['code']
            if entry['slug']=='modulos':
                module,code=code.split('# main.py\\n',1)
                with open('medidas.py','w',encoding='utf-8') as file: file.write(module)
            namespace={'input': lambda: '4'}
            output=io.StringIO()
            with contextlib.redirect_stdout(output):
                exec(code,namespace)
                exec(entry['check'],namespace)
            assert output.getvalue()==entry['stdout'], (entry['slug'],output.getvalue(),entry['stdout'])
        except Exception as error:
            raise AssertionError(entry['slug']) from error
        finally:
            os.chdir(root)
print(len(entries))`;
    const result = spawnSync(process.env.PYTHON_BIN ?? "python", ["-c", runner], {
      cwd: root, encoding: "utf8", timeout: 30000,
      input: JSON.stringify(pythonCurriculumUnits.map(unit => ({ slug: unit.slug, code: unit.examples.python, stdout: stdout[unit.slug] ?? "", check: checks[unit.slug] ?? "" }))),
    });
    assert.equal(result.error, undefined);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout.trim(), "57");
  } finally { rmSync(root, { recursive: true, force: true }); }
});
