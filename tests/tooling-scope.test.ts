import { test } from "node:test";
import assert from "node:assert/strict";
import { ESLint } from "eslint";
import ts from "typescript";

test("lint excluye las herramientas locales sin excluir el producto ni las pruebas", async () => {
  const eslint = new ESLint();
  for (const path of [".agents/skills/prueba.ts", ".opencode/skills/prueba.ts"]) assert.equal(await eslint.isPathIgnored(path), true, path);
  for (const path of ["src/server/catalog.ts", "scripts/replace-catalog.ts", "tests/catalog-loading.test.ts"]) assert.equal(await eslint.isPathIgnored(path), false, path);
});

test("TypeScript conserva fuentes, scripts y pruebas y excluye las carpetas de herramientas locales", () => {
  const loaded = ts.readConfigFile("tsconfig.json", ts.sys.readFile);
  assert.equal(loaded.error, undefined);
  const config = ts.parseJsonConfigFileContent(loaded.config, ts.sys, process.cwd());
  assert.deepEqual(config.errors, []);
  for (const path of [".agents", ".opencode"]) assert.ok(config.raw.exclude.includes(path), path);
  const files = config.fileNames.map(file => file.replaceAll("\\", "/"));
  assert.equal(files.some(file => /\/(\.agents|\.opencode)\//.test(file)), false);
  for (const path of ["src/server/catalog.ts", "scripts/replace-catalog.ts", "tests/catalog-loading.test.ts"]) assert.ok(files.some(file => file.endsWith(`/${path}`)), path);
});
