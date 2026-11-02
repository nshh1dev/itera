import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { pythonCatalog } from "../prisma/python-content";
import { pythonIntroCopyRevisions } from "../prisma/python-vocabulary";
import { pythonReleaseFingerprint } from "../prisma/python-releases";
import { learningHelp } from "../src/lib/learning-help";
import { beforePythonIntroCopy, previousIntroCopy } from "./python-intro-copy-baseline";
import { beforePythonFlowCopy } from "./python-flow-copy-baseline";

const reviewed = [
  "logica-saludo", "logica-dos-lineas", "logica-orden-mensaje", "logica-texto-calculo",
  "logica-guarda-nombre", "logica-guarda-cantidad", "logica-actualiza-puntos", "logica-intercambia",
  "logica-suma-cantidades", "logica-cambio", "logica-precio-unidades", "logica-parentesis",
  "python-constante", "logica-lee-nombre", "logica-lee-doble", "logica-lee-suma",
  "logica-mensaje-resultado", "python-decimal", "logica-numero-texto", "logica-booleano",
  "logica-igualdad", "logica-alcanza", "logica-retorno", "logica-parametro",
  "logica-dos-parametros", "logica-imprimir-devolver", "logica-predice-valores", "logica-tabla-valores",
  "logica-minutos-segundos", "logica-perimetro", "logica-repara-presupuesto", "logica-merienda",
];

test("el primer contraste entre superficies revisa 32 actividades y ajusta ocho campos", () => {
  assert.deepEqual(pythonCatalog.slice(0, 32).map(entry => entry.slug), reviewed);
  assert.deepEqual(Object.keys(pythonIntroCopyRevisions), Object.keys(previousIntroCopy));
  assert.equal(Object.keys(pythonIntroCopyRevisions).length, 8);
  for (const [slug, revision] of Object.entries(pythonIntroCopyRevisions)) {
    assert.ok(reviewed.includes(slug), slug);
    assert.equal(Object.keys(revision).length, 1, slug);
    const content = pythonCatalog.find(entry => entry.slug === slug)!.content;
    for (const [field, value] of Object.entries(revision)) {
      assert.ok(["description", "hints"].includes(field), field);
      assert.deepEqual(content[field as keyof typeof revision], value, slug);
    }
  }
});

test("resúmenes y pistas Python conservan teoría, condiciones e impresión preparada", () => {
  const content = (slug: string) => pythonCatalog.find(entry => entry.slug === slug)!.content;
  assert.doesNotMatch(content("logica-actualiza-puntos").description, /JavaScript|TypeScript|let|const|11/);
  assert.match(content("logica-actualiza-puntos").statement, /valor actual de la variable.*11/s);
  assert.notEqual(content("python-constante").description, content("python-constante").objective);
  assert.match(content("python-constante").statement, /convención.*no impide reasignarlo.*requiere revisar el código/s);
  assert.notEqual(content("python-decimal").description, content("python-decimal").objective);
  assert.match(content("python-decimal").statement, /float.*int no acepta.*incluido \.0/s);
  assert.match(content("logica-mensaje-resultado").statement, /Destino:.*espacio.*mayúsculas y espacios interiores/s);
  for (const slug of ["logica-booleano", "logica-igualdad"] as const) {
    assert.deepEqual(content(slug).hints.slice(0, 2), previousIntroCopy[slug].hints.slice(0, 2));
    assert.match(content(slug).hints[2], /conserva la impresión preparada/);
    assert.doesNotMatch(content(slug).hints[2], /lenguaje seleccionado/);
  }
  assert.match(content("logica-booleano").hints[2], /True/);
  assert.match(content("logica-igualdad").hints[2], /a == b/);
});

test("la ayuda ya evita mostrar juntos objetivo general y su copia como objetivo de práctica", () => {
  const content = pythonCatalog.find(entry => entry.slug === "python-constante")!.content;
  assert.equal(content.practiceGoals[0], content.objective);
  const help = learningHelp(content);
  assert.deepEqual(help.goals, [content.objective]);
  // No eliminar metadatos para resolver una duplicación que la presentación
  // ya evita; las pistas y las introducciones conceptuales tienen otra función.
  for (const entry of pythonCatalog.slice(0, 32)) {
    assert.ok(entry.content.hints.length >= 3, entry.slug);
    assert.ok(learningHelp(entry.content).goals.length > 0, entry.slug);
  }
});

test("solo cambian seis descripciones y dos listas de pistas en Python", () => {
  const payload = pythonCatalog.map(entry => ({ ...entry, content: beforePythonFlowCopy(entry.slug, entry.content) })).map(entry => ({ ...entry, content: Object.fromEntries(
    Object.entries(entry.content).filter(([field]) => !Object.keys(pythonIntroCopyRevisions[entry.slug] ?? {}).includes(field)),
  ) }));
  // Calculada antes de editar; protege también los 24 textos conservados del
  // bloque, introducciones, objetivos, casos, soluciones, minutos y recorrido.
  assert.equal(createHash("sha256").update(JSON.stringify(payload)).digest("hex"), "cdd8886b155d0b7a3ce89415a356b44d1a9ad4253fb6d0c69eb2ea1ea75f0046");
  const previous = pythonCatalog.map(entry => ({ ...entry, content: beforePythonIntroCopy(entry.slug, entry.content) }));
  assert.equal(pythonReleaseFingerprint(previous), "24bfc2a47c51040682bbf2d818f15060ff58b27967faf0784a2a0e5838047caf");
});
