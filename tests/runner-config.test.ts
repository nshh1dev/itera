import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("Compose declara la frontera local y los límites de Piston", () => {
  const compose = readFileSync(new URL("../compose.yaml", import.meta.url), "utf8");
  assert.match(compose, /127\.0\.0\.1:2000:2000/);
  assert.match(compose, /image: ghcr\.io\/engineer-man\/piston@sha256:[a-f0-9]{64}/);
  for (const [key, value] of Object.entries({
    DISABLE_NETWORKING: "true", RUN_TIMEOUT: "12000", RUN_CPU_TIME: "10000",
    COMPILE_TIMEOUT: "8000", COMPILE_CPU_TIME: "8000",
    RUN_MEMORY_LIMIT: "268435456", COMPILE_MEMORY_LIMIT: "268435456",
    OUTPUT_MAX_SIZE: "65536", MAX_PROCESS_COUNT: "64", MAX_OPEN_FILES: "2048",
    MAX_FILE_SIZE: "10000000", MAX_CONCURRENT_JOBS: "4",
  })) assert.match(compose, new RegExp(`^      PISTON_${key}: "${value}"$`, "m"));
});
