# Recorrido específico de Python

## Contrato

Python conserva las 176 identidades del currículo común y añade 48 actividades propias: 224 pasos (32/74/82/36 por nivel) en las mismas cuatro rutas. JavaScript y TypeScript conservan sus fuentes, orden, niveles, versiones publicadas, contratos y casos. Las competencias nuevas tienen slugs `python-*`; no heredan completados anteriores. El documento original `python-logica-y-flujo.md` no se importa ni se modifica.

La secuencia está en `src/lib/python-curriculum.ts`. `prisma/python-content.ts` compone una fila por actividad con posición, nivel, objetivo, dependencias por módulo, modalidad, ayuda y pruebas. Las referencias nuevas y sus casos independientes están en `prisma/python-lessons.ts`; errores frecuentes y ejemplos explicados, en `prisma/python-help.ts`. Las fuentes compartidas permanecen intactas.

- No hay migración: una versión puede contener solo Python. Cada lenguaje selecciona su última versión publicada que contenga ese lenguaje, no la última versión global.
- La proyección solo se activa cuando el catálogo publicado contiene `python-constante`. Preparar borradores no cambia la experiencia activa. Se publica el lote entero en una transacción. Desplegar las fuentes y activar el catálogo debe coordinarse: el marcador detecta el recorrido, no cada revisión posterior.
- Rutas, módulos, navegación, reanudación, recomendaciones y denominadores usan la misma proyección. Los ejercicios personalizados conservan su pertenencia a las rutas.
- Las categorías visibles de Python se proyectan desde la secuencia sin escribir `Exercise.category`, que sigue siendo compartido. Filtros, tarjetas, recomendaciones y progreso usan la misma categoría proyectada.
- La base conserva el orden global y los 176 elementos de las rutas comunes. No se eliminan versiones, variantes, borradores, envíos ni progreso.
- Las versiones exclusivas se consultan en administración, pero no se guardan desde el formulario de tres lenguajes. Los importadores compartidos no deben sobrepasarlas.
- Las soluciones siguen siendo privadas; el espacio de trabajo solo recibe casos visibles. Las técnicas sugeridas no se certifican mediante AST salvo las reglas iniciales ya existentes.

## Matriz de conceptos

Las filas indican conocimientos previos → introducción/práctica → integración y límites. Los contratos individuales y sus casos se mantienen junto a cada actividad en las fuentes anteriores.

| Etapa | Conocimientos previos | Introducción y práctica | Integración / límites |
| --- | --- | --- | --- |
| Iniciación | Ninguno | Instrucciones, variables, cálculo; constante por convención | Cajas sin entrada: nombre frente a literal |
| Iniciación | Textos y cálculo | Entrada entera → decimal con `float` | Punto decimal, negativos y `.0` en PROGRAM |
| Iniciación | Comparación | Funciones, parámetros, retorno y seguimiento | FUNCTION solo después de enseñar `solve(data)` |
| Principiante | Booleanos | Ramas → expresión condicional | Igualdad en el límite de edad |
| Principiante | Bucles y `append` | `break` y `continue` por separado | Centinela inicial; cero no negativo; vacío |
| Principiante | Listas y textos | `sorted` numérico, rebanadas, `split`/`join` | No mutar; fin exclusivo; espacios |
| Principiante | Listas y funciones | Desempaquetado → `enumerate` → `zip` → retorno múltiple | Repetidos y longitudes distintas |
| Principiante | Alcance y copias | Identidad y parámetro opcional seguro | Dos llamadas sin lista compartida |
| Principiante | Datos con nombre | Actualizar → borrar → parejas → lista de registros | Ausencia frente a cero; puente previo a gastos |
| Principiante | Diccionarios | Errores concretos, pruebas y regresión | Gastos en memoria, sin archivos |
| Intermedio | Ordenación numérica | Conjuntos: actualización y cinco operaciones/relaciones | Vacíos, duplicados, resta dirigida, salida ordenada |
| Intermedio | Diccionarios y listas | Frecuencias → agrupación por categoría | Crear antes de añadir; orden y repetidos |
| Intermedio | Bucle y filtro manual | Comprensión → iterador/generador/`map`/`filter` | Consumo, materialización, selección |
| Intermedio | Auxiliares y tuplas | Agregación → función clave → lambda y desempate | Extremos ausentes, estabilidad, criterios opuestos |
| Intermedio | Decimales | Formato fijo frente a redondeo | Ceros finales y redondeo nativo al par |
| Intermedio | Diccionarios planos | Consulta anidada → acumulación por producto | `None` distinto de cero, saldos negativos |
| Intermedio | Estado en memoria | Módulos → archivos → inventario persistente → valoración | Disco aislado por caso; stock no negativo |
| Intermedio | Registros y copias | Academia → contactos → agenda → transformación | Normalización, campos y conservación |
| Intermedio | Listas y comprensiones | Búsqueda binaria, recorridos, matrices y copias | Explicaciones de diagonales e intervalos |
| Intermedio | Estructuras conocidas | Pilas, colas y recursión gradual | No exigir profundidad arbitraria al introducir diccionarios |
| Avanzado | Bloques anteriores | Conservar los 36 pasos avanzados | Árboles, prioridades, exploración, dinámica y grafos |

Las ampliaciones tienen acceso libre y no bloquean algoritmos. Leer teoría o consultar soluciones no concede progreso.

## Orden, categorías y dependencias (revisión del 30 de octubre de 2026)

La secuencia fuente se revisó sin cambiar las 224 identidades ni las variantes de otros lenguajes:

- La búsqueda lineal se separó de búsqueda/ordenación y se sitúa tras listas y tuplas, como primer recorrido con índice. La búsqueda binaria y la ordenación algorítmica siguen en intermedio.
- La explicación de copia exterior/interior se adelantó al módulo de referencias, antes de agrupación y academia. `logica-copia-anidada` sigue después de matrices y su descripción ya no la presenta como primera introducción.
- El inventario se ordena como acumulación por producto (`logica-inventario`), reglas de stock (`logica-saldo`, en bases), módulos, persistencia y valoración (`python-inventario-valora`). Los enunciados distinguen saldo con negativos de stock no negativo.
- Iteradores, generadores, `map` y `filter` pasan tras comprensiones; contactos y transformación quedan después de diccionarios, copias y validación.
- El tramo intermedio se agrupa visualmente en «Colecciones y transformación», «Proyectos y persistencia» y «Algoritmos y estructuras». La agrupación es de presentación; los módulos y las cuatro rutas se conservan.
- Los prerrequisitos dejan de ser la cadena del ejercicio anterior. Cada módulo declara dependencias relevantes; dentro del módulo se conserva el orden. La validación exige que sean anteriores y sin ciclos.
- Las categorías visibles de Python se proyectan desde la secuencia (`Fundamentos`, `Colecciones`, `Proyectos`, `Algoritmos`, `Estructuras`, `Grafos`) sin escribir `Exercise.category`, que sigue siendo compartido. El catálogo, las tarjetas, las recomendaciones y el progreso usan la misma proyección.
- Las cifras por nivel pasan a 32/74/82/36: la búsqueda lineal se reclasifica como principiante y su versión Python lo refleja.

La huella de esta entrega de fuentes está registrada en `prisma/python-releases.ts`. La base activa no se ha modificado en esta revisión: la publicación atómica con `content:python -- --apply` sigue pendiente y debe coordinarse con el despliegue de las fuentes para no mostrar orden nuevo sobre contenido antiguo.

## Contratos y evaluación (revisión del 30 de octubre de 2026)

La revisión de contratos no cambia identidades ni el contenido de JavaScript/TypeScript. Las variantes Python que necesitan otro contrato conservan la versión anterior y se publican como una revisión nueva; los borradores antiguos siguen accesibles y no se ejecutan con el contrato nuevo.

- `python-constante` es una práctica guiada: la plantilla conserva `cajas` y una salida incorrecta, y el alumno debe construir la equivalencia `LAPICES_POR_CAJA`. La comprobación observa `18`; no certifica el uso de mayúsculas ni de la constante, que se explica como convención y transferencia.
- `python-decimal` lee el texto sin convertirlo. Los casos incluyen cero, negativos y resultados con `.0`; convertir con `int` o sumar textos no supera la suite.
- `python-identidad` construye una lista local desde `data`, no muta la entrada y devuelve `antes`, `original`, `copia`, `igual`, `misma` y `copiaMisma`. Así se observa el efecto de mutar un alias y de conservar una copia distinta, sin dos respuestas verdaderas constantes.
- `python-academia-resume` cubre medias fraccionarias, ausencias, cero y empates próximos. `python-academia-califica` distingue notas válidas intermedias, límites `0` y `100`, negativos y cursos no existentes. `python-contactos-edita` cubre correo, teléfono, ambos, campos no permitidos, valores no textuales y normalización.
- `logica-pruebas-limites` parte de una implementación defectuosa con `actual = 0`; las pruebas de vacío y negativos descubren el supuesto. `logica-reproduce-fallo` ya no revela en el enunciado que el defecto es `n >= 0`: el caso mínimo y la corrección aparecen en pistas progresivas. En ambas, las aserciones son una ayuda local; la suite evalúa el resultado, no un contador ni un mensaje autodeclarado.
- Las actividades de aserciones y excepciones distinguen el resultado observable de la técnica recomendada. `logica-asercion-normal` y `logica-conserva-regresion` señalan que la comprobación no certifica la presencia de aserciones; `captura-conversion`, `error-dominio` y `recupera-elementos` mantienen textos válidos, errores previstos y errores de infraestructura separados.

El modelo de árboles de Python se unifica en `value`, `left` y `right` para `logica-altura`, `logica-preorden`, `logica-niveles` y `logica-arbol-busqueda`. `logica-cuenta-nodos` ya lo describía y `logica-ancestro` repite la forma de cada nodo. Las variantes JavaScript/TypeScript conservan `v`, `izq` y `der`. El cambio de entradas y referencias Python crea una revisión nueva; no reinterpreta envíos históricos. Los casos Python limitan los árboles a 500 nodos y profundidad 50, e incluyen una cadena sesgada y un árbol equilibrado; no se elevan límites globales del ejecutor.

Las pruebas de resultado no certifican por sí solas el uso de `break`, `continue`, comprensiones, `map`, `filter`, generadores, aserciones o excepciones. En iteradores, listas nuevas por llamada e identidad, los resultados permiten observar efectos compatibles con la técnica, pero también pueden reproducirse con otras implementaciones. La técnica queda como objetivo de revisión humana. Tampoco se certifican complejidad, precisión decimal general ni dominio de un algoritmo. La auditoría individual de las **224 actividades** se registra en [auditoria-python.md](auditoria-python.md): 32 de iniciación, 74 de principiante, 82 intermedias y 36 avanzadas, con referencias, plantillas y un error representativo por actividad comprobados localmente. Permanecen abiertas las limitaciones de no mutación y los límites de ejecución en Piston real, además de la revisión editorial y visual E/F.

En principiante se conservan 59 actividades y se revisan 15. Doce casos ocultos adicionales cubren medias fraccionarias, varios artículos, acentos excluidos, emparejamiento, recuperación tras rechazo y conversiones. `logica-captura-conversion` y `logica-recupera-elementos` Python aceptan, tras `strip`, signo opcional y una o más cifras ASCII; usan `int` directamente y rechazan decimales, exponentes y guiones bajos. Los casos anteriores se conservan. Las dos actividades de alias que piden mutación intencional no se confunden con ejercicios que deben conservar la entrada. Esto no cambia la garantía del juez para código de alumnos. Las revisiones no están activadas en la base.

En las 27 intermedias de colecciones se conservan 19 actividades y se revisan ocho. Cuatro casos ocultos nuevos comprueban grupos ajenos, adultos posteriores a menores, nota presente no nula distinta de cero y primer carácter único por aparición. Las referencias conservan la entrada en los casos locales, pero el juez sigue comparando el retorno: en `python-crea-grupo`, una copia superficial podría mutar listas interiores sin cambiar el resultado esperado. Esta limitación no se presenta como resuelta ni se amplía el AST para certificar técnicas.

El siguiente subbloque revisa 26 actividades (16 proyectos y diez de registros): 18 se conservan y ocho se revisan con un caso oculto adicional por actividad. `logica-valida-json` añade `booleano.json` de solo lectura para comprobar que True no es un límite válido. Academia y contactos conservan también alumnos/fichas ajenos; el resumen incluye alumnos sin cursos; la búsqueda rechaza campos ausentes y la transformación numérica no acepta decimales. Las pruebas locales usan el conductor y juez del producto para archivos y segundo proceso, y comprueban las pruebas propias de referencia donde existen. No verifican Piston ni aislamiento. Las revisiones siguen sin activar en la base.

Las últimas 29 intermedias completan búsquedas, ventanas, matrices y recursión: 21 se conservan y ocho se revisan. Seis casos ocultos adicionales cubren signos literales, parejas múltiples y duplicados, filas vacías intercaladas, máximo interior y ventana vacía. La pareja usa menor i y, para ese i, mayor j; una enumeración independiente comprueba la referencia. Se corrigen coste de inserción, memoria de recursión con tramos y la restricción de doble precisión de prefijos. Las referencias alcanzan los tamaños máximos ensayados localmente, incluidos 900 elementos recursivos y ventanas de 100000; esto no garantiza recursos ni tiempos en Piston. D2 sigue abierta hasta auditar avanzado y completar validación real.

El primer subbloque avanzado revisa doce actividades de árboles, montículos y selección: cinco se mantienen y siete se revisan. Cinco casos ocultos comprueban nodos con valores repetidos, restricciones de antecesores, ancestro en árbol no ordenado, k igual a longitud y horarios negativos. Preorden, niveles y búsqueda describen únicamente las claves Python; no cambian las claves de JavaScript/TypeScript. Las referencias pasan 64 casos y límites locales adicionales, incluidos árboles de 500 nodos y profundidad 50 en pruebas separadas. Esto no valida aún los límites de Piston ni activa las revisiones en la base.

El segundo subbloque avanzado revisa doce actividades de combinatoria y programación dinámica: cuatro se mantienen y ocho se revisan. Siete casos ocultos distinguen paridad, orden de generación y comparación numérica, objetos de peso cero y subsecuencias con repeticiones u orden inverso. Monedas y escalera aclaran sus bases y qué cuenta como solución. Permutaciones Python admite ahora hasta seis enteros distintos entre −1000 y 1000: ocho elementos generan una salida incompatible con los límites existentes. Las versiones históricas y JavaScript/TypeScript se conservan; no se amplían límites del ejecutor. Se comprueban 68 casos y límites locales con oráculos independientes, sin afirmar validación real ni activación.

El último subbloque avanzado revisa doce actividades de grafos y optimización: tres se mantienen y nueve se revisan. Ocho casos ocultos distinguen duplicados, ciclos, caminos alternativos, prioridad dinámica, direcciones, retrocesos y propagación por cadenas. Adyacencia permite duplicados explícitamente y se limita a 4000 aristas con hasta 1000 nodos para que su salida quepa; distancias incluye la memoria de las conexiones. Islas aclara rectangularidad, vacíos y conservación. Las referencias pasan 67 casos y oráculos locales independientes. Se completa el inventario individual, no la validación real ni la activación del catálogo.

La revisión editorial posterior se registra en [claridad-python.md](claridad-python.md). Diez lotes estructuran los 224 enunciados (184 funciones, 22 programas completos y 18 proyectos) en Tu tarea, Entrada y Resultado esperado, con lista/diccionario/clave y literales Python diferenciados de JSON. Se conservan indicaciones de reparación, introducciones conceptuales, formatos exactos, reglas deterministas, límites y casos frontera. Los programas mantienen entrada estándar, impresión y textos exactos, incluidos true/false en minúsculas cuando se exigen; los proyectos conservan módulos, recursos protegidos, artefactos y persistencia entre procesos donde se declara. Las mutaciones intencionales se distinguen de conservación y copia; los resultados no certifican identidad, presencia de aserciones ni consumo de memoria. Se mantienen ayudas progresivas y explicación de solución sin repetir sus recetas antes del reto. La evaluación y los ejemplos no cambian. La estructura está completa, pero quedan otras tareas editoriales y las fases visuales; no se modifican textos educativos de otros lenguajes ni se activa el catálogo local.

El vocabulario de metadatos y ayudas se revisa mediante `prisma/python-vocabulary.ts`: 22 revisiones explícitas usan listas y claves de diccionario, append y None con su representación JSON, sin sustituir código ni salidas. Se conservan usos correctos de objeto para identidad y entidades del problema. Una huella protege todos los campos ajenos a ese lote; las explicaciones y teoría quedan fuera de esta comprobación acotada.

El mismo archivo separa `pythonSolutionExplanations`, con 28 revisiones de la prosa de solución, incluidos los 18 proyectos. Explica el código real, sus casos frontera y los límites de comparar resultados; en suma máxima declara O(n) auxiliar por el slice de la referencia, sin alterar el código. Los proyectos distinguen responsabilidades, recursos protegidos, artefactos y reapertura en el mismo proceso frente a segunda llamada oficial en proceso nuevo, sin recetas de otros retos. Huellas previas protegen todos los demás campos y la conservación del primer lote de diez explicaciones al revisar los proyectos. La revisión completa de teoría y explicaciones sigue abierta.

Los minutos orientativos se revisan en [tiempos-python.md](tiempos-python.md): 54 ajustes explícitos de `prisma/python-timing.ts` y 170 valores conservados tras revisar las 224 actividades. Distinguen tareas breves, integraciones y proyectos con persistencia; estiman lectura, resolución y comprobación, no tiempo del ejecutor ni dominio medido. Solo se modifica `content.minutes` de las identidades enumeradas, sin cambiar otras variantes, niveles, orden ni progreso. Los minutos revisados requieren la preparación/activación del catálogo para llegar a una base existente.

Los títulos/descripciones de los 57 módulos y las descripciones de las cuatro rutas tienen proyección propia en `src/lib/python-route-copy.ts`; criterios e integración en [textos-rutas-python.md](textos-rutas-python.md). Se mantienen títulos de ruta, slugs y secuencia. Listado, detalle y punto de partida usan la descripción Python solo con currículo publicado; el resumen verifica el marcador sin consultar progreso adicional ni alterar el nivel. La teoría, los ejemplos y el catálogo de actividades no cambian; las prácticas FUNCTION de academia/contactos se distinguen de los proyectos multarchivo.

La teoría de los 57 módulos está revisada en [teoria-modulos-python.md](teoria-modulos-python.md): `src/lib/python-module-theory.ts` proyecta 31 teorías y ocho ejemplos nuevos, conservando los otros 26 textos. Las comprobaciones ejecutan los 57 ejemplos fijos localmente con expectativas independientes, sin certificar Piston ni aislamiento. Se mantienen autoevaluaciones, títulos, secuencia y actividades; quedan teoría local y explicaciones de actividades y la revisión visual de F.

Las explicaciones de solución tienen 43/224 revisiones específicas: diez prácticas iniciales, 18 proyectos y otras 15 prácticas propias de fundamentos. El último lote conserva la teoría integrada en los enunciados y elimina su copia completa al explicar las soluciones; precisa copias superficiales, fronteras y retornos. Inventario y límites en [claridad-python.md](claridad-python.md). No cambia código, casos, ayudas ni tiempos; el catálogo aún no se prepara ni activa y la revisión global sigue abierta.

Un cuarto lote contrasta las siguientes 16 actividades propias, conserva la explicación de pares ya revisada y ajusta otras 15 de colecciones. Van 58/224 explicaciones con revisión específica, incluidas las primeras 32 actividades propias. Se aclaran pertenencia frente a cantidades, filtro frente a reemplazo, copia por categoría e iteradores sin cambiar código, casos, enunciados ni tiempos. Las pruebas reconstruyen la huella anterior y comprueban ejemplos editoriales sobre referencias fijas; no acreditan Piston, técnica interna ni toda posible mutación. Detalles en [claridad-python.md](claridad-python.md); el catálogo sigue sin prepararse ni activarse.

Las últimas 16 actividades propias cierran la revisión específica de sus 48 explicaciones: edición de contactos conserva la anterior y otras 15 se ajustan en `prisma/python-record-explanations.ts`. El total del catálogo es 73/224, con 151 explicaciones comunes pendientes. Se contrastan filtros, orden, redondeo nativo, notas cero/None, copias y recuperación por campo con referencias fijas; enunciados, código, casos y ayudas no cambian. Las huellas históricas se conservan y la base sigue sin prepararse ni activarse. Decisiones y límites en [claridad-python.md](claridad-python.md); E/F y la validación real siguen abiertas.

Un sexto lote revisa las 24 explicaciones comunes iniciales: doce ajustes y doce textos conservados, total 97/224 revisadas y 127 pendientes. Se contrastan los 20 programas compartidos y cuatro funciones con salidas exactas/retornos independientes; se conservan reglas conceptuales y fuentes de JavaScript/TypeScript. Los ajustes retiran Node y repeticiones, y concretan intercambio, conversiones, booleanos y retorno. Huellas y decisiones en [claridad-python.md](claridad-python.md); no se prepara ni activa contenido en la base y E/F siguen abiertas.

El séptimo lote revisa otras 24 explicaciones comunes de condiciones, bucles y listas: 23 ajustes y máximo conservado. Van 121/224 revisadas, con 103 pendientes. Se distinguen acumuladores, contadores e índices mediante trazas y fronteras, sin adelantar técnicas ni modificar contratos, referencias, casos o ayudas. Las 24 referencias fijas tienen comprobaciones editoriales independientes; se conserva la huella completa anterior mediante reconstrucción de prosa. Detalles y límites en [claridad-python.md](claridad-python.md); la base sigue sin prepararse ni activarse y E/F permanecen abiertas.

El octavo lote revisa otras 24 explicaciones de textos, auxiliares, referencias y validación: 17 ajustes y siete conservadas. Van 145/224 revisadas y quedan 79. Se distinguen None/cero/clave ausente y alias/copia, conservando las dos mutaciones intencionales y el retorno float de división válida. Las 24 referencias fijas contrastan esos estados sin certificar identidad ni toda mutación intermedia; D2 permanece parcial. La huella anterior se reconstruye sin cambiar fuentes compartidas. Detalles en [claridad-python.md](claridad-python.md); base sin preparar/activar y E/F abiertas.

El noveno lote revisa otras 24 explicaciones de pruebas, colecciones y búsquedas: diez ajustes y catorce conservadas. Van 169/224 revisadas y quedan 55. Se concreta max de Python, estados de diccionario y porcentajes, el orden de primer único y la memoria temporal de los slices de mezcla. Las 24 referencias fijas se contrastan con expectativas independientes; no se cambian contratos ni código y la huella anterior se reconstruye desde fuentes compartidas sin editarlas. Detalles en [claridad-python.md](claridad-python.md); base sin preparar/activar y D2/E/F abiertas.

El décimo lote revisa otras 24 explicaciones de ventanas, matrices y estructuras: 21 ajustes y tres conservadas. Van 193/224 revisadas y quedan 31. Los costes siguen el código real: slice inicial O(k) en ventana fija, filas vacías contadas, cola con pop(0) y lista de niveles que conserva procesados. Las 24 referencias fijas contrastan casos editoriales sin cambiar contratos ni código; se reconstruye la huella anterior con sus puentes y notas Python. Detalles en [claridad-python.md](claridad-python.md); base sin preparar/activar y D2/E/F abiertas.

El undécimo lote revisa otras 24 explicaciones de selección, combinatoria, tablas y grafos: veinte ajustes y cuatro conservadas. Van 217/224 revisadas y quedan siete. Se separan reparación de montículos y copia completa, se concretan restauración de ramas, bases de Fibonacci/escalera, objetos de peso cero y estados de ciclos. Las 24 referencias fijas tienen expectativas independientes y se reconstruye la huella anterior sin editar fuentes compartidas. No cambian código, contratos ni casos; detalles en [claridad-python.md](claridad-python.md). Base sin preparar/activar y D2/E/F abiertas.

El duodécimo lote completa **224/224 explicaciones de solución revisadas individualmente**: seis ajustes finales y Dijkstra conservado. Se precisan caminos, frontera de capacidad, edición, subsecuencia y paralelismo; las siete referencias fijas se contrastan con expectativas independientes y se reconstruye la huella anterior sin editar fuentes compartidas. No cambian código, contratos ni casos. Este cierre no completa E: teoría local, ejemplos y repeticiones entre superficies siguen pendientes, al igual que D2/F y validación real/visual. Detalles en [claridad-python.md](claridad-python.md); base sin preparar ni activar.

La revisión de teoría local empieza por 16/48 actividades propias: tres ajustes y trece introducciones conservadas. Se aclaran return alcanzado por una rama y alcance superficial de list/dict, conservando el contexto antes de practicar y las pistas progresivas. Solo cambian tres párrafos de Tu tarea; contratos de entrada/salida y demás superficies conservan huella previa, con reconstrucción histórica de ambos enunciados. Los modelos fijos comprueban identidad directamente, sin inferirla desde JSON ni certificar programas de alumnos. Las 224 explicaciones de solución siguen revisadas; teoría restante, ejemplos, repeticiones, D2/E/F y validación real/visual siguen pendientes. Detalles en [claridad-python.md](claridad-python.md); base sin preparar ni activar.

El segundo lote de teoría local revisa otras 16 propias de conjuntos, comprensiones e iteración: tres ajustes y trece textos conservados; van 32/48 propias. Se precisan llamadas de vistas, inclusión por pertenencia y map bajo demanda, con modelos fijos que observan llamadas al consumir el iterador. Solo cambian tres párrafos de Tu tarea; entrada/salida, ayudas, soluciones y ejemplos conservan huella previa y se reconstruye la entrega anterior. Quedan 16 propias y teoría común/proyectos, además de ejemplos, repeticiones y D2/E/F. Las 224 explicaciones siguen revisadas y la base sin preparar ni activar; detalles en [claridad-python.md](claridad-python.md).

El tercer lote completa la teoría local de **48/48 actividades propias**: tres ajustes y trece introducciones conservadas en las últimas 16, nueve ajustes y 39 conservadas en total. Se precisa filter bajo demanda, respaldo de get y orden de and sin ampliar contratos. Solo cambian tres párrafos de Tu tarea y se conserva entrada/salida y toda otra superficie mediante huella previa y reconstrucción íntegra de la entrega anterior. Las 224 explicaciones siguen revisadas; quedan teoría común/proyectos, ejemplos, repeticiones, D2/E/F y validación real/visual. Base sin preparar ni activar; detalles en [claridad-python.md](claridad-python.md).

El cuarto lote de teoría local revisa las primeras 24 comunes (20 programas y cuatro funciones), con tres ajustes y 21 consignas conservadas. Van 72/224 actividades, incluidas las 48 propias; quedan 152 comunes/proyectos. Se precisa == frente a = y retorno frente a impresión, incluido None de print, sin cambiar salidas PROGRAM ni contratos. Las huellas protegen todo salvo tres párrafos y reconstruyen la entrega anterior. Las 224 explicaciones siguen revisadas; teoría restante, ejemplos, repeticiones y D2/E/F continúan pendientes. Base sin preparar ni activar; decisiones en [claridad-python.md](claridad-python.md).

El quinto lote de teoría local revisa otras 24 comunes de seguimiento, condiciones, bucles y listas: dos ajustes y 22 consignas conservadas. Van 96/224 actividades (48 propias y 48 comunes); quedan 128 comunes/proyectos. Se explican conjunción, alternativas inclusivas, negación y agrupación para booleanos, sin generalizar los tipos devueltos por and/or ni adelantar la fórmula completa. Solo cambian dos párrafos Tu tarea, con contratos y demás superficies protegidos por huella previa y reconstrucción íntegra de la entrega anterior. Las 224 explicaciones siguen revisadas; teoría restante, ejemplos, repeticiones y D2/E/F pendientes. Base sin preparar ni activar; decisiones en [claridad-python.md](claridad-python.md).

El sexto lote de teoría local revisa otras 24 comunes de textos, funciones y referencias: tres párrafos y dos pistas ajustados en cuatro actividades, con las otras 20 conservadas. Van 120/224 revisadas (48 propias y 72 comunes); quedan 104 comunes/proyectos. Se precisa argumento vinculado sin copia automática, copia superficial y float de / frente a None, manteniendo mutaciones intencionales. La huella previa protege todo salvo esos cinco textos y reconstruye íntegra la entrega anterior, sin cambiar contratos, código ni casos. Las 224 explicaciones siguen revisadas; teoría restante, ejemplos, repeticiones y D2/E/F pendientes. Base sin preparar ni activar; decisiones en [claridad-python.md](claridad-python.md).

El séptimo lote de teoría local revisa otras 24 comunes de errores, pruebas, agregados y conjuntos: dos aperturas ajustadas y 22 conservadas. Van 144/224 revisadas (48 propias y 96 comunes); quedan 80 comunes/proyectos. Se precisa el riesgo de excepción al indexar sin límites y se explicitan entrada y resultado esperado de dos aserciones, sin cambiar ayudas, contratos, código, casos ni las distinciones saldo/inventario. La huella previa excluye solo esos dos párrafos y reconstruye íntegra la entrega anterior con expectativas históricas. Las 224 explicaciones siguen revisadas; teoría restante, ejemplos, repeticiones y D2/E/F pendientes. Base sin preparar ni activar; decisiones en [claridad-python.md](claridad-python.md).

El octavo lote de teoría local revisa otras 24 comunes de módulos, archivos, JSON, persistencia y algoritmos de índices: una pista Python ajustada y 23 actividades conservadas. Van 168/224 revisadas (48 propias y 120 comunes); quedan 56 comunes/proyectos. Se evita pedir la normalización de -1 que Python no necesita, manteniendo intacta la fuente multilingüe y las advertencias de persistencia. La huella previa excluye solo esa pista y reconstruye íntegra la entrega anterior con expectativas históricas. Las 224 explicaciones siguen revisadas; teoría restante, ejemplos, repeticiones y D2/E/F pendientes. Base sin preparar ni activar; decisiones en [claridad-python.md](claridad-python.md).

El noveno lote de teoría local revisa otras 24 comunes de ventanas, matrices, estructuras, recursión, intervalos, ranking y árboles: las 24 conservan su teoría y ayudas tras contraste individual. Van 192/224 revisadas (48 propias y 144 comunes); quedan 32 comunes/proyectos. Los modelos fijos verifican ventanas con negativos, copia de filas, LIFO/FIFO, delimitadores, deshacer, recursión, intervalos que se tocan, segundo máximo, Kadane, subcadena sin repeticiones, ranking y recorridos de árbol. No hay ediciones de catálogo y se conserva la huella anterior. Las 224 explicaciones siguen revisadas; teoría restante, ejemplos, repeticiones y D2/E/F pendientes. Base sin preparar ni activar; decisiones en [claridad-python.md](claridad-python.md).

El décimo lote de teoría local revisa otras 24 comunes de árboles, montículos, retroceso, programación dinámica y grafos: las 24 conservan su teoría y ayudas. Van 216/224 revisadas (48 propias y 168 comunes); quedan 8 comunes/proyectos. Los modelos fijos verifican árbol de búsqueda, ancestro común, montículos, prioridad, k mayores, actividades, coste de combinación, potencia, mezcla, subconjuntos, permutaciones, combinaciones, n reinas, Fibonacci, escalera, caminos con obstáculos, monedas, mochila con peso cero, subsecuencia común, adyacencia, alcanzables, distancias y ciclo dirigido. No hay ediciones de catálogo y se conserva la huella anterior. Las 224 explicaciones siguen revisadas; teoría restante, ejemplos, repeticiones y D2/E/F pendientes. Base sin preparar ni activar; decisiones en [claridad-python.md](claridad-python.md).

La revisión individual de teoría local está completa: **224/224 actividades** (48 propias y 176 comunes). Las ocho últimas conservan sus textos y pistas, con modelos fijos para dependencias, costes, cuadrículas, capacidad, edición, subsecuencias y paralelismo. El catálogo mantiene su huella `c772…`, sin preparación ni activación. Esto no cierra E: quedan ejemplos ya explicados, vocabulario pendiente y repeticiones entre superficies; D2, F y validación real/visual siguen abiertos. Las decisiones se recogen en [claridad-python.md](claridad-python.md).

La revisión posterior de ejemplos públicos está completa: **433/433 ejemplos de 224/224 actividades**, con nueve explicaciones ajustadas y 424 conservadas. El último bloque mejora dos explicaciones para justificar la capacidad mínima, no solo un reparto válido. La nueva huella `5a6fd6…` cambia únicamente esas dos posiciones Python y permite reconstruir la entrega anterior, sin preparar ni activar la base. Inventario y decisiones: [revision-ejemplos-python.md](revision-ejemplos-python.md). Este cierre editorial no certifica técnicas internas ni Piston real y no cierra vocabulario pendiente, repeticiones entre superficies o F.

El segundo lote de vocabulario aclara 16 campos de ocho actividades: ficha y
registro como diccionarios cuando corresponde, nombre de texto en agrupación y
valores enteros en el historial. Conserva enunciados, teoría, ejemplos, código,
contratos y fuentes comunes. La huella vigente `c89f4c…` reconstruye la anterior
`5a6fd6…`; el catálogo sigue sin preparar ni activar. Decisiones y límites en
[claridad-python.md](claridad-python.md). Vocabulario global y repeticiones siguen
abiertos.

El tercer lote de vocabulario adapta cuatro listas de prerrequisitos a claves
de diccionario, tramos consecutivos y listas. No cambia las dependencias entre
actividades ni sus contratos. Conserva las representaciones JSON y la salida
exacta true/false de los tres programas iniciales. Huella vigente `24bfc2…`, con
reconstrucción íntegra de `c89f4c…`; no hay preparación ni activación de base.
La revisión contextual de vocabulario y repeticiones sigue abierta.

El contraste de repeticiones entre superficies cubre **224/224 actividades**:
52 descripciones separadas de sus objetivos, tres descripciones corregidas por
precisión/errata, seis terceras pistas concretadas, dos objetivos y dos metas de
práctica adaptados a vocabulario Python, y 160 actividades conservadas.
No se retiran introducciones, condiciones ni pistas
progresivas; la ayuda ya evita mostrar juntos objetivos duplicados. Huella
vigente `499552…`, con reconstrucción íntegra de `6614bd…`, sin preparar ni activar la base.
Se completa este inventario, no la coherencia terminológica final de todas las
superficies ni las fases D2/F o la validación real/visual.
Inventario y límites: [repeticiones-python.md](repeticiones-python.md).

El cierre terminológico posterior aclara tres listas de prerrequisitos:
frecuencias y delimitadores piden diccionarios; altura pide diccionarios
anidados. Se conservan identidad/objeto map, objetos físicos de mochila,
propiedad de búsqueda y el valor literal mapa. Las revisiones previas y el
barrido final cubren actividades, ayudas, teoría y textos de rutas/módulos;
se cierran los dos puntos terminológicos de E en fuentes, no su jerarquía visual
ni la validación real. Huella vigente `52f835…`, con reconstrucción íntegra de
`499552…`. Dependencias persistidas, contratos y ejemplos intactos; base sin
preparar/activar. Alcance y decisiones: [claridad-python.md](claridad-python.md#cierre-del-contraste-terminológico).

## Presentación de ayudas Python

En el taller Python, «Teoría y objetivos» agrupa objetivos de práctica, teoría y
ejemplo del módulo y coste en un desplegable cerrado inicialmente. El reto,
condiciones y ejemplos siguen visibles. «Antes de empezar» mantiene su propio
repaso; pistas, errores comunes y solución permanecen fuera para no obligar a
recorrer la teoría antes de pedir ayuda. Se conservan la progresión de pistas,
la petición autenticada independiente de solución y el estado del editor.

JavaScript/TypeScript mantienen su presentación anterior; no cambia contenido,
huella de catálogo, contratos, AST, ejecución, progreso ni base. Se reutiliza
`Disclosure` y no se modifican paleta, breakpoints o preferencias. Render inicial
cubierto por pruebas; interacción/E2E y revisión visual pendientes de autorización.
Alcance y pruebas preparadas: [browser-interaction.md](browser-interaction.md#teoría-opcional-en-el-taller-python).

El taller Python también presenta con sangrado los diccionarios no vacíos y las
listas anidadas de los ejemplos. Valores simples y listas planas siguen compactos;
PROGRAM y archivos esperados conservan su texto exacto. Se reconocen «Antes de
resolver» y «Entrada y resultado» como encabezados editoriales exactos, sin
interpretar HTML o inferir sintaxis de código. Los fragmentos delimitados por una
comilla invertida a cada lado en la misma línea se presentan como código escapado;
marcas vacías, incompletas, dobles/triples o multilínea quedan literales, sin
interpretar Markdown general. Son opciones activadas solo para
Python: no modifican catálogo, huella, evaluación ni otros lenguajes. Las pruebas
unitarias cubren conservación y escapes; navegador y revisión visual pendientes.
Detalles: [browser-interaction.md](browser-interaction.md#enunciados-y-json-legible-en-python).

Los avisos de finalización Python se concentran en Progreso: completados no
equivalen a dominio y solo superar la comprobación de solución concede progreso,
una vez por ejercicio/lenguaje. Rutas conserva el resumen y repaso sin repetir
la advertencia; el cierre enlaza a Progreso. El diálogo de solución conserva el
aviso breve de su descripción, sin duplicarlo al pie. JavaScript/TypeScript
mantienen sus textos. No cambian consultas ni finalización; revisión en navegador
pendiente. Alcance: [browser-interaction.md](browser-interaction.md#avisos-de-finalización-python).

## Destino del documento de referencia

«Fusionar» evita duplicar una competencia; nunca significa importar su código sin revisión.

| Lecciones | Decisión y destino |
| --- | --- |
| 1.1 | Incorporar constante sin funciones anticipadas |
| 1.2–1.4 | Reutilizar variables y auxiliar; añadir desempaquetado después |
| 1.5–1.6 | Separar redondeo de formato; materializar listas en iteradores |
| 2.1–2.4 | Reutilizar fichas; añadir actualización explícita |
| 2.5 | Fusionar con diccionarios/conjuntos; ingredientes son colecciones |
| 3.1–3.4 | Añadir borrado, parejas y consulta anidada; recorrer diccionarios reales |
| 3.5 | Reutilizar `logica-frecuencias` |
| 4.1 | Descartar menú interactivo persistente: usar contratos deterministas |
| 4.2–4.7 | Contactos por cuatro hitos con estado observable |
| 5.1–5.4 | Añadir expresión e identidad; reutilizar pertenencia y sangría |
| 5.5 | Fusionar con decisiones y filtros existentes |
| 6.1–6.3 | Conjunto vacío, hashabilidad, `add` y `discard` |
| 6.4 | Reutilizar `logica-deduplica` sin perder orden estable |
| 7.1–7.4 | Operaciones y relaciones; no atribuir orden a un conjunto |
| 7.5 | Requisitos faltantes; corregir la separación del cofre |
| 7.6 | Fusionar con conjuntos y ranking, sin duplicar torneo |
| 8.1–8.4 | Consulta, inscripción y calificación; nota pendiente distinta de cero |
| 8.5–8.7 | Medias y clasificación; reutilizar recorridos para listados |
| 9.1–9.2 | Agregación con vacío explícito |
| 9.3–9.4 | Claves y desempates; mejorar `logica-ordena-registros` |
| 10.1–10.3 | Transformación y filtro, normalizando vocales |
| 10.4–10.6 | Generador después de iteradores; comprensión condicional y de diccionario |
| 11.1–11.4 | Retorno múltiple y lambda con clave compuesta |
| 11.5–11.7 | Reutilizar potencia, recursión y copias anidadas |
| 12.1–12.4 | Reutilizar errores, recuperación concreta y carrito |
| 13.1–13.4 | Reutilizar hitos existentes sin cambiar stock |
| 13.5 | Añadir reporte y valoración en céntimos |
| 14.1–14.2 | `map` y `filter` con materialización |
| 14.3–14.4 | Fusionar con criterios y conversiones; no prometer validar todo el estándar de correo |
| 15.1 | Búsqueda de contactos por todos los criterios |
| 15.2 | No duplicar analizador: frecuencias y normalización cubren la competencia; no inventar reglas lingüísticas |
| 15.3 | Transformador con operaciones consistentes y conversión numérica real |

## Preparación y activación

```powershell
npm run content:python
npm run content:python -- --prepare
npm run content:python -- --apply
```

Sin opciones valida fuentes sin conectarse a la base. `--prepare` crea borradores idempotentes. `--apply` requiere Python en Piston y valida referencias y plantillas, incluidos archivos y persistencia; vuelve a comprobar revisiones y publica atómicamente. Un fallo conserva la publicación anterior. Nunca se ejecuta código de alumnos en el host.

En Docker, respaldar con `npm run docker:backup` y ejecutar `node scripts/docker.mjs exec -T app npm run content:python -- --apply` sobre una imagen actualizada. No usar `content:replace` para esta ampliación. Una versión local distinta o un borrador ajeno bloquean la preparación: resolver la discrepancia explícitamente, nunca resetear la base.

`prisma/python-releases.ts` conserva las huellas normalizadas de entregas verificadas. Una publicación conocida puede recibir una revisión posterior desde fuentes sin perder protección frente a ediciones locales; una huella desconocida no autoriza sobrescribirlas. La huella de una entrega de fuentes se registra cuando la suite y el build la verifican; la activación real sigue siendo el paso que publica el catálogo y debe conservar las huellas anteriores.

## Verificación y límites

### Coste orientativo

`prisma/python-costs.ts` decide explícitamente el coste o su omisión para las 48 actividades exclusivas y 18 actividades compartidas de proyectos, módulos y archivos. Hay 53 notas concretas y 13 omisiones; se eliminan las dos fórmulas genéricas anteriores sin cambiar las fuentes JavaScript/TypeScript. El resto conserva su coste previo.

Las notas describen la referencia, no cualquier solución aceptada: distinguen recorridos, copias, memoria auxiliar y salida, caracteres comparados, operaciones hash de coste esperado y lectura/escritura completa. Mantienen el límite editorial de 200 caracteres. Las pruebas comprueban cobertura, límites y conservación de fuentes; no miden código del alumno ni certifican su complejidad.

### Explicaciones de ejemplos públicos

`pythonSharedCaseHelp`, en `prisma/python-help.ts`, contiene explicaciones editoriales para las revisiones Python de actividades compartidas. Se aplican por slug y orden del caso, solo a ejemplos visibles, sin modificar entradas, respuestas, visibilidad ni explicaciones de casos ocultos. Las fuentes y variantes de JavaScript/TypeScript permanecen intactas. Una prueba comprueba la correspondencia entre órdenes y ayudas y exige cobertura del bloque revisado; las explicaciones no se generan ejecutando soluciones.

Los 433 ejemplos públicos de las 224 actividades tienen explicación (se completaron 278 antes vacíos). Se explican las operaciones concretas, límites, orden de visita, índices, efectos sobre las copias y estados iniciales de proyectos y persistencia. En los programas que imprimen `true`/`false`, se distingue ese texto de los valores Python `True`/`False`; en FUNCTION se aclara la representación JSON cuando resulta relevante. No se presenta la observación de una salida como certificación de la técnica interna. La prueba exige cobertura completa y conservación de los casos; no acredita la calidad pedagógica por sí sola. El resto de la revisión editorial sigue pendiente en el plan.

- `tests/python-curriculum.test.ts`: identidades, orden, grupos, categorías proyectadas, prerrequisitos anteriores y sin ciclos, cobertura, compatibilidad, referencias fijas, contratos prioritarios, modelo de árboles y plantillas nuevas.
- `tests/python-install.test.ts`: doble transaccional para idempotencia, conservación y conflictos; no sustituye PostgreSQL real.
- `tests/catalog-loading.test.ts`: revisiones por lenguaje sin ocultar otros metadatos ni compartir actividad entre cuentas.
- La validación real pasa por `src/server/execution/piston.ts`. Pruebas locales de referencias no acreditan publicación ni sandbox.
- Las pruebas de resultado no certifican técnicas internas, complejidad, identidad ni presencia de aserciones. Las observaciones de salida fija requieren revisar el código; el modelo de árboles se comprueba con las entradas y referencias de la revisión Python.

## Activación en la instalación local

El 27 de octubre de 2026 se respaldó la base Docker en `.local/backups/itera-1793142065906.dump`, se prepararon 61 borradores (48 incorporaciones y 13 revisiones), se validaron las 224 referencias y plantillas en Piston Python —909 casos para cada conjunto— y se activó el lote. Preparar de nuevo creó cero borradores. Lectura posterior: Python 224, JavaScript 176, TypeScript 176; ningún borrador exclusivo pendiente.

Antes y después coincidieron 21 recuentos/huellas: las 17 tablas ajenas al contenido, ejercicios originales, versiones compartidas, variantes compartidas y sus casos. Se conservaron rutas, cuentas, sesiones, progreso, borradores, envíos y contenido histórico. No hubo migración ni sustitución global.

Las siete comprobaciones nuevas de navegador aprobaron navegación, aislamiento por lenguaje, reanudación del borrador/ruta, ejemplos sin progreso, envío real con progreso Python, claro/oscuro, teclado y ausencia de desbordamiento a 390/1440 px. Se revisaron las capturas de las rutas. Esto no equivale a una evaluación de aprendizaje con estudiantes ni certifica que una solución use la técnica sugerida.

La suite Docker completa produjo 47 aprobadas y tres fallidas: dos expectativas antiguas del denominador (30 en lugar de los 32 pasos Python) y un clic de diagnóstico sin petición POST registrada. Se adaptó el fixture del dashboard al recorrido por lenguaje, sin quitar sus aserciones. Los seis casos de dashboard/onboarding aprobaron al repetir ambos archivos completos; el fallo de diagnóstico no se reprodujo y no se modificó su código para ocultarlo. No se presenta esa repetición como una ejecución completa de 50/50.

Lint, tipos, suite unitaria completa (364/364, sin omisiones) y builds finales de Windows/Docker aprobados. Un build intermedio detectó una incompatibilidad de tipos en la comparación de huellas, corregida antes de cerrar; un intento Windows agotó su límite de 120 segundos y el reintento completo aprobó. La huella normalizada del catálogo publicado coincide con la entrega registrada, incluida la normalización del orden de propiedades JSON de PostgreSQL. Al terminar se detuvieron los servicios y Ubuntu quedó apagado, como al inicio; `docker-iniciar` recupera la imagen actualizada y el catálogo activado.

El 30 de octubre de 2026 se revisaron las fuentes del orden, los metadatos, los prerrequisitos, los contratos prioritarios y el modelo de árboles descritos arriba. Esta revisión no se ha preparado ni activado en la base: la instantánea publicada sigue siendo la del 27 de octubre. La entrega de fuentes se valida con `npm run content:python`; la activación requiere Piston y el procedimiento de publicación atómica.
