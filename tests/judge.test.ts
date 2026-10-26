import { test } from "node:test";
import assert from "node:assert/strict";
import { judge, judgeProgram } from "../src/server/execution/judge";
import { executionSchema, draftSchema } from "../src/lib/validation";
import { editorialSchema } from "../src/lib/editorial";
import { safeReturnTo } from "../src/lib/utils";

test("compara JSON por estructura, no por orden de propiedades", () => {
  const result = judge({stdout:'{"b":2,"a":1}\n',stderr:"",code:0},{input:"ab",expected:{a:1,b:2},visible:true,order:0});
  assert.equal(result.passed,true);
});
test("distingue tipos y arreglos ordenados", () => {
  assert.equal(judge({stdout:'"8"',stderr:"",code:0},{input:3,expected:8,visible:true,order:0}).passed,false);
  assert.equal(judge({stdout:'[2,1]',stderr:"",code:0},{input:3,expected:[1,2],visible:true,order:0}).passed,false);
});
test("nunca devuelve entradas, resultados ni stderr de pruebas ocultas", () => {
  const secret="contenido-privado";
  for (const output of [{stdout:JSON.stringify(secret),stderr:secret,code:0},{stdout:secret,stderr:secret,code:1},{stdout:secret,stderr:secret,code:null,status:"TO"}]) {
    const result=judge(output,{input:secret,expected:secret,visible:false,order:3});
    assert.equal(JSON.stringify(result).includes(secret),false);
    assert.equal("input" in result,false);assert.equal("expected" in result,false);assert.equal("actual" in result,false);assert.equal("error" in result,false);
  }
});
test("un error de proceso no aprueba aunque haya impreso el valor esperado", () => {
  assert.equal(judge({stdout:"8",stderr:"Traceback",code:1},{input:3,expected:8,visible:true,order:0}).passed,false);
});
test("acepta null y logs previos, rechaza salidas no JSON", () => {
  assert.equal(judge({stdout:"debug\nnull\n",stderr:"",code:0},{input:[],expected:null,visible:true,order:0}).passed,true);
  assert.equal(judge({stdout:"undefined",stderr:"",code:0},{input:[],expected:null,visible:true,order:0}).passed,false);
});
test("valida límites de programas, revisiones y destinos de retorno", () => {
  assert.equal(executionSchema.safeParse({variantId:"x",code:"x".repeat(30001),mode:"submit",idempotencyKey:crypto.randomUUID()}).success,false);
  assert.equal(draftSchema.safeParse({variantId:"x",code:"",revision:-1}).success,false);
  assert.equal(safeReturnTo("//evil.example"),"/inicio");
  assert.equal(safeReturnTo("/\\evil.example"),"/inicio");
  assert.equal(safeReturnTo("/ejercicios/suma-de-dos-numeros?lenguaje=python"),"/ejercicios/suma-de-dos-numeros?lenguaje=python");
});

test("el modo programa compara la salida completa y normaliza los finales de línea", () => {
  const base = { input: "", expected: "1\n2\n3\n", visible: true, order: 0 };
  assert.equal(judgeProgram({ stdout: "1\n2\n3\n", stderr: "", code: 0 }, base).passed, true);
  assert.equal(judgeProgram({ stdout: "1\r\n2\r\n3", stderr: "", code: 0 }, base).passed, true);
  assert.equal(judgeProgram({ stdout: "1\n2\n4\n", stderr: "", code: 0 }, base).passed, false);
  const trailing = judgeProgram({ stdout: "1 \n2\n3\n\n", stderr: "", code: 0 }, base);
  assert.equal(trailing.passed, true);
  assert.equal(trailing.output, "1 \n2\n3\n\n");
  assert.equal(judgeProgram({ stdout: "", stderr: "boom", code: 1 }, base).status, "runtime");
});

test("el modo programa no filtra la salida de las pruebas ocultas", () => {
  const secret = "salida-privada";
  const result = judgeProgram({ stdout: secret, stderr: secret, code: 0 }, { input: secret, expected: secret, visible: false, order: 2 });
  assert.equal("output" in result, false);
  assert.equal(JSON.stringify(result).includes(secret), false);
});

test("muestra los print de depuración solo en las pruebas visibles", () => {
  const visible = judge({ stdout: "depurando\n8\n", stderr: "", code: 0 }, { input: 3, expected: 8, visible: true, order: 0 });
  assert.equal(visible.passed, true);
  assert.equal(visible.output, "depurando");
  const hidden = judge({ stdout: "depurando\n8\n", stderr: "", code: 0 }, { input: 3, expected: 8, visible: false, order: 0 });
  assert.equal(hidden.output, undefined);
});

const programa = {
  slug: "programa-de-prueba", title: "Programa de prueba", description: "Un programa que muestra un número por la pantalla.",
  statement: "Escribe un programa que muestre el número 1 por la pantalla.", category: "Fundamentos", level: "BEGINNER", minutes: 5,
  objective: "Mostrar un número por la pantalla con print.", prerequisites: [], practiceGoals: ["Mostrar un valor por la pantalla."], prerequisiteSlugs: [],
  activityType: "GUIDED", runtimeMode: "PROGRAM", complexity: "", commonErrors: [], constraints: ["Escribe un programa completo."],
  hints: ["Una sola instrucción.", "El valor va sin comillas.", "Usa print o console.log."],
  python: { starter: "# escribe\n", solution: "print(1)\n", explanation: "Muestra el número con print." },
  javascript: { starter: "// escribe\n", solution: "console.log(1);\n", explanation: "Muestra el número con console.log." },
  typescript: { starter: "// escribe\n", solution: "console.log(1);\n", explanation: "Muestra el número con console.log." },
  tests: [
    { input: "", expected: "1\n", visible: true, explanation: "" },
    { input: "", expected: "1\n", visible: true, explanation: "" },
    { input: "", expected: "1\n", visible: false, explanation: "" },
  ],
};

test("el modo programa exige entradas y salidas de texto", () => {
  assert.equal(editorialSchema.safeParse(programa).success, true);
  const numeric = { ...programa, tests: [{ input: 1, expected: 1, visible: true, explanation: "" }, { input: 1, expected: 1, visible: true, explanation: "" }, { input: 1, expected: 1, visible: false, explanation: "" }] };
  assert.equal(editorialSchema.safeParse(numeric).success, false);
  assert.equal(editorialSchema.safeParse({ ...programa, runtimeMode: "FUNCTION", tests: numeric.tests.map((test, index) => ({ ...test, input: index })) }).success, true);
});
