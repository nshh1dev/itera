import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { motion, originFrom } from "../src/lib/motion";

test("CSS y Web Animations comparten los tiempos del sistema de movimiento", () => {
  const css = readFileSync("src/app/globals.css", "utf8");
  for (const [token, duration] of Object.entries({ response: motion.response, disclosure: motion.disclosure, navigation: motion.navigation, "panel-open": motion.panelOpen, "panel-close": motion.panelClose })) {
    assert.match(css, new RegExp(`--motion-${token}: ${duration}ms`));
    assert.ok(duration <= 340);
  }
  assert.ok(motion.panelClose < motion.panelOpen);
  assert.match(css, /prefers-reduced-motion: reduce/);
});

test("el origen registra el centro y tamaño del control, no un punto fijo de pantalla", () => {
  const element = { getBoundingClientRect: () => ({ left: 40, top: 120, width: 32, height: 44 }) } as HTMLElement;
  assert.deepEqual(originFrom(element), { element, x: 56, y: 142, width: 32, height: 44 });
});
