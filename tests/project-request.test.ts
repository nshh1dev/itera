import test from "node:test";
import assert from "node:assert/strict";
import { sameSubmissionFiles } from "../src/lib/project-request";

test("reintentar un proyecto conserva su identidad tras normalizar readOnly y el orden", () => {
  const saved = [{ path: "main.js", content: "module.exports = solve" }, { path: "datos.json", content: "{}", readOnly: true }];
  const originalRequest = [{ path: "datos.json", content: "{}" }, { path: "main.js", content: "module.exports = solve" }];
  assert.equal(sameSubmissionFiles(saved, originalRequest), true);
  assert.equal(sameSubmissionFiles(saved, [{ ...originalRequest[0], content: "[]" }, originalRequest[1]]), false);
  assert.equal(sameSubmissionFiles(saved, [{ ...originalRequest[0], path: "otro.json" }, originalRequest[1]]), false);
});

test("la clave de un programa legado no admite añadir archivos y rechaza instantáneas dañadas", () => {
  assert.equal(sameSubmissionFiles(null, undefined), true);
  assert.equal(sameSubmissionFiles(null, [{ path: "main.py", content: "pass" }]), false);
  assert.equal(sameSubmissionFiles([{ path: "main.py", content: "pass" }], null), false);
  assert.equal(sameSubmissionFiles([{}], [{}]), false);
  const repeated = [{ path: "main.py", content: "pass" }, { path: "main.py", content: "pass" }];
  assert.equal(sameSubmissionFiles(repeated, repeated), false);
});
