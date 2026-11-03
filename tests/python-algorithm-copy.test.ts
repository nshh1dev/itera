import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { pythonCatalog } from "../prisma/python-content";
import { pythonAlgorithmCopyRevisions } from "../prisma/python-vocabulary";
import { pythonReleaseFingerprint } from "../prisma/python-releases";
import { beforePythonAlgorithmCopy, previousAlgorithmCopy } from "./python-algorithm-copy-baseline";
import { beforePythonAdvancedCopy } from "./python-advanced-copy-baseline";

const reviewed = [
  "logica-insercion-posicion", "logica-ordena-insercion", "logica-ordena-registros", "logica-combina",
  "logica-palindromo", "logica-pareja", "logica-prefijos", "logica-intervalos-suma",
  "logica-ventana-fija", "logica-ventana-suma", "logica-celda", "logica-filas",
  "logica-columnas", "logica-diagonales", "logica-transpuesta", "logica-vecinos",
  "logica-copia-anidada", "logica-pila", "logica-cola", "logica-delimitadores",
  "logica-deshacer", "logica-suma-recursiva", "logica-busqueda-recursiva", "logica-une-intervalos",
  "logica-segundo-maximo", "logica-suma-maxima", "logica-sin-repeticiones", "logica-ranking",
  "logica-cuenta-nodos", "logica-altura", "logica-preorden", "logica-niveles",
];

test("el sexto contraste entre superficies alcanza 192 actividades y ajusta cuatro campos", () => {
  assert.deepEqual(pythonCatalog.slice(160, 192).map(entry => entry.slug), reviewed);
  assert.deepEqual(Object.keys(pythonAlgorithmCopyRevisions), Object.keys(previousAlgorithmCopy));
  assert.equal(Object.keys(pythonAlgorithmCopyRevisions).length, 3);
  let fields = 0;
  for (const [slug, revision] of Object.entries(pythonAlgorithmCopyRevisions)) {
    assert.ok(reviewed.includes(slug), slug);
    const content = pythonCatalog.find(entry => entry.slug === slug)!.content;
    for (const [field, value] of Object.entries(revision)) {
      assert.ok(["description", "objective", "practiceGoals"].includes(field), field);
      assert.deepEqual(content[field as keyof typeof revision], value, slug);
      fields++;
    }
  }
  assert.equal(fields, 4);
});

test("los textos distinguen diccionario de frecuencias, árbol vacío y contratos algorítmicos", () => {
  const content = (slug: string) => pythonCatalog.find(entry => entry.slug === slug)!.content;
  assert.match(content("logica-pareja").description, /cuyos valores/);
  assert.match(content("logica-ranking").objective, /conteos y criterios de ordenación/);
  assert.match(content("logica-ranking").practiceGoals[0], /diccionario de frecuencias.*desempate/);
  assert.match(content("logica-cuenta-nodos").description, /árbol está vacío, devuelve cero/);
  assert.match(content("logica-cuenta-nodos").statement, /None si está vacío.*Devuelve el número de nodos.*vacío tiene 0 nodos/s);
  const emptyTree = content("logica-cuenta-nodos").variants[0].tests.find(item => item.visible && item.input === null);
  assert.ok(emptyTree);
  assert.equal(emptyTree.expected, 0);
  const contracts: Record<string, RegExp> = {
    "logica-pareja": /posiciones distintas.*menor i.*mayor j.*no certifica la técnica/s,
    "logica-ranking": /valor distinto una sola vez.*frecuencia de mayor a menor.*menor valor numérico, también con negativos/s,
    "logica-insercion-posicion": /primera posición.*lista vacía devuelve 0/s,
    "logica-ordena-registros": /ambos campos coinciden.*orden original.*No elimines/s,
    "logica-ventana-suma": /al menos el objetivo.*enteros positivos.*0 si no existe/s,
    "logica-filas": /longitudes diferentes o estar vacías.*fila vacía aporta 0/s,
    "logica-copia-anidada": /copia cada fila.*no certifican la identidad.*mutación intermedia/s,
    "logica-suma-recursiva": /hasta 900.*no certifican.*recursión/s,
    "logica-segundo-maximo": /None si no existe.*Repetir el máximo no cuenta/s,
    "logica-suma-maxima": /todos los valores son negativos.*no se permite elegir un tramo vacío/s,
    "logica-altura": /contando nodos, no enlaces.*altura 0.*altura 1/s,
    "logica-preorden": /raíz.*subárbol izquierdo.*derecho.*Conserva valores repetidos/s,
    "logica-niveles": /por niveles, de izquierda a derecha.*Conserva valores repetidos/s,
  };
  for (const [slug, contract] of Object.entries(contracts)) assert.match(content(slug).statement, contract, slug);
});

test("solo cambian dos descripciones, un objetivo y una meta Python con historia íntegra", () => {
  const payload = pythonCatalog.map(entry => ({ ...entry, content: beforePythonAdvancedCopy(entry.slug, entry.content) })).map(entry => ({ ...entry, content: Object.fromEntries(
    Object.entries(entry.content).filter(([field]) => !Object.keys(pythonAlgorithmCopyRevisions[entry.slug] ?? {}).includes(field)),
  ) }));
  // Calculada antes de editar: protege las otras 29 actividades del bloque,
  // todos los enunciados, pistas, código, casos, contratos y los 433 ejemplos.
  assert.equal(createHash("sha256").update(JSON.stringify(payload)).digest("hex"), "8208978eeb94a985f6964032d29dbd89f5e69ae66fff6bbf81add68c82b80ceb");
  const previous = pythonCatalog.map(entry => ({ ...entry, content: beforePythonAlgorithmCopy(entry.slug, entry.content) }));
  assert.equal(pythonReleaseFingerprint(previous), "e7cc7b332896cf48f1ae0eebe7c827251a0ad6a623861f5feb1305352f3bc109");
});
