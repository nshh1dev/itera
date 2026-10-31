import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { pythonCatalog } from "../prisma/python-content";

// Errores fijos del repositorio, nunca programas enviados por alumnos.
const mistakes: Record<string, string> = {
  "logica-elige-mensaje": "return 'positivo' if data >= 0 else 'no positivo'",
  "logica-signo": "return 'positivo' if data > 0 else 'negativo'",
  "logica-mayor-tres": "return max(0, data['a'], data['b'], data['c'])",
  "logica-dos-requisitos": "return data % 3 == 0 or data % 5 == 0",
  "logica-alternativas": "return data['invitacion'] or data['entrada']",
  "logica-tarifa": "return 0 if data <= 6 else (5 if data < 18 else 10)",
  "python-condicional": "return 'adulto' if data > 18 else 'menor'",
  "logica-uno-n": "return list(range(1, data))",
  "logica-cuenta-atras": "return list(range(data, 0, -1))",
  "logica-suma-uno-n": "return sum(range(1, data))",
  "logica-tabla": "return [data * i for i in range(10)]",
  "logica-multiplos": "return sum(1 for i in range(data['n'] + 1) if i % data['divisor'] == 0)",
  "logica-bucle-roto": "return sum(range(1, data + 1, 2))",
  "python-centinela": "return [n for n in data if n != 0]",
  "python-omite-negativos": "return [n for n in data if n > 0]",
  "logica-posicion": "return data['index']",
  "logica-indices": "return [data[0] for _ in data]",
  "logica-suma-lista": "return len(data)",
  "logica-maximo": "return max([0] + data)",
  "logica-cuenta-condicion": "return sum(n for n in data if n > 0)",
  "logica-filtra-lista": "return [n for n in data['values'] if n > data['minimo']]",
  "logica-busqueda-lineal": "posicion = -1\nfor i, n in enumerate(data['values']):\n    if n == data['target']: posicion = i\nreturn posicion",
  "logica-longitud-texto": "return len(data.strip())",
  "logica-minusculas": "return data.lower().replace(' ', '')",
  "logica-vocales": "return sum(1 for c in data.lower() if c in 'aeiouáéíóú')",
  "logica-invierte": "return data",
  "logica-elimina-caracter": "return data['texto'].replace(data['caracter'], '', 1)",
  "logica-palabras": "return data.count(' ') + 1",
  "python-ordena-numeros": "ordenados = sorted(data)\nreturn {'original': ordenados, 'ordenados': ordenados}",
  "python-recorta": "return data['valores'][data['inicio']:data['fin'] + 1]",
  "python-une-palabras": "return ' '.join(data.split(' '))",
  "python-desempaqueta": "return data",
  "python-enumera": "return [[i, palabra] for i, palabra in enumerate(data)]",
  "python-empareja": "a, b = data['a'], data['b']\nreturn [[a[i] if i < len(a) else None, b[i] if i < len(b) else None] for i in range(max(len(a), len(b)))]",
  "python-retorno-multiple": "a, b = data\nreturn a * b, a + b",
  "logica-ficha-producto": "return data['nombre']",
  "logica-ficha-resultado": "return {'total': data['precio'] * data['unidades'], 'unidades': data['precio']}",
  "logica-opcional": "return data.get('cantidad') or 1",
  "logica-ausencia": "return data + 1 if data else -1",
  "logica-auxiliares": "total = data['precio'] * data['cantidad']\nreturn total + (300 if total <= 2000 else 0)",
  "logica-variable-local": "return 11",
  "logica-parametro-exterior": "return [data['exterior'] * 2, data['exterior']]",
  "logica-llamadas-independientes": "return [data[0], data[0] + data[1]]",
  "logica-sin-estado-global": "total = data['base']\nsalida = []\nfor tasa in data['tasas']:\n    total += tasa\n    salida.append(total)\nreturn salida",
  "logica-encadena-retornos": "return data['precio'] * (data['unidades'] + 2)",
  "logica-dos-nombres-lista": "original = data['valores']\nalias = list(original)\nalias.append(data['nuevo'])\nreturn original",
  "logica-reasigna-o-muta": "original = data['valores']\nalias = original\nalias.append(data['nuevo'])\nreturn {'original': original, 'alias': alias}",
  "logica-copia-plana": "copia = data['valores']\ncopia.append(data['nuevo'])\nreturn {'original': data['valores'], 'copia': copia}",
  "logica-conserva-entrada": "for i in range(len(data['valores'])):\n    data['valores'][i] += data['incremento']\nreturn {'original': data['valores'], 'ajustados': data['valores']}",
  "logica-registro-compartido": "ficha = data['ficha']\nalias = dict(ficha)\nalias['cantidad'] += data['cambio']\nreturn [ficha['cantidad'], alias['cantidad']]",
  "python-identidad": "antes = list(data['valores'])\noriginal = antes + [data['nuevo']]\nreturn {'antes': antes, 'original': original, 'copia': antes, 'igual': False, 'misma': True, 'copiaMisma': True}",
  "python-opcional-seguro": "def agregar(valor, base=[]):\n    base.append(valor)\n    return base\nreturn [agregar(data[0]), agregar(data[1])]",
  "python-actualiza-diccionario": "return {data['clave']: data['nuevo']}",
  "python-borra-clave": "return {k: v for k, v in data['valores'].items() if k != data['clave'] or not v}",
  "python-recorre-pares": "return [k + ': ' + str(v) for k, v in data.items()]",
  "python-lista-registros": "cantidades = {}\nfor ficha in data:\n    cantidades[ficha['nombre']] = ficha['cantidad']\nreturn sum(cantidades.values())",
  "logica-valida-divisor": "return data['total'] / data['divisor'] if data['divisor'] and data['total'] else None",
  "logica-valido-cero-ausente": "n = data['cantidad']\nreturn 'ausente' if not n else ('invalido' if n < 0 else 'valido')",
  "logica-localiza-error": "i = data['indice']\nreturn data['valores'][i] if -len(data['valores']) <= i < len(data['valores']) else 'indice fuera de rango'",
  "logica-captura-conversion": "try:\n    n = float(data.strip())\n    return int(n) if n.is_integer() else None\nexcept ValueError:\n    return None",
  "logica-error-dominio": "return 'edad negativa' if data <= 0 else 'aceptada'",
  "logica-recupera-elementos": "validos = []\nrechazados = 0\nfor texto in data:\n    try:\n        validos.append(int(texto))\n    except ValueError:\n        rechazados += 1\n        break\nreturn {'validos': validos, 'rechazados': rechazados}",
  "logica-asercion-normal": "return 12",
  "logica-pruebas-limites": "return max([0] + data)",
  "logica-reproduce-fallo": "return sum(1 for n in data if n >= 0)",
  "logica-conserva-regresion": "return data['total'] - 2 if data['total'] >= data['limite'] else data['total']",
  "logica-factorial": "producto = 0\nfor n in range(1, data + 1):\n    producto *= n\nreturn producto",
  "logica-fizzbuzz": "return ['Fizz' if n % 3 == 0 else ('Buzz' if n % 5 == 0 else n) for n in range(1, data + 1)]",
  "logica-mediciones": "return {'total': sum(data), 'positivos': sum(1 for n in data if n > 0), 'mayor': max([0] + data)}",
  "logica-carrito": "total = 0\nfor item in data['items']:\n    total = item['precio'] * item['cantidad']\nreturn total * (100 - data['descuento']) / 100",
  "logica-notas": "return {'aprobados': sum(1 for n in data if n >= 5), 'media': sum(data) // len(data) if data else None}",
  "logica-saldo": "saldo = data['inicial']\nrechazados = 0\nfor movimiento in data['movimientos']:\n    saldo += movimiento\n    if saldo < 0: rechazados += 1\nreturn {'saldo': saldo, 'rechazados': rechazados}",
  "logica-gastos-registro": "total = 0\npor_categoria = {}\nfor movimiento in data:\n    total += movimiento['importe']\n    por_categoria[movimiento['categoria']] = movimiento['importe']\nreturn {'total': total, 'porCategoria': por_categoria}",
  "logica-gastos-validacion": "total = 0\npor_categoria = {}\nrechazados = 0\nfor m in data:\n    if m['importe'] < 0 or m['categoria'] not in ['casa', 'ocio']:\n        rechazados += 1\n        break\n    total += m['importe']\n    c = m['categoria']\n    por_categoria[c] = por_categoria.get(c, 0) + m['importe']\nreturn {'total': total, 'porCategoria': por_categoria, 'rechazados': rechazados}",
};

test("principiante: referencias, plantillas y errores de las 74 actividades; mutación intencional diferenciada", () => {
  const entries = pythonCatalog.filter(entry => entry.content.level === "BEGINNER");
  assert.equal(entries.length, 74);
  assert.deepEqual(Object.keys(mistakes).sort(), entries.map(entry => entry.slug).sort());
  const fixtures = entries.map(entry => ({ slug: entry.slug, ...entry.content.variants[0],
    mistake: `def solve(data):\n${mistakes[entry.slug].split("\n").map(line => `    ${line}`).join("\n")}\n`,
  }));
  const runner = `import sys,json,copy,contextlib,io,types
results=[]
for entry in json.load(sys.stdin):
    outcomes=[]
    for kind in ('solution','starter','mistake'):
        code=entry[kind]
        project=entry.get('project')
        if project and kind!='mistake':
            files=entry['solutionFiles'] if kind=='solution' else project['files']
            for file in files:
                compile(file['content'],file['path'],'exec')
            code=next(f['content'] for f in files if f['path']==project['entrypoint'])
            if kind=='solution' and project.get('testEntrypoint'):
                module=types.ModuleType('main')
                exec(code,module.__dict__)
                sys.modules['main']=module
                checks=next(f['content'] for f in files if f['path']==project['testEntrypoint'])
                exec(checks,{})
                del sys.modules['main']
        values=[]
        for case in entry['tests']:
            data=copy.deepcopy(case['input'])
            scope={}
            with contextlib.redirect_stdout(io.StringIO()):
                exec(code,scope)
                value=scope['solve'](data)
            if kind!='mistake':
                if kind=='solution' and entry['slug']=='logica-dos-nombres-lista':
                    assert data['valores']==case['expected'],entry['slug']
                elif kind=='solution' and entry['slug']=='logica-registro-compartido':
                    assert data['ficha']['cantidad']==case['expected'][0],entry['slug']
                else:
                    assert data==case['input'],entry['slug']+': mutación en '+kind
            values.append(value)
        outcomes.append(values)
    results.append(outcomes)
print(json.dumps(results,allow_nan=False))`;
  const result = spawnSync(process.env.PYTHON_BIN ?? "python", ["-c", runner], {
    input: JSON.stringify(fixtures), encoding: "utf8", timeout: 30000, maxBuffer: 4 * 1024 * 1024,
  });
  assert.equal(result.status, 0, result.stderr || String(result.error));
  const values = JSON.parse(result.stdout);
  for (const [index, entry] of entries.entries()) {
    const expected = entry.content.variants[0].tests.map(item => item.expected);
    assert.deepEqual(values[index][0], expected, `${entry.slug}: referencia`);
    assert.notDeepEqual(values[index][1], expected, `${entry.slug}: plantilla resuelta`);
    assert.notDeepEqual(values[index][2], expected, `${entry.slug}: error no detectado`);
    if (["logica-notas", "logica-carrito", "logica-vocales", "logica-captura-conversion"].includes(entry.slug)) {
      const previousCount = entry.baseline!.variants[0].tests.length;
      assert.deepEqual(values[index][2].slice(0, previousCount), expected.slice(0, previousCount), `${entry.slug}: el error pasaba los casos anteriores`);
    }
  }
});

test("las regresiones de principiante tienen respuestas independientes y conservan los casos anteriores", () => {
  const entry = (slug: string) => pythonCatalog.find(item => item.slug === slug)!;
  const cases = (slug: string) => entry(slug).content.variants[0].tests;
  assert.ok(cases("logica-notas").some(item => JSON.stringify(item.input) === "[4,5]" && JSON.stringify(item.expected) === '{"aprobados":1,"media":4.5}'));
  assert.ok(cases("logica-carrito").some(item => item.expected === 5.5));
  assert.ok(cases("logica-captura-conversion").some(item => item.input === "3.0" && item.expected === null));
  assert.ok(cases("logica-captura-conversion").some(item => item.input === " +007 " && item.expected === 7));
  for (const slug of ["logica-captura-conversion", "logica-recupera-elementos"]) {
    assert.doesNotMatch(entry(slug).content.variants[0].solution, /float\(/);
    assert.match(entry(slug).content.variants[0].solution, /except ValueError/);
    assert.match(entry(slug).content.variants[0].statement!, /ASCII/);
  }
  for (const item of pythonCatalog.filter(item => item.content.level === "BEGINNER" && item.baseline)) {
    const baseline = item.baseline!.variants[0].tests;
    for (const original of baseline) {
      const current = item.content.variants[0].tests.find(test => test.order === original.order)!;
      assert.deepEqual({ ...current, explanation: undefined }, { ...original, explanation: undefined }, item.slug);
    }
  }
});
