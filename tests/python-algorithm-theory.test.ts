import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { pythonCatalog } from "../prisma/python-content";
import { pythonLessons } from "../prisma/python-lessons";
import { pythonReleaseFingerprint } from "../prisma/python-releases";

const reviewed = ["logica-arbol-busqueda", "logica-ancestro", "logica-monticulo-inserta", "logica-monticulo-extrae", "logica-prioridad", "logica-k-mayores", "logica-actividades", "logica-combina-archivos", "logica-potencia", "logica-mezcla", "logica-subconjuntos", "logica-permutaciones", "logica-combinaciones", "logica-reinas", "logica-fibonacci", "logica-escalera", "logica-caminos-obstaculos", "logica-monedas", "logica-mochila", "logica-subsecuencia-comun", "logica-adyacencia", "logica-alcanzables", "logica-distancias", "logica-ciclo-dirigido"];
const content = (slug: string) => pythonCatalog.find(entry => entry.slug === slug)!.content;

test("la teoría local llega a 216 actividades: otras 24 comunes conservadas tras contraste", () => {
  const common = pythonCatalog.filter(entry => !pythonLessons.has(entry.slug));
  assert.deepEqual(common.slice(144, 168).map(entry => entry.slug), reviewed);
  assert.equal(common.length - 168, 8);
  assert.equal(new Set([...pythonLessons.keys(), ...common.slice(0, 168).map(entry => entry.slug)]).size, 216);
  for (const slug of reviewed) {
    const entry = content(slug);
    assert.equal(entry.runtimeMode, "FUNCTION", slug);
    assert.equal(entry.variants.length, 1, slug);
    assert.equal(entry.variants[0].statement, entry.statement, slug);
    assert.deepEqual([...entry.statement.matchAll(/^(Tu tarea|Entrada|Resultado esperado)\n/gm)].map(match => match[1]), ["Tu tarea", "Entrada", "Resultado esperado"], slug);
    assert.ok(entry.hints.length >= 3, slug);
  }
});

test("los textos conservados mantienen límites de árboles, montículos, retroceso y grafos", () => {
  assert.match(content("logica-arbol-busqueda").statement, /Los límites de todos los antecesores importan, no solo los hijos inmediatos/);
  assert.match(content("logica-ancestro").statement, /Un nodo es ancestro de sí mismo.*a y b.*pueden ser iguales/s);
  assert.match(content("logica-monticulo-inserta").statement, /No intercambies iguales.*representación concreta/s);
  assert.match(content("logica-monticulo-extrae").statement, /En empate entre hijos elige el izquierdo; no intercambies iguales/);
  assert.match(content("logica-k-mayores").statement, /Para k igual a cero devuelve \[\].*si k es la longitud, incluye todos/s);
  assert.match(content("logica-actividades").statement, /Una actividad puede empezar justo cuando termina otra/);
  assert.match(content("logica-combina-archivos").statement, /tamaños abstractos: no necesitas abrir ni escribir archivos reales/);
  assert.match(content("logica-potencia").statement, /exponente cero devuelve 1, también si base es cero/);
  assert.match(content("logica-subconjuntos").statement, /empieza con \[\[\]\].*\[1, 2\].*\[\[\], \[1\], \[2\], \[1, 2\]\]/s);
  assert.match(content("logica-permutaciones").statement, /\[2, 10\] va antes de \[10, 2\]/);
  assert.match(content("logica-combinaciones").statement, /target cero devuelve \[\[\]\].*si no hay soluciones, devuelve \[\]/s);
  assert.match(content("logica-reinas").statement, /Cuenta las simetrías como soluciones diferentes/);
  assert.match(content("logica-escalera").statement, /\[1, 2\] y \[2, 1\] son distintas.*cero escalones.*devuelve 1/s);
  assert.match(content("logica-caminos-obstaculos").statement, /tampoco en el inicio o la meta.*Una única celda libre tiene un camino/s);
  assert.match(content("logica-monedas").statement, /amount cero devuelve 0 incluso sin denominaciones/);
  assert.match(content("logica-mochila").statement, /objetos de peso cero también pueden elegirse una vez cada uno, incluso con capacidad cero/);
  assert.match(content("logica-subsecuencia-comun").statement, /conserva el orden, pero puede saltar caracteres: no tiene que ser un tramo consecutivo/);
  assert.match(content("logica-adyacencia").statement, /aristas repetidas, incluso escritas al revés.*vecinos distintos.*orden numérico ascendente/s);
  assert.match(content("logica-alcanzables").statement, /incluido inicio.*una sola vez/s);
  assert.match(content("logica-distancias").statement, /mínima cantidad de aristas.*-1 si no se alcanza/s);
  assert.match(content("logica-ciclo-dirigido").statement, /Un lazo es un ciclo; compartir un descendiente no basta/);
});

test("el lote no cambia el catálogo y conserva la huella publicada", () => {
  assert.equal(pythonReleaseFingerprint(pythonCatalog), "c7720201bb98fc7c81aa6a646952ba7c73486200121d43d0f8292a9eaf7e9c29");
});

test("modelos fijos confirman árboles, montículos, retroceso, programación dinámica y grafos", () => {
  // Código fijo del repositorio: no ejecuta envíos de alumnos ni certifica
  // técnicas internas, rendimiento, complejidad o ausencia de toda mutación.
  const code = `def nodo(value, left=None, right=None):
    return {"value": value, "left": left, "right": right}

def es_bst(raiz, bajo=None, alto=None):
    if raiz is None:
        return True
    valor = raiz["value"]
    if (bajo is not None and valor <= bajo) or (alto is not None and valor >= alto):
        return False
    return es_bst(raiz["left"], bajo, valor) and es_bst(raiz["right"], valor, alto)
assert es_bst(None) and es_bst(nodo(2, nodo(1), nodo(3)))
assert not es_bst(nodo(2, nodo(1, nodo(4)), nodo(3)))
assert not es_bst(nodo(2, nodo(1), nodo(1)))

def lca(raiz, a, b):
    if raiz is None:
        return None
    if raiz["value"] in (a, b):
        return raiz["value"]
    izquierda = lca(raiz["left"], a, b)
    derecha = lca(raiz["right"], a, b)
    if izquierda is not None and derecha is not None:
        return raiz["value"]
    return izquierda if izquierda is not None else derecha
arbol = nodo(3, nodo(5, nodo(6), nodo(2, nodo(7), nodo(4))), nodo(1, nodo(0), nodo(8)))
assert lca(arbol, 5, 1) == 3 and lca(arbol, 5, 4) == 5
assert lca(arbol, 7, 4) == 2 and lca(arbol, 5, 5) == 5

def inserta(heap, value):
    salida = heap[:]
    salida.append(value)
    i = len(salida) - 1
    while i > 0:
        padre = (i - 1) // 2
        if salida[padre] <= salida[i]:
            break
        salida[padre], salida[i] = salida[i], salida[padre]
        i = padre
    return salida
assert inserta([1, 3, 5], 2) == [1, 2, 5, 3]
assert inserta([1, 3, 5], 3) == [1, 3, 5, 3]

def extrae(heap):
    if not heap:
        return {"minimo": None, "heap": []}
    salida = heap[:]
    minimo = salida[0]
    ultimo = salida.pop()
    if salida:
        salida[0] = ultimo
        i = 0
        while True:
            izquierda = 2 * i + 1
            derecha = 2 * i + 2
            menor = i
            if izquierda < len(salida) and salida[izquierda] < salida[menor]:
                menor = izquierda
            if derecha < len(salida) and salida[derecha] < salida[menor]:
                menor = derecha
            if menor == i:
                break
            salida[i], salida[menor] = salida[menor], salida[i]
            i = menor
    return {"minimo": minimo, "heap": salida}
assert extrae([]) == {"minimo": None, "heap": []}
assert extrae([1, 3, 5]) == {"minimo": 1, "heap": [3, 5]}
assert extrae([1, 2, 2, 3]) == {"minimo": 1, "heap": [2, 3, 2]}

def prioridad(tareas):
    return [tarea["id"] for tarea in sorted(tareas, key=lambda tarea: (tarea["prioridad"], tarea["id"]))]
assert prioridad([]) == []
assert prioridad([{"id": 2, "prioridad": 1}, {"id": 1, "prioridad": 1}, {"id": 3, "prioridad": 0}]) == [3, 1, 2]

def k_mayores(nums, k):
    if k == 0:
        return []
    import heapq
    candidatos = []
    for numero in nums:
        heapq.heappush(candidatos, numero)
        if len(candidatos) > k:
            heapq.heappop(candidatos)
    return sorted(candidatos, reverse=True)
assert k_mayores([1, 3, 2, 3], 2) == [3, 3]
assert k_mayores([1, 2], 0) == [] and k_mayores([1, 2], 2) == [2, 1]

def actividades(lista):
    ordenadas = sorted(lista, key=lambda actividad: actividad[1])
    fin = None
    total = 0
    for inicio, final in ordenadas:
        if fin is None or inicio >= fin:
            total += 1
            fin = final
    return total
assert actividades([]) == 0
assert actividades([[1, 3], [2, 4], [3, 5]]) == 2

def coste(tamanos):
    if len(tamanos) < 2:
        return 0
    import heapq
    pendientes = tamanos[:]
    heapq.heapify(pendientes)
    total = 0
    while len(pendientes) > 1:
        a = heapq.heappop(pendientes)
        b = heapq.heappop(pendientes)
        suma = a + b
        total += suma
        heapq.heappush(pendientes, suma)
    return total
assert coste([]) == 0 and coste([5]) == 0 and coste([1, 1, 1]) == 5

def potencia(base, exponente):
    resultado = 1
    factor = base
    while exponente > 0:
        if exponente % 2 == 1:
            resultado *= factor
        factor *= factor
        exponente //= 2
    return resultado
assert potencia(0, 0) == 1 and potencia(2, 10) == 1024 and potencia(0, 5) == 0

def mezcla(nums):
    if len(nums) <= 1:
        return nums[:]
    medio = len(nums) // 2
    izquierda = mezcla(nums[:medio])
    derecha = mezcla(nums[medio:])
    i = j = 0
    salida = []
    while i < len(izquierda) and j < len(derecha):
        if izquierda[i] <= derecha[j]:
            salida.append(izquierda[i])
            i += 1
        else:
            salida.append(derecha[j])
            j += 1
    return salida + izquierda[i:] + derecha[j:]
original = [3, -1, 3, 0]
assert mezcla(original) == [-1, 0, 3, 3] and original == [3, -1, 3, 0]

def subconjuntos(nums):
    salida = [[]]
    for numero in nums:
        salida += [parte + [numero] for parte in salida]
    return salida
assert subconjuntos([1, 2]) == [[], [1], [2], [1, 2]]
assert subconjuntos([]) == [[]]

def permutaciones(nums):
    if not nums:
        return [[]]
    salida = []
    for i, numero in enumerate(nums):
        resto = nums[:i] + nums[i + 1:]
        for parte in permutaciones(resto):
            salida.append([numero] + parte)
    return salida
assert permutaciones([]) == [[]]
assert permutaciones([2, 10]) == [[2, 10], [10, 2]]

def combinaciones(nums, objetivo):
    candidatos = sorted(nums)
    salida = []
    def explorar(indice, resto, actual):
        if resto == 0:
            salida.append(actual[:])
            return
        if resto < 0:
            return
        for j in range(indice, len(candidatos)):
            actual.append(candidatos[j])
            explorar(j + 1, resto - candidatos[j], actual)
            actual.pop()
    explorar(0, objetivo, [])
    return salida
assert combinaciones([], 0) == [[]]
assert combinaciones([2, 3, 5], 5) == [[2, 3], [5]]
assert combinaciones([1, 2], 9) == []

def reinas(n):
    total = 0
    def colocar(fila, columnas, diagonales1, diagonales2):
        nonlocal total
        if fila == n:
            total += 1
            return
        for columna in range(n):
            if columna in columnas or fila - columna in diagonales1 or fila + columna in diagonales2:
                continue
            colocar(fila + 1, columnas | {columna}, diagonales1 | {fila - columna}, diagonales2 | {fila + columna})
    colocar(0, set(), set(), set())
    return total
assert reinas(1) == 1 and reinas(2) == 0
assert reinas(4) == 2 and reinas(8) == 92

def fib(n, memo=None):
    if memo is None:
        memo = {}
    if n < 2:
        return n
    if n in memo:
        return memo[n]
    memo[n] = fib(n - 1, memo) + fib(n - 2, memo)
    return memo[n]
assert [fib(n) for n in (0, 1, 10)] == [0, 1, 55]

def escalera(n):
    if n <= 1:
        return 1
    a, b = 1, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b
assert [escalera(n) for n in (0, 1, 2, 3)] == [1, 1, 2, 3]

def caminos(matriz):
    if not matriz or matriz[0][0] == 1:
        return 0
    columnas = len(matriz[0])
    dp = [0] * columnas
    dp[0] = 1
    for i in range(len(matriz)):
        for j in range(columnas):
            if matriz[i][j] == 1:
                dp[j] = 0
            elif j > 0:
                dp[j] += dp[j - 1]
    return dp[-1]
assert caminos([[0]]) == 1 and caminos([[1]]) == 0
assert caminos([[0, 0], [0, 0]]) == 2
assert caminos([[0, 1], [0, 0]]) == 1
assert caminos([[0, 0], [0, 1]]) == 0

def monedas(coins, amount):
    infinito = amount + 1
    dp = [0] + [infinito] * amount
    for valor in range(1, amount + 1):
        for moneda in coins:
            if moneda <= valor:
                dp[valor] = min(dp[valor], dp[valor - moneda] + 1)
    return -1 if dp[amount] > amount else dp[amount]
assert monedas([], 0) == 0 and monedas([2], 3) == -1
assert monedas([1, 2, 5], 11) == 3

def mochila(pesos, valores, capacidad):
    dp = [0] * (capacidad + 1)
    for peso, valor in zip(pesos, valores):
        if peso == 0:
            for w in range(capacidad + 1):
                dp[w] += valor
        else:
            for w in range(capacidad, peso - 1, -1):
                dp[w] = max(dp[w], dp[w - peso] + valor)
    return dp[capacidad]
assert mochila([], [], 0) == 0
assert mochila([1, 2], [1, 2], 2) == 2
assert mochila([0, 0], [3, 4], 0) == 7

def subsecuencia(a, b):
    dp = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]
    for i in range(1, len(a) + 1):
        for j in range(1, len(b) + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[-1][-1]
assert subsecuencia("", "") == 0 and subsecuencia("abc", "abc") == 3
assert subsecuencia("abc", "ac") == 2

def adyacencia(n, aristas):
    vecinos = [set() for _ in range(n)]
    for a, b in aristas:
        vecinos[a].add(b)
        vecinos[b].add(a)
    return [sorted(lista) for lista in vecinos]
assert adyacencia(3, [[0, 1], [1, 0], [1, 2]]) == [[1], [0, 2], [1]]
assert adyacencia(2, []) == [[], []]

def alcanzables(n, aristas, inicio):
    vecinos = [[] for _ in range(n)]
    for a, b in aristas:
        vecinos[a].append(b)
        vecinos[b].append(a)
    vistos = {inicio}
    pendientes = [inicio]
    while pendientes:
        actual = pendientes.pop()
        for vecino in vecinos[actual]:
            if vecino not in vistos:
                vistos.add(vecino)
                pendientes.append(vecino)
    return sorted(vistos)
assert alcanzables(3, [], 0) == [0]
assert alcanzables(4, [[0, 1], [2, 3]], 0) == [0, 1]
assert alcanzables(3, [[0, 1], [1, 2]], 0) == [0, 1, 2]

def distancias(n, aristas, inicio):
    vecinos = [[] for _ in range(n)]
    for a, b in aristas:
        vecinos[a].append(b)
        vecinos[b].append(a)
    distancia = [-1] * n
    distancia[inicio] = 0
    pendientes = [inicio]
    while pendientes:
        actual = pendientes.pop(0)
        for vecino in vecinos[actual]:
            if distancia[vecino] == -1:
                distancia[vecino] = distancia[actual] + 1
                pendientes.append(vecino)
    return distancia
assert distancias(3, [], 0) == [0, -1, -1]
assert distancias(3, [[0, 1], [1, 2]], 0) == [0, 1, 2]
assert distancias(4, [[0, 1], [0, 2], [1, 3], [2, 3]], 0) == [0, 1, 1, 2]

def ciclo(n, aristas):
    vecinos = [[] for _ in range(n)]
    for a, b in aristas:
        vecinos[a].append(b)
    estado = [0] * n
    def visitar(nodo):
        estado[nodo] = 1
        for vecino in vecinos[nodo]:
            if estado[vecino] == 1:
                return True
            if estado[vecino] == 0 and visitar(vecino):
                return True
        estado[nodo] = 2
        return False
    for i in range(n):
        if estado[i] == 0 and visitar(i):
            return True
    return False
assert ciclo(0, []) is False
assert ciclo(1, [[0, 0]]) is True
assert ciclo(3, [[0, 1], [1, 2]]) is False
assert ciclo(3, [[0, 1], [1, 2], [2, 0]]) is True
print("ok")`;
  const result = spawnSync(process.env.PYTHON_BIN ?? "python", ["-c", code], { encoding: "utf8", timeout: 30000 });
  assert.equal(result.error, undefined);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), "ok");
});
