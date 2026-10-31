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

## Pendientes y límites

- Los cuatro lotes cubren **84/224 enunciados**, no el cierre editorial del recorrido.
- Quedan los demás enunciados, teoría local y de módulos, vocabulario en otras
  ayudas y objetivos, revisión de ejemplos ya explicados, tiempos y textos de rutas.
- PROGRAM no se normaliza como FUNCTION. Los proyectos conservan sus contratos
  de archivos y persistencia; su repetición editorial se revisa por separado.
- No modifica el componente de presentación ni acredita revisión visual o
  accesibilidad. La jerarquía visual, teoría desplegable y ergonomía siguen en F.
- Las revisiones están en fuentes, no preparadas ni activadas en la base. La
  validación real y publicación requieren el entorno autorizado y su respaldo.
