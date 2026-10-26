import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm, rename } from "node:fs/promises";
import { join } from "node:path";
import { composeArgs, dockerCommand } from "../scripts/docker-command.mjs";
import { sourceChanges, sourceSnapshot, watchAction } from "../scripts/docker-watch.mjs";

test("el seguimiento separa sincronización, reinicio, reconstrucción y Prisma explícito", () => {
  assert.equal(watchAction("src/components/button.tsx"), "sync");
  assert.equal(watchAction("public/icon.svg"), "sync");
  assert.equal(watchAction("next.config.ts"), "restart");
  assert.equal(watchAction("package-lock.json"), "rebuild");
  assert.equal(watchAction("docker/Dockerfile"), "rebuild");
  assert.equal(watchAction("prisma/schema.prisma"), "schema");
  for (const path of [".env", ".local/docker.env", "src/generated/prisma/client.ts", "public/monaco/vs/editor.js", "node_modules/react/index.js", "src/../.env", "src/.env.local", "src/a.tmp", "next-env.d.ts"]) {
    assert.equal(watchAction(path), "ignore", path);
  }
});

test("los comandos de desarrollo añaden un override sin cambiar el modo compilado", () => {
  assert.deepEqual(composeArgs(["up"]), ["compose", "--project-directory", ".", "--env-file", ".local/docker.env", "-f", "docker/compose.yaml", "-f", "docker/compose.app.yaml", "up"]);
  assert.ok(!composeArgs(["up"]).includes("docker/compose.dev.yaml"));
  assert.ok(composeArgs(["up"], true).includes("docker/compose.dev.yaml"));
  assert.deepEqual(dockerCommand(["version"], "linux"), ["docker", ["version"]]);
  const [executable, args] = dockerCommand(["cp", "src/file with spaces.ts", "target:/app/file.ts"], "win32");
  assert.equal(executable, "wsl.exe");
  assert.ok(args.includes("src/file with spaces.ts"));
});

test("el snapshot detecta ediciones, altas, renombrados y borrados sin copiar secretos ni generados", async () => {
  await mkdir(".local", { recursive: true });
  const root = await mkdtemp(".local/docker-watch-test-");
  try {
    for (const path of ["src/generated", "public/monaco", ".local", "docker"]) await mkdir(join(root, path), { recursive: true });
    for (const path of ["src/a.ts", "src/generated/client.ts", "public/monaco/editor.js", ".local/docker.env", ".env"]) await writeFile(join(root, path), "original");
    const before = await sourceSnapshot(root);
    assert.deepEqual([...before.keys()], ["src/a.ts"]);
    await writeFile(join(root, "docker/Dockerfile"), "FROM node");
    await writeFile(join(root, "src/a.ts"), "editado");
    await writeFile(join(root, "src/b.ts"), "nuevo");
    const changed = await sourceSnapshot(root);
    assert.equal(sourceChanges(before, changed).length, 3);
    assert.ok(sourceChanges(before, changed).some(change => change.path === "docker/Dockerfile" && change.action === "rebuild"));
    await rename(join(root, "src/b.ts"), join(root, "src/c.ts"));
    await rm(join(root, "src/a.ts"));
    const changes = sourceChanges(changed, await sourceSnapshot(root));
    assert.equal(changes.filter(change => change.deleted).length, 2);
    assert.ok(changes.some(change => change.path === "src/c.ts" && !change.deleted));
  } finally { await rm(root, { recursive: true, force: true }); }
});
