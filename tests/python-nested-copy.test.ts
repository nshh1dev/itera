import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { pythonCatalog } from "../prisma/python-content";
import { pythonNestedCopyRevisions } from "../prisma/python-vocabulary";
import { pythonReleaseFingerprint } from "../prisma/python-releases";
import { beforePythonNestedCopy, previousNestedCopy } from "./python-nested-copy-baseline";
import { beforePythonAlgorithmCopy } from "./python-algorithm-copy-baseline";

const reviewed = [
  "python-clave-longitud", "python-lambda-desempate", "python-formato-decimal", "python-consulta-anidada",
  "logica-inventario", "logica-importa-preparado", "logica-extrae-modulo", "logica-separa-reglas-io",
  "logica-repara-importacion", "logica-organiza-modulos", "logica-lee-archivo", "logica-escribe-archivo",
  "logica-valida-json", "logica-guarda-recupera", "logica-recupera-archivo-invalido", "logica-actualiza-persistidos",
  "logica-inventario-modular", "logica-inventario-persistente", "python-inventario-valora", "python-academia-inscribe",
  "python-academia-califica", "python-academia-resume", "python-contactos-crea", "python-contactos-edita",
  "python-contactos-borra", "python-contactos-busca", "logica-agenda-operaciones", "logica-agenda-almacenamiento",
  "logica-agenda-regresion", "python-transforma-campo", "python-transforma-registros", "logica-busqueda-binaria",
];

test("el quinto contraste entre superficies alcanza 160 actividades con catorce resúmenes ajustados", () => {
  assert.deepEqual(pythonCatalog.slice(128, 160).map(entry => entry.slug), reviewed);
  assert.deepEqual(Object.keys(pythonNestedCopyRevisions), Object.keys(previousNestedCopy));
  assert.equal(Object.keys(pythonNestedCopyRevisions).length, 14);
  for (const [slug, revision] of Object.entries(pythonNestedCopyRevisions)) {
    assert.ok(reviewed.includes(slug), slug);
    assert.deepEqual(Object.keys(revision), ["description"], slug);
    const content = pythonCatalog.find(entry => entry.slug === slug)!.content;
    assert.equal(content.description, revision.description, slug);
    assert.notEqual(content.description, content.objective, slug);
  }
});

test("los resúmenes conservan estabilidad, ausencia, validación y recuperación por campo", () => {
  const content = (slug: string) => pythonCatalog.find(entry => entry.slug === slug)!.content;
  const concepts: Record<string, RegExp> = {
    "python-clave-longitud": /pasa len sin llamarla.*Es estable.*no ordenes alfabéticamente.*no certifican/s,
    "python-lambda-desempate": /primer componente y después por el segundo.*invertir solo ese criterio.*no certifican/s,
    "python-formato-decimal": /round devuelve un número.*ceros finales.*no una regla financiera decimal/s,
    "python-consulta-anidada": /solo si falta la clave.*no convierte en diccionario un valor None.*Cero es una nota válida/s,
    "python-inventario-valora": /céntimos enteros.*valor descendente y nombre ascendente.*No cambies la entrada/s,
    "python-academia-inscribe": /copia cada diccionario interior.*inscribir no equivale a calificar.*incluso cero/s,
    "python-academia-califica": /valida existencia y rango antes de asignar.*and evalúa de izquierda a derecha.*pierde esa protección/s,
    "python-academia-resume": /Excluye solo None.*solo los nombres de alumnos con promedio.*nombre ascendente/s,
    "python-contactos-crea": /strip y lower.*teléfonos son textos.*nombre normalizado queda vacío o ya existe/s,
    "python-contactos-edita": /texto vacío válido.*actualiza únicamente telefono y correo.*ignora otros campos y None/s,
    "python-contactos-borra": /strip y lower.*no se buscan coincidencias parciales.*ni borres otros contactos/s,
    "python-contactos-busca": /todos los filtros.*campo filtrado ausente.*no equivale a texto vacío.*Sin filtros/s,
    "python-transforma-campo": /textos inmutables.*Conserva los demás campos.*No crees una clave ausente/s,
    "python-transforma-registros": /nombres de operaciones, no funciones.*Captura ValueError solo.*no la gramática restringida/s,
  };
  for (const [slug, concept] of Object.entries(concepts)) {
    assert.match(content(slug).statement, concept, slug);
    assert.equal(content(slug).hints.length, 3, slug);
  }
  assert.match(content("python-academia-califica").statement, /0 ≤ nota ≤ 100.*No inscribas automáticamente/s);
  for (const slug of ["logica-guarda-recupera", "logica-actualiza-persistidos"]) {
    assert.match(content(slug).statement, /mismo proceso.*no (?:una prueba de|promete) persistencia entre procesos/s, slug);
  }
  for (const slug of ["logica-inventario-persistente", "logica-agenda-almacenamiento", "logica-agenda-regresion"]) {
    assert.match(content(slug).statement, /Persistencia entre procesos:.*proceso nuevo.*El siguiente caso reinicia el disco/s, slug);
  }
  assert.match(content("logica-inventario-modular").statement, /modifica stock intencionalmente/);
  assert.match(content("logica-valida-json").statement, /booleano no es un límite válido.*bool sea subclase de int/s);
});

test("solo cambian catorce descripciones Python sin alterar proyectos ni expectativas históricas", () => {
  const payload = pythonCatalog.map(entry => ({ ...entry, content: beforePythonAlgorithmCopy(entry.slug, entry.content) })).map(entry => ({ ...entry, content: Object.fromEntries(
    Object.entries(entry.content).filter(([field]) => !Object.keys(pythonNestedCopyRevisions[entry.slug] ?? {}).includes(field)),
  ) }));
  // Calculada antes de editar: conserva las 18 actividades restantes, teoría,
  // pistas, los 433 ejemplos, recursos, manifiestos y contratos de persistencia.
  assert.equal(createHash("sha256").update(JSON.stringify(payload)).digest("hex"), "4b76667188b3d0dedd19cc05d0846de633051ba55e628d2d1362279d2b402533");
  const previous = pythonCatalog.map(entry => ({ ...entry, content: beforePythonNestedCopy(entry.slug, entry.content) }));
  assert.equal(pythonReleaseFingerprint(previous), "55c3bc1d2324a98370bb9a530cc6a0be9090eb5797202e472dc06ba2d306b875");
});
