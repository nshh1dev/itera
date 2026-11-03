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

El inventario cubre **160/224 actividades**: 60 con ajustes y 100 conservadas.
Quedan **64 actividades** para el contraste contextual entre superficies.
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

## Segundo bloque: condiciones, bucles, listas y textos

Se revisan otras **32 actividades**, con siete descripciones separadas de su
objetivo y una tercera pista concretada en Python. Las otras 24 actividades se
conservan; no se retiran explicaciones necesarias para entender los conceptos.

| Actividad | Decisión y motivo |
| --- | --- |
| `logica-elige-mensaje` | Conservar: reto de completar una etiqueta; las pistas no sustituyen la decisión por la respuesta literal. |
| `logica-signo` | Conservar: orden de condiciones y caso final son distintos; no anticipar la etiqueta que falta. |
| `logica-mayor-tres` | Conservar: candidato inicial y comparaciones posteriores requieren progresión; no inventar cero como máximo. |
| `logica-dos-requisitos` | Concretar tercera pista en and y conservar comparaciones preparadas; las dos primeras mantienen ambas condiciones frente a una sola. |
| `logica-alternativas` | Conservar: alternativas y bloqueo tienen alcances diferentes; agrupación y negación evitan saltarse el bloqueo. |
| `logica-tarifa` | Conservar: tramos y límites son el contrato; las pistas ordenan las decisiones sin añadir condiciones. |
| `python-condicional` | Separar descripción de objetivo: resumir clasificación de edad y mantener la expresión condicional como habilidad. El enunciado conserva sintaxis, umbral incluido y textos exactos. |
| `logica-uno-n` | Conservar: generar valores no equivale a recibir una lista; objetivo y pistas distinguen número actual, límite y salida. |
| `logica-cuenta-atras` | Conservar: incluir cero y terminar requieren tanto condición como avance descendente. |
| `logica-suma-uno-n` | Conservar: acumulador y contador tienen funciones distintas; la pista final completa esa distinción. |
| `logica-tabla` | Conservar: diez productos ordenados, recorrido de multiplicadores y cálculo son pasos complementarios. |
| `logica-multiplos` | Conservar: recorrer, comprobar resto y contar no son instrucciones redundantes. |
| `logica-bucle-roto` | Conservar: condición, avance y terminación explican el defecto sin cambiar entrada ni resultado. |
| `python-centinela` | Separar descripción de objetivo: resumir valores anteriores al cero, conservando en el objetivo la terminación por centinela y en el enunciado break y exclusión de lo posterior. |
| `python-omite-negativos` | Separar descripción de objetivo: resumir qué valores conservar; mantener continue frente a break y la continuidad tras negativos en el enunciado. |
| `logica-posicion` | Conservar: posición y valor no son equivalentes; las pistas separan acceso al contenedor y al índice. |
| `logica-indices` | Conservar: límites válidos y valor de cada posición son dificultades diferentes de la plantilla. |
| `logica-suma-lista` | Conservar: transformar un contador requiere distinguir añadir uno de añadir el valor; vacío conserva suma cero. |
| `logica-maximo` | Conservar: candidato real y actualización condicional evitan el máximo cero ficticio con negativos. |
| `logica-cuenta-condicion` | Conservar: conteo frente a suma y cero no positivo son condiciones necesarias. |
| `logica-filtra-lista` | Conservar: salida vacía inicial, comparación y límite incluido forman pistas progresivas. |
| `logica-busqueda-lineal` | Conservar: recorrer, devolver primera posición y ausencia -1 no son repeticiones intercambiables. |
| `logica-longitud-texto` | Conservar: espacios/signos cuentan, no modificar ni devolver número fijo; no anticipar una receta distinta. |
| `logica-minusculas` | Conservar: la descripción conecta con el siguiente conteo de vocales; la tarea sigue siendo devolver texto convertido, no comparar ni contar. |
| `logica-vocales` | Conservar: normalización, pertenencia y contador se integran; las pistas no cuentan todas las letras. |
| `logica-invierte` | Conservar: construir delante frente a detrás requiere el contraste de concatenación; no retirar ese concepto. |
| `logica-elimina-caracter` | Conservar: construir salida y preservar orden/diferencias del original son responsabilidades distintas. |
| `logica-palabras` | Conservar: transición a palabra frente a cada letra y espacios repetidos explica por qué hace falta estado. |
| `python-ordena-numeros` | Separar descripción de objetivo: resumir ambas listas y repeticiones; conservar sorted frente a sort/None, no mutación y vacío en el enunciado. |
| `python-recorta` | Separar descripción de objetivo: resumir tramo delimitado; conservar límite superior exclusivo y sintaxis de corte en objetivo/enunciado, sin añadir uno a fin. |
| `python-une-palabras` | Separar descripción de objetivo: resumir espaciado final; conservar split sin argumento frente a split(' '), join, mayúsculas/signos y texto vacío en el enunciado. |
| `python-desempaqueta` | Separar descripción de objetivo: resumir intercambio de pareja; conservar evaluación de la derecha antes de asignar y tupla frente a lista JSON en el enunciado. |

## Tercer bloque: parejas, diccionarios, referencias y validación

Se revisan otras **32 actividades**: nueve descripciones separadas de sus
objetivos, un objetivo y una meta de práctica que aún hablaban de propiedad,
y una tercera pista concretada en None. Se conservan las otras 20 actividades.

| Actividad | Decisión y motivo |
| --- | --- |
| `python-enumera` | Separar descripción de objetivo: presentar numeración de palabras desde uno; mantener enumerate, parejas y posiciones repetidas en teoría y pistas. |
| `python-empareja` | Separar descripción de objetivo: presentar parejas hasta la lista más corta; mantener zip, desempaquetado y ausencia de relleno. |
| `python-retorno-multiple` | Separar descripción de objetivo: presentar suma/producto juntos; mantener tupla, desempaquetado y finalización de cada llamada con return. |
| `logica-ficha-producto` | Corregir objetivo: clave de diccionario, no propiedad por nombre. La ficha ya se define en descripción/enunciado; no cambiar el precio ni su consulta. |
| `logica-ficha-resultado` | Conservar: total calculado y unidades recibidas tienen responsabilidades distintas dentro del diccionario de resultado. |
| `logica-opcional` | Corregir objetivo de práctica: clave ausente frente a cantidad cero; conservar respaldo solo si falta la clave. |
| `logica-ausencia` | Conservar: ausencia explícita, cero y falsedad requieren distinción; la tercera pista usa None y explica JSON. |
| `logica-auxiliares` | Conservar: subtotal, envío y límite exacto justifican separar operaciones y decisiones. |
| `logica-variable-local` | Conservar: valor recibido frente a local fijo es el defecto central, no una repetición prescindible. |
| `logica-parametro-exterior` | Conservar: parámetro y exterior no son la misma fuente; mantener qué dato se usa y cuál no cambia. |
| `logica-llamadas-independientes` | Conservar: pertenencia del contador a cada llamada y lugar de inicialización son conceptos distintos. |
| `logica-sin-estado-global` | Conservar: tasa variable y argumentos completos evitan dependencia fija; el resultado acumula retornos, no estado global. |
| `logica-encadena-retornos` | Conservar: retorno como argumento de otra auxiliar, sin sustituirlo por impresión. |
| `logica-dos-nombres-lista` | Conservar: asignar alias no copia; la mutación visible desde original requiere ese contraste. |
| `logica-reasigna-o-muta` | Conservar: cambiar referencia no equivale a append sobre la lista compartida; no retirar la prohibición necesaria. |
| `logica-copia-plana` | Conservar: lista plana y copia exterior definen el alcance de independencia, no estructuras arbitrarias. |
| `logica-conserva-entrada` | Conservar: salida nueva y recorrido sin asignaciones a la entrada mantienen responsabilidades distintas. |
| `logica-registro-compartido` | Conservar: mutación intencional del diccionario y observación por ambos nombres, sin prometer identidad desde JSON. |
| `python-identidad` | Separar descripción de objetivo: resumir efecto de alias frente a copia; conservar ==/is, instantánea previa, copia superficial y límites de observación. |
| `python-opcional-seguro` | Separar descripción de objetivo: resumir dos listas independientes; conservar evaluación del valor predeterminado y None como señal por llamada. |
| `python-actualiza-diccionario` | Separar descripción de objetivo: presentar asociación actualizada y otras parejas conservadas; mantener copia superficial y límites con valores interiores mutables. |
| `python-borra-clave` | Separar descripción de objetivo: presentar diccionario sin clave aunque faltara; conservar pop, respaldo y cero presente. |
| `python-recorre-pares` | Separar descripción de objetivo: presentar textos ordenados; mantener vistas, método con paréntesis, conversión numérica y formato exacto. |
| `python-lista-registros` | Separar descripción de objetivo: presentar total de cantidades sin agrupar nombres; conservar diccionarios, acumulador y repeticiones. |
| `logica-valida-divisor` | Concretar tercera pista en None y cociente, sin remisión al lenguaje. Conservar primeras dos pistas y teoría de / como float frente a JSON. |
| `logica-valido-cero-ausente` | Conservar: ausencia, negativo y válido son estados distintos; el orden evita comparar None con números. |
| `logica-localiza-error` | Conservar: guarda anterior al acceso y rango con dos límites explican por qué no provocar el error. |
| `logica-captura-conversion` | Conservar: formato completo, signo y cifras ASCII forman validación progresiva; no reemplazar por int nativo que admitiría otra gramática. |
| `logica-error-dominio` | Conservar: regla de dominio, lugar de lanzamiento/captura y mensaje exacto son responsabilidades separadas. |
| `logica-recupera-elementos` | Conservar: captura por elemento y contador de rechazados permiten continuar tras un error; las pistas no deben perder ese alcance. |
| `logica-asercion-normal` | Conservar: aserción conocida y retorno del dato variable son acciones distintas; no convertir salida en conteo de pruebas. |
| `logica-pruebas-limites` | Conservar: vacío y negativos distinguen supuestos; la corrección requiere candidato real, no máximo cero ficticio. |

## Cuarto bloque: integración, conjuntos, agrupación y recorridos

Se revisan otras **32 actividades**: 16 descripciones separadas de su habilidad
y dos terceras pistas concretadas en True/False. Se conservan las otras 14.

| Actividad | Decisión y motivo |
| --- | --- |
| `logica-reproduce-fallo` | Conservar: caso mínimo, comparación defectuosa y aserción de regresión tienen funciones distintas. |
| `logica-conserva-regresion` | Conservar: límite incluido e importe mínimo son dos bordes diferentes; mantener ambos. |
| `logica-factorial` | Conservar: producto inicial, rango incluido y retorno tras el bucle explican también cero. |
| `logica-fizzbuzz` | Conservar: caso combinado primero y una salida por vuelta son condiciones necesarias, no repetición prescindible. |
| `logica-mediciones` | Conservar: suma, conteo y ausencia de máximo necesitan acumuladores distintos. |
| `logica-carrito` | Conservar: diccionarios y límites de entrada contextualizan; objetivo y pistas separan subtotal de descuento único. |
| `logica-notas` | Conservar: descripción de entrada y objetivo de promedio ausente cumplen funciones diferentes. |
| `logica-saldo` | Conservar: orden y saldo candidato explican por qué validar antes de actualizar. |
| `logica-gastos-registro` | Conservar: título del hito identifica el proyecto; contrato multarchivo y ayudas desarrollan total/categorías. La ayuda no muestra juntos objetivos duplicados. |
| `logica-gastos-validacion` | Conservar: el hito mantiene continuidad con el anterior; validación previa, continue y cero válido son ayudas distintas. No cambiar manifiesto ni persistencia declarada. |
| `python-conjunto-seguro` | Separar descripción de objetivo: resumir actualización sin repeticiones; conservar add antes de discard, ausencia tolerada y sorted. |
| `python-union` | Separar descripción de objetivo: presentar valores reunidos y ordenados; conservar pertenencia a cualquiera de las entradas y operador de unión. |
| `python-interseccion` | Separar descripción de objetivo: presentar valores compartidos sin repeticiones; conservar ambas entradas, vacío y orden requerido en el enunciado. |
| `python-diferencia` | Separar descripción de objetivo: presentar requisitos pendientes; conservar dirección requeridos menos disponibles. |
| `python-simetrica` | Separar descripción de objetivo: presentar exclusivos de ambos lados; conservar contraste con unión, intersección y diferencia dirigida. |
| `python-subconjunto` | Separar descripción de objetivo: presentar disponibilidad sin contar unidades; conservar igualdad y verdad del conjunto vacío. |
| `logica-repetido` | Concretar tercera pista en True; conservar consulta antes de añadir y las dos primeras pistas. |
| `logica-deduplica` | Conservar: conjunto para pertenencia y lista para orden tienen responsabilidades distintas; no ordenar. |
| `logica-frecuencias` | Conservar: clave variable, inicialización condicional y actualización fuera del if evitan defectos distintos. |
| `logica-primer-unico` | Conservar: contar primero y volver a recorrer distingue frecuencia final de primera aparición provisional. |
| `logica-anagramas` | Concretar tercera pista en False/True sin cambiar comparación de contadores ni retorno fuera del bucle; conservar primeras dos. |
| `python-crea-grupo` | Separar descripción de objetivo: presentar nombre añadido y conservación de originales; mantener copia de listas interiores y setdefault. |
| `logica-agrupa-registros` | Conservar: cada registro ya se define como diccionario; lista propia por categoría, orden y repeticiones tienen funciones distintas. |
| `python-comprension` | Separar descripción de objetivo: presentar cuadrados con todas sus posiciones; conservar comprensión sin filtro y negativos. |
| `python-comprension-filtro` | Separar descripción de objetivo: presentar vocales normalizadas; conservar lower, filtro posterior al for y repeticiones. |
| `python-comprension-condicional` | Separar descripción de objetivo: presentar sustitución sin eliminar posiciones; conservar expresión condicional frente a filtro. |
| `python-comprension-dict` | Separar descripción de objetivo: presentar palabra/longitud; conservar diccionario frente a conjunto y reemplazo de clave repetida. |
| `python-iterador` | Separar descripción de objetivo: presentar dos materializaciones; conservar agotamiento del mismo iterador y lista original intacta. |
| `python-generador` | Separar descripción de objetivo: presentar suma sin lista intermedia; conservar consumo bajo demanda y que los casos no certifican memoria ni técnica. |
| `python-map` | Separar descripción de objetivo: presentar dobles enteros; conservar función sin llamada anticipada y transformación diferida. |
| `python-filter` | Separar descripción de objetivo: presentar nombres adultos en orden; conservar predicado sobre fichas, edad 18 incluida y extracción posterior. |
| `python-agrega` | Separar descripción de objetivo: presentar resumen incluso vacío; conservar None para extremos ausentes y negativos/cero. |

## Quinto bloque: ordenación, módulos, archivos y registros anidados

Se revisan otras **32 actividades**: 14 descripciones pasan de repetir la
habilidad a presentar la tarea; se conservan las otras 18 actividades, incluidos
los contratos multarchivo. No se vacían objetivos ni se recortan enunciados.

| Actividad | Decisión y motivo |
| --- | --- |
| `python-clave-longitud` | Separar descripción de objetivo: presentar longitud ascendente y empates estables; conservar función sin llamada y límites de certificación de key. |
| `python-lambda-desempate` | Separar descripción de objetivo: presentar longitudes descendentes y empates alfabéticos; conservar lambda, tuplas y dirección independiente de criterios. |
| `python-formato-decimal` | Separar descripción de objetivo: presentar texto con precisión solicitada y ceros finales; conservar float frente a regla financiera y round frente a formato. |
| `python-consulta-anidada` | Separar descripción de objetivo: presentar consulta de nota; conservar respaldo solo si falta clave, modelo de diccionarios interiores y cero frente a None. |
| `logica-inventario` | Conservar: acumular cambios y permitir negativos distingue este ejercicio del inventario modular que rechaza movimientos. |
| `logica-importa-preparado` | Conservar: módulo preparado y llamada al nombre importado son el contrato del proyecto; las ayudas distinguen nombre, archivo y resultado. |
| `logica-extrae-modulo` | Conservar: función en reglas y llamada desde main enseñan responsabilidades distintas; no recortar firmas ni alcance de la comprobación por retorno. |
| `logica-separa-reglas-io` | Conservar: regla numérica y texto del adaptador tienen responsabilidades distintas; mantener Total: y espacio exactos. |
| `logica-repara-importacion` | Conservar: nombre disponible frente al importado es el defecto central; conservar recurso de solo lectura y suma adicional. |
| `logica-organiza-modulos` | Conservar: tres responsabilidades justifican el resumen; enunciado mantiene Resultado:, dirección de dependencias y límites de certificación. |
| `logica-lee-archivo` | Conservar: recurso real y selección por índice no equivalen a respuesta fija; mantener -1, saltos y cierre del recurso. |
| `logica-escribe-archivo` | Conservar: lectura, escritura y reapertura son operaciones diferentes; mantener artefacto evaluado y recurso inicial intacto. |
| `logica-valida-json` | Conservar: analizar JSON y validar estructura son habilidades distintas; mantener bool excluido del límite entero y textos exactos. |
| `logica-guarda-recupera` | Conservar: serialización y análisis tras reapertura tienen funciones distintas; mantener JSON compacto y límite de mismo proceso. |
| `logica-recupera-archivo-invalido` | Conservar: ausencia y JSON roto requieren recuperaciones distintas; no ocultar errores arbitrarios ni responder por nombre. |
| `logica-actualiza-persistidos` | Conservar: valores enteros previos, orden y actualización no son redundantes; mantener recurso inicial y no prometer durabilidad ni persistencia entre procesos. |
| `logica-inventario-modular` | Conservar: hito sin almacenamiento y mutación intencional de stock son necesarios; mantener rechazo previo y productos con cero. |
| `logica-inventario-persistente` | Conservar: continuidad de reglas y almacenamiento tiene funciones distintas; mantener carga preferente, mutación declarada y segunda llamada en proceso nuevo. |
| `python-inventario-valora` | Separar descripción de objetivo: presentar valoración y productos ordenados; conservar céntimos enteros, total y desempate por nombre. |
| `python-academia-inscribe` | Separar descripción de objetivo: presentar inscripción pendiente sin borrar notas; conservar copia interior y setdefault frente a calificación. |
| `python-academia-califica` | Separar descripción de objetivo: presentar nota válida sin crear inscripciones; conservar cortocircuito, existencia y rango incluido. |
| `python-academia-resume` | Separar descripción de objetivo: presentar medias/clasificación sin descartar cero; conservar None para ausencia y desempates. |
| `python-contactos-crea` | Separar descripción de objetivo: presentar alta sin vacío ni repetición normalizada; conservar copia de fichas y teléfonos de texto. |
| `python-contactos-edita` | Separar descripción de objetivo: presentar teléfono/correo con textos; conservar texto vacío válido, None ignorado y contacto ausente sin cambios. |
| `python-contactos-borra` | Separar descripción de objetivo: presentar copia sin un contacto; conservar normalización, coincidencia completa y ausencia tolerada. |
| `python-contactos-busca` | Separar descripción de objetivo: presentar nombres filtrados y ordenados; conservar todos los filtros, coincidencia parcial y campo ausente distinto de texto vacío. |
| `logica-agenda-operaciones` | Conservar: crear/completar y reparto de módulos orientan el primer hito; mantener booleanos Python frente a JSON, orden e idempotencia. |
| `logica-agenda-almacenamiento` | Conservar: almacenamiento añade responsabilidad distinta; mantener copia explícita, carga inicial y persistencia entre procesos declarada. |
| `logica-agenda-regresion` | Conservar: fallo de conexión y pruebas de regresión son objetivos complementarios; mantener datos anteriores, completar dos veces y recuperación en proceso nuevo. |
| `python-transforma-campo` | Separar descripción de objetivo: presentar limpieza del campo sin cambiar otros; conservar copia suficiente para textos inmutables y clave ausente sin crear. |
| `python-transforma-registros` | Separar descripción de objetivo: presentar transformación con recuperación numérica; conservar nombres de operaciones, ValueError local, orden y gramática de int nativo. |
| `logica-busqueda-binaria` | Conservar: intervalo inclusivo, índice frente a valor y descarte de mitad son ayudas progresivas; no ordenar ni cortar la entrada. |

## Conservación y límites

En el primer bloque cambian **seis descripciones y la tercera pista de dos actividades** en la
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
La huella de ese bloque es `24642c…`.

En el segundo bloque cambian **siete descripciones y la tercera pista de una
actividad**. La huella previa excluye solo esos ocho campos y conserva todo el
resto del catálogo, incluidas las otras 24 actividades del bloque y las primeras
32 revisadas. `tests/python-flow-copy.test.ts` comprueba el inventario y las
distinciones conceptuales; `tests/python-flow-copy-baseline.ts` reconstruye
íntegra la entrega `24642c…` y se encadena a las anteriores sin cambiar sus
expectativas. La huella de ese bloque es `64a0bf…`.

En el tercero cambian **nueve descripciones, un objetivo, una meta de práctica y
la tercera pista de una actividad**. Se conservan los 433 ejemplos, enunciados,
teoría, código, soluciones, archivos, contratos, orden y tiempos. La huella previa
excluye solo esos doce campos. `tests/python-reference-copy.test.ts` comprueba el
inventario y conceptos conservados; `tests/python-reference-copy-baseline.ts`
reconstruye íntegra la entrega `64a0bf…` y se encadena a las anteriores sin
cambiar expectativas. La huella de ese bloque es `e9ae5f…`.

En el cuarto cambian **16 descripciones y la tercera pista de dos actividades**.
La huella previa excluye solo esos 18 campos; protege los 433 ejemplos, teoría,
enunciados, código, soluciones, manifiestos, contratos, tiempos y las otras 14
actividades. `tests/python-collection-copy.test.ts` fija inventario y conceptos;
`tests/python-collection-copy-baseline.ts` reconstruye íntegra la entrega
`e9ae5f…` y se encadena a las anteriores sin sustituir expectativas. El control
histórico de vocabulario de `python-crea-grupo` usa esa reconstrucción, no la
descripción posterior. Huella de ese bloque `55c3bc…`.

En el quinto cambian **14 descripciones**. La huella previa excluye únicamente
esos campos y protege las otras 18 actividades, las pistas completas, objetivos,
teoría, 433 ejemplos, soluciones, código, recursos y manifiestos. Las pruebas
`tests/python-nested-copy.test.ts` fijan inventario, conceptos y límites textuales;
`tests/python-nested-copy-baseline.ts` reconstruye íntegra la entrega `55c3bc…`
y se encadena a las anteriores sin sustituir sus expectativas. Huella vigente
`e7cc7b…`, sin preparar ni activar la base.

Las pruebas de texto no acreditan calidad pedagógica completa, revisión visual,
accesibilidad, ejecución real en Piston ni rendimiento. El resto del inventario,
el vocabulario contextual y las fases D2/F siguen abiertos. No se elimina el plan.
