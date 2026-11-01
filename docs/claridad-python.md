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

## Noveno lote: cuatro funciones y 22 programas completos

Se completa la estructura de las **206 prácticas sin proyecto**: 184 FUNCTION
y 22 PROGRAM. Los programas distinguen ausencia de entrada de lectura por
entrada estándar y piden impresión, no retorno desde solve(data). Conservan
textos exactos, líneas terminadas, mayúsculas, espacios y representaciones
numéricas. true/false siguen en minúsculas donde son el texto de salida exigido,
sin confundirlos con los booleanos True/False del código Python.

Se mantienen instrucciones de construcción y reparación, variable auxiliar,
constante y conversión float como objetivos de práctica. Las últimas funciones
aclaran historial, índices originales, contigüidad y desempate numérico. No se
cambian soluciones, plantillas, casos, ejemplos, ayudas, límites, minutos ni
orden; la huella de evaluación de las 224 actividades sigue siendo idéntica.

| Actividad | Revisión editorial |
| --- | --- |
| `logica-saludo` | Programa sin entrada y saludo con puntuación exacta. |
| `logica-dos-lineas` | Primera/Segunda en líneas terminadas separadas. |
| `logica-orden-mensaje` | Reorganización de plantilla y orden Preparar/Mezclar/Servir. |
| `logica-texto-calculo` | Expresión numérica frente a texto y espacios del signo +. |
| `logica-guarda-nombre` | Uso de variable para mostrar Ada, no su nombre. |
| `logica-guarda-cantidad` | Reparación de impresión, asignación conservada. |
| `logica-actualiza-puntos` | Actualización sobre valor actual en vez de reemplazo o resultado fijo. |
| `logica-intercambia` | Variable auxiliar y orden de las dos líneas. |
| `logica-suma-cantidades` | Variables numéricas y suma, salida escalar. |
| `logica-cambio` | Variables de precio/pago y resta. |
| `logica-precio-unidades` | Variables de precio/unidades y multiplicación. |
| `logica-parentesis` | Reparación de precedencia y dos alternativas de agrupación. |
| `python-constante` | Convención de mayúsculas y límite de certificación de la constante. |
| `logica-lee-nombre` | Entrada de una línea, nombre preparado y saludo con espacio. |
| `logica-lee-doble` | Lectura/conversión preparadas y doble numérico, no texto repetido. |
| `logica-lee-suma` | Dos líneas, conversión y suma frente a concatenación. |
| `logica-mensaje-resultado` | Prefijo Destino: y ciudad con espacios interiores conservados. |
| `python-decimal` | float, incremento 0.5 y representación habitual de print, incluido .0. |
| `logica-numero-texto` | Construcción de dos expresiones y salida 6/42. |
| `logica-booleano` | True como dato y true como texto exacto de impresión preparada. |
| `logica-igualdad` | Comparación, formato preparado y true/false sin traducir. |
| `logica-alcanza` | Frontera inclusiva de 10 y salida textual en minúsculas. |
| `logica-deshacer` | Diccionario con operaciones, restauración que consume historial y vacío. |
| `logica-busqueda-recursiva` | Índice original, -1 y recursión como objetivo no certificado. |
| `logica-sin-repeticiones` | Subcadena contigua, longitud y caracteres ASCII. |
| `logica-ranking` | Valores únicos, frecuencia descendente y desempate numérico con negativos. |

Las pruebas exigen las 206 identidades sin proyecto, distinguen ambas
modalidades y comprueban que todos los programas pidan impresión y describan
su entrada. La huella de evaluación conserva íntegros los textos esperados de
PROGRAM; estas comprobaciones locales no equivalen a Piston real.

## Décimo lote: los 18 proyectos

Los **224 enunciados** tienen Tu tarea, Entrada y Resultado esperado. El lote de
proyectos elimina párrafos repetidos dentro de cada reto y condiciones ajenas
al ejercicio (por ejemplo, orden de claves de tareas en una lista de enteros).
Un bloque común conserva el punto de entrada, archivos editables/protegidos y
aislamiento; los requisitos de artefactos y de segunda llamada se incluyen solo
cuando el proyecto realmente los declara. Cada reto conserva su contrato y sus
responsabilidades de módulos, sin convertirlo en una función de un solo archivo.

Los 18 manifiestos, recursos, soluciones privadas, plantillas, pruebas propias,
casos, artefactos esperados y respuestas de persistencia no cambian. La huella de
evaluación de las 224 actividades sigue siendo la anterior al primer lote. Las
pruebas editoriales verifican los archivos evaluados a partir de su contrato y
exigen la explicación de persistencia solo en los tres proyectos que la activan.
La comprobación local de referencias usa código fijo del repositorio y no
certifica Piston real ni aislamiento operativo.

| Actividad | Revisión editorial |
| --- | --- |
| `logica-gastos-registro` | Fichas como diccionarios, céntimos, categorías presentes y vacío. |
| `logica-gastos-validacion` | Rechazos sin interrupción, cero válido y pruebas propias sin progreso. |
| `logica-importa-preparado` | Reglas protegidas, importación y uso sin copiar implementación. |
| `logica-extrae-modulo` | Dos archivos editables, nombre y firma de cuadrado conservados. |
| `logica-separa-reglas-io` | Regla sin E/S y texto Total: a cargo del adaptador. |
| `logica-repara-importacion` | Nombre incorrecto conceptual, recurso protegido y cuadrado más uno. |
| `logica-organiza-modulos` | Tres responsabilidades, etiqueta y ausencia de imports circulares. |
| `logica-lee-archivo` | Archivo real protegido, índice -1 y retorno sin salto. |
| `logica-escribe-archivo` | Recurso Hola, sufijo y artefacto UTF-8 exacto verificado además del retorno. |
| `logica-valida-json` | JSON sintácticamente válido frente a estructura, bool excluido y nombres de recursos. |
| `logica-guarda-recupera` | JSON compacto y reapertura en el mismo proceso sin prometer persistencia entre procesos. |
| `logica-recupera-archivo-invalido` | Archivo ausente frente a análisis inválido y captura solo de fallos esperados. |
| `logica-actualiza-persistidos` | Historial conservado, instantánea nueva y límite de durabilidad/atomicidad. |
| `logica-inventario-modular` | Mutación intencional, stock no negativo y producto cero conservado. |
| `logica-inventario-persistente` | Preferencia de guardado, stock inicial, rechazos por llamada y segundo proceso. |
| `logica-agenda-operaciones` | Diccionario de tarea, booleanos Python y acciones sin almacenamiento. |
| `logica-agenda-almacenamiento` | Reglas completas, recurso leer, orden de claves y recuperación en segundo proceso. |
| `logica-agenda-regresion` | Conexión sin reiniciar estado, pruebas de reapertura y completar dos veces. |

La estructura de enunciados está completa, no la fase E: todavía se revisan
vocabulario de ayudas y objetivos, ejemplos anteriores, repeticiones entre
superficies, tiempos y textos de rutas/módulos. La base continúa sin preparar ni
activar las revisiones.

## Vocabulario de metadatos y ayudas: 22 revisiones

`prisma/python-vocabulary.ts` proyecta revisiones explícitas sobre descripción,
objetivo, restricciones, pistas, errores comunes y objetivos de práctica. No
realiza sustituciones en código, enunciados, ejemplos ni salidas PROGRAM. Se
aplica únicamente al catálogo Python, después de la revisión de enunciados.

| Actividad | Campos y decisión |
| --- | --- |
| `logica-booleano` | Descripción: True en Python y true como texto exacto exigido, sin mezclar explicaciones de otros lenguajes. |
| `logica-dos-parametros` | Objetivo: claves de diccionario en lugar de propiedades. |
| `logica-perimetro` | Descripción: diccionario y perímetro explícitos. |
| `logica-mayor-tres` | Descripción: diccionario y mayor de tres. |
| `logica-alternativas` | Restricciones: claves y booleanos Python/JSON; objetivos: or y not. |
| `logica-indices` | Última pista: append, no alternativa push de otro lenguaje. |
| `logica-ficha-producto` | Pistas y objetivo: ficha como diccionario y consulta por clave. |
| `logica-ausencia` | Restricciones, errores y objetivos: None frente a JSON; no descartar cero ni adelantar terminología de uniones de tipos. |
| `logica-reasigna-o-muta` | Pista: reasignación del alias frente a append en la lista compartida. |
| `logica-valido-cero-ausente` | Descripción: None frente a null en JSON y cero válido. |
| `logica-mediciones` | Objetivo de práctica: diccionario de resumen con claves. |
| `logica-carrito` | Descripción: items como lista de diccionarios y límites conservados. |
| `logica-frecuencias` | Descripción: diccionario, sin alternar con objeto. |
| `logica-ordena-insercion` | Descripción: lista en vez de arreglo. |
| `logica-combina` | Descripción: dos listas y resultado ordenado. |
| `logica-prefijos` | Descripción: lista de sumas. |
| `logica-filas` | Descripción: lista de totales por fila. |
| `logica-suma-recursiva` | Descripción: lista y recursión. |
| `logica-une-intervalos` | Descripción: lista de intervalos. |
| `logica-suma-maxima` | Descripción: lista y tramo contiguo no vacío. |
| `logica-cuenta-nodos` | Descripción: árbol con diccionarios y None/null en JSON. |
| `logica-mezcla` | Descripción: lista en vez de arreglo. |

Las pruebas recorren esos seis campos en las 224 actividades: no admiten
arreglo/subarreglo, push ni propiedad como terminología heredada; toda mención
de null exige explicar None y JSON en el mismo texto. Se conserva «objeto» para
identidad Python, el objeto map y objetos físicos de mochila. Estas reglas
acotadas no certifican todo el vocabulario pedagógico ni revisan fragmentos de
teoría o explicaciones de solución.

Una huella previa conserva todos los campos ajenos al lote, incluidos los 224
enunciados, variantes completas, proyectos, ejemplos, niveles, tiempos y orden.
La revisión no activa contenido ni cambia las variantes de otros lenguajes.

## Explicaciones de solución: primer lote de diez

`pythonSolutionExplanations` en `prisma/python-vocabulary.ts` revisa únicamente
la prosa que acompaña a la solución consultada, no la referencia ejecutable ni
las explicaciones de ejemplos. Sustituye terminología heredada y consejos
genéricos por el razonamiento del código real y sus casos frontera.

| Actividad | Decisión |
| --- | --- |
| `logica-dos-parametros` | Accesos a claves, suma numérica y operación constante. |
| `python-desempaqueta` | Evaluación previa del lado derecho, tupla devuelta y lista en JSON. |
| `logica-ficha-resultado` | Ficha como diccionario, significado de claves y comparación sin orden. |
| `python-recorre-pares` | Orden por clave, desempaquetado, str y formato exacto; vacío. |
| `logica-notas` | División solo con notas, None/null y media válida igual a cero. |
| `python-contactos-edita` | Copia de cada ficha, normalización y aceptación del texto vacío sin añadir claves desconocidas. |
| `logica-prefijos` | Invariante del total acumulado, n + 1 valores y lista vacía. |
| `logica-copia-anidada` | Filas independientes para celdas enteras; no prometer copia universal ni certificar identidad. |
| `logica-suma-maxima` | Tramo no vacío, todos negativos y memoria real de data[1:]: O(n), no O(1). |
| `logica-cuenta-nodos` | None antes del acceso, nodos repetidos contados y espacio proporcional a altura. |

La huella nueva se calculó antes de editar y excluye solo las diez explicaciones
enumeradas: protege todo el resto del catálogo, incluidas las otras 214
explicaciones, ejemplos, código, enunciados, ayudas, metadatos y contratos.
Las huellas anteriores de evaluación y vocabulario se recalcularon sobre el
catálogo previo excluyendo la prosa de solución; sus valores originales quedan
documentados en las pruebas. Esta separación permite revisar explicaciones sin
atribuirlas a cambios de evaluación ni perder la protección del resto de campos.

Este lote no constituye una revisión completa de las 224 explicaciones ni de
los 433 ejemplos. Quedan especialmente las repeticiones y condiciones ajenas en
explicaciones de proyectos, además de teoría local y de módulos.

## Explicaciones de solución: los 18 proyectos

El segundo lote de `pythonSolutionExplanations` sustituye la explicación de cada
proyecto por una lectura de sus archivos reales. El total asciende a **28
explicaciones revisadas**. Se retiran los párrafos comunes de planificación,
instrucciones de arranque ya dadas en el enunciado y condiciones de otros retos.
No se anticipa esta explicación en pistas ni se cambia la solución ejecutable.

| Actividad | Decisión |
| --- | --- |
| `logica-gastos-registro` | Acumuladores, get y categoría con cero; no atribuirle un archivo de pruebas que no tiene. |
| `logica-gastos-validacion` | Validar antes de sumar, continue y alcance de las tres aserciones propias. |
| `logica-importa-preparado` | Importación de transformar desde el módulo protegido y llamada con data. |
| `logica-extrae-modulo` | Cuadrado en reglas y llamada desde main; coincidencia de nombres y firmas. |
| `logica-separa-reglas-io` | Cálculo más tres en reglas y formato Total: en main. |
| `logica-repara-importacion` | Nombre disponible cuadrado frente al fragmento conceptual defectuoso y suma de uno. |
| `logica-organiza-modulos` | Flujo main → cuadrado → etiqueta, sin dependencia circular. |
| `logica-lee-archivo` | read/splitlines, cierre e índice -1; sin receta de escritura ni de JSON. |
| `logica-escribe-archivo` | Leer, concatenar, escribir/cerrar y reabrir texto exacto; sin receta JSON. |
| `logica-valida-json` | Análisis frente a estructura, tipo int estricto para excluir bool y clave ausente frente a archivo ausente. |
| `logica-guarda-recupera` | Lista ordenada/repetida y JSON exacto en un solo proceso, sin instrucciones sobre claves de tareas o stock. |
| `logica-recupera-archivo-invalido` | Lectura real y captura específica de FileNotFoundError/JSONDecodeError. |
| `logica-actualiza-persistidos` | Historial conservado y nueva instantánea, sin garantizar durabilidad ni escritura atómica. |
| `logica-inventario-modular` | Mutación intencional, rechazo sin asignación, saldo cero y producto ausente. |
| `logica-inventario-persistente` | Cargar/aplicar/guardar/recargar, rechazos por llamada y pruebas propias distintas de la segunda invocación oficial. |
| `logica-agenda-operaciones` | Lista sin disco, creación y marcado sin crear una tarea al completar un título ausente. |
| `logica-agenda-almacenamiento` | Conservar leer y el estado final; orden de tareas y claves, sin instrucciones de stock. |
| `logica-agenda-regresion` | Conexión con cargar, completar dos veces y pruebas de integración en el mismo proceso, distintas de la invocación oficial nueva. |

Solo los tres proyectos con `verifyPersistence` comparten una nota de segunda
llamada; sus retornos se explican por separado para inventario y agenda. Las
instrucciones de JSON exacto se limitan a proyectos que lo guardan. Las pruebas
leen manifiestos y artefactos esperados y comprueban que cada explicación
identifique sus archivos, pruebas propias y modalidad de persistencia.

Una huella calculada antes de este lote excluye solo la prosa de los 18
proyectos: conserva las diez explicaciones anteriores y todos los demás campos.
La huella conjunta excluye las 28 explicaciones y protege el resto del catálogo;
se conserva documentada la del primer lote. No cambian manifiestos, recursos,
plantillas, soluciones, pruebas, ejemplos, ayudas, metadatos ni otras variantes.
La simulación local de proyectos ejecuta solo referencias fijas del repositorio;
no certifica Piston real ni aislamiento operativo.

La reducción de repetición de estas explicaciones está completa; sigue pendiente
la revisión entre teoría local, teoría de módulos, condiciones y otras ayudas,
así como el conjunto de ejemplos y explicaciones restantes.

## Revisión de tiempos

[tiempos-python.md](tiempos-python.md) registra la revisión de las 224 actividades:
54 ajustes y 170 estimaciones conservadas. El presupuesto contempla lectura,
resolución y comprobación; no se confunde con tiempo de CPU ni con aprendizaje
medido. `prisma/python-timing.ts` aplica solo los ajustes explícitos sobre Python,
con valores anteriores y motivos. Una huella protege todos los otros campos y
los tiempos conservados; JavaScript/TypeScript y el catálogo activo no cambian.
Se completa el punto de tiempos de E, no la revisión editorial global.

## Textos de rutas y módulos

[textos-rutas-python.md](textos-rutas-python.md) registra la revisión de cuatro
rutas y 57 módulos. Se conservan los títulos de rutas y se diferencian sus
descripciones por Python publicado; los módulos reciben una descripción propia
sin concatenar autoevaluaciones. Se corrigen nombres y alcance de frecuencias,
agrupación, archivos, contactos y prácticas frente a proyectos multarchivo.
Teoría, ejemplos y actividades conservan sus campos; el resto de E/F sigue
abierto, incluida la revisión visual de los textos nuevos.

## Teoría de módulos

[teoria-modulos-python.md](teoria-modulos-python.md) registra la revisión de las
57 teorías: 31 ajustes, 26 conservadas y ocho ejemplos sustituidos. Se retiran
referencias incidentales a otros lenguajes, se definen fichas como diccionarios
y se alinean None/JSON, árboles, secuencia, archivos y persistencia. Los 57
ejemplos se comprueban como código fijo local con expectativas independientes;
no equivalen a Piston. La teoría local y explicaciones de actividades y la
revisión editorial global siguen pendientes.

## Explicaciones de fundamentos propios y teoría local

Se contrastan las primeras **16 actividades exclusivas de Python** con sus
enunciados y código de referencia. `python-desempaqueta` conserva la explicación
del primer lote; las otras **15** reciben una revisión explícita en
`prisma/python-foundation-explanations.ts`. El total acumulado es de **43/224
explicaciones revisadas**, no 44: el desempaquetado no se cuenta dos veces.

La teoría local no tiene un campo persistido independiente: la introducción
conceptual está integrada en los enunciados editoriales. La composición original
de las actividades propias anteponía además `addition.theory` a la explicación
de solución. Este lote conserva los enunciados y sustituye esas explicaciones
completas por lecturas del código; no elimina la teoría de las fuentes ni aplica
reemplazos globales. Los conceptos necesarios siguen disponibles antes de
resolver. El inventario de teoría local de las 224 actividades sigue abierto.

| Actividad | Decisión |
| --- | --- |
| `python-constante` | Seguir la multiplicación y significado del seis; retirar la segunda analogía de IVA. La convención no queda certificada por la salida. |
| `python-decimal` | Conversión antes de suma, ejemplo negativo y representación habitual de print, sin formato fijo ni recuperación innecesaria. |
| `python-condicional` | Igualdad en 18, selección de un valor y equivalencia de resultados con if/else. |
| `python-centinela` | Comprobación antes de append, cero inicial/ausente y conservación de negativos anteriores. |
| `python-omite-negativos` | continue frente a break en un caso concreto; conservar cero, orden y repeticiones. |
| `python-ordena-numeros` | sorted frente al retorno None de sort; original referencia la entrada, no una copia independiente. |
| `python-recorta` | Seguir los tres accesos y un ejemplo con fin exclusivo, sin volver a copiar la definición del corte. |
| `python-une-palabras` | Seguir split y join con tabulación, vacío y conservación de mayúsculas/signos. |
| `python-desempaqueta` | Conservar la explicación previa de evaluación de la derecha, intercambio y tupla representada en JSON. |
| `python-enumera` | Parejas concretas con palabras repetidas y origen 1 frente al cero predeterminado. |
| `python-empareja` | Materialización de parejas, orden de origen y corte por la lista más corta sin relleno. |
| `python-retorno-multiple` | Una llamada y un retorno de tupla, desempaquetado y orden suma/producto. |
| `python-identidad` | Seguir alias, antes y copia; acotar list(...) a copia exterior superficial. No prometer independencia de contenedores interiores. |
| `python-opcional-seguro` | Dos llamadas con valores iguales; la lista predeterminada se compartiría entre llamadas a la auxiliar, no afirmar estado entre envíos. |
| `python-actualiza-diccionario` | Inserción/reemplazo, cero válido y copia superficial suficiente por valores enteros. |
| `python-borra-clave` | Retorno de pop ignorado, clave ausente, cero y diccionario vacío; devolver la copia, no el valor eliminado. |

`tests/python-foundation-explanations.test.ts` comprueba inventario, aplicación,
ausencia de la introducción teórica completa repetida y decisiones editoriales.
Una huella calculada antes de editar excluye solo las 15 explicaciones nuevas y
conserva los otros 209 textos y todos los campos ajenos: enunciados, variantes,
código, casos, explicaciones públicas, ayudas, minutos, proyectos y orden.
Las dos huellas anteriores amplían la exclusión de prosa con valores calculados
antes del lote; sus valores históricos quedan documentados. La nueva huella
de publicación se añade sin retirar las anteriores. La prueba histórica de tiempos
conserva su huella reconstruyendo solo las 15 explicaciones previas desde teoría
y explicación originales de las lecciones, sin editar esas fuentes. No se prepara ni activa el
contenido en la base de datos; las pruebas locales de referencias fijas no
acreditan Piston ni aislamiento.

Esta revisión reduce la repetición entre introducción y solución en estas 16
actividades; no cierra la revisión global de teoría, ejemplos, ayudas o E/F.

## Explicaciones de colecciones propias

Se contrastan las siguientes **16 actividades exclusivas de Python**, desde
`python-recorre-pares` hasta `python-map`. Recorrido de pares conserva su texto
del primer lote; las otras **15** reciben explicaciones individuales en
`prisma/python-collection-explanations.ts`. Van **58/224 explicaciones revisadas**,
incluidas las 32 primeras actividades propias, sin volver a contar las dos que
ya estaban cubiertas por el primer lote.

| Actividad | Decisión |
| --- | --- |
| `python-recorre-pares` | Conservar la lectura previa de items, orden por clave, conversión a texto y formato de salida. |
| `python-lista-registros` | Acumulador y return fuera del bucle; cada ficha aporta aunque se repitan nombres o registros. |
| `python-conjunto-seguro` | Construcción, add y discard en ese orden; agregar y quitar el mismo valor lo elimina aunque existiera inicialmente. |
| `python-union` | Eliminar duplicados dentro de cada entrada y entre ambas; ordenar después, sin seguir el orden de aparición. |
| `python-interseccion` | Pertenencia a ambas listas, no emparejamiento de apariciones ni acumulación de cantidades. |
| `python-diferencia` | Requeridos menos disponibles; distinguir faltantes de sobrantes y contemplar vacío en ambos lados. |
| `python-simetrica` | Exclusivos de ambos lados, sin contar apariciones; no sustituir por una sola resta. |
| `python-subconjunto` | Igualdad incluida y vacío verdadero; requisitos repetidos no representan varias unidades. |
| `python-crea-grupo` | Copiar cada lista antes de append, conservar categorías ajenas y repetición; dos niveles bastan para nombres de texto. |
| `python-comprension` | Un cuadrado por posición, con negativos, cero y repeticiones; no se filtra. |
| `python-comprension-filtro` | Seguir lower y filtro con mayúsculas, signo y vocal repetida dentro del contrato ASCII. |
| `python-comprension-condicional` | Reemplazar en todas las posiciones; un if posterior al for filtraría y cambiaría el tamaño. |
| `python-comprension-dict` | Una clave por palabra, incluida la vacía; la repetida reasigna la misma longitud, no crea dos claves. |
| `python-iterador` | Consumir el mismo iterador dos veces; agotarlo no vacía la entrada ni crea otro recorrido. |
| `python-generador` | sum consume los cuadrados sin lista intermedia; data ya ocupa una lista, no prometer memoria total constante. |
| `python-map` | Función por nombre y conversión antes de multiplicar; devolver enteros materializados, no textos repetidos. |

Los enunciados conservan la introducción conceptual necesaria antes de resolver.
Las nuevas explicaciones siguen operaciones y fronteras concretas, sin copiar
esa introducción completa. No cambian los 433 ejemplos públicos ni sus ayudas:
los ejemplos adicionales en estas explicaciones son comprobaciones editoriales,
no nuevos casos oficiales ni datos ocultos.

`tests/python-collection-explanations.test.ts` protege todos los campos salvo
estas 15 explicaciones con una huella calculada antes del lote. Conserva las
43 explicaciones anteriores y las 166 aún pendientes, además de código, casos,
enunciados, proyectos, ayudas y minutos. Comprueba el inventario y las decisiones
editoriales y ejecuta casos independientes sobre las **15 referencias fijas**.
Estos últimos comparan resultados, ausencia de impresión y contenido de entrada
al retornar; no certifican toda mutación intermedia ni técnicas de alumnos.

`tests/python-collection-baseline.ts` reconstruye solo los 15 textos anteriores
desde las lecciones originales sin editar, para mantener las huellas históricas
de soluciones, fundamentos y tiempos. Una comprobación de la huella completa de
la entrega anterior acredita esa reconstrucción. Se añade la nueva entrega sin
retirar las anteriores; no se prepara ni activa contenido en la base.

No cierra el inventario global de teoría local, ejemplos, explicaciones o ayudas.
Las pruebas locales ejecutan únicamente código fijo del repositorio; Piston,
revisión visual y el resto de E/F siguen pendientes.

## Explicaciones de filtros y registros propios

Se contrastan las últimas **16 actividades exclusivas de Python**, desde
`python-filter` hasta `python-transforma-registros`. Edición de contactos conserva
la explicación del primer lote; las otras **15** tienen revisiones explícitas en
`prisma/python-record-explanations.ts`. Quedan revisadas las **48/48 explicaciones
de actividades propias** y **73/224 del catálogo**: no se vuelven a contar
desempaquetado, recorrido de pares ni edición de contactos.

| Actividad | Decisión |
| --- | --- |
| `python-filter` | Separar selección y extracción de nombre, incluir edad 18 y no detenerse ante un menor ni eliminar nombres repetidos. |
| `python-agrega` | Extremos reales con negativos; distinguir suma vacía, ausencia de extremo y extremo válido cero. |
| `python-clave-longitud` | Seguir key=len con empate estable que no se ordena alfabéticamente. |
| `python-lambda-desempate` | Negar solo la longitud y conservar el alfabético ascendente; reverse=True invertiría ambos criterios. |
| `python-formato-decimal` | Precisión variable, texto con ceros finales y empate al par de float; sin prometer redondeo financiero. |
| `python-consulta-anidada` | Respaldo exterior y consulta interior sin escrituras; nota None y claves ausentes comparten resultado, cero no. |
| `python-inventario-valora` | Filas nuevas con céntimos enteros, orden compuesto y suma; conservar productos de valor cero, sin disco. |
| `python-academia-inscribe` | Copiar cursos por alumno y aplicar dos setdefault; no reiniciar una nota cero ni sobrescribir otras inscripciones. |
| `python-academia-califica` | Cortocircuito de and, existencia y límites 0/100; no crear inscripciones ni borrar notas al rechazar -1/101. |
| `python-academia-resume` | Excluir solo None, conservar media cero y fracciones, evitar división vacía y desempatar por nombre. |
| `python-contactos-crea` | Normalizar antes de consultar, rechazar vacío/duplicado y conservar ceros del teléfono como texto. |
| `python-contactos-edita` | Conservar la explicación previa de copias por ficha, campos permitidos y texto vacío válido. |
| `python-contactos-borra` | Copiar y borrar clave completa normalizada, no coincidencias parciales ni devolver la ficha retirada. |
| `python-contactos-busca` | Precisar filtro vacío frente a campo ausente y conjunción de todos los filtros; ordenar nombres sin cambiar fichas. |
| `python-transforma-campo` | Escribir solo la clave existente seleccionada; copia superficial suficiente por textos inmutables. |
| `python-transforma-registros` | Copias por registro, campos sin regla y errores por campo; int nativo no equivale a la gramática restringida de otra práctica. |

La explicación anterior de búsqueda de contactos ya era específica: se amplía
para justificar el fragmento vacío y la diferencia con una clave ausente, no se
declara incorrecta toda su versión histórica. Los otros 14 textos retiran la
introducción conceptual completa repetida y siguen el código de referencia.
Los enunciados, las pistas y los 433 ejemplos públicos permanecen intactos.

`tests/python-record-explanations.test.ts` comprueba inventario, cobertura de las
48 actividades propias y decisiones editoriales. Ejecuta ejemplos independientes
sobre las 15 referencias fijas: cero y ausencia, fronteras 0/100, empates estables
y compuestos, rechazo por filtro incompleto y recuperación de conversión sin
perder otros campos/registros. El caso `1_000` contrasta int nativo con la gramática
ASCII restringida de captura-conversion, sin cambiar ninguna de las dos reglas.
Se compara también el contenido de la entrada al retornar y la ausencia de
impresión. Esto no certifica identidad, técnicas de alumnos, toda mutación
intermedia ni ejecución real en Piston.

Una huella calculada antes de editar excluye solo las 15 explicaciones nuevas;
protege las 58 revisadas antes, las 151 pendientes y todos los campos restantes.
`tests/python-record-baseline.ts` reconstruye esos textos anteriores desde las
lecciones originales, con una excepción explícita para búsqueda, que tenía una
revisión aplicada sobre su lección. Se comprueba la huella completa de la entrega
anterior. Las pruebas históricas de colecciones, fundamentos, soluciones y tiempos
conservan sus valores mediante esa reconstrucción; se añade una huella de
publicación sin retirar ninguna anterior ni preparar/activar la base.

Quedan las 151 explicaciones comunes restantes y la revisión global de teoría
local, ejemplos ya explicados y repeticiones entre superficies; cerrar las 48
propias no cierra E ni F.

## Pendientes y límites

- Los diez lotes cubren **224/224 enunciados**; la estructura está completa, no E.
- Quedan teoría local, vocabulario en otras
  ayudas y objetivos y revisión de ejemplos ya explicados.
- PROGRAM conserva sus textos exactos y no se convierte en FUNCTION. Los proyectos
  conservan sus contratos de archivos y persistencia; se retiraron repeticiones
  internas, no se revisaron aún todas las superficies de ayuda y teoría.
- No modifica el componente de presentación ni acredita revisión visual o
  accesibilidad. La jerarquía visual, teoría desplegable y ergonomía siguen en F.
- Las revisiones están en fuentes, no preparadas ni activadas en la base. La
  validación real y publicación requieren el entorno autorizado y su respaldo.
