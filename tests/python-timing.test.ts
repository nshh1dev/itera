import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { pythonCatalog, validatePythonCatalog } from "../prisma/python-content";
import { pythonTimingRevisions } from "../prisma/python-timing";
import { pythonStepMetadata } from "../src/lib/python-curriculum";
import { validateProjectDefinition } from "../src/lib/project";

const minutes = (slug: string) => pythonCatalog.find(entry => entry.slug === slug)!.content.minutes;

test("los tiempos revisan 224 actividades: 54 ajustes explícitos y 170 estimaciones conservadas", () => {
  assert.equal(pythonCatalog.length, 224);
  assert.equal(Object.keys(pythonTimingRevisions).length, 54);
  validatePythonCatalog();
  for (const [slug, revision] of Object.entries(pythonTimingRevisions)) {
    const entry = pythonCatalog.find(item => item.slug === slug);
    assert.ok(entry, slug);
    assert.equal(entry.content.minutes, revision.minutes, slug);
    assert.notEqual(revision.minutes, revision.previousMinutes, slug);
    assert.equal(revision.previousMinutes, entry.baseline?.minutes ?? pythonStepMetadata(slug)?.minutes, `${slug}: procedencia del valor previo`);
    assert.ok(revision.reason.length > 30, `${slug}: criterio editorial`);
  }
  for (const entry of pythonCatalog) {
    assert.ok(Number.isInteger(entry.content.minutes), entry.slug);
    assert.ok(entry.content.minutes >= 5 && entry.content.minutes <= 50, entry.slug);
  }
});

test("los proyectos distinguen importación preparada, reglas propias, integración y persistencia", () => {
  assert.ok(minutes("logica-importa-preparado") > minutes("logica-retorno"));
  assert.ok(minutes("logica-extrae-modulo") > minutes("logica-importa-preparado"));
  assert.ok(minutes("logica-organiza-modulos") > minutes("logica-extrae-modulo"));
  assert.ok(minutes("logica-escribe-archivo") > minutes("logica-lee-archivo"));
  const projects = pythonCatalog.filter(entry => entry.content.variants[0].project);
  assert.equal(projects.length, 18);
  for (const entry of projects) {
    const project = validateProjectDefinition(entry.content.variants[0].project);
    if (project.previousStep) {
      assert.ok(entry.content.minutes > minutes(project.previousStep), entry.slug);
    }
    if (project.verifyPersistence) assert.ok(entry.content.minutes >= 45, entry.slug);
  }
  assert.ok(minutes("logica-carrito") > minutes("logica-suma-lista"));
  assert.ok(minutes("logica-reinas") > minutes("logica-subconjuntos"));
  assert.ok(minutes("logica-planifica-tareas") > minutes("logica-dependencias"));
});

test("el lote solo cambia minutos de las 54 identidades: evaluación, textos y otros tiempos permanecen intactos", () => {
  const payload = pythonCatalog.map(entry => ({ ...entry, content: Object.fromEntries(Object.entries(entry.content)
    .filter(([key]) => key !== "minutes" || !(entry.slug in pythonTimingRevisions))) }));
  assert.equal(createHash("sha256").update(JSON.stringify(payload)).digest("hex"), "3f8b01a762c982f483d984dedd574b0a21c685eca0a52c35265285e8b4e764ed");
});
