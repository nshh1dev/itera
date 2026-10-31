# Auditoría pedagógica del recorrido Python

Registro por actividad de la revisión D2. Conservar las identidades y los casos
históricos; cualquier revisión se publica como una versión nueva solo de Python.
No usar la validación estructural como sustituto de esta revisión.

## Alcance y evidencia

Bloques revisados: **32 actividades de iniciación** (25 mantenidas y 7 con
aclaraciones), **74 de principiante** (59 mantenidas y 15 revisadas) y las primeras
**27 intermedias**, de colecciones (19 mantenidas y 8 revisadas).
También se revisaron **26 intermedias de proyectos y registros** (18 mantenidas y
8 revisadas) y las últimas **29 intermedias de algoritmos** (21 mantenidas y ocho
revisadas). Estos bloques suman **188 actividades**, incluido todo intermedio.
Se añaden las primeras **12 avanzadas de estructuras y selección** (cinco
mantenidas y siete revisadas). Otras **12 avanzadas de combinatoria y programación
dinámica** (cuatro mantenidas y ocho revisadas) elevan el total a **212/224**.
Las últimas **12 avanzadas de grafos y optimización** (tres mantenidas y nueve
revisadas) completan **224/224 actividades** con decisión individual. Quedan
abiertas la validación real del ejecutor, las limitaciones de no mutación y E/F.
Se leyeron objetivo, enunciado, plantilla, referencia, pistas, casos y reglas
conceptuales. Se mantienen modalidades, entradas, respuestas esperadas,
visibilidad, reglas conceptuales e identidades; no se añaden casos por volumen.

`tests/python-initiation-audit.test.ts` ejecuta únicamente código fijo del
repositorio: referencias, plantillas y un error representativo por actividad,
frente a todos sus casos. Las 32 referencias coinciden con las respuestas ya
redactadas, las 32 plantillas terminan sin resolver toda la actividad y los 32
errores producen al menos una diferencia. Ninguna respuesta esperada se genera
con la referencia. Es una comprobación local, no Piston ni una medición de dominio.

Las reglas conceptuales secuenciales existentes se conservan, pero esta prueba
no vuelve a ejecutar su analizador AST. Un error de comportamiento rechazado no
acredita por sí solo uso de variables, constantes, operaciones o predicción.
Los programas sin entrada pueden reproducirse con una salida literal; donde no
hay regla conceptual, la técnica queda para revisión humana.

En FUNCTION, esta prueba observa también la entrada tras cada llamada fija y
comprueba que no se modifica. En este bloque hay escalares y diccionarios de
escalares, sin ejercicios centrados en mutación de colecciones. Esto no añade al
evaluador una garantía de no mutación para código de alumnos.

## Iniciación: decisión individual

«Mantener» significa que no se encontró un cambio necesario en esta revisión,
no que los casos prueben toda implementación o todo aprendizaje posible.
Cada fila corresponde al error fijo ensayado en la prueba.

| Actividad | Decisión y fundamento | Error representativo detectado |
| --- | --- | --- |
| `logica-saludo` | Mantener: una instrucción, salida exacta y plantilla vacía; comillas y puntuación explicadas. | Omitir la coma. |
| `logica-dos-lineas` | Mantener: separación y orden de líneas observables. | Unir ambas palabras en una línea. |
| `logica-orden-mensaje` | Mantener: corrección guiada del orden, sin herramienta nueva. | Invertir la secuencia. |
| `logica-texto-calculo` | Mantener: contrasta cálculo/texto y conserva regla `expression`. | Intercambiar las dos salidas. |
| `logica-guarda-nombre` | Mantener: asignación por completar y regla `variable`. | Mostrar el nombre de la variable. |
| `logica-guarda-cantidad` | Mantener: reparación mínima y regla `variable`. | Imprimir puntos entre comillas. |
| `logica-actualiza-puntos` | Mantener: diferencia actualización/reemplazo y regla `update`. | Reemplazar 8 por 3. |
| `logica-intercambia` | Mantener: auxiliar presentado en pistas y regla `swap`. | Sobrescribir sin conservar el primer valor. |
| `logica-suma-cantidades` | Mantener: números frente a textos y regla `addition`. | Concatenar 7 y 5 como textos. |
| `logica-cambio` | Mantener: orden de operandos y regla `subtraction`. | Restar pago al precio. |
| `logica-precio-unidades` | Mantener: equivalencia por unidad y regla `multiplication`. | Sumar precio y cantidad. |
| `logica-parentesis` | Mantener: precedencia y alternativa con auxiliar; regla `grouping`. | Duplicar solo el segundo sumando. |
| `python-constante` | Mantener la revisión guiada: transferencia explicada y límite de evaluación explícito. | Sumar cajas y equivalencia en vez de multiplicar. |
| `logica-lee-nombre` | Mantener: lectura preparada; nombres variables evitan fijar Ana. | Omitir el espacio tras la coma. |
| `logica-lee-doble` | Mantener: conversión preparada; cero, negativos y límite inferior presentes. | Sumar 2 en vez de duplicar. |
| `logica-lee-suma` | Mantener: plantilla deja la conversión pendiente; positivos, ceros, negativos y cancelación. | Concatenar las entradas sin convertir. |
| `logica-mensaje-resultado` | Mantener: mayúsculas y espacios interiores explícitos y caso Buenos Aires. | Convertir siempre la ciudad a minúsculas. |
| `python-decimal` | Mantener la revisión: conversión pendiente, entrada válida, negativos, cero y `.0`. | Convertir sin añadir 0.5. |
| `logica-numero-texto` | Mantener: dos efectos de + y regla `number-text`. | Sumar números también en la segunda línea. |
| `logica-booleano` | **Aclarar** `True` como valor Python y `true` como texto impreso; no pedir al principiante modificar str/lower. Conservar regla `boolean`. | Mantener False. |
| `logica-igualdad` | Mantener: formato preparado; casos iguales/distintos, cero y signos. | Usar desigualdad en vez de igualdad. |
| `logica-alcanza` | Mantener: frontera 9/10/11 y extremos 0/100. | Excluir exactamente 10. |
| `logica-retorno` | Mantener: transición a FUNCTION con escalares, cero, negativos y extremos. | Imprimir sin devolver. |
| `logica-parametro` | Mantener: retorno por completar y datos de distintos signos. | Sumar 2 en vez de multiplicar. |
| `logica-dos-parametros` | **Aclarar** que data es un diccionario y el acceso está preparado; se practica sumar, no descubrir la estructura. | Devolver solo a. |
| `logica-imprimir-devolver` | Mantener: fallo guiado de retorno, con un caso cuyo resultado es cero. | Imprimir el cálculo y devolver siempre 0. |
| `logica-predice-valores` | **Aclarar** entrada escalar y límite de evaluación: se comprueba la transformación, no el acto mental de predecir. Quitar mención irrelevante a colecciones. | Duplicar antes de sumar 3. |
| `logica-tabla-valores` | **Aclarar** entrada escalar, estados y separador; observar una traza no certifica variables internas. Quitar límite genérico de colecciones. | Calcular el último estado desde el inicial. |
| `logica-minutos-segundos` | Mantener: integración breve de equivalencia y retorno, con cero y límite 1000. | Añadir 60 en vez de multiplicar. |
| `logica-perimetro` | **Aclarar** diccionario y acceso a medidas; evita anticipar consulta de claves sin apoyo. Cuadrados y rectángulos ya distinguen área/perímetro. | Multiplicar base por altura. |
| `logica-repara-presupuesto` | **Aclarar** diccionario y claves, conservando el fallo inicial y cobro fijo incluso sin unidades. | Multiplicar también el envío por las unidades. |
| `logica-merienda` | **Aclarar** claves, texto exacto y ausencia de salto final; mantener separación de cálculo/formato. | Devolver un número en vez del mensaje. |

## Principiante: evidencia y decisiones individuales

Se revisaron los mismos campos que en iniciación. Se conservan todos los casos
anteriores y se añaden **12 casos ocultos** con respuestas redactadas de forma
independiente. Cuatro errores fijos pasaban los casos anteriores y ahora fallan:
media truncada, subtotal del último artículo, vocales acentuadas y conversión de
`3.0` por `float`. La prueba comprueba también ese antes/después.

`tests/python-beginner-audit.test.ts` ejecuta las 74 referencias y plantillas y
un error fijo por actividad. Para los dos proyectos de gastos compila todos los
archivos Python y ejecuta las pruebas propias de la referencia en un módulo
aislado en memoria. Las plantillas no resuelven todos los casos; las pruebas
propias iniciales pueden fallar porque todavía falta implementar `solve`.
Esto no valida el montaje multarchivo ni la ejecución de proyectos en Piston.

Hay dos referencias con mutación **intencional**: `logica-dos-nombres-lista` y
`logica-registro-compartido`. La prueba comprueba su cambio esperado, en vez de
imponerles no mutación. Las demás referencias y plantillas conservan la entrada
en los casos ejecutados. En copia plana, conservación de entrada, ordenación e
identidad se devuelve además el estado original para observar errores comunes;
una implementación podría construir instantáneas para ocultar una mutación.
En centinela, rebanadas, actualización y borrado de diccionario solo se evalúa el
retorno: no prometer que el juez detecta toda mutación de un alumno.

La conversión Python queda definida sin pasar por `float`: tras `strip`, signo
opcional y cifras ASCII, al menos una. Se admiten ceros iniciales y se rechazan
punto, exponente, guion bajo y signo sin cifras. Se explica con recorrido y
pertenencia, sin introducir expresiones regulares. Es una revisión nueva; las
variantes compartidas e intentos históricos conservan sus contratos anteriores.

| Actividad | Decisión y fundamento | Error representativo detectado |
| --- | --- | --- |
| `logica-elige-mensaje` | Mantener: rama positiva pendiente y cero cubierto. | Aceptar cero como positivo. |
| `logica-signo` | **Revisar** objetivo: usar if/elif/else, no else if ajeno a Python. | Omitir la rama cero. |
| `logica-mayor-tres` | Mantener: candidatos en las tres posiciones, negativos y empate. | Inicializar el máximo en cero. |
| `logica-dos-requisitos` | Mantener: cada condición aislada, ambas, ninguna y cero. | Usar or en vez de and. |
| `logica-alternativas` | **Revisar** diccionario, booleanos Python y vocabulario or/not/and. | Ignorar el bloqueo. |
| `logica-tarifa` | Mantener: límites 5/6 y 17/18, extremos 0/120. | Incluir 6 en el tramo gratuito. |
| `python-condicional` | Mantener: frontera 17/18; expresión como práctica, no técnica certificada. | Excluir los 18 años. |
| `logica-uno-n` | Mantener: cero, uno y varios; corrección de append guiada. | Excluir el límite superior. |
| `logica-cuenta-atras` | Mantener: cero final y cero inicial cubiertos. | Terminar antes de añadir cero. |
| `logica-suma-uno-n` | Mantener: actualización pendiente, contador preparado. | Omitir el último sumando. |
| `logica-tabla` | Mantener: diez posiciones, cero y negativos. | Empezar en multiplicador cero. |
| `logica-multiplos` | Mantener: intervalo vacío, divisor uno y divisor mayor que n. | Contar cero fuera de 1..n. |
| `logica-bucle-roto` | Mantener: avance defectuoso pero terminante; arreglo guiado. | Conservar el salto de dos. |
| `python-centinela` | Mantener: cero inicial/intermedio, ausencia y vacío. | Omitir solo los ceros sin detenerse. |
| `python-omite-negativos` | Mantener: cero, válidos posteriores, todos negativos y duplicados. | Excluir también cero. |
| `logica-posicion` | Mantener: índices válidos, primero/último y valor cero. | Devolver la posición en vez del valor. |
| `logica-indices` | Mantener: copia guiada con datos distintos, vacío y repeticiones. | Copiar siempre el primer elemento. |
| `logica-suma-lista` | Mantener: suma pendiente, vacío, cancelación y negativos. | Contar elementos. |
| `logica-maximo` | Mantener: comparación invertida, negativos, repetidos y máximo en extremos. | Introducir cero como candidato. |
| `logica-cuenta-condicion` | Mantener: cero excluido y un positivo distinto de uno. | Sumar importes en vez de contar. |
| `logica-filtra-lista` | Mantener contrato: igualdad al mínimo y orden observables. Terminología compartida pendiente de E. | Usar > en vez de >=. |
| `logica-busqueda-lineal` | Mantener: primera coincidencia, repetidos, ausencia y vacío. Terminología pendiente de E. | Devolver la última coincidencia. |
| `logica-longitud-texto` | Mantener: ASCII, espacios y signos, incluido texto solo de espacios. | Recortar antes de medir. |
| `logica-minusculas` | Mantener: texto ya normalizado, vacío, espacios y números. | Eliminar los espacios. |
| `logica-vocales` | **Añadir caso** que excluye acentos explícitamente prometidos por el contrato. | Contar también áéíóú. |
| `logica-invierte` | Mantener: corrección guiada, vacío, letra única y texto con espacios. | Conservar el orden original. |
| `logica-elimina-caracter` | Mantener: todas las apariciones, ausencia y distinción de mayúsculas. | Eliminar solo la primera aparición. |
| `logica-palabras` | Mantener: espacios repetidos/exteriores, vacío y solo espacios. | Contar espacios más uno. |
| `python-ordena-numeros` | Mantener: original observable, negativos, duplicados y vacío. | Devolver también original ordenado. |
| `python-recorta` | Mantener: límite exclusivo, tramo vacío y lista completa. No certificar no mutación solo por retorno. | Incluir fin. |
| `python-une-palabras` | Mantener: tabulación/salto, espacios repetidos, texto sin palabras y signos. | Separar solo por espacio literal. |
| `python-desempaqueta` | Mantener: valores distintos, negativos y pareja igual; técnica no certificada por JSON. | Devolver sin intercambiar. |
| `python-enumera` | Mantener: numeración desde uno y palabras repetidas. | Empezar por cero. |
| `python-empareja` | **Añadir casos** de segunda lista vacía y longitudes iguales. | Rellenar hasta la lista más larga. |
| `python-retorno-multiple` | Mantener: orden suma/producto y casos cero/negativo. | Invertir los retornos. |
| `logica-ficha-producto` | Mantener: selección de campo y precio cero. Vocabulario ficha pendiente de E. | Devolver nombre. |
| `logica-ficha-resultado` | Mantener: cero independiente en precio/unidades. Terminología pendiente de E. | Copiar precio en unidades. |
| `logica-opcional` | Mantener: clave ausente frente a cero presente; nunca None. Terminología pendiente de E. | Usar respaldo por falsedad. |
| `logica-ausencia` | **Revisar pista**: None en Python, null solo como JSON. | Tratar cero como ausencia. |
| `logica-auxiliares` | Mantener: frontera 1999/2000 y pedido vacío con envío. Uso de auxiliares para revisión humana. | Cobrar envío también en 2000. |
| `logica-variable-local` | Mantener: reparación de parámetro frente a local fijo. | Devolver siempre 11. |
| `logica-parametro-exterior` | Mantener: argumento distinto del exterior y cero. Auxiliar no certificada solo por salida. | Duplicar exterior. |
| `logica-llamadas-independientes` | Mantener: llamadas con cero en ambas posiciones. No prueba ausencia de estado entre envíos. | Acumular ambas llamadas. |
| `logica-sin-estado-global` | **Revisar**: se construye una auxiliar, no se repara un fallo que la plantilla no contiene. | Acumular las tasas sobre la base anterior. |
| `logica-encadena-retornos` | Mantener: embalaje fijo incluso con producto cero. | Multiplicar también el embalaje por el precio. |
| `logica-dos-nombres-lista` | Mantener: mutación intencional, también desde lista vacía. | Copiar antes de añadir y devolver original intacto. |
| `logica-reasigna-o-muta` | Mantener: ambas listas en salida distinguen efectos. | Añadir a la lista compartida. |
| `logica-copia-plana` | Mantener: original observable, lista vacía y varios elementos. | Usar alias como copia. |
| `logica-conserva-entrada` | Mantener: original y transformada observables; incremento negativo. | Modificar la lista original. |
| `logica-registro-compartido` | **Revisar** acceso por clave en vez de ficha.cantidad; mutación explícita y límite de identidad. | Copiar el diccionario en vez de compartirlo. |
| `python-identidad` | Mantener revisión D1: instantánea y copia separadas, identidad como objetivo humano. | Declarar que copia es original. |
| `python-opcional-seguro` | Mantener: dos llamadas, incluso con valores iguales; base compartida observable. | Usar base=[] y compartir ambos resultados. |
| `python-actualiza-diccionario` | Mantener: inserción, reemplazo por cero y diccionario vacío. | Devolver solo la pareja actualizada. |
| `python-borra-clave` | Mantener: clave con cero, ausente y diccionario vacío. | Conservar la clave si su valor es falso. |
| `python-recorre-pares` | Mantener: entrada b/a no ordenada, cero y negativo. | Conservar el orden de inserción. |
| `python-lista-registros` | Mantener: nombres repetidos con cantidades distintas, cero y vacío. | Reemplazar cantidades por nombre. |
| `logica-valida-divisor` | **Revisar** None frente a null y diccionario; mantener cocientes integrales. | Tratar total cero como división inválida. |
| `logica-valido-cero-ausente` | **Revisar** None frente a null; clave siempre presente. | Clasificar cero como ausente. |
| `logica-localiza-error` | Mantener: índice negativo rechazado aunque Python lo permita, longitud y vacío. | Admitir índices negativos de Python. |
| `logica-captura-conversion` | **Revisar** gramática, int directo y cinco casos nuevos. | Aceptar decimales/exponentes mediante float. |
| `logica-error-dominio` | Mantener: cero válido, negativos y técnica como objetivo no certificado. | Rechazar también cero. |
| `logica-recupera-elementos` | **Revisar** misma conversión y un caso mixto con válidos tras rechazos. | Detenerse al primer inválido. |
| `logica-asercion-normal` | Mantener: caso conocido distinto de la entrada; limitación de aserciones explícita. | Devolver siempre el resultado del caso conocido. |
| `logica-pruebas-limites` | Mantener revisión D1: vacío y negativos exponen defecto real. | Conservar candidato cero. |
| `logica-reproduce-fallo` | Mantener revisión D1: causa reservada a pistas. | Contar también ceros. |
| `logica-conserva-regresion` | **Revisar**: implementar y probar, sin afirmar que ya hay código defectuoso; límites no negativos. | Permitir total negativo tras descontar. |
| `logica-factorial` | Mantener: cero, uno y varios; acumulador uno preparado. | Inicializar producto en cero. |
| `logica-fizzbuzz` | Mantener: 15 distingue caso combinado; cero y lista mixta. | Comprobar Fizz antes del caso combinado. |
| `logica-mediciones` | Mantener: integración sin receta, vacío y solo negativos. Terminología pendiente de E. | Inicializar máximo en cero. |
| `logica-carrito` | **Añadir caso** con dos artículos y total decimal. | Reemplazar el subtotal en cada vuelta. |
| `logica-notas` | **Añadir caso** con media 4.5. | Dividir truncando. |
| `logica-saldo` | Mantener: rechazos, saldo cero permitido y movimientos posteriores. | Aplicar también los movimientos rechazados. |
| `logica-gastos-registro` | Mantener: categorías repetidas, cero y vacío; proyecto preparado sin exigir módulos nuevos. | Reemplazar el subtotal de categoría. |
| `logica-gastos-validacion` | **Añadir caso** válido después de un rechazo. Las pruebas propias preparadas no certifican calidad de tests. | Interrumpir al primer rechazo. |

## Intermedio: colecciones, transformación y agregación (27 de 82)

Se revisaron objetivos, enunciados, plantillas, referencias, pistas y casos de
este subbloque. No se da por auditado el resto de intermedio por haber leído su
inventario. Las decisiones sobre módulos, archivos, persistencia, academia,
contactos, matrices y algoritmos se registrarán en los siguientes subbloques.

`tests/python-intermediate-collections-audit.test.ts` ejecuta las 27 referencias,
plantillas y errores fijos. Todos los casos previos se conservan, sin alterar
entradas, respuestas, orden ni visibilidad. Se añaden cuatro casos ocultos con
respuestas independientes. Cuatro errores pasaban todos sus casos anteriores y
ahora fallan: primer único alfabético, pérdida de grupos ajenos, filtro que se
detiene ante un menor y consulta que devuelve cero para cualquier nota presente.

Las referencias y plantillas conservan la entrada en estos casos locales.
Eso no añade una garantía al juez para alumnos. En particular, una copia solo
exterior en `python-crea-grupo` puede producir la salida correcta mutando una
lista interior del original; el contrato actual devuelve únicamente la copia y
no observa el original. La comprobación local protege nuestra referencia, no
certifica que todo programa aceptado conserve las listas.

No se certifica uso de conjuntos, comprensiones, iteradores, generadores, map,
filter, lambdas ni estabilidad interna: se observan los valores y el orden
requeridos. El formato decimal sigue las reglas de float de Python, no redondeo
financiero. Los casos de agotamiento distinguen efectos, no la sintaxis usada.

| Actividad | Decisión y fundamento | Error representativo detectado |
| --- | --- | --- |
| `python-conjunto-seguro` | Mantener: duplicados, elemento ausente y agregar igual a quitar. | Quitar antes de agregar. |
| `python-union` | Mantener: exclusivos de ambos lados, común, negativos, duplicados y vacío. | Calcular intersección. |
| `python-interseccion` | Mantener: duplicados, lista vacía y orden numérico explícito. | Calcular unión. |
| `python-diferencia` | Mantener: dirección, repetidos y vacío. | Restar requeridos a disponibles. |
| `python-simetrica` | Mantener: exclusivos de ambos lados y exclusión de comunes. | Conservar solo los exclusivos de a. |
| `python-subconjunto` | Mantener: igualdad, requisitos repetidos, ausencia y vacío. | Pedir subconjunto propio con <. |
| `logica-repetido` | **Aclarar** True/False en Python frente a true/false en JSON. | Considerar repetida cualquier lista no vacía. |
| `logica-deduplica` | Mantener: orden de primera aparición observable y repetidos. | Ordenar los valores al deduplicar. |
| `logica-frecuencias` | **Aclarar** diccionario en objetivo y enunciado, sin alternar ficha/objeto. | Guardar siempre frecuencia uno. |
| `logica-primer-unico` | **Aclarar** None y orden de aparición; añadir caso cbba. | Elegir el único alfabéticamente menor. |
| `logica-anagramas` | Mantener: cantidades, normalización, espacios, vacío y letras en ambos sentidos. | Comparar conjuntos sin frecuencias. |
| `python-crea-grupo` | **Añadir caso** con dos categorías para conservar también grupos ajenos. No certifica no mutación del alumno. | Devolver solo la categoría actualizada. |
| `logica-agrupa-registros` | **Aclarar** registro como diccionario y diccionario de salida; conservar orden/repetidos. | Reemplazar el grupo en cada registro. |
| `python-comprension` | Mantener: negativos, cero, repeticiones y tamaño de salida. | Aplicar valor absoluto en vez de cuadrado. |
| `python-comprension-filtro` | Mantener: mayúsculas, vocales repetidas, ausencia y vacío. | Filtrar sin normalizar. |
| `python-comprension-condicional` | Mantener: negativos reemplazados sin perder posiciones. | Filtrar los negativos. |
| `python-comprension-dict` | Mantener: palabras repetidas y palabra vacía, clave distinta de posición. | Asignar siempre longitud uno. |
| `python-iterador` | Mantener: agotamiento tras consumir todos los valores y entrada vacía. | Crear un segundo iterador. |
| `python-generador` | Mantener: cuadrados de signos distintos, cero y repeticiones. | Elevar al cuadrado la suma. |
| `python-map` | Mantener: conversión preparada como objetivo, cero y negativos válidos. | Convertir sin duplicar. |
| `python-filter` | **Añadir caso** con adultos después de menores y aclarar registro como diccionario. | Detenerse ante el primer menor. |
| `python-agrega` | Mantener: negativos, extremos ausentes y cero presente. | Introducir cero como extremo. |
| `python-clave-longitud` | Mantener: empate no alfabético verifica el orden estable requerido. | Desempatar alfabéticamente. |
| `python-lambda-desempate` | Mantener: direcciones distintas de criterios y repeticiones. | Invertir también el alfabético. |
| `python-formato-decimal` | Mantener: texto, ceros finales, precisión cero y empates binarios positivos/negativos. | Convertir round a texto sin asegurar ceros. |
| `python-consulta-anidada` | **Añadir caso** con nota 75 y campos ajenos, además de cero y ausencias ya cubiertos. | Devolver cero para toda nota presente. |
| `logica-inventario` | **Aclarar** movimientos y salida como diccionarios; mantener modelo con negativos y ceros. | Eliminar saldos cero. |

## Intermedio: módulos, archivos, persistencia y registros (26 actividades)

Este subbloque comprende los 16 proyectos intermedios y diez actividades de
registros anidados, desde módulos hasta transformación de registros. Se leyeron
contratos, plantillas, referencias, pistas y casos; en proyectos se revisaron
además manifiestos, recursos, archivos esperados, segundo proceso y pruebas propias.

`tests/python-intermediate-records-audit.test.ts` recorre **107 casos** (59 de
proyectos). Para proyectos reutiliza `projectExecutionFiles`, `judgeProject` y
`judgeOwnTests` del producto: ejecuta referencias, plantillas y errores fijos en
directorios temporales independientes, comprobando retorno, archivos y segundo
proceso donde corresponde. Compila también los módulos Python que una plantilla
incompleta todavía no importa y ejecuta las pruebas propias de referencia de
inventario persistente y agenda de regresión. Los directorios se eliminan en
`finally`; no se inicia la aplicación ni se usa la base.

Esto es una simulación local de código fijo del repositorio, no Piston ni una
verificación de aislamiento. Nunca se usa para programas enviados por alumnos.
Las diez referencias y plantillas de registros conservan la entrada en la
comprobación local; el juez no recibe con ello una nueva garantía general de no
mutación. Las mutaciones sobre stock/tareas cargados son internas al proyecto.

Se añaden **ocho casos ocultos**, conservando los anteriores. Los ocho errores
ensayados para las actividades revisadas pasaban todos sus casos anteriores y
ahora fallan. Un recurso nuevo `booleano.json` permite distinguir `True` de un
entero de configuración: `isinstance(True, int)` no basta. Se añade como solo
lectura al manifiesto Python y su solución; no modifica las otras variantes.
La búsqueda de contactos explicita que los campos presentes son textos y pueden
faltar; se corrige una explicación que mencionaba isinstance sin usarlo.

Las actividades que exigen escribir no se dan por resueltas solo por devolver
un valor correcto: los errores fijos de escribir/guardar devuelven la respuesta
esperada pero fallan porque no producen el archivo. La persistencia declarada
comprueba la segunda llamada `solve([])` en otro proceso, no durabilidad entre
envíos, escritura atómica ni recuperación ante cortes de alimentación.

| Actividad | Decisión y fundamento | Error representativo detectado |
| --- | --- | --- |
| `logica-importa-preparado` | Mantener: módulo de solo lectura, enteros positivos, cero y negativos. Importación como objetivo humano. | Duplicar en vez de multiplicar por cuatro. |
| `logica-extrae-modulo` | Mantener: dos archivos editables, contrato cuadrado y signos distintos. | Devolver valor absoluto. |
| `logica-separa-reglas-io` | Mantener: regla numérica y formato separados, coste fijo incluso sin unidades. | Omitir cargo fijo. |
| `logica-repara-importacion` | Mantener: enunciado aclara que el import defectuoso es conceptual, plantilla ejecutable. | Omitir el incremento posterior al cuadrado. |
| `logica-organiza-modulos` | Mantener: tres responsabilidades y nombres preparados, valores cero/negativo. | Devolver el cálculo sin prefijo. |
| `logica-lee-archivo` | Mantener: recurso protegido y tres índices posibles, incluido -1. La lectura interna requiere revisión humana. | Devolver siempre la primera línea. |
| `logica-escribe-archivo` | Mantener: recurso, archivo nuevo y texto exacto independientes del retorno. | Devolver el texto sin escribir. |
| `logica-valida-json` | **Añadir recurso/caso** booleano y aclarar diccionario, bool/int y documento ausente de clave, no de disco. | Aceptar True como entero mediante isinstance. |
| `logica-guarda-recupera` | Mantener: archivo compacto observado, vacío, negativos y cero. No certifica reapertura interna solo por artefacto. | Devolver data sin crear el archivo. |
| `logica-recupera-archivo-invalido` | Mantener: ausencia de disco, JSON roto y lectura válida diferenciados. | Devolver siempre respaldo cero. |
| `logica-actualiza-persistidos` | Mantener: estado inicial protegido, datos previos y nuevos, formato exacto. | Devolver solo los datos nuevos. |
| `logica-inventario-modular` | Mantener: stock local mutable, rechazos, cero conservado y movimiento posterior. | Ignorar todos los movimientos. |
| `logica-inventario-persistente` | Mantener: carga previa, stock ajeno, rechazos por llamada, archivo y segundo proceso. | Reiniciar el stock a vacío en main. |
| `python-inventario-valora` | Mantener: importes enteros, cálculo, empate de valor cero y nombre ascendente. | Invertir también el nombre al ordenar. |
| `python-academia-inscribe` | **Añadir caso** de inscripción con otro alumno y nota cero previa. | Conservar solo el alumno actualizado. |
| `python-academia-califica` | **Añadir caso** con otro alumno y curso pendiente, además de los límites D1 existentes. | Descartar alumnos ajenos. |
| `python-academia-resume` | **Añadir caso** con alumno sin cursos y otro con media cero. | Omitir del resumen los alumnos sin cursos. |
| `python-contactos-crea` | **Añadir caso** de contacto nuevo junto a uno existente. | Devolver solo la ficha creada. |
| `python-contactos-edita` | **Añadir caso** de edición con otro contacto en agenda. | Perder las fichas ajenas al editar. |
| `python-contactos-borra` | Mantener: coincidencia completa frente a anabel, normalización y ausente. | Borrar todas las claves con el prefijo. |
| `python-contactos-busca` | **Añadir caso y aclarar** ficha sin campo filtrado, tipos de campos y comparación insensible a mayúsculas. | Ignorar un filtro cuyo campo falta. |
| `logica-agenda-operaciones` | Mantener: crear/completar, inexistente y orden, reglas sin disco. | Devolver siempre agenda vacía. |
| `logica-agenda-almacenamiento` | Mantener: estado anterior, nuevas tareas, archivo y segundo proceso. | Aplicar comandos sobre lista vacía. |
| `logica-agenda-regresion` | Mantener: vacío, completar dos veces, nueva tarea, artefactos y pruebas propias. | Perder el estado cargado al integrar. |
| `python-transforma-campo` | Mantener: campo seleccionado, campos ajenos y clave ausente. | Transformar todos los campos. |
| `python-transforma-registros` | **Añadir caso** de decimal inválido, campo ajeno y registro válido posterior. | Pasar por float y truncar antes de devolver el entero. |

## Intermedio: búsquedas, ventanas, matrices y recursión (29 actividades)

Se revisaron los objetivos, contratos, límites, plantillas completas, referencias,
pistas y explicaciones de las últimas 29 actividades intermedias. Se mantienen
21 y se revisan ocho. `tests/python-intermediate-algorithms-audit.test.ts` ejecuta
**145 casos**, con referencias, plantillas y 29 errores fijos independientes.
Las referencias y plantillas no modifican la entrada en esas comprobaciones;
el error de copia superficial sí la modifica y altera el original devuelto.
Esto no impide que otro programa mute y restaure o construya una instantánea:
el juez sigue observando resultados, no identidad de objetos ni técnica.

Se conservan todos los casos anteriores y se añaden **seis casos ocultos**.
Cinco errores fijos pasaban todos los casos previos y ahora fallan: eliminar
signos al comprobar un palíndromo, elegir la última pareja válida, omitir filas
vacías intercaladas, comparar solo ventanas extremas y devolver uno para una
ventana variable sin elementos. En parejas se explicita el criterio que ya
implementaba la referencia: menor i y, para ese i, mayor j. Dos casos nuevos
cubren ambos criterios, también con duplicados. Una enumeración
independiente sobre todas las listas ordenadas de longitud 0–5 con valores de
−2 a 2 y objetivos de −4 a 4 comprueba ese desempate, incluidos duplicados.

Las pruebas editoriales adicionales ejercitan límites declarados con respuestas
independientes: suma recursiva de 900 unos, búsquedas con 10000/1000 elementos,
inserción de 1000 enteros invertidos, ventanas de 100000, mezcla de dos listas
de 5000 y matriz de vecinos de 20×20. Un prefijo de enteros grandes detecta la
pérdida de precisión por float. No son nuevos casos publicados ni mediciones de
complejidad: solo referencias locales fijas. Sigue pendiente repetir los límites
pertinentes en Piston real, especialmente pila, memoria y serialización.

La estabilidad de registros idénticos por nombre/puntos no se puede distinguir
por JSON si no hay otro campo que los identifique; no se inventa un campo nuevo
ni se presenta como certificada. Inserción corrige la afirmación demasiado amplia
de O(n) con datos «casi ordenados». Suma recursiva explicita memoria cuadrática de
los tramos retenidos y deja de prometer que 900 elementos nunca agotan la pila.

| Actividad | Decisión y fundamento | Error representativo detectado |
| --- | --- | --- |
| `logica-busqueda-binaria` | Mantener: diez casos cubren vacío, único, extremos, ausencia e intervalo par; límite local de 10000. | Devolver valor en lugar de índice. |
| `logica-insercion-posicion` | Mantener: duplicados, vacío e inserción en ambos extremos. | Buscar después de los iguales. |
| `logica-ordena-insercion` | **Corregir explicación** del mejor caso; referencia copia, conserva duplicados y ordena 1000 invertidos localmente. | Eliminar duplicados al ordenar. |
| `logica-ordena-registros` | Mantener: criterio secundario ascendente independiente del principal; estabilidad interna no certificada. | Invertir también los nombres. |
| `logica-combina` | Mantener: ambas listas pueden agotarse antes, duplicados y negativos; límite local de 5000 por lista. | Convertir la mezcla en un conjunto. |
| `logica-palindromo` | **Añadir caso** que distingue limpieza de signos de comparación literal. | Eliminar signos antes de comparar. |
| `logica-pareja` | **Aclarar desempate y añadir dos casos** con varias parejas y duplicados; posiciones distintas y entrada conservada. | Devolver la última pareja válida. |
| `logica-prefijos` | **Corregir restricción** de doble precisión heredada; Python mantiene enteros exactos. | Omitir el prefijo vacío inicial. |
| `logica-intervalos-suma` | Mantener: consultas inclusivas, singleton, negativos y orden de consultas. | Excluir el extremo final. |
| `logica-ventana-fija` | **Añadir caso** con máximo interior distinto de ambas ventanas extremas. | Comparar solo primera y última ventana. |
| `logica-ventana-suma` | **Aclarar y añadir caso** vacío; objetivo positivo y suma al menos igual. | Devolver longitud uno para entrada vacía. |
| `logica-celda` | Mantener: orden de índices, filas/columnas únicas y negativos. | Consultar siempre la primera celda. |
| `logica-filas` | **Añadir caso** de filas vacías intercaladas con otras no vacías. | Omitir las filas vacías salvo cuando todas lo están. |
| `logica-columnas` | Mantener: rectangular en ambas orientaciones, vacía y cancelación. | Sumar filas en vez de columnas. |
| `logica-diagonales` | Mantener: tamaño par, impar y uno, centro en ambas salidas. | Invertir la principal para obtener la secundaria. |
| `logica-transpuesta` | Mantener: rectangular, cuadrada, una fila y una columna. | Copiar la matriz sin intercambiar ejes. |
| `logica-vecinos` | Mantener: límites, solo ortogonales, celda única y fila única; 20×20 local. | Contar también diagonales. |
| `logica-copia-anidada` | Mantener: original observable, cambio real y filas independientes. | Copiar solo el contenedor exterior. |
| `logica-pila` | Mantener: LIFO, extracciones vacías y elementos no extraídos. | Extraer por el principio. |
| `logica-cola` | Mantener: FIFO y operaciones intercaladas. No se exige deque. | Extraer por el final. |
| `logica-delimitadores` | Mantener: cierre cruzado, sin apertura, aperturas pendientes y vacío. | Comparar solo cantidades de aperturas/cierres. |
| `logica-deshacer` | Mantener: cero, negativos, varios deshacer e historial agotado. | Restar repetidamente el último incremento sin pila. |
| `logica-suma-recursiva` | **Corregir explicación y restricción**: memoria de tramos y límite no garantizado en todo entorno; 900 local. | Sumar valores absolutos. |
| `logica-busqueda-recursiva` | Mantener: intervalo vacío, retorno propagado y posición original; 1000 local. | Devolver el índice local de una rebanada. |
| `logica-une-intervalos` | Mantener: contacto exacto, inclusión, desorden, vacío y punto. | Fusionar solo solapamientos estrictos. |
| `logica-segundo-maximo` | Mantener: distinto, máximo repetido, ausencia, cero y negativos. | Tomar el segundo elemento sin eliminar repeticiones. |
| `logica-suma-maxima` | Mantener: subarreglo no vacío, todos negativos y reinicio interior. | Permitir suma cero del subarreglo vacío. |
| `logica-sin-repeticiones` | Mantener: contigüidad, vacío y límite izquierdo que no retrocede en abba. | Contar todos los caracteres distintos del texto. |
| `logica-ranking` | Mantener: frecuencia descendente, desempate ascendente y negativos. | Invertir el desempate numérico. |

## Avanzado: árboles, montículos y selección voraz (12 actividades)

Se revisaron contratos, referencias completas, plantillas, pistas, explicaciones
y casos de las primeras doce avanzadas. Cinco se mantienen y siete se revisan.
`tests/python-advanced-structures-audit.test.ts` ejecuta **64 casos** con doce
referencias, doce plantillas utilizables e incompletas y doce errores educativos
fijos. Las referencias y plantillas conservan la entrada en estas ejecuciones;
no se cambia el contrato del juez ni se certifica ausencia de mutaciones en un
programa arbitrario. Montículos exige una representación concreta tras la
reparación descrita; no basta con devolver cualquier montículo válido.

Se añaden **cinco casos ocultos**, sin sustituir los históricos. Cinco errores
antes aceptados ahora fallan: contar valores distintos en vez de nodos,
comprobar solo hijos inmediatos para validar búsqueda, usar comparaciones de
valores para hallar ancestro en un árbol no ordenado, perder un elemento cuando
k es la longitud e inicializar el último fin de actividades en cero. Preorden,
niveles y búsqueda dejan de mezclar las claves históricas v/izq/der con el
modelo Python value/left/right. El ancestro explicita que no requiere un árbol
de búsqueda y que ambos objetivos pueden ser iguales, como ya mostraba un caso.

Las comprobaciones adicionales usan respuestas independientes para límites
locales: árboles completos de 500 nodos, búsqueda válida equilibrada de 500,
cadena de profundidad 50, cuenta/ancestro con 100 nodos, montículos de 100,
prioridades de 100 tareas, k igual a 1000 y 10000 actividades contiguas con
horarios negativos y positivos. Preorden del árbol completo se obtiene ordenando
etiquetas de caminos binarios, no invocando otra vez la referencia. Las rutas
esperadas de reparación de montículos se redactan por índices. Combinar 64
archivos de tamaño uno cuesta 64 por nivel durante seis niveles: total 384.
Son pruebas locales de código fijo, no verifican Piston, límites reales de
memoria/tiempo ni serialización del sandbox. No se inician servicios.

| Actividad | Decisión y fundamento | Error representativo detectado |
| --- | --- | --- |
| `logica-cuenta-nodos` | **Añadir caso** con tres valores cero repetidos; se cuentan posiciones, no valores distintos. | Usar un conjunto de valores como contador. |
| `logica-altura` | Mantener: nodos, no enlaces; vacío, ambas ramas, cadena de 50 y equilibrio. | Sumar cantidades de nodos de ambas ramas. |
| `logica-preorden` | **Reescribir contrato** solo con claves Python; orden raíz/izquierda/derecha y valores repetidos conservados. | Devolver inorden. |
| `logica-niveles` | **Reescribir contrato** solo con claves Python; anchura y orden izquierda/derecha. | Devolver profundidad primero. |
| `logica-arbol-busqueda` | **Aclarar contrato/explicación y añadir caso** de infracción heredada del abuelo. | Comparar solo con los hijos inmediatos. |
| `logica-ancestro` | **Aclarar y añadir caso** de árbol no ordenado; objetivos existentes e igualdad permitida. | Aplicar el algoritmo exclusivo de árbol de búsqueda. |
| `logica-monticulo-inserta` | Mantener: vacío, ascenso de varios niveles, igualdad y representación no ordenada. | Ordenar toda la lista tras insertar. |
| `logica-monticulo-extrae` | Mantener: vacío, mínimo cero, último elemento e hijos empatados con preferencia izquierda. | Ordenar el resto en lugar de reparar. |
| `logica-prioridad` | Mantener: prioridad negativa, id cero y desempate explícito distinto del orden de llegada. | Ordenar solo por prioridad estable. |
| `logica-k-mayores` | **Añadir caso** k igual a longitud con repetidos, cero y negativos. | Retener como máximo n−1 elementos. |
| `logica-actividades` | **Aclarar y añadir caso** de horarios negativos; contacto compatible y entrada conservada. | Inicializar último fin en cero. |
| `logica-combina-archivos` | Mantener: vacío, único, cero y reinserción de tamaños combinados. | Contar solo una vez la suma inicial. |

## Avanzado: divide y vencerás, combinatoria y programación dinámica (12 actividades)

Se revisaron objetivos, contratos, límites, referencias completas, plantillas,
pistas, explicaciones y casos de las doce actividades siguientes, desde potencia
hasta subsecuencia común. Cuatro se mantienen y ocho se revisan.
`tests/python-advanced-dynamic-audit.test.ts` ejecuta **68 casos** con doce
referencias, plantillas incompletas y errores educativos fijos. Las referencias
y plantillas conservan la entrada en estas comprobaciones; esto no añade una
garantía general de no mutación al juez.

Se conservan los casos históricos y se añaden **siete casos ocultos**. Seis
errores fijos pasaban todos los casos anteriores y ahora fallan: descartar el
factor impar en potencia, agrupar subconjuntos por longitud, ordenar
permutaciones/combinaciones como textos, devolver cero para toda mochila con
capacidad cero y contar letras distintas en vez de subsecuencias. En esta última
se separan dos motivos: multiplicidad y orden. Monedas aclara importe cero sin
denominaciones; escalera distingue secuencias de pasos de combinaciones sin orden.
Mochila explicita longitudes iguales, pesos/valores enteros no negativos,
capacidad entre 0 y 1000 y que cada objeto de peso cero se usa como máximo una vez.

**Límite de salida de permutaciones:** el contrato Python anterior permitía ocho
elementos, cuya salida de 40320 permutaciones de 0 a 7 supera incluso los 262144
caracteres que acepta el adaptador (`src/server/execution/piston.ts`), además de
los 65536 bytes configurados en `docker/compose.yaml`. Se reduce solo la revisión
Python a **seis enteros distintos entre −1000 y 1000**: sus 720 permutaciones,
serializadas con el formato del conductor Python, caben holgadamente en 65536
bytes. Se comprueba el caso de valores de mayor anchura permitida y el exceso
anterior. No se eleva ningún límite global; JavaScript/TypeScript y versiones
históricas no cambian. Esta evidencia estática no sustituye la prueba en Piston.

Las pruebas editoriales adicionales usan máscaras para subconjuntos,
`itertools` para permutaciones/combinaciones y enumeración de subsecuencias de
todos los textos binarios de longitud hasta cuatro para contrastar la DP de LCS.
Se comprueban límites locales: mezcla de 10000 elementos, 1024 subconjuntos,
720 permutaciones, 15 candidatos de combinaciones, los ocho tamaños de reinas,
Fibonacci 40, escalera 45, tablero libre 15×15, importe 1000, mochila de 200
objetos/capacidad 1000 y dos textos de 500 caracteres. Las respuestas se redactan
independientemente o se derivan de enumeraciones distintas de la referencia.
No se ejecuta código de alumnos, no se mide complejidad de sus programas y no
se afirma validación real de tiempo, memoria, salida o aislamiento de Piston.

| Actividad | Decisión y fundamento | Error representativo detectado |
| --- | --- | --- |
| `logica-potencia` | **Añadir caso** con base distinta de uno y exponente impar positivo. | Truncar el exponente al par anterior. |
| `logica-mezcla` | Mantener: vacío, negativos, duplicados y longitud impar; 10000 local. | Ordenar un conjunto y perder repeticiones. |
| `logica-subconjuntos` | **Añadir caso** de tres elementos con cero y negativo para fijar el orden por duplicación. | Agrupar resultados por longitud. |
| `logica-permutaciones` | **Acotar contrato y añadir caso** de orden numérico con negativo y dos cifras; seis elementos para respetar la salida. | Ordenar representaciones textuales. |
| `logica-combinaciones` | **Aclarar y añadir caso** de comparación numérica de listas; candidatos desordenados y sin reutilización. | Ordenar combinaciones por su texto. |
| `logica-reinas` | Mantener: sin solución, simetrías distintas y límite ocho; recuentos conocidos para todos los tamaños. | Ignorar diagonales y contar todas las permutaciones de columnas. |
| `logica-fibonacci` | Mantener: F(0), F(1), crecimiento y límite 40. La memoria interna no queda certificada por JSON. | Desplazar la secuencia a F(n+1). |
| `logica-escalera` | **Aclarar** que el orden de los pasos distingue formas y conservar bases; límite 45 local. | Devolver F(n) en vez de F(n+1). |
| `logica-caminos-obstaculos` | Mantener: inicio/meta bloqueados, una celda y obstáculo interior; filas/columnas cortadas y 15×15 local. | Contar como si no hubiera obstáculos interiores. |
| `logica-monedas` | **Aclarar** lista vacía, importe cero y objetivo de mínimo, no número de combinaciones. | Elegir siempre la moneda mayor. |
| `logica-mochila` | **Aclarar dominio y añadir caso** de capacidad cero con dos objetos de peso cero. | Retornar cero antes de considerar objetos gratuitos. |
| `logica-subsecuencia-comun` | **Añadir dos casos**: letras repetidas y orden inverso. | Contar la intersección de caracteres distintos. |

## Avanzado: grafos, recorridos y optimización (12 actividades)

Se revisaron objetivos, contratos, límites, plantillas completas, referencias,
pistas, explicaciones y casos de las últimas doce actividades. Tres se mantienen
y nueve se revisan. `tests/python-advanced-graphs-audit.test.ts` ejecuta **67
casos** con doce referencias, doce plantillas ejecutables e incompletas y doce
errores fijos. Ocho errores antes aceptados fallan con **ocho casos ocultos nuevos**,
sin reemplazar casos históricos. Las referencias y plantillas conservan las
entradas en estas comprobaciones; marcar visitas sobre una copia es compatible,
pero el juez no certifica no mutación en programas arbitrarios.

Se aclaran la numeración y los ciclos de alcanzables, la cuadrícula rectangular
vacía de islas y la deduplicación de vecinos. El contrato de adyacencia ya pedía
eliminar aristas duplicadas, pero las restricciones las prohibían: ahora se
permiten explícitamente, incluso invertidas, sin bucles. Se acota a **4000 aristas**
con hasta 1000 nodos para que el JSON de vecinos quepa en los 65536 bytes de salida
configurados en Docker. El contrato anterior admitía grafos completos cuya
salida no cabía. La prueba contrasta 4000 aristas con una salida independiente y
comprueba el exceso anterior, sin elevar límites globales. La memoria total de
distancias se corrige a O(n + m), incluyendo las conexiones, tanto en coste como
en explicación. Solo cambian fuentes Python de revisiones nuevas.

Las pruebas adicionales cubren los límites locales de 1000 nodos, ciclo dirigido
y planificación de 100, Dijkstra de 200, islas 300×300, laberinto 200×200, edición
de 200 caracteres y subsecuencia creciente de 500. Capacidad ensaya además una
entrada representativa de 10000 paquetes, sin inventar un máximo que su contrato
no declara. Se comprueban islas vacías, meta bloqueada, ciclo desconectado en
dependencias y ciclo de duración cero en planificación.

Los oráculos independientes enumeran órdenes topológicos de grafos de tres
nodos, contrastan Dijkstra con Floyd-Warshall para los 64 grafos no dirigidos
simples de cuatro nodos y enumeran particiones contiguas para capacidad y
subsecuencias por índices para crecimiento estricto. Se preservan los casos
previos y una prueba comprueba que las tablas de este documento contienen
exactamente las 224 identidades, una vez cada una. Este inventario acompaña la
revisión individual, no la sustituye ni acredita ejecución real en Piston.

| Actividad | Decisión y fundamento | Error representativo detectado |
| --- | --- | --- |
| `logica-adyacencia` | **Aclarar, acotar y añadir caso** con duplicados invertidos; vecinos únicos, ordenados y aislados conservados. | Conservar vecinos duplicados en listas. |
| `logica-alcanzables` | **Aclarar y añadir caso** de ciclo con nodo aislado; numeración y visita única. | Evitar solo volver al padre sin recordar visitas globales. |
| `logica-distancias` | **Corregir coste/explicación y añadir caso** con dos caminos de distinta longitud. | Fijar la distancia del primer recorrido en profundidad. |
| `logica-ciclo-dirigido` | Mantener: ciclo, descendiente compartido, vacío y lazo en otra componente; límite 100 local. | Tratar un nodo terminado como antecesor activo. |
| `logica-dependencias` | **Añadir caso** donde se libera una tarea menor que otra ya disponible. | Usar FIFO en lugar del mínimo disponible en cada paso. |
| `logica-dijkstra` | **Añadir caso** de arista escrita en sentido inverso; costes y desconexión ya cubiertos. | Interpretar las aristas como dirigidas. |
| `logica-islas` | **Aclarar** rectangularidad, cuadrícula vacía y conservación de entrada; límites y vacíos locales. | Conectar también las diagonales. |
| `logica-laberinto` | **Añadir caso** de pasillo que obliga a moverse a la izquierda y excede la distancia Manhattan. | Permitir solo derecha y abajo. |
| `logica-capacidad` | Mantener: orden, capacidad al menos del paquete mayor y frontera; particiones independientes locales. | Devolver solo el máximo entre el peso mayor y la media redondeada. |
| `logica-edicion` | **Añadir caso** donde borrar e insertar supera a sustituir posiciones alineadas. | Contar diferencias por posición y longitud. |
| `logica-subsecuencia-creciente` | Mantener: estricta, no contigua, repetidos, vacío y orden descendente; enumeración independiente. | Contar todos los valores distintos. |
| `logica-planifica-tareas` | **Añadir caso** de cadena de tres tareas, además de paralelismo, ciclos y cero. | Propagar solo la duración de una dependencia directa. |

## Límites y siguientes fases

- No se amplía AST, esquema, dependencias ni modalidades.
- La ejecución local no verifica sandbox, serialización del ejecutor ni publicación.
- La revisión de tiempos, teoría duplicada y ergonomía sigue abierta en E/F.
- La auditoría individual de las 224 actividades está registrada; no equivale al
  cierre de D2. Completar las garantías y límites del ejecutor real con autorización.
- Continuar E/F: estructura editorial, vocabulario, explicaciones y ayudas,
  tiempos, jerarquía visual y accesibilidad. No eliminar el plan antes del cierre.
