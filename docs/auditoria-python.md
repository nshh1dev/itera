# Auditoría pedagógica del recorrido Python

Registro por actividad de la revisión D2. Conservar las identidades y los casos
históricos; cualquier revisión se publica como una versión nueva solo de Python.
No usar la validación estructural como sustituto de esta revisión.

## Alcance y evidencia

Bloques revisados: **32 actividades de iniciación** (25 mantenidas y 7 con
aclaraciones) y **74 de principiante** (59 mantenidas y 15 revisadas).
Quedan **118 actividades** por auditar individualmente.
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

## Límites y siguiente bloque

- No se amplía AST, esquema, dependencias ni modalidades.
- La ejecución local no verifica sandbox, serialización del ejecutor ni publicación.
- La revisión de tiempos, teoría duplicada y ergonomía sigue abierta en E/F.
- Continuar con las 82 actividades intermedias y 36 avanzadas.
  Registrar decisiones individuales y errores relevantes, no solo
  recuentos de casos o cobertura de campos.
