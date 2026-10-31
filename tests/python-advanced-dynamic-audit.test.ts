import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { pythonCatalog } from "../prisma/python-content";

// Solo código educativo fijo del repositorio; nunca código de alumnos.
const mistakes: Record<string, string> = {
  "logica-potencia": "return data['base'] ** (data['exponente'] - data['exponente'] % 2)",
  "logica-mezcla": "return sorted(set(data))",
  "logica-subconjuntos": "resultado = [[]]\nfor n in data: resultado += [s+[n] for s in resultado]\nreturn sorted(resultado,key=len)",
  "logica-permutaciones": "from itertools import permutations\nreturn [list(p) for p in sorted(permutations(data),key=lambda p:tuple(str(n) for n in p))]",
  "logica-combinaciones": "from itertools import combinations\nn = sorted(data['numbers'])\nresultado = [list(c) for k in range(len(n)+1) for c in combinations(n,k) if sum(c)==data['target']]\nreturn sorted(resultado,key=str)",
  "logica-reinas": "from math import factorial\nreturn factorial(data)",
  "logica-fibonacci": "a,b = 1,1\nfor _ in range(data): a,b = b,a+b\nreturn a",
  "logica-escalera": "a,b = 0,1\nfor _ in range(data): a,b = b,a+b\nreturn a",
  "logica-caminos-obstaculos": "from math import comb\nif data[0][0] or data[-1][-1]: return 0\nreturn comb(len(data)+len(data[0])-2,len(data)-1)",
  "logica-monedas": "resto = data['amount']\ntotal = 0\nfor moneda in sorted(data['coins'],reverse=True):\n    total += resto // moneda\n    resto %= moneda\nreturn total if resto==0 else -1",
  "logica-mochila": "if data['capacidad']==0: return 0\nn = len(data['pesos'])\nreturn max(sum(data['valores'][i] for i in range(n) if mask & (1<<i)) for mask in range(1<<n) if sum(data['pesos'][i] for i in range(n) if mask & (1<<i)) <= data['capacidad'])",
  "logica-subsecuencia-comun": "return len(set(data['a']) & set(data['b']))",
};
const previousCounts: Record<string, number> = {
  "logica-potencia": 8, "logica-subconjuntos": 4, "logica-permutaciones": 5,
  "logica-combinaciones": 4, "logica-mochila": 5, "logica-subsecuencia-comun": 5,
};
const entries = pythonCatalog.filter(entry => Object.hasOwn(mistakes, entry.slug));
function runPython(runner: string, fixtures: unknown) {
  const result = spawnSync(process.env.PYTHON_BIN ?? "python", ["-c", runner], {
    input: JSON.stringify(fixtures), encoding: "utf8", timeout: 30000, maxBuffer: 1024 * 1024,
  });
  assert.equal(result.status, 0, result.stderr || String(result.error));
  return JSON.parse(result.stdout);
}

test("avanzado: doce referencias y plantillas de combinatoria y DP; seis errores antes aceptados", () => {
  assert.equal(entries.length, 12);
  assert.deepEqual(entries.map(e => e.slug), pythonCatalog.filter(e => e.content.level === "ADVANCED").slice(12, 24).map(e => e.slug));
  const fixtures = entries.map(entry => ({ slug: entry.slug, ...entry.content.variants[0],
    mistake: `def solve(data):\n${mistakes[entry.slug].split("\n").map(line => `    ${line}`).join("\n")}\n`,
  }));
  const values = runPython(`import sys,json,copy,contextlib,io
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
            if kind!='mistake': assert data==case['input'],entry['slug']+': mutación en '+kind
            values.append(value)
        outcomes.append(values)
    results.append(outcomes)
print(json.dumps(results,allow_nan=False))`, fixtures);
  for (const [index, entry] of entries.entries()) {
    const expected = entry.content.variants[0].tests.map(item => item.expected);
    assert.deepEqual(values[index][0], expected, `${entry.slug}: referencia`);
    assert.notDeepEqual(values[index][1], expected, `${entry.slug}: plantilla resuelta`);
    assert.notDeepEqual(values[index][2], expected, `${entry.slug}: error no detectado`);
    if (entry.slug in previousCounts) {
      const count = previousCounts[entry.slug];
      assert.equal(expected.length, count + (entry.slug === "logica-subsecuencia-comun" ? 2 : 1));
      assert.deepEqual(values[index][2].slice(0, count), expected.slice(0, count), `${entry.slug}: antes aceptado`);
      for (const fixture of entry.content.variants[0].tests.slice(count)) assert.equal(fixture.visible, false);
    }
    for (const original of entry.baseline!.variants[0].tests) {
      const current = entry.content.variants[0].tests.find(item => item.order === original.order)!;
      assert.deepEqual({ ...current, explanation: undefined }, { ...original, explanation: undefined }, entry.slug);
    }
  }
});

test("combinatoria y DP: límites locales de referencias y oráculos independientes", () => {
  const permutations = entries.find(entry => entry.slug === "logica-permutaciones")!.content;
  assert.match(permutations.variants[0].statement!, /hasta 6 enteros distintos entre -1000 y 1000/i);
  assert.match(permutations.constraints.join(" "), /Hasta 6 enteros distintos/);
  const fixtures = entries.map(entry => ({ slug: entry.slug, solution: entry.content.variants[0].solution }));
  const result = runPython(`import sys,json,copy,itertools
solutions={}
for entry in json.load(sys.stdin):
    scope={}
    exec(entry['solution'],scope)
    solutions[entry['slug']]=scope['solve']
def check(slug,data,expected):
    before=copy.deepcopy(data)
    assert solutions[slug](data)==expected,slug
    assert data==before,slug+': mutación'
check('logica-potencia',{'base':2,'exponente':52},4503599627370496)
check('logica-potencia',{'base':9,'exponente':15},205891132094649)
check('logica-mezcla',list(range(9999,-1,-1)),list(range(10000)))
# Máscaras independientes del procedimiento de duplicación de subconjuntos.
numbers=list(range(-5,5))
subsets=[[numbers[i] for i in range(10) if mask & (1<<i)] for mask in range(1024)]
check('logica-subconjuntos',numbers,subsets)
# Biblioteca estándar como oráculo independiente del backtracking de referencia.
numbers=[-1000,-999,-998,-997,-996,1000]
check('logica-permutaciones',numbers,[list(p) for p in itertools.permutations(numbers)])
# Mismo formato JSON que executionFiles('python', ..., 'FUNCTION').
serialized=json.dumps(solutions['logica-permutaciones'](numbers),ensure_ascii=True,allow_nan=False)+'\\n'
assert len(serialized.encode('ascii'))<=65536
# El contrato anterior de ocho ya excedía tanto Docker como el adaptador.
old=json.dumps(list(itertools.permutations(range(8))))+'\\n'
assert len(old)>262144
numbers=list(range(1,16))
combinations=sorted([list(c) for k in range(16) for c in itertools.combinations(numbers,k) if sum(c)==100])
check('logica-combinaciones',{'numbers':numbers[::-1],'target':100},combinations)
check('logica-combinaciones',{'numbers':[1,2,3],'target':0},[[]])
for n,count in enumerate([1,0,0,2,10,4,40,92],1): check('logica-reinas',n,count)
check('logica-fibonacci',40,102334155)
check('logica-escalera',45,1836311903)
check('logica-caminos-obstaculos',[[0]*15 for _ in range(15)],40116600)
check('logica-caminos-obstaculos',[[0,1,0,0]],0)
check('logica-caminos-obstaculos',[[0],[1],[0]],0)
check('logica-monedas',{'coins':[],'amount':0},0)
check('logica-monedas',{'coins':[1,3,4],'amount':1000},250)
check('logica-mochila',{'pesos':[0]*200,'valores':[1]*200,'capacidad':0},200)
check('logica-mochila',{'pesos':[5]*200,'valores':[1]*200,'capacidad':1000},200)
check('logica-subsecuencia-comun',{'a':'a'*500,'b':'a'*500},500)
check('logica-subsecuencia-comun',{'a':'a'*500,'b':'b'*500},0)
# Comparación exhaustiva corta: subconjuntos de índices, no otra tabla DP.
def subsequences(text):
    return {''.join(text[i] for i in range(len(text)) if mask & (1<<i)) for mask in range(1<<len(text))}
texts=[''.join(t) for n in range(5) for t in itertools.product('ab',repeat=n)]
for a in texts:
    for b in texts:
        expected=max(map(len,subsequences(a) & subsequences(b)))
        check('logica-subsecuencia-comun',{'a':a,'b':b},expected)
print(json.dumps('ok'))`, fixtures);
  assert.equal(result, "ok");
});
