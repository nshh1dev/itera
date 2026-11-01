import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { pythonCatalog } from "../prisma/python-content";
import { pythonLessons } from "../prisma/python-lessons";
import { pythonReleaseFingerprint } from "../prisma/python-releases";
import { localTheoryContract } from "./python-local-theory-baseline";
import { beforePythonIterationTheory, previousIterationTheoryTasks } from "./python-iteration-theory-baseline";
import { beforePythonRecordTheory } from "./python-record-theory-baseline";

const reviewed = ["python-recorre-pares", "python-lista-registros", "python-conjunto-seguro", "python-union", "python-interseccion", "python-diferencia", "python-simetrica", "python-subconjunto", "python-crea-grupo", "python-comprension", "python-comprension-filtro", "python-comprension-condicional", "python-comprension-dict", "python-iterador", "python-generador", "python-map"];
const content = (slug: string) => pythonCatalog.find(entry => entry.slug === slug)!.content;

test("la teoría local llega a 32 actividades propias con tres ajustes y trece conservadas en el segundo bloque", () => {
  const own = pythonCatalog.filter(entry => pythonLessons.has(entry.slug));
  assert.deepEqual(own.slice(16, 32).map(entry => entry.slug), reviewed);
  assert.deepEqual(new Set(Object.keys(previousIterationTheoryTasks)), new Set(["python-recorre-pares", "python-subconjunto", "python-map"]));
  assert.equal(own.slice(0, 32).length, 32);
  assert.equal(own.length - 32, 16);
  for (const slug of reviewed) {
    const entry = content(slug);
    assert.equal(entry.variants[0].statement, entry.statement, slug);
    assert.deepEqual([...entry.statement.matchAll(/^(Tu tarea|Entrada|Resultado esperado)\n/gm)].map(match => match[1]), ["Tu tarea", "Entrada", "Resultado esperado"], slug);
    assert.equal(entry.hints.length, 3, slug);
  }
  assert.equal(reviewed.length - Object.keys(previousIterationTheoryTasks).length, 13);
});

test("la teoría distingue llamada de método, pertenencia de tamaño y transformación bajo demanda", () => {
  assert.match(content("python-recorre-pares").statement, /d.items\(\).*vista de parejas.*d.items sin ellos es el método.*no se modifica d/);
  assert.match(content("python-subconjunto").statement, /cada elemento de A pertenece a B.*No compara tamaños/);
  assert.match(content("python-map").statement, /al pedir cada resultado.*no transforma todos.*list consume.*agotado no repite/);
  assert.match(content("python-crea-grupo").statement, /diccionario exterior comparte sus listas.*lista nueva por categoría/);
  assert.match(content("python-comprension-condicional").statement, /obtiene un valor en cada posición.*elimina posiciones/);
  assert.match(content("python-iterador").statement, /no reinicia el recorrido/);
  assert.match(content("python-generador").statement, /bajo demanda.*sin necesitar la lista completa/);
});

test("el segundo lote de teoría conserva todo salvo tres párrafos y reconstruye íntegra la entrega anterior", () => {
  const payload = pythonCatalog.map(entry => ({ ...entry, content: beforePythonRecordTheory(entry.slug, entry.content) })).map(entry => !(entry.slug in previousIterationTheoryTasks) ? entry : ({ ...entry, content: {
    ...entry.content, statement: localTheoryContract(entry.content.statement),
    variants: entry.content.variants.map(variant => ({ ...variant, statement: localTheoryContract(variant.statement!) })),
  } }));
  // Previa a la edición: protege los contratos completos, trece textos conservados,
  // el bloque anterior y toda otra superficie, sin regenerar expectativas.
  assert.equal(createHash("sha256").update(JSON.stringify(payload)).digest("hex"), "7c33437e3895fb346541d00e9cd64ecc944265f73b41152c4123f8f8b424c31f");
  const previous = pythonCatalog.map(entry => ({ ...entry, content: beforePythonIterationTheory(entry.slug, entry.content) }));
  assert.equal(pythonReleaseFingerprint(previous), "77c893973bab42abb3369ad5a8525f59eb2200ee6afd581ff28071135e550c6d");
});

test("modelos fijos confirman vistas, inclusión, operaciones y agotamiento sin ejecutar código de alumnos", () => {
  const code = `d={'b':2,'a':0}
vista=d.items()
assert callable(d.items)
assert sorted(vista)==[('a',0),('b',2)]
assert list(d.keys())==['b','a'] and list(d.values())==[2,0]
assert d=={'b':2,'a':0}
assert not ({1,2}<={3,4})
assert {1,2}<={1,2} and not ({1,2}<{1,2})
assert set()<={1}
a,b={1,2},{2,3}
assert a|b=={1,2,3} and a&b=={2}
assert a-b=={1} and b-a=={3} and a^b=={1,3}
s={2}
s.add(1)
s.discard(1)
s.discard(9)
assert s=={2}
datos=[-2,0,3]
assert [n*n for n in datos]==[4,0,9]
assert [n for n in datos if n>=0]==[0,3]
assert [n if n>=0 else 0 for n in datos]==[0,0,3]
assert {p:len(p) for p in ['sol','sol','']}=={'sol':3,'':0}
r=iter(datos)
assert list(r)==datos and list(r)==[] and datos==[-2,0,3]
llamadas=[]
def doble(texto):
    llamadas.append(texto)
    return int(texto)*2
m=map(doble,['2','-1'])
assert llamadas==[]
assert next(m)==4 and llamadas==['2']
assert list(m)==[-2] and llamadas==['2','-1']
assert list(m)==[] and llamadas==['2','-1']
g=(n*n for n in datos)
assert sum(g)==13 and list(g)==[]
print('ok')`;
  const result = spawnSync(process.env.PYTHON_BIN ?? "python", ["-c", code], { encoding: "utf8", timeout: 30000 });
  assert.equal(result.error, undefined);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), "ok");
});
