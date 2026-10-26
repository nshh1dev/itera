import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { projectExecutionFiles } from "../src/server/execution/harness";
import { judgeProject } from "../src/server/execution/judge";

for (const language of ["python", "javascript"] as const) {
  test(`el colector ${language} excluye un recurso readOnly sin ocultar datos editables cambiados`, () => {
    const root = path.join(process.cwd(), ".local", "harness-readonly");
    mkdirSync(root, { recursive: true });
    writeFileSync(path.join(root, "package.json"), '{"type":"commonjs"}');
    const directory = mkdtempSync(path.join(root, `${language}-`));
    try {
      const entrypoint = language === "python" ? "main.py" : "main.js";
      const source = language === "python" ? "def solve(data):\n    with open('almacen.json', encoding='utf-8') as f: state = __import__('json').load(f)\n    state['count'] += data\n    with open('almacen.json', 'w', encoding='utf-8') as f: __import__('json').dump(state, f, separators=(',', ':'))\n    return state['count']" : "const fs=require('fs'); function solve(data) { const state=JSON.parse(fs.readFileSync('almacen.json','utf8')); state.count+=data; fs.writeFileSync('almacen.json',JSON.stringify(state)); return state.count; } module.exports=solve;";
      const project = { version: 1 as const, entrypoint, files: [
        { path: entrypoint, content: source },
        { path: "mensaje.txt", content: "Texto de consigna", readOnly: true },
        { path: "almacen.json", content: "{\"count\":0}" },
      ] };
      const files = projectExecutionFiles(language, project.files, project, "FUNCTION");
      for (const file of files) writeFileSync(path.join(directory, file.name), file.content);
      const run = spawnSync(language === "python" ? process.env.PYTHON_BIN ?? "python" : process.execPath, [files[0].name], { cwd: directory, input: "2", encoding: "utf8", timeout: 10000, maxBuffer: 128 * 1024 });
      assert.ifError(run.error);
      assert.equal(judgeProject({ stdout: run.stdout, stderr: run.stderr, code: run.status, signal: run.signal }, { input: 2, expected: 2, expectedFiles: [{ path: "almacen.json", content: "{\"count\":2}" }], visible: true, order: 0 }, "FUNCTION").passed, true, run.stderr || run.stdout);
    } finally { rmSync(directory, { recursive: true, force: true }); }
  });
}
