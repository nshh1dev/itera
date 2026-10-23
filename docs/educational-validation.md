# Enunciados y comprobación educativa

## Alcance

La revisión mantiene Monaco, los contratos PROGRAM/FUNCTION, las ejecuciones
asíncronas y el progreso por usuario, ejercicio y lenguaje. Cambia el contenido
del panel izquierdo y la comprobación de las primeras prácticas. No se certifica
comprensión ni se intenta impedir toda solución escrita para memorizar los tests.

## Panel izquierdo

- Título y modalidad: práctica guiada o desafío independiente, nivel y duración.
- Reto: qué hacer, datos y excepciones imprescindibles, sin recetas ni detalles
  del ejecutor. Se revisaron los 28 enunciados de Iniciación y otros enunciados
  guiados/confusos de etapas posteriores; no se afirma una reescritura de los 136.
- Sin entrada: una sola salida esperada. Los ejemplos públicos idénticos de
  versiones antiguas también se deduplican en la presentación, sin cambiar sus tests.
- Con entrada: ejemplos diferentes y formato exacto. Un JSON null sigue siendo
  una entrada; no se interpreta como ausencia de entrada de un programa.
- Antes de empezar y Comprender la idea son desplegables hermanos, sin
  desplegables anidados. Se conservan teoría, ejemplos de otros datos y repaso.
- Pistas progresivas y errores comunes se consultan bajo demanda. La solución
  completa mantiene una petición autenticada independiente y un botón explícito.

## Política versionada

`ExerciseVersion.conceptRule` es opcional (cadena vacía). La migración aditiva
`20261023170000_concept_validation` deja vacía la regla de las versiones anteriores,
que conservan su contrato. No se infiere una regla a partir del slug del envío.

Las reglas nuevas se limitan a programas guiados secuenciales sin entrada:

| Regla | Prácticas |
| --- | --- |
| Expresión numérica | Texto y cálculo |
| Valor de una variable | Nombre y cantidad |
| Actualización con valor anterior | Puntuación |
| Intercambio con auxiliar | Intercambio de valores |
| Operación entre variables | Suma, cambio, precio por unidades |
| Suma utilizada en multiplicación | Paréntesis |
| Suma numérica y concatenación | Número y texto |
| Booleano almacenado | Verdadero o falso |

Son once prácticas con diez reglas. Los nombres de variables, comentarios,
espaciado, asignaciones intermedias, `+=` y anotaciones TypeScript pueden variar.
La regla de intercambio pide una auxiliar de forma explícita; no pretende aceptar
desestructuración o asignación múltiple, conceptos que ese paso no ha presentado.

### Aislamiento

El código se ejecuta exclusivamente a través de `piston.ts`. Para inspeccionarlo,
dos programas fijos analizan su AST dentro de Piston: `ast` de Python y la API del
compilador del runtime TypeScript (también para analizar JavaScript). No hay
dependencias nuevas ni compilación/evaluación del código del alumno en Next.js.
JavaScript con regla conceptual necesita también el runtime TypeScript preparado.

El código a analizar se transporta como un dato por stdin, nunca interpolado en
el programa del analizador. Este emite una representación reducida: literales,
referencias, asignaciones, operaciones y salida. El servidor recorre esos datos
con presupuesto de nodos y profundidad; no usa eval ni ejecuta las expresiones.

El análisis sigue los valores hasta la salida y descarta operaciones sin usar.
Para las tres operaciones entre variables también comprueba sensibilidad local:
una resta anulada por multiplicar por cero o una cancelación `a-a` no acredita
que dos cantidades influyan en la salida. Esto es una ayuda pedagógica acotada,
no un sistema de prueba formal ni una protección contra evasiones deliberadas.

Las funciones, ramas, bucles, llamadas generales, interpolación de textos y otras
formas no incluidas en esta gramática no satisfacen esas reglas. No se aplican
estas restricciones a desafíos independientes o programas de etapas posteriores.
Si el analizador no puede ejecutarse, el intento es ERROR, no un fallo del alumno.

## Dos acciones distintas

- **Ejecutar ejemplos**: solo casos visibles; no exige la regla conceptual ni
  concede progreso. Permite observar que imprimir una constante coincide con ese
  ejemplo, sin anunciar que se ha resuelto la actividad.
- **Comprobar solución**: todos los casos más la regla conceptual, si la versión
  la tiene. Una salida correcta con concepto pendiente es FAILED con orientación
  específica. El contador cuenta casos de salida, no la comprobación conceptual.
- Solo un submit aprobado y no diagnóstico concede finalización. Una práctica
  antes completada no pierde su progreso cuando se publican nuevas revisiones.

La publicación administrativa y `content:replace -- --apply` usan la misma
comprobación conceptual que los envíos. Comprueban referencias y plantillas;
las versiones no se publican si falla la referencia. Los errores de infraestructura
y el filtrado de datos de casos ocultos mantienen sus reglas anteriores.

## Revisión del catálogo

La revisión automática abarca las 136 fuentes actuales. `npm run content:audit`
no usa la base ni inicia servicios. Señala casos duplicados, salidas todas iguales
en problemas variables, ausencia de ocultos, exceso de casos y algunas modalidades
inconsistentes. No sustituye una revisión pedagógica manual exhaustiva.

Hallazgos resueltos:

- Catorce programas sin entrada repetían tres veces un único caso. Ahora tienen
  un ejemplo; no se fabrica una prueba oculta indistinguible. La regla editorial
  admite esta excepción. Los problemas con entrada siguen necesitando al menos
  tres casos, ejemplos públicos y alguna prueba oculta.
- Se añaden casos ocultos escritos a mano para lectura, operaciones, retornos,
  presupuestos, listas, texto, registros, matrices, historial, árboles y prioridades.
  Las referencias no calculan los resultados que deben verificarlas.
- «Suma del uno al N» heredaba una lección que devolvía N. Su nueva versión acumula
  del 1 al N y tiene pruebas como 3 → 6 y 100 → 5050; no se cambia la identidad ni
  se atribuye retroactivamente el nuevo contrato a los intentos antiguos.
- «Lee un número y duplícalo» reconoce que la conversión ya está preparada.
- Se reclasifican como guiadas las actividades que piden completar o corregir una
  plantilla: condiciones, recorridos, índices, máximos, textos, frecuencias y búsqueda.
- Se eliminan recetas completas y referencias a títulos antiguos de los enunciados
  de búsqueda binaria, anagramas y otros pasos heredados. Las ayudas siguen disponibles.
- Potencias documenta límites, representación numérica segura y la convención de
  exponente cero; incluye pruebas adicionales de bases cero y valores distintos.

En desafíos, se evalúan los resultados, no que se copie la técnica de referencia.
Los textos de coste describen una estrategia orientativa; las pruebas no garantizan
que una solución use recursión, un montículo o una complejidad concreta.

## Actualización y conservación

Respaldar antes de migrar. La generación de Prisma no aplica migraciones. Preparar
y activar con el flujo de [currículo](curriculum.md), usando la base del modo elegido.
La preparación crea nuevas versiones en borrador, no modifica las existentes y no
sobrepasa borradores ajenos. La activación exige validar las referencias en Piston
y releer las revisiones antes de publicar de forma atómica.

Los borradores de práctica existentes siguen vinculados a su variante histórica;
no se transfieren automáticamente a una variante con un contrato cambiado. No se
eliminan cuentas, borradores, intentos ni avances para actualizar contenido.

Pruebas: `tests/concept-validation.test.ts`, `tests/learning-revisions.test.ts`,
`tests/logic-content.test.ts` y `tests/real/educational-validation.spec.ts`.

### Comprobaciones de esta revisión

- 141 pruebas unitarias/editoriales aprobadas, incluidas las referencias y
  plantillas de los tres lenguajes y los casos adversariales de las reglas.
- Las once referencias conceptuales se analizaron también en Piston real en los
  tres lenguajes; no solo mediante los analizadores locales de pruebas.
- `typecheck`, build de producción Docker y auditoría de las 136 fuentes aprobados.
- Lint sin errores; sus 97 avisos proceden de herramientas locales sin seguimiento
  (`.agents/` y `.opencode/`), no de los archivos de esta entrega.
- `npm audit` informa de una vulnerabilidad crítica previa en Next.js 16.4.0;
  propone 16.4.3. No se cambian dependencias ni se ejecuta `audit fix --force`
  dentro de esta revisión educativa.
- Respaldo Docker creado antes de aplicar la migración aditiva. La base nativa
  no se ha migrado ni se ha activado contenido en ella.
- Catálogo activado en Docker solo después de validar referencias y plantillas
  de los 136 ejercicios en Python, JavaScript y TypeScript dentro de Piston real.
  La consulta posterior confirmó 136 identidades activas y once reglas activas;
  las versiones iniciales conservan la regla vacía.
- 35 recorridos Docker aprobados, sin omisiones, con Piston real. Incluyen rechazo
  de respuesta fija y operación sin usar, aceptación de otra implementación y
  progreso independiente por lenguaje. La primera ejecución detectó una consulta
  de prueba que sumaba casos de versiones históricas; se corrigió para seleccionar
  la versión publicada más reciente y se repitió la suite completa.
- Panel revisado en claro/oscuro a 390 y 1440 px, sin desbordamiento horizontal,
  con movimiento reducido, controles de ayuda cerrados inicialmente y revelación
  de solución explícita también mediante teclado. PostgreSQL vuelve a quedar
  sin puerto publicado al terminar la suite.
