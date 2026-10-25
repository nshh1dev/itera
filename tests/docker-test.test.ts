import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

test("el lanzador Docker reenvía filtros y retira el puerto incluso si Playwright falla", () => {
  const directory = mkdtempSync(join(tmpdir(), "itera-docker-test-"));
  try {
    mkdirSync(join(directory, "scripts"));
    mkdirSync(join(directory, "node_modules/@playwright/test"), { recursive: true });
    writeFileSync(join(directory, "launch.mjs"), readFileSync(new URL("../scripts/docker-test.mjs", import.meta.url)));
    // Procesos sintéticos: no importan el lanzador Docker real ni abren servicios.
    writeFileSync(join(directory, "scripts/docker.mjs"), 'import fs from "node:fs"; fs.appendFileSync("calls.jsonl", JSON.stringify({ tool: "docker", args: process.argv.slice(2) }) + "\\n");');
    writeFileSync(join(directory, "node_modules/@playwright/test/cli.js"), 'const fs = require("node:fs"); fs.appendFileSync("calls.jsonl", JSON.stringify({ tool: "playwright", args: process.argv.slice(2) }) + "\\n"); process.exitCode = 23;');
    const result = spawnSync(process.execPath, ["launch.mjs", "tests/docker/http-security.spec.ts", "--repeat-each=2"], { cwd: directory });
    assert.equal(result.status, 23);
    const calls = readFileSync(join(directory, "calls.jsonl"), "utf8").trim().split("\n").map(line => JSON.parse(line));
    assert.deepEqual(calls, [
      { tool: "docker", args: ["-f", "compose.verify.yaml", "up", "-d", "--wait", "database"] },
      { tool: "playwright", args: ["test", "-c", "playwright.docker.config.ts", "tests/docker/http-security.spec.ts", "--repeat-each=2"] },
      { tool: "docker", args: ["up", "-d", "--wait", "database"] },
    ]);
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
