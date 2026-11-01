import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { pythonCatalog } from "../prisma/python-content";
import { pythonIntroExplanations } from "../prisma/python-intro-explanations";
import { pythonRecordExplanations } from "../prisma/python-record-explanations";
import { pythonCollectionExplanations } from "../prisma/python-collection-explanations";
import { pythonFoundationExplanations } from "../prisma/python-foundation-explanations";
import { pythonSolutionExplanations } from "../prisma/python-vocabulary";
import { pythonLessons } from "../prisma/python-lessons";
import { pythonReleaseFingerprint } from "../prisma/python-releases";
import type { Json } from "../src/lib/types";
import { beforePythonIntro } from "./python-intro-baseline";

const retained = ["logica-dos-lineas", "logica-orden-mensaje", "logica-texto-calculo", "logica-guarda-nombre", "logica-guarda-cantidad", "logica-actualiza-puntos", "logica-suma-cantidades", "logica-cambio", "logica-precio-unidades", "logica-parentesis", "logica-mensaje-resultado", "logica-numero-texto"];

test("se revisan 24 explicaciones comunes iniciales: doce ajustes y doce textos conservados", () => {
  const block = pythonCatalog.filter(entry => !pythonLessons.has(entry.slug) && !(entry.slug in pythonSolutionExplanations)).slice(0, 24);
  assert.equal(Object.keys(pythonIntroExplanations).length, 12);
  assert.deepEqual(new Set(block.map(entry => entry.slug)), new Set([...retained, ...Object.keys(pythonIntroExplanations)]));
  assert.equal(block.filter(entry => entry.content.runtimeMode === "PROGRAM").length, 20);
  for (const entry of block) {
    const text = entry.content.variants[0].explanation;
    assert.equal(text, pythonIntroExplanations[entry.slug] ?? entry.baseline!.variants[0].explanation, entry.slug);
    assert.doesNotMatch(text, /\bNode\b|JavaScript|TypeScript|En Python\n|Razonamiento\n|Paso a paso\n|Coste\n/, entry.slug);
  }
  // Este bloque suma 24 identidades revisadas aunque solo doce necesiten cambios.
  const reviewed = new Set([...Object.keys(pythonRecordExplanations), ...Object.keys(pythonCollectionExplanations), ...Object.keys(pythonFoundationExplanations), ...Object.keys(pythonSolutionExplanations), ...Object.keys(pythonIntroExplanations), ...retained]);
  assert.equal(reviewed.size, 97);
  assert.equal(pythonCatalog.length - reviewed.size, 127);
});

test("los ajustes siguen la traza y distinguen salida PROGRAM, tipos y retornos", () => {
  const text = pythonIntroExplanations;
  assert.match(text["logica-saludo"], /print es una función.*programa completo/);
  assert.match(text["logica-intercambia"], /conserva el 3.*ambos valores en 8/);
  assert.match(text["logica-lee-nombre"], /sin su salto final.*incluye la coma y el espacio/);
  assert.match(text["logica-lee-doble"], /numero \* 2 produce 6.*texto \* 2.*33/);
  assert.match(text["logica-lee-suma"], /6, no 42.*Convertir solo una entrada/);
  assert.match(text["logica-booleano"], /str\(listo\).*no reasigna listo/);
  assert.match(text["logica-igualdad"], /True.*False.*== compara sin asignar/);
  assert.match(text["logica-alcanza"], /Con 9.*10 y 11.*Usar >.*usar ==/);
  assert.match(text["logica-retorno"], /-3 devuelve -3.*0 devuelve 0.*no hace falta llamar a solve/);
  assert.match(text["logica-parametro"], /-3, -6.*0, 0.*no se utiliza el signo ×/);
  assert.match(text["logica-imprimir-devolver"], /mostrar ese 5 y devolver 0.*No basta con corregir el print/);
  assert.match(text["logica-predice-valores"], /x en 2.*en 5.*entrega 10.*daría 7.*casos no prueban/);
  // La revisión no retira ni amplía la regla conceptual de las prácticas guiadas.
  assert.equal(pythonCatalog.find(entry => entry.slug === "logica-guarda-cantidad")!.content.conceptRule, "variable");
  assert.equal(pythonCatalog.find(entry => entry.slug === "logica-intercambia")!.content.conceptRule, "swap");
  assert.equal(pythonCatalog.find(entry => entry.slug === "logica-booleano")!.content.conceptRule, "boolean");
});

test("el sexto lote solo cambia doce explicaciones y reconstruye íntegra la entrega previa", () => {
  const payload = pythonCatalog.map(entry => ({ ...entry, content: { ...entry.content, variants: entry.content.variants.map(variant => {
    if (!(entry.slug in pythonIntroExplanations)) return variant;
    const { explanation, ...rest } = variant;
    void explanation;
    return rest;
  }) } }));
  // Calculada antes de editar: protege también los doce textos conservados.
  assert.equal(createHash("sha256").update(JSON.stringify(payload)).digest("hex"), "7fd10b9e7b8b1e484bc75debee46e087c9564a140106e078c3af993e4e57a9b0");
  const previous = pythonCatalog.map(entry => ({ ...entry, content: beforePythonIntro(entry.slug, entry.content) }));
  assert.equal(pythonReleaseFingerprint(previous), "88d30aba0d182bd99656c39d7096bfefcffe1819a22b6b9a616906e649639e42");
});

// Solo programas y funciones fijos del repositorio, nunca código enviado por alumnos.
const examples: Record<string, [Json, Json][]> = {
  "logica-saludo": [["", "Hola, mundo!\n"]],
  "logica-dos-lineas": [["", "Primera\nSegunda\n"]],
  "logica-orden-mensaje": [["", "Preparar\nMezclar\nServir\n"]],
  "logica-texto-calculo": [["", "10\n4 + 6\n"]],
  "logica-guarda-nombre": [["", "Ada\n"]],
  "logica-guarda-cantidad": [["", "8\n"]],
  "logica-actualiza-puntos": [["", "11\n"]],
  "logica-intercambia": [["", "8\n3\n"]],
  "logica-suma-cantidades": [["", "12\n"]],
  "logica-cambio": [["", "7\n"]],
  "logica-precio-unidades": [["", "24\n"]],
  "logica-parentesis": [["", "14\n"]],
  "logica-lee-nombre": [["Ada\n", "Hola, Ada\n"], ["Ana Maria\n", "Hola, Ana Maria\n"]],
  "logica-lee-doble": [["3\n", "6\n"], ["-3\n", "-6\n"], ["0\n", "0\n"]],
  "logica-lee-suma": [["4\n2\n", "6\n"], ["-4\n4\n", "0\n"]],
  "logica-mensaje-resultado": [["Buenos Aires\n", "Destino: Buenos Aires\n"]],
  "logica-numero-texto": [["", "6\n42\n"]],
  "logica-booleano": [["", "true\n"]],
  "logica-igualdad": [["4\n4\n", "true\n"], ["4\n5\n", "false\n"]],
  "logica-alcanza": [["9\n", "false\n"], ["10\n", "true\n"], ["11\n", "true\n"]],
  "logica-retorno": [[-3, -3], [0, 0]],
  "logica-parametro": [[3, 6], [-3, -6], [0, 0]],
  "logica-imprimir-devolver": [[4, 5], [0, 1]],
  "logica-predice-valores": [[2, 10], [-3, 0]],
};

test("las 24 referencias fijas conservan texto exacto PROGRAM o retorno FUNCTION", () => {
  assert.deepEqual(new Set(Object.keys(examples)), new Set([...retained, ...Object.keys(pythonIntroExplanations)]));
  const runner = `import sys,json,io,contextlib
for entry in json.load(sys.stdin):
    for data,expected in entry['cases']:
        namespace={}
        output=io.StringIO()
        previous_stdin=sys.stdin
        try:
            sys.stdin=io.StringIO(data if entry['mode']=='PROGRAM' else '')
            with contextlib.redirect_stdout(output):
                exec(entry['code'],namespace)
                if entry['mode']!='PROGRAM':
                    actual=namespace['solve'](data)
            if entry['mode']=='PROGRAM':
                assert output.getvalue()==expected, (entry['slug'],output.getvalue(),expected)
            else:
                assert actual==expected, (entry['slug'],actual,expected)
                assert output.getvalue()=='', (entry['slug'],'salida impresa')
        finally:
            sys.stdin=previous_stdin
print('ok')`;
  const result = spawnSync(process.env.PYTHON_BIN ?? "python", ["-c", runner], {
    encoding: "utf8", timeout: 30000,
    input: JSON.stringify(Object.entries(examples).map(([slug, cases]) => {
      const content = pythonCatalog.find(entry => entry.slug === slug)!.content;
      return { slug, cases, mode: content.runtimeMode, code: content.variants[0].solution };
    })),
  });
  assert.equal(result.error, undefined);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), "ok");
});
