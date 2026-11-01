import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { pythonCatalog } from "../prisma/python-content";
import { pythonLessons } from "../prisma/python-lessons";
import { pythonReleaseFingerprint } from "../prisma/python-releases";
import { localTheoryContract } from "./python-local-theory-baseline";
import { beforePythonReferenceTheory, previousReferenceTheoryTasks, previousReferenceTheoryHints } from "./python-reference-theory-baseline";

const reviewed = ["logica-busqueda-lineal", "logica-longitud-texto", "logica-minusculas", "logica-vocales", "logica-invierte", "logica-elimina-caracter", "logica-palabras", "logica-ficha-producto", "logica-ficha-resultado", "logica-opcional", "logica-ausencia", "logica-auxiliares", "logica-variable-local", "logica-parametro-exterior", "logica-llamadas-independientes", "logica-sin-estado-global", "logica-encadena-retornos", "logica-dos-nombres-lista", "logica-reasigna-o-muta", "logica-copia-plana", "logica-conserva-entrada", "logica-registro-compartido", "logica-valida-divisor", "logica-valido-cero-ausente"];
const content = (slug: string) => pythonCatalog.find(entry => entry.slug === slug)!.content;

test("la teoría local llega a 120 actividades: 24 comunes revisadas con tres párrafos y dos pistas ajustados", () => {
  const common = pythonCatalog.filter(entry => !pythonLessons.has(entry.slug));
  assert.deepEqual(common.slice(48, 72).map(entry => entry.slug), reviewed);
  assert.equal(common.length - 72, 104);
  assert.equal(new Set([...pythonLessons.keys(), ...common.slice(0, 72).map(entry => entry.slug)]).size, 120);
  assert.equal(Object.keys(previousReferenceTheoryTasks).length, 3);
  assert.equal(Object.keys(previousReferenceTheoryHints).length, 2);
  for (const slug of reviewed) {
    const entry = content(slug);
    assert.equal(entry.runtimeMode, "FUNCTION", slug);
    assert.equal(entry.variants[0].statement, entry.statement, slug);
    assert.deepEqual([...entry.statement.matchAll(/^(Tu tarea|Entrada|Resultado esperado)\n/gm)].map(match => match[1]), ["Tu tarea", "Entrada", "Resultado esperado"], slug);
  }
});

test("la teoría y las pistas distinguen vinculación, copia superficial y cociente float de ausencia", () => {
  assert.match(content("logica-parametro-exterior").statement, /vinculado al objeto.*no se crea automáticamente una copia.*entero inmutable/);
  assert.doesNotMatch(content("logica-parametro-exterior").hints[0], /se copia al parámetro/);
  assert.match(content("logica-copia-plana").statement, /copia superficial.*enteros inmutables.*lista exterior/);
  assert.match(content("logica-valida-divisor").statement, /produce float.*3.0.*0.0.*no es None.*JSON puede mostrarlo como 0/);
  assert.match(content("logica-registro-compartido").hints[1], /valor asociado a la clave cantidad/);
  assert.match(content("logica-dos-nombres-lista").statement, /modificar intencionalmente la lista compartida/);
});

test("el tercer lote común conserva contratos y demás campos salvo tres párrafos y dos pistas concretas", () => {
  const payload = pythonCatalog.map(entry => ({ ...entry, content: {
    ...entry.content,
    ...(entry.slug in previousReferenceTheoryTasks ? { statement: localTheoryContract(entry.content.statement) } : {}),
    hints: entry.content.hints.map((hint, index) => previousReferenceTheoryHints[entry.slug]?.index === index ? "" : hint),
    variants: entry.content.variants.map(variant => entry.slug in previousReferenceTheoryTasks ? { ...variant, statement: localTheoryContract(variant.statement!) } : variant),
  } }));
  // Previa a la edición: no excluye listas completas de pistas ni contratos.
  assert.equal(createHash("sha256").update(JSON.stringify(payload)).digest("hex"), "5a9b149802f62231aeaf37db8a8b6584b4c2a0d40f0a00d475a84f6d88654120");
  const previous = pythonCatalog.map(entry => ({ ...entry, content: beforePythonReferenceTheory(entry.slug, entry.content) }));
  assert.equal(pythonReleaseFingerprint(previous), "d63d8c433c6871e16d12a250edced4a2d245443b5b213dcdf177c9f23fc29fa6");
});

test("modelos fijos comprueban argumentos sin copia, alias, independencia exterior y división float", () => {
  // Código fijo del repositorio: is consulta identidad directamente en el modelo,
  // no la infiere desde JSON ni certifica envíos o ausencia de toda mutación.
  const code = `import json
exterior=10
def doble(valor):
    return valor*2
assert doble(3)==6 and exterior==10
lista=[1]
def agregar(parametro):
    assert parametro is lista
    parametro.append(2)
agregar(lista)
assert lista==[1,2]
def reasignar(parametro):
    parametro=[9]
    return parametro
assert reasignar(lista)==[9] and lista==[1,2]
copia=list(lista)
assert copia is not lista
copia.append(3)
assert lista==[1,2] and copia==[1,2,3]
interior=[1]
original=[interior]
superficial=list(original)
assert superficial is not original and superficial[0] is interior
ficha={'cantidad':2}
alias=ficha
alias['cantidad']+=-3
assert alias is ficha and ficha['cantidad']==-1
for total,divisor,esperado in ((6,2,3.0),(0,2,0.0),(-6,2,-3.0)):
    resultado=total/divisor
    assert type(resultado) is float and resultado==esperado and resultado is not None
assert json.loads('0')==0.0
cero=0
assert None is not cero
print('ok')`;
  const result = spawnSync(process.env.PYTHON_BIN ?? "python", ["-c", code], { encoding: "utf8", timeout: 30000 });
  assert.equal(result.error, undefined);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), "ok");
});
