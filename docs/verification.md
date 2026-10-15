# Verificación local

## Cobertura automatizada

- 39 pruebas de dominio, contenido, revisión editorial, metadatos de aprendizaje y herramientas locales.
- Las 63 referencias de Python y las 63 de JavaScript pasan los mismos 347 casos por lenguaje. Las plantillas guiadas también se ejecutan con todos sus ejemplos en ambos lenguajes. Solo la actividad inicial de observación debe venir completamente resuelta. En las actividades de colecciones, textos, máximos, búsqueda y rotación se comprueba además que el cambio indicado en el enunciado coincide con la referencia. Las enumeraciones adicionales comprueban 2911 entradas de máximos y ausencia, 1718 de búsqueda y 3066 de recorridos circulares, por lenguaje.
- 35 pruebas de navegador con Chromium: 33 recorridos de catálogo, registro, preferencias, borradores, evaluación, ayudas, responsive, conflictos entre pestañas, recuperación de contraseña, aislamiento entre cuentas, administración y rutas; y dos comprobaciones controladas del observador de streams. Incluyen el orden completo de fundamentos y de Conecta las ideas, conservación de ruta al cambiar lenguaje o iniciar sesión, plantillas guiadas en ambos lenguajes y ausencia de salto al catálogo al terminar Desde cero. Todas pasan en desarrollo; la ejecución de producción de la undécima entrega tiene un fallo y ocho pruebas no ejecutadas, detallados más abajo.
- La importación editorial se comprueba sin publicar: mantiene intacta la versión anterior, no altera lo que sirve el catálogo público, no llama al ejecutor, no duplica una revisión idéntica y se detiene ante un borrador manual distinto. Las pruebas eliminan solo los borradores que ellas mismas crean.
- Los metadatos se validan para todo el catálogo; se prueban límites, duplicados, mensajes históricos y escape de HTML. El recorrido administrativo comprueba persistencia, normalización, visualización en ambos lenguajes y que un objetivo en borrador no cambie la versión pública ni la anterior.
- El editor se sirve sin CDN y cambia de tema junto con el resto de la interfaz.
- El flujo de evaluación verifica idempotencia, progreso separado por lenguaje y ausencia de entradas, salidas y errores de pruebas ocultas en la respuesta pública.
- Se comprobó el ciclo de parada y arranque del clúster PostgreSQL del proyecto.

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

`tests/e2e/action-stream.ts` observa el lector nativo solicitado por React y comunica su cierre o error al proceso de pruebas, conservando los eventos incluso al navegar tras crear un ejercicio. No clona la respuesta, no toma otro lector, no consume datos adicionales ni altera `read` o `cancel`. Las comprobaciones siguen exigiendo cierre real y HTTP satisfactorio, además de verificar la interfaz y la persistencia. Las dos pruebas de `action-stream.spec.ts` demuestran que recibir un fragmento no basta, que una respuesta pendiente no se marca como terminada y que un error se diferencia del cierre correcto.

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

Las pruebas de navegador de `npm run test:e2e` usan un doble HTTP de Piston en el puerto 2001. Verifican la integración, no el aislamiento real del motor. Para eso hay dos suites separadas que **sí usan Piston** en el puerto 2000:

- `npm run test:runner` (`tests/real-runner.integration.ts`) llama al adaptador real y comprueba los runtimes, las soluciones de referencia dentro del sandbox, y los cuatro veredictos: aprobado, incorrecto, error en tiempo de ejecución y tiempo agotado, en Python y JavaScript. Por defecto valida un subconjunto de cinco ejercicios; con `ITERA_RUNNER_ALL=1` valida el catálogo completo actual, es decir 694 ejecuciones reales. Se salta si el ejecutor no responde.
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
