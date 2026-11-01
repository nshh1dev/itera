import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { pythonCatalog } from "../prisma/python-content";
import { pythonLessons } from "../prisma/python-lessons";
import { pythonReleaseFingerprint } from "../prisma/python-releases";

const reviewed = ["logica-ventana-fija", "logica-ventana-suma", "logica-celda", "logica-filas", "logica-columnas", "logica-diagonales", "logica-transpuesta", "logica-vecinos", "logica-copia-anidada", "logica-pila", "logica-cola", "logica-delimitadores", "logica-deshacer", "logica-suma-recursiva", "logica-busqueda-recursiva", "logica-une-intervalos", "logica-segundo-maximo", "logica-suma-maxima", "logica-sin-repeticiones", "logica-ranking", "logica-cuenta-nodos", "logica-altura", "logica-preorden", "logica-niveles"];
const content = (slug: string) => pythonCatalog.find(entry => entry.slug === slug)!.content;

test("la teoría local llega a 192 actividades: otras 24 comunes conservadas tras contraste", () => {
  const common = pythonCatalog.filter(entry => !pythonLessons.has(entry.slug));
  assert.deepEqual(common.slice(120, 144).map(entry => entry.slug), reviewed);
  assert.equal(common.length - 144, 32);
  assert.equal(new Set([...pythonLessons.keys(), ...common.slice(0, 144).map(entry => entry.slug)]).size, 192);
  for (const slug of reviewed) {
    const entry = content(slug);
    assert.equal(entry.runtimeMode, "FUNCTION", slug);
    assert.equal(entry.variants.length, 1, slug);
    assert.equal(entry.variants[0].statement, entry.statement, slug);
    assert.deepEqual([...entry.statement.matchAll(/^(Tu tarea|Entrada|Resultado esperado)\n/gm)].map(match => match[1]), ["Tu tarea", "Entrada", "Resultado esperado"], slug);
    assert.ok(entry.hints.length >= 3, slug);
  }
});

test("los textos conservados mantienen las precisiones de ventanas, matrices, estructuras y árboles", () => {
  assert.match(content("logica-ventana-fija").statement, /Los valores pueden ser negativos: no se permite elegir un tramo vacío/);
  assert.match(content("logica-ventana-suma").statement, /Alcanzar significa sumar al menos el objetivo, no necesariamente igualarlo/);
  assert.match(content("logica-celda").statement, /no la fila completa ni sus índices/);
  assert.match(content("logica-columnas").statement, /no las sumas de las filas/);
  assert.match(content("logica-vecinos").statement, /no incluyas diagonales ni la propia celda/);
  assert.match(content("logica-copia-anidada").statement, /Copiar únicamente el contenedor exterior con list o slice no basta/);
  assert.match(content("logica-pila").statement, /el último valor en entrar es el primero en salir \(LIFO\)/);
  assert.match(content("logica-cola").statement, /el primer valor en entrar es el primero en salir \(FIFO\)/);
  assert.match(content("logica-delimitadores").statement, /Tener la misma cantidad de aperturas y cierres no basta/);
  assert.match(content("logica-suma-recursiva").statement, /Los casos evalúan el total, no certifican que se haya usado recursión/);
  assert.match(content("logica-une-intervalos").statement, /Los intervalos que comparten un extremo también se fusionan/);
  assert.match(content("logica-suma-maxima").statement, /Si todos los valores son negativos, el resultado también es negativo/);
  assert.match(content("logica-sin-repeticiones").statement, /incluidos espacios y signos/);
  assert.match(content("logica-ranking").statement, /también con negativos/);
  assert.match(content("logica-cuenta-nodos").statement, /cuenta los nodos, no la cantidad de valores distintos/);
  assert.match(content("logica-altura").statement, /contando nodos, no enlaces/);
  assert.match(content("logica-preorden").statement, /raíz, después todos los del subárbol izquierdo/);
  assert.match(content("logica-niveles").statement, /de izquierda a derecha dentro de cada nivel/);
});

test("el lote no cambia el catálogo y conserva la huella publicada", () => {
  // Sin ediciones: la huella completa debe seguir siendo la de la entrega anterior.
  assert.equal(pythonReleaseFingerprint(pythonCatalog), "c7720201bb98fc7c81aa6a646952ba7c73486200121d43d0f8292a9eaf7e9c29");
});

test("modelos fijos confirman ventanas, matrices, pilas, recursión, intervalos y árboles", () => {
  // Código fijo del repositorio: no ejecuta envíos de alumnos ni certifica
  // técnicas internas, rendimiento o ausencia de toda mutación intermedia.
  const code = `def ventana(nums, k):
    actual = sum(nums[:k])
    mejor = actual
    for i in range(k, len(nums)):
        actual += nums[i] - nums[i - k]
        mejor = max(mejor, actual)
    return mejor
assert ventana([-3, -1, -2], 1) == -1 and ventana([2, 3, -1], 2) == 5

def ventana_minima(nums, objetivo):
    izquierda = 0
    total = 0
    mejor = len(nums) + 1
    for derecha, numero in enumerate(nums):
        total += numero
        while total >= objetivo:
            mejor = min(mejor, derecha - izquierda + 1)
            total -= nums[izquierda]
            izquierda += 1
    return 0 if mejor > len(nums) else mejor
assert ventana_minima([], 3) == 0
assert ventana_minima([2, 3, 1, 2, 4, 3], 7) == 2
assert ventana_minima([1, 1], 3) == 0

matriz = [[1, 2], [3, 4]]
assert matriz[1][0] == 3
assert [sum(fila) for fila in matriz] == [3, 7]
assert [sum(matriz[i][j] for i in range(len(matriz))) for j in range(len(matriz[0]))] == [4, 6]
assert {"principal": [matriz[i][i] for i in range(2)], "secundaria": [matriz[i][1 - i] for i in range(2)]} == {"principal": [1, 4], "secundaria": [2, 3]}
assert [[matriz[i][j] for i in range(2)] for j in range(2)] == [[1, 3], [2, 4]]

def vecinos(m):
    if not m:
        return []
    filas, columnas = len(m), len(m[0])
    salida = []
    for i in range(filas):
        fila = []
        for j in range(columnas):
            total = 0
            for di, dj in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                ni, nj = i + di, j + dj
                if 0 <= ni < filas and 0 <= nj < columnas:
                    total += m[ni][nj]
            fila.append(total)
        salida.append(fila)
    return salida
assert vecinos([]) == [] and vecinos([[1, 1], [1, 1]]) == [[2, 2], [2, 2]]

original = [[1, 2], [3, 4]]
copia = [fila[:] for fila in original]
copia[0][0] = 9
assert original == [[1, 2], [3, 4]] and copia == [[9, 2], [3, 4]]
assert copia is not original and copia[0] is not original[0]

def pila(operaciones):
    datos = []
    salida = []
    for operacion in operaciones:
        if operacion[0] == "push":
            datos.append(operacion[1])
        elif datos:
            salida.append(datos.pop())
    return salida
assert pila([["push", 1], ["push", 2], ["pop"], ["pop"], ["pop"]]) == [2, 1]

def cola(operaciones):
    datos = []
    salida = []
    for operacion in operaciones:
        if operacion[0] == "push":
            datos.append(operacion[1])
        elif datos:
            salida.append(datos.pop(0))
    return salida
assert cola([["push", 1], ["push", 2], ["pop"], ["pop"], ["pop"]]) == [1, 2]

def equilibrado(texto):
    pares = {")": "(", "]": "[", "}": "{"}
    pendientes = []
    for caracter in texto:
        if caracter in "([{":
            pendientes.append(caracter)
        elif caracter in pares:
            if not pendientes or pendientes.pop() != pares[caracter]:
                return False
    return not pendientes
assert equilibrado("") and equilibrado("([{}])")
assert not equilibrado("([)]") and not equilibrado("(")

def deshacer(operaciones):
    valor = 0
    historial = []
    for operacion in operaciones:
        if operacion[0] == "sumar":
            historial.append(valor)
            valor += operacion[1]
        elif historial:
            valor = historial.pop()
    return valor
assert deshacer([]) == 0
assert deshacer([["sumar", 5], ["sumar", 2], ["deshacer"], ["deshacer"], ["deshacer"]]) == 0

def suma(nums):
    return 0 if not nums else nums[0] + suma(nums[1:])
assert suma([]) == 0 and suma([1, -1, 2]) == 2

def busca(nums, objetivo, izquierda=0, derecha=None):
    if derecha is None:
        derecha = len(nums) - 1
    if izquierda > derecha:
        return -1
    centro = (izquierda + derecha) // 2
    if nums[centro] == objetivo:
        return centro
    if nums[centro] < objetivo:
        return busca(nums, objetivo, centro + 1, derecha)
    return busca(nums, objetivo, izquierda, centro - 1)
assert busca([1, 3, 5], 5) == 2 and busca([], 5) == -1
assert busca([1, 3, 5], 4) == -1

def fusiona(intervalos):
    if not intervalos:
        return []
    ordenados = sorted(intervalos)
    salida = [ordenados[0][:]]
    for inicio, fin in ordenados[1:]:
        if inicio <= salida[-1][1]:
            salida[-1][1] = max(salida[-1][1], fin)
        else:
            salida.append([inicio, fin])
    return salida
assert fusiona([]) == []
assert fusiona([[1, 2], [2, 3], [4, 4]]) == [[1, 3], [4, 4]]

def segundo(nums):
    mayor = None
    segundo_mayor = None
    for numero in nums:
        if mayor is None or numero > mayor:
            segundo_mayor = mayor
            mayor = numero
        elif numero != mayor and (segundo_mayor is None or numero > segundo_mayor):
            segundo_mayor = numero
    return segundo_mayor
assert segundo([]) is None and segundo([5]) is None and segundo([5, 5]) is None
assert segundo([-3, -1, -2]) == -2 and segundo([4, 2, 4]) == 2

def mayor_suma(nums):
    actual = mejor = nums[0]
    for numero in nums[1:]:
        actual = max(numero, actual + numero)
        mejor = max(mejor, actual)
    return mejor
assert mayor_suma([-3, -1, -2]) == -1 and mayor_suma([2, -1, 2]) == 3

def sin_repetir(texto):
    ultimo = {}
    izquierda = 0
    mejor = 0
    for derecha, caracter in enumerate(texto):
        if caracter in ultimo and ultimo[caracter] >= izquierda:
            izquierda = ultimo[caracter] + 1
        ultimo[caracter] = derecha
        mejor = max(mejor, derecha - izquierda + 1)
    return mejor
assert sin_repetir("") == 0 and sin_repetir("abcabcbb") == 3 and sin_repetir("abba") == 2

def ranking(nums):
    from collections import Counter
    conteos = Counter(nums)
    return sorted(conteos, key=lambda valor: (-conteos[valor], valor))
assert ranking([]) == [] and ranking([4, 2, 4, 2, 7]) == [2, 4, 7]
assert ranking([-1, -1, 2]) == [-1, 2]

def nodo(value, left=None, right=None):
    return {"value": value, "left": left, "right": right}
arbol = nodo(1, nodo(2, nodo(4)), nodo(3, None, nodo(5)))
def cuenta(raiz):
    return 0 if raiz is None else 1 + cuenta(raiz["left"]) + cuenta(raiz["right"])
def altura(raiz):
    return 0 if raiz is None else 1 + max(altura(raiz["left"]), altura(raiz["right"]))
def preorden(raiz):
    if raiz is None:
        return []
    return [raiz["value"]] + preorden(raiz["left"]) + preorden(raiz["right"])
def niveles(raiz):
    if raiz is None:
        return []
    salida = []
    pendientes = [raiz]
    while pendientes:
        actual = pendientes.pop(0)
        salida.append(actual["value"])
        if actual["left"] is not None:
            pendientes.append(actual["left"])
        if actual["right"] is not None:
            pendientes.append(actual["right"])
    return salida
assert cuenta(arbol) == 5 and cuenta(None) == 0
assert altura(arbol) == 3 and altura(None) == 0 and altura(nodo(7)) == 1
assert preorden(arbol) == [1, 2, 4, 3, 5] and preorden(None) == []
assert niveles(arbol) == [1, 2, 3, 4, 5] and niveles(None) == []
print("ok")`;
  const result = spawnSync(process.env.PYTHON_BIN ?? "python", ["-c", code], { encoding: "utf8", timeout: 30000 });
  assert.equal(result.error, undefined);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), "ok");
});
