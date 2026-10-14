import { test } from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { spawnSync } from "node:child_process";
import { exercises, type SeedExercise } from "../prisma/content";
import { searchExercises } from "../prisma/search-content";
import { intermediateSteps, nextExerciseSlug } from "../src/lib/learning-paths";

test("while, índices, centro y descarte preceden a la búsqueda binaria", () => {
  const slugs = [...searchExercises.map(exercise => exercise.slug), "busqueda-binaria"];
  const start = intermediateSteps.indexOf(slugs[0]);
  assert.ok(start >= 0);
  assert.deepEqual(intermediateSteps.slice(start, start + slugs.length), slugs);
  assert.equal(nextExerciseSlug("descarta-una-mitad", intermediateSteps), "busqueda-binaria");
  const challenge = exercises.find(exercise => exercise.slug === "busqueda-binaria")!;
  for (const exercise of [...searchExercises, challenge]) {
    assert.ok(exercise.tests.length <= 10, `${exercise.slug}: límite editorial`);
  }
  for (const language of ["python", "javascript"] as const) {
    const solution = challenge[language];
    assert.match(solution, /while.*izquierda <= derecha/);
    assert.match(solution, /izquierda = centro \+ 1/);
    assert.match(solution, /derecha = centro - 1/);
    assert.doesNotMatch(solution, /\.index\(|\.indexOf\(|\.findIndex\(|\.sort\(|sorted\(|\.slice\(|\bfor\b/);
    assert.ok(!challenge.starters![language].includes("while"), "el reto retira el bucle guiado");
  }
});

test("cada actividad de búsqueda se resuelve con el único cambio explicado", () => {
  const changes: Record<string, { python: [string, string]; javascript: [string, string] }> = {
    "repite-con-while": { python: ["contador + 2", "contador + 1"], javascript: ["contador + 2", "contador + 1"] },
    "recorre-por-indices": { python: ["data[0]", "data[indice]"], javascript: ["data[0]", "data[indice]"] },
    "punto-medio-del-intervalo": { python: ["// 1", "// 2"], javascript: ["/ 1", "/ 2"] },
    "descarta-una-mitad": { python: ["derecha = centro + 1", "derecha = centro - 1"], javascript: ["derecha = centro + 1", "derecha = centro - 1"] },
  };
  for (const exercise of searchExercises) for (const language of ["python", "javascript"] as const) {
    const [from, to] = changes[exercise.slug][language];
    const starter = exercise.starters![language];
    assert.equal(starter.split(from).length, 2, `${exercise.slug}: cambio inequívoco`);
    assert.equal(starter.replace(from, to), exercise[language], `${exercise.slug}: referencia ${language}`);
  }
});

test("las búsquedas preservan índices, terminan y reducen el intervalo en ambos lenguajes", () => {
  // Solo referencias fijas del repositorio. El oráculo usa búsqueda lineal;
  // los contadores de acceso comprueban la referencia, no programas de usuarios.
  const universe = [-7, -3, 0, 4, 9];
  const lists = Array.from({ length: 1 << universe.length }, (_, mask) => universe.filter((_, index) => mask & (1 << index)));
  const queries = lists.flatMap(numbers => Array.from({ length: 21 }, (_, index) => ({ numbers, target: index - 9 })));
  const large = Array.from({ length: 10000 }, (_, index) => index * 2 - 10000);
  const items = [...searchExercises, exercises.find(exercise => exercise.slug === "busqueda-binaria")!].map(exercise => {
    let tests: SeedExercise["tests"];
    if (exercise.slug === "repite-con-while") tests = Array.from({ length: 101 }, (_, input) => ({ input, expected: input }));
    else if (exercise.slug === "recorre-por-indices") tests = [...lists, [9, 0, -3, 9], []].map(input => ({ input, expected: input }));
    else if (exercise.slug === "punto-medio-del-intervalo") tests = Array.from({ length: 21 }, (_, left) =>
      Array.from({ length: 21 - left }, (_, offset) => ({ input: { left, right: left + offset }, expected: left + Math.floor(offset / 2) }))).flat();
    else if (exercise.slug === "descarta-una-mitad") tests = queries.map(input => {
      const { numbers, target } = input;
      if (!numbers.length) return { input, expected: [0, -1] };
      const centre = Math.floor((numbers.length - 1) / 2);
      if (numbers[centre] === target) return { input, expected: [centre, centre] };
      const indices = numbers.map((_, index) => index).filter(index => target < numbers[centre] ? index < centre : index > centre);
      return { input, expected: indices.length ? [indices[0], indices.at(-1)!] : target < numbers[centre] ? [0, -1] : [numbers.length, numbers.length - 1] };
    });
    else tests = [...queries, ...[-10001, -10000, -9998, -1, 0, 9996, 9998, 9999].map(target => ({ numbers: large, target }))]
      .map(input => ({ input, expected: input.numbers.indexOf(input.target) }));
    return { ...exercise, tests };
  });
  for (const exercise of items) {
    const context = vm.createContext({});
    new vm.Script(exercise.javascript).runInContext(context, { timeout: 1000 });
    const call = new vm.Script("solve(data)");
    for (const fixture of exercise.tests) {
      const input = structuredClone(fixture.input);
      let reads = 0;
      let budget = Infinity;
      if (input && !Array.isArray(input) && typeof input === "object" && Array.isArray(input.numbers)) {
        const numbers = input.numbers;
        budget = exercise.slug === "descarta-una-mitad" ? 2 : 2 * Math.ceil(Math.log2(numbers.length + 1));
        input.numbers = new Proxy(numbers, { get(values, property, receiver) {
          if (typeof property === "string" && /^-?\d+$/.test(property)) {
            const index = Number(property);
            assert.ok(index >= 0 && index < values.length, `${exercise.slug}: índice fuera de rango ${index}`);
            assert.ok(++reads <= budget, `${exercise.slug}: demasiados accesos`);
          }
          return Reflect.get(values, property, receiver);
        } });
      }
      context.data = input;
      const actual = call.runInContext(context, { timeout: 1000 });
      assert.deepEqual(JSON.parse(JSON.stringify(actual)), fixture.expected, `${exercise.slug}: ${JSON.stringify(fixture.input).slice(0, 200)}`);
      assert.ok(reads <= budget);
    }
  }
  const driver = `import json,sys,math
class CheckedList(list):
 def __init__(self, values, budget):
  super().__init__(values)
  self.reads=0
  self.budget=budget
 def __getitem__(self, index):
  assert isinstance(index,int) and 0 <= index < len(self), 'Índice fuera de rango'
  self.reads+=1
  assert self.reads <= self.budget, 'Demasiados accesos'
  return super().__getitem__(index)
for item in json.load(sys.stdin):
 scope={}
 exec(item['python'],scope)
 for case in item['tests']:
  data=case['input']
  if isinstance(data,dict) and 'numbers' in data:
   budget=2 if item['slug']=='descarta-una-mitad' else 2*math.ceil(math.log2(len(data['numbers'])+1))
   data['numbers']=CheckedList(data['numbers'],budget)
  actual=scope['solve'](data)
  assert json.dumps(actual) == json.dumps(case['expected']), item['slug']
print('Búsquedas correctas')
`;
  const result = spawnSync(process.env.PYTHON_BIN || "python", ["-c", driver], { input: JSON.stringify(items), encoding: "utf8", timeout: 15000 });
  assert.equal(result.status, 0, result.error?.message || result.stderr);
  assert.match(result.stdout, /Búsquedas correctas/);
});
