import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { pythonCatalog } from "../prisma/python-content";
import { pythonAdvancedCopyRevisions } from "../prisma/python-vocabulary";
import { pythonReleaseFingerprint } from "../prisma/python-releases";
import { beforePythonAdvancedCopy, previousAdvancedCopy } from "./python-advanced-copy-baseline";
import { beforePythonDictionaryPrerequisites } from "./python-dictionary-prerequisites-baseline";

const reviewed = [
  "logica-arbol-busqueda", "logica-ancestro", "logica-monticulo-inserta", "logica-monticulo-extrae",
  "logica-prioridad", "logica-k-mayores", "logica-actividades", "logica-combina-archivos",
  "logica-potencia", "logica-mezcla", "logica-subconjuntos", "logica-permutaciones",
  "logica-combinaciones", "logica-reinas", "logica-fibonacci", "logica-escalera",
  "logica-caminos-obstaculos", "logica-monedas", "logica-mochila", "logica-subsecuencia-comun",
  "logica-adyacencia", "logica-alcanzables", "logica-distancias", "logica-ciclo-dirigido",
  "logica-dependencias", "logica-dijkstra", "logica-islas", "logica-laberinto",
  "logica-capacidad", "logica-edicion", "logica-subsecuencia-creciente", "logica-planifica-tareas",
];

test("el último contraste completa 224 actividades y precisa el orden numérico de permutaciones", () => {
  assert.deepEqual(pythonCatalog.slice(192).map(entry => entry.slug), reviewed);
  assert.deepEqual(Object.keys(pythonAdvancedCopyRevisions), Object.keys(previousAdvancedCopy));
  assert.deepEqual(Object.keys(pythonAdvancedCopyRevisions), ["logica-permutaciones"]);
  const revision = pythonAdvancedCopyRevisions["logica-permutaciones"];
  assert.deepEqual(Object.keys(revision), ["description"]);
  const content = pythonCatalog.find(entry => entry.slug === "logica-permutaciones")!.content;
  assert.equal(content.description, revision.description);
  assert.match(content.description, /lista de enteros distintos.*lexicográfico por valores numéricos/s);
  assert.match(content.statement, /primer elemento diferente, no su texto.*\[2, 10\] va antes de \[10, 2\].*vacía devuelve \[\[\]\]/s);
  assert.equal(content.hints.length, 3);
});

test("el bloque mantiene representaciones concretas, límites y distinciones entre tareas avanzadas", () => {
  const contracts: Record<string, RegExp> = {
    "logica-arbol-busqueda": /límites de todos los antecesores.*no solo los hijos inmediatos/s,
    "logica-ancestro": /ancestro de sí mismo.*pueden ser iguales.*no tiene por qué ser de búsqueda/s,
    "logica-monticulo-inserta": /No intercambies iguales.*representación concreta/s,
    "logica-monticulo-extrae": /elige el izquierdo.*no intercambies iguales.*lista concreta/s,
    "logica-combina-archivos": /tamaños abstractos.*no necesitas abrir.*coste total posible/s,
    "logica-potencia": /exponente cero devuelve 1.*base es cero.*no certifican/s,
    "logica-mezcla": /no certifican la técnica ni su complejidad/s,
    "logica-subconjuntos": /orden concreto.*No agrupes por longitud/s,
    "logica-combinaciones": /lexicográficamente por valores numéricos.*target cero devuelve \[\[\]\]/s,
    "logica-escalera": /El orden distingue formas.*cero escalones.*devuelve 1/s,
    "logica-monedas": /tantas veces como haga falta.*No se pide contar combinaciones/s,
    "logica-mochila": /peso cero.*una vez cada uno.*capacidad cero/s,
    "logica-subsecuencia-comun": /puede saltar caracteres.*no tiene que ser un tramo consecutivo/s,
    "logica-dependencias": /incluidas las recién liberadas.*en vez de un orden parcial/s,
    "logica-dijkstra": /suma de pesos.*no la cantidad de aristas.*no certifican/s,
    "logica-islas": /diagonales no conectan.*No modifiques la cuadrícula/s,
    "logica-laberinto": /inicial cuenta como cero movimientos/s,
    "logica-capacidad": /sin dividir ningún paquete.*como máximo dias días.*no certifican/s,
    "logica-planifica-tareas": /paralelismo ilimitado.*duración cero sigue respetando las dependencias/s,
  };
  for (const [slug, contract] of Object.entries(contracts)) {
    assert.match(pythonCatalog.find(entry => entry.slug === slug)!.content.statement, contract, slug);
  }
});

test("solo cambia la descripción de permutaciones y se reconstruye íntegra la entrega anterior", () => {
  const payload = pythonCatalog.map(entry => ({ ...entry, content: beforePythonDictionaryPrerequisites(entry.slug, entry.content) })).map(entry => ({ ...entry, content: Object.fromEntries(
    Object.entries(entry.content).filter(([field]) => !(entry.slug === "logica-permutaciones" && field === "description")),
  ) }));
  // Calculada antes de editar: protege las otras 31 actividades, todos los
  // objetivos, pistas, enunciados, código, contratos y los 433 ejemplos.
  assert.equal(createHash("sha256").update(JSON.stringify(payload)).digest("hex"), "5c122ec17ee154f9f320a8529a6c6251a9c79d11339dac7d96977cbf6d64dadd");
  const previous = pythonCatalog.map(entry => ({ ...entry, content: beforePythonAdvancedCopy(entry.slug, entry.content) }));
  assert.equal(pythonReleaseFingerprint(previous), "6614bdbbb0050fb619a218818fc5cc687becf0f5732bef5a478f7a2f469040bb");
});
