import test from "node:test";
import assert from "node:assert/strict";
import { parseStoredProjectDraft, prepareProjectDraftRecovery } from "../src/lib/project-draft-recovery";
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
