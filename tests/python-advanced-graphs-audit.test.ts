import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { pythonCatalog } from "../prisma/python-content";

// Errores y referencias fijos, nunca código enviado por estudiantes.
const mistakes: Record<string, string> = {
  "logica-adyacencia": "ady = [[] for _ in range(data['n'])]\nfor a,b in data['aristas']:\n    ady[a].append(b)\n    ady[b].append(a)\nreturn [sorted(v) for v in ady]",
  "logica-alcanzables": "ady = [[] for _ in range(data['n'])]\nfor a,b in data['aristas']:\n    ady[a].append(b)\n    ady[b].append(a)\nresultado = []\ndef visitar(n,padre,camino):\n    resultado.append(n)\n    if n in camino: return\n    for v in ady[n]:\n        if v!=padre: visitar(v,n,camino+[n])\nvisitar(data['inicio'],None,[])\nreturn sorted(resultado)",
  "logica-distancias": "ady = [[] for _ in range(data['n'])]\nfor a,b in data['aristas']:\n    ady[a].append(b)\n    ady[b].append(a)\nd = [-1]*data['n']\ndef visitar(n,distancia):\n    d[n] = distancia\n    for v in ady[n]:\n        if d[v]==-1: visitar(v,distancia+1)\nvisitar(data['inicio'],0)\nreturn d",
  "logica-ciclo-dirigido": "ady = [[] for _ in range(data['n'])]\nfor a,b in data['aristas']: ady[a].append(b)\nvistos = set()\ndef visitar(n):\n    if n in vistos: return True\n    vistos.add(n)\n    return any(visitar(v) for v in ady[n])\nreturn any(visitar(n) for n in range(data['n']) if n not in vistos)",
  "logica-dependencias": "n = data['n']\nady = [[] for _ in range(n)]\ngrado = [0]*n\nfor a,b in data['dependencies']:\n    ady[a].append(b)\n    grado[b] += 1\ncola = [i for i in range(n) if grado[i]==0]\nresultado = []\nwhile cola:\n    a = cola.pop(0)\n    resultado.append(a)\n    for b in ady[a]:\n        grado[b] -= 1\n        if grado[b]==0: cola.append(b)\nreturn resultado if len(resultado)==n else []",
  "logica-dijkstra": "d = [float('inf')]*data['n']\nd[0] = 0\nfor _ in range(data['n']-1):\n    for a,b,p in data['aristas']: d[b] = min(d[b],d[a]+p)\nreturn d[data['destino']] if d[data['destino']]!=float('inf') else -1",
  "logica-islas": "if not data or not data[0]: return 0\nvistos = set()\ntotal = 0\ndef visitar(f,c):\n    if (f,c) in vistos or not (0<=f<len(data) and 0<=c<len(data[0])) or data[f][c]==0: return\n    vistos.add((f,c))\n    for df in (-1,0,1):\n        for dc in (-1,0,1):\n            if df or dc: visitar(f+df,c+dc)\nfor f in range(len(data)):\n    for c in range(len(data[0])):\n        if data[f][c] and (f,c) not in vistos:\n            total += 1\n            visitar(f,c)\nreturn total",
  "logica-laberinto": "f,c = len(data),len(data[0])\nd = [[float('inf')]*c for _ in range(f)]\nfor i in range(f):\n    for j in range(c):\n        if data[i][j]: continue\n        if i==j==0: d[i][j] = 0\n        else: d[i][j] = 1+min(d[i-1][j] if i else float('inf'),d[i][j-1] if j else float('inf'))\nreturn d[-1][-1] if d[-1][-1]!=float('inf') else -1",
  "logica-capacidad": "return max(max(data['pesos']),(sum(data['pesos'])+data['dias']-1)//data['dias'])",
  "logica-edicion": "from itertools import zip_longest\nreturn sum(a!=b for a,b in zip_longest(data['a'],data['b']))",
  "logica-subsecuencia-creciente": "return len(set(data))",
  "logica-planifica-tareas": "n = len(data['duraciones'])\ngrado = [0]*n\nfor a,b in data['dependencias']: grado[b] += 1\ncola = [i for i in range(n) if grado[i]==0]\nfor a in cola:\n    for origen,b in data['dependencias']:\n        if origen==a:\n            grado[b] -= 1\n            if grado[b]==0: cola.append(b)\nif len(cola)!=n: return -1\nreturn max(data['duraciones']+[data['duraciones'][a]+data['duraciones'][b] for a,b in data['dependencias']],default=0)",
};
const revisedCases = new Set(["logica-adyacencia", "logica-alcanzables", "logica-distancias", "logica-dependencias", "logica-dijkstra", "logica-laberinto", "logica-edicion", "logica-planifica-tareas"]);
const entries = pythonCatalog.filter(entry => Object.hasOwn(mistakes, entry.slug));
function runPython(runner: string, fixtures: unknown) {
  const result = spawnSync(process.env.PYTHON_BIN ?? "python", ["-c", runner], {
    input: JSON.stringify(fixtures), encoding: "utf8", timeout: 30000, maxBuffer: 1024 * 1024,
  });
  assert.equal(result.status, 0, result.stderr || String(result.error));
  return JSON.parse(result.stdout);
}

test("avanzado: doce referencias de grafos y optimización; ocho errores antes aceptados", () => {
  assert.equal(entries.length, 12);
  assert.deepEqual(entries.map(e => e.slug), pythonCatalog.filter(e => e.content.level === "ADVANCED").slice(24).map(e => e.slug));
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
    if (revisedCases.has(entry.slug)) {
      assert.equal(expected.length, 6, entry.slug);
      assert.deepEqual(values[index][2].slice(0, -1), expected.slice(0, -1), `${entry.slug}: antes aceptado`);
      assert.equal(entry.content.variants[0].tests.at(-1)!.visible, false);
    }
    for (const original of entry.baseline!.variants[0].tests) {
      const current = entry.content.variants[0].tests.find(item => item.order === original.order)!;
      assert.deepEqual({ ...current, explanation: undefined }, { ...original, explanation: undefined }, entry.slug);
    }
  }
});

test("grafos y optimización: límites locales, salida y oráculos independientes", () => {
  const adjacency = entries.find(entry => entry.slug === "logica-adyacencia")!.content;
  assert.match(adjacency.variants[0].statement!, /hasta 4000 aristas/);
  assert.match(entries.find(entry => entry.slug === "logica-distancias")!.content.complexity, /memoria total O\(n \+ m\)/);
  const result = runPython(`import sys,json,copy,itertools
solutions={}
for entry in json.load(sys.stdin):
    scope={}
    exec(entry['solution'],scope)
    solutions[entry['slug']]=scope['solve']
def check(slug,data,expected):
    before=copy.deepcopy(data)
    value=solutions[slug](data)
    assert value==expected,slug
    assert data==before,slug+': mutación'
    return value
edges=[[i,(i+d)%1000] for i in range(1000) for d in range(1,5)]
expected=[sorted((i+d)%1000 for d in (-4,-3,-2,-1,1,2,3,4)) for i in range(1000)]
value=check('logica-adyacencia',{'n':1000,'aristas':edges},expected)
assert len((json.dumps(value)+'\\n').encode('ascii'))<=65536
# Un grafo completo de 200 nodos cabía en el contrato anterior, no en la salida.
assert len(json.dumps([[j for j in range(200) if j!=i] for i in range(200)]))>65536
chain=[[i,i+1] for i in range(999)]
check('logica-alcanzables',{'n':1000,'aristas':chain+[[999,0]],'inicio':999},list(range(1000)))
check('logica-distancias',{'n':1000,'aristas':chain,'inicio':999},list(range(999,-1,-1)))
directed=[[i,i+1] for i in range(99)]
check('logica-ciclo-dirigido',{'n':100,'aristas':directed},False)
check('logica-ciclo-dirigido',{'n':100,'aristas':directed+[[99,0]]},True)
check('logica-dependencias',{'n':100,'dependencies':[[i+1,i] for i in range(99)]},list(range(99,-1,-1)))
check('logica-dependencias',{'n':3,'dependencies':[[1,2],[2,1]]},[])
check('logica-dijkstra',{'n':200,'aristas':[[i+1,i,1] for i in range(199)],'destino':199},199)
check('logica-islas',[[1]*300 for _ in range(300)],1)
check('logica-islas',[[(i+j)%2 for j in range(300)] for i in range(300)],45000)
check('logica-islas',[],0)
check('logica-islas',[[],[]],0)
check('logica-laberinto',[[0]*200 for _ in range(200)],398)
check('logica-laberinto',[[0,0],[0,1]],-1)
check('logica-capacidad',{'pesos':[1]*10000,'dias':100},100)
check('logica-edicion',{'a':'a'*200,'b':'b'*200},200)
check('logica-subsecuencia-creciente',list(range(500)),500)
check('logica-subsecuencia-creciente',list(range(499,-1,-1)),1)
check('logica-planifica-tareas',{'duraciones':[1]*100,'dependencias':directed},100)
check('logica-planifica-tareas',{'duraciones':[0,0],'dependencias':[[0,1],[1,0]]},-1)
# Clausura de Floyd-Warshall como oráculo del camino mínimo, no Dijkstra.
pairs=list(itertools.combinations(range(4),2))
for mask in range(1<<len(pairs)):
    edges=[]
    d=[[0 if i==j else float('inf') for j in range(4)] for i in range(4)]
    for k,(a,b) in enumerate(pairs):
        if mask & (1<<k):
            edges.append([b,a,k+1])
            d[a][b]=d[b][a]=k+1
    for k in range(4):
        for i in range(4):
            for j in range(4): d[i][j]=min(d[i][j],d[i][k]+d[k][j])
    for target in range(4):
        check('logica-dijkstra',{'n':4,'aristas':edges,'destino':target},d[0][target] if d[0][target]!=float('inf') else -1)
# Todos los órdenes posibles determinan el topológico mínimo de grafos de tres.
pairs=[(i,j) for i in range(3) for j in range(3) if i!=j]
for mask in range(1<<len(pairs)):
    edges=[list(p) for k,p in enumerate(pairs) if mask & (1<<k)]
    valid=[list(p) for p in itertools.permutations(range(3)) if all(p.index(a)<p.index(b) for a,b in edges)]
    check('logica-dependencias',{'n':3,'dependencies':edges},min(valid) if valid else [])
    check('logica-ciclo-dirigido',{'n':3,'aristas':edges},not bool(valid))
# Particiones contiguas, independientes de buscar una capacidad por mitades.
for n in range(1,5):
    for weights in itertools.product(range(1,4),repeat=n):
        for days in range(1,n+1):
            best=min(max(sum(weights[a:b]) for a,b in zip((0,)+cuts,cuts+(n,))) for cuts in itertools.combinations(range(1,n),days-1))
            check('logica-capacidad',{'pesos':list(weights),'dias':days},best)
# Enumeración de índices, no tabla DP, para crecimiento estricto y orden.
for n in range(6):
    for values in itertools.product((-1,0,1),repeat=n):
        candidates=[[values[i] for i in range(n) if mask & (1<<i)] for mask in range(1<<n)]
        best=max(len(v) for v in candidates if all(a<b for a,b in zip(v,v[1:])))
        check('logica-subsecuencia-creciente',list(values),best)
print(json.dumps('ok'))`, entries.map(entry => ({ slug: entry.slug, solution: entry.content.variants[0].solution })));
  assert.equal(result, "ok");
});

test("la auditoría individual registra exactamente las 224 identidades Python", () => {
  const document = readFileSync("docs/auditoria-python.md", "utf8");
  const slugs = [...document.matchAll(/^\| `([^`]+)` \|/gm)].map(match => match[1]);
  assert.equal(slugs.length, 224);
  assert.equal(new Set(slugs).size, 224);
  assert.deepEqual([...slugs].sort(), pythonCatalog.map(entry => entry.slug).sort());
});
