import test from "node:test";
import assert from "node:assert/strict";
import { parseStoredProjectDraft, prepareProjectDraftRecovery, projectEditorSelection, uniqueProjectCopies } from "../src/lib/project-draft-recovery";
import type { ProjectFile } from "../src/lib/project";

const template: ProjectFile[] = [
  { path: "helper.py", content: "def value(): return 1" },
  { path: "main.py", content: "def solve(data): return value()" },
  { path: "data.txt", content: "prepared", readOnly: true },
];
const remote = { files: template, revision: 2 };

test("migra una copia antigua de código al main explícito sin perder archivos auxiliares", () => {
  const restored = parseStoredProjectDraft(JSON.stringify({ code: "def solve(data): return 9", revision: 1 }), template, "main.py");
  assert.equal(restored?.files.find(file => file.path === "main.py")?.content, "def solve(data): return 9");
  assert.equal(restored?.files.find(file => file.path === "helper.py")?.content, template[0].content);
});

test("conserva una copia local concurrente y ofrece la remota sin aplicarla", () => {
  const localFiles = template.map(file => ({ ...file, ...(file.path === "main.py" ? { content: "local" } : {}) }));
  const local = { version: 2 as const, revision: 1, files: localFiles, baseFiles: template };
  const result = prepareProjectDraftRecovery(remote, local, null, template, true);
  assert.equal(result.pending, true);
  assert.deepEqual(result.files, remote.files);
  assert.ok(result.copies.some(copy => copy.source === "local" && copy.files[1].content === "local"));
  assert.ok(result.copies.some(copy => copy.source === "remote"));
});

test("una copia local sobre la misma revisión se recupera sin conflicto", () => {
  const localFiles = template.map(file => ({ ...file, ...(file.path === "main.py" ? { content: "local" } : {}) }));
  const local = { version: 2 as const, revision: remote.revision, files: localFiles, baseFiles: remote.files };
  const result = prepareProjectDraftRecovery(remote, local, null, template, true);
  assert.equal(result.pending, false);
  assert.equal(result.files.find(file => file.path === "main.py")?.content, "local");
});

test("conserva la transferencia de invitado al crear cuenta", () => {
  const guest = JSON.stringify({ version: 2, files: template.map(file => ({ ...file, ...(file.path === "main.py" ? { content: "guest" } : {}) })) });
  const result = prepareProjectDraftRecovery({ files: template, revision: 0 }, null, guest, template, true);
  assert.equal(result.pending, false);
  assert.equal(result.files.find(file => file.path === "main.py")?.content, "guest");
});

test("rechaza una copia desconocida, duplicada o con recursos alterados sin aplicarla", () => {
  assert.equal(parseStoredProjectDraft(JSON.stringify({ version: 99, files: template, revision: 0 }), template), null);
  assert.equal(parseStoredProjectDraft(JSON.stringify({ version: 2, files: [...template, template[0]], revision: 0 }), template), null);
  const altered = template.map(file => ({ ...file, ...(file.readOnly ? { content: "changed" } : {}) }));
  assert.equal(parseStoredProjectDraft(JSON.stringify({ version: 2, files: altered, revision: 0 }), template), null);
});

test("la migración de código conserva la base y todas las alternativas anteriores", () => {
  const stored = { code: "actual", revision: 2, baseCode: "base", copies: [{ code: "anterior", revision: 1, source: "local" }] };
  const restored = parseStoredProjectDraft(JSON.stringify(stored), template, "main.py");
  assert.equal(restored?.baseFiles?.find(file => file.path === "main.py")?.content, "base");
  assert.equal(restored?.copies?.[0].files.find(file => file.path === "main.py")?.content, "anterior");
  assert.equal(parseStoredProjectDraft(JSON.stringify({ ...stored, revision: -1 }), template, "main.py"), null);
  assert.equal(parseStoredProjectDraft(JSON.stringify({ ...stored, version: 99 }), template, "main.py"), null);
});

test("conservar y serializar más de seis alternativas no las trunca ni invalida la recuperación", () => {
  const copies = Array.from({ length: 9 }, (_, revision) => ({ files: template.map(file => ({ ...file, ...(file.path === "main.py" ? { content: `copia-${revision}` } : {}) })), revision, source: "local" as const }));
  const merged = uniqueProjectCopies([...copies, copies[0]]);
  assert.equal(merged.length, 9);
  const restored = parseStoredProjectDraft(JSON.stringify({ version: 2, files: template, revision: 2, copies: merged }), template);
  assert.equal(restored?.copies?.length, 9);
});

test("la base y las alternativas no admiten archivos ajenos ni revisiones negativas", () => {
  const base = { version: 2, revision: 2, files: template };
  assert.equal(parseStoredProjectDraft(JSON.stringify({ ...base, baseFiles: [...template, { path: "extra.py", content: "extra" }] }), template), null);
  assert.equal(parseStoredProjectDraft(JSON.stringify({ ...base, copies: [{ files: template, revision: -1, source: "local" }] }), template), null);
  assert.equal(parseStoredProjectDraft(JSON.stringify({ ...base, copies: [{ files: [...template, { path: "extra.py", content: "extra" }], revision: 0, source: "local" }] }), template), null);
});

test("restaurar una copia conserva el archivo activo y no muestra main dentro de un auxiliar", () => {
  const recovered = template.map(file => ({ ...file, content: `${file.path}: recuperado` }));
  assert.deepEqual(projectEditorSelection(recovered, "helper.py"), { path: "helper.py", content: "helper.py: recuperado" });
  assert.deepEqual(projectEditorSelection(recovered, "archivo-eliminado.py"), { path: "helper.py", content: "helper.py: recuperado" });
});
