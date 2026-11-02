import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { pythonCatalog } from "../prisma/python-content";
import { pythonLessons } from "../prisma/python-lessons";
import { pythonReleaseFingerprint } from "../prisma/python-releases";
import { beforePythonFileTheory, previousFileTheoryHints } from "./python-file-theory-baseline";
import { beforePythonExampleReview } from "./python-example-review-baseline";

const reviewed = ["logica-extrae-modulo", "logica-separa-reglas-io", "logica-repara-importacion", "logica-organiza-modulos", "logica-lee-archivo", "logica-escribe-archivo", "logica-valida-json", "logica-guarda-recupera", "logica-recupera-archivo-invalido", "logica-actualiza-persistidos", "logica-inventario-modular", "logica-inventario-persistente", "logica-agenda-operaciones", "logica-agenda-almacenamiento", "logica-agenda-regresion", "logica-busqueda-binaria", "logica-insercion-posicion", "logica-ordena-insercion", "logica-ordena-registros", "logica-combina", "logica-palindromo", "logica-pareja", "logica-prefijos", "logica-intervalos-suma"];
const content = (slug: string) => pythonCatalog.find(entry => entry.slug === slug)!.content;

test("la teoría local llega a 168 actividades: 24 comunes revisadas y una pista Python ajustada", () => {
  const common = pythonCatalog.filter(entry => !pythonLessons.has(entry.slug));
  assert.deepEqual(common.slice(96, 120).map(entry => entry.slug), reviewed);
  assert.equal(common.length - 120, 56);
  assert.equal(new Set([...pythonLessons.keys(), ...common.slice(0, 120).map(entry => entry.slug)]).size, 168);
  assert.deepEqual(new Set(Object.keys(previousFileTheoryHints)), new Set(["logica-lee-archivo"]));
  for (const slug of reviewed) {
    const entry = content(slug);
    assert.equal(entry.runtimeMode, "FUNCTION", slug);
    assert.equal(entry.variants.length, 1, slug);
    assert.equal(entry.variants[0].statement, entry.statement, slug);
    assert.deepEqual([...entry.statement.matchAll(/^(Tu tarea|Entrada|Resultado esperado)\n/gm)].map(match => match[1]), ["Tu tarea", "Entrada", "Resultado esperado"], slug);
  }
});

test("la pista de lectura evita normalizar índices que Python ya admite y conserva el resto", () => {
  assert.match(content("logica-lee-archivo").hints[2], /en Python, -1 apunta a la última línea/);
  assert.doesNotMatch(content("logica-lee-archivo").hints[2], /tu lenguaje/);
  assert.deepEqual(content("logica-lee-archivo").hints.slice(0, 2), ["Abre datos.txt dentro de solve.", "Separa las líneas y elimina el salto final."]);
  assert.match(content("logica-repara-importacion").statement, /nombre no exportado.*no sustituyas un módulo local por un paquete/s);
  assert.match(content("logica-valida-json").statement, /Un booleano no es un límite válido, aunque bool sea subclase de int/);
  assert.match(content("logica-guarda-recupera").statement, /mismo proceso, no una prueba de persistencia entre procesos o envíos/);
  assert.match(content("logica-actualiza-persistidos").statement, /no promete persistencia entre procesos, durabilidad ante fallos ni escritura atómica/);
  assert.match(content("logica-inventario-modular").statement, /No es la actividad inventario que solo suma cambios y admite negativos/);
  assert.match(content("logica-inventario-persistente").statement, /Persistencia entre procesos.*proceso nuevo/s);
  assert.match(content("logica-agenda-regresion").statement, /completar dos veces sin duplicar ni borrar/);
  assert.match(content("logica-busqueda-binaria").statement, /Devuelve el índice de target o -1.*No devuelvas el valor/s);
  assert.match(content("logica-intervalos-suma").statement, /suma de cada intervalo en el orden de las consultas.*inicio igual a fin contiene ese elemento/s);
});

test("el quinto lote común conserva todo salvo una pista y reconstruye la entrega anterior", () => {
  const payload = pythonCatalog.map(entry => ({ ...entry, content: beforePythonExampleReview(entry.slug, entry.content) })).map(entry => entry.slug !== "logica-lee-archivo" ? entry : ({ ...entry, content: {
    ...entry.content, hints: entry.content.hints.map((hint, index) => index === 2 ? "" : hint),
  } }));
  // Calculada antes de editar: protege enunciados, contratos, las otras dos
  // pistas y toda superficie ajena, incluidas las fuentes comunes multilingües.
  assert.equal(createHash("sha256").update(JSON.stringify(payload)).digest("hex"), "dde974fdbc5b2fa6e8de820b4029aecb43ccb54a32abc12f756b5671edce7731");
  const previous = pythonCatalog.map(entry => ({ ...entry, content: beforePythonFileTheory(entry.slug, entry.content) }));
  assert.equal(pythonReleaseFingerprint(previous), "905a668e2a27773c6ab69b34a67786610d9961bc5aff41dae005e2a4989571a3");
});

test("modelos fijos confirman módulos, archivos, JSON, persistencia y algoritmos de índices", () => {
  // Código fijo del repositorio con directorios temporales propios; no ejecuta
  // envíos de alumnos ni promete persistencia entre procesos o escritura atómica.
  const code = `import json, os, sys, tempfile

lineas = "Sol\\nLuna\\n".splitlines()
assert lineas[-1] == "Luna"
assert json.dumps([1, -2, 3], ensure_ascii=False, separators=(",", ":")) == "[1,-2,3]"

def limite_valido(valor):
    return type(valor) is int and valor >= 0
assert limite_valido(0) and not limite_valido(True) and not limite_valido(-1) and not limite_valido("3")

with tempfile.TemporaryDirectory() as tmp:
    with open(os.path.join(tmp, "reglas.py"), "w", encoding="utf-8") as archivo:
        archivo.write("def cuadrado(n):\\n    return n * n\\n")
    sys.path.insert(0, tmp)
    try:
        from reglas import cuadrado
        assert cuadrado(-3) == 9
        try:
            from reglas import transformarCuadrado
        except ImportError:
            pass
        else:
            raise AssertionError("nombre inexistente")
    finally:
        sys.path.remove(tmp)
        sys.modules.pop("reglas", None)

def recupera(ruta):
    try:
        with open(ruta, encoding="utf-8") as archivo:
            return json.load(archivo)
    except (FileNotFoundError, json.JSONDecodeError):
        return 0
with tempfile.TemporaryDirectory() as tmp:
    falta = os.path.join(tmp, "falta.json")
    roto = os.path.join(tmp, "roto.json")
    valido = os.path.join(tmp, "valido.json")
    with open(roto, "w", encoding="utf-8") as archivo:
        archivo.write("no json")
    with open(valido, "w", encoding="utf-8") as archivo:
        archivo.write("7")
    assert recupera(falta) == 0 and recupera(roto) == 0 and recupera(valido) == 7

def aplicar(stock, movimientos):
    rechazados = 0
    for movimiento in movimientos:
        actual = stock.get(movimiento["producto"], 0)
        candidato = actual + movimiento["cambio"]
        if candidato < 0:
            rechazados += 1
        else:
            stock[movimiento["producto"]] = candidato
    return rechazados
stock = {}
assert aplicar(stock, [{"producto": "pan", "cambio": 2}, {"producto": "pan", "cambio": -3}]) == 1
assert stock == {"pan": 2}
assert aplicar(stock, [{"producto": "sal", "cambio": 0}]) == 0
assert stock == {"pan": 2, "sal": 0} and list(stock) == ["pan", "sal"]

def agenda(tareas, comandos):
    for comando in comandos:
        if comando["accion"] == "crear":
            tareas.append({"titulo": comando["titulo"], "hecha": False})
        elif comando["accion"] == "completar":
            for tarea in tareas:
                if tarea["titulo"] == comando["titulo"]:
                    tarea["hecha"] = True
    return tareas
tareas = []
agenda(tareas, [{"accion": "crear", "titulo": "leer"}, {"accion": "completar", "titulo": "leer"}, {"accion": "completar", "titulo": "leer"}])
assert tareas == [{"titulo": "leer", "hecha": True}]
assert agenda([], [{"accion": "completar", "titulo": "x"}]) == []

def busqueda(nums, objetivo):
    izquierda, derecha = 0, len(nums) - 1
    while izquierda <= derecha:
        centro = (izquierda + derecha) // 2
        if nums[centro] == objetivo:
            return centro
        if nums[centro] < objetivo:
            izquierda = centro + 1
        else:
            derecha = centro - 1
    return -1
assert busqueda([1, 3, 5], 5) == 2 and busqueda([], 5) == -1
assert busqueda([1, 3, 5], 4) == -1

def insercion(nums, objetivo):
    izquierda, derecha = 0, len(nums)
    while izquierda < derecha:
        centro = (izquierda + derecha) // 2
        if nums[centro] < objetivo:
            izquierda = centro + 1
        else:
            derecha = centro
    return izquierda
assert insercion([1, 2, 2, 4], 2) == 1 and insercion([], 3) == 0 and insercion([1, 2], 5) == 2

def ordena(nums):
    salida = list(nums)
    for i in range(1, len(salida)):
        valor = salida[i]
        j = i - 1
        while j >= 0 and salida[j] > valor:
            salida[j + 1] = salida[j]
            j -= 1
        salida[j + 1] = valor
    return salida
original = [3, -1, 3, 0]
assert ordena(original) == [-1, 0, 3, 3] and original == [3, -1, 3, 0]
registros = [{"nombre": "b", "puntos": 2}, {"nombre": "a", "puntos": 2}, {"nombre": "c", "puntos": 3}, {"nombre": "a", "puntos": 2}]
assert [r["nombre"] for r in sorted(registros, key=lambda r: (-r["puntos"], r["nombre"]))] == ["c", "a", "a", "b"]

def combina(a, b):
    i = j = 0
    salida = []
    while i < len(a) and j < len(b):
        if a[i] <= b[j]:
            salida.append(a[i])
            i += 1
        else:
            salida.append(b[j])
            j += 1
    return salida + a[i:] + b[j:]
assert combina([1, 3], [2, 3]) == [1, 2, 3, 3]

def palindromo(texto):
    i, j = 0, len(texto) - 1
    while i < j:
        if texto[i] != texto[j]:
            return False
        i += 1
        j -= 1
    return True
assert palindromo("") and palindromo("ana") and palindromo("a,b,a")
assert palindromo("Ana") is False and palindromo("ab") is False

def pareja(nums, objetivo):
    i, j = 0, len(nums) - 1
    while i < j:
        suma = nums[i] + nums[j]
        if suma == objetivo:
            return [i, j]
        if suma < objetivo:
            i += 1
        else:
            j -= 1
    return []
assert pareja([1, 2, 3, 4, 6], 8) == [1, 4]
assert pareja([1, 2], 3) == [0, 1] and pareja([1], 2) == []

def prefijos(nums):
    salida = [0]
    for numero in nums:
        salida.append(salida[-1] + numero)
    return salida
assert prefijos([]) == [0] and prefijos([2, -1, 3]) == [0, 2, 1, 4]

def suma_intervalos(nums, consultas):
    acumulados = prefijos(nums)
    return [acumulados[fin + 1] - acumulados[inicio] for inicio, fin in consultas]
assert suma_intervalos([1, 2, 3], [[0, 0], [0, 2], [1, 2]]) == [1, 6, 5]
assert suma_intervalos([], []) == []

with tempfile.TemporaryDirectory() as tmp:
    ruta = os.path.join(tmp, "guardado.json")
    with open(ruta, "w", encoding="utf-8") as archivo:
        json.dump([1, 2], archivo, ensure_ascii=False, separators=(",", ":"))
    with open(ruta, encoding="utf-8") as archivo:
        assert json.load(archivo) == [1, 2]
    with open(ruta, encoding="utf-8") as archivo:
        assert archivo.read() == "[1,2]"
print("ok")`;
  const result = spawnSync(process.env.PYTHON_BIN ?? "python", ["-c", code], { encoding: "utf8", timeout: 30000 });
  assert.equal(result.error, undefined);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), "ok");
});
