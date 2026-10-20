import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { motionTokens } from "../src/components/arc/motion-tokens";
import { getSettingsOrigin, rememberSettingsOrigin } from "../src/lib/motion";

test("Arc comparte presets breves y una rama CSS de movimiento reducido", () => {
  const css = readFileSync("src/components/arc/motion.css", "utf8");
  assert.match(css, new RegExp(`--arc-duration-fast: ${motionTokens.duration.fast * 1000}ms`));
  assert.ok(motionTokens.duration.fast < motionTokens.duration.standard);
  assert.equal(motionTokens.spring.smooth.bounce, 0);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.doesNotMatch(readFileSync("src/app/globals.css", "utf8"), /@keyframes|--motion-/);
});

test("Configuración recuerda el activador sin medir ni animar su geometría", () => {
  const element = {} as HTMLElement;
  rememberSettingsOrigin(element);
  assert.deepEqual(getSettingsOrigin(), { element });
});
