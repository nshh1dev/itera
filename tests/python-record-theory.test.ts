import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { pythonCatalog } from "../prisma/python-content";
import { pythonLessons } from "../prisma/python-lessons";
import { pythonReleaseFingerprint } from "../prisma/python-releases";
import { localTheoryContract } from "./python-local-theory-baseline";
import { beforePythonRecordTheory, previousRecordTheoryTasks } from "./python-record-theory-baseline";

const reviewed = ["python-filter", "python-agrega", "python-clave-longitud", "python-lambda-desempate", "python-formato-decimal", "python-consulta-anidada", "python-inventario-valora", "python-academia-inscribe", "python-academia-califica", "python-academia-resume", "python-contactos-crea", "python-contactos-edita", "python-contactos-borra", "python-contactos-busca", "python-transforma-campo", "python-transforma-registros"];
const content = (slug: string) => pythonCatalog.find(entry => entry.slug === slug)!.content;

test("las últimas 16 introducciones completan la teoría local de 48 propias: tres ajustes y trece conservadas", () => {
  const own = pythonCatalog.filter(entry => pythonLessons.has(entry.slug));
  assert.deepEqual(own.slice(32).map(entry => entry.slug), reviewed);
  assert.equal(own.length, 48);
  assert.deepEqual(new Set(own.map(entry => entry.slug)), new Set(pythonLessons.keys()));
  assert.deepEqual(new Set(Object.keys(previousRecordTheoryTasks)), new Set(["python-filter", "python-consulta-anidada", "python-academia-califica"]));
  for (const slug of reviewed) {
    const entry = content(slug);
    assert.equal(entry.variants[0].statement, entry.statement, slug);
    assert.deepEqual([...entry.statement.matchAll(/^(Tu tarea|Entrada|Resultado esperado)\n/gm)].map(match => match[1]), ["Tu tarea", "Entrada", "Resultado esperado"], slug);
    assert.equal(entry.hints.length, 3, slug);
  }
  assert.equal(reviewed.length - Object.keys(previousRecordTheoryTasks).length, 13);
});

test("la teoría delimita consumo de filter, respaldo de get y orden seguro de and", () => {
  assert.match(content("python-filter").statement, /devuelve un iterador.*al pedir resultados.*puede comprobar varios registros.*no construye ya una lista/);
  assert.match(content("python-consulta-anidada").statement, /solo si falta la clave.*no si su valor es cero o None.*no convierte en diccionario.*None solo puede ser una nota/);
  assert.match(content("python-academia-califica").statement, /izquierda a derecha.*no continúa.*KeyError.*Cambiar el orden/);
  assert.match(content("python-agrega").statement, /default=None.*sin inventar cero/);
  assert.match(content("python-clave-longitud").statement, /key=len.*Es estable/);
  assert.match(content("python-formato-decimal").statement, /produce texto.*round devuelve un número.*no una regla financiera/s);
  assert.match(content("python-contactos-edita").statement, /isinstance\(valor, str\).*texto vacío válido/);
  assert.match(content("python-transforma-registros").statement, /Captura ValueError solo en la conversión.*int nativo/s);
});

test("el cierre de teoría propia conserva todo salvo tres párrafos y reconstruye la entrega anterior", () => {
  const payload = pythonCatalog.map(entry => !(entry.slug in previousRecordTheoryTasks) ? entry : ({ ...entry, content: {
    ...entry.content, statement: localTheoryContract(entry.content.statement),
    variants: entry.content.variants.map(variant => ({ ...variant, statement: localTheoryContract(variant.statement!) })),
  } }));
  // Calculada antes de editar; incluye contratos y las 32 introducciones previas.
  assert.equal(createHash("sha256").update(JSON.stringify(payload)).digest("hex"), "edb3275352740dfe5eed1adf7271cdbe108908a117d600090ea45d2ade881553");
  const previous = pythonCatalog.map(entry => ({ ...entry, content: beforePythonRecordTheory(entry.slug, entry.content) }));
  assert.equal(pythonReleaseFingerprint(previous), "0b39155ec83cb52dde638d4ed540b3b916f8e07e87309798c51cd61343925439");
});

test("modelos fijos comprueban consumo, respaldo, cortocircuito y operaciones de registros", () => {
  // Solo código fijo de prueba, no programas de estudiantes ni validación real
  // del ejecutor. La identidad de los modelos se consulta directamente con is.
  const code = `personas=[{'nombre':'ana','edad':17},{'nombre':'bea','edad':18},{'nombre':'bea','edad':30}]
llamadas=[]
def mayor(persona):
    llamadas.append(persona['edad'])
    return persona['edad']>=18
seleccion=filter(mayor,personas)
assert llamadas==[]
primera=next(seleccion)
assert primera is personas[1] and llamadas==[17,18]
assert [p['nombre'] for p in seleccion]==['bea'] and llamadas==[17,18,30]
assert list(seleccion)==[]
d={'cero':0,'pendiente':None}
assert d.get('cero',99)==0 and d.get('pendiente',99) is None and d.get('ausente',99)==99
registro={'ana':{'mate':0,'arte':None}}
assert registro.get('ana',{}).get('mate')==0
assert registro.get('ana',{}).get('arte') is None
assert registro.get('bea',{}).get('mate') is None
assert not ('bea' in registro and 'mate' in registro['bea'])
try:
    'mate' in registro['bea'] and 'bea' in registro
except KeyError:
    pass
else:
    raise AssertionError('la consulta previa debe fallar')
try:
    {'ana':None}.get('ana',{}).get('mate')
except AttributeError:
    pass
else:
    raise AssertionError('get no reemplaza un None guardado')
assert sorted(['bb','aa','c'],key=len)==['c','bb','aa']
assert sorted(['sol','a','luz'],key=lambda p:(-len(p),p))==['luz','sol','a']
assert f'{3.5:.2f}'=='3.50' and f'{2.5:.0f}'=='2'
assert isinstance('',str) and not isinstance(None,str)
assert [n for n in [0,None,100] if n is not None]==[0,100]
assert sum([])==0 and min([],default=None) is None and max([-4,-2])==-2
assert int(' +12 ')==12 and int('1_000')==1000
print('ok')`;
  const result = spawnSync(process.env.PYTHON_BIN ?? "python", ["-c", code], { encoding: "utf8", timeout: 30000 });
  assert.equal(result.error, undefined);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), "ok");
});
