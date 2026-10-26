import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import simulated from "./playwright.config";
import real from "./playwright.real.config";
import { composeArgs } from "../scripts/docker-command.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const configDirectory = fileURLToPath(new URL("./", import.meta.url));

test("Playwright conserva suites, servidor en la raíz y resultados al mover las configuraciones", () => {
  for (const [config, suite] of [[simulated, "e2e"], [real, "real"]] as const) {
    assert.equal(resolve(configDirectory, config.testDir!), resolve(root, "tests", suite));
    assert.equal(resolve(configDirectory, config.outputDir!), resolve(root, "test-results"));
    assert.ok(config.webServer && !Array.isArray(config.webServer));
    assert.equal(config.webServer.cwd, root);
    assert.equal(config.webServer.reuseExistingServer, false);
  }
  const docker = readFileSync(new URL("./playwright.docker.config.ts", import.meta.url), "utf8");
  assert.match(docker, /testDir: "\."/);
  assert.match(docker, /webServer: undefined/);
  const { scripts } = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  assert.equal(scripts["test:e2e"], "playwright test -c tests/playwright.config.ts");
  assert.equal(scripts["test:e2e:real"], "playwright test -c tests/playwright.real.config.ts");
});

test("Compose conserva contexto, Dockerfile y rutas de seguimiento relativos a la raíz", () => {
  for (const development of [false, true]) {
    const args = composeArgs(["config"], development);
    assert.equal(args[args.indexOf("--project-directory") + 1], ".");
    for (let index = 0; index < args.length; index++) {
      if (args[index] === "-f") assert.ok(existsSync(resolve(root, args[index + 1])));
    }
  }
  const app = readFileSync(new URL("../docker/compose.app.yaml", import.meta.url), "utf8");
  assert.match(app, /build:\s+context: \.\s+dockerfile: docker\/Dockerfile/);
  assert.ok(existsSync(resolve(root, "docker/Dockerfile")));
  assert.ok(existsSync(resolve(root, ".dockerignore")));
  const development = readFileSync(new URL("../docker/compose.dev.yaml", import.meta.url), "utf8");
  for (const [, path] of development.matchAll(/path: \.\/(\S+)/g)) {
    if (path !== ".npmrc") assert.ok(existsSync(resolve(root, path)), path);
  }
});
