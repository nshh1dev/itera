# Revisión editorial de ejemplos públicos Python

## Alcance y método

Todos los 433 ejemplos públicos ya tenían explicación. Esta revisión posterior
contrasta cada pareja entrada/salida y su explicación con el contrato Python,
el orden de aprendizaje y el formato de ejecución. No basta con detectar texto
no vacío ni con ejecutar la solución que se quiere justificar.

La revisión cubre las primeras **160/224 actividades**, con **305/433 ejemplos
públicos**. El primer bloque conserva sus 49 textos; el segundo ajusta tres y
conserva otros 61; el tercero conserva 64; el cuarto ajusta cuatro y conserva 60;
el quinto conserva 64.
No cambian datos, salidas, visibilidad, orden, casos ocultos ni fuentes
compartidas. Quedan **64 actividades y 128 ejemplos** por contrastar
individualmente.

## Primer bloque: impresión, datos, retorno y cálculos

| Actividad | Ejemplos | Decisión y motivo |
| --- | ---: | --- |
| `logica-saludo` | 1 | Conservar: línea única, separadores y comillas del código que no aparecen en la salida. |
| `logica-dos-lineas` | 1 | Conservar: orden de las impresiones y una línea por instrucción. |
| `logica-orden-mensaje` | 1 | Conservar: preparación, mezcla y servicio justifican el orden concreto. |
| `logica-texto-calculo` | 1 | Conservar: cálculo frente a caracteres literales, incluidos espacios. |
| `logica-guarda-nombre` | 1 | Conservar: valor guardado frente al nombre de la variable. |
| `logica-guarda-cantidad` | 1 | Conservar: valor 8 frente al texto puntos. |
| `logica-actualiza-puntos` | 1 | Conservar: sumar al estado previo, no reemplazarlo por el incremento. |
| `logica-intercambia` | 1 | Conservar: procedencia de ambos valores y orden de impresión. |
| `logica-suma-cantidades` | 1 | Conservar: cantidades 7 y 5 y suma 12. |
| `logica-cambio` | 1 | Conservar: pago menos precio; explica por qué se resta en ese sentido. |
| `logica-precio-unidades` | 1 | Conservar: seis grupos de cuatro, no una suma de precio y cantidad. |
| `logica-parentesis` | 1 | Conservar: suma antes del doble y contraste con multiplicar solo un sumando. |
| `python-constante` | 1 | Conservar: tres grupos de seis; no atribuye inmutabilidad al nombre en mayúsculas. |
| `logica-lee-nombre` | 2 | Conservar: espacio y mayúscula; segundo nombre distingue dato variable de respuesta fija. |
| `logica-lee-doble` | 2 | Conservar: doble numérico frente a texto repetido y cero válido. |
| `logica-lee-suma` | 2 | Conservar: suma frente a concatenación, también con dos ceros. |
| `logica-mensaje-resultado` | 2 | Conservar: prefijo, espacio y ciudad recibida, sin fijarla al primer ejemplo. |
| `python-decimal` | 2 | Conservar: conversión, suma y salida float con .0; cancelación hasta 0.0. No promete redondeo decimal financiero. |
| `logica-numero-texto` | 1 | Conservar: dos operaciones de distinto tipo y posición de sus líneas. |
| `logica-booleano` | 1 | Conservar: valor True y texto true por la impresión preparada, no sintaxis JSON como Python. |
| `logica-igualdad` | 2 | Conservar: igualdad/desigualdad y traducción explícita de True/False al texto PROGRAM. |
| `logica-alcanza` | 2 | Conservar: valor inmediatamente inferior y límite incluido. |
| `logica-retorno` | 2 | Conservar: valor entregado al llamador frente a impresión; cero no es ausencia. |
| `logica-parametro` | 2 | Conservar: doble del dato y contraste de multiplicar por dos frente a sumarlo. |
| `logica-dos-parametros` | 2 | Conservar: suma de ambos campos y efecto del signo negativo. |
| `logica-imprimir-devolver` | 2 | Conservar: número devuelto y diferencia con un mensaje; cálculo desde cero. |
| `logica-predice-valores` | 2 | Conservar: estados en orden, duplicación del actualizado y cero inicial. |
| `logica-tabla-valores` | 2 | Conservar: tres estados, flechas y conservación del estado cero en la traza. |
| `logica-minutos-segundos` | 2 | Conservar: factor 60 y neutro cero, sin minuto añadido. |
| `logica-perimetro` | 2 | Conservar: cuatro lados frente a área; cuadrado unitario. |
| `logica-repara-presupuesto` | 2 | Conservar: un solo envío y envío cobrado incluso sin unidades. |
| `logica-merienda` | 2 | Conservar: producto y mensaje con espacio; cero unidades conserva prefijo y total cero. |

## Segundo bloque: condiciones, recorridos, listas y textos

Se revisan **64 ejemplos de 32 actividades**. Cambian tres explicaciones en
tres actividades; las otras 29 conservan todas sus explicaciones. Las tres
parejas públicas restantes de las actividades editadas también se conservan.

| Actividad | Ejemplos | Decisión y motivo |
| --- | ---: | --- |
| `logica-elige-mensaje` | 2 | Conservar: return alcanzado termina la llamada; rama omitida alcanza el retorno final. |
| `logica-signo` | 2 | Conservar: condición positiva primero y negativa solo al no cumplirla. No afirma que estos ejemplos cubran el cero. |
| `logica-mayor-tres` | 2 | Conservar: candidato mayor y negativos sin introducir cero ajeno. |
| `logica-dos-requisitos` | 2 | Conservar: ambas divisibilidades frente a una sola, con True/False y representación JSON. |
| `logica-alternativas` | 2 | Conservar: invitación suficiente sin bloqueo y bloqueo prevaleciente incluso con ambos permisos. |
| `logica-tarifa` | 2 | Conservar: cero y último valor antes del primer umbral; no presenta estos ejemplos como cobertura de todas las tarifas. |
| `python-condicional` | 2 | Ajustar primero: 18 alcanza exactamente el umbral incluido y el resultado es texto, no booleano. Conservar 17 como otro lado del límite. |
| `logica-uno-n` | 2 | Conservar: límite incluido y caso de un solo elemento. |
| `logica-cuenta-atras` | 2 | Conservar: cero final incluido y cero inicial como lista de un elemento. |
| `logica-suma-uno-n` | 2 | Conservar: suma completa frente al límite y acumulador vacío en cero. |
| `logica-tabla` | 2 | Conservar: diez productos, también diez ceros en vez de lista vacía. |
| `logica-multiplos` | 2 | Conservar: enumeración de tres múltiplos y exclusión de cero del intervalo vacío. |
| `logica-bucle-roto` | 2 | Conservar: cada entero una vez y ninguna vuelta si el límite es cero. |
| `python-centinela` | 2 | Conservar: detenerse antes de cero y excluir los posteriores; centinela inicial sin elementos. |
| `python-omite-negativos` | 2 | Conservar: omitir negativo sin perder cero y positivo posterior; vacío sin vueltas. |
| `logica-posicion` | 2 | Conservar: índice uno como segundo elemento y valor cero como dato válido. |
| `logica-indices` | 2 | Conservar: valores en orden frente a sus posiciones; lista vacía sin accesos. |
| `logica-suma-lista` | 2 | Conservar: suma de elementos y total inicial cuando faltan. |
| `logica-maximo` | 2 | Conservar: repetición sin cambiar el máximo y negativos sin candidato cero. |
| `logica-cuenta-condicion` | 2 | Conservar: solo dos positivos, no suma ni cero contado; vacío sin coincidencias. |
| `logica-filtra-lista` | 2 | Ajustar primero: justificar 8 y 5, explicar por qué se omiten 3 y 1 y conservar orden. Conservar el segundo sin coincidencias. |
| `logica-busqueda-lineal` | 2 | Conservar: índice dos como tercer elemento y -1 por ausencia; no confunde índice con cantidad. |
| `logica-longitud-texto` | 2 | Conservar: cuatro caracteres, incluida mayúscula, y texto vacío. |
| `logica-minusculas` | 2 | Conservar: solo mayúsculas cambian y se conserva orden. |
| `logica-vocales` | 2 | Conservar: repeticiones cuentan y mayúscula inicial también. |
| `logica-invierte` | 2 | Conservar: orden inverso de caracteres, incluidos espacio y posición de mayúsculas, sin cambiar su capitalización. |
| `logica-elimina-caracter` | 2 | Conservar: tres apariciones eliminadas y resto en orden; vacío sin cambios. |
| `logica-palabras` | 2 | Conservar: grupos separados y espacios repetidos/exteriores sin palabras vacías. |
| `python-ordena-numeros` | 2 | Conservar primero con repeticiones y original; ajustar segundo para exigir ambas listas vacías, no decir que pueden estarlo. |
| `python-recorta` | 2 | Conservar: inicio incluido, fin excluido y corte vacío. |
| `python-une-palabras` | 2 | Conservar: un separador y equivalencia de tabulación/salto como separación, sin normalizar letras. |
| `python-desempaqueta` | 2 | Conservar: intercambio y dos posiciones aunque los valores coincidan. |

Los cambios se proyectan solo desde `prisma/python-help.ts`. El filtro no modifica
la explicación compartida de JavaScript/TypeScript. Se mantienen los demás
textos de cada lista de ayudas, incluidos los ocultos. No se agregan ejemplos
ni se atribuye cobertura completa a los dos casos públicos de cada actividad.

`tests/python-condition-example-review.test.ts` fija las 64 parejas revisadas,
los motivos y la conservación de todos los campos salvo esas tres posiciones.
La huella de conservación se calculó antes de editar. La reconstrucción de
`tests/python-example-review-baseline.ts` restaura solo esos textos y recupera
íntegra la entrega anterior `c772…`, manteniendo expectativas históricas. La
nueva huella de publicación es `01eca6…`; no prepara ni activa la base.

## Tercer bloque: parejas, referencias, diccionarios y validación

Se conservan los **64 ejemplos de las siguientes 32 actividades**, tras
contrastar datos, resultados y explicación con su contrato. No hace falta
reescribirlos para contabilizar la revisión.

| Actividad | Ejemplos | Decisión y motivo |
| --- | ---: | --- |
| `python-enumera` | 2 | Conservar: numeración desde uno, orden original y vacío sin posiciones. |
| `python-empareja` | 2 | Conservar: solo posiciones presentes en ambas listas; entrada vacía sin relleno. |
| `python-retorno-multiple` | 2 | Conservar: suma antes de producto y producto cero sin perder la suma. |
| `logica-ficha-producto` | 2 | Conservar: extraer precio, excluir nombre y mantener cero presente. |
| `logica-ficha-resultado` | 2 | Conservar: producto y cantidad por separado, incluso con precio cero. |
| `logica-opcional` | 2 | Conservar: respaldo solo ante clave ausente, no ante valor cero. |
| `logica-ausencia` | 2 | Conservar: null representa None; cero presente se incrementa. |
| `logica-auxiliares` | 2 | Conservar: envío bajo el umbral y gratuidad exactamente en 2000 céntimos. |
| `logica-variable-local` | 2 | Conservar: incremento del argumento, incluido cero, no valor fijo. |
| `logica-parametro-exterior` | 2 | Conservar: duplicar argumento y mantener exterior; negativo y exterior cero. |
| `logica-llamadas-independientes` | 2 | Conservar: segundo contador reiniciado, no acumulado; primera llamada sin incrementos. |
| `logica-sin-estado-global` | 2 | Conservar: cada tasa se suma a la misma base, no a un total creciente; sin tasas no hay resultados. |
| `logica-encadena-retornos` | 2 | Conservar: producto y después embalaje, también con producto cero. |
| `logica-dos-nombres-lista` | 2 | Conservar: añadido a lista compartida y cero como elemento; el contrato no atribuye identidad a la salida por sí sola. |
| `logica-reasigna-o-muta` | 2 | Conservar: reasignar alias no cambia original, tampoco si está vacío. |
| `logica-copia-plana` | 2 | Conservar: añadido solo en copia y original preservado; el enunciado delimita copia superficial e identidad. |
| `logica-conserva-entrada` | 2 | Conservar: incremento por elemento, original sin cambios y ambas listas vacías cuando no hay elementos. |
| `logica-registro-compartido` | 2 | Conservar: ambos nombres observan cantidad actualizada; cambio cero no implica ausencia. |
| `python-identidad` | 2 | Conservar: efecto del alias frente a copia e instantánea; booleanos del resultado según las comparaciones is del código, no deducidos desde JSON. |
| `python-opcional-seguro` | 2 | Conservar: resultados independientes por llamada y ceros repetidos sin acumulación. |
| `python-actualiza-diccionario` | 2 | Conservar: insertar conservando otras parejas o reemplazar por cero. |
| `python-borra-clave` | 2 | Conservar: borrar valor cero y no cambiar contenido si la clave falta. |
| `python-recorre-pares` | 2 | Conservar: ordenar por clave, no por llegada; vacío como lista sin textos. |
| `python-lista-registros` | 2 | Conservar: ambos registros cuentan aunque repitan nombre y vacío conserva total cero. |
| `logica-valida-divisor` | 2 | Conservar: cociente de divisor válido y None ante divisor cero; el contrato explica float y representación JSON sin prometer un int de Python. |
| `logica-valido-cero-ausente` | 2 | Conservar: cero presente válido y None como ausencia, no clave faltante. |
| `logica-localiza-error` | 2 | Conservar: índice cero válido en lista unitaria y guarda antes del acceso en lista vacía. |
| `logica-captura-conversion` | 2 | Conservar: strip y entero válido; palabra inválida produce None sin afirmar que los casos certifican try/except. |
| `logica-error-dominio` | 2 | Conservar: edad negativa rechazada y cero dentro del dominio válido. |
| `logica-recupera-elementos` | 2 | Conservar: un fallo no impide convertir el elemento posterior; orden y contador separados, también en vacío. |
| `logica-asercion-normal` | 2 | Conservar: devolver triple del dato, no conteo de pruebas; cero no cambia por ejecutar una aserción. |
| `logica-pruebas-limites` | 2 | Conservar: el caso positivo no prueba la corrección para negativos y vacío devuelve None, no candidato cero. |

`tests/python-reference-example-review.test.ts` fija las 64 parejas públicas y
los motivos contrastados. También mantiene explícitos los límites de identidad,
tipo Python frente a JSON y certificación de técnicas en los enunciados. No
ejecuta referencias ni envíos de alumnos. No hay cambios de catálogo: se conserva
la huella `01eca6…`, sin nueva revisión ni reconstrucción adicional.

## Cuarto bloque: conjuntos, agrupación, comprensiones e iteradores

Se contrastan **64 ejemplos de las siguientes 32 actividades**. Se ajustan cuatro
explicaciones en cuatro actividades y se conservan las otras 60 del bloque.
Los ajustes justifican todos los valores del resultado, no solo uno de sus
campos; en agrupación se conservan las minúsculas exactas de los datos.

| Actividad | Ejemplos | Decisión y motivo |
| --- | ---: | --- |
| `logica-reproduce-fallo` | 2 | Conservar: cero no positivo y conteo de elementos frente a suma. |
| `logica-conserva-regresion` | 2 | Conservar: igualdad activa descuento, pero nunca baja de cero. |
| `logica-factorial` | 2 | Conservar: producto de todos los factores y neutro uno con cero factores. |
| `logica-fizzbuzz` | 2 | Conservar: sustituciones de 3/5 y límite incluido; estos casos no se presentan como cobertura de múltiplos de ambos. |
| `logica-mediciones` | 2 | Conservar: suma, cantidad positiva y máximo; ausencia de máximo frente a suma/conteo cero. |
| `logica-carrito` | 2 | Conservar: subtotal 20, descuento 2 y cero sin importe nuevo. |
| `logica-notas` | 2 | Conservar: umbral de aprobado incluido y media de todas las notas, no solo aprobadas; vacío sin media. |
| `logica-saldo` | 2 | Conservar: movimiento rechazado no cambia saldo ni detiene los posteriores; vacío sin rechazos. |
| `logica-gastos-registro` | 2 | Conservar: suma por categoría y global; vacío sin categorías inventadas. |
| `logica-gastos-validacion` | 2 | Conservar: rechazo por importe negativo o categoría no permitida y vacío sin rechazados. |
| `python-conjunto-seguro` | 2 | Ajustar primero: explicar duplicado 2, añadido 3, retirada ausente 9 y orden final. Conservar añadido y retirada del mismo valor. |
| `python-union` | 2 | Conservar: compartido una sola vez y dos entradas vacías. |
| `python-interseccion` | 2 | Conservar: solo compartidos sin contar repeticiones y vacío sin coincidencias. |
| `python-diferencia` | 2 | Conservar: falta mapa, no oro disponible; sin requisitos no falta nada. |
| `python-simetrica` | 2 | Conservar: compartido excluido y exclusivo repetido una sola vez. |
| `python-subconjunto` | 2 | Conservar: pertenencia de todos los requisitos y vacío satisfecho incluso sin disponibles. |
| `logica-repetido` | 2 | Conservar: primera/tercera aparición y vacío sin repetición, con representación booleana explícita. |
| `logica-deduplica` | 2 | Conservar: primera aparición en orden, no orden numérico; todas iguales como un único valor. |
| `logica-frecuencias` | 2 | Conservar: acumular repeticiones por clave y frecuencia uno para caracteres distintos. |
| `logica-primer-unico` | 2 | Conservar: b antes de c después de descartar a repetida; None si ninguna es única. |
| `logica-anagramas` | 2 | Conservar: mismas frecuencias pese al orden y contraste concreto entre a y o. |
| `python-crea-grupo` | 2 | Ajustar primero: categoría a conserva ana y añade bea, sin convertirlos en Ana/Bea. Conservar creación de categoría nueva. |
| `logica-agrupa-registros` | 2 | Conservar: fruta mantiene orden y pan forma otra lista; vacío sin categorías. |
| `python-comprension` | 2 | Conservar: un cuadrado por posición, incluido negativo, y vacío. |
| `python-comprension-filtro` | 2 | Conservar: mayúsculas aceptadas y orden; sin vocales no hay elementos. |
| `python-comprension-condicional` | 2 | Conservar: sustituir negativo sin eliminar su posición y vacío sin posiciones. |
| `python-comprension-dict` | 2 | Ajustar primero: explicar sol: 3 y a: 1, además de por qué sol repetida no crea otra clave. Conservar vacío sin asociaciones. |
| `python-iterador` | 2 | Conservar: primera materialización agota, segunda vacía; vacío en ambas. |
| `python-generador` | 2 | Conservar: suma de cuadrados, no suma directa, y neutro cero. |
| `python-map` | 2 | Conservar: convertir antes de duplicar y mantener signo; vacío sin transformación. |
| `python-filter` | 2 | Conservar: 18 incluido, 17 excluido y salida de nombres; vacío sin resultados. |
| `python-agrega` | 2 | Ajustar primero: justificar total -6, mínimo -4 y máximo -2 sin introducir cero. Conservar suma neutra y extremos ausentes en vacío. |

Solo cambian cuatro posiciones públicas de `pythonCaseHelp`; los segundos
ejemplos y las explicaciones ocultas permanecen exactos. No cambian soluciones,
manifiestos de proyecto, firmas ni formato de resultados. No se añaden garantías
de identidad, mutación intermedia ni certificación de técnicas.

`tests/python-collection-example-review.test.ts` fija las 64 parejas y motivos;
la huella calculada antes de editar excluye exactamente cuatro explicaciones.
`tests/python-collection-example-baseline.ts` restaura esas posiciones y recupera
íntegra la entrega `01eca6…`. La cadena histórica incorpora ese eslabón sin
cambiar sus expectativas. La nueva huella es `f5d67f…`, sin preparar/activar base.

## Quinto bloque: ordenación, módulos, archivos y aplicaciones

Se conservan los **64 ejemplos de las siguientes 32 actividades**, contrastados
individualmente con sus entradas, resultados y contratos. Los textos de ejemplos
no necesitan repetir todas las condiciones del enunciado: se mantiene su foco en
el caso concreto, sin atribuir a una salida garantías sobre la implementación.

| Actividad | Ejemplos | Decisión y motivo |
| --- | ---: | --- |
| `python-clave-longitud` | 2 | Conservar: a precede a sol/luz, cuyo empate conserva orden; vacío sin elementos. |
| `python-lambda-desempate` | 2 | Conservar: longitud descendente y desempate alfabético luz/sol, no estabilidad del ejercicio anterior; vacío. |
| `python-formato-decimal` | 2 | Conservar: cero final en 3.50 y empate exacto 2.5 hacia par con cero decimales, no redondeo financiero. |
| `python-consulta-anidada` | 2 | Conservar: nota cero presente y alumno ausente como None, sin acceso directo fallido. |
| `logica-inventario` | 2 | Conservar: pan termina en cero y mantiene clave, agua suma aparte; vacío sin productos. No trasladar aquí la prohibición de negativos de otros hitos. |
| `logica-importa-preparado` | 2 | Conservar: multiplicación por cuatro del módulo preparado, incluidos cero y retorno desde main. |
| `logica-extrae-modulo` | 2 | Conservar: cuadrado de 3 y cero, sin mensajes ni importes adicionales; el resultado no certifica separación de archivos. |
| `logica-separa-reglas-io` | 2 | Conservar: producto más cargo fijo, prefijo y espacio; cargo también con precio/unidades cero. |
| `logica-repara-importacion` | 2 | Conservar: cuadrado más uno y nombre público correcto; cero no elimina la suma posterior. |
| `logica-organiza-modulos` | 2 | Conservar: cuadrado y prefijo Resultado:; cero presente, no ausencia. |
| `logica-lee-archivo` | 2 | Conservar: índices cero/uno de Sol/Luna y retirada del salto final, no modificación del recurso. |
| `logica-escribe-archivo` | 2 | Conservar: espacio procedente del sufijo y ausencia de saltos extra; sufijo vacío mantiene Hola tanto en archivo como retorno. |
| `logica-valida-json` | 2 | Conservar: cantidad cero aceptada por extremo incluido y JSON válido que no satisface estructura de configuración. |
| `logica-guarda-recupera` | 2 | Conservar: orden de ambos valores y lista vacía frente a None; artefactos compactos [1,2]/[]. Reabrir en el mismo proceso no demuestra persistencia entre procesos. |
| `logica-recupera-archivo-invalido` | 2 | Conservar: ausencia y JSON roto son fallos distintos con el mismo respaldo cero, no datos parciales. |
| `logica-actualiza-persistidos` | 2 | Conservar: anteriores 2/4 antes de 6 y conservación sin entradas; artefactos compactos, sin prometer durabilidad ni persistencia entre procesos. |
| `logica-inventario-modular` | 2 | Conservar: rechazar -4 sin cambiar 3 y aceptar después -1; vacío sin productos/rechazos. Mantener mutación intencional de stock. |
| `logica-inventario-persistente` | 2 | Conservar: cargar pan 2, retirar uno y añadir sal; sin movimientos no reiniciar. Artefactos y segunda llamada conservan stock y cero rechazos. |
| `python-inventario-valora` | 2 | Conservar: 250 más 100 forman total 350, filas descendentes en céntimos; vacío con total cero sin filas. |
| `python-academia-inscribe` | 2 | Conservar: nueva inscripción pendiente y existente con cero sin sobrescribir. |
| `python-academia-califica` | 2 | Conservar: cero dentro del rango y 101 rechazado conservando ocho. |
| `python-academia-resume` | 2 | Conservar: media de 0/100 igual a 50; bea sin media ni clasificación; registro vacío sin resultados. |
| `python-contactos-crea` | 2 | Conservar: clave normalizada y teléfono textual 012; duplicado normalizado sin sustitución. |
| `python-contactos-edita` | 2 | Conservar: normalización, teléfono vacío válido, campo desconocido ignorado y correo preservado; editar no crea. |
| `python-contactos-borra` | 2 | Conservar: borrar ana completa, no anabel por coincidencia parcial; agenda vacía sin cambios. |
| `python-contactos-busca` | 2 | Conservar: ana cumple ambos filtros, insensibles a mayúsculas; vacío sin coincidencias aun sin filtros. |
| `logica-agenda-operaciones` | 2 | Conservar: crear antes de completar, una ficha True y representación JSON; vacío sin estado previo. |
| `logica-agenda-almacenamiento` | 2 | Conservar: completar tarea cargada sin duplicar; sin comandos conserva pendiente. Archivo exacto y segunda llamada conservan ambas salidas. |
| `logica-agenda-regresion` | 2 | Conservar: actualizar una ficha, no duplicar ni perder pendiente sin comandos; artefactos y segunda llamada conservados. El ejemplo de una operación no se anuncia como prueba de completar dos veces. |
| `python-transforma-campo` | 2 | Conservar: normalizar solo nombre, preservar Quito y no crear campo ausente. |
| `python-transforma-registros` | 2 | Conservar: nombre a minúsculas y edad entera tras espacios; lista vacía de copias sin reglas. |
| `logica-busqueda-binaria` | 2 | Conservar: índice tres, no valor siete; ausente devuelve -1, no posición de inserción. |

`tests/python-storage-example-review.test.ts` fija las 64 parejas públicas, los
motivos, seis pares de artefactos exactos y los resultados de persistencia de
los tres proyectos que la declaran entre procesos. Es una comprobación editorial
de datos y contratos: no ejecuta disco ni Piston y no acredita aislamiento,
organización interna ni persistencia real. No cambia el catálogo ni la huella
`f5d67f…`; no hace falta otro eslabón de reconstrucción histórica.

## Verificación y límites

`tests/python-public-example-review.test.ts` fija las 49 parejas públicas desde
los contratos, incluidas líneas terminadas y textos PROGRAM frente a retornos
FUNCTION. Comprueba los motivos editoriales y la huella íntegra anterior.
No genera salidas ejecutando referencias ni ejecuta programas de alumnos.

Conservar un texto tras contrastarlo cuenta como revisión, no como reescritura.
Las comprobaciones no acreditan por sí solas toda la calidad pedagógica,
aislamiento, Piston real ni revisión visual. No cierran los ejemplos restantes,
las repeticiones entre superficies ni las fases D2, E o F. El catálogo continúa
sin preparar ni activar en la base.
