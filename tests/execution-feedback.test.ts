import { test } from "node:test";
import assert from "node:assert/strict";
import { executionFeedback } from "../src/lib/execution-feedback";

test("los errores tienen una orientación comprensible sin sustituir el diagnóstico", () => {
  assert.match(executionFeedback("timeout"), /bucle termina/);
  assert.match(executionFeedback("runtime", "IndentationError: unexpected indent"), /sangría/);
  assert.match(executionFeedback("runtime", "NameError: x"), /nombre/);
  assert.match(executionFeedback("runtime", "error TS2322"), /tipos/);
  assert.match(executionFeedback("runtime", "error desconocido"), /se detuvo/);
  assert.match(executionFeedback("wrong"), /Compara/);
});
