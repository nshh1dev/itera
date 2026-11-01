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

## Explicaciones comunes iniciales

Se revisan las primeras **24 explicaciones comunes pendientes**, desde saludo
hasta predicción de valores: los 20 programas compartidos y cuatro funciones.
Se ajustan **12** en `prisma/python-intro-explanations.ts` y se conservan otras
**12** tras contrastarlas con sus referencias. El total asciende a **97/224
explicaciones revisadas**, con **127 pendientes**. Revisar no obliga a reescribir
un texto correcto: las conservadas cuentan como auditadas, no como cambios.

| Actividad | Decisión |
| --- | --- |
| `logica-saludo` | Ajustar: print es una función y la expresión la llama; texto y salto final sin función solve. |
| `logica-dos-lineas` | Conservar: explica ambas llamadas y el orden de ejecución con líneas distintas. |
| `logica-orden-mensaje` | Conservar: vincula posición y salida, sin certificar cómo se reorganizó el código. |
| `logica-texto-calculo` | Conservar: distingue tipos y cálculo frente a caracteres entre comillas. |
| `logica-guarda-nombre` | Conservar: asignación y consulta de variable sin comillas. |
| `logica-guarda-cantidad` | Conservar: diferencia palabra y valor; existe regla conceptual variable, no solo comparación de salida. |
| `logica-actualiza-puntos` | Conservar: sigue 8 → 11 y la sustitución del valor, sin crear dos variables. |
| `logica-intercambia` | Ajustar: seguir 3/8 y auxiliar, mostrando por qué dos asignaciones directas perderían el 3. |
| `logica-suma-cantidades` | Conservar: números guardados y suma antes de imprimir, frente a expresión entre comillas. |
| `logica-cambio` | Conservar: justifica pago menos precio mediante el significado de ambos valores. |
| `logica-precio-unidades` | Conservar: conecta multiplicación, precio unitario y cantidad con el resultado 24. |
| `logica-parentesis` | Conservar: diferencia duplicar la suma y sumar al doble del segundo término. |
| `logica-lee-nombre` | Ajustar: seguir input, prefijo con coma/espacio y salida, retirando un segundo bloque teórico redundante. |
| `logica-lee-doble` | Ajustar: retirar Node y contrastar multiplicación numérica con repetición de texto, cero y negativo. |
| `logica-lee-suma` | Ajustar: dos conversiones, 6 frente a 42 y error de mezclar texto y entero. |
| `logica-mensaje-resultado` | Conservar: separador explícito y espacios interiores sin conversión numérica. |
| `logica-numero-texto` | Conservar: el tipo determina suma o unión de textos. |
| `logica-booleano` | Ajustar: seguir True → str → lower sin reasignar el booleano, sin justificar salida por otros lenguajes. |
| `logica-igualdad` | Ajustar: == frente a asignación y formato final true/false, con ejemplos iguales y distintos. |
| `logica-alcanza` | Ajustar: justificar 9/10/11, igualdad incluida y diferencia con > o ==; conservar formato exacto. |
| `logica-retorno` | Ajustar: seguir argumento y retorno con cero/negativo, sin input, impresión ni llamada manual. |
| `logica-parametro` | Ajustar: sustituir plantilla extensa de razonamiento/coste/errores por lectura de data * 2 y fronteras. |
| `logica-imprimir-devolver` | Ajustar: mostrar 5 no corrige devolver 0; reparar return, no añadir impresiones. |
| `logica-predice-valores` | Ajustar: seguir x en 2 → 5 → 10 y el caso -3, sin certificar la predicción previa por comparar resultados. |

Los enunciados, pistas, errores comunes y costes permanecen disponibles en sus
superficies, sin repetirlos todos en la solución. Las reglas conceptuales
variable, swap y boolean siguen intactas; no se amplían ni se sustituyen por la
explicación. Se conservan input, impresión, saltos y true/false de PROGRAM, y
argumento/retorno de FUNCTION. Ninguna revisión afecta JavaScript o TypeScript.

`tests/python-intro-explanations.test.ts` comprueba inventario y textos
conservados, decisiones y reglas vigentes. Ejecuta las 24 referencias fijas con
expectativas independientes, comparando salida exacta de los 20 programas y
retorno sin impresión de las cuatro funciones. No ejecuta código de estudiantes
ni acredita Piston o revisión conceptual dentro del sandbox.

La huella previa excluye solo las doce explicaciones ajustadas: protege las doce
conservadas y todos los demás campos, incluidas las 73 revisadas anteriormente,
las 127 pendientes, fuentes comunes, reglas, código, casos, ayudas y minutos.
`tests/python-intro-baseline.ts` reconstruye la prosa previa desde la variante
Python compartida sin editar sus fuentes. Una prueba recupera la huella completa
de la entrega anterior y las huellas históricas conservan sus valores. Se añade
la nueva huella sin retirar anteriores ni preparar o activar contenido en la base.

El inventario global de teoría local, ejemplos, explicaciones y repeticiones
sigue abierto. Este lote no cierra E/F ni sus comprobaciones visuales y reales.

## Explicaciones de condiciones, bucles y primeras listas

Se revisan las siguientes **24 explicaciones comunes**, desde tabla de valores
hasta búsqueda lineal. Hay **23 ajustes** explícitos en
`prisma/python-flow-explanations.ts` y **un texto conservado**, el de máximo,
que ya incluye una traza, negativos y coste ajustado a su código. Van **121/224
explicaciones revisadas** y quedan **103**.

| Actividad | Decisión |
| --- | --- |
| `logica-tabla-valores` | Traza 2 → 4 → 12 y -2 → 0 → 0, conversión con str y separador exacto, sin párrafo genérico de pruebas. |
| `logica-minutos-segundos` | Vincular multiplicación por 60 con unidades y caso cero; retirar cierre genérico sobre sangría. |
| `logica-perimetro` | Seguir claves y paréntesis; distinguir 10 de perímetro frente a 6 de área en un caso concreto. |
| `logica-repara-presupuesto` | Comparar envío único con cobro por unidad y mantener envío aun sin unidades. |
| `logica-merienda` | Cálculo numérico antes de str y prefijo exacto; retorno de texto sin impresión ni cargos nuevos. |
| `logica-elige-mensaje` | Primer return termina la llamada; retorno final fuera del if y cero no positivo. |
| `logica-signo` | Seguir if/elif/else con casos excluyentes y justificar el único entero que llega al else. |
| `logica-mayor-tres` | Candidato real, negativos y comparaciones independientes; evitar inicializar con cero o saltarse c. |
| `logica-dos-requisitos` | and de dos booleanos, cero válido y fallos de cada requisito; retirar la anticipación de FizzBuzz. |
| `logica-alternativas` | Agrupar alternativas antes de negar bloqueo; una invitación no elude un bloqueo. |
| `logica-tarifa` | Justificar límites 5/6/17/18 y retornos tempranos sin repetir límites inferiores. |
| `logica-uno-n` | Fin exclusivo de range, append del valor actual, vacío para cero y return después del for. |
| `logica-cuenta-atras` | Añadir antes de decrementar, incluir cero y terminar en -1; distinguir lista final de contador final. |
| `logica-suma-uno-n` | Separar acumulador y contador con totales 1/3/6 y contador final 4. |
| `logica-tabla` | range hasta 11 excluido, productos negativos y diez ceros, no índices ni textos de operaciones. |
| `logica-multiplos` | Contar coincidencias en 1..n, sin sumar sus valores ni incluir cero; divisor positivo ya garantizado. |
| `logica-bucle-roto` | Traza 1+2+3+4; avanzar de dos omite valores y no avanzar impide terminar para positivos. |
| `logica-posicion` | Distinguir posición, valor y lista de un elemento; usar la garantía de índice válido. |
| `logica-indices` | Delimitar 0/1/2 y fin 3 como traza de [8,3,8], no como longitud fija de cualquier entrada. |
| `logica-suma-lista` | Sumas parciales con negativos y vacío; retirar reduce y mantener recorrido elemental. |
| `logica-maximo` | Conservar: traza con repetición, candidato inicial real, negativos, O(n) y O(1) auxiliar. |
| `logica-cuenta-condicion` | Contador por aparición positiva frente a suma de valores, cero excluido y vacío. |
| `logica-filtra-lista` | Selección estable con igualdad y repeticiones; seguir append sin adelantar comprensiones. |
| `logica-busqueda-lineal` | Explicar enumerate desde cero, retorno temprano de primer índice y -1 fuera del recorrido, sin ordenar. |

Se retiran bloques repetidos de razonamiento/pasos/coste/errores e indicaciones
genéricas de sintaxis ajenas a la explicación particular. Se mantienen los costes
concretos de referencias que los justifican; las superficies de coste, errores y
pistas del producto no se alteran. No se renombra ninguna clave ni se cambian
tipos, límites, plantillas, código, casos, ayudas o reglas conceptuales.

`tests/python-flow-explanations.test.ts` comprueba las 24 identidades, el texto
conservado y las decisiones. Ejecuta las 24 referencias fijas con casos
editoriales independientes, incluidos los ocho estados de acceso, ceros,
negativos, repeticiones y fronteras. Compara tipo de retorno, valor, ausencia de
impresión y contenido de entrada al retornar. No acredita técnicas de alumnos,
ausencia de toda mutación intermedia ni límites reales de tiempo o memoria.

La huella calculada antes del lote excluye solo las 23 explicaciones ajustadas;
protege máximo, las 97 revisadas previamente, las 103 pendientes y todos los
demás campos. `tests/python-flow-baseline.ts` reconstruye la prosa previa desde
las variantes Python compartidas sin editar sus fuentes. Una prueba recupera la
huella completa de la entrega anterior y las huellas históricas conservan sus
valores. Se añade la nueva huella sin retirar anteriores ni preparar/activar la
base. La revisión global de teoría local, ejemplos y repeticiones sigue abierta,
al igual que E/F y las comprobaciones reales/visuales.

## Explicaciones de textos, auxiliares, referencias y validación

Se revisan las siguientes **24 explicaciones comunes**, desde longitud de texto
hasta captura de conversión. Hay **17 ajustes** en
`prisma/python-state-explanations.ts` y **siete textos conservados**. Van
**145/224 explicaciones revisadas**, con **79 pendientes**.

| Actividad | Decisión |
| --- | --- |
| `logica-longitud-texto` | Seguir len con espacio/signo y vacío; retirar comparación incidental de representaciones Unicode y cierre genérico. |
| `logica-minusculas` | Conservar: normalización A/a, conservación de orden/espacios y conexión con el conteo inmediatamente siguiente. |
| `logica-vocales` | Conservar: normalización, cinco vocales, contador y casos vacío/consonantes/espacios. |
| `logica-invierte` | Conservar: traza a/ba/cba y advertencia de construcción potencialmente cuadrática sin adelantar alternativas. |
| `logica-elimina-caracter` | Precisar todas las coincidencias exactas y contraste A/a, sin normalizar ni detenerse tras la primera. |
| `logica-palabras` | Seguir transiciones de en_palabra, espacios repetidos y vacío dentro del contrato de separadores simples. |
| `logica-ficha-producto` | Conservar: ficha como diccionario, consulta por clave y retorno del precio, no de toda la ficha. |
| `logica-opcional` | Conservar: get usa respaldo solo al faltar clave y conserva cantidad cero. |
| `logica-ausencia` | Conservar: is None antes de sumar, sin perder el cero válido. |
| `logica-auxiliares` | Seguir subtotal y envío, no llamarlo descuento; límite 2000, caso 1999 y envío con cantidad cero. |
| `logica-variable-local` | Distinguir numero recibido y valor fijo 10; seguir ambos retornos sin cierre genérico de sintaxis. |
| `logica-parametro-exterior` | Corregir explicación de nombres coincidentes ajena a la referencia; contrastar argumento con exterior y posición de resultados. |
| `logica-llamadas-independientes` | Contador reiniciado dentro de cada llamada, [2,3] frente a acumulación [2,5] y llamada con cero. |
| `logica-sin-estado-global` | Misma base y cada tasa, no suma acumulada; ejemplo con tasa negativa y lista vacía. |
| `logica-encadena-retornos` | El retorno de subtotal alimenta embalar y su resultado llega al return exterior; embalaje único incluso con cero unidades. |
| `logica-dos-nombres-lista` | Alias sin copia, append compartido y mutación intencional de valores; salida no certifica identidad. |
| `logica-reasigna-o-muta` | Reasignar alias cambia su vínculo a otra lista sin escribir en la recibida. |
| `logica-copia-plana` | list más append solo sobre copia, incluido vacío; superficial basta por elementos enteros, sin recomendar copia universal. |
| `logica-conserva-entrada` | Construir ajustados con orden/repetición sin escribir en valores; limitar lo que demuestra comparar contenidos. |
| `logica-registro-compartido` | Alias de diccionario, cantidad negativa posible y cambio cero; mantener mutación intencional y límite de identidad. |
| `logica-valida-divisor` | Validar antes de dividir, None/null frente a cero válido y / como retorno float aunque el cociente tenga valor entero. |
| `logica-valido-cero-ausente` | La clave siempre existe: ausente significa None, no falta de clave; comprobarlo antes de comparar números. |
| `logica-localiza-error` | Comprobar ambas fronteras antes de acceder; el contrato rechaza índices negativos aunque Python los admita. |
| `logica-captura-conversion` | Conservar la explicación específica de strip/signo/cifras ASCII, int directo y captura solo de ValueError. |

Se retiran cierres genéricos sobre predicciones/pruebas, bloques extensos que
repiten ayudas y referencias a técnicas no necesarias. Los textos conservados
ya justifican sus operaciones; captura de conversión mantiene la revisión
específica anterior, no la explicación original compartida. No se cambia código,
gramática aceptada, reglas conceptuales, enunciados, pistas, costes ni ejemplos
públicos.

`tests/python-state-explanations.test.ts` comprueba inventario y decisiones.
Ejecuta las 24 referencias fijas con expectativas independientes para textos,
vacíos, ceros, umbral de envío, parámetros y validación. Los casos de alias de
lista/diccionario declaran explícitamente la entrada final mutada que exige el
contrato; los demás conservan sus contenidos al retornar. El cociente se
comprueba como float cuando es válido y como None ante divisor cero. La
conversión ASCII rechaza también guiones bajos y cifras no ASCII, sin imponer
esa restricción a otras prácticas de int nativo. Esto no certifica identidad,
ausencia de toda mutación intermedia, técnicas de alumnos ni Piston real; D2
no se da por cerrada por estas comprobaciones locales.

La huella calculada antes de editar excluye solo las 17 explicaciones nuevas y
protege las siete conservadas, las 121 revisadas previamente, las 79 pendientes
y todos los demás campos. `tests/python-state-baseline.ts` reconstruye la prosa
previa desde las variantes Python compartidas sin editar sus fuentes. Se
comprueba la huella completa de la entrega anterior y se conservan los valores
históricos. Se añade una huella de publicación sin retirar anteriores ni
preparar/activar contenido en la base. La revisión global de teoría local,
ejemplos y repeticiones sigue abierta, al igual que E/F y validación real/visual.

## Explicaciones de pruebas, colecciones y búsquedas

Se revisan las siguientes **24 explicaciones comunes**, desde error de dominio
hasta palíndromo. Hay **diez ajustes** en `prisma/python-search-explanations.ts`
y **catorce textos conservados**. Van **169/224 explicaciones revisadas**, con
**55 pendientes**. Se mantienen explicaciones específicas ya incorporadas en
auditorías anteriores cuando justifican bien el código actual.

| Actividad | Decisión |
| --- | --- |
| `logica-error-dominio` | Conservar: raise de ValueError, try de llamada y mensaje recuperado con str(error). |
| `logica-recupera-elementos` | Conservar: gramática ASCII y recuperación por elemento sin ocultar errores ajenos. |
| `logica-asercion-normal` | Conservar: auxiliar triple, expectativa fija y AssertionError, sin progreso por declarar aserción. |
| `logica-pruebas-limites` | Conservar: vacío/negativos revelan candidato inicial incorrecto y justifican la corrección. |
| `logica-reproduce-fallo` | Conservar: [0] como caso mínimo y regresión del conteo estrictamente positivo. |
| `logica-conserva-regresion` | Ajustar: explicar cobrar y max de Python, igualdad y suelo cero, sin Math.max ni suponer un defecto inicial de la plantilla. |
| `logica-factorial` | Conservar: acumulador uno, traza 1/2/6/24 y factorial cero sin vueltas. |
| `logica-fizzbuzz` | Conservar: caso combinado primero, un valor por vuelta y números no sustituidos. |
| `logica-mediciones` | Ajustar: claves de diccionario con estados distintos, cortocircuito de None y cero frente a máximo negativo. |
| `logica-carrito` | Ajustar: subtotal de importes antes del porcentaje, posible fracción y retorno float sin redondeo. |
| `logica-saldo` | Ajustar: traza de rechazo/aceptación, estado conservado al rechazar y cero válido; distinguir inventario que admite negativos. |
| `logica-repetido` | Ajustar: pertenencia antes de add, retorno temprano y vacío; no se necesitan frecuencias. |
| `logica-deduplica` | Conservar: conjunto para pertenencia y lista para orden de primera aparición, traza y coste esperado. |
| `logica-frecuencias` | Conservar: contadores independientes con traza de banana y máximo 26 claves. |
| `logica-primer-unico` | Ajustar: dos recorridos y criterio de primero sin insinuar que Python pierde el orden de inserción del diccionario. |
| `logica-anagramas` | Conservar: normalización, 26 contadores y comparación de cantidades, no solo pertenencia. |
| `logica-agrupa-registros` | Conservar: setdefault/append, categorías dinámicas, repeticiones y orden por grupo. |
| `logica-inventario` | Ajustar: diccionario de acumulados, producto con cero y saldo negativo permitido, sin vocabulario de mapa ni cierre genérico. |
| `logica-busqueda-binaria` | Conservar: extremos inclusivos, +1/-1, vacío y alcance de la comprobación editorial de accesos. |
| `logica-insercion-posicion` | Ajustar: intervalo de elementos con fin excluido, frontera no consultada y primera posición con duplicados. |
| `logica-ordena-insercion` | Conservar: copia, invariante del tramo ordenado, peor caso y caso ya ordenado sin prometerlo para cualquier lista casi ordenada. |
| `logica-ordena-registros` | Conservar: clave compuesta, inversión solo de puntos y estabilidad de empates completos. |
| `logica-combina` | Ajustar: dos frentes, avance de un solo índice y restos; los slices crean temporales además de la salida. |
| `logica-palindromo` | Ajustar: dos índices, primera diferencia y vacío/un carácter; conservar signos, espacios y mayúsculas. |

Las diez revisiones siguen decisiones del código en vez de repetir apartados
genéricos de pasos, coste y errores. La explicación de mezcla no atribuye O(1)
auxiliar a una referencia que materializa slices de los restos; tampoco se
cambia su implementación. Se mantienen contratos, ayudas, ejemplos, límites,
reglas conceptuales y el resto de los metadatos. Las aserciones no se presentan
como certificación de cobertura ni como sustituto de los casos oficiales.

`tests/python-search-explanations.test.ts` comprueba inventario, vocabulario y
decisiones; ejecuta las 24 referencias fijas con expectativas independientes.
Incluye rechazo seguido de conversión válida, cero/ausencia, porcentaje
fraccionario, movimientos rechazados, orden de aparición, límites de búsqueda,
duplicados y restos de mezcla. Compara tipo/valor de retorno, ausencia de
impresión y contenido de entrada al retornar; en carrito confirma float.
Comparar registros idénticos no certifica su identidad ni la estabilidad de un
programa de alumno. Tampoco se certifican rendimiento real o toda mutación
intermedia; no se ejecuta código de estudiantes fuera del sandbox.

La huella previa excluye solo las diez explicaciones ajustadas y protege las
catorce conservadas, las 145 revisadas antes, las 55 pendientes y todos los demás
campos. `tests/python-search-baseline.ts` reconstruye la prosa previa desde las
variantes Python compartidas sin editarlas y se verifica la huella completa de
la entrega anterior. Las pruebas históricas conservan sus valores y se añade
otra huella de publicación, sin preparar ni activar contenido en la base.
La revisión global de teoría local, ejemplos y repeticiones, D2, E/F y validación
real/visual siguen abiertas.

## Explicaciones de ventanas, matrices y estructuras

Se revisan las siguientes **24 explicaciones comunes**, desde pareja hasta
árbol de búsqueda. Hay **21 ajustes** en
`prisma/python-structure-explanations.ts` y **tres textos conservados**. Van
**193/224 explicaciones revisadas**, con **31 pendientes**.

| Actividad | Decisión |
| --- | --- |
| `logica-pareja` | Justificar movimiento de extremos y desempate menor i/mayor j, con posiciones distintas y salida de índices. |
| `logica-intervalos-suma` | Traza de prefijos con negativo y fin incluido; sin consultas no equivale a una consulta de una celda. |
| `logica-ventana-fija` | Sumar entrada/salida de ventana y partir de suma real; el slice inicial ocupa O(k) auxiliar, no O(1). |
| `logica-ventana-suma` | Extender y encoger con valores positivos, longitud y umbral al menos target, no igualdad exacta. |
| `logica-celda` | Seguir fila y después columna con matriz rectangular para evitar suponerla cuadrada. |
| `logica-filas` | Conservar filas vacías y longitudes distintas; tiempo O(f + N) contando filas y celdas, no producto de dimensiones uniformes. |
| `logica-columnas` | Un acumulador por columna, guarda previa de vacío y contraste con sumas por fila. |
| `logica-diagonales` | Conservar: índices de ambas diagonales, centro compartido y caso de una celda. |
| `logica-transpuesta` | Seguir comprensiones exterior/interior y dimensiones 2×3 → 3×2, sin ordenar ni invertir datos. |
| `logica-vecinos` | Cuatro desplazamientos, límites antes de acceso y salida separada; no usar índices negativos, diagonales ni la celda actual. |
| `logica-pila` | Pendientes frente a extracciones, LIFO y vacío; coste amortizado de append, sin afirmar O(1) por llamada aislada. |
| `logica-cola` | FIFO con pop(0), vacío y pendientes no atendidos; peor caso O(o²) de esta referencia, no de una alternativa con deque. |
| `logica-delimitadores` | Tipo y orden de cima, cierre sin apertura y aperturas restantes; cantidades iguales no bastan. |
| `logica-deshacer` | Guardar estado antes de cada suma, incluida cero; cada deshacer consume un estado aunque el valor no cambie. |
| `logica-suma-recursiva` | Conservar: caso base, slices, O(n²) de tiempo/memoria simultánea y límite de profundidad, sin certificar técnica. |
| `logica-busqueda-recursiva` | Propagar retornos, reducir intervalo original sin slices y resolver vacío antes del acceso. |
| `logica-une-intervalos` | Orden, contacto por extremo, intervalo contenido y filas nuevas sin escrituras en la entrada. |
| `logica-segundo-maximo` | Dos candidatos, valores distintos y None, sin inventar un cero inicial que descarte negativos. |
| `logica-sin-repeticiones` | Última posición y max para que left no retroceda; abba tiene longitud máxima 2. |
| `logica-ranking` | Diccionario de conteos y orden de claves por frecuencia/valor numérico, sin duplicados ni conversión a texto. |
| `logica-altura` | None antes de hijos y uno más el máximo, contando nodos y no enlaces; claves Python y memoria de llamadas. |
| `logica-preorden` | Añadir value antes de left/right, conservar repeticiones y separar lista de salida de pila recursiva. |
| `logica-niveles` | Índice de cola y orden left/right; los nodos procesados no se eliminan y la memoria no se limita a la anchura pendiente. |
| `logica-arbol-busqueda` | Conservar: límites estrictos de todos los antecesores, None, coste por nodos/altura y claves Python. |

Los costes describen el código real sin modificarlo: ventana fija conserva su
slice inicial y la cola conserva pop(0). El recorrido por niveles conserva su
lista con procesados; no se le atribuye la memoria de una cola que los retire.
Las dimensiones y límites de cada contrato siguen intactos. Se retiran bloques
genéricos y vocabulario de mapa, conservando ayudas, ejemplos y reglas.

`tests/python-structure-explanations.test.ts` comprueba inventario, decisiones y
operaciones concretas del código que justifican los costes. Ejecuta las 24
referencias fijas con expectativas independientes para negativos, empates,
matrices rectangulares/filas vacías, FIFO/LIFO, cero en historial, recursión y
árboles con claves value/left/right. Compara tipo/valor de retorno, ausencia de
impresión y entrada conservada al retornar. Esos casos no miden límites reales,
no certifican identidad ni toda mutación intermedia y no prueban técnicas de
programas enviados por alumnos.

La huella previa excluye solo 21 explicaciones y protege las tres conservadas,
las 169 revisadas antes, las 31 pendientes y todos los demás campos.
`tests/python-structure-baseline.ts` reconstruye la prosa anterior desde fuentes
compartidas, conservando explícitamente el puente de prefijos y la nota Python
añadida a los tres árboles revisados. Se verifica la huella completa de la entrega
anterior; las pruebas históricas conservan sus valores. Se añade otra huella de
publicación sin preparar ni activar la base. D2, teoría local, ejemplos,
repeticiones globales, E/F y comprobaciones reales/visuales siguen abiertas.

## Explicaciones de selección, combinatoria, tablas y grafos

Se revisan otras **24 explicaciones comunes**, desde ancestro hasta
dependencias: **veinte ajustes** en `prisma/python-optimization-explanations.ts`
y **cuatro textos conservados**. Van **217/224 explicaciones revisadas**, con
**siete pendientes**. Los textos explican decisiones de la referencia concreta,
sin cambiar código ni presentar el resultado como certificación de técnica.

| Actividad | Decisión |
| --- | --- |
| `logica-ancestro` | Explicar retorno de nodo/None, coincidencia temprana, objetivos iguales o antecesores y unión de ramas sin ordenar valores. |
| `logica-monticulo-inserta` | Traza del ascenso y parada con iguales; distinguir reparación logarítmica de la copia lineal y señalar que extraer no se llama. |
| `logica-monticulo-extrae` | Último valor en raíz, desempate izquierdo y representación concreta; vacío/un elemento y coste total con copia, sin atribuir uso a insertar. |
| `logica-prioridad` | Tupla numérica prioridad/id, salida solo de ids y ordenación del lote; no describir un montículo que no se usa. |
| `logica-k-mayores` | Retirar mínimo sobrante, repeticiones y k cero; conservar hasta k + 1 candidatos antes de extraer y ordenar la salida. |
| `logica-actividades` | Justificar fin más temprano, menos infinito para negativos y contacto permitido; contador, no lista de seleccionadas. |
| `logica-combina-archivos` | Traza de reinserción y costes acumulados 9 frente a 11; cero/un archivo no combina y no se abren archivos reales. |
| `logica-potencia` | Invariante y traza de exponente impar, resultado frente a base final, exponente cero y alcance de contar iteraciones con enteros. |
| `logica-mezcla` | Copia incluso en caso base, comparación y restos; separar memoria simultánea de todas las copias creadas durante la ejecución. |
| `logica-subconjuntos` | Construir nuevos antes de extender, listas independientes y orden fijado; salida O(n × 2ⁿ), incluido [[]] para vacío. |
| `logica-permutaciones` | Conservar: selección/restauración, copia de respuesta, orden numérico, vacío y memoria de candidatos por rama. |
| `logica-combinaciones` | Índice i + 1, corte con positivos ordenados, restauración y copia; ejemplo sin reuso, orden numérico y objetivo cero. |
| `logica-reinas` | Marcas de columna y dos diagonales, restauración de las tres, conteo en caso base y simetrías no agrupadas. |
| `logica-fibonacci` | Diccionario por solve compartido por sus llamadas, consulta antes de guardar y reutilización concreta; no caché entre envíos. |
| `logica-escalera` | Separar por último paso, bases 1/1 distintas de Fibonacci y asignación doble con valores previos; orden de pasos relevante. |
| `logica-caminos-obstaculos` | Arriba antes de actualizar e izquierda ya actualizada, cortar obstáculos e inicio bloqueado; una celda libre sí tiene un camino. |
| `logica-monedas` | Mínimo de cantidades frente a número de combinaciones, marcador amount + 1 y reuso; ejemplo no voraz y denominaciones vacías. |
| `logica-mochila` | Capacidad máxima, recorrido descendente y objeto gratuito usado una vez, incluso con capacidad cero; coste incluye tabla y frontera cero. |
| `logica-subsecuencia-comun` | Diagonal al coincidir y máximo arriba/izquierda si no; orden sin contigüidad, dos filas simultáneas y prefijos vacíos. |
| `logica-adyacencia` | Conjunto independiente por nodo, ambos sentidos, duplicados al revés y aislados; ordenar vecinos numéricamente y coste por grados distintos. |
| `logica-alcanzables` | Conservar: marcado al descubrir, pila, ambos sentidos, orden final y memoria total con conexiones. |
| `logica-distancias` | Conservar: cola con índice, primer descubrimiento, distancias no orden de visita y memoria de conexiones/vectores. |
| `logica-ciclo-dirigido` | Estados no visitado/activo/terminado, lazo frente a descendiente compartido y cobertura de todas las componentes. |
| `logica-dependencias` | Conservar: requisitos pendientes, heapq para mínima disponible y ciclo sin devolver orden parcial. |

`tests/python-optimization-explanations.test.ts` protege el inventario y las
decisiones editoriales y ejecuta las 24 referencias fijas con expectativas
independientes. Incluye ancestro en árbol no ordenado, empates de montículo,
prioridad numérica, repeticiones, horarios negativos, exponentes impares,
orden combinatorio, monedas reutilizables, objetos gratuitos, subsecuencias
repetidas y vacías, vecinos duplicados, descendiente compartido y tareas recién
liberadas. Comprueba tipo/valor de retorno, ausencia de impresión y contenido
de entrada al retornar; no certifica identidad, mutaciones intermedias,
complejidad ni límites reales de programas de estudiantes.

La huella previa excluye solo veinte explicaciones: protege las cuatro
conservadas, las 193 revisadas antes, las siete pendientes y todos los campos
ajenos. `tests/python-optimization-baseline.ts` restaura los textos originales
desde las variantes Python compartidas sin editarlas; la huella completa de
la entrega anterior y las expectativas históricas se conservan. Se añade
otra huella de publicación, sin preparar ni activar la base. Teoría local,
ejemplos y repeticiones globales de E, F, D2 y validación real/visual siguen
pendientes; revisar estas explicaciones no cierra esas tareas.

## Cierre individual de explicaciones: caminos y optimización

Las últimas **siete explicaciones comunes** completan **224/224 identidades
revisadas**. Se ajustan seis textos en `prisma/python-path-explanations.ts` y se
conserva Dijkstra. Este cierre abarca explicaciones de solución, no la revisión
global de teoría local, ejemplos o repeticiones entre superficies de E.

| Actividad | Decisión |
| --- | --- |
| `logica-dijkstra` | Conservar: infinito, selección lineal sin montículo, pesos positivos, ambos sentidos y coste total con conexiones. |
| `logica-islas` | Matriz de visitas separada, marcado al apilar, componentes frente a celdas, diagonales excluidas y cuadrículas sin celdas. |
| `logica-laberinto` | Distancia fijada antes de encolar, movimientos en cuatro sentidos, inicio cero y meta inalcanzable; la referencia no termina al descubrir la meta y conserva procesados. |
| `logica-capacidad` | Cotas máximo/suma, carga exacta sin abrir día, tramos ordenados y frontera mínima con alto = medio; se permiten menos días y se cuenta el trabajo inicial. |
| `logica-edicion` | Bases de inserción/borrado, vecinos de cada transición y comparación como coste 0/1; dos filas simultáneas, vacíos y ausencia de intercambio de coste uno. |
| `logica-subsecuencia-creciente` | Longitud que termina en cada índice, desigualdad estricta y máximo global, no última celda; orden original sin contigüidad ni algoritmo alternativo supuesto. |
| `logica-planifica-tareas` | Requisitos pendientes, máximo de finales en paralelo y liberación tras todos los requisitos; duración cero conserva dependencias y ciclo no devuelve un resultado parcial. |

`tests/python-path-explanations.test.ts` exige la correspondencia exacta entre
el inventario revisado y las 224 identidades del catálogo, sin duplicar las
actividades propias o ya revisadas por vocabulario. Contrasta las siete
referencias fijas con expectativas independientes: caminos de menor coste,
islas diagonales, laberinto que requiere subir, frontera de capacidad, edición
con inserciones/borrados, subsecuencias no contiguas y tareas paralelas/cíclicas.
Comprueba tipo/valor de retorno, ausencia de impresión y contenido de entrada al
retornar; no certifica identidad, toda mutación intermedia, técnica o límites
reales de ejecución de programas de estudiantes.

La huella previa excluye solo seis explicaciones y protege Dijkstra, las 217
revisadas antes y todos los campos ajenos. `tests/python-path-baseline.ts`
reconstruye la prosa anterior desde fuentes compartidas sin editarlas; se
recupera la huella completa de la entrega anterior y se conservan las
expectativas históricas. Se añade otra huella de publicación sin preparar ni
activar contenido en la base. D2, el resto de E, F y validación real/visual siguen
abiertas: completar este inventario no completa el plan.

## Teoría local: primeras 16 actividades propias

Tras revisar las 224 explicaciones de solución, se contrasta la teoría local de
las primeras **16/48 actividades propias**, integrada en el párrafo Tu tarea.
Se mantiene la introducción conceptual antes de practicar: no se confunde
reducir repeticiones con retirar la primera explicación de una herramienta.
Hay **tres ajustes y trece párrafos conservados** en `prisma/python-editorial.ts`;
quedan 32 propias, además de la teoría de actividades comunes y proyectos por
revisar. No se declara aquí revisada la teoría de las otras 208 actividades.

| Actividad | Decisión sobre teoría local |
| --- | --- |
| `python-constante` | Conservar: mayúsculas como convención sin bloqueo de reasignación y ejemplo de transferencia a otra equivalencia. |
| `python-decimal` | Conservar: conversión de texto, contraste con int y .0 de print; no sustituirlo por formato financiero. |
| `python-condicional` | Conservar: forma genérica de expresión, condición entre alternativas y equivalencia con ramas; pista final concreta aparte. |
| `python-centinela` | Conservar: break termina el bucle más cercano; las reglas y pistas fijan exclusión del centinela y su comprobación previa. |
| `python-omite-negativos` | Conservar: continue frente a break, sin repetir la traza de la solución. |
| `python-ordena-numeros` | Conservar: sorted crea lista y sort muta/devuelve None; resultado por claves ya contextualizado. |
| `python-recorta` | Conservar: tramo con fin excluido y otra lista frente a un elemento; aquí no se modifican contenidos anidados. |
| `python-une-palabras` | Conservar: split sin argumento frente a separador literal y join como reconstrucción; no entregar el encadenado completo antes de las pistas. |
| `python-desempaqueta` | Conservar: aridad exacta y evaluación de la derecha antes de asignar; representación de tupla en JSON en el resultado. |
| `python-enumera` | Conservar: parejas, inicio explícito y desempaquetado sin buscar posiciones por valor. |
| `python-empareja` | Conservar: valores correspondientes y fin de la entrada más corta, sin introducir strict o relleno. |
| `python-retorno-multiple` | Ajustar: return termina la llamada al ejecutarse; una condición decide qué rama se alcanza, no el primer return escrito. Conservar tupla y desempaquetado. |
| `python-identidad` | Ajustar: list crea otra lista exterior y comparte referencias a contenedores interiores; append exterior no modifica esos contenidos. Conservar alias y comparación is. |
| `python-opcional-seguro` | Conservar: momento de creación del predeterminado y None como señal para crear por llamada. |
| `python-actualiza-diccionario` | Ajustar: dict crea diccionario exterior con referencias compartidas; enteros inmutables y reemplazo de asociación justifican la copia superficial de este contrato, no una copia profunda general. |
| `python-borra-clave` | Conservar: pop con respaldo y valor cero no confundido con clave ausente; pista final conserva el procedimiento. |

Los tres ajustes afectan solo a Tu tarea, tanto común como de variante Python.
Entrada y Resultado esperado permanecen exactos, así como ayudas, objetivos,
plantillas, soluciones, ejemplos y sus explicaciones, tiempos y evaluación.
Las fuentes originales de `python-lessons.ts` se conservan como antecedentes;
la revisión publicada se compone mediante la proyección editorial existente.

`tests/python-local-theory.test.ts` comprueba inventario y decisiones, y ejecuta
modelos fijos independientes de return condicional, tupla, alias, append exterior,
contenedores interiores compartidos y reemplazo de entero en un diccionario.
En esos modelos se comprueba identidad directamente con is: no se deduce desde
JSON ni se certifica la identidad de programas enviados. No se ejecuta código de
alumnos ni se acredita ausencia de toda mutación intermedia o aislamiento real.

La huella previa excluye solo los tres párrafos iniciales, no enunciados enteros:
protege Entrada/Resultado esperado, los otros 221 enunciados y todos los campos
ajenos. `tests/python-local-theory-baseline.ts` restaura los tres párrafos previos
conservando los contratos actuales, de modo que cambios no autorizados en estos
también rompen la huella histórica. Las pruebas históricas restauran ahora ambas
copias del enunciado antes de comprobar sus mismas expectativas, sin recalcular
valores. Se recupera la huella completa anterior y se añade otra de publicación.
No se prepara ni activa contenido; teoría restante, ejemplos, vocabulario global,
repeticiones, D2 y F siguen abiertos.

## Teoría local: conjuntos, comprensiones e iteración

Se revisan las siguientes **16 actividades propias**: **tres ajustes y trece
introducciones conservadas**. Van **32/48 propias** con teoría local revisada;
quedan 16 propias y la teoría común/proyectos. Las 224 explicaciones de solución
mantienen su revisión individual, distinta de esta superficie.

| Actividad | Decisión sobre teoría local |
| --- | --- |
| `python-recorre-pares` | Ajustar: items(), keys() y values() son llamadas que devuelven vistas; distinguir método sin paréntesis y lista creada por sorted. No modificar el diccionario durante el recorrido. |
| `python-lista-registros` | Conservar: ficha como diccionario, campo frente a índice y acumulador antes del bucle, sin introducir agrupación. |
| `python-conjunto-seguro` | Conservar: add/discard/remove y lista ordenada; el resultado fija el orden de añadir y descartar. |
| `python-union` | Conservar: pertenencia en al menos un lado y valor compartido una sola vez; pista final concreta aparte. |
| `python-interseccion` | Conservar: pertenencia en ambos, no cantidad de apariciones. |
| `python-diferencia` | Conservar: dirección de resta de conjuntos y faltantes frente a sobrantes. |
| `python-simetrica` | Conservar: exclusivos de ambos lados y contraste con diferencia direccional. |
| `python-subconjunto` | Ajustar: cada elemento de A debe pertenecer a B; <= no compara tamaños y admite igualdad, a diferencia de <. Conservar vacío. |
| `python-crea-grupo` | Conservar: copia exterior comparte listas, lista nueva por categoría y setdefault antes de append. |
| `python-comprension` | Conservar: expresión por posición y equivalencia con bucle, sin filtro ni pérdida de repeticiones. |
| `python-comprension-filtro` | Conservar: if posterior selecciona, lower permite reconocer mayúsculas; encadenado concreto en pista final. |
| `python-comprension-condicional` | Conservar: expresión condicional transforma cada posición y filtro elimina posiciones. |
| `python-comprension-dict` | Conservar: clave: valor distingue diccionario de conjunto y repetición reemplaza asociación. |
| `python-iterador` | Conservar: único recorrido consumible, materializar agota y no reinicia ni vacía la entrada. |
| `python-generador` | Conservar: valores bajo demanda y consumo por sum sin lista completa intermedia; sin prometer memoria de cualquier solución. |
| `python-map` | Ajustar: la función se llama al pedir resultados, no para transformar todos al crear map; list consume y no repite una transformación ya agotada. |

Solo cambian tres párrafos de Tu tarea en la proyección Python. Entrada y
Resultado esperado, ayudas, objetivos, soluciones, ejemplos y tiempos se
conservan íntegros. No se añaden excepciones a los contratos ni garantías de
técnica comprobada. `tests/python-iteration-theory.test.ts` exige las 16
identidades y contrasta modelos fijos independientes de vistas, pertenencia,
operaciones de conjuntos, comprensiones y agotamiento. Un registro de llamadas
confirma que crear map no ejecuta la auxiliar, next consume un elemento y list
solo consume los restantes. No son programas de alumnos ni pruebas del sandbox.

La huella calculada antes de editar excluye solo tres párrafos, protegiendo los
contratos completos, las 16 revisadas previamente, las trece conservadas y
todas las demás superficies. `tests/python-iteration-theory-baseline.ts`
reconstruye la entrega anterior restaurando ambos enunciados sin tocar sus
secciones de entrada/salida. Las expectativas históricas mantienen sus valores
y se añade una huella de publicación, sin preparar ni activar la base. El resto
de teoría, ejemplos, vocabulario global, repeticiones, D2/E/F y verificación
real/visual sigue pendiente.

## Teoría local: cierre de las 48 propias

Se revisan las últimas **16 actividades propias**, con **tres ajustes y trece
introducciones conservadas**. Queda revisada la teoría local de **48/48 propias**:
nueve párrafos ajustados y 39 conservados entre los tres bloques. Esto no incluye
la revisión pendiente de teoría local de actividades comunes y proyectos ni la
revisión global de ejemplos y repeticiones entre superficies.

| Actividad | Decisión sobre teoría local |
| --- | --- |
| `python-filter` | Ajustar: iterador consumido bajo demanda, posible comprobación de varios registros para obtener un aceptado y rechazo sin terminar el recorrido; no transforma las fichas ni crea una lista al construirlo. |
| `python-agrega` | Conservar: neutro de sum y default de extremos vacíos, sin inventar cero. |
| `python-clave-longitud` | Conservar: pasar len sin ejecutarla por adelantado y estabilidad de claves iguales. |
| `python-lambda-desempate` | Conservar: expresión como auxiliar, tupla de criterios y signo negativo solo para el criterio numérico. |
| `python-formato-decimal` | Conservar: texto frente a número, precisión variable y ceros finales; redondeo float, no financiero. |
| `python-consulta-anidada` | Ajustar: get usa respaldo solo para clave ausente, no para cero/None guardados; el diccionario vacío permite continuar únicamente porque el modelo garantiza diccionarios por alumno. |
| `python-inventario-valora` | Conservar: céntimos enteros y filas nuevas sin stock ni disco, distinto de proyectos de inventario persistente. |
| `python-academia-inscribe` | Conservar: modelo alumno/curso/nota, copia interior y setdefault sin sobrescribir calificaciones. |
| `python-academia-califica` | Ajustar: and de izquierda a derecha con cortocircuito; pertenencia antes de acceso evita KeyError y cambiar ese orden pierde la protección. |
| `python-academia-resume` | Conservar: None frente a cero, promedio con alguna nota e índice de medias para ordenar nombres. |
| `python-contactos-crea` | Conservar: normalización antes de duplicados, fichas copiadas y teléfonos de texto con ceros iniciales. |
| `python-contactos-edita` | Conservar: campos permitidos y comprobación de tipo, no verdad del texto que puede estar vacío. |
| `python-contactos-borra` | Conservar: misma normalización, pop con respaldo y coincidencia completa del nombre. |
| `python-contactos-busca` | Conservar: todos los criterios, coincidencia parcial y rechazo temprano sin mutar datos al comparar. |
| `python-transforma-campo` | Conservar: copia superficial justificada por textos inmutables y transformación puntual sin crear clave ausente. |
| `python-transforma-registros` | Conservar: reglas transportadas por nombre y captura limitada a conversión numérica, sin extender gramática ASCII de otras actividades a int nativo. |

Los cambios se limitan a tres párrafos de Tu tarea en la proyección Python.
Entrada/Resultado esperado, ayudas, objetivos, código, ejemplos y tiempos
conservan sus valores exactos. La advertencia sobre None en get no amplía el
contrato para aceptar alumnos no representados por diccionarios.

`tests/python-record-theory.test.ts` protege las 16 decisiones y correspondencia
de las 48 propias con `pythonLessons`. Los modelos fijos observan las llamadas
del predicado al consumir filter, la identidad de una ficha aceptada, respaldo
de get con cero/None/clave ausente y diferencias entre consulta segura y consulta
antes de pertenencia. Incluyen estabilidad, desempate, formato, extremos y
conversión nativa. Consultan identidad con is en el modelo, no a través de JSON
ni sobre programas enviados; no acreditan sandbox o técnicas de estudiantes.

La huella previa excluye solo tres párrafos y protege los contratos completos,
las 32 introducciones revisadas antes, las trece conservadas y todas las otras
superficies. `tests/python-record-theory-baseline.ts` restaura ambos enunciados
con sus contratos actuales y recupera la huella íntegra de la entrega anterior;
las expectativas históricas mantienen sus valores. Se añade otra huella de
publicación sin preparar ni activar contenido. La teoría común/proyectos,
ejemplos, vocabulario global, repeticiones y D2/E/F siguen pendientes.

## Teoría local: primeras 24 actividades comunes

Se revisan los conceptos locales de las primeras **24 actividades comunes**,
incluidos **20 programas y cuatro funciones**: **tres ajustes y 21 consignas
conservadas**. No se añade un bloque teórico repetido a cada cálculo sencillo;
se contrasta el texto con la plantilla y las ayudas que lo acompañan. Van
**72/224 actividades revisadas en teoría local** (48 propias y 24 comunes);
quedan 152 comunes, incluidos proyectos.

| Actividad | Decisión sobre teoría local |
| --- | --- |
| `logica-saludo` | Conservar: instrucción de impresión y comillas de código frente a caracteres mostrados, con ayudas de paréntesis. |
| `logica-dos-lineas` | Conservar: una instrucción por línea y orden de ejecución sin introducir retornos. |
| `logica-orden-mensaje` | Conservar: reorganización concreta y lectura de arriba abajo, no reescritura del problema. |
| `logica-texto-calculo` | Conservar: expresión numérica sin comillas frente a caracteres entre comillas. |
| `logica-guarda-nombre` | Conservar: guardar y utilizar variable frente a repetir literal. |
| `logica-guarda-cantidad` | Conservar: diagnóstico de imprimir nombre entre comillas en vez de su valor, manteniendo asignación. |
| `logica-actualiza-puntos` | Conservar: valor previo en la derecha antes de actualizar, distinto de reemplazar por incremento. |
| `logica-intercambia` | Conservar: auxiliar para evitar perder el primer valor; intercambio múltiple se presenta después. |
| `logica-suma-cantidades` | Conservar: variables numéricas y operador de suma, sin ruido de fórmulas genéricas. |
| `logica-cambio` | Conservar: pago menos precio y dirección de la resta. |
| `logica-precio-unidades` | Conservar: multiplicación como suma repetida, con precio y cantidad diferenciados. |
| `logica-parentesis` | Conservar: precedencia y agrupación de la suma completa antes de duplicar. |
| `logica-lee-nombre` | Conservar: lectura preparada y unión de texto fijo con variable, espacio incluido. |
| `logica-lee-doble` | Conservar: entero ya convertido, operación numérica y no repetición de texto; no rehacer entrada. |
| `logica-lee-suma` | Conservar: dos textos convertidos antes de + frente a concatenación. |
| `logica-mensaje-resultado` | Conservar: texto fijo más ciudad y espacio del prefijo sin alterar espacios interiores. |
| `logica-numero-texto` | Conservar: + depende de operandos numéricos o textuales, sin sustituir expresiones por resultados fijos. |
| `logica-booleano` | Conservar: True sin comillas frente al formato true ya preparado con str/lower. |
| `logica-igualdad` | Ajustar: == compara y produce booleano; = asigna. Separar valor Python y transformación al texto exacto PROGRAM. |
| `logica-alcanza` | Conservar: al menos incluye igualdad y lectura/formato preparados, sin adelantar ramas. |
| `logica-retorno` | Ajustar: return entrega valor al llamador y termina esa llamada, no imprime; la aplicación recoge el retorno. |
| `logica-parametro` | Conservar: cálculo con dato recibido, firma y negativos/cero; no añadir teoría duplicada de multiplicación. |
| `logica-dos-parametros` | Conservar: accesos a diccionario ya preparados y combinación de ambos valores, no introducir otra firma. |
| `logica-imprimir-devolver` | Ajustar: print devuelve None y return print(...) no entrega el número mostrado; devolver el cálculo es distinto de imprimirlo. |

Solo cambian tres párrafos Tu tarea de la proyección Python. No cambian textos
exactos de salida PROGRAM, secciones Entrada/Resultado esperado, plantillas,
soluciones, ayudas, ejemplos, tiempos ni modalidades. Las variantes compartidas
de JavaScript/TypeScript conservan sus fuentes e identidades.

`tests/python-common-theory.test.ts` protege inventario y decisiones, y ejecuta
modelos fijos de igualdad, asignación, booleanos convertidos a true/false,
retorno sin impresión, None de print y fin de llamada. La salida se captura y
contrasta con textos exactos. No son programas de alumnos ni una comprobación
de técnicas internas, evaluación real o aislamiento.

La huella previa excluye solo tres párrafos y protege los otros 221 enunciados,
las 48 propias, todos los contratos y demás campos. La reconstrucción de
`tests/python-common-theory-baseline.ts` restaura ambos enunciados conservando
Entrada/Resultado esperado actuales; se recupera íntegra la huella anterior y
se mantienen las expectativas históricas. Se añade otra huella de publicación
sin preparar ni activar la base. Teoría restante, ejemplos, vocabulario global,
repeticiones entre superficies, D2/E/F y validación real/visual siguen abiertos.

## Teoría local: seguimiento, condiciones, bucles y listas

Se revisan las siguientes **24 comunes**, todas FUNCTION: **dos ajustes y 22
consignas conservadas**. Van **96/224 actividades revisadas en teoría local**:
48 propias y 48 comunes; quedan 128 comunes/proyectos. Se contrasta el concepto
local con plantilla, contrato y ayudas, sin añadir recetas repetidas a cada
ejercicio que ya tiene contexto suficiente.

| Actividad | Decisión sobre teoría local |
| --- | --- |
| `logica-predice-valores` | Conservar: predicción previa y estado actualizado, sin prometer que el resultado pruebe haber predicho. |
| `logica-tabla-valores` | Conservar: guardar estado inicial y posteriores sin exigir listas/bucles aún no necesarios. |
| `logica-minutos-segundos` | Conservar: equivalencia fija de unidades y multiplicación, sin repetir teoría de variables. |
| `logica-perimetro` | Conservar: suma de lados frente a área y consulta de medidas por clave. |
| `logica-repara-presupuesto` | Conservar: coste fijo frente a coste por unidad y diagnóstico de plantilla, incluso con cero unidades. |
| `logica-merienda` | Conservar: separar cálculo de representación, sin envío ni descuentos ajenos al modelo. |
| `logica-elige-mensaje` | Conservar: corregir solo respuesta interior de if y mantener alternativa preparada. |
| `logica-signo` | Conservar: casos revisados en orden y completar solo else; no ejecutar todas las ramas. |
| `logica-mayor-tres` | Conservar: comparaciones y candidato desde dato real, sin introducir lista/bucle por tres valores. |
| `logica-dos-requisitos` | Ajustar: and sobre dos booleanos exige ambos True; distinguir resultados de comparaciones de las cantidades comparadas. |
| `logica-alternativas` | Ajustar: or incluye que ambos booleanos sean True, not invierte y paréntesis agrupan alternativas; conservar fórmula concreta en pista final. |
| `logica-tarifa` | Conservar: tramos, fronteras y orden de comprobación mediante ayudas progresivas. |
| `logica-uno-n` | Conservar: número de la vuelta frente a constante cero, sin cambiar estructura preparada. |
| `logica-cuenta-atras` | Conservar: incluir cero, añadir antes de disminuir y condición de finalización. |
| `logica-suma-uno-n` | Conservar: acumulador frente a contador y actualización que mantiene el avance preparado. |
| `logica-tabla` | Conservar: multiplicador variable, diez resultados y orden, sin convertir productos a texto. |
| `logica-multiplos` | Conservar: resto cero, contador condicionado y exclusión de cero del intervalo. |
| `logica-bucle-roto` | Conservar: progreso del contador de uno en uno y riesgo de no terminar si se elimina el avance. |
| `logica-posicion` | Conservar: índice desde cero frente a valor, acceso concreto en pista final. |
| `logica-indices` | Conservar: índice actual frente a primer índice fijo y recorrido ya preparado. |
| `logica-suma-lista` | Conservar: acumular valor en total, no cantidad de elementos; inicialización/devolución preparadas. |
| `logica-maximo` | Conservar: candidato y comparación invertida, sin introducir cero que descarte máximos negativos. |
| `logica-cuenta-condicion` | Conservar: cantidad frente a suma y cero no estrictamente positivo. |
| `logica-filtra-lista` | Conservar: selección por límite incluido, lista nueva y orden/repeticiones; no detenerse tras un rechazo. |

Las notas de and/or se limitan explícitamente a operandos booleanos de estos
contratos; no afirman que esos operadores devuelvan siempre un bool con otros
tipos de operandos Python. No se adelanta la expresión completa del acceso:
permanece en la pista final. Solo cambian dos párrafos Tu tarea de la proyección
Python; entradas/salidas, reglas, código, ayudas, ejemplos y tiempos no cambian.

`tests/python-flow-theory.test.ts` protege las 24 identidades y las decisiones.
Sus modelos fijos contrastan tablas de conjunción/disyunción con expectativas
literales, negación, las ocho combinaciones de acceso, efecto de agrupar antes
del requisito de bloqueo, avance del contador, índices frente a valores y
conteo frente a suma. No ejecutan programas de alumnos ni certifican técnica,
rendimiento, aislamiento o terminación de cualquier programa enviado.

La huella previa excluye solo dos párrafos: protege los otros 222 enunciados,
contratos completos y todas las superficies ajenas. La reconstrucción de
`tests/python-flow-theory-baseline.ts` restaura ambos enunciados sin modificar
sus contratos y recupera íntegra la huella anterior. Se conservan expectativas
históricas y se añade otra huella de publicación sin preparar ni activar la
base. Teoría restante, ejemplos, vocabulario global, repeticiones y D2/E/F
siguen abiertos.

## Teoría local: textos, funciones y referencias

Se revisan otras **24 comunes**, todas FUNCTION, desde búsqueda lineal hasta
cantidad válida/cero/ausente. Se ajustan **tres párrafos y dos pistas en cuatro
actividades**; las otras **20 actividades conservan sus textos**. Van
**120/224 actividades revisadas en teoría local** (48 propias y 72 comunes);
quedan 104 comunes/proyectos. No se confunde el número de actividades revisadas
con el número de campos editados.

| Actividad | Decisión sobre teoría local y pistas |
| --- | --- |
| `logica-busqueda-lineal` | Conservar: primera coincidencia en lista no ordenada, índice desde cero y -1 al terminar sin encontrar. |
| `logica-longitud-texto` | Conservar: cantidad de caracteres ASCII incluidos signos/espacios y vacío, sin introducir distinciones Unicode ajenas al contrato. |
| `logica-minusculas` | Conservar: conversión produce otro texto y devolución del convertido, manteniendo plantilla y caracteres no alfabéticos. |
| `logica-vocales` | Conservar: normalización y contador preparados, pertenencia antes de sumar uno. |
| `logica-invierte` | Conservar: anteponer frente a añadir al final; corregir solo construcción preparada. |
| `logica-elimina-caracter` | Conservar: recorrido original y salida nueva con caracteres aceptados, todas las coincidencias y distinción de mayúsculas. |
| `logica-palabras` | Conservar: grupo no vacío, estado dentro/fuera y transición que evita contar espacios repetidos. |
| `logica-ficha-producto` | Conservar: ficha como diccionario, clave frente a valor y precio cero válido. |
| `logica-ficha-resultado` | Conservar: diccionario de resultados con nombre y cálculo solo en total. |
| `logica-opcional` | Conservar: clave ausente frente a cero y respaldo solo al faltar; no se acepta None en este modelo. |
| `logica-ausencia` | Conservar: ausencia explícita antes de sumar, is None frente a falsedad y representación JSON aparte. |
| `logica-auxiliares` | Conservar: separación subtotal/envío y frontera 2000, sin repetir la solución concreta. |
| `logica-variable-local` | Conservar: valor fijo local frente a parámetro recibido y retorno desde la auxiliar. |
| `logica-parametro-exterior` | Ajustar párrafo y primera pista: parámetro vinculado al objeto argumento, no copia automática; entero inmutable y cálculo no modifican exterior. |
| `logica-llamadas-independientes` | Conservar: contador por llamada inicializado dentro, cero y ausencia de acumulación heredada. |
| `logica-sin-estado-global` | Conservar: base/tasa explícitas por llamada y misma base, no acumulación de tasas. |
| `logica-encadena-retornos` | Conservar: un retorno alimenta la siguiente auxiliar, no print ni variable compartida. |
| `logica-dos-nombres-lista` | Conservar: alias sin copia, mutación intencional y límite de inferir identidad por contenidos. |
| `logica-reasigna-o-muta` | Conservar: nuevo vínculo de alias frente a modificar la lista original. |
| `logica-copia-plana` | Ajustar párrafo: copia exterior superficial suficiente para enteros inmutables y append exterior, no copia profunda de contenedores interiores. |
| `logica-conserva-entrada` | Conservar: salida nueva sin asignar sobre entrada, orden/repeticiones y límite de comprobar contenidos finales. |
| `logica-registro-compartido` | Conservar teoría de mutación intencional; ajustar segunda pista de propiedad a valor asociado a clave, sin reasignar alias. |
| `logica-valida-divisor` | Ajustar párrafo: / produce float aun con cociente de valor entero, incluido 0.0; cero numérico no es None y su representación JSON no conserva necesariamente .0. |
| `logica-valido-cero-ausente` | Conservar: clave siempre existente y ausencia como None, validación antes de comparar negativos y cero válido. |

Los cambios se proyectan solo en Python mediante `python-editorial.ts`. No se
cambia entrada, salida, gramática, solución, evaluación, ejemplos ni tiempos.
Las listas y fichas cuya mutación es intencional la conservan; explicar copia
superficial no introduce una prohibición global de mutación. La precisión de
float documenta la referencia existente, no sustituye / por // ni cambia casos.

`tests/python-reference-theory.test.ts` protege inventario y decisiones y ejecuta
modelos fijos de vinculación de parámetros, modificación frente a reasignación,
lista exterior separada, referencias interiores compartidas, alias de diccionario
y división float con cero/negativos. Las comparaciones is observan identidad del
modelo, no la deducen desde JSON ni certifican programas enviados. No se acredita
aislamiento ni ausencia de cualquier mutación intermedia de código de alumnos.

La huella previa excluye exactamente tres párrafos y dos posiciones concretas
de pistas, no listas completas de ayudas. Protege contratos, otras pistas y todos
los campos ajenos. `tests/python-reference-theory-baseline.ts` restaura esos
textos y ambos enunciados con sus contratos actuales para recuperar íntegra la
huella anterior. Las expectativas históricas mantienen sus valores y se añade
otra huella de publicación sin preparar ni activar la base. Teoría restante,
ejemplos, vocabulario global, repeticiones y D2/E/F siguen abiertos.

## Teoría local: errores, pruebas y agregados

Se revisan otras **24 comunes**, todas FUNCTION, desde la comprobación de límites
hasta la importación de un módulo preparado. Se ajustan **dos párrafos Tu tarea**
y las otras **22 actividades conservan su prosa**. Van **144/224 actividades
revisadas en teoría local** (48 propias y 96 comunes); quedan **80
comunes/proyectos**. No se tocan ayudas, contratos, código, casos ni tiempos.

| Actividad | Decisión sobre teoría local |
| --- | --- |
| `logica-localiza-error` | Ajustar: hablar del riesgo de excepción al consultar sin límites, no de un fragmento defectuoso que la plantilla no contiene; mantener la comprobación antes del acceso. |
| `logica-captura-conversion` | Conservar: auxiliar que lanza ValueError por formato y solve que captura solo ese tipo; int sin float y formato completo. |
| `logica-error-dominio` | Conservar: validar lanza el mensaje de dominio y solve lo captura; el mensaje exacto sigue en el contrato. |
| `logica-recupera-elementos` | Conservar: un try por elemento, un fallo no detiene el recorrido y valids/rechazados se construyen por separado. |
| `logica-asercion-normal` | Conservar: una aserción fallida interrumpe y no sustituye el retorno; caso conocido 4 → 12 y retorno del triple. |
| `logica-pruebas-limites` | Conservar: defecto del candidato cero, aserciones para vacío y negativos, y corrección del primer elemento real. |
| `logica-reproduce-fallo` | Conservar: caso mínimo [0], supuesto >= 0 incorrecto y comparación estricta sin perder la aserción. |
| `logica-conserva-regresion` | Ajustar: explicitar entrada y resultado esperado de las dos aserciones en vez de una flecha sin referente; la fórmula de descuento sigue en la pista. |
| `logica-factorial` | Conservar: producto inicial uno, recorrido 1..n incluido y cero sin vueltas que conserva uno. |
| `logica-fizzbuzz` | Conservar: orden 15, 3, 5, else; un valor por vuelta y cero como lista vacía. |
| `logica-mediciones` | Conservar: total, positivos y mayor en un recorrido; mayor ausente solo con lista vacía. |
| `logica-carrito` | Conservar: subtotal y descuento único; el posible decimal se debe a / y no repite aquí la teoría de división. |
| `logica-notas` | Conservar: contador de aprobados y suma para la media; None si no hay notas y sin truncar. |
| `logica-saldo` | Conservar: orden, candidato no negativo, cero válido y distinción explícita frente a la acumulación por producto. |
| `logica-gastos-registro` | Conservar: total y sumas por categoría, céntimos enteros, sin archivos todavía y diccionario vacío correcto. |
| `logica-gastos-validacion` | Conservar: validar antes de sumar, continue para el siguiente y rechazados separado de cero válido. |
| `logica-repetido` | Conservar: conjunto de vistos y consulta antes de añadir; vacío no repite. |
| `logica-deduplica` | Conservar: orden de primera aparición, conjunto más lista y prohibición de ordenar. |
| `logica-frecuencias` | Conservar: clave real por letra, inicialización solo al faltar e incremento fuera del if. |
| `logica-primer-unico` | Conservar: una primera aparición no basta; conteo completo y segundo recorrido en orden. |
| `logica-anagramas` | Conservar: tablas de 26 claves ya inicializadas, minúsculas sin espacios y comparación de todas las cantidades. |
| `logica-agrupa-registros` | Conservar: lista por categoría, orden de aparición y nombres repetidos. |
| `logica-inventario` | Conservar: acumulación por producto con ceros y negativos permitidos; distinción con la regla de saldo. |
| `logica-importa-preparado` | Conservar: módulo como archivo real, importación de transformar y prohibición de copiar su implementación. |

Solo cambian dos aperturas de `Tu tarea`; las ayudas de ambas actividades se
conservan. No se alteran contratos, evaluación, ejemplos, archivos de proyecto
ni la regla de `continue`. Las distinciones saldo/inventario y acumulación por
producto siguen explícitas para evitar aplicar una restricción global.

`tests/python-exception-theory.test.ts` protege inventario y decisiones y ejecuta
modelos fijos de límites, formatos válidos e inválidos, error de dominio,
recuperación por elemento, factorial, FizzBuzz, resumen, descuento, media,
saldo, validación con `continue`, conjuntos, frecuencias, primer único,
anagramas, agrupación, inventario negativo y llamada a una función importable.
No ejecuta código de alumnos ni certifica aislamiento, rendimiento o
terminación de programas arbitrarios.

La huella previa excluye exactamente los dos párrafos ajustados y protege el
resto de campos y ayudas. `tests/python-exception-theory-baseline.ts` restaura
ambos enunciados con sus contratos actuales y recupera íntegra la huella
anterior; la cadena de reconstrucción incorpora este eslabón antes de la
revisión de referencias. Se conservan las expectativas históricas y se añade
otra huella de publicación sin preparar ni activar la base. Teoría restante,
ejemplos, vocabulario global, repeticiones y D2/E/F siguen abiertos.

## Teoría local: módulos, archivos, JSON y agregados

Se revisan otras **24 comunes**, todas FUNCTION, desde la extracción de un módulo
hasta las sumas por intervalos. Se ajusta **una pista Python** y las otras **23
actividades conservan su teoría y ayudas**. Van **168/224 actividades revisadas
en teoría local** (48 propias y 120 comunes); quedan **56 comunes/proyectos**.
No cambian enunciados, contratos, código, recursos ni casos.

| Actividad | Decisión sobre teoría local y ayudas |
| --- | --- |
| `logica-extrae-modulo` | Conservar: regla en `reglas.py`, nombre exportado e importado coincidente y llamada desde `main.py`. |
| `logica-separa-reglas-io` | Conservar: regla pura calcula, `main` formatea; reglas sin `print` ni entrada. |
| `logica-repara-importacion` | Conservar: distinguir archivo ausente de nombre no exportado; importar `cuadrado` y no sustituir el módulo local por un paquete. |
| `logica-organiza-modulos` | Conservar: tres responsabilidades, dependencia del adaptador hacia reglas/formato, sin import circular ni efectos al importar. |
| `logica-lee-archivo` | Ajustar pista: en Python `-1` ya apunta a la última línea; retirar la normalización multilingüe. Conservar apertura, cierre y procedencia del archivo. |
| `logica-escribe-archivo` | Conservar: leer, transformar, escribir y reabrir; `w` reemplaza y UTF-8 sin salto añadido. |
| `logica-valida-json` | Conservar: analizar no valida; ficha con límite entero no negativo y exclusión explícita de `bool` pese a ser subclase de `int`. |
| `logica-guarda-recupera` | Conservar: `dump`/`load`, cierre de cada recurso y reapertura en el mismo proceso, sin prometer persistencia entre envíos. |
| `logica-recupera-archivo-invalido` | Conservar: ausencia y JSON roto requieren recuperaciones distintas; los fallos de programación siguen visibles. |
| `logica-actualiza-persistidos` | Conservar: cargar, añadir, guardar una instantánea y reabrir; sin prometer durabilidad, atomicidad ni persistencia entre procesos. |
| `logica-inventario-modular` | Conservar: `aplicar` muta el stock y devuelve rechazos; distinción con la actividad que solo suma cambios y admite negativos. |
| `logica-inventario-persistente` | Conservar: cargar, aplicar, guardar y reabrir; orden de inserción, ceros conservados y segunda llamada en proceso nuevo. |
| `logica-agenda-operaciones` | Conservar: crear y completar en reglas sin disco; completar no crea tareas. |
| `logica-agenda-almacenamiento` | Conservar: cargar estado, aplicar, guardar y reabrir; orden y claves `titulo` antes de `hecha`. |
| `logica-agenda-regresion` | Conservar: conectar carga y reglas sin perder estado; completar dos veces no duplica ni borra. |
| `logica-busqueda-binaria` | Conservar: índices originales, centro dentro del bucle y retorno del índice, no del valor. |
| `logica-insercion-posicion` | Conservar: primera posición mayor o igual, mitad abierta a la derecha y longitud si no existe. |
| `logica-ordena-insercion` | Conservar: tramo ordenado inicial, valor guardado, desplazamiento de mayores y salida nueva. |
| `logica-ordena-registros` | Conservar: puntos descendentes, nombre ascendente en empate y estabilidad cuando ambos coinciden. |
| `logica-combina` | Conservar: dos índices, menor primero, resto al agotar una lista y repeticiones. |
| `logica-palindromo` | Conservar: dos índices hacia el centro, sin normalizar mayúsculas/espacios/signos y vacío aceptado. |
| `logica-pareja` | Conservar: extremos, avance según la suma, menor `i`/mayor `j` y entrada sin modificar. |
| `logica-prefijos` | Conservar: longitud n + 1, cero inicial, reutilización del último total y sumas enteras. |
| `logica-intervalos-suma` | Conservar: prefijos, diferencia `fin + 1` menos `inicio`, orden de consultas y vacío. |

La pista compartida de lectura sigue intacta en la fuente multilingüe; la
proyección Python la sustituye solo en `python-editorial.ts` para no afirmar que
Python carece de índices negativos. Los proyectos conservan manifiestos,
recursos, artefactos y límites declarados. La reapertura descrita no se presenta
como persistencia entre procesos, durabilidad ni escritura atómica.

`tests/python-file-theory.test.ts` protege inventario y decisiones y ejecuta
modelos fijos con directorios temporales propios: importación de un módulo real,
nombre inexistente, lectura por índice negativo, JSON compacto, rechazo de
booleanos como límite, recuperación separada de ausencia/JSON roto, stock con
rechazos y ceros, agenda idempotente, búsqueda binaria, inserción a la izquierda,
ordenación por inserción, orden estable de registros, combinación, palíndromo,
pareja, prefijos e intervalos. No ejecuta envíos de alumnos ni promete
persistencia entre procesos o aislamiento.

La huella previa excluye solo la pista ajustada y protege enunciados, contratos,
las otras ayudas y las fuentes comunes. `tests/python-file-theory-baseline.ts`
restaura esa pista y recupera íntegra la huella anterior; la cadena incorpora
este eslabón antes de la revisión de errores. Se conservan las expectativas
históricas y se añade otra huella de publicación sin preparar ni activar la base.
Teoría restante, ejemplos, vocabulario global, repeticiones y D2/E/F siguen
abiertos.

## Pendientes y límites

- Los diez lotes cubren **224/224 enunciados**; la estructura está completa, no E.
- Las **224/224 explicaciones de solución** tienen revisión individual; no implica
  que todas se reescriban ni cierra la revisión de repeticiones entre superficies.
- La teoría local tiene 168/224 actividades revisadas: 48 propias y 120 comunes;
  quedan 56 comunes/proyectos y las repeticiones entre superficies.
- Quedan vocabulario en otras
  ayudas y objetivos y revisión de ejemplos ya explicados.
- PROGRAM conserva sus textos exactos y no se convierte en FUNCTION. Los proyectos
  conservan sus contratos de archivos y persistencia; se retiraron repeticiones
  internas, no se revisaron aún todas las superficies de ayuda y teoría.
- No modifica el componente de presentación ni acredita revisión visual o
  accesibilidad. La jerarquía visual, teoría desplegable y ergonomía siguen en F.
- Las revisiones están en fuentes, no preparadas ni activadas en la base. La
  validación real y publicación requieren el entorno autorizado y su respaldo.
