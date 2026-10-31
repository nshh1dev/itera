import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { pythonCatalog } from "../prisma/python-content";

// Implementaciones fijas del repositorio: nunca código recibido de alumnos.
// Cada error representa una confusión del objetivo; no es una prueba de técnica.
const mistakes: Record<string, string> = {
  "logica-saludo": 'print("Hola mundo!")',
  "logica-dos-lineas": 'print("Primera Segunda")',
  "logica-orden-mensaje": 'print("Servir\\nMezclar\\nPreparar")',
  "logica-texto-calculo": 'print("4 + 6")\nprint(4 + 6)',
  "logica-guarda-nombre": 'nombre = "Ada"\nprint("nombre")',
  "logica-guarda-cantidad": 'puntos = 8\nprint("puntos")',
  "logica-actualiza-puntos": 'puntos = 8\npuntos = 3\nprint(puntos)',
  "logica-intercambia": 'a = 3\nb = 8\na = b\nb = a\nprint(a)\nprint(b)',
  "logica-suma-cantidades": 'print("7" + "5")',
  "logica-cambio": 'print(13 - 20)',
  "logica-precio-unidades": 'print(4 + 6)',
  "logica-parentesis": 'print(4 + 3 * 2)',
  "python-constante": 'LAPICES_POR_CAJA = 6\ncajas = 3\nprint(cajas + LAPICES_POR_CAJA)',
  "logica-lee-nombre": 'nombre = input()\nprint("Hola," + nombre)',
  "logica-lee-doble": 'numero = int(input())\nprint(numero + 2)',
  "logica-lee-suma": 'a = input()\nb = input()\nprint(a + b)',
  "logica-mensaje-resultado": 'ciudad = input()\nprint("Destino: " + ciudad.lower())',
  "python-decimal": 'texto = input()\nprint(float(texto))',
  "logica-numero-texto": 'print(4 + 2)\nprint(4 + 2)',
  "logica-booleano": 'listo = False\nprint(str(listo).lower())',
  "logica-igualdad": 'a = int(input())\nb = int(input())\nprint(str(a != b).lower())',
  "logica-alcanza": 'cantidad = int(input())\nprint(str(cantidad > 10).lower())',
  "logica-retorno": 'def solve(data):\n    print(data)',
  "logica-parametro": 'def solve(data):\n    return data + 2',
  "logica-dos-parametros": 'def solve(data):\n    return data["a"]',
  "logica-imprimir-devolver": 'def solve(data):\n    print(data + 1)\n    return 0',
  "logica-predice-valores": 'def solve(data):\n    return data * 2 + 3',
  "logica-tabla-valores": 'def solve(data):\n    segundo = data + 2\n    return str(data) + " -> " + str(segundo) + " -> " + str(data * 3)',
  "logica-minutos-segundos": 'def solve(data):\n    return data + 60',
  "logica-perimetro": 'def solve(data):\n    return data["base"] * data["altura"]',
  "logica-repara-presupuesto": 'def solve(data):\n    return (data["precio"] + data["envio"]) * data["unidades"]',
  "logica-merienda": 'def solve(data):\n    return data["unidades"] * data["precio"]',
};

test("iniciación: 32 referencias correctas, plantillas ejecutables pendientes y errores representativos detectados", () => {
  const entries = pythonCatalog.filter(entry => entry.content.level === "INITIATION");
  assert.equal(entries.length, 32);
  assert.deepEqual(Object.keys(mistakes).sort(), entries.map(entry => entry.slug).sort());
  const fixtures = entries.map(entry => ({
    slug: entry.slug, mode: entry.content.runtimeMode,
    ...entry.content.variants[0], mistake: mistakes[entry.slug],
  }));
  const runner = `import sys,json,copy,contextlib,io
entries=json.load(sys.stdin)
results=[]
for entry in entries:
    outcomes=[]
    for kind in ('solution','starter','mistake'):
        values=[]
        for case in entry['tests']:
            data=copy.deepcopy(case['input'])
            scope={}
            output=io.StringIO()
            with contextlib.redirect_stdout(output):
                if entry['mode']=='PROGRAM':
                    lines=iter(data.splitlines())
                    scope['input']=lambda: next(lines)
                    exec(entry[kind],scope)
                    value=output.getvalue()
                else:
                    exec(entry[kind],scope)
                    value=scope['solve'](data)
            assert data==case['input'], entry['slug']+': mutación en '+kind
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
    assert.notDeepEqual(values[index][1], expected, `${entry.slug}: plantilla ya resuelta`);
    assert.notDeepEqual(values[index][2], expected, `${entry.slug}: error no detectado`);
  }
});

test("iniciación explica la notación preparada y no certifica predicción o variables por el retorno", () => {
  const statement = (slug: string) => pythonCatalog.find(entry => entry.slug === slug)!.content.variants[0].statement!;
  assert.match(statement("logica-booleano"), /True.*Python/);
  for (const slug of ["logica-dos-parametros", "logica-perimetro", "logica-repara-presupuesto", "logica-merienda"]) {
    assert.match(statement(slug), /diccionario/, slug);
  }
  assert.match(statement("logica-predice-valores"), /no si hiciste primero la predicción/);
  assert.match(statement("logica-tabla-valores"), /no cómo guardaste los estados/);
  assert.doesNotMatch(statement("logica-tabla-valores"), /colecciones de hasta/);
});
