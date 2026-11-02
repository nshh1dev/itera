import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { pythonCatalog } from "../prisma/python-content";
import { pythonLessons } from "../prisma/python-lessons";
import { pythonReleaseFingerprint } from "../prisma/python-releases";
import { beforePythonExampleReview } from "./python-example-review-baseline";

const reviewed = ["logica-dependencias", "logica-dijkstra", "logica-islas", "logica-laberinto", "logica-capacidad", "logica-edicion", "logica-subsecuencia-creciente", "logica-planifica-tareas"];
const content = (slug: string) => pythonCatalog.find(entry => entry.slug === slug)!.content;

test("las ocho comunes finales completan el inventario de teoría local de 224 actividades", () => {
  const common = pythonCatalog.filter(entry => !pythonLessons.has(entry.slug));
  assert.deepEqual(common.slice(168).map(entry => entry.slug), reviewed);
  assert.equal(pythonLessons.size, 48);
  assert.equal(common.length, 176);
  assert.equal(new Set([...pythonLessons.keys(), ...common.map(entry => entry.slug)]).size, 224);
  assert.equal(pythonCatalog.length, 224);
  for (const slug of reviewed) {
    const entry = content(slug);
    assert.equal(entry.runtimeMode, "FUNCTION", slug);
    assert.equal(entry.variants.length, 1, slug);
    assert.equal(entry.variants[0].statement, entry.statement, slug);
    assert.deepEqual([...entry.statement.matchAll(/^(Tu tarea|Entrada|Resultado esperado)\n/gm)].map(match => match[1]), ["Tu tarea", "Entrada", "Resultado esperado"], slug);
    assert.equal(entry.hints.length, 3, slug);
  }
});

test("la teoría final conserva las fronteras que distinguen cada problema", () => {
  assert.match(content("logica-dependencias").statement, /incluidas las recién liberadas.*Si hay un ciclo, devuelve \[\] en vez de un orden parcial/s);
  assert.match(content("logica-dijkstra").statement, /menor suma de pesos.*no la cantidad de aristas/s);
  assert.match(content("logica-islas").statement, /las diagonales no conectan islas.*No modifiques la cuadrícula/s);
  assert.match(content("logica-laberinto").statement, /alguna esquina es un muro.*una única celda libre devuelve 0/s);
  assert.match(content("logica-capacidad").statement, /orden original, sin dividir ningún paquete.*como máximo dias días.*No es necesario usar todos/s);
  assert.match(content("logica-edicion").statement, /No se permite intercambiar caracteres como una sola operación/);
  assert.match(content("logica-subsecuencia-creciente").statement, /conserva su orden original.*los valores iguales no prolongan/s);
  assert.match(content("logica-planifica-tareas").statement, /paralelismo ilimitado.*No sumes duraciones.*una duración cero sigue respetando las dependencias/s);
});

test("el cierre del inventario teórico no modifica el catálogo ni su huella", () => {
  const previous = pythonCatalog.map(entry => ({ ...entry, content: beforePythonExampleReview(entry.slug, entry.content) }));
  assert.equal(pythonReleaseFingerprint(previous), "c7720201bb98fc7c81aa6a646952ba7c73486200121d43d0f8292a9eaf7e9c29");
});

test("modelos fijos contrastan dependencias, costes, cuadrículas y estados finales", () => {
  // Solo modelos fijos del repositorio; no envíos ni garantías del sandbox.
  const code = `from collections import deque
import heapq

def dependencias(n, pares):
    pendientes = set(range(n))
    salida = []
    while pendientes:
        disponibles = [v for v in pendientes if all(a not in pendientes for a, b in pares if b == v)]
        if not disponibles:
            return []
        elegido = min(disponibles)
        pendientes.remove(elegido)
        salida.append(elegido)
    return salida
assert dependencias(3, [(0, 1)]) == [0, 1, 2]
assert dependencias(3, [(0, 1), (1, 0)]) == []
assert dependencias(0, []) == []

def coste(n, aristas, destino):
    vecinos = [[] for _ in range(n)]
    for a, b, peso in aristas:
        vecinos[a].append((b, peso))
        vecinos[b].append((a, peso))
    dist = [float('inf')] * n
    dist[0] = 0
    cola = [(0, 0)]
    while cola:
        actual, nodo = heapq.heappop(cola)
        if actual != dist[nodo]:
            continue
        for vecino, peso in vecinos[nodo]:
            if actual + peso < dist[vecino]:
                dist[vecino] = actual + peso
                heapq.heappush(cola, (dist[vecino], vecino))
    return -1 if dist[destino] == float('inf') else dist[destino]
assert coste(3, [(0, 2, 10), (0, 1, 2), (1, 2, 3)], 2) == 5
assert coste(2, [], 1) == -1 and coste(1, [], 0) == 0

def islas(matriz):
    vistos = set()
    total = 0
    for i, fila in enumerate(matriz):
        for j, celda in enumerate(fila):
            if celda != 1 or (i, j) in vistos:
                continue
            total += 1
            cola = [(i, j)]
            vistos.add((i, j))
            while cola:
                x, y = cola.pop()
                for a, b in ((x-1, y), (x+1, y), (x, y-1), (x, y+1)):
                    if 0 <= a < len(matriz) and 0 <= b < len(fila) and matriz[a][b] == 1 and (a, b) not in vistos:
                        vistos.add((a, b))
                        cola.append((a, b))
    return total
original = [[1, 0], [0, 1]]
assert islas(original) == 2 and original == [[1, 0], [0, 1]]
assert islas([]) == 0 and islas([[]]) == 0 and islas([[1, 1]]) == 1

def laberinto(matriz):
    filas, columnas = len(matriz), len(matriz[0])
    if matriz[0][0] or matriz[-1][-1]:
        return -1
    cola = deque([(0, 0, 0)])
    vistos = {(0, 0)}
    while cola:
        i, j, pasos = cola.popleft()
        if (i, j) == (filas-1, columnas-1):
            return pasos
        for a, b in ((i-1, j), (i+1, j), (i, j-1), (i, j+1)):
            if 0 <= a < filas and 0 <= b < columnas and matriz[a][b] == 0 and (a, b) not in vistos:
                vistos.add((a, b))
                cola.append((a, b, pasos+1))
    return -1
assert laberinto([[0]]) == 0 and laberinto([[1]]) == -1
assert laberinto([[0, 1], [0, 0]]) == 2
assert laberinto([[0, 1], [1, 0]]) == -1

def capacidad(pesos, dias):
    # Enumeración independiente para estos ejemplos pequeños, no rendimiento.
    for limite in range(max(pesos), sum(pesos)+1):
        usados, carga = 1, 0
        for peso in pesos:
            if carga + peso > limite:
                usados += 1
                carga = 0
            carga += peso
        if usados <= dias:
            return limite
assert capacidad([3, 2, 2, 4, 1], 3) == 5
assert capacidad([5, 1], 1) == 6 and capacidad([5, 1], 2) == 5

def edicion(a, b):
    tabla = [[0] * (len(b)+1) for _ in range(len(a)+1)]
    for i in range(len(a)+1):
        tabla[i][0] = i
    for j in range(len(b)+1):
        tabla[0][j] = j
    for i in range(1, len(a)+1):
        for j in range(1, len(b)+1):
            tabla[i][j] = min(tabla[i-1][j]+1, tabla[i][j-1]+1, tabla[i-1][j-1]+(a[i-1] != b[j-1]))
    return tabla[-1][-1]
assert edicion('ab', 'ba') == 2 and edicion('', 'abc') == 3
assert edicion('abc', '') == 3 and edicion('abc', 'abc') == 0

def creciente(valores):
    # Enumerar subsecuencias pequeñas contrasta orden y desigualdad estricta.
    mejor = 0
    for mascara in range(1 << len(valores)):
        parte = [v for i, v in enumerate(valores) if mascara & (1 << i)]
        if all(a < b for a, b in zip(parte, parte[1:])):
            mejor = max(mejor, len(parte))
    return mejor
assert creciente([]) == 0 and creciente([2, 2]) == 1
assert creciente([3, 1, 2, 0]) == 2 and creciente([3, 2, 1]) == 1

def planifica(duraciones, pares):
    orden = dependencias(len(duraciones), pares)
    if len(orden) != len(duraciones):
        return -1
    fin = {}
    for tarea in orden:
        fin[tarea] = duraciones[tarea] + max((fin[a] for a, b in pares if b == tarea), default=0)
    return max(fin.values(), default=0)
assert planifica([2, 5, 3, 0], [(0, 2), (1, 2), (2, 3)]) == 8
assert planifica([2, 5], []) == 5 and planifica([], []) == 0
assert planifica([0, 0], [(0, 1), (1, 0)]) == -1
print('ok')`;
  const result = spawnSync(process.env.PYTHON_BIN ?? "python", ["-c", code], { encoding: "utf8", timeout: 30000 });
  assert.equal(result.error, undefined);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), "ok");
});
