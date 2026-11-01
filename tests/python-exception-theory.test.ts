import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { pythonCatalog } from "../prisma/python-content";
import { pythonLessons } from "../prisma/python-lessons";
import { pythonReleaseFingerprint } from "../prisma/python-releases";
import { localTheoryContract } from "./python-local-theory-baseline";
import { beforePythonExceptionTheory, previousExceptionTheoryTasks } from "./python-exception-theory-baseline";

const reviewed = ["logica-localiza-error", "logica-captura-conversion", "logica-error-dominio", "logica-recupera-elementos", "logica-asercion-normal", "logica-pruebas-limites", "logica-reproduce-fallo", "logica-conserva-regresion", "logica-factorial", "logica-fizzbuzz", "logica-mediciones", "logica-carrito", "logica-notas", "logica-saldo", "logica-gastos-registro", "logica-gastos-validacion", "logica-repetido", "logica-deduplica", "logica-frecuencias", "logica-primer-unico", "logica-anagramas", "logica-agrupa-registros", "logica-inventario", "logica-importa-preparado"];
const content = (slug: string) => pythonCatalog.find(entry => entry.slug === slug)!.content;

test("la teoría local llega a 144 actividades: 24 comunes revisadas y dos párrafos ajustados", () => {
  const common = pythonCatalog.filter(entry => !pythonLessons.has(entry.slug));
  assert.deepEqual(common.slice(72, 96).map(entry => entry.slug), reviewed);
  assert.equal(common.length - 96, 80);
  assert.equal(new Set([...pythonLessons.keys(), ...common.slice(0, 96).map(entry => entry.slug)]).size, 144);
  assert.deepEqual(new Set(Object.keys(previousExceptionTheoryTasks)), new Set(["logica-localiza-error", "logica-conserva-regresion"]));
  for (const slug of reviewed) {
    const entry = content(slug);
    assert.equal(entry.runtimeMode, "FUNCTION", slug);
    assert.equal(entry.variants.length, 1, slug);
    assert.equal(entry.variants[0].statement, entry.statement, slug);
    assert.deepEqual([...entry.statement.matchAll(/^(Tu tarea|Entrada|Resultado esperado)\n/gm)].map(match => match[1]), ["Tu tarea", "Entrada", "Resultado esperado"], slug);
  }
});

test("las aperturas distinguen un riesgo de índice y explicitan la entrada y el resultado esperado", () => {
  assert.match(content("logica-localiza-error").statement, /Localiza un riesgo sin provocarlo: consultar valores\[indice\] sin comprobar límites puede lanzar una excepción/);
  assert.doesNotMatch(content("logica-localiza-error").statement, /fragmento conceptual/);
  assert.match(content("logica-conserva-regresion").statement, /la entrada \(total 10, limite 10\), que debe dar 8, y para \(total 0, limite 0\), que debe dar 0/);
  assert.doesNotMatch(content("logica-conserva-regresion").statement, /→/);
  assert.match(content("logica-captura-conversion").statement, /captura solo ese error desde solve/);
  assert.match(content("logica-saldo").statement, /no apliques la regla de saldo no negativo.*inventario|distinto de la acumulación por producto/s);
  assert.match(content("logica-inventario").statement, /permite saldos negativos.*no aplica la regla de saldo/s);
  assert.match(content("logica-importa-preparado").statement, /módulo es un archivo real.*from reglas import nombre/);
});

test("el cuarto lote común conserva todo salvo dos párrafos y reconstruye la entrega anterior", () => {
  const payload = pythonCatalog.map(entry => !(entry.slug in previousExceptionTheoryTasks) ? entry : ({ ...entry, content: {
    ...entry.content, statement: localTheoryContract(entry.content.statement),
    variants: entry.content.variants.map(variant => ({ ...variant, statement: localTheoryContract(variant.statement!) })),
  } }));
  // Calculada sobre la entrega anterior reconstruida: protege contratos, 22
  // consignas conservadas, ayudas y toda superficie ajena.
  assert.equal(createHash("sha256").update(JSON.stringify(payload)).digest("hex"), "3a0328cd3e110db8de1103f3144280550a7a7ca0f92bb708fc285a2b289bdf98");
  const previous = pythonCatalog.map(entry => ({ ...entry, content: beforePythonExceptionTheory(entry.slug, entry.content) }));
  assert.equal(pythonReleaseFingerprint(previous), "3278b3eb916e2dcdcdc1dc8d02e12b638976293e590401302a7aacf1ea695468");
});

test("modelos fijos confirman límites, errores, acumuladores y estructuras de conteo", () => {
  // Código fijo del repositorio: no ejecuta envíos de alumnos ni certifica
  // aislamiento, rendimiento o terminación de programas arbitrarios.
  const code = `def indice_seguro(valores, indice):
    if indice < 0 or indice >= len(valores):
        return "indice fuera de rango"
    return valores[indice]
assert indice_seguro([3], 0) == 3
assert indice_seguro([3], -1) == "indice fuera de rango"
assert indice_seguro([3], 1) == "indice fuera de rango"
assert indice_seguro([], 0) == "indice fuera de rango"
def convertir(texto):
    limpio = texto.strip()
    cuerpo = limpio[1:] if limpio[:1] in "+-" else limpio
    if not cuerpo or any(c not in "0123456789" for c in cuerpo):
        raise ValueError("formato")
    return int(limpio)
assert convertir(" +007 ") == 7 and convertir("-12") == -12
for malo in ("", "+", "1.0", "1e3", "1_0", "abc"):
    try:
        convertir(malo)
    except ValueError:
        pass
    else:
        raise AssertionError(malo)
def validar(edad):
    if edad < 0:
        raise ValueError("edad negativa")
    return "aceptada"
def mensaje(edad):
    try:
        return validar(edad)
    except ValueError as error:
        return str(error)
assert mensaje(-1) == "edad negativa" and mensaje(0) == "aceptada"
def recupera(textos):
    validos = []
    rechazados = 0
    for texto in textos:
        try:
            validos.append(convertir(texto))
        except ValueError:
            rechazados += 1
    return {"validos": validos, "rechazados": rechazados}
assert recupera(["1", "x", "2"]) == {"validos": [1, 2], "rechazados": 1}
def triple(n):
    return n * 3
assert triple(4) == 12
def factorial(n):
    producto = 1
    for i in range(1, n + 1):
        producto *= i
    return producto
assert [factorial(n) for n in (0, 1, 4)] == [1, 1, 24]
def fizzbuzz(n):
    salida = []
    for i in range(1, n + 1):
        if i % 15 == 0:
            salida.append("FizzBuzz")
        elif i % 3 == 0:
            salida.append("Fizz")
        elif i % 5 == 0:
            salida.append("Buzz")
        else:
            salida.append(i)
    return salida
assert fizzbuzz(0) == [] and fizzbuzz(15)[-1] == "FizzBuzz"
assert fizzbuzz(15)[2] == "Fizz" and fizzbuzz(15)[4] == "Buzz"
def mediciones(valores):
    total = 0
    positivos = 0
    mayor = None
    for valor in valores:
        total += valor
        if valor > 0:
            positivos += 1
        if mayor is None or valor > mayor:
            mayor = valor
    return {"total": total, "positivos": positivos, "mayor": mayor}
assert mediciones([]) == {"total": 0, "positivos": 0, "mayor": None}
assert mediciones([-2, 3, 3]) == {"total": 4, "positivos": 2, "mayor": 3}
def carrito(items, descuento):
    subtotal = sum(item["precio"] * item["cantidad"] for item in items)
    return subtotal * (100 - descuento) / 100
assert carrito([], 50) == 0
assert carrito([{"precio": 10, "cantidad": 2}], 10) == 18.0
assert carrito([{"precio": 5, "cantidad": 1}], 100) == 0.0
def notas(valores):
    aprobados = sum(1 for valor in valores if valor >= 5)
    media = sum(valores) / len(valores) if valores else None
    return {"aprobados": aprobados, "media": media}
assert notas([]) == {"aprobados": 0, "media": None}
assert notas([4, 5, 6]) == {"aprobados": 2, "media": 5.0}
def saldo(inicial, movimientos):
    actual = inicial
    rechazados = 0
    for movimiento in movimientos:
        candidato = actual + movimiento
        if candidato < 0:
            rechazados += 1
        else:
            actual = candidato
    return {"saldo": actual, "rechazados": rechazados}
assert saldo(10, [-10, -1]) == {"saldo": 0, "rechazados": 1}
assert saldo(0, [-1]) == {"saldo": 0, "rechazados": 1}
def gastos(fichas):
    total = 0
    por_categoria = {}
    rechazados = 0
    for ficha in fichas:
        categoria = ficha["categoria"]
        importe = ficha["importe"]
        if categoria not in ("casa", "ocio") or importe < 0:
            rechazados += 1
            continue
        total += importe
        por_categoria[categoria] = por_categoria.get(categoria, 0) + importe
    return {"total": total, "porCategoria": por_categoria, "rechazados": rechazados}
assert gastos([]) == {"total": 0, "porCategoria": {}, "rechazados": 0}
assert gastos([{"categoria": "casa", "importe": 0}, {"categoria": "otra", "importe": 5}]) == {"total": 0, "porCategoria": {"casa": 0}, "rechazados": 1}
def repetido(valores):
    vistos = set()
    for valor in valores:
        if valor in vistos:
            return True
        vistos.add(valor)
    return False
assert repetido([]) is False and repetido([1, 1]) is True and repetido([1, 2]) is False
def deduplica(valores):
    vistos = set()
    salida = []
    for valor in valores:
        if valor not in vistos:
            vistos.add(valor)
            salida.append(valor)
    return salida
assert deduplica([3, 1, 3, 2, 1]) == [3, 1, 2]
def frecuencias(texto):
    salida = {}
    for letra in texto:
        salida[letra] = salida.get(letra, 0) + 1
    return salida
assert frecuencias("") == {} and frecuencias("aba") == {"a": 2, "b": 1}
def primer_unico(texto):
    conteos = {}
    for letra in texto:
        conteos[letra] = conteos.get(letra, 0) + 1
    for letra in texto:
        if conteos[letra] == 1:
            return letra
    return None
assert primer_unico("abac") == "b" and primer_unico("aabb") is None
assert primer_unico("") is None
def anagramas(a, b):
    def tabla(texto):
        salida = {}
        for letra in texto.lower():
            if letra != " ":
                salida[letra] = salida.get(letra, 0) + 1
        return salida
    return tabla(a) == tabla(b)
assert anagramas("", "") is True and anagramas("  ", "") is True
assert anagramas("Amor", "Roma") is True and anagramas("a", "aa") is False
def agrupa(registros):
    salida = {}
    for registro in registros:
        salida.setdefault(registro["categoria"], []).append(registro["nombre"])
    return salida
assert agrupa([]) == {}
assert agrupa([{"categoria": "a", "nombre": "x"}, {"categoria": "b", "nombre": "y"}, {"categoria": "a", "nombre": "x"}]) == {"a": ["x", "x"], "b": ["y"]}
def inventario(movimientos):
    salida = {}
    for movimiento in movimientos:
        producto = movimiento["producto"]
        salida[producto] = salida.get(producto, 0) + movimiento["cambio"]
    return salida
assert inventario([]) == {}
assert inventario([{"producto": "a", "cambio": 5}, {"producto": "a", "cambio": -5}]) == {"a": 0}
assert inventario([{"producto": "a", "cambio": -2}]) == {"a": -2}
def transformar(n):
    return n * 4
assert transformar(-3) == -12
print("ok")`;
  const result = spawnSync(process.env.PYTHON_BIN ?? "python", ["-c", code], { encoding: "utf8", timeout: 30000 });
  assert.equal(result.error, undefined);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), "ok");
});
