import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { pythonCatalog } from "../prisma/python-content";
import { pythonReferenceCopyRevisions } from "../prisma/python-vocabulary";
import { pythonReleaseFingerprint } from "../prisma/python-releases";
import { beforePythonReferenceCopy, previousReferenceCopy } from "./python-reference-copy-baseline";
import { beforePythonCollectionCopy } from "./python-collection-copy-baseline";

const reviewed = [
  "python-enumera", "python-empareja", "python-retorno-multiple", "logica-ficha-producto",
  "logica-ficha-resultado", "logica-opcional", "logica-ausencia", "logica-auxiliares",
  "logica-variable-local", "logica-parametro-exterior", "logica-llamadas-independientes", "logica-sin-estado-global",
  "logica-encadena-retornos", "logica-dos-nombres-lista", "logica-reasigna-o-muta", "logica-copia-plana",
  "logica-conserva-entrada", "logica-registro-compartido", "python-identidad", "python-opcional-seguro",
  "python-actualiza-diccionario", "python-borra-clave", "python-recorre-pares", "python-lista-registros",
  "logica-valida-divisor", "logica-valido-cero-ausente", "logica-localiza-error", "logica-captura-conversion",
  "logica-error-dominio", "logica-recupera-elementos", "logica-asercion-normal", "logica-pruebas-limites",
];

test("el tercer contraste entre superficies alcanza 96 actividades con doce ajustes nuevos", () => {
  assert.deepEqual(pythonCatalog.slice(64, 96).map(entry => entry.slug), reviewed);
  assert.deepEqual(Object.keys(pythonReferenceCopyRevisions), Object.keys(previousReferenceCopy));
  assert.equal(Object.keys(pythonReferenceCopyRevisions).length, 12);
  let descriptions = 0;
  for (const [slug, revision] of Object.entries(pythonReferenceCopyRevisions)) {
    assert.ok(reviewed.includes(slug), slug);
    assert.equal(Object.keys(revision).length, 1, slug);
    const content = pythonCatalog.find(entry => entry.slug === slug)!.content;
    for (const [field, value] of Object.entries(revision)) {
      assert.ok(["description", "objective", "practiceGoals", "hints"].includes(field), field);
      assert.deepEqual(content[field as keyof typeof revision], value, slug);
      if (field === "description") {
        descriptions++;
        assert.notEqual(content.description, content.objective, slug);
      }
    }
  }
  assert.equal(descriptions, 9);
});

test("las revisiones mantienen conceptos, pistas progresivas y límites de observación", () => {
  const content = (slug: string) => pythonCatalog.find(entry => entry.slug === slug)!.content;
  const concepts: Record<string, RegExp> = {
    "python-enumera": /enumerate\(valores, 1\).*repetidas.*no certifican/s,
    "python-empareja": /zip\(a, b\).*lista más corta.*sin rellenar/s,
    "python-retorno-multiple": /tupla.*return termina esa llamada.*suma y producto.*JSON/s,
    "python-identidad": /copia superficial.*Asignar alias no crea ninguna copia.*identidad se entiende revisando el código/s,
    "python-opcional-seguro": /base=\[\].*compartiría.*segunda no hereda/s,
    "python-actualiza-diccionario": /copia superficial.*enteros inmutables.*No generalices/s,
    "python-borra-clave": /pop\(clave, None\).*cero no indica.*No modifiques el original/s,
    "python-recorre-pares": /d.items sin ellos es el método.*dos puntos y el espacio posterior/s,
    "python-lista-registros": /cada ficha es un diccionario.*no agrupes ni elimines repeticiones/s,
  };
  for (const [slug, concept] of Object.entries(concepts)) {
    assert.match(content(slug).statement, concept, slug);
    assert.equal(content(slug).hints.length, 3, slug);
  }
  assert.match(content("logica-ficha-producto").objective, /clave de diccionario/);
  assert.match(content("logica-opcional").practiceGoals[0], /clave ausente.*cero/);
  assert.deepEqual(content("logica-valida-divisor").hints.slice(0, 2), previousReferenceCopy["logica-valida-divisor"].hints.slice(0, 2));
  assert.match(content("logica-valida-divisor").hints[2], /None solo cuando divisor vale cero/);
  assert.match(content("logica-valida-divisor").statement, /produce float.*None se representa como null en JSON/s);
  assert.match(content("logica-registro-compartido").statement, /modificar intencionalmente el diccionario compartido/);
  assert.match(content("logica-copia-plana").statement, /no certifica identidad/);
});

test("solo cambian nueve descripciones, un objetivo, una meta y una lista de pistas", () => {
  const payload = pythonCatalog.map(entry => ({ ...entry, content: beforePythonCollectionCopy(entry.slug, entry.content) })).map(entry => ({ ...entry, content: Object.fromEntries(
    Object.entries(entry.content).filter(([field]) => !Object.keys(pythonReferenceCopyRevisions[entry.slug] ?? {}).includes(field)),
  ) }));
  // Calculada antes de editar; conserva las otras 20 actividades del bloque,
  // los 433 ejemplos, código, enunciados, teoría, contratos y todo campo ajeno.
  assert.equal(createHash("sha256").update(JSON.stringify(payload)).digest("hex"), "5b07abef5ae94d5db8d432b0f9dac54215e6cdf232854029e5729dc569a5b965");
  const previous = pythonCatalog.map(entry => ({ ...entry, content: beforePythonReferenceCopy(entry.slug, entry.content) }));
  assert.equal(pythonReleaseFingerprint(previous), "64a0bfc934b7a6c646df89277df3d89a6c7c4f4ceafc93faf94d625c7f314c33");
});
