# Repeticiones entre superficies del recorrido Python

## Alcance y criterio

Este contraste es posterior a la revisión de los 224 enunciados, teorías locales,
explicaciones de solución y 433 ejemplos. Revisa la función de cada texto en
conjunto: resumen para identificar la práctica, objetivo para orientar, enunciado
para el contrato y la introducción conceptual, pistas progresivas y solución
consultada aparte. No elimina una explicación por repetir un término necesario.

La ayuda actual (`src/lib/learning-help.ts`) ya elige objetivos de práctica o,
si faltan, el objetivo general; no muestra ambos juntos y omite duplicados
literales. Por eso no se vacían metadatos solo para evitar esa duplicación.
Las condiciones necesarias y los textos exactos de PROGRAM permanecen visibles
en el enunciado, aunque se acorte la descripción del catálogo.

El inventario cubre **32/224 actividades**: ocho con ajustes y 24 conservadas.
Quedan **192 actividades** para el contraste contextual entre superficies.
Las revisiones individuales anteriores no equivalen a cerrar este inventario.

## Primer bloque: impresión, variables, entrada y primeros retornos

| Actividad | Decisión y motivo |
| --- | --- |
| `logica-saludo` | Conservar: resumen de tarea, objetivo de salida y distinción texto/instrucción aportan niveles diferentes. |
| `logica-dos-lineas` | Conservar: varias instrucciones y orden se complementan; las pistas separan cantidad, textos y secuencia. |
| `logica-orden-mensaje` | Conservar: es una práctica guiada de reordenación; el orden requerido forma parte del contrato, no es una solución anticipada de reto independiente. |
| `logica-texto-calculo` | Acortar descripción: no repetir dos líneas, datos y respuesta completa; el enunciado conserva suma frente a texto y espacios exactos. |
| `logica-guarda-nombre` | Conservar: nombrar la variable y consultar su valor son pasos distintos, con pistas sobre comillas. |
| `logica-guarda-cantidad` | Acortar descripción: resumir valor frente a nombre sin repetir la plantilla, ocho y ausencia de entrada. El enunciado conserva esos datos. |
| `logica-actualiza-puntos` | Acortar descripción: orientar a actualizar desde el valor anterior, sin repetir once ni enseñar let/const de otros lenguajes. Las pistas conservan el razonamiento de reasignación Python. |
| `logica-intercambia` | Conservar: auxiliar, riesgo de pérdida y secuencia aportan progresión; no sustituir por desempaquetado que se enseña después. |
| `logica-suma-cantidades` | Conservar: números frente a textos y uso de variables justifican las pistas guiadas. |
| `logica-cambio` | Conservar: objetivo de diferencia y dirección de resta no son explicaciones intercambiables. |
| `logica-precio-unidades` | Conservar: total, precio común y multiplicación frente a suma repetida tienen funciones distintas. |
| `logica-parentesis` | Conservar: precedencia e intención de duplicar el grupo requieren explicación; no retirar la introducción conceptual. |
| `python-constante` | Separar descripción de objetivo: presentar cajas/lápices en el resumen y equivalencia con nombre en el objetivo. Conservar convención, ejemplo alternativo y límite de certificación en el enunciado. |
| `logica-lee-nombre` | Conservar: lectura y construcción del saludo son habilidades distintas; la pista de espacio evita un error de formato. |
| `logica-lee-doble` | Conservar: lectura preparada y cálculo deben distinguirse; no pedir cambios de entrada ajenos a la tarea. |
| `logica-lee-suma` | Conservar: convertir cada línea y sumar números no equivale a concatenar; pistas en orden. |
| `logica-mensaje-resultado` | Acortar descripción: identificar prefijo y ciudad sin repetir el contrato ni Lima. El enunciado mantiene Destino:, espacio, mayúsculas y espacios interiores. |
| `python-decimal` | Separar descripción de objetivo: el resumen identifica conversión, incremento e impresión; el objetivo conserva la habilidad de convertir antes de calcular. Mantener float/int y .0 en el enunciado. |
| `logica-numero-texto` | Conservar: misma notación de operador con tipos distintos necesita contraste, no una deduplicación léxica. |
| `logica-booleano` | Conservar primeras dos pistas y concretar la tercera en True, sin remitir al lenguaje seleccionado. La impresión preparada conserva true en minúsculas. |
| `logica-igualdad` | Conservar primeras dos pistas y concretar la tercera en a == b; mantener lecturas e impresión preparada, sin remisión genérica a otro lenguaje. |
| `logica-alcanza` | Conservar: el límite incluido es la dificultad central; comparación, igualdad y pista final se escalonan. |
| `logica-retorno` | Conservar: parámetro y return introducen entrega de valor, no salida impresa. |
| `logica-parametro` | Conservar: reto independiente sin receta literal en la descripción; pistas orientan factores y uso de la entrada. |
| `logica-dos-parametros` | Conservar: acceso a ambos valores, suma y entradas variables son objetivos complementarios; no adelantar una respuesta fija. |
| `logica-imprimir-devolver` | Conservar: salida de pantalla frente a retorno exige contraste explícito; las pistas usan el cálculo ya preparado. |
| `logica-predice-valores` | Conservar: orden de actualizaciones es el objetivo y debe poder seguirse sin ejecutar. |
| `logica-tabla-valores` | Conservar: estados inicial/intermedios/final y separador textual tienen responsabilidades diferentes. |
| `logica-minutos-segundos` | Conservar: equivalencia fija y dirección de conversión son necesarias; la pista final no reemplaza los primeros peldaños. |
| `logica-perimetro` | Conservar: cuatro lados, agrupación y cálculo orientan sin modificar las entradas. |
| `logica-repara-presupuesto` | Conservar: distinguir precio unitario y envío fijo evita el defecto de la plantilla; no retirar esa condición como repetición. |
| `logica-merienda` | Conservar: calcular primero y convertir después son etapas distintas de la construcción del retorno. |

## Conservación y límites

Solo cambian **seis descripciones y la tercera pista de dos actividades** en la
proyección Python. No cambian objetivos, objetivos de práctica, introducciones,
enunciados, condiciones, prerrequisitos, ejemplos ni explicaciones de solución.
Las primeras dos pistas de las dos actividades permanecen exactas. Tampoco
cambian código, AST, casos ocultos, recursos, minutos, orden o progreso.

`tests/python-intro-copy.test.ts` fija las 32 identidades y ocho campos, protege
los demás mediante una huella calculada antes de editar y comprueba las
distinciones conceptuales conservadas. También verifica la selección existente
de objetivos sin modificar el componente compartido ni otros lenguajes.
`tests/python-intro-copy-baseline.ts` reconstruye íntegra la entrega `24bfc2…` y
se encadena a las reconstrucciones históricas sin sustituir sus expectativas.
La huella vigente es `24642c…`, sin preparar ni activar la base.

Las pruebas de texto no acreditan calidad pedagógica completa, revisión visual,
accesibilidad, ejecución real en Piston ni rendimiento. El resto del inventario,
el vocabulario contextual y las fases D2/F siguen abiertos. No se elimina el plan.
