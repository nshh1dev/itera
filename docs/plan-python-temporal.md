# Plan temporal: mejorar el recorrido de Python en Itera

Estado: pendiente de implementación. Fecha: 27 de octubre de 2026.

## Mandato y condición de eliminación

El usuario solicita integrar las mejoras identificadas al comparar `python-logica-y-flujo.md` con Itera, con buenas descripciones y un flujo de dificultad gradual. Autoriza cambiar el orden de ejercicios cuando sea necesario. **El alcance educativo es exclusivamente Python:** conservar contenido, orden, niveles, contratos y progreso de JavaScript y TypeScript.

Este archivo es una herramienta temporal de ejecución. Marcar las tareas conforme se verifiquen y registrar bloqueos reales. **Eliminar este archivo en el commit de cierre únicamente cuando toda la implementación acordada esté terminada, verificada y activada en la instalación objetivo.** Si falta validación real o activación, mantenerlo con el estado pendiente. Antes de eliminarlo, trasladar los contratos definitivos y las verificaciones a la documentación permanente pertinente.

`python-logica-y-flujo.md` es material aportado por el usuario: conservarlo. No confundir su conservación con la eliminación de este plan. No importar sus soluciones directamente ni ejecutar sus fragmentos fuera del sandbox como si fueran referencias editoriales ya revisadas.

## 1. Resultado esperado

- Un alumno puede recorrer Python desde cero sin necesitar sintaxis o técnicas que todavía no se le enseñaron.
- Cada actividad tiene un objetivo observable y coherente con descripción, teoría, plantilla, pistas, solución y pruebas.
- La progresión es comprender y predecir → completar → resolver con menos ayuda → integrar. La retirada de ayuda también cuenta como aumento de dificultad.
- Las herramientas propias de Python se explican antes de aparecer en soluciones: desempaquetado, comprensiones, `key`, `lambda`, conjuntos, métodos de diccionarios, etc.
- Se aprovecha el currículo existente; no se sustituyen 176 actividades por las 78 lecciones del documento ni se importa cada lección como un ejercicio nuevo.
- Los cambios de orden no borran completados ni atribuyen competencias nuevas a ejercicios anteriores.
- La experiencia de los otros lenguajes permanece equivalente a la anterior.

## 2. Primera fase: inventario y contrato de alcance

- [ ] Leer las instrucciones vigentes y las guías de Next pertinentes antes de modificar código de aplicación.
- [ ] Registrar rama, estado de Git y archivos ajenos. Para esta implementación amplia, utilizar una rama descriptiva.
- [ ] Identificar con el usuario la instalación objetivo: Docker o nativa. No arrancar servicios automáticamente.
- [ ] Obtener una instantánea de solo lectura del catálogo publicado, cuando el entorno esté disponible y autorizado. Distinguir fuentes, borradores y versiones activas.
- [ ] Inventariar las 176 actividades definidas y sus variantes Python: slug, nivel, posición, prerrequisitos, modalidad, objetivo, plantilla, teoría y pruebas.
- [ ] Crear una matriz editorial de trabajo con una fila por actividad existente y por incorporación candidata. Ubicarla en documentación de implementación, no en archivos generados.
- [ ] Clasificar cada lección del documento como reutilizar, mejorar, incorporar, fusionar o descartar, indicando su destino y motivo.

La matriz debe registrar: conceptos ya conocidos, concepto nuevo, posición de introducción, primera práctica guiada, primera práctica independiente, primera integración, dificultad de entrada y casos límite. Una búsqueda de palabras no basta para dar un concepto por enseñado.

### Compatibilidad que debe resolverse antes de añadir actividades

Actualmente `curriculum-v2.ts` y `logic-content.ts` componen un recorrido común; las identidades nuevas y la publicación están diseñadas alrededor de tres variantes. Editar directamente el orden común o ejecutar la sustitución global no cumple el alcance solicitado.

- [ ] Trazar los consumidores del orden y del lenguaje: catálogo, rutas, anterior/siguiente, recomendaciones, prerrequisitos, progreso, denominadores, búsqueda, administración y publicación.
- [ ] Diseñar una resolución de currículo por lenguaje: conservar el recorrido común como respaldo para los otros lenguajes y aplicar a Python sus inserciones, orden y agrupación.
- [ ] Definir cómo representar actividades exclusivas de Python y cómo publicarlas sin inventar variantes vacías para otros lenguajes. Reutilizar el modelo existente si admite variantes parciales; justificar cualquier migración necesaria antes de ejecutarla.
- [ ] Definir una preparación y activación acotadas a Python. Una revisión de Python no debe reconstruir ni validar como nuevas las versiones educativas de los otros lenguajes ni alterar sus rutas activas.
- [ ] Revisar la granularidad de versión compartida: si una revisión requiere una versión contenedora nueva, conservar exactamente el contenido y los vínculos históricos de las variantes no modificadas.
- [ ] Documentar el ajuste de las reglas vigentes que hoy exigen secuencia común y tres variantes; no dejar instrucciones contradictorias.

La infraestructura compartida solo se tocará en lo imprescindible para soportar esta separación, con comprobaciones de no regresión. No rediseñar el currículo de los otros lenguajes. Si el aislamiento exige más alcance que el previsto, explicar el bloqueo y acordar el cambio técnico antes de aplicarlo.

## 3. Reglas obligatorias de progresión

1. **Ningún prerrequisito hacia adelante.** Todo concepto necesario debe estar explicado y practicado antes. Una referencia opcional también debe explicar su sintaxis o limitarse a lo ya aprendido.
2. **Una novedad principal por práctica introductoria.** No introducir a la vez recursión, diccionarios anidados y comprensiones.
3. **Puentes explícitos.** Si un ejercicio exige dos habilidades todavía no combinadas, insertar una práctica breve de combinación antes del desafío independiente.
4. **Complejidad gradual.** No aumentar simultáneamente tamaño del estado, anidamiento, número de archivos, sintaxis nueva y autonomía.
5. **Bucles antes de abreviaturas.** Comprensiones después de `for`/`append`; `lambda` después de funciones auxiliares; generadores después de distinguir colección e iteración.
6. **Datos simples antes de modelos complejos.** Escalares → listas planas → diccionarios simples → listas de registros → estructuras anidadas.
7. **Errores y pruebas antes de proyectos robustos.** No exigir validaciones que no se practicaron ni pruebas propias sin explicar aserciones.
8. **Persistencia después de estado en memoria y módulos.** No presentar archivos como requisito de la primera agenda o inventario.
9. **Las integraciones repasan; no estrenan sintaxis.** Lo nuevo en ellas es conectar habilidades conocidas.
10. **Acceso libre.** Los prerrequisitos orientan el flujo; no añadir bloqueos de acceso ni conceder progreso por leer teoría.

## 4. Secuencia pedagógica objetivo de Python

Los números siguientes son bloques de diseño, no posiciones definitivas. La matriz fijará el destino de cada slug existente, evitando ejercicios huérfanos. Reordenar Python está autorizado; conservar identidades y contratos históricos.

| Etapa / bloque | Secuencia y contenido | Condición para avanzar |
| --- | --- | --- |
| Iniciación · 1 | Instrucciones, texto, `print`, orden de ejecución y expresiones. | Predice dos líneas y distingue texto de cálculo. |
| Iniciación · 2 | Variables, actualización, auxiliar, constantes por convención y seguimiento manual. | Explica qué valor se conserva y cuál cambia; no necesita bucles. |
| Iniciación · 3 | Operaciones, paréntesis, `input`, `int`, `str`, comparación y booleanos. Introducir decimal y `float` con una práctica propia antes de exigir conversiones decimales. Explicar la diferencia entre salida Python y representación JSON. | Lee datos sencillos y distingue asignación, conversión y comparación. |
| Iniciación · 4 | Función, parámetro, `return`, sangría y adaptación a `solve(data)`. Acceso mínimo a datos preparados por nombre. | Distingue imprimir de devolver y resuelve una transformación pequeña sin receta. |
| Principiante · 5 | `if/elif/else`, `and/or/not`, límites y expresión condicional sencilla después de las ramas normales. | Cubre igualdad, inferior y superior; no necesita ternarios anidados. |
| Principiante · 6 | `for`, `range`, `while`, contador, acumulador y terminación. `break`/`continue` mediante ejemplos separados antes de usarlos. | Sigue el estado y explica por qué termina el recorrido. |
| Principiante · 7 | Listas, índices, recorrido, filtrado manual, textos, normalización, `split`/`join` y rebanadas sencillas. Introducir `sorted` sobre números antes de pedir salidas ordenadas de conjuntos; reservar `key` para después. | Conserva orden, maneja vacío cuando corresponde y no confunde posición con valor. |
| Principiante · 8 | Tuplas, desempaquetado, intercambio idiomático, `enumerate`, `zip` y retorno múltiple. | Descompone una pareja y sabe qué ocurre si las longitudes difieren. |
| Principiante · 9 | Funciones auxiliares, alcance, parámetros opcionales, valores predeterminados mutables, identidad, mutación y copias planas. | Distingue igualdad de identidad y conserva la entrada cuando el contrato lo pide. |
| Principiante · 10 | Diccionarios: literal, lectura, `get`, pertenencia, actualización, borrado y recorridos con `items`/`keys`/`values`. Cerrar con un recorrido guiado de una lista de registros simples. | Distingue clave ausente de valor cero; puede actualizar un registro. |
| Principiante · 11 | Validación, traceback, excepciones concretas, recuperación por elemento, aserciones y regresión. Integración de gastos. | Rechaza datos inválidos sin ocultar fallos inesperados y propone pruebas útiles. |
| Intermedio · 12 | Conjuntos, elementos hashables, deduplicación estable, operaciones y relaciones. Frecuencias; después introducir un diccionario con listas como valores antes de agrupación y `setdefault`. | Elige lista, conjunto o diccionario según orden, repetición y consulta. |
| Intermedio · 13 | Comprensiones: transformar, filtrar y condicional en la expresión. Luego diccionarios por comprensión. | Traduce entre un bucle conocido y una comprensión sin cambiar el contrato. |
| Intermedio · 14 | `sum`/`min`/`max`, vacíos, función como argumento, `key`, `lambda` sencilla, ordenación estable y desempates. Formato decimal y redondeo. | Ordena por dos criterios y distingue valor numérico de presentación. |
| Intermedio · 15 | Diccionarios anidados y listas de registros con accesos de profundidad fija; copias según niveles conocidos. | Puede consultar y actualizar sin recurrir a recursión. |
| Intermedio · 16 | Módulos, separación de reglas y entrada/salida, archivos, JSON y persistencia. Inventario por hitos. | Prueba en memoria antes de guardar y comprueba recuperación real. |
| Intermedio · 17 | Búsqueda, recorridos eficientes, matrices, copias de filas, pilas, colas y recursión gradual. Integraciones y agenda actual. | Explica estado, caso base, avance y coste de la estrategia. |
| Intermedio · ampliación | Iterables e iteradores, generadores sencillos, `map` y `filter`. Proyectos aplicados seleccionados. | Distingue transformación y filtro; comprende consumo y materialización. |
| Avanzado | Conservar árboles, prioridades, divide y vencerás, exploración, programación dinámica y grafos. Insertar repasos si la auditoría detecta prerrequisitos sin cubrir. | Justifica corrección, restricciones, tiempo y memoria. |

Precauciones de orden: los proyectos actuales de gastos usan claves dinámicas, por lo que deben ir después de la introducción necesaria de diccionarios. El inventario persistente debe seguir a módulos y archivos. No mover Fibonacci al bloque de variables. La profundidad arbitraria de diccionarios o listas pertenece después de recursión, no a su primera presentación.

## 5. Incorporaciones y reutilización

### Primera prioridad: mejorar y completar los puentes

- [ ] Revisar las explicaciones Python de `logica-ordena-registros`, `logica-intervalos-suma`, `logica-diagonales` y `logica-agrupa-registros` para que no estrenen herramientas sin preparación.
- [ ] Preparar actividades introductorias para constantes, desempaquetado, diccionarios, conjuntos, comprensiones y ordenación con `key`.
- [ ] Reutilizar `logica-deduplica`, `logica-frecuencias`, `logica-ranking`, `logica-notas`, `logica-potencia` y los bloques existentes de errores/pruebas cuando mantengan objetivo y contrato.
- [ ] Añadir retorno múltiple, formato, `enumerate`, `zip`, rebanadas e identidad donde la matriz identifique una competencia no practicada.
- [ ] Presentar `map`/`filter` como herramientas comparables con bucles y comprensiones, no como una obligación de escribir código más corto.

No fijar una cuota de ejercicios nuevos. Cada incorporación requiere una habilidad nueva o un puente demostrablemente necesario. Los slugs nuevos deben ser estables, descriptivos y quedar identificados como exclusivos de Python en los metadatos correspondientes.

### Proyectos aplicados

Implementar con hitos independientes y plantillas utilizables sin haber copiado la solución anterior:

| Proyecto | Hitos y contratos a concretar |
| --- | --- |
| Registros académicos | Crear alumno → inscribir en curso → registrar nota → resumen → clasificación. Representar inscripción sin nota explícitamente con `None`; excluirla del promedio, conservar nota cero y definir empates. |
| Contactos | Crear/buscar → editar/borrar → búsqueda por criterios. Un único modelo de contacto; política consistente de normalización y duplicados, campos permitidos y resultado de la mutación observable. |
| Transformador de registros | Una operación sobre un campo → varias reglas conocidas → recuperación de conversiones inválidas. Usar nombres de operación como datos JSON, conservar el original y definir campos ausentes. |

- [ ] Incorporar registros académicos como primera integración nueva de datos anidados.
- [ ] Incorporar contactos y transformador como ampliaciones después de sus prerrequisitos, sin obligar a completarlos para acceder a algoritmos.
- [ ] Evaluar el analizador de texto como práctica adicional solo si aporta una competencia distinta; definir español, puntuación, normalización y palabras excluidas.
- [ ] Aprovechar valoración y reporte de inventario como ampliación con identidad propia cuando cambie el contrato; conservar las reglas de stock actuales.

No utilizar terminal interactivo persistente. Emplear comandos deterministas y el contrato de proyectos existente cuando se necesiten varios archivos.

## 6. Norma editorial: buenas descripciones por ejercicio

Cada actividad debe contar con estos elementos, escritos específicamente para ella:

1. **Título:** acción concreta, por ejemplo «Conserva la primera aparición de cada número».
2. **Descripción breve:** qué aprenderá o resolverá; no repetir el título con otras palabras.
3. **Objetivo:** habilidad observable, no «aprender Python» ni «resolver usando los datos».
4. **Reto:** situación y tarea, entradas y tipos, salida, orden, mutación permitida y comportamiento en límites.
5. **Teoría previa:** solo conceptos necesarios, con sintaxis Python y un ejemplo diferente al reto. Explicar nombres nuevos antes de usarlos.
6. **Ejemplos:** entrada y salida exactas, acompañadas de una explicación breve del porqué. Cubrir al menos un límite significativo cuando corresponda.
7. **Plantilla:** ayuda ajustada al nivel, ejecutable y sin resolver todos los casos. Los fragmentos de sintaxis rota se presentan aparte para diagnóstico.
8. **Tres pistas progresivas:** orientar la observación → aclarar la estrategia → concretar el paso difícil. No repetir tres veces el enunciado.
9. **Solución y explicación:** coherentes con lo enseñado, con seguimiento de un caso y justificación. La solución completa sigue protegida por su consulta explícita.
10. **Errores frecuentes:** fallos reales de esa actividad y cómo reconocerlos. Complejidad solo cuando el nivel la permita.

Ejemplo de contrato adecuado para una práctica de conjuntos: «Recibes dos listas de enteros, disponibles y requeridos. Devuelve los requeridos que no aparecen en disponibles, sin repeticiones y de menor a mayor. Las listas pueden estar vacías. No modifiques las entradas». Su teoría prepara diferencia y ordenación; el objetivo no puede acreditarse antes de enseñar ambas herramientas.

- [ ] Revisar la coherencia de los diez elementos en cada actividad modificada o nueva.
- [ ] Evitar instrucciones que obliguen a adivinar: formato, campos, empates, vacíos, errores o alcance de la normalización.
- [ ] Distinguir «practica esta técnica» de «la plataforma comprueba esta técnica».
- [ ] Revisar el recorrido como alumno sin consultar las soluciones: no aprobar una secuencia porque el autor ya conoce las operaciones.

## 7. Correcciones del material de origen antes de adaptarlo

- [ ] Resolver `12` frente a `12.0` en constantes; separar redondeo de formato fijo y explicar `floor` frente a truncamiento.
- [ ] Normalizar vocales; corregir parejas mal representadas y nombres de funciones inconsistentes.
- [ ] Unificar recetas como colección de ingredientes, no mezclar conjuntos y cadenas.
- [ ] Corregir igualdad de diccionarios y coste esperado de pertenencia; definir colisiones al invertir claves y valores.
- [ ] Rehacer prácticas cuyo código no enseña lo prometido, como recorrer diccionarios sin usar uno.
- [ ] Corregir la separación del cofre del tesoro, la variable inexistente de conversión y la integración incompleta de contactos.
- [ ] Completar vacíos, empates, notas ausentes y entradas inválidas en proyectos.
- [ ] Unificar operaciones del transformador e implementar la conversión numérica prometida.
- [ ] Corregir bloques Markdown y completar casos: el documento tiene 78 lecciones, pero solo 20 líneas explícitas de casos.

Estas correcciones deben materializarse en el contenido editorial adaptado. El documento del usuario no es una especificación ejecutable ni debe modificarse para simular que la importación ya está hecha.

## 8. Evaluación y conservación de datos

- Mantener `solve(data)` y JSON para funciones. Los conjuntos pueden ser internos; las salidas deben ser serializables y deterministas. Las tuplas se convierten a arreglos, por lo que JSON no demuestra su tipo interno.
- Las pruebas deben observar los efectos: crear un contacto y devolver solo `True` no demuestra el estado correcto. Devolver el estado o comprobar operaciones encadenadas dentro del contrato preparado.
- No ampliar el analizador conceptual para forzar comprensiones, lambdas o recursión como parte implícita de este trabajo. Su alcance actual es acotado a prácticas iniciales sin entrada.
- Conservar el intercambio con auxiliar y su regla; añadir después el intercambio idiomático con otra identidad si se practica como actividad nueva.
- Reordenar conserva slugs y completados. Una competencia o contrato nuevo requiere otra identidad, no reinterpretar progreso anterior.
- Crear revisiones en borrador para contenido existente; preservar versiones, envíos, copias del navegador y borradores con sus revisiones originales.
- El porcentaje de Python puede cambiar al añadir actividades; su denominador debe incluir solo las actividades correspondientes a esa ruta y lenguaje. No cambiar porcentajes de otros lenguajes.
- Mantener concurrencia optimista, comprobación administrativa, protección de soluciones y filtrado de casos ocultos.

## 9. Áreas de código que deben revisarse

Mapa inicial, sujeto al inventario; no implica reestructurar todos estos archivos:

- `src/lib/curriculum-v2.ts`, `src/lib/fundamentals-curriculum.ts`, `src/lib/learning-modules.ts`, `src/lib/learning-paths.ts`: resolución del recorrido y orden por lenguaje.
- `src/lib/lesson-language.ts`: teoría específicamente Python y correspondencia con los bloques reales.
- `prisma/logic-content.ts`, `prisma/logic-lessons.ts`, `prisma/learning-revisions.ts`, `prisma/fundamentals-lessons.ts`, `prisma/fundamentals-project-lessons.ts`: composición, revisiones y proyectos; mantener intactas las fuentes históricas.
- `prisma/logic-install.ts` y flujo editorial: preparación, publicación y activación aisladas por lenguaje; comprobar consumidores antes de elegir diseño.
- Esquema y consultas del catálogo: investigar soporte de variantes parciales antes de proponer migraciones.
- Navegación, progreso y selectores: mostrar solo destinos disponibles y conservar contexto al cambiar de lenguaje. Si una actividad es exclusiva de Python, ofrecer una transición explícita a la ruta del otro lenguaje, no un ejercicio inexistente.
- Pruebas curriculares y editoriales existentes: ampliar con invariantes del recorrido Python y de preservación de los demás.

## 10. Orden de implementación y verificaciones

### Entrega A — Base y aislamiento
- [ ] Completar inventario, matriz de dependencias y diseño de currículo por lenguaje.
- [ ] Implementar la resolución aislada y las comprobaciones de preservación antes de incorporar contenido nuevo.
- [ ] Comparar instantáneas de slugs, orden, niveles, contratos y casos de los otros lenguajes; deben permanecer iguales.

### Entrega B — Claridad y flujo inicial
- [ ] Revisar Iniciación y Principiante de Python, reubicar actividades e introducir los puentes necesarios.
- [ ] Revisar por separado la dificultad conceptual y la retirada de ayuda de las plantillas.
- [ ] Ejecutar pruebas editoriales Python de las referencias fijas ya revisadas y de las plantillas correspondientes.

### Entrega C — Herramientas Python e integraciones
- [ ] Incorporar conjuntos, comprensiones, agregación, ordenación, retorno múltiple y demás huecos aprobados por la matriz.
- [ ] Incorporar los proyectos por hitos y sus casos independientes.
- [ ] Auditar Intermedio y Avanzado para que las soluciones y ayudas no dependan de conceptos sin enseñar.

### Entrega D — Verificación integral y activación
- [ ] Pruebas de orden: sin ciclos, prerrequisitos hacia atrás, sin slugs duplicados o huérfanos y con cobertura de todos los pasos conservados.
- [ ] Auditoría editorial manual: trazabilidad entre objetivo, teoría, ayuda, referencia y casos. Las pruebas automáticas de orden no certifican calidad pedagógica.
- [ ] Casos independientes de las soluciones: normalmente 3–6 entradas significativas, dentro del límite editorial de diez; con entrada, al menos tres distintas, un visible y un oculto. Preferir dos ejemplos visibles útiles. Sin entrada, un ejemplo basta si corresponde al contrato.
- [ ] Incluir vacíos, cero, negativos permitidos, duplicados, empates, ausencias y mutación según cada contrato; no añadir datos fuera del dominio declarado.
- [ ] Verificar retorno, archivos y persistencia cuando se prometan; comprobar que las plantillas terminan y no resuelven todos los casos.
- [ ] Ejecutar auditoría de contenido, lint, typecheck, pruebas pertinentes y build. No solapar typecheck con generación de Prisma del build.
- [ ] Comprobar en Piston real los contratos Python nuevos y revisados. Las referencias locales no prueban aislamiento ni publicación.
- [ ] Con autorización para los servicios necesarios, verificar navegación, cambio de lenguaje, progreso, reanudación de borradores y conservación histórica en la instalación objetivo.
- [ ] Revisar las pantallas afectadas en claro/oscuro, móvil/escritorio y teclado si se modifica presentación o navegación.
- [ ] Crear respaldo y ejecutar la preparación/activación acotadas a Python. No utilizar ciegamente la sustitución global existente.
- [ ] Leer el catálogo después de activar y comparar variantes, rutas y progreso no afectados con la instantánea inicial.

Toda comprobación omitida debe figurar como pendiente con motivo. No declarar la implementación finalizada si falta una verificación necesaria de publicación, aislamiento del cambio por lenguaje o conservación de datos.

## 11. Criterios de aceptación y cierre

- [ ] Todas las actividades Python tienen posición, prerrequisitos y objetivo coherentes con la matriz final.
- [ ] Ninguna práctica introductoria exige conocimientos todavía no presentados; las integraciones usan herramientas ya practicadas.
- [ ] Las descripciones explican exactamente qué hacer y cómo se reconoce un resultado correcto.
- [ ] No quedan errores conocidos del documento trasladados al catálogo.
- [ ] No se incorporaron duplicados sin un objetivo nuevo, ni se borraron ejercicios históricos o datos de alumnos.
- [ ] JavaScript y TypeScript conservan contenido, orden, niveles, contratos y progreso.
- [ ] Referencias, plantillas, publicación y navegación Python están verificadas; resultados reales y límites documentados.
- [ ] Documentación permanente actualizada en `docs/curriculum.md`, `docs/fundamentos.md` y documentos de contrato afectados. Ajustar `AGENTS.md` únicamente donde sus reglas hayan cambiado.
- [ ] Eliminar **solo `docs/plan-python-temporal.md`** al cerrar la implementación completa. Conservar el documento de origen del usuario.
- [ ] Revisar diff, preparar rutas explícitas, realizar commit y push según el flujo acordado y verificar el commit remoto. Comunicar verificaciones, limitaciones y cambios locales ajenos restantes.

## Estado de ejecución

- Plan creado; implementación no iniciada.
- Pendientes iniciales: inventario de publicación local, resolución del aislamiento por lenguaje y matriz detallada de actividades.
- No se han arrancado servicios, modificado el catálogo ni ejecutado migraciones o activaciones para redactar este plan.
