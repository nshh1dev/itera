import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { pythonCatalog } from "../prisma/python-content";

// Referencias y errores educativos fijos; nunca programas de alumnos.
const mistakes: Record<string, string> = {
  "logica-busqueda-binaria": "return data['target'] if data['target'] in data['numbers'] else -1",
  "logica-insercion-posicion": "return sum(n <= data['target'] for n in data['numbers'])",
  "logica-ordena-insercion": "return sorted(set(data))",
  "logica-ordena-registros": "return sorted(data, key=lambda r: (r['puntos'], r['nombre']), reverse=True)",
  "logica-combina": "return sorted(set(data['a'] + data['b']))",
  "logica-palindromo": "texto = ''.join(c for c in data if c.isalnum())\nreturn texto == texto[::-1]",
  "logica-pareja": "parejas = [[i,j] for i in range(len(data['numbers'])) for j in range(i+1,len(data['numbers'])) if data['numbers'][i]+data['numbers'][j]==data['target']]\nreturn parejas[-1] if parejas else []",
  "logica-prefijos": "return [sum(data[:i+1]) for i in range(len(data))]",
  "logica-intervalos-suma": "return [sum(data['numbers'][inicio:fin]) for inicio,fin in data['consultas']]",
  "logica-ventana-fija": "n,k = data['numbers'],data['k']\nreturn max(sum(n[:k]),sum(n[-k:]))",
  "logica-ventana-suma": "n,t = data['numbers'],data['target']\nif not n: return 1\ntamanos = [j-i for i in range(len(n)) for j in range(i+1,len(n)+1) if sum(n[i:j]) >= t]\nreturn min(tamanos) if tamanos else 0",
  "logica-celda": "return data['matriz'][0][0]",
  "logica-filas": "return [sum(f) for f in data if f] if any(data) else [0 for f in data]",
  "logica-columnas": "return [sum(f) for f in data]",
  "logica-diagonales": "principal = [data[i][i] for i in range(len(data))]\nreturn {'principal': principal, 'secundaria': principal[::-1]}",
  "logica-transpuesta": "return [list(f) for f in data]",
  "logica-vecinos": "return [[sum(data[nf][nc] for nf in range(max(0,f-1),min(len(data),f+2)) for nc in range(max(0,c-1),min(len(fila),c+2)) if (nf,nc)!=(f,c)) for c in range(len(fila))] for f,fila in enumerate(data)]",
  "logica-copia-anidada": "copia = list(data['matriz'])\ncopia[data['fila']][data['columna']] = data['valor']\nreturn {'original': data['matriz'], 'copia': copia}",
  "logica-pila": "pila,salida = [],[]\nfor op in data['operaciones']:\n    if op[0]=='push': pila.append(op[1])\n    elif pila: salida.append(pila.pop(0))\nreturn salida",
  "logica-cola": "cola,salida = [],[]\nfor op in data['operaciones']:\n    if op[0]=='push': cola.append(op[1])\n    elif cola: salida.append(cola.pop())\nreturn salida",
  "logica-delimitadores": "return all(data.count(a)==data.count(b) for a,b in [('(',')'),('[',']'),('{','}')])",
  "logica-deshacer": "valor,ultimo = 0,0\nfor op in data['operaciones']:\n    if op[0]=='sumar':\n        ultimo = op[1]\n        valor += ultimo\n    else: valor -= ultimo\nreturn valor",
  "logica-suma-recursiva": "return sum(abs(n) for n in data)",
  "logica-busqueda-recursiva": "def buscar(n):\n    if not n: return -1\n    m = len(n)//2\n    if n[m]==data['target']: return m\n    return buscar(n[m+1:]) if n[m]<data['target'] else buscar(n[:m])\nreturn buscar(data['numbers'])",
  "logica-une-intervalos": "resultado = []\nfor inicio,fin in sorted(data):\n    if resultado and inicio < resultado[-1][1]: resultado[-1][1] = max(resultado[-1][1],fin)\n    else: resultado.append([inicio,fin])\nreturn resultado",
  "logica-segundo-maximo": "n = sorted(data,reverse=True)\nreturn n[1] if len(n)>1 else None",
  "logica-suma-maxima": "return max(0,max(sum(data[i:j]) for i in range(len(data)) for j in range(i+1,len(data)+1)))",
  "logica-sin-repeticiones": "return len(set(data))",
  "logica-ranking": "return sorted(set(data),key=lambda n:(-data.count(n),-n))",
};
const added = new Set(["logica-palindromo", "logica-pareja", "logica-filas", "logica-ventana-fija", "logica-ventana-suma"]);
const entries = pythonCatalog.filter(entry => Object.hasOwn(mistakes, entry.slug));

test("algoritmos intermedios: 29 referencias, plantillas y errores; cinco regresiones antes aceptadas", () => {
  assert.equal(entries.length, 29);
  assert.deepEqual(entries.map(e => e.slug), pythonCatalog.filter(e => e.content.level === "INTERMEDIATE").slice(53).map(e => e.slug));
  const fixtures = entries.map(entry => ({ slug: entry.slug, ...entry.content.variants[0],
    mistake: `def solve(data):\n${mistakes[entry.slug].split("\n").map(line => `    ${line}`).join("\n")}\n`,
  }));
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
            if kind!='mistake': assert data==case['input'],entry['slug']+': mutación en '+kind
            values.append(value)
        outcomes.append(values)
    results.append(outcomes)
print(json.dumps(results,allow_nan=False))`;
  const result = spawnSync(process.env.PYTHON_BIN ?? "python", ["-c", runner], {
    input: JSON.stringify(fixtures), encoding: "utf8", timeout: 30000, maxBuffer: 1024 * 1024,
  });
  assert.equal(result.status, 0, result.stderr || String(result.error));
  const values = JSON.parse(result.stdout);
  for (const [index, entry] of entries.entries()) {
    const expected = entry.content.variants[0].tests.map(item => item.expected);
    assert.deepEqual(values[index][0], expected, `${entry.slug}: referencia`);
    assert.notDeepEqual(values[index][1], expected, `${entry.slug}: plantilla resuelta`);
    assert.notDeepEqual(values[index][2], expected, `${entry.slug}: error no detectado`);
    if (added.has(entry.slug)) {
      const count = entry.slug === "logica-pareja" ? 2 : 1;
      assert.deepEqual(values[index][2].slice(0, -count), expected.slice(0, -count), `${entry.slug}: el error pasaba los casos previos`);
      for (const fixture of entry.content.variants[0].tests.slice(-count)) assert.equal(fixture.visible, false);
    }
    if (entry.baseline) for (const original of entry.baseline.variants[0].tests) {
      const current = entry.content.variants[0].tests.find(item => item.order === original.order)!;
      assert.deepEqual({ ...current, explanation: undefined }, { ...original, explanation: undefined }, entry.slug);
    }
  }
});

test("algoritmos: límites locales de referencias y desempate independiente de parejas", () => {
  const fixtures = entries.map(entry => ({ slug: entry.slug, solution: entry.content.variants[0].solution }));
  const runner = `import sys,json,copy
solutions={}
for entry in json.load(sys.stdin):
    scope={}
    exec(entry['solution'],scope)
    solutions[entry['slug']]=scope['solve']
def check(slug,data,expected):
    before=copy.deepcopy(data)
    assert solutions[slug](data)==expected,slug
    assert data==before,slug+': mutación'
# Respuestas independientes, no calculadas con la referencia.
check('logica-suma-recursiva',[1]*900,900)
check('logica-busqueda-binaria',{'numbers':list(range(10000)),'target':9999},9999)
check('logica-busqueda-recursiva',{'numbers':list(range(1000)),'target':999},999)
check('logica-ordena-insercion',list(range(999,-1,-1)),list(range(1000)))
check('logica-ventana-fija',{'numbers':[1]*100000,'k':50000},50000)
check('logica-ventana-suma',{'numbers':[1]*100000,'target':50000},50000)
check('logica-combina',{'a':[0]*5000,'b':[0]*5000},[0]*10000)
check('logica-prefijos',[10**16,1,-10**16],[0,10**16,10**16+1,1])
check('logica-vecinos',[[1]*20 for _ in range(20)],[[int(f>0)+int(f<19)+int(c>0)+int(c<19) for c in range(20)] for f in range(20)])
check('logica-pareja',{'numbers':[1,1,2,2],'target':3},[0,3])
check('logica-pareja',{'numbers':[2],'target':4},[])
# Enumeración independiente del recorrido de dos punteros.
from itertools import combinations_with_replacement
for size in range(6):
    for numbers in combinations_with_replacement(range(-2,3),size):
        for target in range(-4,5):
            pairs=[(i,j) for i in range(size) for j in range(i+1,size) if numbers[i]+numbers[j]==target]
            expected=list(min(pairs,key=lambda p:(p[0],-p[1]))) if pairs else []
            check('logica-pareja',{'numbers':list(numbers),'target':target},expected)
print('ok')`;
  const result = spawnSync(process.env.PYTHON_BIN ?? "python", ["-c", runner], {
    input: JSON.stringify(fixtures), encoding: "utf8", timeout: 30000, maxBuffer: 1024 * 1024,
  });
  assert.equal(result.status, 0, result.stderr || String(result.error));
  assert.equal(result.stdout.trim(), "ok");
});
