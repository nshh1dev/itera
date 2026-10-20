import { test } from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { spawnSync } from "node:child_process";
import { exercises, type SeedExercise } from "../prisma/content";
import { maximaExercises } from "../prisma/maxima-content";
import { intermediateSteps, foundationSteps, nextExerciseSlug } from "./historical-curriculum";

test("máximos y ausencia se presentan antes de buscar el segundo lugar", () => {
  for (const slug of ["maximo-de-una-lista", "primer-valor-o-ausencia"]) assert.ok(foundationSteps.includes(slug), slug);
  const start = intermediateSteps.indexOf("maximo-bajo-un-limite");
  assert.ok(start >= 0);
  assert.deepEqual(intermediateSteps.slice(start, start + 2), ["maximo-bajo-un-limite", "segundo-mayor"]);
  assert.equal(nextExerciseSlug("maximo-bajo-un-limite", intermediateSteps), "segundo-mayor");
  const challenge = exercises.find(exercise => exercise.slug === "segundo-mayor")!;
  for (const exercise of [...maximaExercises, challenge]) {
    assert.ok(exercise.tests.length <= 10, `${exercise.slug}: límite editorial de casos`);
  }
  assert.doesNotMatch(challenge.prerequisites!.join(" "), /[Oo]rdenaci/);
  for (const language of ["python", "javascript"] as const) {
    assert.equal(challenge[language].split("for ").length - 1, 2);
    assert.doesNotMatch(challenge[language], /sorted\(|\.sort\(|new Set|set\(|Infinity|float\(/);
    assert.ok(!challenge.starters![language].includes("for "), "el reto retira los recorridos guiados");
  }
});

test("cada actividad de máximos se resuelve con el cambio acotado que explica", () => {
  const changes: Record<string, { python: [string, string]; javascript: [string, string] }> = {
    "maximo-de-una-lista": { python: ["numero < mayor", "numero > mayor"], javascript: ["numero < mayor", "numero > mayor"] },
    "primer-valor-o-ausencia": { python: ["return 0", "return None"], javascript: ["return 0", "return null"] },
    "maximo-bajo-un-limite": { python: ["numero <= limite", "numero < limite"], javascript: ["numero <= limite", "numero < limite"] },
  };
  for (const exercise of maximaExercises) for (const language of ["python", "javascript"] as const) {
    const [from, to] = changes[exercise.slug][language];
    const starter = exercise.starters![language];
    assert.equal(starter.split(from).length, 2, `${exercise.slug}: cambio inequívoco`);
    assert.equal(starter.replace(from, to), exercise[language], `${exercise.slug}: referencia ${language}`);
  }
});

test("las referencias de máximos distinguen ausencia, cero, negativos y duplicados en ambos lenguajes", () => {
  // Enumeración independiente del algoritmo editorial; solo referencias del repositorio.
  const arrays: number[][] = [[]];
  let layer: number[][] = [[]];
  for (let size = 1; size <= 5; size++) {
    layer = layer.flatMap(values => [-2, 0, 1].map(value => [...values, value]));
    arrays.push(...layer);
  }
  const slugs = [...maximaExercises.map(exercise => exercise.slug), "segundo-mayor"];
  const items = slugs.map(slug => {
    const exercise = exercises.find(item => item.slug === slug)!;
    const tests = arrays.flatMap<SeedExercise["tests"][number]>(numbers => {
      if (slug === "maximo-de-una-lista") return numbers.length ? [{ input: numbers, expected: Math.max(...numbers) }] : [];
      if (slug === "primer-valor-o-ausencia") return [{ input: numbers, expected: numbers[0] ?? null }];
      if (slug === "segundo-mayor") return [{ input: numbers, expected: [...new Set(numbers)].sort((a, b) => b - a)[1] ?? null }];
      return [-3, -2, 0, 1, 2].map(limit => {
        const eligible = numbers.filter(number => number < limit);
        return { input: { numbers, limit }, expected: eligible.length ? Math.max(...eligible) : null };
      });
    });
    return { ...exercise, tests };
  });
  for (const exercise of items) {
    const solve = new vm.Script(`${exercise.javascript}\nsolve`).runInNewContext({}, { timeout: 1000 });
    for (const fixture of exercise.tests) assert.deepEqual(solve(structuredClone(fixture.input)), fixture.expected, `${exercise.slug}: ${JSON.stringify(fixture.input)}`);
  }
  const driver = `import json,sys
for item in json.load(sys.stdin):
 scope={}
 exec(item['python'],scope)
 for case in item['tests']:
  actual=scope['solve'](case['input'])
  assert json.dumps(actual) == json.dumps(case['expected']), item['slug'] + ': ' + repr(case['input'])
print('Máximos correctos')
`;
  const result = spawnSync(process.env.PYTHON_BIN || "python", ["-c", driver], { input: JSON.stringify(items), encoding: "utf8", timeout: 15000 });
  assert.equal(result.status, 0, result.error?.message || result.stderr);
  assert.match(result.stdout, /Máximos correctos/);
});
