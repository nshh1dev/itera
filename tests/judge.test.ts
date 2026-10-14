import { test } from "node:test";
import assert from "node:assert/strict";
import { judge } from "../src/server/execution/judge";
import { executionSchema, draftSchema } from "../src/lib/validation";
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
