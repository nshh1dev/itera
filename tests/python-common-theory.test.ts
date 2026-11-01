import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { pythonCatalog } from "../prisma/python-content";
import { pythonLessons } from "../prisma/python-lessons";
import { pythonReleaseFingerprint } from "../prisma/python-releases";
import { localTheoryContract } from "./python-local-theory-baseline";
import { beforePythonCommonTheory, previousCommonTheoryTasks } from "./python-common-theory-baseline";

const reviewed = ["logica-saludo", "logica-dos-lineas", "logica-orden-mensaje", "logica-texto-calculo", "logica-guarda-nombre", "logica-guarda-cantidad", "logica-actualiza-puntos", "logica-intercambia", "logica-suma-cantidades", "logica-cambio", "logica-precio-unidades", "logica-parentesis", "logica-lee-nombre", "logica-lee-doble", "logica-lee-suma", "logica-mensaje-resultado", "logica-numero-texto", "logica-booleano", "logica-igualdad", "logica-alcanza", "logica-retorno", "logica-parametro", "logica-dos-parametros", "logica-imprimir-devolver"];
const content = (slug: string) => pythonCatalog.find(entry => entry.slug === slug)!.content;

test("la teoría local revisa las primeras 24 comunes: tres ajustes y 21 consignas conservadas", () => {
  const common = pythonCatalog.filter(entry => !pythonLessons.has(entry.slug));
  assert.deepEqual(common.slice(0, 24).map(entry => entry.slug), reviewed);
  assert.equal(common.length - reviewed.length, 152);
  assert.deepEqual(new Set(Object.keys(previousCommonTheoryTasks)), new Set(["logica-igualdad", "logica-retorno", "logica-imprimir-devolver"]));
  for (const slug of reviewed) {
    const entry = content(slug);
    assert.equal(entry.variants[0].statement, entry.statement, slug);
    assert.deepEqual([...entry.statement.matchAll(/^(Tu tarea|Entrada|Resultado esperado)\n/gm)].map(match => match[1]), ["Tu tarea", "Entrada", "Resultado esperado"], slug);
  }
  assert.equal(reviewed.filter(slug => content(slug).runtimeMode === "PROGRAM").length, 20);
  assert.equal(new Set([...pythonLessons.keys(), ...reviewed]).size, 72);
});

test("las introducciones distinguen igualdad, asignación, impresión y retorno sin cambiar formatos PROGRAM", () => {
  assert.match(content("logica-igualdad").statement, /== compara.*True o False; = asigna.*transforma el booleano/);
  assert.match(content("logica-igualdad").statement, /Muestra true.*false/s);
  assert.match(content("logica-retorno").statement, /return entrega.*termina esa llamada.*no lo muestra/);
  assert.match(content("logica-imprimir-devolver").statement, /print muestra.*devuelve None.*return print\(\.\.\.\).*tampoco devuelve/);
  assert.match(content("logica-actualiza-puntos").statement, /valor actual de la variable/);
  assert.match(content("logica-parentesis").statement, /sumar primero y multiplicar después/);
  assert.match(content("logica-booleano").statement, /True.*texto 'True'.*str y lower/);
});

test("el primer lote común de teoría conserva todo salvo tres párrafos y reconstruye la entrega anterior", () => {
  const payload = pythonCatalog.map(entry => !(entry.slug in previousCommonTheoryTasks) ? entry : ({ ...entry, content: {
    ...entry.content, statement: localTheoryContract(entry.content.statement),
    variants: entry.content.variants.map(variant => ({ ...variant, statement: localTheoryContract(variant.statement!) })),
  } }));
  // Previa a la edición: conserva contratos y salida PROGRAM, soluciones,
  // ayudas, ejemplos, tiempos y las fuentes compartidas de los tres lenguajes.
  assert.equal(createHash("sha256").update(JSON.stringify(payload)).digest("hex"), "2fcaf0449efee11d8e72a325b7b2838fae8ac9a5a1aa195f9dd29e4988fc34d2");
  const previous = pythonCatalog.map(entry => ({ ...entry, content: beforePythonCommonTheory(entry.slug, entry.content) }));
  assert.equal(pythonReleaseFingerprint(previous), "c1967544da5e2b6be3d8c1689adadcba69ce092fd099be2d94cdcfc1d65a38dc");
});

test("modelos fijos confirman igualdad booleana, salida exacta, None de print y fin de la llamada", () => {
  // Modelos fijos, nunca código de alumnos. No acreditan aislamiento ni técnicas
  // internas de envíos que producen el mismo resultado observable.
  const code = `import io,contextlib
a=4
b=4
assert type(a==b) is bool and (a==b) is True
assert (a==5) is False and a==4
output=io.StringIO()
with contextlib.redirect_stdout(output):
    print(str(a==b).lower())
    print(str(a==5).lower())
assert output.getvalue()=='true\\nfalse\\n'
def devolver(valor):
    return valor
    raise AssertionError('no continúa tras return')
output=io.StringIO()
with contextlib.redirect_stdout(output):
    valor=devolver(7)
assert valor==7 and output.getvalue()==''
def imprimir(valor):
    return print(valor+1)
output=io.StringIO()
with contextlib.redirect_stdout(output):
    retorno=imprimir(2)
assert retorno is None and output.getvalue()=='3\\n'
assert 4+2==6 and '4'+'2'=='42'
assert (4+3)*2==14 and 4+3*2==10
print('ok')`;
  const result = spawnSync(process.env.PYTHON_BIN ?? "python", ["-c", code], { encoding: "utf8", timeout: 30000 });
  assert.equal(result.error, undefined);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), "ok");
});
