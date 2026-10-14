import { test } from "node:test";
import assert from "node:assert/strict";
import { exercises } from "../prisma/content";
import { textExercises } from "../prisma/text-content";
import { intermediateSteps, nextExerciseSlug } from "../src/lib/learning-paths";

test("los filtros y comparaciones preceden a palíndromos y anagramas", () => {
  const before = (a: string, b: string) => assert.ok(intermediateSteps.indexOf(a) >= 0 && intermediateSteps.indexOf(a) < intermediateSteps.indexOf(b), `${a} antes de ${b}`);
  before("quita-los-espacios", "filtra-letras-y-digitos");
  before("filtra-letras-y-digitos", "palindromo");
  before("compara-dos-textos", "palindromo");
  before("frecuencia-caracteres", "compara-contadores");
  before("quita-los-espacios", "anagramas");
  before("compara-contadores", "anagramas");
  assert.equal(nextExerciseSlug("compara-dos-textos", intermediateSteps), "palindromo");
  assert.equal(nextExerciseSlug("compara-contadores", intermediateSteps), "anagramas");
});

test("cada actividad de textos se resuelve con el cambio acotado que describe", () => {
  const changes: Record<string, { python: [string, string]; javascript: [string, string] }> = {
    "quita-los-espacios": { python: ["letra == ' '", "letra != ' '"], javascript: ["letra === ' '", "letra !== ' '"] },
    "filtra-letras-y-digitos": { python: ["abcdefghijklmnopqrstuvwxyz'", "abcdefghijklmnopqrstuvwxyz0123456789'"], javascript: ["abcdefghijklmnopqrstuvwxyz'", "abcdefghijklmnopqrstuvwxyz0123456789'"] },
    "compara-dos-textos": { python: ["return False", "return primero == segundo"], javascript: ["return false", "return primero === segundo"] },
    "compara-contadores": { python: ["primero > segundo", "primero != segundo"], javascript: ["primero > segundo", "primero !== segundo"] },
  };
  for (const exercise of textExercises) for (const language of ["python", "javascript"] as const) {
    assert.ok(intermediateSteps.includes(exercise.slug), exercise.slug);
    const [from, to] = changes[exercise.slug][language];
    const starter = exercise.starters![language];
    assert.equal(starter.split(from).length, 2, `${exercise.slug}: cambio inequívoco`);
    assert.equal(starter.replace(from, to), exercise[language], `${exercise.slug}: coincide con la referencia ${language}`);
  }
});

test("los retos de textos integran conceptos previos sin exigir técnicas compactas nuevas", () => {
  for (const slug of ["palindromo", "anagramas"]) {
    const exercise = exercises.find(e => e.slug === slug)!;
    for (const language of ["python", "javascript"] as const) {
      const code = exercise[language];
      assert.ok(code.includes("for "), slug);
      assert.doesNotMatch(code, /sorted\(|\.sort\(|\.reverse\(|\.replace\(|import re|\[::-1\]|=>/, slug);
      assert.ok(exercise.starters?.[language].includes(language === "python" ? "return False" : "return false"), slug);
      assert.ok(code.length > exercise.starters![language].length, `${slug}: la plantilla retira ayuda`);
    }
  }
});
