import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { pythonCatalog } from "../prisma/python-content";
import { pythonLessons } from "../prisma/python-lessons";
import { pythonReleaseFingerprint } from "../prisma/python-releases";
import { beforePythonLocalTheory, localTheoryContract, previousLocalTheoryTasks } from "./python-local-theory-baseline";

const reviewed = ["python-constante", "python-decimal", "python-condicional", "python-centinela", "python-omite-negativos", "python-ordena-numeros", "python-recorta", "python-une-palabras", "python-desempaqueta", "python-enumera", "python-empareja", "python-retorno-multiple", "python-identidad", "python-opcional-seguro", "python-actualiza-diccionario", "python-borra-clave"];
const content = (slug: string) => pythonCatalog.find(entry => entry.slug === slug)!.content;

test("se revisa teoría local en 16 actividades propias: tres ajustes y trece introducciones conservadas", () => {
  assert.deepEqual(pythonCatalog.filter(entry => pythonLessons.has(entry.slug)).slice(0, 16).map(entry => entry.slug), reviewed);
  assert.deepEqual(new Set(Object.keys(previousLocalTheoryTasks)), new Set(["python-retorno-multiple", "python-identidad", "python-actualiza-diccionario"]));
  for (const slug of reviewed) {
    const entry = content(slug);
    assert.equal(entry.variants[0].statement, entry.statement, slug);
    assert.deepEqual([...entry.statement.matchAll(/^(Tu tarea|Entrada|Resultado esperado)\n/gm)].map(match => match[1]), ["Tu tarea", "Entrada", "Resultado esperado"], slug);
    assert.equal(entry.hints.length, 3, slug);
  }
  assert.equal(reviewed.length - Object.keys(previousLocalTheoryTasks).length, 13);
});

test("la teoría distingue return alcanzado, copia exterior y elementos compartidos sin generalizar a copia profunda", () => {
  assert.match(content("python-retorno-multiple").statement, /tupla.*Ejecutar return termina esa llamada.*condición decide cuál se alcanza, no su orden de escritura/);
  assert.doesNotMatch(content("python-retorno-multiple").statement, /solo se ejecuta el primer return/);
  assert.match(content("python-identidad").statement, /lista exterior.*referencias.*copia superficial.*sin modificar elementos interiores/);
  assert.match(content("python-actualiza-diccionario").statement, /diccionario exterior nuevo.*copia superficial.*enteros inmutables.*listas o diccionarios interiores compartidos/);
  // Introducción, pista final y explicación posterior siguen siendo superficies
  // distintas: este lote no borra el contexto necesario para practicar la técnica.
  assert.match(content("python-condicional").statement, /'sí' if condicion else 'no'/);
  assert.match(content("python-centinela").statement, /break.*bucle más cercano/);
  assert.match(content("python-omite-negativos").statement, /continue.*a diferencia de break/);
  assert.match(content("python-ordena-numeros").statement, /sort\(\).*devuelve None/);
  assert.match(content("python-opcional-seguro").statement, /valores predeterminados se calculan al definir/);
});

test("el primer lote de teoría local conserva contratos y toda superficie salvo tres párrafos de tarea", () => {
  const payload = pythonCatalog.map(entry => !(entry.slug in previousLocalTheoryTasks) ? entry : ({ ...entry, content: {
    ...entry.content, statement: localTheoryContract(entry.content.statement),
    variants: entry.content.variants.map(variant => ({ ...variant, statement: localTheoryContract(variant.statement!) })),
  } }));
  // Calculada antes de editar: incluye Entrada/Resultado esperado, 221 enunciados
  // íntegros, soluciones, ejemplos, ayudas, tiempos y fuentes compartidas.
  assert.equal(createHash("sha256").update(JSON.stringify(payload)).digest("hex"), "427e37a334e67afb12d162f14a469a2207ea08db7051849bde3dc8e1a374906c");
  const previous = pythonCatalog.map(entry => ({ ...entry, content: beforePythonLocalTheory(entry.slug, entry.content) }));
  assert.equal(pythonReleaseFingerprint(previous), "12607d2d946b057d3a7a3310db969501804e300628b2004e9a402391b590a93d");
});

test("ejemplos fijos independientes confirman retorno alcanzado, alias y alcance de las copias superficiales", () => {
  // Solo modelos fijos de Python. No son programas de alumnos ni acreditan el
  // sandbox; las comprobaciones is son del modelo, no inferencias desde JSON.
  const code = `def elegir(valor):
    if valor < 0:
        return 'negativo'
    return 'otro'
    raise AssertionError('no debe continuar')
assert elegir(-1) == 'negativo'
assert elegir(0) == 'otro'
def resumen(a,b):
    return a+b,a*b
assert resumen(2,3) == (5,6)
assert type(resumen(2,3)) is tuple
interior=[1]
entrada=[interior]
original=list(entrada)
alias=original
copia=list(original)
assert alias is original and copia is not original
assert copia[0] is original[0] is entrada[0]
alias.append(2)
assert entrada == [[1]] and copia == [[1]] and original == [[1],2]
copia[0].append(3)
assert entrada == [[1,3]] and original == [[1,3],2]
valores={'a':2,'b':3}
copia=dict(valores)
copia['a']=0
assert valores == {'a':2,'b':3} and copia == {'a':0,'b':3}
anidado={'a':[1]}
superficial=dict(anidado)
assert superficial is not anidado and superficial['a'] is anidado['a']
superficial['a'].append(2)
assert anidado == {'a':[1,2]}
print('ok')`;
  const result = spawnSync(process.env.PYTHON_BIN ?? "python", ["-c", code], { encoding: "utf8", timeout: 30000 });
  assert.equal(result.error, undefined);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), "ok");
});
