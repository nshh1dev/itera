import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { pythonCatalog } from "../prisma/python-content";

// Errores fijos de este bloque; no se ejecuta código recibido de alumnos.
const mistakes: Record<string, string> = {
  "python-conjunto-seguro": "valores = set(data['valores'])\nvalores.discard(data['quitar'])\nvalores.add(data['agregar'])\nreturn sorted(valores)",
  "python-union": "return sorted(set(data['a']) & set(data['b']))",
  "python-interseccion": "return sorted(set(data['a']) | set(data['b']))",
  "python-diferencia": "return sorted(set(data['disponibles']) - set(data['requeridos']))",
  "python-simetrica": "return sorted(set(data['a']) - set(data['b']))",
  "python-subconjunto": "return set(data['requeridos']) < set(data['disponibles'])",
  "logica-repetido": "return bool(data)",
  "logica-deduplica": "return sorted(set(data))",
  "logica-frecuencias": "return {letra: 1 for letra in data}",
  "logica-primer-unico": "unicos = sorted(c for c in set(data) if data.count(c) == 1)\nreturn unicos[0] if unicos else None",
  "logica-anagramas": "return set(data['a'].lower().replace(' ', '')) == set(data['b'].lower().replace(' ', ''))",
  "python-crea-grupo": "return {data['categoria']: list(data['grupos'].get(data['categoria'], [])) + [data['nombre']]}",
  "logica-agrupa-registros": "grupos = {}\nfor item in data:\n    grupos[item['categoria']] = [item['nombre']]\nreturn grupos",
  "python-comprension": "return [abs(n) for n in data]",
  "python-comprension-filtro": "return [c for c in data if c in 'aeiou']",
  "python-comprension-condicional": "return [n for n in data if n >= 0]",
  "python-comprension-dict": "return {palabra: 1 for palabra in data}",
  "python-iterador": "return [list(iter(data)), list(iter(data))]",
  "python-generador": "return sum(data) ** 2",
  "python-map": "return [int(texto) for texto in data]",
  "python-filter": "salida = []\nfor persona in data:\n    if persona['edad'] < 18: break\n    salida.append(persona['nombre'])\nreturn salida",
  "python-agrega": "return {'total': sum(data), 'minimo': min([0] + data), 'maximo': max([0] + data)}",
  "python-clave-longitud": "return sorted(data, key=lambda palabra: (len(palabra), palabra))",
  "python-lambda-desempate": "return sorted(data, key=lambda palabra: (len(palabra), palabra), reverse=True)",
  "python-formato-decimal": "return str(round(data['numero'], data['decimales']))",
  "python-consulta-anidada": "nota = data['registro'].get(data['alumno'], {}).get(data['curso'])\nreturn 0 if nota is not None else None",
  "logica-inventario": "stock = {}\nfor movimiento in data:\n    producto = movimiento['producto']\n    stock[producto] = stock.get(producto, 0) + movimiento['cambio']\nreturn {k: v for k, v in stock.items() if v != 0}",
};

test("intermedio, colecciones: 27 referencias, plantillas y errores; cuatro huecos previos distinguidos", () => {
  const entries = pythonCatalog.filter(entry => Object.hasOwn(mistakes, entry.slug));
  assert.equal(entries.length, 27);
  assert.deepEqual(entries.map(entry => entry.slug), pythonCatalog.filter(entry => entry.content.level === "INTERMEDIATE").slice(0, 27).map(entry => entry.slug));
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
  for (const [index, entry] of entries.entries()) {
    const expected = entry.content.variants[0].tests.map(item => item.expected);
    assert.deepEqual(values[index][0], expected, `${entry.slug}: referencia`);
    assert.notDeepEqual(values[index][1], expected, `${entry.slug}: plantilla resuelta`);
    assert.notDeepEqual(values[index][2], expected, `${entry.slug}: error no detectado`);
    const previousCounts: Record<string, number> = {
      "logica-primer-unico": 4, "python-crea-grupo": 3, "python-filter": 3, "python-consulta-anidada": 4,
    };
    if (entry.slug in previousCounts) {
      const count = previousCounts[entry.slug];
      assert.equal(expected.length, count + 1, `${entry.slug}: un caso adicional`);
      assert.deepEqual(values[index][2].slice(0, count), expected.slice(0, count), `${entry.slug}: error aceptado por los casos previos`);
      assert.equal(entry.content.variants[0].tests[count].visible, false);
    }
  }
});

test("colecciones intermedias aclaran los valores Python y conservan los casos anteriores", () => {
  for (const slug of Object.keys(mistakes)) {
    const entry = pythonCatalog.find(entry => entry.slug === slug)!;
    if (entry.baseline) {
      for (const original of entry.baseline.variants[0].tests) {
        const current = entry.content.variants[0].tests.find(item => item.order === original.order)!;
        assert.deepEqual({ ...current, explanation: undefined }, { ...original, explanation: undefined }, slug);
      }
    }
  }
  const statement = (slug: string) => pythonCatalog.find(entry => entry.slug === slug)!.content.variants[0].statement!;
  assert.match(statement("logica-repetido"), /True.*False/);
  assert.match(statement("logica-primer-unico"), /None.*null/);
  for (const slug of ["logica-frecuencias", "logica-agrupa-registros", "logica-inventario"]) {
    assert.match(statement(slug), /diccionario/, slug);
  }
});
