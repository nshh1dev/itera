import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");

function luminance(hex: string) {
  const [r, g, b] = hex.slice(1).match(/../g)!.map(part => {
    const value = Number.parseInt(part, 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(first: string, second: string) {
  const a = luminance(first);
  const b = luminance(second);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

for (const theme of [":root", ".dark"]) {
  test(`los tokens de lectura y acciones mantienen contraste AA en ${theme}`, () => {
    const block = css.slice(css.indexOf(`${theme} {`)).split("}")[0];
    const tokens = Object.fromEntries([...block.matchAll(/--([\w-]+):\s*(#[\da-f]{6});/gi)].map(match => [match[1], match[2]]));
    for (const foreground of ["foreground", "muted-foreground", "tonal-foreground", "primary-text", "success-text", "destructive", "warning"]) {
      for (const background of ["background", "canvas", "surface", "surface-inset", "surface-secondary", "control", "elevated"]) {
        const ratio = contrast(tokens[foreground], tokens[background]);
        assert.ok(ratio >= 4.5, `${foreground} sobre ${background}: ${ratio.toFixed(2)}:1`);
      }
    }
    assert.ok(contrast(tokens["primary-foreground"], tokens.primary) >= 4.5, "etiqueta de acción principal");
  });
}
