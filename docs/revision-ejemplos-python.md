# Revisión editorial de ejemplos públicos Python

## Alcance y método

Todos los 433 ejemplos públicos ya tenían explicación. Esta revisión posterior
contrasta cada pareja entrada/salida y su explicación con el contrato Python,
el orden de aprendizaje y el formato de ejecución. No basta con detectar texto
no vacío ni con ejecutar la solución que se quiere justificar.

La revisión comienza por las primeras **32/224 actividades**, con **49/433
ejemplos públicos**. Se conservan los 49 textos: justifican la salida sin
contradicciones ni vocabulario de otros lenguajes. No cambian datos, salidas,
visibilidad, orden, casos ocultos ni fuentes compartidas. Quedan **192 actividades
y 384 ejemplos** por contrastar individualmente.

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
