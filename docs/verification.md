# Verificación local

## Cobertura automatizada

- 45 pruebas de dominio, contenido, revisión editorial, metadatos de aprendizaje y herramientas locales.
- Las 120 referencias de Python y las 120 de JavaScript pasan los mismos 648 casos por lenguaje. Las plantillas guiadas también se ejecutan con todos sus ejemplos en ambos lenguajes. Solo la actividad inicial de observación debe venir completamente resuelta. En las actividades de colecciones, textos, máximos, búsqueda y rotación se comprueba además que el cambio indicado en el enunciado coincide con la referencia. Las enumeraciones adicionales comprueban 2911 entradas de máximos y ausencia, 1718 de búsqueda, 3066 de recorridos circulares y 1668 del lote inicial R1, por lenguaje.
- 67 pruebas de navegador con Chromium: recorridos de catálogo, registro, preferencias, borradores, evaluación, ayudas, responsive, conflictos entre pestañas, recuperación de contraseña, aislamiento entre cuentas, administración, rutas, R1, interfaz y transporte HTTP. Incluyen el orden completo de fundamentos y de Conecta las ideas, conservación de ruta al cambiar lenguaje o iniciar sesión, plantillas guiadas en ambos lenguajes y ausencia de salto al catálogo al terminar Desde cero. La suite ampliada pasa en desarrollo y producción local.
- La importación editorial se comprueba sin publicar: mantiene intacta la versión anterior, no altera lo que sirve el catálogo público, no llama al ejecutor, no duplica una revisión idéntica y se detiene ante un borrador manual distinto. Las pruebas eliminan solo los borradores que ellas mismas crean.
- Los metadatos se validan para todo el catálogo; se prueban límites, duplicados, mensajes históricos y escape de HTML. El recorrido administrativo comprueba persistencia, normalización, visualización en ambos lenguajes y que un objetivo en borrador no cambie la versión pública ni la anterior.
- El editor se sirve sin CDN y cambia de tema junto con el resto de la interfaz.
- El flujo de evaluación verifica idempotencia, progreso separado por lenguaje y ausencia de entradas, salidas y errores de pruebas ocultas en la respuesta pública.
- Se comprobó el ciclo de parada y arranque del clúster PostgreSQL del proyecto.

## Lote R1: contenido educativo inicial

Entrega del 15 de octubre de 2026: doce revisiones de ejercicios existentes, sin ampliar el catálogo ni cambiar niveles. La migración aditiva añade objetivos de práctica, enlaces de prerrequisitos, tipo de actividad y explicaciones de ejemplos. El contenido se importa como una nueva versión y conserva las anteriores. Alcance y procedimiento de publicación: [exercise-batches.md](exercise-batches.md).

- `npm test`: 45 pruebas aprobadas; 361 casos editoriales por lenguaje y 1668 entradas adicionales R1 con oráculos independientes en Python y JavaScript. Las plantillas se ejecutan sin errores y solo la observación empieza resuelta. Son referencias fijas del repositorio, no programas de usuarios.
- `npm run typecheck`, `npm run build`: aprobados.
- `npm run lint`: sin errores; tres avisos previos en plantillas locales sin seguimiento de `.agents/skills/tailwind-v4-shadcn`, no modificadas.
- `npm run test:e2e`: 67 pruebas aprobadas en desarrollo y producción local, con doble HTTP. La ejecución inicial detectó una expectativa antigua del título de la portada; se actualizó para la portada ya existente, sin modificarla. Se ajustó una nueva aserción para comprobar Monaco adjunto, no visible, en el panel móvil contraído.
- Siete recorridos R1 comprueban presentación de los doce ejercicios en ambos lenguajes, objetivos, enlaces, plantillas, ejemplos, ausencia de explicaciones ocultas incluso en el payload del servidor, soluciones diferenciadas y consulta de soluciones sin conceder progreso. Se revisaron capturas claras/oscuras a 320 y 1440 px, sin desbordamiento, con foco y movimiento reducido. Usan copias temporales independientes, que se eliminan al terminar; no publican los ejercicios del propietario.
- El recorrido administrativo comprueba persistencia y normalización de los nuevos campos, enlaces con el lenguaje elegido y conservación del contenido público e histórico. Las doce importaciones R1 se comprueban como borradores privados, idempotentes y protegidos ante borradores manuales.
- `prisma migrate deploy`: migración aplicada; `prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --exit-code`: sin diferencias. Tras E2E, los recuentos y huellas coinciden con los previos en Exercise, ExerciseVersion, ExerciseVariant, TestCase, Draft, Submission, Progress, User, HelpUsage y AuditLog, excluyendo los campos añadidos en la comparación. Permanecen 63 identidades, 63 versiones y 126 variantes en la base local.
- `npm run test:runner`: una prueba de ejecutor ausente aprobada y cuatro omitidas por Piston desconectado. No se ejecutó `test:e2e:real` por la misma razón. **La ejecución real y la publicación de R1 siguen pendientes**; las doce revisiones están en el repositorio y disponibles para importar desde administración, no publicadas automáticamente. La suite con doble no acredita aislamiento ni ejecuta código.

## Currículo completo: 120 actividades

Entrega del 15 de octubre de 2026: 57 identidades nuevas (8/19/30) y once reclasificaciones de nivel, sin reconstruir la aplicación ni borrar ejercicios. Alcance y procedimiento: [exercise-batches.md](exercise-batches.md#currículo-completo-de-63-a-120-actividades).

- `npm test`: 45 pruebas aprobadas; 648 casos editoriales por lenguaje compartidos por las 120 referencias de Python y JavaScript. Las referencias y plantillas nuevas se ejecutan y comparan por valor; solo la observación `tu-primer-resultado` empieza resuelta. La prueba de progresión de ayuda comprueba que las plantillas nuevas no resuelven por sí solas todos los casos.
- `npm run typecheck`: aprobado. Ayudante de composición (`prisma/educational-exercise.ts`), control de niveles (`levelOverrides` en `prisma/content.ts`), metadatos fusionados (`prisma/learning-metadata.ts`) y órdenes de las cuatro rutas (`src/lib/learning-paths.ts`) sin errores de tipos.
- `npm run build`: aprobado. Prisma regenerado y las 19 rutas compiladas y generadas.
- `npm run lint`: sin errores; los mismos tres avisos previos de plantillas locales sin seguimiento en `.agents/skills/tailwind-v4-shadcn`, no modificadas.
- `npm run db:seed`: base local con 120 identificadores publicados; se insertaron las 57 identidades nuevas sin tocar versiones, borradores, envíos ni progreso anteriores (el seed omite slugs existentes).
- `npm run content:paths -- --apply`: las cuatro rutas quedan en 8/37/40/35 pasos. El script exige contenido publicado y no toca datos de estudiantes.
- El nivel publicado de las once identidades reclasificadas sigue siendo el anterior (37/45/38) en la base local: cambiarlo exige una nueva versión publicada y la publicación valida referencias en Piston. **Queda pendiente reponer Piston, importar y publicar cada identidad afectada, y validar las 57 referencias nuevas en el sandbox real.**
- `npm run test:e2e`: **no ejecutada en esta entrega**. Requiere iniciar un servidor propio y Chromium; no se arrancó el servidor del usuario. Se actualizaron las expectativas de ruta de las actividades reclasificadas en `tests/e2e/onboarding.spec.ts`, pero no se pudieron comprobar en navegador.
- `npm run test:runner` y `npm run test:e2e:real`: no ejecutadas por Piston/Docker detenidos (`npm run doctor` confirma Docker no disponible).

**Pendiente y no incluido:** la revisión pedagógica de los 51 ejercicios anteriores que R1 no cubrió. El currículo llega a 120 actividades, pero su revisión editorial por lotes (R2–R6) sigue abierta.

### Guía de aprendizaje completa y navegación entre ejercicios

Ajuste posterior del 15 de octubre de 2026: se detectó en la interfaz que las versiones publicadas antiguas mostraban los textos de reserva «Esta versión todavía no tiene un objetivo editorial descrito» y «Esta versión no especifica conocimientos previos».

- Causa: el seed omite los slugs existentes, así que los campos editoriales añadidos por la migración `20261015000000_educational_content` quedaron vacíos en 45 versiones publicadas.
- Arreglo de datos: `scripts/content-metadata.ts` (`npm run content:metadata -- --apply`) completa únicamente los campos vacíos desde el catálogo. En la base local completó 45 versiones; `tu-primer-resultado` conserva `prerequisites` vacío a propósito y la guía muestra el mensaje de que no se necesitan conocimientos previos.
- Navegación: `previousExerciseSlug` en `src/lib/learning-paths.ts` y dos botones con flecha en la cabecera del espacio de práctica permiten ir al ejercicio anterior y al siguiente, respetando el orden de la ruta cuando se llega desde ella y el orden del catálogo en caso contrario. Los extremos quedan deshabilitados. Se mantiene el enlace «Continuar con otro ejercicio» después de resolver.
- `npm test` (45 pruebas), `typecheck`, `build` y `lint` aprobados. `npm run content:paths` sin `--apply` y `npm run content:metadata` sin `--apply` sirven como vista previa; ninguno toca datos de estudiantes.
- **No verificado en navegador:** no se ejecutó `npm run test:e2e` (requiere iniciar un servidor propio). La nueva navegación se comprueba solo con pruebas unitarias de la función de orden.

## Interfaz de aplicación

La dirección visual usa un marco compartido para páginas y práctica: sidebar de 224/64 px con preferencia local, navegación móvil en diálogo, listas compactas sin divisores repetidos y superficies tonales claras/oscuras. Los tokens de `src/app/globals.css` concentran radios de 10–12 px para controles y selecciones, 16 px para paneles y 20 px para superficies destacadas; sombras discretas para controles, superficies destacadas, menús y diálogos. Inicio destaca la continuación, el catálogo agrupa filtros, las rutas destacan nombre y progreso, y configuración agrupa campos sin separadores largos. No se añadió IA, ninguna dependencia ni cambios de esquema, autenticación, rutas o contenido editorial.

El editor conserva Monaco local, todo el flujo de borradores y evaluación, los redimensionadores y los resultados contraíbles. El enunciado y los resultados usan una superficie tonal; los ejemplos tienen bloques diferenciados y el código mantiene bordes estructurales rectos y su anchura útil. Monaco usa `--editor-background`: blanco en claro y `#1C1C1E` en oscuro, en vez del negro base. Se mantienen la normalización de hexadecimales y el observador de clase raíz para sincronizar el tema.

`tests/e2e/interface.spec.ts` añade siete recorridos de interfaz: persistencia de sidebar al navegar y cambiar de tamaño, navegación móvil y restitución del foco, filtros activos sin perder lenguaje, ajuste de paneles con teclado, tema de Monaco en ambas direcciones, opciones del editor, confirmaciones y superficies de Inicio, catálogo, rutas y detalle de ruta en ambos temas. Comprueba conservación del código y ausencia de desbordamiento horizontal a 320, 768, 1024 y 1200 px, y acceso a la comprobación con 620 px de alto. El recorrido visual adicional captura las cuatro páginas a 1440 y 390 px; el flujo autenticado captura Configuración y Mi progreso en ambos temas. Incluye movimiento reducido; no sustituye una auditoría completa de accesibilidad ni pruebas en Safari o dispositivos táctiles reales.

Prueba enfocada: `npx playwright test tests/e2e/interface.spec.ts`. Las capturas `ui-workspace-*.png`, `ui-confirmation*.png`, `ui-home-*.png`, `ui-catalog-*.png`, `ui-paths-*.png`, `ui-path-*.png`, `ui-progress-*.png` y `ui-settings-*.png` se generan en `.local/screenshots/`, sin incorporarlas a Git. Se revisaron las capturas de las seis pantallas principales, editor, navegación y confirmación, tanto en claro como en oscuro.

Los colores base se conservan. En oscuro, el lienzo usa `#111113`, los paneles de lectura `#161618`, el editor y superficies principales `#1C1C1E` y los controles `#242426`; `#000000` permanece disponible como base. Los tokens adicionales de texto azul, éxito y texto sobre fondos tonales evitan usar acentos o grises con contraste insuficiente; botones, enlaces y estados mantienen funciones diferentes. Los diálogos comparten overlay negro, superficie elevada, animación breve y gestión de foco de Radix. Una revisión puntual con axe-core, sin añadir dependencias, no encontró infracciones automáticas WCAG A/AA en 18 estados públicos: Inicio, catálogo, rutas, detalle de ruta, progreso invitado, editor, diálogo de pistas, editor móvil y navegación móvil, en ambos temas. Se esperó al final de las animaciones con movimiento reducido para no medir colores durante el fade. No incluye un lector de pantalla ni certifica conformidad WCAG.

Verificación del 15 de octubre de 2026 tras el refinamiento: lint sin errores (tres avisos previos en plantillas de `.agents/skills`), tipos, 39 pruebas unitarias/editoriales y build aprobados; las 49 E2E pasan tanto con `next dev` como con `next start`, sin reintentos ni cambios de timeout de Playwright. Una repetición detectó que la comparación histórica editorial dependía del orden implícito de las relaciones de PostgreSQL: se añadió `orderBy` a variantes y casos en las lecturas de prueba antes/después, conservando la igualdad completa de todos los campos; no se cambió ninguna consulta de la aplicación. Durante el recorrido administrativo de desarrollo reapareció el aviso histórico `The destination stream errored while writing data`; todas las comprobaciones de persistencia y entrega observada pasaron y no apareció en la ejecución de producción final. Su causa sigue sin diagnosticarse y no se considera corregida por este trabajo visual. PostgreSQL y Monaco están disponibles; Docker y Piston no: estos resultados usan el doble HTTP, no acreditan aislamiento o ejecución real.

No queda una segunda iteración visual obligatoria en las pantallas revisadas. Para una revisión posterior con uso real conviene priorizar enunciados extensos en móvil y Mi progreso con historiales largos; esta entrega comprueba la adaptación y las interacciones, no sesiones prolongadas ni grandes volúmenes de actividad.

### Refinamiento exclusivo de Light Mode

Segunda revisión del 15 de octubre de 2026: el lienzo claro pasa a `#F0F0F3`, las superficies principales a blanco, las secundarias conservan `#F5F5F7` y las anidadas usan `#EBEBEF`. La sidebar usa `#EDEDF1`; los contornos de panel usan `#DADAE1`. Las reglas nuevas se limitan a `:root:not(.dark)` y reutilizan `surface-panel`, `surface-feature`, `nested-surface` y las clases compartidas existentes. Los bordes interiores se dibujan con sombras inset de 1 px para conservar exactamente las dimensiones de los controles y los paneles redimensionables. Solo el destacado de Inicio añade profundidad exterior discreta.

Se definen los paneles de Inicio, filtros, rutas, métricas y configuración; los campos tienen relleno secundario dentro del panel blanco, los controles segmentados distinguen bandeja y selección, y los ejemplos y resultados tienen contorno interior. El editor conserva su superficie blanca y el área útil; enunciado, información anidada, resultados y barra inferior se diferencian tonalmente. No cambia lógica, backend, contenido ni rutas.

Build, TypeScript, 39 pruebas unitarias/editoriales y las 49 E2E contra producción local aprobados. Lint sin errores, con los mismos tres avisos de plantillas de skills. Se revisaron capturas claras de escritorio y móvil; once capturas oscuras coinciden byte a byte con las anteriores (Inicio, catálogo, rutas, detalle de ruta, progreso, editor y confirmación). Configuración conserva el aspecto oscuro, con un correo distinto del usuario temporal. Axe-core no detectó infracciones automáticas en los mismos 18 estados públicos. Las E2E siguen usando el doble HTTP de Piston; esta revisión no valida ejecución real.

### Desplegables integrados

Los selectores de filtros, preferencias, administración y lenguaje del editor comparten un picker redondeado con superficie elevada, sombra discreta, selección neutra y marca azul. Se usa CSS `appearance: base-select` dentro de `@supports`, conservando los select nativos, etiquetas, envío de formularios y teclado; navegadores sin esta API conservan el selector del sistema. Verificado con Chromium: apertura en claro/oscuro, Escape, flechas, Enter y aplicación del filtro; build y 49 E2E en producción local aprobados. Lint sin errores y con los tres avisos previos. Capturas abiertas en `.local/screenshots/ui-select-light.png` y `ui-select-dark.png`.

## Sandbox real

Revisión del 14 de octubre de 2026 tras preparar las versiones didácticas de los retos originales: lint, TypeScript, 20 pruebas unitarias/editoriales, build y los 15 recorridos E2E con doble HTTP aprobados, tanto con `next dev` como con `next start`. Desde cero conserva 8 pasos y Construye tus bases tiene 21. Las revisiones están disponibles para importar desde administración; no se han publicado automáticamente en la base local. Piston no estaba disponible: no se verificó la ejecución real del nuevo contenido.

Se corrigió una doble navegación/refresco al guardar versiones administrativas: cancelaba la respuesta que `revalidatePath` ya estaba actualizando y producía un error de streaming. La prueba espera ahora a que termine la respuesta de la acción y pasa sin ese error en desarrollo y en producción local.

La entrega de objetivos y prerrequisitos aplicó la migración aditiva el 14 de octubre de 2026. Se compararon recuentos y huellas de siete tablas antes y después, excluyendo únicamente los dos campos añadidos: no cambió el contenido existente. Las 45 versiones históricas mantienen metadatos vacíos; no se publicaron revisiones automáticamente. También se corrigió una carrera de hidratación detectada al editar un objetivo existente: el formulario espera a tener sus manejadores React antes de aceptar cambios.

Verificación de esta entrega: lint, TypeScript, 25 pruebas unitarias/editoriales, build y 15 recorridos E2E aprobados en desarrollo y producción local. Repetir una importación idéntica ya no revalida páginas sin cambios: elimina una actualización de streaming innecesaria que bloqueó una ejecución de producción. Docker y Piston siguen sin estar disponibles; las pruebas E2E usan exclusivamente el doble HTTP.

Entrega de conjuntos y mapas del 14 de octubre de 2026: lint, TypeScript, 27 pruebas unitarias/editoriales, build y 20 recorridos E2E aprobados en desarrollo y producción local. El catálogo llega a 49 ejercicios y Conecta las ideas a 12 pasos. Los recorridos comprueban las cuatro plantillas nuevas en ambos lenguajes y la importación privada, idempotente y protegida ante otros borradores de Una sola vez y Cada letra cuenta. Tras el seed y la actualización de rutas, los recuentos y huellas de las versiones anteriores, variantes, pruebas y datos de estudiantes no cambiaron. No se publicaron revisiones antiguas ni se verificó el catálogo ampliado en Piston, que sigue sin estar disponible.

Entrega de filtrado y comparación de textos del 14 de octubre de 2026: lint, TypeScript, build, 30 pruebas unitarias/editoriales y 24 recorridos E2E en desarrollo aprobados. Catálogo de 53 ejercicios, 272 casos por lenguaje y Conecta las ideas con 16 pasos. El seed y la actualización de rutas conservan las huellas y recuentos del contenido anterior y los datos de estudiantes. Las revisiones de palíndromos y anagramas se comprueban como borradores temporales sin publicarse.

**Incidencia histórica de la entrega de textos, diagnosticada en la octava entrega:** dos ejecuciones completas dieron 18 recorridos aprobados, uno fallido y cinco no ejecutados. `flows.spec.ts` se detenía en `await (await save).finished()` tras el segundo guardado administrativo. La traza registraba HTTP 200 sin que Playwright notificara el cierre. Las cinco importaciones posteriores quedaban sin ejecutar por la secuencia serial. Esto no demostraba por sí solo un bloqueo del servidor.

### Cierre de acciones: diagnóstico y regresión

La instrumentación temporal del servidor confirmó eventos `finish` y `close` con `writableFinished=true`; la del navegador confirmó la resolución de `ReadableStreamDefaultReader.closed` incluso cuando `Response.finished()` seguía pendiente. También se reprodujo al publicar y ocultar. Desactivar la compresión o reducir la revalidación no solucionó esa espera, por lo que esos cambios experimentales no se conservaron. No se atribuye una causa interna concreta a Chromium o Playwright sin un reproductor independiente del framework.

En la octava entrega, `tests/e2e/action-stream.ts` observaba reader.closed y comunicaba su resolución o error al proceso de pruebas, conservando los eventos incluso al navegar tras crear un ejercicio. No clonaba la respuesta ni modificaba read/cancel. Dos pruebas controlaban fragmentos pendientes y errores. Esa señal resultó insuficiente para distinguir cancelación de EOF: la duodécima entrega, descrita más abajo, corrige la interpretación y observa también las lecturas y cancelaciones nativas.

El formulario administrativo usa la acción de formulario de React, y los botones de publicación y ocultación usan transiciones sin refrescos redundantes. Se conservan las revalidaciones del servidor, los permisos y la auditoría. La regresión verifica tres versiones guardadas, publicación y ocultación sin acciones canceladas, y las cinco importaciones editoriales con sus protecciones históricas.

Verificación de la octava entrega: lint, TypeScript, build y 30 pruebas unitarias/editoriales aprobados; 26 pruebas E2E aprobadas en desarrollo y en dos ejecuciones completas consecutivas de producción local, sin reintentos ni aumentos de timeout. Esto elimina el bloqueo de la verificación, no acredita la ejecución real: Docker y Piston siguen pendientes.

### Máximos y ausencia de resultado

Novena entrega: tres actividades nuevas y revisión de El segundo lugar con dos recorridos explícitos. Se distingue ausencia de cero, se inicializa el máximo con un valor real y se comprueba None/null antes de comparar candidatos. La ruta intermedia tiene 19 pasos; el catálogo editorial, 56 ejercicios y 296 casos por lenguaje. Los casos originales del reto permanecen y la revisión existente solo se prepara como borrador.

La enumeración adicional recorre todas las listas de longitud 0 a 5 sobre −2, 0 y 1; para el máximo bajo un límite usa cinco límites. Compara las cuatro referencias en ambos lenguajes con resultados independientes (2911 entradas por lenguaje). No ejecuta programas enviados por usuarios.

Lint, TypeScript, build, 33 pruebas unitarias/editoriales y 29 pruebas E2E aprobados en desarrollo y producción local. La primera ejecución detectó doce casos en la revisión frente al máximo editorial de diez: se ajustó el contenido y se añadió una comprobación del límite, sin ampliar el contrato administrativo. Las seis importaciones editoriales pasan, incluida la privada e idempotente de segundo-mayor. En desarrollo apareció `The destination stream errored while writing data` durante el recorrido administrativo; las acciones monitorizadas cerraron sin error y la suite pasó. No apareció en producción. El origen de ese mensaje sigue sin determinarse y no se considera resuelto por estas pruebas.

Tras seed, rutas y E2E, los recuentos y huellas de las filas anteriores de Exercise, ExerciseVersion, ExerciseVariant, TestCase, Draft, Submission, Progress, User, HelpUsage y AuditLog coinciden con los previos. Se añadieron únicamente tres ejercicios, tres versiones, seis variantes y 38 casos; el contenido público anterior y los datos de estudiantes permanecen intactos. Docker y Piston no están disponibles: no se publicó la revisión ni se validó la ejecución real del catálogo ampliado.

### Índices y búsqueda binaria

Décima entrega: cuatro actividades nuevas antes de Busca a la mitad presentan while, avance del índice, punto medio entero y descarte de mitades. Se explican los límites inclusivos, el intervalo vacío y la diferencia entre índice y valor, incluido 0 como índice válido y −1 como ausencia exigida por este reto. La revisión conserva los cinco casos originales y los amplía hasta diez. Se prepara como versión privada, sin cambiar el contenido público previo. Conecta las ideas llega a 23 pasos; el catálogo editorial, a 60 ejercicios y 326 casos por lenguaje.

La prueba adicional de búsqueda cubre 1718 entradas por lenguaje: contadores de 0 a 100, listas cortas, intervalos desplazados y todas las consultas seleccionadas sobre los subconjuntos ordenados de cinco números, además de ocho consultas sobre una lista de 10000 elementos. La búsqueda lineal proporciona el resultado esperado del reto. Un Proxy en JavaScript y una lista instrumentada en Python rechazan índices inválidos, incluidos índices negativos, y exigen como máximo 2 × ceil(log2(n + 1)) lecturas en la referencia binaria. Para el paso aislado de descarte se admiten hasta dos lecturas. Los timeouts de la prueba limitan también los bucles que no terminen. Estas comprobaciones ejecutan únicamente referencias del repositorio: no verifican ni ejecutan fuera del sandbox programas de usuarios.

Lint, TypeScript, build, 36 pruebas unitarias/editoriales y 32 E2E aprobados tanto en desarrollo como en producción local. Las siete importaciones editoriales pasan, incluida la de búsqueda binaria, con idempotencia y protección de borradores manuales. No se observó el mensaje de error de stream de la novena entrega en estas ejecuciones; sin un diagnóstico no se considera corregido.

Tras seed, actualización de rutas y E2E, coinciden los recuentos y huellas de las filas previas de las mismas diez tablas comprobadas en la entrega anterior. Solo se añadieron cuatro ejercicios, cuatro versiones, ocho variantes y 50 casos. No se modificaron versiones públicas anteriores, borradores, progreso, envíos ni cuentas. Piston y Docker siguen sin estar disponibles, por lo que continúan pendientes la validación real y publicación de revisiones.

### Recorridos circulares y rotación

Undécima entrega: tres actividades antes de Un giro a la derecha presentan resto respecto a un tamaño positivo, avance circular y una vuelta desde otro índice. El reto reduce k y calcula un inicio no negativo, evitando las diferencias del resto de números negativos entre Python y JavaScript. El caso vacío termina antes de calcular restos. La revisión conserva los cinco casos originales y amplía a diez; no sobrescribe la versión pública. La ruta intermedia tiene 26 pasos; el catálogo editorial, 63 ejercicios y 347 casos por lenguaje.

La enumeración adicional cubre 3066 entradas por lenguaje: tamaños de 1 a 20, pasos de 0 a 60, cada siguiente índice válido, listas sobre −1, 0 y 2 de longitud hasta cuatro, todos sus inicios válidos y diez valores de k, incluido un millón. Los oráculos usan resta de vueltas completas, segmentos para el recorrido y movimientos del último al primero para la rotación. Un Proxy y una lista instrumentada comprueban índices válidos, una lectura por elemento, entrada sin modificar y una salida distinta incluso con desplazamiento cero. Solo se ejecutan referencias del repositorio.

Seed y rutas añadieron tres ejercicios, tres versiones, seis variantes y 32 casos. Se corrigió una frase únicamente en la actividad recién creada recorre-en-circulo, protegida por la comprobación de que su versión no existía antes de esta entrega; no se intentó actualizarla mediante el seed, que omite slugs existentes. Después de ambas suites, las filas previas de las mismas diez tablas conservan recuentos y huellas. Los datos de estudiantes y contenido público anterior permanecen intactos.

Lint, tipos, build, 39 pruebas unitarias/editoriales y 35 E2E en desarrollo aprobados. En producción local hubo 26 aprobados, un fallo y ocho no ejecutados. Los recorridos nuevos y el orden de ruta pasan; las importaciones editoriales quedan sin ejecutar por la secuencia serial. El fallo está en la comprobación final de `actionFailures` del recorrido administrativo: la traza registra HTTP 200 y `net::ERR_ABORTED` para publicación y ocultación. Las acciones habían superado el observador de cierre del lector y las comprobaciones de persistencia. Esa discrepancia no demuestra por sí sola un error de servidor ni autoriza a ignorar cancelaciones. No se quitaron comprobaciones ni se añadieron reintentos o tiempos de espera mayores. La causa queda pendiente de diagnóstico antes de ampliar el recorrido con pilas. Docker y Piston siguen sin estar disponibles.

### EOF observado y avisos de DevTools

Duodécima entrega, 15 de octubre de 2026: el fallo administrativo se reprodujo con EOF nativo confirmado y sin llamadas a cancel(). Un reproductor independiente (`node scripts/diagnose-action-stream.mjs`) usa un servidor HTTP en un puerto local asignado automáticamente, Chromium y veinte respuestas estáticas de texto sin comprimir/gzip. Introduce deliberadamente 250 ms entre la entrega de datos y el cierre para hacer visible la discrepancia de diagnóstico; no accede a PostgreSQL, al ejecutor ni a datos de estudiantes. En la ejecución local, las veinte respuestas terminaron en el servidor (`serverFinished=true`) y llegaron completas al navegador (`nativeEof=true`, `intact=true`), mientras la señal de red fue `net::ERR_ABORTED`. No hace falta navegar ni usar Next o React para reproducirlo. No se ha determinado la causa interna del aviso de Chromium/Playwright.

Se descartan dos cambios experimentales: desactivar la compresión y limitar las rutas revalidadas no eliminaron el fallo. Tampoco se confirmó la hipótesis inicial de EOF gzip antes del cierre HTTP: las pruebas controladas permanecen pendientes hasta que el servidor termina la respuesta. No se conservaron esos cambios de configuración o servidor.

Corrección de la interpretación usada en la octava entrega: `reader.closed` también puede resolverse al cancelar el lector, por lo que no prueba por sí solo EOF. El observador actualizado espera un resultado `read().done === true` de la lectura solicitada por el consumidor y registra cancelación del lector o del cuerpo, errores y estado pendiente por separado. Conserva el mismo lector, entrega las promesas originales y no lee datos adicionales ni clona respuestas. Las pruebas demuestran que cancelar un lector con una lectura pendiente puede resolver tanto esa lectura con done como reader.closed: no se acepta como entrega correcta.

La comprobación de `requestfailed` no se elimina ni se ignora globalmente ERR_ABORTED. Se correlaciona cada objeto Request con su entrega observada: solo se clasifica ese aviso concreto como discrepancia de DevTools cuando **esa misma petición** tuvo HTTP 2xx y EOF nativo sin error ni cancelación. Se adjunta `devtools-aborts-with-native-eof` con URL temporal, estado HTTP, aviso y estado nativo, sin cookies, credenciales ni contenido. Cualquier petición fallida no correlacionada, otro error de red, código HTTP no satisfactorio o stream incompleto sigue haciendo fallar la prueba. Las importaciones también comprueban ahora todas sus entregas, además del recorrido administrativo.

Nueve pruebas controladas y HTTP real verifican: fragmento sin EOF, cierre real, error de lectura, cancelación por lector/cuerpo, respuesta completa sin comprimir/gzip, conexión cortada tras un fragmento, cancelación del consumidor y HTTP 503 aunque su cuerpo llegue a EOF. Los fixtures HTTP usan confirmaciones del consumidor para cerrar o cortar la respuesta, no pausas ni reintentos. Se conservan las comprobaciones de persistencia e interfaz, los permisos y la validación de referencias del servidor.

Lint, TypeScript, build y 39 pruebas unitarias/editoriales aprobados. Las 42 E2E pasan en desarrollo y en dos ejecuciones completas consecutivas de producción local, incluidas las ocho importaciones editoriales que quedaron sin ejecutar en la entrega anterior. No se aumentaron tiempos de espera ni se configuraron reintentos. No se modificaron contenido, rutas, esquema ni configuración de la aplicación. Esto resuelve el falso fallo de verificación, no acredita la ejecución real del catálogo: Piston y Docker siguen pendientes.

Las pruebas de navegador de `npm run test:e2e` usan un doble HTTP de Piston en el puerto 2001. Verifican la integración, no el aislamiento real del motor. Para eso hay dos suites separadas que **sí usan Piston** en el puerto 2000:

- `npm run test:runner` (`tests/real-runner.integration.ts`) llama al adaptador real y comprueba los runtimes, las soluciones de referencia dentro del sandbox, y los cuatro veredictos: aprobado, incorrecto, error en tiempo de ejecución y tiempo agotado, en Python y JavaScript. Por defecto valida un subconjunto de cinco ejercicios; con `ITERA_RUNNER_ALL=1` valida el catálogo completo actual, es decir 722 ejecuciones de referencias. Se salta si el ejecutor no responde.
- `npm run test:e2e:real` (`tests/real/flows.spec.ts`, `playwright.real.config.ts`) recorre la aplicación completa contra el sandbox: registro, aprobación real, rechazo de una respuesta distinta, tiempo agotado, progreso independiente por lenguaje, y publicación editorial que solo ocurre si las dos referencias superan las pruebas. También comprueba que una referencia defectuosa impida publicar.

Resultado histórico anterior a Desde cero: 24 ejercicios aprobados (240 ejecuciones reales), 5 pruebas de integración y 6 recorridos reales en verde. Esto no valida los nuevos ejercicios ni las referencias modificadas: deben volver a ejecutarse contra Piston.

## Requisitos del ejecutor

Docker Desktop con WSL2 y cgroup v2. Sin ellos la aplicación funciona igual, pero el botón de ejecución informa de que el sandbox está detenido; nunca se ejecuta código del usuario en Node o Python del servidor principal.

## Dependencias

`npm audit --omit=dev` no reporta vulnerabilidades en las dependencias de producción en la revisión inicial. Se fijan parches de DOMPurify y mysql2, y una versión compatible corregida de deepmerge-ts mediante `overrides`.

La auditoría completa aún informa la cadena `eslint-config-next → fast-glob → micromatch → braces` en herramientas de desarrollo. La versión publicada de `braces` consultada no tiene corrección; no se ha degradado Next.js ni ocultado el aviso. Las entradas de estos analizadores proceden de los archivos del proyecto.

## Repetir la comprobación

Con PostgreSQL iniciado, el sandbox levantado y los puertos 3000 y 2000 libres:

```sh
npm test
npm run lint
npm run typecheck
npm run build
npm run test:runner
npm run test:e2e:real
npm run doctor
```

`npm run test:e2e` usa el doble HTTP y solo necesita libre el puerto 3000 y el 2001.

Para repetir esos mismos recorridos contra el build de producción **local**, en PowerShell:

```powershell
npm.cmd run build
$env:ITERA_E2E_PRODUCTION = "1"
npm.cmd run test:e2e
Remove-Item Env:ITERA_E2E_PRODUCTION
```

Este modo usa `next start` en vez de `next dev`, pero conserva el doble HTTP de Piston en 2001. No verifica aislamiento real ni despliega nada. Es necesario volver a compilar después de modificar el código.

Las capturas de referencia están en `.local/screenshots/`, excluidas de Git.
