import { test } from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { spawnSync } from "node:child_process";
import { exercises, type SeedExercise } from "../prisma/content";
import { rotationExercises } from "../prisma/rotation-content";
import { intermediateSteps, nextExerciseSlug } from "../src/lib/learning-paths";

test("resto, avance circular y reconstrucción preceden a la rotación", () => {
  const slugs = [...rotationExercises.map(exercise => exercise.slug), "rotar-arreglo"];
  const start = intermediateSteps.indexOf(slugs[0]);
  assert.ok(start >= 0);
  assert.deepEqual(intermediateSteps.slice(start, start + slugs.length), slugs);
  assert.equal(nextExerciseSlug("recorre-en-circulo", intermediateSteps), "rotar-arreglo");
  const challenge = exercises.find(exercise => exercise.slug === "rotar-arreglo")!;
  for (const exercise of [...rotationExercises, challenge]) assert.ok(exercise.tests.length <= 10, exercise.slug);
  assert.doesNotMatch(challenge.prerequisites!.join(" "), /[Ss]egment|slicing/);
  for (const language of ["python", "javascript"] as const) {
    assert.match(challenge[language], /while.*leidos < tamano/);
    assert.match(challenge[language], /indice = \(indice \+ 1\) % tamano/);
    assert.doesNotMatch(challenge[language], /\.slice\(|\[-|\.pop\(|\.shift\(|\.unshift\(|\.sort\(/);
    assert.doesNotMatch(challenge.starters![language], /^\s*while/m, "el reto retira el bucle guiado");
  }
});

test("cada actividad circular se resuelve con el único cambio explicado", () => {
  const changes: Record<string, { python: [string, string]; javascript: [string, string] }> = {
    "reduce-vueltas-completas": { python: ["pasos % 2", "pasos % tamano"], javascript: ["pasos % 2", "pasos % tamano"] },
    "siguiente-indice-circular": { python: ["indice + 0", "indice + 1"], javascript: ["indice + 0", "indice + 1"] },
    "recorre-en-circulo": { python: ["indice = 0", "indice = data['start']"], javascript: ["indice = 0", "indice = data.start"] },
  };
  for (const exercise of rotationExercises) for (const language of ["python", "javascript"] as const) {
    const [from, to] = changes[exercise.slug][language];
    const starter = exercise.starters![language];
    assert.equal(starter.split(from).length, 2, `${exercise.slug}: cambio inequívoco`);
    assert.equal(starter.replace(from, to), exercise[language], `${exercise.slug}: referencia ${language}`);
  }
});

test("los recorridos circulares preservan la entrada, los valores y los índices en ambos lenguajes", () => {
  // Solo referencias fijas del repositorio. El oráculo rota moviendo el último
  // elemento al inicio, distinto del recorrido circular de la referencia.
  const arrays: number[][] = [[]];
  let layer: number[][] = [[]];
  for (let size = 1; size <= 4; size++) {
    layer = layer.flatMap(values => [-1, 0, 2].map(value => [...values, value]));
    arrays.push(...layer);
  }
  const items = [...rotationExercises, exercises.find(exercise => exercise.slug === "rotar-arreglo")!].map(exercise => {
    let tests: SeedExercise["tests"];
    if (exercise.slug === "reduce-vueltas-completas") tests = Array.from({ length: 20 }, (_, index) => index + 1)
      .flatMap(size => Array.from({ length: 61 }, (_, k) => ({ input: { k, size }, expected: k - Math.floor(k / size) * size })));
    else if (exercise.slug === "siguiente-indice-circular") tests = Array.from({ length: 20 }, (_, index) => index + 1)
      .flatMap(size => Array.from({ length: size }, (_, index) => ({ input: { index, size }, expected: index === size - 1 ? 0 : index + 1 })));
    else if (exercise.slug === "recorre-en-circulo") tests = arrays.flatMap(numbers => numbers.map((_, start) => ({
      input: { numbers, start }, expected: numbers.slice(start).concat(numbers.slice(0, start)),
    })));
    else tests = arrays.flatMap(numbers => [...Array.from({ length: 9 }, (_, k) => k), 1000000].map(k => {
      const expected = [...numbers];
      const turns = numbers.length ? k - Math.floor(k / numbers.length) * numbers.length : 0;
      for (let turn = 0; turn < turns; turn++) expected.unshift(expected.pop()!);
      return { input: { numbers, k }, expected };
    }));
    return { ...exercise, tests };
  });
  for (const exercise of items) {
    const context = vm.createContext({});
    new vm.Script(exercise.javascript).runInContext(context, { timeout: 1000 });
    const call = new vm.Script("solve(data)");
    for (const fixture of exercise.tests) {
      const input = structuredClone(fixture.input) as { numbers?: number[] };
      const original = input.numbers;
      let reads = 0;
      if (original) input.numbers = new Proxy(original, {
        get(values, property, receiver) {
          if (typeof property === "string" && /^-?\d+$/.test(property)) {
            const index = Number(property);
            assert.ok(index >= 0 && index < values.length, `${exercise.slug}: índice fuera de rango`);
            assert.ok(++reads <= values.length, `${exercise.slug}: más de una vuelta`);
          }
          return Reflect.get(values, property, receiver);
        },
        set() { throw new Error("La referencia modifica la entrada"); },
        deleteProperty() { throw new Error("La referencia elimina elementos de entrada"); },
      });
      context.data = input;
      const actual = call.runInContext(context, { timeout: 1000 });
      assert.deepEqual(JSON.parse(JSON.stringify(actual)), fixture.expected, `${exercise.slug}: ${JSON.stringify(fixture.input)}`);
      if (original) {
        assert.notEqual(actual, input.numbers, "la salida debe ser otra lista");
        assert.equal(reads, original.length, "se lee exactamente una vuelta");
        assert.deepEqual(original, (fixture.input as { numbers: number[] }).numbers);
      }
    }
  }
  const driver = `import json,sys
class CheckedList(list):
 def __init__(self, values):
  super().__init__(values)
  self.reads=0
 def __getitem__(self,index):
  assert isinstance(index,int) and 0 <= index < len(self), 'Índice fuera de rango'
  self.reads+=1
  assert self.reads <= len(self), 'Más de una vuelta'
  return super().__getitem__(index)
 def immutable(self,*args):
  raise AssertionError('Entrada modificada')
 __setitem__=__delitem__=append=extend=insert=pop=remove=clear=reverse=sort=__iadd__=__imul__=immutable
for item in json.load(sys.stdin):
 scope={}
 exec(item['python'],scope)
 for case in item['tests']:
  data=case['input']
  original=data.get('numbers')
  if original is not None:
   data['numbers']=CheckedList(original)
  actual=scope['solve'](data)
  assert json.dumps(actual) == json.dumps(case['expected']), item['slug']
  if original is not None:
   assert actual is not data['numbers'], 'Salida compartida'
   assert data['numbers'].reads == len(original), 'No se leyó una vuelta exacta'
   assert data['numbers'] == original, 'Entrada modificada'
print('Rotaciones correctas')
`;
  const result = spawnSync(process.env.PYTHON_BIN || "python", ["-c", driver], { input: JSON.stringify(items), encoding: "utf8", timeout: 15000 });
  assert.equal(result.status, 0, result.error?.message || result.stderr);
  assert.match(result.stdout, /Rotaciones correctas/);
});
