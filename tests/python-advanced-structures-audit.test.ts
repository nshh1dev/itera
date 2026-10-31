import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { pythonCatalog } from "../prisma/python-content";

// Código fijo editorial, nunca programas enviados por estudiantes.
const mistakes: Record<string, string> = {
  "logica-cuenta-nodos": "valores = set()\ndef visitar(n):\n    if n is not None:\n        valores.add(n['value'])\n        visitar(n['left'])\n        visitar(n['right'])\nvisitar(data)\nreturn len(valores)",
  "logica-altura": "def contar(n):\n    return 0 if n is None else 1+contar(n['left'])+contar(n['right'])\nreturn contar(data)",
  "logica-preorden": "def visitar(n):\n    return [] if n is None else visitar(n['left'])+[n['value']]+visitar(n['right'])\nreturn visitar(data)",
  "logica-niveles": "def visitar(n):\n    return [] if n is None else [n['value']]+visitar(n['left'])+visitar(n['right'])\nreturn visitar(data)",
  "logica-arbol-busqueda": "def valido(n):\n    if n is None: return True\n    if n['left'] is not None and n['left']['value'] >= n['value']: return False\n    if n['right'] is not None and n['right']['value'] <= n['value']: return False\n    return valido(n['left']) and valido(n['right'])\nreturn valido(data)",
  "logica-ancestro": "n = data['tree']\nwhile n is not None:\n    if max(data['a'],data['b']) < n['value']: n = n['left']\n    elif min(data['a'],data['b']) > n['value']: n = n['right']\n    else: return n['value']\nreturn None",
  "logica-monticulo-inserta": "return sorted(data['heap']+[data['value']])",
  "logica-monticulo-extrae": "n = sorted(data)\nreturn {'minimo': n[0] if n else None, 'heap': n[1:]}",
  "logica-prioridad": "return [t['id'] for t in sorted(data,key=lambda t:t['prioridad'])]",
  "logica-k-mayores": "n,k = data['numbers'],data['k']\nreturn sorted(n,reverse=True)[:k if k<len(n) else max(0,k-1)]",
  "logica-actividades": "fin,total = 0,0\nfor inicio,siguiente in sorted(data,key=lambda p:p[1]):\n    if inicio>=fin:\n        total += 1\n        fin = siguiente\nreturn total",
  "logica-combina-archivos": "return sum(data) if len(data)>1 else 0",
};
const entries = pythonCatalog.filter(entry => Object.hasOwn(mistakes, entry.slug));
const previousCounts: Record<string, number> = {
  "logica-cuenta-nodos": 4, "logica-arbol-busqueda": 6, "logica-ancestro": 4,
  "logica-k-mayores": 4, "logica-actividades": 5,
};
const runPython = (runner: string, fixtures: unknown) => {
  const result = spawnSync(process.env.PYTHON_BIN ?? "python", ["-c", runner], {
    input: JSON.stringify(fixtures), encoding: "utf8", timeout: 30000, maxBuffer: 1024 * 1024,
  });
  assert.equal(result.status, 0, result.stderr || String(result.error));
  return JSON.parse(result.stdout);
};

test("avanzado, estructuras: doce referencias y plantillas; cinco errores antes aceptados", () => {
  assert.equal(entries.length, 12);
  assert.deepEqual(entries.map(e => e.slug), pythonCatalog.filter(e => e.content.level === "ADVANCED").slice(0, 12).map(e => e.slug));
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
      assert.equal(expected.length, count + 1, entry.slug);
      assert.deepEqual(values[index][2].slice(0, count), expected.slice(0, count), `${entry.slug}: antes aceptado`);
      assert.equal(entry.content.variants[0].tests.at(-1)!.visible, false);
    }
  }
});

test("estructuras avanzadas conservan casos históricos y describen solo el modelo Python", () => {
  const rename = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(rename);
    if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [
      ({ v: "value", izq: "left", der: "right" } as Record<string, string>)[key] ?? key, rename(item),
    ]));
    return value;
  };
  for (const entry of entries) {
    for (const original of entry.baseline!.variants[0].tests) {
      const current = entry.content.variants[0].tests.find(item => item.order === original.order)!;
      assert.deepEqual({ ...current, explanation: undefined }, { ...original, input: rename(original.input), explanation: undefined }, entry.slug);
    }
  }
  for (const slug of ["logica-preorden", "logica-niveles", "logica-arbol-busqueda"]) {
    const variant = entries.find(entry => entry.slug === slug)!.content.variants[0];
    assert.match(variant.statement!, /value.*left.*right/);
    assert.doesNotMatch(variant.statement!, /\b(v|izq|der)\b/);
  }
});

test("estructuras: límites locales y respuestas independientes para árboles, montículos y selección", () => {
  const fixtures = entries.map(entry => ({ slug: entry.slug, solution: entry.content.variants[0].solution }));
  const result = runPython(`import sys,json,copy
solutions={}
for entry in json.load(sys.stdin):
    scope={}
    exec(entry['solution'],scope)
    solutions[entry['slug']]=scope['solve']
def check(slug,data,expected):
    before=copy.deepcopy(data)
    assert solutions[slug](data)==expected,slug
    assert data==before,slug+': mutación'
def node(value,left=None,right=None): return {'value':value,'left':left,'right':right}
# Árbol completo con etiquetas de anchura: salidas independientes de la referencia.
def complete(i,size): return None if i>size else node(i,complete(2*i,size),complete(2*i+1,size))
tree=complete(1,500)
check('logica-altura',tree,9)
check('logica-niveles',tree,list(range(1,501)))
check('logica-cuenta-nodos',complete(1,100),100)
check('logica-ancestro',{'tree':complete(1,100),'a':64,'b':65},32)
# Orden de preorden calculado mediante etiquetas de caminos, no otra recursión.
preorder=sorted(range(1,501),key=lambda i:bin(i)[3:])
check('logica-preorden',tree,preorder)
chain=None
for i in range(50,0,-1): chain=node(i,None,chain)
check('logica-altura',chain,50)
check('logica-preorden',chain,list(range(1,51)))
check('logica-niveles',chain,list(range(1,51)))
check('logica-arbol-busqueda',chain,True)
def ordered(start,end):
    if start>=end: return None
    middle=(start+end)//2
    return node(middle,ordered(start,middle),ordered(middle+1,end))
check('logica-arbol-busqueda',ordered(0,500),True)
check('logica-arbol-busqueda',tree,False)
check('logica-cuenta-nodos',chain,50)
check('logica-ancestro',{'tree':chain,'a':25,'b':50},25)
# Las rutas de reparación están redactadas para la lista ascendente de 100.
inserted=list(range(100))+[49]
for i,value in [(0,-1),(2,0),(5,2),(11,5),(24,11),(49,24)]: inserted[i]=value
check('logica-monticulo-inserta',{'heap':list(range(100)),'value':-1},inserted)
extracted=list(range(99))
for i,value in [(0,1),(1,3),(3,7),(7,15),(15,31),(31,63),(63,99)]: extracted[i]=value
check('logica-monticulo-extrae',list(range(100)),{'minimo':0,'heap':extracted})
check('logica-prioridad',[{'id':i,'prioridad':-1} for i in range(99,-1,-1)],list(range(100)))
check('logica-k-mayores',{'numbers':list(range(1000)),'k':1000},list(range(999,-1,-1)))
check('logica-actividades',[[i,i+1] for i in range(-5000,5000)],10000)
check('logica-combina-archivos',[0]*100,0)
check('logica-combina-archivos',[1]*64,384)
print(json.dumps('ok'))`, fixtures);
  assert.equal(result, "ok");
});
