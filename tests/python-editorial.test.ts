import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { pythonCatalog } from "../prisma/python-content";
import { pythonEditorialRevisions } from "../prisma/python-editorial";

test("los lotes editoriales estructuran 156 prácticas sin tocar programas ni proyectos", () => {
  const slugs = Object.keys(pythonEditorialRevisions);
  assert.equal(slugs.length, 156);
  for (const slug of slugs) {
    const entry = pythonCatalog.find(item => item.slug === slug)!;
    assert.ok(entry, slug);
    assert.equal(entry.content.runtimeMode, "FUNCTION", slug);
    assert.equal(entry.content.variants[0].project, undefined, slug);
    assert.equal(entry.content.statement, pythonEditorialRevisions[slug].statement);
    assert.equal(entry.content.variants[0].statement, entry.content.statement);
    assert.deepEqual([...entry.content.statement.matchAll(/^(Tu tarea|Entrada|Resultado esperado)\n/gm)].map(match => match[1]), ["Tu tarea", "Entrada", "Resultado esperado"], slug);
    assert.doesNotMatch(entry.content.statement, /\barreglos?\b|\bsubarreglo\b|\bun objeto con\b/i, slug);
    assert.doesNotMatch(entry.content.statement, /Devuelve (null|true|false)\b/, slug);
    assert.ok(entry.content.hints.length >= 3, `${slug}: conserva ayudas progresivas`);
    assert.ok(entry.content.variants[0].explanation.length > 0, `${slug}: conserva explicación de la referencia`);
  }
});

test("los enunciados distinguen representación Python, JSON, límites y desempates", () => {
  const text = (slug: string) => pythonCatalog.find(entry => entry.slug === slug)!.content.statement;
  for (const slug of ["logica-opcional", "logica-mediciones", "logica-notas", "logica-segundo-maximo"]) {
    assert.match(text(slug), /None.*null.*JSON/, slug);
  }
  assert.match(text("logica-palindromo"), /True.*False/);
  assert.match(text("logica-palindromo"), /JSON.*true.*false/);
  assert.match(text("logica-ficha-resultado"), /ficha.*diccionario/);
  assert.match(text("logica-carrito"), /Cada artículo es un diccionario/);
  assert.match(text("logica-pareja"), /menor i.*mayor j/);
  assert.match(text("logica-ventana-suma"), /al menos.*no necesariamente igualarlo/);
  assert.match(text("logica-filas"), /longitudes diferentes o estar vacías/);
  assert.match(text("logica-prefijos"), /posición i.*primeros i elementos/);
  const notes = pythonCatalog.find(entry => entry.slug === "logica-notas")!;
  assert.match(notes.content.hints[2], /Devuelve None/);
  // Las instrucciones de PROGRAM deben conservar el texto exacto de salida,
  // no sustituir true/false por los literales Python.
  assert.match(text("logica-igualdad"), /Muestra true.*false/);
  assert.match(text("logica-alcanza"), /Muestra true.*false/);
});

test("el lote editorial conserva íntegra la evaluación, los ejemplos y los metadatos de recorrido", () => {
  // Huella anterior al lote, sin enunciados. Complementa las pruebas ejecutables
  // por actividad; no genera respuestas esperadas con las soluciones.
  const payload = pythonCatalog.map(entry => ({
    slug: entry.slug, category: entry.category, level: entry.content.level,
    minutes: entry.content.minutes, activityType: entry.content.activityType,
    runtimeMode: entry.content.runtimeMode, conceptRule: entry.content.conceptRule,
    variants: entry.content.variants.map(variant => {
      const { statement: _statement, ...assessment } = variant;
      void _statement;
      return assessment;
    }),
  }));
  assert.equal(createHash("sha256").update(JSON.stringify(payload)).digest("hex"), "1a6daa5e0e984a6c3897bb9b4e0364fd00b2758f3387282d7d95175e7b08dda5");
});

test("el lote avanzado conserva reglas deterministas, límites, ausencias y objetivos de práctica", () => {
  const advanced = pythonCatalog.filter(entry => entry.content.level === "ADVANCED");
  assert.equal(advanced.length, 36);
  assert.deepEqual(advanced.filter(entry => entry.slug in pythonEditorialRevisions).map(entry => entry.slug), advanced.map(entry => entry.slug));
  const text = (slug: string) => pythonEditorialRevisions[slug].statement;
  for (const slug of ["logica-cuenta-nodos", "logica-altura", "logica-preorden", "logica-niveles", "logica-arbol-busqueda", "logica-ancestro"]) {
    assert.match(text(slug), /value.*left.*right/, slug);
    assert.match(text(slug), /profundidad máxima 50/, slug);
    assert.match(text(slug), /None.*null/, slug);
  }
  assert.match(text("logica-cuenta-nodos"), /hasta 100 nodos/);
  assert.match(text("logica-altura"), /hasta 500 nodos/);
  assert.match(text("logica-arbol-busqueda"), /todos los antecesores/);
  assert.match(text("logica-ancestro"), /pueden ser iguales.*no tiene por qué ser de búsqueda/);
  assert.match(text("logica-monticulo-inserta"), /No intercambies iguales/);
  assert.match(text("logica-monticulo-extrae"), /empate.*izquierdo/);
  assert.match(text("logica-monticulo-extrae"), /minimo es None.*heap es \[\]/);
  assert.match(text("logica-subconjuntos"), /empieza con \[\[\]\].*copias de los subconjuntos actuales/);
  assert.match(text("logica-permutaciones"), /hasta 6 enteros distintos entre -1000 y 1000/);
  assert.match(text("logica-permutaciones"), /valores numéricos/);
  assert.match(text("logica-combinaciones"), /target cero devuelve \[\[\]\]/);
  assert.match(text("logica-reinas"), /simetrías como soluciones diferentes/);
  assert.match(text("logica-combina-archivos"), /no necesitas abrir ni escribir archivos reales/);
  assert.match(text("logica-mochila"), /peso cero.*una vez.*capacidad cero/);
  assert.match(text("logica-caminos-obstaculos"), /solo a la derecha o abajo/);
  assert.match(text("logica-monedas"), /amount cero devuelve 0 incluso sin denominaciones/);
  assert.match(text("logica-subsecuencia-comun"), /puede saltar caracteres/);
  assert.match(text("logica-escalera"), /orden distingue formas/);
});

test("retorno y primeros bucles conservan plantillas, formatos y fronteras", () => {
  const text = (slug: string) => pythonEditorialRevisions[slug].statement;
  const slugs = ["logica-retorno", "logica-parametro", "logica-dos-parametros", "logica-imprimir-devolver", "logica-predice-valores", "logica-tabla-valores", "logica-minutos-segundos", "logica-perimetro", "logica-repara-presupuesto", "logica-merienda", "logica-elige-mensaje", "logica-signo", "logica-dos-requisitos", "logica-alternativas", "logica-tarifa", "python-condicional", "logica-uno-n", "logica-cuenta-atras", "logica-suma-uno-n", "logica-tabla", "logica-multiplos", "logica-bucle-roto", "python-centinela", "python-omite-negativos"];
  for (const slug of slugs) {
    const entry = pythonCatalog.find(item => item.slug === slug)!;
    assert.ok(["INITIATION", "BEGINNER"].includes(entry.content.level), slug);
    assert.equal(entry.content.statement, text(slug), slug);
  }
  assert.match(text("logica-retorno"), /print no sustituye al retorno/);
  assert.match(text("logica-dos-parametros"), /primero y segundo.*conserva esos accesos/);
  assert.match(text("logica-predice-valores"), /no si hiciste primero la predicción/);
  assert.match(text("logica-tabla-valores"), /' -> '.*espacio.*2 -> 4 -> 12/);
  assert.match(text("logica-repara-presupuesto"), /Aunque no haya unidades, se cobra el envío/);
  assert.match(text("logica-merienda"), /'Total: '.*sin comillas ni salto de línea/);
  assert.match(text("logica-elige-mensaje"), /positivo.*no positivo/);
  assert.match(text("logica-signo"), /positivo.*negativo.*cero/);
  assert.match(text("logica-dos-requisitos"), /Cero cumple ambas condiciones.*True y False.*true y false/);
  assert.match(text("logica-alternativas"), /bloqueo impide siempre/);
  assert.match(text("logica-tarifa"), /6 y 17 \(ambos incluidos\).*18 años/);
  assert.match(text("python-condicional"), /'sí' if condicion else 'no'/);
  assert.match(text("logica-uno-n"), /Para cero devuelve \[\]/);
  assert.match(text("logica-cuenta-atras"), /Para cero devuelve \[0\]/);
  assert.match(text("logica-tabla"), /lista de diez enteros/);
  assert.match(text("logica-multiplos"), /No incluyas el cero/);
  assert.match(text("logica-bucle-roto"), /No elimines el avance/);
  assert.match(text("python-centinela"), /No incluyas ese cero ni los elementos posteriores/);
  assert.match(text("python-centinela"), /No modifiques la entrada/);
  assert.match(text("python-omite-negativos"), /conservando ceros y repeticiones.*valores posteriores/);
});

test("listas, textos y auxiliares conservan orden, formatos, ayudas conceptuales y ausencias", () => {
  const text = (slug: string) => pythonEditorialRevisions[slug].statement;
  const slugs = ["logica-posicion", "logica-indices", "logica-suma-lista", "logica-maximo", "logica-cuenta-condicion", "logica-longitud-texto", "logica-minusculas", "logica-vocales", "logica-invierte", "logica-elimina-caracter", "logica-palabras", "python-ordena-numeros", "python-recorta", "python-une-palabras", "python-desempaqueta", "python-enumera", "python-empareja", "python-retorno-multiple", "logica-ficha-producto", "logica-ausencia", "logica-variable-local", "logica-parametro-exterior", "logica-llamadas-independientes", "logica-sin-estado-global"];
  for (const slug of slugs) {
    const entry = pythonCatalog.find(item => item.slug === slug)!;
    assert.equal(entry.content.level, "BEGINNER", slug);
    assert.equal(entry.content.statement, text(slug), slug);
  }
  assert.match(text("logica-posicion"), /index.*desde cero/);
  assert.match(text("logica-indices"), /Conserva su estructura.*posición actual/);
  assert.match(text("logica-suma-lista"), /hasta 1000 enteros.*-1000 y 1000/);
  assert.match(text("logica-maximo"), /máximo puede ser negativo/);
  assert.match(text("logica-cuenta-condicion"), /cero no cuenta como positivo/);
  assert.match(text("logica-longitud-texto"), /ASCII.*1000.*espacios y signos/s);
  assert.match(text("logica-minusculas"), /ASCII.*100 caracteres/);
  assert.match(text("logica-vocales"), /mayúsculas.*minúsculas.*acentuadas/);
  assert.match(text("logica-invierte"), /espacios, signos y mayúsculas/);
  assert.match(text("logica-elimina-caracter"), /exactamente uno.*Distingue mayúsculas de minúsculas/s);
  assert.match(text("logica-palabras"), /espacios repetidos no crean palabras vacías/);
  assert.match(text("python-ordena-numeros"), /sorted\(lista\).*lista.sort\(\).*devuelve None/);
  assert.match(text("python-ordena-numeros"), /original y ordenados.*No modifiques/);
  assert.match(text("python-recorta"), /inicio incluido hasta fin excluido.*coinciden.*\[\]/);
  assert.match(text("python-une-palabras"), /tabulaciones o saltos de línea.*único espacio/s);
  assert.match(text("python-desempaqueta"), /exactamente dos enteros.*sin modificar.*tupla/s);
  assert.match(text("python-enumera"), /desde 1.*aparición repetida/);
  assert.match(text("python-empareja"), /lista más corta.*sin rellenar/);
  assert.match(text("python-retorno-multiple"), /suma y producto.*no certifican/);
  assert.match(text("logica-ficha-producto"), /ficha.*diccionario/);
  assert.match(text("logica-ausencia"), /None.*JSON.*null/);
  assert.match(text("logica-ausencia"), /cero debe producir 1/);
  assert.match(text("logica-variable-local"), /Conserva la auxiliar/);
  assert.match(text("logica-parametro-exterior"), /No cambies exterior/);
  assert.match(text("logica-llamadas-independientes"), /segunda llamada no hereda.*entre 0 y 1000/s);
  assert.match(text("logica-sin-estado-global"), /No acumules las tasas.*tasas vacía devuelve \[\]/);
});

test("alias, validación y pruebas conservan mutaciones intencionales y límites de sus garantías", () => {
  const text = (slug: string) => pythonEditorialRevisions[slug].statement;
  const slugs = ["logica-encadena-retornos", "logica-dos-nombres-lista", "logica-reasigna-o-muta", "logica-copia-plana", "logica-conserva-entrada", "logica-registro-compartido", "python-identidad", "python-opcional-seguro", "python-actualiza-diccionario", "python-borra-clave", "python-recorre-pares", "python-lista-registros", "logica-valida-divisor", "logica-valido-cero-ausente", "logica-localiza-error", "logica-captura-conversion", "logica-error-dominio", "logica-recupera-elementos", "logica-asercion-normal", "logica-pruebas-limites", "logica-reproduce-fallo", "logica-conserva-regresion", "logica-factorial", "logica-fizzbuzz"];
  for (const slug of slugs) {
    const entry = pythonCatalog.find(item => item.slug === slug)!;
    assert.equal(entry.content.level, "BEGINNER", slug);
    assert.equal(entry.content.statement, text(slug), slug);
  }
  assert.match(text("logica-encadena-retornos"), /sin variables compartidas.*añada 2/s);
  for (const slug of ["logica-dos-nombres-lista", "logica-registro-compartido"]) {
    assert.match(text(slug), /modificar intencionalmente/, slug);
    assert.match(text(slug), /no certifica identidad/, slug);
  }
  assert.match(text("logica-reasigna-o-muta"), /original conserva.*alias contiene únicamente/);
  assert.match(text("logica-copia-plana"), /list\(valores\).*independiente.*vacía/s);
  assert.match(text("logica-conserva-entrada"), /no certifica ausencia de cualquier mutación intermedia/);
  assert.match(text("python-identidad"), /== compara contenido; is.*antes, original, copia, igual, misma y copiaMisma/s);
  assert.match(text("python-identidad"), /No modifiques data/);
  assert.match(text("python-opcional-seguro"), /base=\[\].*compartiría.*segunda no hereda/s);
  assert.match(text("python-actualiza-diccionario"), /reemplaza.*añade.*no modifiques/);
  assert.match(text("python-borra-clave"), /cero no indica que faltase/);
  assert.match(text("python-recorre-pares"), /'clave: valor'.*clave ascendente/);
  assert.match(text("python-lista-registros"), /no agrupes ni elimines repeticiones/);
  assert.match(text("logica-valida-divisor"), /cociente es entero.*Devuelve None.*total cero.*0/s);
  assert.match(text("logica-valido-cero-ausente"), /ausente.*invalido.*valido.*incluido cero/s);
  assert.match(text("logica-localiza-error"), /no se aceptan los índices negativos/);
  for (const slug of ["logica-captura-conversion", "logica-recupera-elementos"]) {
    assert.match(text(slug), /solo ValueError|solo ese error/, slug);
    assert.match(text(slug), /int.*float/, slug);
    assert.match(text(slug), /cifras ASCII.*ceros iniciales.*exponentes y guiones bajos/, slug);
  }
  assert.match(text("logica-error-dominio"), /edad negativa.*aceptada.*no certifica el uso de raise/s);
  assert.match(text("logica-recupera-elementos"), /fallo no debe impedir.*validos.*rechazados/s);
  assert.match(text("logica-asercion-normal"), /triple\(4\) igual a 12.*no certifica/s);
  assert.match(text("logica-pruebas-limites"), /\[\], \[-4\] y \[-8, -2\].*None.*null/s);
  assert.match(text("logica-reproduce-fallo"), /No cuentes el cero.*no certifican tu explicación/);
  assert.match(text("logica-conserva-regresion"), /incluida la igualdad, sin bajar de cero/);
  assert.match(text("logica-factorial"), /entre 0 y 15.*factorial de cero se define como 1/s);
  assert.match(text("logica-fizzbuzz"), /Conserva los demás como números, no textos.*Para cero devuelve \[\]/);
});

test("conjuntos y recorridos conservan pertenencia, cantidades, estabilidad y consumo", () => {
  const text = (slug: string) => pythonEditorialRevisions[slug].statement;
  const slugs = ["logica-saldo", "python-conjunto-seguro", "python-union", "python-interseccion", "python-diferencia", "python-simetrica", "python-subconjunto", "logica-repetido", "logica-deduplica", "logica-frecuencias", "logica-primer-unico", "logica-anagramas", "python-crea-grupo", "logica-agrupa-registros", "python-comprension", "python-comprension-filtro", "python-comprension-condicional", "python-comprension-dict", "python-iterador", "python-generador", "python-map", "python-filter", "python-agrega", "python-clave-longitud"];
  for (const slug of slugs) {
    const entry = pythonCatalog.find(item => item.slug === slug)!;
    assert.equal(entry.content.level, slug === "logica-saldo" ? "BEGINNER" : "INTERMEDIATE", slug);
    assert.equal(entry.content.statement, text(slug), slug);
  }
  assert.match(text("logica-saldo"), /si lo rechazas, conserva el saldo y continúa.*exactamente cero/);
  assert.match(text("python-conjunto-seguro"), /añadir agregar y después descartar quitar.*coinciden/);
  assert.match(text("python-union"), /al menos una entrada.*sin repeticiones/);
  assert.match(text("python-interseccion"), /ambas entradas.*sin repeticiones/);
  assert.match(text("python-diferencia"), /requeridos - disponibles.*no sobrantes/);
  assert.match(text("python-simetrica"), /exactamente una.*compartidos no aparecen/);
  assert.match(text("python-subconjunto"), /repeticiones no cuentan como unidades.*Sin requisitos devuelve True/);
  assert.match(text("logica-repetido"), /True.*más de una vez.*False/);
  assert.match(text("logica-deduplica"), /primera aparición, no el orden numérico/);
  assert.match(text("logica-frecuencias"), /No añadas letras ausentes.*orden de las claves no importa/);
  assert.match(text("logica-primer-unico"), /posición en el texto, no el orden alfabético.*None.*null/);
  assert.match(text("logica-anagramas"), /mismas cantidades.*mayúsculas y espacios normales.*vacío/s);
  assert.match(text("python-crea-grupo"), /exterior comparte sus listas.*lista nueva por categoría/);
  assert.match(text("python-crea-grupo"), /nombres repetidos/);
  assert.match(text("logica-agrupa-registros"), /orden de aparición.*nombres repetidos/);
  assert.match(text("python-comprension"), /mismas posiciones.*No modifiques/);
  assert.match(text("python-comprension-filtro"), /minúsculas y en orden de aparición.*repetidas/);
  assert.match(text("python-comprension-condicional"), /mismo tamaño.*negativo por cero.*No elimines/);
  assert.match(text("python-comprension-dict"), /palabra como clave.*longitud como valor/);
  assert.match(text("python-iterador"), /único iterador.*sin crear un segundo.*no reinicia/s);
  assert.match(text("python-generador"), /bajo demanda.*no el consumo de memoria/s);
  assert.match(text("python-map"), /enteros válidos entre -100 y 100.*no textos repetidos/s);
  assert.match(text("python-filter"), /al menos 18 años.*sin quitar repeticiones.*no termina/);
  assert.match(text("python-agrega"), /total es 0.*minimo y maximo son None.*null/);
  assert.match(text("python-clave-longitud"), /conserva el orden original, no ordenes alfabéticamente/);
});

test("grafos y optimización conservan direcciones, desempates, límites y casos frontera", () => {
  const text = (slug: string) => pythonEditorialRevisions[slug].statement;
  assert.match(text("logica-adyacencia"), /hasta 4000 aristas/);
  assert.match(text("logica-adyacencia"), /aristas repetidas.*al revés/);
  assert.match(text("logica-adyacencia"), /vecinos distintos.*orden numérico ascendente/);
  for (const slug of ["logica-adyacencia", "logica-alcanzables", "logica-distancias", "logica-dijkstra"]) {
    assert.match(text(slug), /ambos sentidos/, slug);
  }
  assert.match(text("logica-alcanzables"), /incluido inicio.*una sola vez/);
  assert.match(text("logica-distancias"), /posición i.*mínima cantidad de aristas.*-1/);
  assert.match(text("logica-ciclo-dirigido"), /entre 0 y 100/);
  assert.match(text("logica-ciclo-dirigido"), /Un lazo es un ciclo.*sin nodos devuelve False/);
  assert.match(text("logica-dependencias"), /dependencies/);
  assert.match(text("logica-dependencias"), /recién liberadas.*ciclo.*orden parcial/);
  assert.match(text("logica-dijkstra"), /entre 1 y 200.*pesos positivos/);
  assert.match(text("logica-dijkstra"), /menor suma de pesos.*destino igual a 0 devuelve 0/);
  assert.match(text("logica-islas"), /diagonales no conectan/);
  assert.match(text("logica-islas"), /300 por 300.*filas vacías/);
  assert.match(text("logica-islas"), /No modifiques/);
  assert.match(text("logica-laberinto"), /200 por 200.*arriba, abajo, izquierda o derecha/);
  assert.match(text("logica-laberinto"), /alguna esquina es un muro.*única celda libre devuelve 0/);
  assert.match(text("logica-capacidad"), /sin dividir ningún paquete.*tramo consecutivo/);
  assert.match(text("logica-capacidad"), /como máximo dias días.*No es necesario usar todos/);
  assert.match(text("logica-edicion"), /ASCII de hasta 200.*cuesta 1/);
  assert.match(text("logica-edicion"), /No se permite intercambiar/);
  assert.match(text("logica-subsecuencia-creciente"), /hasta 500.*orden original/);
  assert.match(text("logica-subsecuencia-creciente"), /iguales no prolongan.*vacía devuelve 0/);
  assert.match(text("logica-planifica-tareas"), /hasta 100 enteros no negativos/);
  assert.match(text("logica-planifica-tareas"), /-1 si hay un ciclo.*todos sus requisitos.*duración cero/);
});
