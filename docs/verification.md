# Verificación local

## Primera diferencia textual de PROGRAM — fase 5 parcial (26 de octubre de 2026)

- `firstTextDifference` en `src/lib/json-diff.ts` explica la primera diferencia de
  salida con línea y columna desde 1. Cuenta puntos Unicode, no unidades UTF-16,
  grafemas o columnas visuales de tabulación. Identifica espacios, tabulaciones,
  saltos de línea y fin de salida; otros espacios Unicode se nombran por su código.
  El mensaje no crece con la longitud del programa o de su salida.
- Respeta la normalización vigente de `judgeProgram`: CRLF/CR se convierten en LF,
  se ignoran espacios al final de cada línea y líneas vacías finales. No normaliza
  mayúsculas, espacios interiores o equivalencia de acentos. La regresión compara
  324 pares de salidas con el evaluador, también usando el `actual` canónico que
  llega al navegador. No se cambia el evaluador ni el contrato del sandbox.
- `Results` calcula la diferencia después de filtrar casos visibles, solo ante
  una salida textual incorrecta disponible; no en aciertos, runtime o timeout.
  Conserva la comparación JSON de FUNCTION, la salida completa y el resumen de
  estados ocultos. Pruebas de render incluyen datos ocultos deliberadamente
  inyectados y HTML para comprobar que no aparecen ni se interpretan como marcado.
- **29 pruebas focalizadas** aprobadas; suite completa: **272 aprobadas, sin
  omisiones**. Lint sin errores ni avisos, tipos y build aprobados. El detector
  mecánico de la superficie no emitió hallazgos. No hay dependencias nuevas,
  cambios de base, progreso o contenido editorial.
- Chromium: componente React hidratado con datos sintéticos y CSS/fuentes locales
  del build, sin servidor Next ni peticiones API. Ambos temas a **1440, 390 y
  320 px**: mensaje visible, confidencialidad, plegado mediante Tab/Enter, foco
  visible, ausencia de errores JavaScript y sin desbordamiento horizontal de página.
  Con movimiento reducido y texto raíz al **200 %** en 320 px, se comprobó además
  que el resumen no recorta su texto. La primera inspección detectó un riesgo de
  recorte en palabras largas; `min-w-0` y ajuste de palabras lo corrigen. Una segunda
  pasada confirmó los seis tamaños/temas y las dos variantes de texto ampliado.
  Capturas solo locales en `.local/screenshots/text-diff-*`.
- Límites: la prueba de texto ampliado no equivale a zoom real del navegador.
  La comprobación de componente no sustituye el recorrido completo con sesión,
  almacenamiento, editor y API, ni una auditoría de lectores de pantalla. No se
  ejecutaron E2E, Piston real ni mediciones de duración; no se iniciaron la aplicación,
  PostgreSQL, Docker o WSL. El cierre de rutas, la revisión global de interacción y
  la preparación de validación humana siguen pendientes. El plan temporal se conserva.

## Registro operativo y coherencia documental (26 de octubre de 2026)

- Borradores, guardado/publicación/preparación editorial y evaluación registran
  excepciones operativas mediante `reportOperationalFailure`. Solo emite evento
  fijo, UUID nuevo, fase enumerada y referencia UUID/CUID opcional del intento.
  No recibe errores ni contexto arbitrario; no registra código, SQL, credenciales,
  casos, resultados o stderr. Alcance y consulta: [operational-logging.md](operational-logging.md).
- Las regresiones inyectan fallos en lectura, estado, runtime, casos, concepto,
  finalización, persistencia del error y reconciliación. Comprueban la fase,
  ausencia de contenido privado y que no se concede progreso. Los fallos que
  antes se propagaban siguen haciéndolo. Un destino de logs roto no altera la
  operación. Referencias inválidas y fases desconocidas se descartan; conflictos
  de revisión, sesión ausente y validaciones no generan estos eventos.
- Revisión acotada de lógica compartida: práctica y diagnóstico ya usan
  `useDraftRecovery`, `DraftRecovery` y `useExecution`, con sus módulos puros de
  recuperación y seguimiento. Se mantienen las políticas distintas de guardado
  y claves por cuenta/contexto; no se extrae una abstracción adicional ni se
  reestructura la interfaz. No se modifican versiones antiguas, catálogo,
  migraciones, intentos, dependencias ni bases de datos.
- README distingue apagado, recuperación y bases independientes en nativo/Docker;
  PRODUCT separa currículo vigente y evidencia histórica de Piston. Roadmap
  conserva el historial bajo prioridades actuales. AGENTS reconoce CI y documenta
  el registro seguro: 82 líneas y bloque generado por Next idéntico al anterior.
  El comando de logs Docker se cotejó con el lanzador; no se ejecutó en contenedor.
- `npm test`: **264 aprobadas, sin omisiones**, código de salida 0. Lint completo,
  tipos y build aprobados. Se reutilizan las comprobaciones de tipos/build ya
  realizadas sobre este mismo código, sin ejecutar ambos a la vez. Persisten los
  avisos conocidos de Better Auth en pruebas; lint no tiene avisos.
- No se inicia la aplicación, PostgreSQL, Docker, WSL ni Piston. No se repiten E2E
  ni revisión visual, porque no cambian la interfaz o los contratos HTTP. Las
  pruebas usan dobles; no verifican ejecución real, duración o aislamiento. La
  medición con Piston y la fase 5 continúan pendientes; el plan temporal se conserva.

## Mantenimiento: carga del catálogo y alcance de herramientas (26 de octubre de 2026)

- `getPracticeNavigation` carga los tres catálogos mediante una lectura común por
  llamada de ejercicios, versión publicada vigente y progreso propio. Proyecta los
  estados por lenguaje y conserva tres lecturas independientes de actividad, en
  paralelo. `getCatalog` mantiene su firma y solicita solo un lenguaje. No añade
  caché global ni entre peticiones, ni cambia selección pública, orden curricular,
  actividad histórica, recomendaciones o reglas de progreso.
- La regresión de Inicio falló antes del cambio: tres llamadas `exercise.findMany`
  en lugar de una, también como invitado. Tras el cambio pasa y compara carga
  individual/compartida en los tres lenguajes, fechas máximas entre versiones,
  intentos sin completado, completado en otro lenguaje y separación entre cuentas.
  El conteo mide llamadas Prisma con doble, no sentencias SQL ni latencia real.
- Búsqueda de consumidores: `savePreferences`, `getLastDraft` y `preferenceSchema`
  solo aparecían en su declaración/importación, aparte del plan. Se retiran sin
  tocar las acciones vigentes `saveAccountName` y `saveLearningPreferences`, ni los
  datos, versiones históricas, contenido, migraciones o dependencias.
- ESLint y TypeScript excluyen `.agents/` y `.opencode/`, sin borrarlos ni reducir
  comprobaciones de `src/`, `scripts/` o `tests/`. Dos regresiones verifican el
  alcance real de ESLint y la configuración resuelta de TypeScript. Esas herramientas
  permanecen locales, fuera del staging y de la entrega.
- `npm test`: **259 aprobadas**, sin omisiones; nueve comprobaciones nuevas de carga
  y alcance de herramientas. Tipos, build y **lint completo sin errores ni avisos**.
  Los 97 avisos históricos pertenecían a las herramientas ahora excluidas; no se
  corrigieron ni suprimieron reglas del producto. El primer lint de esta entrega
  detectó un import sobrante al retirar la acción: se eliminó y se repitió aprobado.
- `dashboard-catalog.spec.ts`: **dos recorridos aprobados** con el archivo completo
  repetido dos veces, contra producción y PostgreSQL temporal. Una cuenta tiene un
  completado en Python y borradores distintos en JavaScript/TypeScript; Inicio
  recomienda correctamente al cambiar la preferencia y muestra 1/0/0 completados.
  Otra cuenta comienza sin heredar actividad ni completados. Consultar Inicio no
  añade progreso. Las regresiones unitarias cubren además el acceso de invitado.
- La copia temporal recibió migraciones y se eliminó; las cuentas de prueba se
  limpiaron. Base original sin escrituras ni migraciones y servicios detenidos.
  No se iniciaron Docker, WSL o Piston ni se enviaron programas. No se ejecutaron
  la suite E2E completa, mediciones de rendimiento ni revisión visual: no hay cambios
  de interfaz. Permanecen los avisos conocidos de Better Auth en pruebas locales.
- Este es un bloque parcial de la fase 4: registro seguro de fallos, revisión de
  otras duplicaciones y coherencia documental general siguen pendientes.

## Recuperación según instalación: bloque 3.5 (26 de octubre de 2026)

- Recuperación y Configuración → Seguridad comparten una ayuda desplegable: carpeta
  `.local/mail/` para modo nativo y volumen `local-mail` para Docker. Reutiliza
  `node scripts/docker.mjs exec -T app` para listar y leer archivos, con la app ya
  iniciada. No crea herramientas, endpoints de correo, detección de instalación ni
  arranque automático. README y guía Docker documentan los mismos pasos.
- Se indica comprobar la línea `Para:` antes de abrir un enlace, no abrir sin más
  el archivo más reciente; podría ser de otra persona. Sin acceso a los archivos,
  se remite a quien mantiene la instalación. Se advierte no compartir enlaces o
  capturas. El mensaje de solicitud sigue condicionado a que la cuenta exista.
- No se modifican Better Auth, generación de archivos, tokens, límites de peticiones
  ni autorización. La respuesta HTTP y el mensaje visible se compararon para correo
  existente e inexistente: mismo estado 200, mismo JSON y mismo texto de confirmación.
  Esto no constituye una auditoría temporal de enumeración de cuentas.
- `npm test`: **250 aprobadas**, sin omisiones; dos pruebas nuevas de representación
  y correspondencia de comandos/ruta con Compose y Dockerfile. Tipos, lint focalizado
  sin avisos y build aprobados. No se repite lint completo; herramientas locales sin
  cambios y avisos previos documentados. Detector: un aviso asesor del título de 2rem
  ya existente en AuthForm, ajeno al cambio y compatible con la escala de títulos
  descrita en DESIGN.md; no se cambia tipografía por esta corrección de instrucciones.
- `password-recovery.spec.ts`: **dos recorridos completos aprobados en procesos de
  servidor independientes**, sobre una copia temporal de PostgreSQL. Verifica ayuda
  cerrada inicialmente, apertura por teclado y foco, comandos en ambos puntos de
  entrada, solicitud para correo conocido/desconocido, lectura del enlace nativo,
  cambio real de contraseña e inicio de sesión de vuelta a Configuración → Seguridad.
- El primer ensayo con `--repeat-each=2` pasó una vez y obtuvo 429 al repetir por el
  cupo real de recuperación. No se debilitó el limitador ni se cuenta esa pasada
  como dos aprobadas; se repitió cada recorrido con un servidor nuevo. Better Auth
  también registra el aviso esperado «User not found» para la cuenta inexistente;
  ese detalle no aparece en la respuesta al navegador.
- Revisión visual acotada de ayuda expandida en escritorio claro y móvil oscuro
  de 390 px, con movimiento reducido, foco visible y sin desbordamiento horizontal.
  No se realizó auditoría exhaustiva de lectores de pantalla o zoom.
- Dos copias temporales migradas y eliminadas, cuentas y correos de prueba limpiados.
  Base original sin escrituras ni migraciones; servicios de prueba detenidos.
  Docker/WSL/Piston no se iniciaron: los comandos Docker se cotejaron estáticamente
  con lanzador, volumen y directorio, pero no se ejecutaron en contenedor. No se
  ejecutaron la suite E2E completa ni `test:docker:http-security`.

## Transporte de código y pruebas editoriales: bloques 3.3 y 3.4 (26 de octubre de 2026)

- El cuerpo HTTP admite 184.096 bytes: seis por cada una de las 30.000 unidades
  UTF-16 del código, más 4.096 para metadatos. Se mantienen lectura acotada real,
  cancelación y rechazo 413 incluso sin longitud declarada o con longitud falsa.
  El mensaje 413 identifica el cuerpo, no atribuye necesariamente el exceso al código.
- La ejecución limita explícitamente `String.length`, igual que editor, recuperación
  de borradores y seguimiento. Esta versión de Zod cuenta puntos Unicode con `.max()`:
  el primer ensayo HTTP aceptó 30.001 unidades con emojis; se corrigió la discrepancia
  y se amplió la regresión de límite/exceso para cada representación de caracteres.
- Guardado y validación del catálogo usan `editorialTestsIssue` a través del esquema;
  publicación usa la misma función sobre cada variante persistida antes de llamar a
  Piston. Exige entradas distintas, no solo cantidad de casos; detecta contradicciones
  estructurales sin distinguir orden de propiedades JSON. Conserva tipos y arreglos
  ordenados, la excepción de PROGRAM sin entrada y duplicados compatibles históricos.
  Para resultados PROGRAM, aplica la normalización de texto del juez. No cambia casos
  persistidos ni endurece retrospectivamente la evaluación de envíos históricos.
- Catálogo nuevo e histórico compatibles en sus tres variantes, comprobados después
  de la normalización editorial real (`seedVersionContent`). No se cambió su contenido.
- `npm test`: **248 aprobadas**, sin omisiones. Diez nuevas pruebas de transporte y
  calidad editorial, además de ampliar límite/exceso Unicode. Se ajustó una expectativa
  previa que aceptaba tres entradas idénticas en FUNCTION: ahora usa tres distintas
  para seguir comprobando el contrato de tipos sin infringir la nueva diversidad.
  Tipos, lint focalizado sin avisos y build aprobados. Lint completo no repetido;
  permanece la evidencia anterior de 97 avisos en herramientas locales sin cambios.
- `editorial-safety.spec.ts` y `execution-recovery.spec.ts`: **21 recorridos repetidos
  dos veces, 42 aprobados** contra producción y PostgreSQL temporal. Nuevos recorridos
  verifican rechazo de guardado sin crear versión, rechazo de publicación para cada
  lenguaje (duplicados/contradicciones), aceptación HTTP de 30.000 unidades Unicode,
  persistencia exacta del código y rechazos 400/413 sin otro envío ni progreso.
- Ensayos anteriores fallaron por un selector nuevo que buscaba `alert` en lugar de
  `status` y por la discrepancia Unicode descrita. Se corrigieron y repitieron ambos
  archivos completos; esas pasadas parciales no se cuentan como aprobadas.
- Las tres copias de PostgreSQL se migraron y eliminaron; la base original no recibió
  escrituras ni migraciones. Servicios de prueba detenidos; Docker/Piston real no
  iniciados. El doble HTTP en 2001 no ejecuta código ni valida aislamiento o duración.
  No se ejecutaron la suite E2E completa ni publicación válida con Piston real. Los
  avisos locales de Better Auth y la prueba negativa de origen son los ya documentados.

## Estados editoriales y diagnósticos inconclusos: bloques 3.1 y 3.2 (26 de octubre de 2026)

- La ficha administrativa recibe por separado publicación de la versión y visibilidad
  del ejercicio. El encabezado refleja la versión; categoría y opción de ocultar siguen
  dependiendo de la visibilidad, en coherencia con el guardado del servidor. El listado
  muestra ambos estados por separado, también para una versión publicada ya oculta.
- Un borrador nuevo de un ejercicio visible ya no se anuncia como publicado. Ocultar
  desde ese borrador conserva las dos versiones y su publicación. Los cambios remotos
  de visibilidad/publicación no generan cambios editoriales pendientes ni se restauran
  desde una copia de sesión. No se cambian las reglas de publicación o selección pública.
- El resumen consulta el último diagnóstico terminado del lenguaje, no el último con
  sugerencia. Se ordena por finalización, con desempate por creación e id; el historial
  usa el mismo orden. Un resultado inconcluso conserva el nivel declarado y muestra su
  razón, sin rescatar una orientación anterior. La interfaz distingue «Sin resultado
  concluyente» de «Sin diagnóstico». Cambiar la declaración invalida la recomendación
  y la razón anteriores, sin modificar diagnósticos históricos ni progreso.
- Antes del cambio, las regresiones reprodujeron la selección de la sugerencia antigua
  y el orden por creación en lugar de finalización. Ambas fallaron inicialmente y
  aprobaron después; las pasadas fallidas no se cuentan como aprobadas.
- `npm test`: **238 aprobadas**, sin omisiones. Incluye siete comprobaciones nuevas
  del resumen y su representación, y amplía la protección de metadatos de la copia
  editorial. Tipos, lint focalizado y build aprobados. Se conserva la evidencia previa
  de 97 avisos del lint completo en herramientas locales, que no se modificaron.
- `tests/e2e/editorial-safety.spec.ts`: **13 recorridos repetidos dos veces: 26 aprobados**
  contra producción y una copia temporal de PostgreSQL. Además de los siete anteriores,
  comprueba las cuatro combinaciones de visibilidad/publicación en ficha y listado,
  guardado de una versión nueva seguida de ocultado sin modificar las versiones, y
  diagnóstico concluyente seguido de inconcluso y cambio de declaración sin progreso.
- Revisión visual acotada de la ficha en escritorio claro y móvil oscuro (390 px),
  con movimiento reducido y sin desbordamiento horizontal. Los recorridos anteriores
  vuelven a verificar Escape y retorno de foco de la confirmación de publicación.
  Detector sin hallazgos; no equivale a una auditoría completa de zoom/lectores de pantalla.
- La base original no recibió cambios ni migraciones; la copia temporal se eliminó
  y los servicios de prueba quedaron detenidos. Docker y Piston no se iniciaron.
  No se ejecutaron la suite E2E completa ni publicación/evaluación real en Piston;
  estos recorridos no publican y no validan el sandbox. Persisten los avisos conocidos
  de Better Auth sobre IP local y origen inválido de la prueba negativa.

## Caducidad y detención de evaluaciones: segundo bloque de la fase 2 (26 de octubre de 2026)

- Se confirmó la incompatibilidad entre los 120 segundos globales y los límites ya
  permitidos: hasta diez casos editoriales secuenciales, con 25 segundos HTTP por caso
  TypeScript (12 en Python/JavaScript), más consulta del runtime y posible análisis
  conceptual. Esto prueba la insuficiencia del presupuesto, no una medición real de Piston.
- Una regresión con reloj simulado reproduce diez casos TypeScript de 15 segundos:
  el reconciliador antiguo caduca el intento antes de terminar. También se reprodujeron
  casos adicionales tras finalizar y progreso concedido al finalizar fuera de plazo
  cuando ninguna consulta había reconciliado aún el intento. Las pruebas iniciales
  fallaron; no se cuentan como aprobadas. Se corrigió además un error de tipado del doble.
- `execution-limits.ts` comparte los tiempos HTTP con el adaptador y calcula el
  presupuesto total: consulta inicial + casos secuenciales + consulta/parser conceptual
  si corresponde + 30 segundos de margen, con mínimo de dos minutos. Diez casos
  TypeScript sin concepto disponen de 282,5 segundos; con concepto, 310 segundos.
  Se conserva el número real de casos históricos, sin truncarlo a diez. Los límites
  de CPU, memoria, compilación y ejecución de cada proceso no se modifican.
- La reconciliación selecciona solo metadatos de candidatos RUNNING con al menos dos
  minutos y aplica el mismo presupuesto antes de marcar ERROR. El evaluador comprueba
  plazo y estado antes de iniciar runtime, cada caso, análisis conceptual y finalización.
  La actualización atómica final exige RUNNING y estar dentro del plazo; si ya caducó,
  no incrementa intentos ni concede progreso, aunque aún no haya reconciliación externa.
- No se cancelan procesos que ya estaban en vuelo: conservan sus límites de Piston.
  Se detiene el trabajo restante en la siguiente frontera; no hay trabajador persistente,
  heartbeat, migración ni cambios de concurrencia o reserva idempotente.
- `npm test`: **231 aprobadas**, sin omisiones; incluye **13 comprobaciones nuevas**
  (presupuestos y ciclo de evaluación, incluidos sus subcasos). Tipos, lint focalizado
  y build de producción aprobados. Se reutiliza el resultado de lint completo de la
  entrega anterior para sus 97 avisos de herramientas locales, sin cambios en ellas.
- `tests/e2e/execution-recovery.spec.ts`: **5 recorridos repetidos dos veces, 10 aprobados**
  contra producción, endpoints reales y copia temporal de PostgreSQL. La nueva prueba
  conserva un TypeScript de diez casos a los 150 segundos, caduca simultáneamente el
  Python corto y después caduca el TypeScript realmente interrumpido, sin progreso.
  Los cuatro recorridos anteriores siguen comprobando recuperación sin reservas duplicadas.
- El servidor de Piston de esos recorridos es un **doble HTTP que no ejecuta código**.
  `npm run test:runner`: **1 aprobada (ejecutor ausente), 7 omitidas** por Piston detenido.
  No valida el sandbox ni su duración efectiva. Docker/WSL permaneció apagado. Medir
  evaluaciones secuenciales reales sigue pendiente y no se presenta esta fase como
  validada íntegramente con Piston real.
- Las copias temporales y sus datos se eliminaron; la base original no se modificó.
  Next, PostgreSQL y el doble quedaron detenidos. No se ejecutó la suite E2E completa.
  Sin cambios visuales; no se repitió una auditoría visual. Permanecen los avisos
  conocidos de Better Auth sobre IP y el origen inválido deliberado de la prueba negativa.

## Recuperación de ejecuciones: primer bloque de la fase 2 (25 de octubre de 2026)

- Práctica y diagnóstico comparten seguimiento de ejecuciones. Antes del POST se
  persisten clave idempotente, código, modo, variante e ítem diagnóstico cuando existe.
  Una respuesta incierta se recupera enviando exactamente esa instantánea y clave,
  nunca el contenido actualizado del editor. Las claves locales separan cuenta,
  variante y contexto. Se conservan los ids del formato anterior de práctica.
- Tras recuperar el id solo se consulta ese intento. Un fallo de red, JSON incompleto,
  sesión caducada o error HTTP de consulta no habilita otro envío. Los reintentos
  esperan progresivamente hasta 30 segundos y no abandonan por contar 90/100 consultas.
  El estado RUNNING remoto sigue siendo la autoridad, sin cambiar su caducidad.
- Un rechazo explícito del POST inicial libera la instantánea y permite corregir o
  volver a intentar. Si ya hubo respuesta incierta o recarga sin id, incluso un rechazo
  posterior conserva el seguimiento: la primera petición podría seguir reservándose.
  No se incorpora un descarte que permita duplicar ese trabajo incierto.
- Si no se puede leer o escribir el seguimiento antes del envío, no se envía código y
  se indica cómo reintentar. Si falla persistir el id aceptado, permanece en memoria y
  se continúa consultando; la instantánea previa permite recuperar la misma clave tras
  recargar. Si falla limpiar, el resultado sigue visible y recargar consulta el mismo id.
  La limpieza no retira un seguimiento distinto escrito posteriormente.
- Los avisos pendientes y de almacenamiento se muestran sin ocultar el resultado ni
  quedar aplazados por `aria-busy` en su región viva. La edición del borrador continúa
  disponible, pero no genera otra evaluación mientras la anterior está pendiente.
- `npm test`: **218 aprobadas**, sin omisiones; incluye **15 pruebas nuevas** del
  seguimiento. La primera pasada focalizada detectó que el literal JSON `null` podía
  confundirse con un id antiguo; se corrigió y la confirmación general aprobó.
- `npm run typecheck` y build aprobados. Lint completo sin errores: permanecen los
  **97 avisos preexistentes** de herramientas locales; lint focalizado sin avisos.
- Chromium contra producción: **4 recorridos repetidos dos veces: 8 aprobados**.
  POST y consultas usan endpoints reales y una copia temporal de PostgreSQL; Piston
  se sustituye por un doble HTTP en 2001 que **no ejecuta código**. Se descarta la
  respuesta después de que el servidor acepte el POST, se edita, recarga y recupera;
  la base confirma una única reserva con código original tanto en práctica como en
  diagnóstico. También se prueban consultas fallidas, escritura del id denegada,
  persistencia previa denegada, rechazo explícito y posterior reintento válido.
- Revisión acotada de escritorio claro y móvil oscuro (390 px), con movimiento
  reducido y sin desbordamiento horizontal. Detector sin hallazgos. No se ha realizado
  una auditoría exhaustiva con lectores de pantalla o zoom.
- Las copias temporales se migraron y eliminaron; la base original no se modificó.
  Next, el doble HTTP y PostgreSQL quedaron detenidos. Persisten los avisos conocidos
  de Better Auth sobre IP local y el origen inválido deliberado de una prueba negativa.
- Sin cambios de esquema, dependencias, autorización ni reserva/finalización remota.
  No se ejecutaron la suite E2E completa ni Piston real. La medición de evaluaciones
  secuenciales frente a los 120 segundos y la detención del trabajo caducado siguen
  pendientes: esta entrega no da por completada toda la fase 2.

## Guardado editorial seguro: tercer bloque de la auditoría (25 de octubre de 2026)

- El editor bloquea todos sus campos y controles durante guardar, validar/publicar
  u ocultar. Un bloqueo imperativo evita también envíos repetidos y cambios antes del
  siguiente render. Se retiró el `useTransition` que nunca iniciaba una transición.
- El envío usa `onSubmit`, conservando la validación HTML. La primera prueba lenta
  demostró que actualizar el bloqueo dentro de `form action` podía aplazar el render
  hasta terminar la acción; el manejador de envío activa el bloqueo con prioridad normal.
- Los cambios pendientes tienen estado explícito, confirmación al salir por enlaces
  y protección `beforeunload`. Publicar u ocultar requiere resolver la copia de sesión
  y guardar primero los cambios. La confirmación identifica el número de versión y
  recuerda que el catálogo selecciona la publicada de mayor número.
- Cada edición conserva una copia en `sessionStorage`, separada por administrador y
  ficha. Al volver o recargar se elige recuperar, descargar o descartar explícitamente;
  los campos quedan bloqueados hasta decidir para no sobrescribir otra copia pendiente.
  Se conservan campos incompletos y JSON todavía inválido. Recuperar nunca modifica
  identidad, versión, publicación ni datos remotos; sigue siendo necesario guardar.
- La copia se retira tras un guardado confirmado, sin borrar una escritura posterior.
  La navegación de historial se cubre mediante recuperación, no mediante un bloqueo
  experimental de Next.js. `sessionStorage` no es un respaldo permanente: cerrar la
  pestaña puede perderlo. El aviso nativo depende del navegador; hay descarga JSON
  explícita y se avisa cuando el almacenamiento falla o la copia supera el presupuesto.
- `npm test`: **203 aprobadas**, sin omisiones, con cinco nuevas comprobaciones de
  contenido pendiente, recuperación incompleta, identidad remota y copias dañadas.
  Tipos, lint focalizado y build de producción aprobados. Sin cambios de esquema,
  dependencias, acciones de autorización ni evaluación.
- Chromium contra `next start`: **7 recorridos, repetidos dos veces: 14 aprobados**
  en la confirmación final. Comprueban respuesta lenta con todos los controles
  bloqueados, instantánea guardada, fallo de red y reintento, salida cancelada/aceptada,
  recarga, historial con contenido remoto actualizado, confirmación de versión,
  almacenamiento denegado, descarga y descarte cancelado/confirmado sin tocar otra clave.
- Además del fallo inicial de bloqueo, una comprobación ampliada detectó que el
  diálogo no devolvía el foco a su activador; se conservó el botón de apertura y se
  verificó el retorno con Escape. Las pasadas fallidas no se contaron como aprobadas.
- Revisión visual acotada de escritorio claro y móvil oscuro (390 px), teclado y
  movimiento reducido. Sin desbordamiento horizontal; detector sin hallazgos.
  No equivale a una auditoría exhaustiva de lectores de pantalla o zoom.
- Cada pasada utilizó una copia temporal de PostgreSQL y contenido/cuentas temporales.
  Las copias se eliminaron y la base original no recibió migraciones ni cambios.
  Next y PostgreSQL quedaron detenidos. Persisten los avisos conocidos de Better Auth
  sobre IP local y el origen deliberadamente inválido de una prueba negativa.
- No se ejecutaron la suite E2E completa ni publicación real en Piston. Los recorridos
  verifican la elección de versión y el bloqueo de publicación pendiente, no la validez
  de referencias en el sandbox. Las demás fases de la auditoría continúan pendientes.

## Recuperación explícita de borradores: segundo bloque de la auditoría (25 de octubre de 2026)

- Práctica y diagnóstico comparan cualquier copia local distinta cuya base remota
  no pueda confirmarse, independientemente de su revisión. Hasta elegir una copia,
  no se permite editar ni sincronizar ese código. La recuperación usa siempre la
  revisión del servidor, nunca la de una copia antigua.
- Se pueden comparar los textos completos, copiarlos y descargar las alternativas
  como JSON. Elegir, editar o sincronizar conserva las otras copias en el registro
  local del mismo usuario y variante/ítem. No se truncan alternativas; si el navegador
  no puede almacenarlas, permanecen en memoria y se pide descargarlas antes de salir.
- Los borradores locales antiguos siguen siendo legibles. Los nuevos documentan
  su código remoto de base, para retomar automáticamente una edición pendiente solo
  cuando esa base y revisión siguen intactas. La transferencia de invitado se retira
  de la sesión únicamente tras conservar el borrador local con éxito.
- Las pestañas no sustituyen el código abierto ni adoptan revisiones entre sí:
  archivan contenido desplazado y mantienen la concurrencia optimista del servidor.
  No cambian autenticación, esquema, dependencias, progreso ni ejecución.
- `npm test`: **198 aprobadas**, sin omisiones, incluidas nueve nuevas pruebas de
  recuperación, revisiones menores/iguales/mayores, copias vacías, base confirmada,
  transferencias, alternativas y datos locales dañados.
  Tras el ajuste final se repitieron recuperación, autoguardado y autorización
  diagnóstica: **26 aprobadas**; el build y los recorridos usan la interfaz final.
- Tipos, lint focalizado de los archivos afectados y build de producción aprobados.
  Detector mecánico de la interfaz: sin hallazgos. Se mantienen los avisos conocidos
  de Better Auth sobre IP local y la prueba negativa de origen no permitido.
- Chromium contra `next start`: **12 recorridos focalizados aprobados**. Incluyen
  los tres de autoguardado previo, elección local/remota, descarga y conservación tras
  edición/recarga, diagnóstico independiente, pestañas y sesiones aisladas, transferencia
  sin tocar otras claves, lectura denegada, cuota llena y cierre de una pestaña sin
  conexión cuya edición fue desplazada. No requieren Piston ni evalúan código.
- La primera pasada no completó los recorridos: los nombres accesibles compuestos
  con texto oculto no coincidían con los selectores de elección y agotaron el plazo.
  Se añadieron etiquetas explícitas y la pasada completa posterior aprobó. El proceso
  de aplicación temporal que quedó tras el límite del lanzador se identificó y detuvo;
  las dos copias temporales de la base se eliminaron, sin migrar la original.
- Revisión visual acotada de escritorio claro (1440 × 1000) y móvil oscuro
  (390 × 844), sin desbordamiento horizontal. Se comprobó elección por teclado,
  retorno del foco y movimiento reducido en el diálogo. Capturas locales, no publicadas.
- No se ejecutaron la suite E2E completa, Piston real ni una auditoría exhaustiva
  de zoom/lectores de pantalla. PostgreSQL volvió a quedar detenido y la aplicación
  de pruebas terminó. El guardado editorial y las demás fases continúan pendientes.

## Autoguardado recuperable: primer bloque de la auditoría (25 de octubre de 2026)

- `saveDraft` diferencia errores temporales de infraestructura, conflictos reales,
  sesión caducada, entrada inválida y ejercicio no disponible. Mantiene identidad
  de sesión y concurrencia optimista; no modifica esquema ni dependencias.
- El espacio de práctica reintenta fallos temporales con espera creciente hasta
  30 segundos y restablece el intervalo habitual tras guardar. El aviso de
  sincronización se limpia sin borrar avisos independientes del almacenamiento local.
- `npm test`: **189 aprobadas**, sin omisiones. Incluye nueve nuevas comprobaciones
  de clasificación, reintentos, recuperación, revisiones obsoletas y creación duplicada.
  Las pruebas usan dobles en las fronteras de autenticación y base, no datos reales.
  Tras el ajuste final de mensajes se repitieron las suites de autoguardado y
  autorización: **15 aprobadas**, además del build.
- Tipos (`tsc --noEmit --incremental false`), lint focalizado y build de producción
  aprobados. La suite emite avisos de Better Auth sobre IP local y el origen inválido
  de una prueba negativa; no representan una aprobación de escenarios no ejecutados.
- Navegador Chromium contra `next start`: **3 recorridos focalizados repetidos
  dos veces, 6 aprobados** en la confirmación final.
  Verifican dos fallos de red antes de guardar automáticamente la edición más reciente,
  limpieza del aviso sin recargar, conservación local ante un conflicto real y
  persistencia del aviso de almacenamiento lleno tras recuperar la sincronización.
  La primera pasada falló por un selector de alerta que también encontraba el
  anunciador de Next.js; se acotó al panel del editor antes de repetir ambos recorridos.
- La base nativa estaba detenida y pendiente de dos migraciones. Se inició con
  autorización y cada pasada usó una copia temporal con nombre aleatorio: solo esas
  copias recibieron migraciones y usuarios de prueba, y se eliminaron al terminar.
  La base original no se migró ni se alteró; PostgreSQL volvió a quedar detenido.
  Docker/WSL permaneció apagado y no se inició Piston.
- No se ejecutó la suite E2E completa ni el sandbox real. Esta entrega no modifica
  evaluación ni aislamiento. La recuperación comparada de borradores, la idempotencia
  del cliente y las restantes fases de la auditoría siguen pendientes.

## Dashboard centrado en la siguiente práctica (23 de octubre de 2026)

- Cambio acotado a Inicio y sus reglas de recomendación/presentación; sin
  migraciones, dependencias nuevas ni cambios en la evaluación del progreso.
- `npm test`: **130 aprobadas**, con siete nuevas para avance de la ruta actual,
  exclusión de actividad duplicada, estados Empezar/Continuar y catálogo terminado.
  Tras acortar el texto de continuación se repitieron las suites afectadas de
  dashboard, navegación y perfil: **22 aprobadas**.
- `npm run typecheck`, lint focalizado de todos los archivos TypeScript afectados
  y `npm run lint -- --quiet`: aprobados. `--quiet` omite los avisos ya conocidos
  de herramientas locales sin seguimiento; no implica que hayan desaparecido.
- El detector de diseño se ejecutó una vez sobre Inicio y el CSS. No señaló la
  nueva composición; sus avisos orientativos corresponden a valores de tipografía
  y radios preexistentes en otras reglas del archivo global. No se modificaron
  pantallas ajenas para silenciarlos.
- Primera revisión de navegador: **3 recorridos focalizados aprobados** sobre
  Docker. Se verificaron continuación real del borrador, avance independiente por
  lenguaje, elección del siguiente ejercicio, ausencia de actividad duplicada y
  estados sin actividad/catálogo completado. Las capturas en ambos temas a 320,
  390, 768 y 1440 px motivaron un único ajuste del pie de la tarjeta en móvil.
- El build de producción Docker pasó tras ese ajuste, con Prisma, Next.js y
  TypeScript. La confirmación visual de invitado en ambos temas, a 390 y 1440 px,
  no mostró desbordamiento horizontal; la acción principal conserva foco visible
  de 2 px. La tarjeta ocupa aproximadamente 242 px de alto en escritorio, frente
  a los 285 px de la composición anterior, con más contexto útil.
- Confirmación final: `npm run docker:test:e2e`, **30 recorridos aprobados**
  sobre la app Docker actualizada, incluidos los tres del dashboard y las pruebas
  de ejecución con Piston real. PostgreSQL volvió a quedar sin puerto publicado.
  No se ejecutó la suite nativa completa con doble HTTP; el cambio de su aserción
  de continuación se comprobó con lint y tipos, no como recorrido ejecutado.

## Bienvenida, diagnósticos y Configuración (23 de octubre de 2026)

- Se guardó un respaldo local de PostgreSQL Docker antes de aplicar la migración
  aditiva `20261023120000_learning_onboarding`. La migración se aplicó sin reset
  ni seed. La consulta de integridad confirmó cero preferencias sin perfil en su
  lenguaje correspondiente. No se modificó la base nativa de Windows.
- `npm test`: **123 aprobadas**, incluidas ocho pruebas nuevas para selección
  diagnóstica, recomendaciones, separación del progreso, contexto de ejecución y
  los cuatro pasos de bienvenida.
- `npm run typecheck`: aprobado. Se regeneraron los tipos de rutas de Next.js
  mediante sus generadores, sin editar manualmente `.next/` ni iniciar un servidor
  nativo. Las referencias anteriores al panel eliminado ya no intervienen.
- `npm run lint`: sin errores. Los **97 avisos** proceden de las herramientas
  locales preexistentes sin seguimiento bajo `.agents/` y `.opencode/`; no se
  incorporan a la entrega. El lint focalizado de fuentes y pruebas pasó sin avisos.
- `npx prisma validate`: aprobado con Prisma 7.10.0, sin actualizar dependencias.
- La imagen Docker ejecutó `npm run build` satisfactoriamente, incluyendo Prisma,
  compilación Next.js y comprobación TypeScript.
- La primera pasada Docker aprobó 24 de 27 recorridos y detectó una aserción antigua
  sobre el correo, una carrera de navegación y la pérdida del editor sencillo al
  cambiar de reto. Se corrigieron antes de la repetición final.
- `npm run docker:test:e2e`: **27 aprobados**, ninguno omitido, con la imagen
  corregida y Piston real. Cubren registro, bienvenida saltable, perfiles por
  lenguaje, recomendaciones, edición entre secciones, correo/contraseña,
  desactivación/reactivación, límites de reautenticación, teclado y movimiento
  reducido. El diagnóstico verifica idempotencia por contexto, propiedad, casos
  ocultos filtrados, repetición y conflicto optimista sin sobrescribir la copia
  local; no genera `Progress`, `Draft` ni `PracticeContext`.
- Tras añadir la omisión explícita del diagnóstico real cuando Piston esté
  desconectado, se repitió su archivo completo: **3 aprobados**, ninguno omitido.
- Se revisaron capturas de bienvenida, Configuración y diagnóstico en escritorio
  y móvil, con temas claro/oscuro. Las capturas permanecen en `.local/screenshots/`,
  fuera de Git. Los recorridos temporales limpian sus usuarios y contenido.
- No se ejecutó la suite nativa completa con doble HTTP: se verificó el entorno
  Docker autorizado. La base nativa sigue pendiente de migrar si se utiliza.

## Usuarios ficticios y administración (20 de octubre de 2026)

- Se crearon los diez perfiles locales con `ITERA_DEV_USERS=1 npm run
  db:seed:users -- --apply`. El archivo de credenciales está en `.local/`, excluido
  de Git; no se publican claves ni se modifican cuentas preexistentes.
- `npm test`: **110 aprobadas**. Las tres pruebas nuevas cubren barreras del seed,
  distribución de perfiles y validación de operaciones administrativas. Tras
  endurecer los parámetros de conexión se repitieron esas tres: **3 aprobadas**.
- `npm run test:admin`: **1 aprobada** con PostgreSQL en un esquema temporal
  aislado. Comprueba permisos, sesión caducada/revocada o ajena, estado obsoleto,
  concurrencia y protección del último administrador activo frente a desactivación
  y degradación. El esquema se elimina al terminar.
- `ITERA_DEV_USERS=1 npm run test:dev-users`: **1 aprobada**. Comprueba repetición
  sin cambios mediante huellas, contadores, fechas de finalización y saneamiento
  de resultados ocultos. No ejecuta los programas sintéticos.
- `npm run typecheck` y `npm run build`: aprobados. No se necesitan migraciones ni
  cambios de dependencias: se reutilizan roles, estado, sesiones y auditoría.
- `npm run lint`: cero errores; **97 avisos previos** en herramientas locales sin
  seguimiento de `.agents/` y `.opencode/`, no incluidos en la entrega.
- `ITERA_E2E_PRODUCTION=1 npm run test:e2e`: **127 aprobadas**, sin omisiones.
  Tras endurecer la lectura de filtros repetidos en la URL se repitieron el build
  y las cinco pruebas administrativas: **5 aprobadas**, incluida esa regresión.
- Pruebas focalizadas de `admin.spec.ts` contra build de producción: **5 aprobadas**,
  sin omisiones. Incluyen acceso de los diez perfiles, rechazo del desactivado,
  progreso por lenguaje en las cuatro vistas, estadísticas, filtros, cambio de rol,
  revocación de sesiones, reactivación, reenvío no autorizado de una Server Action,
  teclado, movimiento reducido y ambos temas a 1440/320 px.
- La primera ejecución focalizada detectó dos problemas de selectores: etiqueta
  implícita del selector personalizable y dos regiones de estado en Ejercicios.
  Se hizo explícita la asociación de etiquetas y se acotó el selector de prueba.
  Una ejecución anterior terminó por el límite externo de tiempo del comando;
  no se considera aprobada. Se aumentó ese límite sin rebajar la autenticación.
  Se eliminaron únicamente las dos fixtures propias que dejó esa interrupción,
  comprobando identidad, fecha y ausencia de actividad antes de limpiarlas.
- La última repetición de `test:dev-users`, ya sin servidores ni escrituras de E2E,
  aprobó también la huella de preferencias, sesiones, ayudas y límites de cuenta.
  Los servidores temporales de navegador se cerraron al terminar.
- Capturas en `.local/screenshots/admin-*.png`, fuera de Git. Detector de diseño
  focalizado sin hallazgos; revisión de escritorio claro y móvil oscuro sin
  desbordamiento horizontal. Se conserva la gestión editorial existente.
- Docker/Piston real no disponibles según `npm run doctor`. No se ejecutaron
  `test:runner` ni E2E real; el doble HTTP no verifica aislamiento ni ejecución real.
- Uso y garantías: [administration.md](administration.md).

## Perfil y configuración de cuenta (20 de octubre de 2026)

- `npm test`: **107 aprobadas**, incluidas tres nuevas comprobaciones de
  normalización del correo, contraseña y confirmación de desactivación.
- `npm run typecheck` y `npm run build`: aprobados. Se aplicó
  `20261020210000_account_management` con `npm run db:migrate`.
- `npm run lint`: cero errores y los **97 avisos previos** de herramientas locales
  sin seguimiento en `.agents/` y `.opencode/`. El lint focalizado de código y
  pruebas de esta entrega no emitió avisos.
- `ITERA_E2E_PRODUCTION=1 npm run test:e2e`: **122 aprobadas**, sin omisiones.
  Después del último ajuste de restauración del foco en los diálogos de cuenta,
  se repitieron el build y las seis pruebas de `account.spec.ts`: **6 aprobadas**.
  Los servidores temporales de las suites se cerraron al terminar.
- La pasada focalizada de cuenta y movimiento aprobó **16 pruebas**. Cubre correo
  duplicado, contraseña actual incorrecta, confirmación de contraseña, hash de
  credenciales, revocación de otras sesiones, desactivación sin pérdida de datos,
  bloqueo de acceso, reactivación administrativa y límite persistente de
  reautenticación. Las fixtures se preparan sin consumir registros de la suite
  de acceso y respetan `Retry-After` al iniciar sesión.
- Las regresiones de acceso usan el nuevo menú del avatar y esperan el regreso
  al inicio público antes de navegar de nuevo. Los registros temporales de la
  prueba de experiencia también respetan `Retry-After`; no se rebajó ningún
  límite de autenticación ni se modificó la recuperación existente.
- En la verificación ampliada se detectó y corrigió el ancho mínimo de las
  secciones de Configuración a 320 px con texto al 200 %. Las capturas de ambos
  temas y formularios quedan en `.local/screenshots/`, fuera de Git.
- `npm audit --omit=dev`: cero vulnerabilidades. La auditoría completa señala
  cinco entradas altas en la cadena de desarrollo de `eslint-config-next`
  (`fast-glob` → `micromatch` → `braces`), sin cambios de versión en esta entrega.
  No se ejecutó `audit fix --force` ni se alteraron esas dependencias fuera del
  alcance acordado.
- No se ejecutan pruebas con Piston real para esta tarea de cuenta. El doble HTTP
  de la suite general no verifica ejecución real ni aislamiento del ejecutor.
- Política y persistencia: [account-management.md](account-management.md).

## Continuidad y organización de la práctica (20 de octubre de 2026)

- `npm test`: **97 aprobadas**, incluidas recomendaciones, estados y orientación
  de errores. `npm run typecheck` y `npm run build`: aprobados.
- `npm run lint`: cero errores y los **97 avisos previos** de herramientas locales
  sin seguimiento en `.agents/` y `.opencode/`. No se incluyen esas herramientas
  en la entrega.
- `ITERA_E2E_PRODUCTION=1 npm run test:e2e`: **107 aprobadas** con el doble HTTP.
  Tras acotar a dos líneas los conceptos de las filas y evitar que el historial
  estire su superficie vacía, se repitieron `redesign`, `interface` y
  `ux-learning`: **25 aprobadas**, además del build.
- Cobertura de ambos temas, anchos de 320 a 1440 px, texto al 200 %, teclado,
  movimiento reducido, editor antes de JavaScript, persistencia de código,
  concurrencia de borradores, continuación en otro navegador, cambio de origen,
  agrupación de versiones e intentos y separación por lenguaje. Las capturas
  quedan en `.local/screenshots/`, fuera de Git.
- Se aplicó `20261020200000_practice_context` con `prisma migrate deploy`. Añade
  continuidad por cuenta sin transformar contenido ni registros de estudiantes.
- `npm run test:runner`: **1 aprobada y 7 omitidas** porque Piston está detenido.
  No se ejecutó E2E real ni se inició Docker. El doble HTTP no verifica ejecución
  real ni aislamiento. La suite de navegador usó servidores temporales propios
  y los cerró al terminar.
- Alcance y reglas de continuidad: [learning-experience.md](learning-experience.md).

## Currículo común de lógica (20 de octubre de 2026)

- Activación real con Piston: `npm run content:replace -- --apply` validó 116
  funciones por lenguaje en lotes y 20 programas completos por lenguaje, y
  publicó 136 ejercicios (28/36/36/36), 408 variantes y cuatro rutas. Una segunda
  pasada revalidó y publicó la versión 2 de «Corrige una fórmula con paréntesis»
  como programa de salida fija sin entrada, para no adelantar la lectura de datos
  en Iniciación; la versión anterior sigue publicada para el historial. El
  catálogo activo conserva 28 ejercicios de Iniciación.
- `npm test`: 89 pruebas aprobadas, incluidas referencias y plantillas Python,
  JavaScript y TypeScript, contratos estrictos y validación editorial común.
- `npm run typecheck` y `npm run build`: aprobados. `npx eslint src prisma scripts
  tests`: sin avisos. `npm run lint` termina con 0 errores, pero recorre las
  herramientas locales sin seguimiento y muestra 97 avisos previos en `.agents/`
  y `.opencode/`; no forman parte de la entrega ni de CI.
- Migraciones aplicadas. La integración `tests/logic-install.integration.ts`
  comprueba preparación idempotente, conservación del estado activo y de los
  estudiantes y rechazo de una instantánea obsoleta sin cambios parciales.
- `npm run test:runner`: ocho pruebas aprobadas con Piston real y sus tres
  runtimes, sin omisiones. No se repitió tras la revisión de paréntesis; la
  activación completa sí validó esa versión en los tres runtimes.
- `npm run test:e2e`: 103 pruebas aprobadas en 4,9 minutos con el doble HTTP de
  Piston. Cubren las cuatro rutas, el cambio de lenguaje, el acceso libre, el
  archivo histórico, la administración editorial y el texto al 200 % en móvil.
  El doble no ejecuta código; la activación y `test:runner` cubren el ejecutor
  real.
- Correcciones surgidas de la verificación: la prueba de recuperación esperaba
  «Crear enlace de recuperación» mientras la interfaz muestra «Crear enlace»; se
  alineó la prueba. En `/rutas/desde-cero` a 320 px con texto al 200 %, la
  autoevaluación desbordaba por palabras largas; `wrap-anywhere` permite partirlas
  sin alterar el aspecto con tamaños normales.

Los apartados siguientes registran verificaciones anteriores, no ejecuciones
repetidas automáticamente para esta entrega.

## Revisión de UIArc y rendimiento (20 de octubre de 2026)

**Comportamiento compacto acordado:** se retiró la altura fija de 640 px porque
dejaba espacio vacío. La altura ahora se adapta al contenido sin animar el tamaño;
el encabezado y las pestañas no se desplazan. Nueve pruebas de ayudas/controles
aprobaron, incluyendo el programa corto de la captura del usuario, dos pistas,
solución larga y pantallas bajas. La regresión comprueba ausencia de hueco inferior
artificial y de altura animada, conservando posición superior y ancho. Se revisaron
capturas de móvil/escritorio. Build con tipos y lint focalizado aprobaron. No se
repitieron todas las pruebas unitarias/E2E ni Piston real.

**Intento anterior con altura fija (sustituido):** fijar solo la posición superior no impedía
que cambiara la altura del recuadro. Ahora tiene altura estable adaptada al viewport,
con scroll limitado al panel activo y título/pestañas siempre visibles. La regresión
comprueba `x`, `y`, ancho y alto en cada fotograma al descubrir dos pistas, cargar la
solución, desplazarla y volver a Pistas. Ocho escenarios de ayudas/controles aprobaron
en móvil y escritorio, temas claro/oscuro y ventanas de 900/480 px de altura. Build
(incluye tipos) y lint focalizado aprobaron. No se repitió toda la suite ni Piston real.

Corrección posterior del salto en ayudas: `help-motion.spec.ts` reprodujo un
desplazamiento del encabezado de más de 220 px al revelar pistas/solución. Tras
anclar el diálogo por arriba y conservar sus paneles, los 16 escenarios de
`help-motion.spec.ts`, `controls.spec.ts` y `motion.spec.ts` aprobaron. La regresión
comprueba fotogramas de posición, opacidad y transformación, además de que la
primera pista conserva su nodo al volver desde Solución. No ejecuta código en Piston.
La repetición final de `help-motion.spec.ts` junto con `initial-batch.spec.ts`
aprobó nueve escenarios, incluyendo la conservación del nodo de la pista y la
carga de explicaciones sin conceder progreso. Build (incluye tipos) y lint
focalizado también aprobaron; se reutilizan las pruebas unitarias anteriores
porque no cambió la lógica del dominio.

- `npm test`: 81 pruebas aprobadas.
- `npm run typecheck`: aprobado. La primera comprobación del nuevo instrumento
  de rendimiento encontró errores de tipos en sus listeners; quedaron corregidos.
- `npm run build`: aprobado tras esa corrección.
- `npm run lint`: sin errores; 97 avisos de herramientas locales sin seguimiento
  en `.agents/` y `.opencode/`. Lint focalizado de `src/` y pruebas nuevas sin avisos.
- 69 escenarios distintos de navegador verificados contra el servidor ya abierto:
  66 aprobaron inicialmente y tres fallaron por expectativas/acciones de pruebas
  obsoletas. Tras corregirlas, los 26 escenarios completos de `motion.spec.ts` y
  `onboarding.spec.ts` aprobaron; se reutilizan los otros 43 resultados sin cambios.
  Cobertura: controles, currículo, lote R1, interfaz, movimiento, onboarding,
  rendimiento, simplificación y reflujo. No son 95 escenarios distintos.
- El recorrido completo `npm run test:e2e` anterior fue cancelado al reiniciarse
  el servidor; no se presenta como aprobado. Los flujos de evaluación y publicación
  con doble HTTP no se han completado de nuevo. No se detuvo el servidor existente.
- `npm run test:runner`: comprobación de ejecutor ausente aprobada; los casos que
  requieren Piston real se omitieron por indisponibilidad. No se arrancó Docker
  ni se verificó ejecución real o aislamiento en esta revisión.

Las regresiones nuevas comprueban que las pestañas de ayuda no muestran barras
de desplazamiento y conservan su altura, foco y selección por teclado. Los cuatro
selectores del catálogo abren por debajo en Chromium en ambos temas, a 390 y
1440 px. Se conserva el selector del sistema en navegadores sin `base-select`:
allí la dirección del desplegable la decide el navegador/sistema operativo.

La comparación de rendimiento y el recorrido para ver los cambios están en
[motion.md](motion.md) y [recorrido-uiarc.md](recorrido-uiarc.md). Las capturas y
mediciones permanecen en `.local/`, fuera de Git.

## Cobertura automatizada

- 74 pruebas de dominio, contenido, revisión editorial, metadatos, comparación, modo programa, currículo, TypeScript y herramientas locales.
- El catálogo incorpora referencias y plantillas en tres lenguajes. TypeScript se comprueba con compilación estricta, sin ocultar diagnósticos y contra el contrato editorial independiente. Se ejecutan únicamente referencias fijas del repositorio, no programas de usuarios. Solo la actividad de observación debe venir completamente resuelta. Las enumeraciones adicionales conservan 2911 entradas de máximos y ausencia, 1718 de búsqueda, 3066 de recorridos circulares y 1668 del lote R1 por lenguaje original.
- El rediseño aprueba 72 pruebas de navegador tanto en desarrollo como en producción local con doble HTTP, y ocho recorridos adicionales contra Piston real. Los resultados históricos siguientes no sustituyen estas comprobaciones.
- La importación editorial se comprueba sin publicar: mantiene intacta la versión anterior, no altera lo que sirve el catálogo público, no llama al ejecutor, no duplica una revisión idéntica y se detiene ante un borrador manual distinto. Las pruebas eliminan solo los borradores que ellas mismas crean.
- Los metadatos se validan para todo el catálogo; se prueban límites, duplicados, mensajes históricos y escape de HTML. El recorrido administrativo comprueba persistencia, normalización, visualización en ambos lenguajes y que un objetivo en borrador no cambie la versión pública ni la anterior.
- El editor se sirve sin CDN y cambia de tema junto con el resto de la interfaz.
- El flujo de evaluación verifica idempotencia, progreso separado por lenguaje y ausencia de entradas, salidas y errores de pruebas ocultas en la respuesta pública.
- Se comprobó el ciclo de parada y arranque del clúster PostgreSQL del proyecto.

## Rediseño por módulos y TypeScript desde cero

Implementación del 15 de octubre de 2026. El catálogo conserva las 124 identidades previas y añade 16: 140 actividades, 20 módulos y rutas de 22/40/42/36 pasos. Hay 126 funciones y 14 programas, con 720 casos por lenguaje. Diseño y límites: [curriculum.md](curriculum.md).

- `npm test`: 74/74 aprobadas. Incluye referencias fijas de Python y JavaScript, compilación estricta y ejecución de todas las referencias y plantillas TypeScript, contratos de entrada/retorno, prueba negativa de tipos y comprobación de que un diagnóstico detiene el conductor antes de ejecutar. Se verifican cobertura de rutas sin duplicados, integración final, orden de prerrequisitos y normalización del timeout del hijo TypeScript sin exponer datos ocultos.
- `npm run typecheck` y `npm run build`: aprobados tras las correcciones del ejecutor y las pruebas. Build regeneró Prisma y compiló las rutas. Las suites de navegador iniciaron y cerraron sus propios servidores temporales con autorización, sin reutilizar servidores del usuario.
- `npm run lint`: sin errores; solo los tres avisos previos de `.agents/skills/tailwind-v4-shadcn`, preservados sin modificaciones.
- `npm run db:migrate`: aplicada `20261016000000_variant_statement`, aditiva, con `statement` y `typeContract` en las variantes. El seed incorporó las nuevas identidades; no actualiza versiones existentes.
- `npm run content:revisions -- --apply`: 124 nuevas versiones en borrador; se conservan las versiones publicadas. Una previsualización posterior reconoce las 140 revisiones como idénticas, sin escrituras ni conflictos. El script no modifica progreso, envíos ni borradores del alumno.
- `npm run content:paths -- --apply`: rutas locales actualizadas a 22/40/42/36 pasos. La autoevaluación no concede progreso y no impide continuar.
- Piston preparado con Python 3.12.0, JavaScript 20.11.1 y TypeScript 5.0.3. Se corrigió el rechazo HTTP 400 de solicitudes TypeScript por el máximo anterior de 3000 ms: `compose.yaml` permite ahora 12000 ms exteriores y 10000 ms de CPU. Se recreó solo Piston, conservando los paquetes. La compilación estricta mantiene 8000 ms y el programa del alumno, 3000 ms. El código reservado 124 del conductor se interpreta como timeout, incluso cuando Piston lo devuelve como `RE`.
- `ITERA_RUNNER_ALL=1 npm run test:runner`: 7/7 aprobadas, sin omisiones, en la versión de la suite iniciada antes de añadir la regresión de timeout. Valida las 140 referencias y sus 720 casos en cada lenguaje: 2160 ejecuciones reales, incluidos contratos TypeScript. Tras las correcciones, `npm run test:runner` aprueba la suite focalizada actual, 8/8 sin omisiones: errores de tipos, contratos, funciones/programas, respuesta incorrecta, excepción, timeout y privacidad de casos ocultos. La ejecución completa comprueba referencias, **no todas las plantillas**.
- `npm run test:e2e`: 72/72 aprobadas en desarrollo y 72/72 en producción local, sin reintentos ni aumentos de timeout. La primera ejecución falló por expectativas obsoletas: intentaban activar el editor sencillo aunque la preferencia persistía al navegar o recargar. Se usa un ayudante que reconoce su estado y se comprueba expresamente la persistencia del editor y del tamaño del código. Incluye módulos, autoevaluación, TypeScript desde cero, foco, Monaco en ambos temas y anchuras de 320 a 1440 px. Revisadas capturas claras/oscuras de escritorio y móvil. El doble HTTP no ejecuta código.
- En desarrollo se observó un aviso de hidratación en Configuración con diferencias de `style` (`caret-color: transparent`) durante las capturas. No se diagnostica ni se presenta como corregido; no impidió las comprobaciones y no apareció en la ejecución de producción. El aviso de contraseña inválida corresponde a la prueba negativa de autenticación. Lint conserva únicamente los tres avisos previos indicados arriba.
- `npm run test:e2e:real`: 8/8 aprobadas, sin omisiones. Registro con preferencia TypeScript, aprobación real, respuesta incorrecta y timeout, progreso independiente, errores de tipos sin finalización, filtrado de diagnósticos ocultos, función y programa completo TypeScript. La publicación administrativa valida referencias y plantillas de tres lenguajes en ejercicios temporales y rechaza una referencia defectuosa. Las cuentas y ejercicios temporales se eliminan al finalizar.
- Las comprobaciones anteriores se cerraron antes de la publicación del catálogo. La publicación real posterior y sus garantías se describen a continuación.
- No se presenta esto como una reescritura pedagógica individual de todos los enunciados históricos: se han revisado los introductorios y añadido estructura, teoría y ejemplos a las cuatro rutas. La revisión individual restante sigue pendiente; no se integra todavía esta rama en `main`.

### Publicación real del catálogo

El 16 de octubre de 2026 se publicaron las revisiones pendientes de las 124 identidades existentes y se validaron también las 16 actividades nuevas ya publicadas. Las 140 versiones vigentes ofrecen los tres lenguajes. Cada publicación se hizo mediante la acción administrativa existente, con `requireAdmin()`, sin escrituras directas del indicador de publicación: Piston comprobó cada referencia y cada plantilla contra todos los casos, la compilación estricta de TypeScript y la retirada de ayuda salvo en observación. En conjunto son 4320 evaluaciones de referencias y plantillas.

- La primera validación detectó 51 actividades históricas sin conceptos de práctica. Se añadieron conceptos específicos en `prisma/learning-metadata.ts`; no se relajó el requisito de publicación. La regresión de `tests/curriculum.test.ts` exige ahora también el esquema de publicación para todo el catálogo.
- Se publicaron 73 borradores existentes. Para las otras 51 identidades se guardó y publicó una versión nueva desde administración, conservando intacto el borrador anterior. Esos 51 borradores antiguos quedan como historial, no como revisiones vigentes pendientes. No se borraron ni renumeraron versiones.
- Se compararon huellas de las 264 versiones originales, 668 variantes y 3410 casos, además de identidades, usuarios existentes, preferencias, borradores de estudiantes, envíos, progreso, ayudas, auditoría anterior y rutas. Coinciden excluyendo únicamente los indicadores de publicación autorizados. Las 51 versiones añadidas se contrastaron íntegramente con el catálogo antes de publicarlas.
- Los dos actores técnicos de los intentos de publicación se conservan para mantener la auditoría, pero quedan con rol `USER`, sin cuentas de autenticación ni sesiones. No se modificaron credenciales ni privilegios de las cuentas existentes. La cuenta de un intento interrumpido de registro, sin actividad ni auditoría, se eliminó de forma focalizada.
- Previsualización posterior de `content:revisions`: 140 revisiones idénticas, sin escrituras ni conflictos. El catálogo local está publicado; GitHub guarda el contenido y las herramientas, no la base de datos ni un despliegue.
- Tras completar los conceptos pasan las 74 pruebas unitarias/editoriales, tipos y build. Lint no tiene errores y conserva los tres avisos previos. Las E2E posteriores detectaron expectativas anteriores a la publicación (tres casos ocultos en la suma en vez de seis, una pista antigua y la comparación con el enunciado común en lugar del adaptado por lenguaje); se contrastan ahora con la versión evaluada/publicada, manteniendo comprobaciones de cantidad, privacidad e inmutabilidad.
- Resultado final posterior a la publicación: 72/72 E2E en producción local con doble HTTP, 8/8 E2E reales y 8/8 pruebas focalizadas de Piston, sin omisiones. Los intentos interrumpidos no se contabilizan como aprobados. Una ejecución intermedia falló por PostgreSQL apagado; se inició el clúster privado y se repitió la suite completa. La comprobación final vuelve a confirmar las 140 versiones vigentes y las huellas originales intactas.
- En las E2E reales de desarrollo reapareció el aviso histórico `The destination stream errored while writing data`, además de un aviso de lentitud del sistema de archivos. Los ocho recorridos pasaron; no se atribuye una causa nueva ni se presenta el aviso de streaming como corregido. Los servidores temporales se cerraron al terminar.

Esta publicación no completa por sí sola la revisión pedagógica individual de todos los enunciados históricos ni autoriza a integrar anticipadamente la rama en `main`.

## Historial de verificaciones anteriores

Los apartados siguientes corresponden a entregas anteriores y no sustituyen las comprobaciones pendientes del rediseño.

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
- Navegación: `previousExerciseSlug` en `src/lib/learning-paths.ts` y dos botones con flecha en la cabecera del espacio de práctica permiten ir al ejercicio anterior y al siguiente, respetando el orden de la ruta cuando se llega desde ella y el orden del catálogo en caso contrario. Los extremos quedan deshabilitados. `exercisePosition` calcula la posición 1‑based en esa misma secuencia y la cabecera muestra «N de M» junto a las flechas, para que se vea dónde se está dentro de la ruta o del catálogo. Se mantiene el enlace «Continuar con otro ejercicio» después de resolver.
- `npm test` (45 pruebas), `typecheck`, `build` y `lint` aprobados. `npm run content:paths` sin `--apply` y `npm run content:metadata` sin `--apply` sirven como vista previa; ninguno toca datos de estudiantes.
- **No verificado en navegador:** no se ejecutó `npm run test:e2e` (requiere iniciar un servidor propio). La nueva navegación se comprueba solo con pruebas unitarias de la función de orden.

### Formato del ejercicio, feedback y experiencia de práctica

Entrega del 15 de octubre de 2026: mejora del formato del ejercicio y de la experiencia de práctica, sin reconstruir la aplicación ni tocar identificadores, versiones publicadas ni progreso. Cinco frentes:

- **Formato:** `ExerciseVersion` incorpora `complexity` (coste orientativo) y `commonErrors` (errores frecuentes), opcionales y vacíos por defecto. La interfaz los muestra solo cuando tienen contenido (`src/components/practice/exercise-notes.tsx`). `prisma/educational-exercise.ts` los deriva de `cost` y `mistakes` del contenido ya existente, y `npm run content:metadata -- --apply` completó 57 versiones publicadas sin alterar otros campos. Los ejercicios anteriores siguen sin estos apartados y la interfaz no muestra una sección vacía.
- **Feedback:** `src/lib/json-diff.ts` localiza la primera diferencia entre el resultado esperado y el obtenido; `results.tsx` la muestra en cada caso visible fallido. El cálculo ocurre en el navegador, sobre datos que el cliente ya recibe (solo casos visibles); no expone casos ocultos.
- **Espacio de práctica:** las preferencias del editor (tamaño del código, ancho del enunciado, altura de resultados, editor sencillo) persisten en `localStorage`; se añade «Copiar código» a las opciones; los atajos (Ctrl/⌘+Enter y Ctrl/⌘+Shift+Enter) se anuncian de forma coherente; el `ariaLabel` del editor usa el nombre del lenguaje.
- **Catálogo y progreso:** la búsqueda ignora mayúsculas y acentos (`searchNormalize`); el catálogo ofrece «Continúa donde lo dejaste»; cada fila indica si el ejercicio también está resuelto en el otro lenguaje (`solvedOther`).
- **Historial:** el espacio de práctica muestra los últimos intentos de ese ejercicio y el diálogo de restablecer plantilla enlaza a Mi progreso.

Resultados:

- `npm test`: 59 pruebas aprobadas (14 nuevas: 8 de `firstDifference`, 3 de `searchNormalize` y 3 del render de las notas del ejercicio). El resto de suites de contenido siguen en verde.
- `npm run typecheck`, `npm run lint` (sin errores; los mismos tres avisos previos en plantillas de `.agents/skills`) y `npm run build` aprobados.
- `prisma migrate dev` aplicó `20261015210055_add_complexity_and_common_errors`, con columnas aditivas y valores por defecto; no requiere reiniciar datos.
- `npm run content:metadata` previsualizó 57 versiones y las completó con `--apply`, sin tocar enunciados, pruebas, borradores, envíos ni progreso.
- **No verificado en navegador ni en Piston:** no se ejecutó `npm run test:e2e` ni la ejecución real. Docker y Piston siguen detenidos; esta entrega no acredita aislamiento ni ejecución en el sandbox.

### Modo programa y panel de salida

Entrega del 15 de octubre de 2026: dos capacidades que conviven con el modelo anterior, sin reconstruir la aplicación ni tocar identificadores, versiones publicadas ni progreso.

- **Modo programa** (`runtimeMode` por versión): `FUNCTION` (por defecto) sigue envolviendo `solve(data)` y comparando el valor devuelto; `PROGRAM` ejecuta el archivo como programa completo —sin envoltorio ni `module.exports`—, envía la entrada del caso tal cual a la entrada estándar y compara el texto impreso. `src/server/execution/piston.ts` construye el arnés; `judge.ts` añade `judgeProgram` con normalización de fin de línea y espacios finales; `service.ts`, `catalog.ts`, la validación editorial, el editor de administración y el espacio de práctica ramifican según el modo. La comparación sigue siendo por valor y fuera del sandbox, y las pruebas ocultas no exponen entrada, salida ni stderr.
- **Panel de salida:** `judge` y `judgeProgram` devuelven `output` (stdout) solo en los casos visibles. En modo programa el panel muestra la salida del programa frente a la salida esperada; en modo función muestra los `print`/`console.log` de depuración que la plantilla imprime antes del valor devuelto. `results.tsx` y `examples.tsx` renderizan texto en vez de JSON cuando el modo es programa.
- **Contenido:** `prisma/program-content.ts` abre «Desde cero» con cuatro actividades que se resuelven con un programa completo (`imprime-un-saludo`, `imprime-un-resultado`, `imprime-dos-lineas`, `lee-y-saluda`). Se insertan como identidades nuevas, con referencias fijas verificadas en Python y JavaScript; no se reescribe ni se reemplaza ninguna actividad publicada, y la ruta pasa de 8 a 12 pasos.

Resultados:

- `npm test`: 64 pruebas aprobadas. Las nuevas comprueban la comparación de texto del modo programa, la privacidad de las pruebas ocultas, los `print` de depuración visibles y que, en modo programa, la entrada y la salida esperada del contenido editorial sean texto. La verificación de referencias ejecuta las cuatro actividades de programa como archivo completo en Python y JavaScript y confirma que sus plantillas no resuelven los casos.
- `npm run typecheck`, `npm run lint` (sin errores; los mismos tres avisos previos en plantillas de `.agents/skills`) y `npm run build` aprobados.
- `prisma migrate dev` aplicó `20261015214458_add_runtime_mode`, con el valor por defecto `FUNCTION`; no requiere reiniciar datos.
- `npm run db:seed` insertó las cuatro identidades nuevas (124 en total) sin tocar el resto; `npm run content:paths -- --apply` dejó «Desde cero» en 12 pasos. En la base local las cuatro versiones quedan como `PROGRAM` y `tu-primer-resultado` permanece `FUNCTION`.
- **No verificado en Piston ni en navegador:** Docker y Piston siguen detenidos, así que no se ejecutó la validación real del arnés `PROGRAM` ni `npm run test:e2e`. Las referencias de las actividades de programa se verificaron en el runtime local (Python y Node), cuya salida coincide con lo esperado para estos programas sin dependencias; la publicación administrativa y el aislamiento del sandbox siguen pendientes de comprobar con Piston.

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

- `npm run test:runner` (`tests/real-runner.integration.ts`) llama al adaptador real y comprueba los runtimes, las soluciones de referencia dentro del sandbox y los veredictos en los tres lenguajes. Por defecto valida un subconjunto de cinco ejercicios en Python/JavaScript y cuatro en TypeScript; con `ITERA_RUNNER_ALL=1` valida el catálogo completo actual: 2160 ejecuciones de referencias. Se salta si el ejecutor no responde; TypeScript tiene su propia comprobación de disponibilidad.
- `npm run test:e2e:real` (`tests/real/flows.spec.ts`, `playwright.real.config.ts`) recorre la aplicación completa contra el sandbox: registro, aprobación real, rechazo de una respuesta distinta, tiempo agotado, errores de tipos, progreso independiente por lenguaje y publicación editorial que solo ocurre si las referencias y plantillas de tres lenguajes superan la validación. También comprueba que una referencia defectuosa impida publicar.

Resultado histórico anterior a Desde cero: 24 ejercicios aprobados (240 ejecuciones reales), 5 pruebas de integración y 6 recorridos reales en verde. Esto no valida los nuevos ejercicios ni las referencias modificadas: deben volver a ejecutarse contra Piston.

## Requisitos del ejecutor

Docker Engine con contenedores Linux, Compose y cgroup v2. El PC actual usa Ubuntu-24.04/WSL2 sin Docker Desktop y se controla manualmente mediante `docker-iniciar` y `docker-apagar`; se instalan con `scripts/install-docker-launchers.ps1`. El modo completo contiene también Next.js y PostgreSQL; véase [Docker completo](docker.md). Sin Piston, una instalación con catálogo activo permite navegar, pero no ejecutar ejercicios ni validar publicaciones; nunca se ejecuta código del usuario en Node o Python del servidor principal.

### Entorno Docker completo (21 de octubre de 2026)

- Build de la imagen Linux con Node 24.16.0, Prisma generado y Monaco local aprobado; Next.js compila sin necesitar una base activa. Node, PostgreSQL 18.3 y Piston quedan fijados por digest, y la preparación solicita versiones concretas de los tres lenguajes.
- Copia de la instalación Windows mediante `pg_dump`/`pg_restore`: **19 tablas** con recuentos y huellas de filas idénticos antes y después de las pruebas y del ciclo de apagado/encendido. Se normaliza UTC para no confundir diferencias de representación de fechas con pérdida de datos. La base original y el respaldo permanecen intactos; no se sincronizan automáticamente con Docker.
- Preparación desde una base temporal vacía: **11 migraciones**, **136 borradores** y preparación de los tres runtimes aprobadas. Se eliminó únicamente esa base temporal. No se ejecutó la activación completa de los 136 ejercicios en esa base nueva; la copia conservó el catálogo publicado existente.
- `npm test`: **112/112**. Typecheck y ESLint focalizado sin errores ni avisos. Lint completo sin errores y con **97 avisos en herramientas locales ajenas a la entrega** (`.agents` y `.opencode`), conservadas sin cambios. `npm audit --omit=dev`: cero vulnerabilidades; `npm ci` informa cinco de severidad alta en la cadena de herramientas de desarrollo, que no se actualizó fuera de alcance.
- `test:runner` ejecutado dentro de `app`: **8/8**, sin omisiones. `npm run docker:test:e2e`: **8/8** contra Next.js en Docker, la base Docker y Piston real; no usa el doble HTTP. Se corrigieron selectores antiguos del test para desplegar el detalle de error y localizar el estado actual del historial, sin debilitar comprobaciones ni cambiar la UI. Las ejecuciones intermedias fallidas no se cuentan como aprobadas.
- Prueba adicional de registro, recuperación, escritura del correo en el volumen persistente, restablecimiento de contraseña y nuevo inicio de sesión aprobada con una cuenta temporal; cuenta y archivo eliminados al finalizar. Respaldo de la base Docker restaurado en otra base temporal: **19 tablas con huellas idénticas**; base y archivo temporales del contenedor retirados.
- Inicio y parada mediante los nuevos lanzadores comprobados: los tres servicios se detienen ordenadamente, Ubuntu queda `Stopped` y la tarea tiene **cero disparadores automáticos**. Tras volver a iniciar, app y base saludables, datos conservados. PostgreSQL no publica puerto en el modo habitual; el puerto 55434 se añade solo durante E2E y se retira al finalizar.
- No se repitió la suite con doble HTTP ni la validación exhaustiva de todo el catálogo en Piston. Solo se comprobó este entorno Windows x64/WSL2; ARM, macOS y otros motores requieren verificación propia. No se presenta el contenedor privilegiado de Piston como una garantía absoluta de aislamiento.

### Sustitución local de Docker Desktop por Docker CLI

Durante la sustitución se prepararon Python 3.12.0, JavaScript/Node 20.11.1 y TypeScript 5.0.3. La primera ejecución de `npm run test:runner` tuvo cinco aprobadas y tres fallos de TypeScript por tiempos agotados. Se observaron saltos del reloj entre Ubuntu y Windows; tras desactivar la sincronización NTP independiente de Ubuntu, la suite completa aprobó **8/8, sin omisiones**. No se modificó el código del ejecutor.

Se comprobó después el encendido mediante `docker-iniciar`, la respuesta HTTP de los tres runtimes y el apagado mediante `docker-apagar`. Ubuntu quedó `Stopped` y la tarea `Docker-WSL` sin disparadores automáticos. Node, PostgreSQL y la carpeta del proyecto permanecen en Windows. No se ejecutaron E2E ni se validó de nuevo el catálogo completo en esta instalación; los resultados históricos conservan su alcance original.

## Dependencias

`npm audit --omit=dev` no reporta vulnerabilidades en las dependencias de producción en la revisión inicial. Se fijan parches de DOMPurify y mysql2, y una versión compatible corregida de deepmerge-ts mediante `overrides`.

La auditoría completa aún informa la cadena `eslint-config-next → fast-glob → micromatch → braces` en herramientas de desarrollo. La versión publicada de `braces` consultada no tiene corrección; no se ha degradado Next.js ni ocultado el aviso. Las entradas de estos analizadores proceden de los archivos del proyecto.

## Repetir la comprobación

Con PostgreSQL iniciado, Piston disponible en el puerto 2000 y el puerto 3000 libre (autorizar antes el servidor temporal de las E2E):

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
