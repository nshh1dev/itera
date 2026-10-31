# Auditoría pedagógica del recorrido Python

Registro por actividad de la revisión D2. Conservar las identidades y los casos
históricos; cualquier revisión se publica como una versión nueva solo de Python.
No usar la validación estructural como sustituto de esta revisión.

## Alcance y evidencia

Primer bloque: **32 actividades de iniciación revisadas**, 25 mantenidas y 7 con
aclaraciones de enunciado. Quedan **192 actividades** por auditar individualmente.
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

## Límites y siguiente bloque

- No se amplía AST, esquema, dependencias ni modalidades.
- La ejecución local no verifica sandbox, serialización del ejecutor ni publicación.
- La revisión de tiempos, teoría duplicada y ergonomía sigue abierta en E/F.
- Continuar con las 74 actividades de principiante; después, 82 intermedias y
  36 avanzadas. Registrar decisiones individuales y errores relevantes, no solo
  recuentos de casos o cobertura de campos.
