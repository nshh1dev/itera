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
- En Python, teoría, objetivos y coste están bajo «Teoría y objetivos», cerrado
  inicialmente; reto, condiciones y ejemplos siguen visibles. Los otros lenguajes
  mantienen la teoría visible. Antes de empezar conserva su repaso independiente.
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

Los límites declarados de las seis referencias de árboles Python se contrastaron
en Piston real, incluidos 100/500 nodos y profundidad 50 simultáneos, serialización
y sondas de memoria. No se elevaron presupuestos ni se certifica cualquier
implementación o no mutación. Procedimiento, cifras y límites de la medición en
[auditoria-python.md](auditoria-python.md#límites-reales-de-árboles-python).

### Qué significa conservar la entrada en Python

«No modificar la entrada» es una condición de la actividad y de la referencia,
no una propiedad que el juez FUNCTION pueda deducir comparando solo el retorno.
Su conductor entrega a `solve` una entrada JSON nueva por caso y serializa el
resultado; no devuelve al servidor el estado final de esa entrada. No hay una
regla AST de no mutación ni se aplican las reglas secuenciales a estas prácticas.

En las actividades centradas en copia, los campos `original`, `copia`,
`ajustados` u `ordenados` hacen observable la conservación del **contenido
devuelto**. Detectan, por ejemplo, que un alias cambió también `original`.
No prueban identidad ni impiden guardar una instantánea para devolverla mientras
se modifica la entrada real. En `python-crea-grupo`, una copia solo exterior
puede producir todo el retorno correcto y aun compartir/mutar la lista interior.
Es un requisito para razonar y revisar el código, no una garantía del veredicto.

La comprobación editorial compatible observa antes/después dentro de Piston con
referencias fijas. Incluye también `logica-dos-nombres-lista` y
`logica-registro-compartido`: allí se pide mutar intencionalmente, por lo que una
prohibición global sería incorrecta. En `python-identidad` se muta una lista
construida dentro de la función, sin alterar `data`; los booleanos serializados
tampoco prueban por sí solos identidad.

Las nueve pruebas reales de `python-mutation-contract.integration.ts` aprobaron
29 casos con observación de referencia y contraejemplos que el juez acepta o
rechaza por su retorno. La sonda pertenece solo a la verificación editorial: no
se inserta en envíos de alumnos ni modifica contratos históricos. Procedimiento
y matriz: [auditoria-python.md](auditoria-python.md#conservación-de-entrada-observada-en-piston).

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

### Protocolo integrado Python con doble HTTP

`tests/e2e/python-evaluation.spec.ts` verifica Next, endpoints, evaluación
asíncrona y PostgreSQL con un ejercicio temporal FUNCTION de dos casos (uno
visible y uno oculto), tres variantes y una cuenta nueva por escenario. No
prepara revisiones de identidades del propietario ni modifica sus rutas.
El proveedor HTTP de 2001 **no ejecuta, compila ni interpreta código**: entrega
respuestas fijas según marcadores. No sustituye la validación de las 224 fuentes
en Piston real registrada en [auditoria-python.md](auditoria-python.md).

Los **cuatro casos completos aprobaron**, sin omisiones:

- Ejemplos aprobados evalúan solo el caso visible; un envío de diagnóstico
  aprobado evalúa ambos. Ninguno crea progreso de práctica.
- Un fallo de resultado oculto muestra en navegador la depuración visible y
  el resumen 0/1, sin datos ocultos. Tanto ese fallo como un error de ejecución
  oculto dejan en API y `Submission.results` solo índice, visibilidad, veredicto
  y estado del caso oculto: no entrada, esperado, real, depuración ni stderr.
  El payload público del ejercicio tampoco contiene el marcador de entrada
  oculta. El error de ejecución se comprueba en API/base, no en una segunda
  captura o interacción del navegador.
- Dos POST concurrentes con la misma clave reciben 202 y el mismo id; solo se
  ejecutan dos casos y se registra un intento. Repetir POST/GET no reevalúa ni
  incrementa progreso. Reutilizar la clave con otro código da 409. Aprobar
  después JavaScript y TypeScript crea tres filas independientes, un intento
  por lenguaje. Es evidencia de este escenario, no una prueba exhaustiva de
  todas las carreras posibles.
- Proveedor indisponible antes de reservar: 503 sin envío. Fallo tras reservar:
  ERROR, sin progreso ni respuesta incorrecta. Repetir esa clave conserva el
  ERROR sin reevaluar; una clave nueva con proveedor disponible aprueba y deja
  un solo intento de práctica, no dos.

La pasada final completa aprobó contra la app compilada; lint, tipos y **22
pruebas focalizadas** de ciclo de ejecución/juez aprobados. Se reutilizan las
584 unitarias y build del arreglo de cierre Python: solo se añaden E2E y
documentación, sin cambios de producto ni catálogo. Lint detectó inicialmente
el nombre `use` del callback del fixture como un hook; se renombró a `runTest`
sin silenciar reglas. El fallo de infraestructura genera el evento operativo
esperado de fase `execution.case`; los avisos de Better Auth siguen visibles.

Se comprobaron cero cuentas/ejercicios `python-evaluation-` al terminar; Next,
doble HTTP y PostgreSQL privado apagados, sin iniciar Piston/WSL. No se ejecutó
`flows.spec.ts`: es serial y sus pasos editoriales crean borradores sobre
identidades instaladas del propietario. Este archivo aislado cubre el punto
de evaluación/progreso sin ampliar esas escrituras. No acredita publicación,
conservación integral de la base ni instalación/activación; las nueve
discrepancias de onboarding siguen abiertas.
