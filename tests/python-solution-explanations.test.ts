import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { pythonCatalog } from "../prisma/python-content";
import { pythonSolutionExplanations } from "../prisma/python-vocabulary";
import { validateProjectDefinition, validateExpectedProjectFiles } from "../src/lib/project";
import { beforePythonTiming } from "./python-timing-baseline";
import { pythonFoundationExplanations } from "../prisma/python-foundation-explanations";
import { beforePythonCollections } from "./python-collection-baseline";

const slugs = ["logica-dos-parametros", "python-desempaqueta", "logica-ficha-resultado", "python-recorre-pares", "logica-notas", "python-contactos-edita", "logica-prefijos", "logica-copia-anidada", "logica-suma-maxima", "logica-cuenta-nodos"];

test("diez explicaciones de solución usan vocabulario Python y justifican la referencia", () => {
  const projects = pythonCatalog.filter(entry => entry.content.variants[0].project).map(entry => entry.slug);
  assert.deepEqual(new Set(Object.keys(pythonSolutionExplanations)), new Set([...slugs, ...projects]));
  for (const slug of slugs) {
    const entry = pythonCatalog.find(item => item.slug === slug)!;
    const text = entry.content.variants[0].explanation;
    assert.equal(text, pythonSolutionExplanations[slug], slug);
    assert.doesNotMatch(text, /\b(?:arreglos?|propiedades?|push)\b/i, slug);
    if (/\bnull\b/.test(text)) assert.match(text, /None.*null.*JSON/, slug);
  }
  assert.match(pythonSolutionExplanations["python-desempaqueta"], /tupla.*lista en JSON/);
  assert.match(pythonSolutionExplanations["python-contactos-edita"], /copia cada ficha.*texto vacío.*claves desconocidas/s);
  assert.match(pythonSolutionExplanations["logica-notas"], /sin dividir entre cero.*media válida de 0/s);
  assert.match(pythonSolutionExplanations["logica-prefijos"], /n \+ 1.*O\(n\)/);
  assert.match(pythonSolutionExplanations["logica-copia-anidada"], /filas compartidas.*celdas son enteros.*no demuestra identidad/s);
  const maximum = pythonCatalog.find(item => item.slug === "logica-suma-maxima")!;
  assert.ok(maximum.content.variants[0].solution.includes("data[1:]"));
  assert.match(maximum.content.variants[0].explanation, /slice ocupa O\(n\) de espacio auxiliar/);
  assert.match(pythonSolutionExplanations["logica-cuenta-nodos"], /antes de consultar claves.*value no interviene/s);
});

test("los lotes de prosa conservan los demás campos del catálogo", () => {
  const revised = Object.keys(pythonSolutionExplanations);
  assert.equal(revised.length, 28);
  const payload = pythonCatalog.map(entry => ({ ...entry, content: { ...beforePythonTiming(entry.slug, entry.content), variants: beforePythonCollections(entry.slug, entry.content).variants.map(variant => {
    if (!revised.includes(entry.slug) && !(entry.slug in pythonFoundationExplanations)) return variant;
    const { explanation, ...rest } = variant;
    void explanation;
    return rest;
  }) } }));
  // Huella previa ampliada antes de editar proyectos; la del primer lote era
  // 8e1b81eec7e2574fc026c8e38c26185962e9a9a06e821235f7831ae4e639ffff.
  // Al revisar fundamentos se excluyen sus 15 textos, conservando la huella previa:
  // 0a6bdb1da736d3a1ef256b70566d1e416994170bee66c11fdb90ae6db035551d.
  assert.equal(createHash("sha256").update(JSON.stringify(payload)).digest("hex"), "710349a47cfa0b9f0b66fd3d587dd5adcfe32eef6f83f4e08ddf3776147720be");
});

test("las 18 explicaciones de proyectos distinguen módulos, artefactos, pruebas propias y segundo proceso", () => {
  const projects = pythonCatalog.filter(entry => entry.content.variants[0].project);
  assert.equal(projects.length, 18);
  for (const entry of projects) {
    const variant = entry.content.variants[0];
    const project = validateProjectDefinition(variant.project);
    const text = variant.explanation;
    assert.equal(text, pythonSolutionExplanations[entry.slug], entry.slug);
    assert.match(text, /main.py/, entry.slug);
    assert.doesNotMatch(text, /Plan: separa las operaciones|Si hay un archivo de pruebas|stock inicial.*en tareas/s, entry.slug);
    if (project.testEntrypoint) {
      assert.ok(text.includes(project.testEntrypoint), entry.slug);
      assert.match(text, /pruebas propias no concede progreso/, entry.slug);
    }
    if (project.verifyPersistence) {
      assert.match(text, /solve\(\[\]\).*proceso nuevo/, entry.slug);
      assert.match(text, /solo ante FileNotFoundError.*estado.json/, entry.slug);
      assert.match(text, /mismo contenido exacto tras ambas llamadas/, entry.slug);
      assert.match(text, /no hay persistencia entre casos ni envíos/, entry.slug);
    } else {
      assert.doesNotMatch(text, /La segunda llamada solve/, entry.slug);
    }
    for (const testCase of variant.tests) {
      for (const file of validateExpectedProjectFiles(project, testCase.expectedFiles ?? [])) {
        assert.ok(text.includes(file.path), `${entry.slug}: ${file.path}`);
        assert.match(text, /UTF-8|utf-8/, entry.slug);
        assert.match(text, /sin salto final|ni salto final|no añade salto final/, entry.slug);
        assert.match(text, /juez comprueba.*(?:además|también)/i, entry.slug);
      }
    }
  }
  assert.match(pythonSolutionExplanations["logica-gastos-registro"], /no usa disco ni un archivo de pruebas/);
  assert.match(pythonSolutionExplanations["logica-lee-archivo"], /splitlines.*índice -1/s);
  assert.doesNotMatch(pythonSolutionExplanations["logica-lee-archivo"], /json\.load|json\.dump/);
  assert.match(pythonSolutionExplanations["logica-valida-json"], /type\(limite\) is int.*excluye booleanos.*ausente.json existe/s);
  assert.match(pythonSolutionExplanations["logica-recupera-archivo-invalido"], /FileNotFoundError.*json.JSONDecodeError/s);
  assert.doesNotMatch(pythonSolutionExplanations["logica-guarda-recupera"], /stock|titulo|hecha/);
  assert.match(pythonSolutionExplanations["logica-inventario-persistente"], /rechazados igual a 0.*no crea por sí sola un proceso nuevo/s);
  assert.doesNotMatch(pythonSolutionExplanations["logica-inventario-persistente"], /titulo|hecha/);
  assert.match(pythonSolutionExplanations["logica-agenda-regresion"], /mismo proceso.*no sustituyen.*proceso nuevo/s);
  assert.doesNotMatch(pythonSolutionExplanations["logica-agenda-almacenamiento"], /stock|rechazados/);
});

test("proyectos y fundamentos conservan las diez explicaciones previas y los campos ajenos", () => {
  const payload = pythonCatalog.map(entry => ({ ...entry, content: { ...beforePythonTiming(entry.slug, entry.content), variants: beforePythonCollections(entry.slug, entry.content).variants.map(variant => {
    if (!variant.project && !(entry.slug in pythonFoundationExplanations)) return variant;
    const { explanation, ...rest } = variant;
    void explanation;
    return rest;
  }) } }));
  // Antes del lote de fundamentos: 44c744619828c94150891e9eb2c44abbe690ef398621c434ed3291e1c4e606ce.
  assert.equal(createHash("sha256").update(JSON.stringify(payload)).digest("hex"), "9bb75b265c90d0e86c4aa6c943f673d653b4d991ea9e684560c49481dd13d0bf");
});
