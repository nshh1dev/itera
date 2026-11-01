import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { pythonCatalog } from "../prisma/python-content";
import { pythonLessons } from "../prisma/python-lessons";
import { pythonReleaseFingerprint } from "../prisma/python-releases";
import { localTheoryContract } from "./python-local-theory-baseline";
import { beforePythonFlowTheory, previousFlowTheoryTasks } from "./python-flow-theory-baseline";

const reviewed = ["logica-predice-valores", "logica-tabla-valores", "logica-minutos-segundos", "logica-perimetro", "logica-repara-presupuesto", "logica-merienda", "logica-elige-mensaje", "logica-signo", "logica-mayor-tres", "logica-dos-requisitos", "logica-alternativas", "logica-tarifa", "logica-uno-n", "logica-cuenta-atras", "logica-suma-uno-n", "logica-tabla", "logica-multiplos", "logica-bucle-roto", "logica-posicion", "logica-indices", "logica-suma-lista", "logica-maximo", "logica-cuenta-condicion", "logica-filtra-lista"];
const content = (slug: string) => pythonCatalog.find(entry => entry.slug === slug)!.content;

test("se revisan otras 24 teorías comunes de flujo y listas: dos ajustes y 22 consignas conservadas", () => {
  const common = pythonCatalog.filter(entry => !pythonLessons.has(entry.slug));
  assert.deepEqual(common.slice(24, 48).map(entry => entry.slug), reviewed);
  assert.equal(common.length - 48, 128);
  assert.equal(new Set([...pythonLessons.keys(), ...common.slice(0, 48).map(entry => entry.slug)]).size, 96);
  assert.deepEqual(new Set(Object.keys(previousFlowTheoryTasks)), new Set(["logica-dos-requisitos", "logica-alternativas"]));
  for (const slug of reviewed) {
    const entry = content(slug);
    assert.equal(entry.runtimeMode, "FUNCTION", slug);
    assert.equal(entry.variants[0].statement, entry.statement, slug);
    assert.deepEqual([...entry.statement.matchAll(/^(Tu tarea|Entrada|Resultado esperado)\n/gm)].map(match => match[1]), ["Tu tarea", "Entrada", "Resultado esperado"], slug);
  }
});

test("las introducciones explican conjunción y alternativas booleanas sin adelantar la fórmula del reto", () => {
  assert.match(content("logica-dos-requisitos").statement, /Con dos valores booleanos, and.*ambos son True.*basta un False.*no las cantidades numéricas/s);
  assert.match(content("logica-alternativas").statement, /Con valores booleanos, or.*incluidos ambos; not invierte.*paréntesis/s);
  const task = content("logica-alternativas").statement.split("\n\nEntrada\n")[0];
  assert.doesNotMatch(task, /\(.*invitacion.*or.*entrada.*\).*and.*not/);
  assert.match(content("logica-alternativas").hints[2], /or.*not bloqueado.*and/);
  assert.match(content("logica-bucle-roto").statement, /No elimines el avance.*no terminaría/);
  assert.match(content("logica-posicion").statement, /posición del valor que contiene/);
  assert.match(content("logica-cuenta-condicion").statement, /cuántos elementos.*no su suma/s);
});

test("el segundo lote común conserva todo salvo dos párrafos y reconstruye la entrega anterior", () => {
  const payload = pythonCatalog.map(entry => !(entry.slug in previousFlowTheoryTasks) ? entry : ({ ...entry, content: {
    ...entry.content, statement: localTheoryContract(entry.content.statement),
    variants: entry.content.variants.map(variant => ({ ...variant, statement: localTheoryContract(variant.statement!) })),
  } }));
  // Calculada antes de editar: protege contratos, 22 consignas conservadas y
  // toda superficie ajena, incluidas las fuentes comunes de los tres lenguajes.
  assert.equal(createHash("sha256").update(JSON.stringify(payload)).digest("hex"), "600f790d458b52ee48ead649d06285e3035cae1e81c5d229fbbcc79851bdd431");
  const previous = pythonCatalog.map(entry => ({ ...entry, content: beforePythonFlowTheory(entry.slug, entry.content) }));
  assert.equal(pythonReleaseFingerprint(previous), "7437d98d5aaac234358b8e6d4ec9335fcbd8a6090390f0a24fec00f6958ffa29");
});

test("modelos fijos confirman las tablas booleanas, agrupación, acumulación e índices", () => {
  // Modelos fijos independientes, no programas de alumnos ni comprobación de
  // técnicas internas o aislamiento. Las entradas de operadores son booleanas.
  const code = `from itertools import product
conjuncion=[False,False,False,True]
alternativa=[False,True,True,True]
for i,(a,b) in enumerate(product((False,True),repeat=2)):
    assert (a and b) is conjuncion[i]
    assert (a or b) is alternativa[i]
    assert (not a) is (a is False)
assert (True or True) is True
acceso=[False,False,True,False,True,False,True,False]
for i,(invitacion,entrada,bloqueado) in enumerate(product((False,True),repeat=3)):
    assert ((invitacion or entrada) and not bloqueado) is acceso[i]
assert (True or False and not True) is True
assert ((True or False) and not True) is False
for n in (0,1,4):
    total=0
    i=1
    while i<=n:
        total+=i
        i+=1
    assert total==[0,1,10][(0,1,4).index(n)]
assert list(range(1,1))==[] and list(range(0,-1,-1))==[0]
valores=[8,-2,8]
assert [valores[i] for i in range(len(valores))]==[8,-2,8]
assert [i for i in range(len(valores))]==[0,1,2]
assert sum(n for n in [0,-1,3,3] if n>0)==6
assert sum(1 for n in [0,-1,3,3] if n>0)==2
print('ok')`;
  const result = spawnSync(process.env.PYTHON_BIN ?? "python", ["-c", code], { encoding: "utf8", timeout: 30000 });
  assert.equal(result.error, undefined);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), "ok");
});
