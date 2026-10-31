# Claridad editorial de Python

La auditoría de contratos de las 224 actividades se registra en
[auditoria-python.md](auditoria-python.md). Esta revisión editorial es posterior
y no se da por terminada por haber aprobado las pruebas de referencias.

## Criterios

- Separar **Tu tarea**, **Entrada** y **Resultado esperado**. Los requisitos
  imprescindibles y excepciones quedan en esos bloques, no escondidos en pistas.
- Usar lista, diccionario y clave cuando se describe una estructura de Python.
  Una ficha o un artículo es un dato del dominio representado por un diccionario;
  «objeto» sigue siendo válido al explicar identidad o elementos físicos.
- Escribir `None`, `True` y `False` al pedir valores Python. Explicar su
  representación `null`, `true` y `false` en JSON. PROGRAM conserva siempre el
  texto exacto de salida que exija su contrato, incluidas minúsculas.
- Mantener las técnicas como objetivos de práctica sin prometer que las salidas
  certifican el método. La receta progresiva pertenece a pistas y explicación de
  la referencia; no repetirla completa antes de que el alumno resuelva el reto.
- No cambiar identificadores, modalidades, recursos, casos ni ejemplos como
  efecto lateral de corregir vocabulario. No aplicar sustituciones globales sobre
  textos con fragmentos de código o JSON.

## Primer lote: 24 enunciados de datos, listas y recorridos

`prisma/python-editorial.ts` contiene revisiones explícitas, solo para Python,
aplicadas después de las adaptaciones de contrato de `python-content.ts`. Las
24 prácticas usan las tres secciones. Se retiran recetas duplicadas del reto,
conservando pistas y explicación de solución; tres juegos de pistas corrigen
«propiedades» o un `null` pedido como si fuera código Python. Cantidad opcional
corrige también objetivo y restricciones para hablar de claves.

Los ejemplos públicos siguen junto al enunciado, con sus explicaciones ya
existentes: no se duplican en otro bloque. Se conservan exactamente plantillas,
referencias, contratos, casos, artefactos, ejemplos y sus ayudas, orden, nivel,
duración y modalidad. `tests/python-editorial.test.ts` comprueba estructura,
vocabulario, excepciones relevantes y una huella previa de la evaluación de las
224 actividades; complementa, no sustituye, las pruebas ejecutables por actividad.

| Actividad | Revisión editorial |
| --- | --- |
| `logica-mayor-tres` | Diccionario y claves explícitas, con repetidos y negativos. |
| `logica-filtra-lista` | Lista nueva, límite incluido y orden/repeticiones conservados. |
| `logica-busqueda-lineal` | Diccionario de entrada y primera coincidencia desde índice cero. |
| `logica-ficha-resultado` | Ficha definida como diccionario; claves en vez de propiedades. |
| `logica-opcional` | Clave ausente distinta de cero y de None; restricciones y pistas coherentes. |
| `logica-auxiliares` | Regla de envío completa sin recetar la distribución entre auxiliares. |
| `logica-mediciones` | Diccionario de salida, vacío y None/JSON, sin receta de acumuladores. |
| `logica-carrito` | Diccionario exterior y artículos como diccionarios; descuento sobre el subtotal. |
| `logica-notas` | None en reto y pista, promedio sin truncar y aprobación inclusiva. |
| `logica-ordena-insercion` | Técnica como objetivo, sin describir todos los desplazamientos en el reto. |
| `logica-combina` | Dos listas, repetidos y vacíos; explicación de índices reservada a ayudas. |
| `logica-palindromo` | True/False Python frente a JSON, comparación literal y vacío. |
| `logica-pareja` | Índices, repetidos y desempate completos, sin receta de movimientos. |
| `logica-prefijos` | Definición de prefijo vacío y posición i como primeros i elementos. |
| `logica-ventana-fija` | Ventana definida como tramo, sin adelantar fórmula de actualización. |
| `logica-ventana-suma` | Positivos, objetivo inclusivo, lista vacía y longitud en vez de suma. |
| `logica-filas` | Matriz como lista de listas, filas irregulares y vacías conservadas. |
| `logica-diagonales` | Diccionario de diagonales y direcciones descritas sin fórmulas de índices. |
| `logica-pila` | Operaciones como listas Python y semántica LIFO, no implementación con pop. |
| `logica-cola` | Operaciones como listas Python y semántica FIFO, no implementación con pop(0). |
| `logica-suma-recursiva` | Recursión como objetivo y caso vacío, sin escribir la ecuación de solución. |
| `logica-une-intervalos` | Listas, contacto inclusivo y entrada desordenada. |
| `logica-segundo-maximo` | Valor distinto y ausencia como None, representada por null en JSON. |
| `logica-suma-maxima` | Tramo no vacío y consecutivo; conserva el caso completamente negativo. |

## Segundo lote: 24 enunciados avanzados

Las primeras 24 actividades avanzadas usan ahora la misma estructura. Se
definen los árboles y tareas mediante diccionarios, las colecciones mediante
listas y la ausencia mediante None, explicando null en JSON. Se separa la regla
del problema de su implementación: altura como longitud del camino más largo,
subsecuencia como selección que conserva orden y mochila como selección 0/1,
sin adelantar sus transiciones ni fórmulas de actualización.

Se conservan deliberadamente los pasos que **definen una salida única**:
reparación y empate del montículo, orden de duplicación de subconjuntos y orden
lexicográfico numérico. No son recetas eliminables mientras el contrato exija
esa representación exacta. Las técnicas recomendadas de mezcla, potencia,
memorización y selección de candidatos siguen como objetivos; no se certifican
por comparar JSON. No cambian pistas, explicaciones, límites, casos ni minutos.

Las pruebas verifican esas reglas y que el lote avanzado coincide exactamente
con las primeras 24 identidades del nivel. La huella de evaluación previa al
primer lote sigue siendo idéntica para las 224 actividades. El componente de
presentación y los ejemplos públicos permanecen sin cambios.

| Actividad | Revisión editorial |
| --- | --- |
| `logica-cuenta-nodos` | Diccionario de nodo, None/JSON y cuenta por nodo, no por valor distinto. |
| `logica-altura` | Altura como nodos del camino más largo, sin recetar la combinación recursiva. |
| `logica-preorden` | Modelo Python y orden completo raíz/izquierda/derecha, incluidos repetidos. |
| `logica-niveles` | Orden de niveles e izquierda/derecha, sin convertir la cola en requisito certificado. |
| `logica-arbol-busqueda` | True/False, límites de todos los antecesores y ausencia válida. |
| `logica-ancestro` | Diccionario exterior, objetivos existentes/iguales y árbol no necesariamente de búsqueda. |
| `logica-monticulo-inserta` | Padre, ascenso estricto y representación concreta preservados. |
| `logica-monticulo-extrae` | Diccionario de salida, mínimo ausente y empate izquierdo preservados. |
| `logica-prioridad` | Tareas como diccionarios, comparación numérica y desempate por id. |
| `logica-k-mayores` | Colecciones y k explícitos; repeticiones, cero y longitud completa. |
| `logica-actividades` | Intervalos y contacto compatibles, sin revelar elección por hora de fin en el reto. |
| `logica-combina-archivos` | Tamaños abstractos diferenciados de archivos reales; coste y reinserción del resultado. |
| `logica-potencia` | Diccionario y límites preservados, incluido 0 elevado a 0. |
| `logica-mezcla` | Objetivo de divide y vencerás sin receta completa ni promesa sobre cualquier solución. |
| `logica-subconjuntos` | Orden de generación conservado como parte de la salida evaluada. |
| `logica-permutaciones` | Límite seis, comparación numérica y vacío, sin anticipar backtracking. |
| `logica-combinaciones` | Entrada desordenada, uso único, orden numérico y objetivo cero. |
| `logica-reinas` | Escalar n, cantidad en vez de tableros y simetrías como soluciones diferentes. |
| `logica-fibonacci` | Secuencia definida y memoria como objetivo, sin repetir la receta del diccionario. |
| `logica-escalera` | Secuencias de pasos y caso cero sin adelantar la transición de la tabla. |
| `logica-caminos-obstaculos` | Lista de listas, movimientos restringidos, esquinas y una celda libre. |
| `logica-monedas` | Diccionario, disponibilidad ilimitada, mínimo y bases sin confundir combinaciones. |
| `logica-mochila` | Objetos del dominio frente a diccionario de entrada; uso único y pesos cero. |
| `logica-subsecuencia-comun` | Definición de subsecuencia, longitud, repeticiones y vacíos, sin recetar DP. |

## Tercer lote: doce enunciados de grafos y optimización

Completa la estructura editorial de las 36 prácticas avanzadas. Las recetas de
recorrido, búsqueda y actualización permanecen en las ayudas; el reto define
datos, resultado y reglas observables. Se mantienen los nombres de claves,
incluido `dependencies`, sin traducir contratos. No cambian evaluación,
ejemplos, ayudas, límites, tiempos ni orden; la huella de evaluación de las 224
actividades sigue siendo la anterior al primer lote.

| Actividad | Revisión editorial |
| --- | --- |
| `logica-adyacencia` | Diccionario, hasta 4000 aristas, ambos sentidos y vecinos únicos ordenados. |
| `logica-alcanzables` | Inicio incluido, ciclos y resultado numérico único sin certificar DFS. |
| `logica-distancias` | Posiciones por nodo, mínimo de aristas y -1, sin exigir una cola como garantía. |
| `logica-ciclo-dirigido` | True/False frente a JSON, lazos y componentes desconectadas. |
| `logica-dependencias` | Menor disponible en cada paso, incluidas recién liberadas; no devolver un orden parcial. |
| `logica-dijkstra` | Suma de pesos positivos, ambos sentidos y destino cero; no certificar montículo. |
| `logica-islas` | Lista de listas, conectividad ortogonal, filas vacías y conservación de entrada. |
| `logica-laberinto` | Cuatro direcciones, esquinas bloqueadas y distancia inicial cero. |
| `logica-capacidad` | Paquetes indivisibles en orden, capacidad diaria y como máximo los días disponibles. |
| `logica-edicion` | Diccionario ASCII, coste unitario por operación y ausencia de transposición directa. |
| `logica-subsecuencia-creciente` | Orden original, crecimiento estricto, longitud y vacío. |
| `logica-planifica-tareas` | Paralelismo ilimitado, espera de todos los requisitos y ciclos incluso con duración cero. |

Las pruebas editoriales cubren esas reglas y la presencia de las 36 avanzadas.
Las pruebas ejecutables fijas de la auditoría de grafos siguen comprobando sus
referencias y límites locales; no equivalen a ejecutar Piston real.

## Cuarto lote: 24 enunciados de fundamentos

Diez prácticas de iniciación y catorce de principiante separan tarea, entrada y
resultado. Se conservan las instrucciones de reparación o completado: no se
convierten en retos libres que ignoren la plantilla. También se mantienen los
objetivos de predicción y seguimiento, sin afirmar que el retorno certifique
ese trabajo previo. La introducción conceptual de expresión condicional,
break y continue permanece junto a la tarea; las recetas concretas siguen en
las pistas y explicaciones originales.

No cambian plantillas, soluciones, casos, ejemplos, ayudas, minutos ni orden.
La misma huella de evaluación de las 224 actividades sigue aprobando. Las
pruebas editoriales añaden comprobaciones de formatos, cero, límites de edad,
centinela y conservación de las indicaciones de corrección.

| Actividad | Revisión editorial |
| --- | --- |
| `logica-retorno` | Dato proporcionado por la aplicación y retorno frente a print. |
| `logica-parametro` | Corrección del retorno y doble de negativos y cero. |
| `logica-dos-parametros` | Claves, límites y nombres primero/segundo conservados. |
| `logica-imprimir-devolver` | Mantiene el diagnóstico de impresión frente a retorno, sin inventar límites. |
| `logica-predice-valores` | Predicción previa y orden de actualizaciones, sin certificar la predicción. |
| `logica-tabla-valores` | Tres estados, variables y separador exacto con espacios. |
| `logica-minutos-segundos` | Unidades de entrada y entero de salida diferenciados. |
| `logica-perimetro` | Accesos a medidas y perímetro frente a área. |
| `logica-repara-presupuesto` | Reparación del envío único, incluso sin unidades. |
| `logica-merienda` | Mensaje Total: con espacio, sin comillas ni salto de línea. |
| `logica-elige-mensaje` | Corrección localizada y etiquetas exactas, incluido cero. |
| `logica-signo` | Último caso de la plantilla y tres textos exactos. |
| `logica-dos-requisitos` | Comparaciones preparadas, conjunción y cero como múltiplo. |
| `logica-alternativas` | Bloqueo prioritario, alternativas y booleanos frente a textos. |
| `logica-tarifa` | Fronteras de 6 y 18 años y tarifas enteras. |
| `python-condicional` | Conserva la introducción a la expresión sin adelantar la solución de edad. |
| `logica-uno-n` | Corrección del elemento añadido y cero como lista vacía. |
| `logica-cuenta-atras` | Extremo cero incluido y salida [0] para entrada cero. |
| `logica-suma-uno-n` | Completar acumulador manteniendo el recorrido. |
| `logica-tabla` | Diez productos en orden, incluidos negativos y cero. |
| `logica-multiplos` | Diccionario y cantidad en vez de lista; intervalo excluye cero. |
| `logica-bucle-roto` | Reparación del avance, sin quitarlo ni saltarse valores. |
| `python-centinela` | Concepto de break, prefijo sin centinela y entrada conservada. |
| `python-omite-negativos` | Concepto de continue, valores posteriores, ceros y repeticiones. |

## Quinto lote: 24 enunciados de listas, textos y auxiliares

Otras 24 prácticas de principiante separan tarea, entrada y resultado. Las
introducciones a sorted/sort, cortes, split/join, desempaquetado, enumerate,
zip y retorno múltiple permanecen como contexto conceptual. Se conservan las
instrucciones de completar o reparar plantillas; las recetas de implementación
siguen disponibles en las pistas y explicaciones, sin convertir la técnica en
una garantía de la comparación de resultados.

La huella de evaluación de las 224 actividades permanece idéntica a la previa
al primer lote: no cambian referencias, plantillas, casos ni ejemplos. Tampoco
se cambian ayudas, límites, minutos ni orden. Las pruebas editoriales cubren
las 24 identidades, formatos, índices, vacíos, ausencia y alcance de auxiliares.

| Actividad | Revisión editorial |
| --- | --- |
| `logica-posicion` | Diccionario exterior, índice válido desde cero y valor frente a posición. |
| `logica-indices` | Reparación del acceso actual, copia, repeticiones y vacío. |
| `logica-suma-lista` | Completar acumulación, límites y suma frente a cantidad. |
| `logica-maximo` | Reparación de comparación y máximo negativo o repetido. |
| `logica-cuenta-condicion` | Conteo estricto, cero excluido y vacío. |
| `logica-longitud-texto` | ASCII, espacios/signos y longitud cero. |
| `logica-minusculas` | Completar conversión conservando números, signos y espacios. |
| `logica-vocales` | Recorrido incompleto, mayúsculas/minúsculas y vocales admitidas. |
| `logica-invierte` | Reparación de construcción sin perder espacios, signos ni mayúsculas. |
| `logica-elimina-caracter` | Diccionario, carácter único, eliminación de todas las apariciones y caso sensible. |
| `logica-palabras` | Grupos de letras, espacios repetidos y texto sin palabras. |
| `python-ordena-numeros` | sorted frente a sort, diccionario original/ordenados y entrada conservada. |
| `python-recorta` | Concepto de corte, fin excluido, límites iguales y lista nueva. |
| `python-une-palabras` | Espacios en blanco, split frente a split(' '), unión y texto vacío. |
| `python-desempaqueta` | Dos enteros, intercambio, entrada conservada y tupla representada en JSON. |
| `python-enumera` | Numeración desde uno, apariciones repetidas y parejas de salida. |
| `python-empareja` | Diccionario, listas desiguales, salida hasta la más corta sin relleno. |
| `python-retorno-multiple` | Auxiliar, tupla, orden suma/producto y representación JSON. |
| `logica-ficha-producto` | Ficha como diccionario y precio escalar, incluido cero. |
| `logica-ausencia` | None frente a null, ausencia explícita y cero válido. |
| `logica-variable-local` | Reparación del uso del parámetro frente al valor local fijo. |
| `logica-parametro-exterior` | Auxiliar doble, parámetro, exterior conservado y orden de resultados. |
| `logica-llamadas-independientes` | Contador propio por llamada, límites no negativos y cero incrementos. |
| `logica-sin-estado-global` | Base fija como argumento, tasas independientes y lista vacía. |

## Sexto lote: 24 enunciados de estado, validación y pruebas

Otras 24 prácticas de principiante separan tarea, entrada y resultado. Los
ejercicios de alias conservan sus mutaciones intencionales; los de copia y
conservación mantienen sus requisitos sin prometer que comparar contenidos
demuestre identidad o ausencia de cualquier mutación intermedia. Las técnicas
de funciones, excepciones y aserciones siguen como objetivos de práctica, con
sus límites de certificación explícitos. Se mantienen introducciones a is,
valores predeterminados, diccionarios y recorrido de registros.

La huella de evaluación de las 224 actividades continúa intacta: no cambian
plantillas, referencias, casos ni ejemplos. Tampoco cambian ayudas, minutos,
orden o límites. Donde el enunciado anterior no fijaba un límite numérico, no
se inventa uno. Las pruebas editoriales comprueban las 24 identidades, mensajes,
formatos de conversión, estado compartido y límites de las garantías.

| Actividad | Revisión editorial |
| --- | --- |
| `logica-encadena-retornos` | Diccionario, dos auxiliares y producto seguido de embalaje fijo. |
| `logica-dos-nombres-lista` | Alias sin copia y mutación intencional, incluso en vacío. |
| `logica-reasigna-o-muta` | Reasignación a lista nueva y diccionario original/alias. |
| `logica-copia-plana` | list(valores), copia independiente y original conservado. |
| `logica-conserva-entrada` | Original/ajustados, orden y límite de observación de mutaciones. |
| `logica-registro-compartido` | Diccionario anidado, cambio intencional y dos consultas actualizadas. |
| `python-identidad` | Campos exactos, is frente a ==, instantánea anterior y entrada intacta. |
| `python-opcional-seguro` | Firma base=None, riesgo del valor mutable y llamadas independientes. |
| `python-actualiza-diccionario` | Copia plana, inserción/reemplazo y demás parejas conservadas. |
| `python-borra-clave` | Clave opcional, pop con respaldo y cero como valor válido. |
| `python-recorre-pares` | items/keys/values, orden por clave y formato exacto con espacio. |
| `python-lista-registros` | Consulta de cantidad, acumulación y repeticiones que también cuentan. |
| `logica-valida-divisor` | Divisor cero frente a total cero y None frente a JSON. |
| `logica-valido-cero-ausente` | Clave presente, tres etiquetas exactas y cero válido. |
| `logica-localiza-error` | Comprobación previa, mensaje exacto e índices negativos rechazados. |
| `logica-captura-conversion` | Gramática completa, int sin float y captura exclusiva de ValueError. |
| `logica-error-dominio` | Auxiliar validar, mensaje de dominio y aceptación de cero. |
| `logica-recupera-elementos` | Conversión por elemento, orden, conteo y continuación tras fallos. |
| `logica-asercion-normal` | Caso conocido 4 → 12 y retorno del triple, sin certificar la aserción. |
| `logica-pruebas-limites` | Casos [], [-4], [-8, -2], reparación y máximo ausente. |
| `logica-reproduce-fallo` | Reproducción mínima y explicación solicitada, sin anticipar su diagnóstico. |
| `logica-conserva-regresion` | Implementación no defectuosa, igualdad y descuento sin negativos. |
| `logica-factorial` | Completar recorrido, acumulador inicial y factorial de cero. |
| `logica-fizzbuzz` | Completar decisión, prioridad del caso doble y números frente a textos. |

## Séptimo lote: 24 enunciados de conjuntos y recorridos

Una práctica de principiante y 23 intermedias separan tarea, entrada y
resultado. Se conservan las introducciones a conjuntos, comprensiones,
iteradores, generadores, map/filter y claves de ordenación. Se distingue
pertenencia de cantidad, primera aparición de orden numérico y filtro de
transformación que conserva posiciones. No se certifican técnicas internas ni
consumo de memoria por comparar la salida.

La evaluación y los ejemplos de las 224 actividades conservan su huella. No
cambian plantillas, soluciones, ayudas, límites, minutos ni orden. Las pruebas
editoriales cubren las 24 identidades, operaciones de conjuntos, cantidades,
vacíos, estabilidad y consumo del mismo iterador.

| Actividad | Revisión editorial |
| --- | --- |
| `logica-saldo` | Diccionario, rechazo sin aplicar, continuación y saldo cero válido. |
| `python-conjunto-seguro` | add antes de discard, valor ausente y operaciones coincidentes. |
| `python-union` | Al menos una entrada, elementos únicos y orden numérico. |
| `python-interseccion` | Ambas entradas, sin multiplicidad y vacío. |
| `python-diferencia` | Requeridos menos disponibles, faltantes frente a sobrantes. |
| `python-simetrica` | Exclusivos de ambos lados y exclusión de compartidos. |
| `python-subconjunto` | Igualdad incluida, sin cantidades y requisitos vacíos verdaderos. |
| `logica-repetido` | Booleano Python frente a JSON y lista vacía sin repetidos. |
| `logica-deduplica` | Completar plantilla, primera aparición y prohibición de ordenar. |
| `logica-frecuencias` | Completar contadores, solo letras presentes y orden irrelevante de claves. |
| `logica-primer-unico` | Unicidad global, posición frente a alfabeto y None. |
| `logica-anagramas` | Completar tablas, multiplicidad, mayúsculas y espacios normales. |
| `python-crea-grupo` | Copiar listas anidadas, categoría opcional y nombres repetidos. |
| `logica-agrupa-registros` | Categorías presentes, nombres en orden y registros repetidos. |
| `python-comprension` | Un cuadrado por posición y entrada conservada. |
| `python-comprension-filtro` | Vocales en minúscula, orden y repeticiones. |
| `python-comprension-condicional` | Transformación frente a filtro, sin perder posiciones. |
| `python-comprension-dict` | Diccionario palabra/longitud y claves repetidas. |
| `python-iterador` | Único iterador consumible, segunda materialización vacía y entrada conservada. |
| `python-generador` | Cuadrados bajo demanda, suma vacía y límite de la garantía de memoria. |
| `python-map` | Textos válidos convertidos y duplicados numéricamente; función sin llamarla. |
| `python-filter` | Registros no transformados al filtrar, adultos desde 18 y continuación. |
| `python-agrega` | Total cero y extremos ausentes frente a cero como dato válido. |
| `python-clave-longitud` | Clave len y estabilidad sin desempate alfabético. |

## Octavo lote: 24 enunciados de registros, búsquedas y matrices

Otras 24 prácticas intermedias separan tarea, entrada y resultado. Se conservan
introducciones a claves compuestas, formato de float, copias, get/setdefault,
normalización y transformaciones. Cada operación de academia y contactos
describe su propio modelo, sin depender de haber leído otro reto. Se distingue
la conversión int nativa de la gramática restringida de captura-conversion.

La evaluación y los ejemplos de las 224 actividades mantienen su huella. No
cambian ayudas, referencias, plantillas, casos, límites, minutos ni orden. Las
pruebas editoriales verifican las 24 identidades, claves, desempates, valores
ausentes frente a cero, consultas válidas y conservación de matrices.

| Actividad | Revisión editorial |
| --- | --- |
| `python-lambda-desempate` | Longitud descendente y alfabético ascendente sin invertir ambos criterios. |
| `python-formato-decimal` | Precisión, ceros finales, salida textual y redondeo float no financiero. |
| `python-consulta-anidada` | Registro alumno/curso, ausencia en cada nivel y nota cero válida. |
| `logica-inventario` | Saldos por producto, ceros conservados y negativos permitidos. |
| `python-inventario-valora` | Fichas como diccionarios, céntimos enteros, campos exactos y desempate. |
| `python-academia-inscribe` | Inscripción ausente con None y nota previa preservada. |
| `python-academia-califica` | Existencia previa, rango inclusivo y prohibición de inscribir automáticamente. |
| `python-academia-resume` | Medias sin None, cero incluido y clasificación de nombres con promedio. |
| `python-contactos-crea` | Normalización, nombres vacíos/duplicados y teléfonos textuales. |
| `python-contactos-edita` | Solo campos permitidos de texto, incluido vacío; None ignorado. |
| `python-contactos-borra` | Nombre completo normalizado y eliminación ausente sin error. |
| `python-contactos-busca` | Todos los filtros, coincidencia parcial y campo ausente distinto de vacío. |
| `python-transforma-campo` | Copia de textos inmutables y clave ausente no creada. |
| `python-transforma-registros` | Reglas exactas, copias en orden y ValueError numérico por campo. |
| `logica-busqueda-binaria` | Completar plantilla, índices originales y -1, sin ordenar ni cortar. |
| `logica-insercion-posicion` | Primera posición mayor o igual, duplicados, extremo final y vacío. |
| `logica-ordena-registros` | Dos criterios y estabilidad cuando ambos coinciden. |
| `logica-intervalos-suma` | Ambos extremos incluidos, consulta unitaria y vacíos coherentes. |
| `logica-celda` | Diccionario exterior, lista de listas e índices desde cero. |
| `logica-columnas` | Rectangularidad, filas no vacías y columnas frente a filas. |
| `logica-transpuesta` | Dimensiones intercambiadas y correspondencia de posiciones. |
| `logica-vecinos` | Cuatro direcciones, sin diagonal, propia celda ni vecinos exteriores. |
| `logica-copia-anidada` | Copia de cada fila, cambio único y límite de garantías de identidad. |
| `logica-delimitadores` | Booleanos Python, anidamiento, tipos y texto vacío equilibrado. |

## Pendientes y límites

- Los ocho lotes cubren **180/224 enunciados**, no el cierre editorial del recorrido.
- Quedan los demás enunciados, teoría local y de módulos, vocabulario en otras
  ayudas y objetivos, revisión de ejemplos ya explicados, tiempos y textos de rutas.
- PROGRAM no se normaliza como FUNCTION. Los proyectos conservan sus contratos
  de archivos y persistencia; su repetición editorial se revisa por separado.
- No modifica el componente de presentación ni acredita revisión visual o
  accesibilidad. La jerarquía visual, teoría desplegable y ergonomía siguen en F.
- Las revisiones están en fuentes, no preparadas ni activadas en la base. La
  validación real y publicación requieren el entorno autorizado y su respaldo.
