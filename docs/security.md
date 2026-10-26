# Seguridad local

## Estado final de la revisión local (25 de octubre de 2026)

**Revisión cerrada. Los dos pasos finales están completados: autorización de
diagnósticos y consolidación de este estado. No quedan tareas programadas dentro
del alcance local acordado.** Esto no certifica ausencia de vulnerabilidades ni
convierte Itera en un servicio apto para Internet.

| Área | Estado vigente y evidencia |
| --- | --- |
| Secretos y dependencias | Historial revisado sin secretos reales encontrados; actualizaciones y auditorías de dependencias documentadas en las primeras entregas. No se ha ejecutado una nueva auditoría de dependencias en el cierre. |
| Autenticación | Límites locales, política de nuevas contraseñas y recuperación comprobados. Cabeceras, cookies, recuperación y revocación verificadas en Chromium. |
| Privacidad HTTP | Cabeceras básicas, `no-referrer`, permisos de dispositivos y `no-store` de autenticación comprobados; no se añadió HSTS al HTTP local ni CSP sin validar sus integraciones. |
| Intentos y borradores | Pruebas de código y cinco repeticiones reales de acceso cruzado entre cuentas aprobadas. Concurrencia optimista conservada. |
| Diagnósticos | Revisados lectura, inicio, guardado, finalización y reserva de ejecución. Nuevas pruebas con fronteras simuladas aprobadas; detalles en la undécima entrega. |
| Respaldos | Creación exclusiva y limpieza ante fallos probadas; restauración real de 22 tablas aprobada. Dumps sin cifrado automático: conservarlos en almacenamiento externo cifrado. |
| Piston | Límites declarados aplicados y sondas reales aprobadas. Sigue privilegiado y sin presupuesto global Docker de memoria/CPU/PIDs; no se certifican escapes ni comportamiento bajo carga. |
| ACL de Windows | **Omitido por decisión del usuario**, no resuelto. No se modificaron permisos; persiste el riesgo de acceso local a secretos, correo y respaldos. |
| Publicación en Internet | **Fuera de alcance.** Exigiría HTTPS, orígenes/proxy explícitos, recuperación privada al titular, privilegios mínimos de base, límites distribuidos y reevaluar el aislamiento de Piston. No desplegar asumiendo que esta revisión lo cubre. |

### Límites del cierre

- Las pruebas nuevas de diagnósticos ejecutan la página, acciones y endpoint reales
  con dobles de sesión/base/runtime. No verifican PostgreSQL, cookies, transporte
  de Server Actions o Piston reales en ese flujo. No se presenta esa prueba E2E
  omitida como aprobada ni se abre automáticamente otra entrega para ella.
- Las sondas de Piston y la restauración tienen el alcance limitado descrito en
  sus entregas; no garantizan aislamiento absoluto ni recuperación de roles,
  secuencias, otros esquemas o acceso de una app restaurada.
- No se iniciaron servicios para el cierre ni se cambiaron datos, permisos o
  dependencias. Se conserva el trabajo local ajeno.

## Undécima entrega: diagnósticos y cierre del alcance

- Revisadas `src/server/learning-actions.ts`, la página de diagnóstico y la reserva
  en `POST /api/executions`. Los filtros ya vinculan diagnóstico/ítem a la sesión;
  la reserva revalida propietario, variante y estado dentro del bloqueo compartido
  con la finalización. No se encontró una omisión que requiriera cambiar producción.
- `tests/diagnostic-authorization.test.ts`: siete escenarios y su contenedor
  comprueban lectura ajena/inexistente rechazada, lectura propia con casos visibles,
  `userId` falsificado, revisión obsoleta y diagnóstico cerrado, finalización ajena,
  espera de evaluaciones e idempotencia al finalizar, y rechazo de ejecución con
  ítem ajeno, variante incorrecta o diagnóstico cerrado antes de reservar/programar.
- También simulan cierre entre la comprobación inicial y la reserva transaccional:
  no se crea envío. El caso autorizado reserva con el usuario de sesión y programa
  la evaluación sin ejecutarla. Se comprueban el perfil propio al iniciar y rechazo
  de invitado, entrada inválida y origen no permitido.
- Primera carga de la prueba falló por resolución de la ruta codificada de la
  página; tipos detectó una autorreferencia del doble de base. Ambos defectos de
  la prueba se corrigieron, sin cambios de aplicación. Prueba focalizada: ocho
  aprobadas, ninguna omitida.
- Verificación del cierre: `npm test` **180 aprobadas, ninguna omitida**;
  `npm run typecheck` aprobado; lint sin errores y los 97 avisos locales previos.
  No se repitió build porque solo cambian pruebas y documentación. No se ejecutó
  E2E de diagnósticos ni se inició ningún servicio; WSL se comprobó apagado.
- Se consolidó la tabla vigente y se separaron omisiones y trabajo para Internet.
  **No hay un nuevo siguiente paso dentro de esta revisión.**

## Historial de entregas anteriores

Las entradas siguientes conservan lo que se verificó y quedó pendiente **en ese
momento**. Sus apartados «Siguiente paso» y «Pendientes» son históricos, no una
lista de tareas activa. El estado vigente es exclusivamente el resumen de cierre
anterior; las entregas posteriores resuelven o reclasifican esos puntos.

## Décima entrega: autorización real con dos cuentas (25 de octubre de 2026)

- Con autorización expresa se inició WSL/Docker y la app de producción. Se reutilizó
  la imagen ya actualizada: los SHA-256 de acciones, catálogo y consulta de intentos
  dentro del contenedor coinciden con el código local. No se cambió producción ni
  se ejecutaron seed, migraciones o cambios de permisos.
- `tests/docker/user-authorization.spec.ts` usa dos sesiones aisladas de Chromium,
  dos cuentas y un ejercicio aleatorios. El endpoint devuelve 200 y `no-store` al
  propietario, 404 indistinguible de un ID inexistente a otra cuenta y 401 al invitado.
  También se comprobó el acceso cruzado en sentido inverso.
- El historial y el autoguardado se capturan desde peticiones normales de la
  interfaz. Sus Server Actions se reenvían con las cookies de la otra sesión y un
  `userId` falsificado: el historial solo devuelve intentos propios y omite detalles
  de casos; una revisión ajena produce conflicto sin revelar ni modificar código.
- Crear/actualizar con identidad falsificada solo escribe para el usuario de sesión;
  una revisión obsoleta conserva el borrador y el guardado anónimo se rechaza.
  Se verificaron código y revisiones en PostgreSQL tras las peticiones manipuladas.
  Después de borrar las copias locales de esos contextos, HTML y editor recargados
  solo contienen el borrador propio. No se concede progreso.
- El recorrido inicial aprobó; tras ampliar la comprobación inversa, **cinco
  repeticiones completas aprobaron, ninguna omitida**, sin reiniciar la app entre
  ellas. Los accesos respetan `Retry-After`. Tipos y lint aprobados, con los 97 avisos
  locales previos. Se reutiliza la suite general reciente de 172 pruebas: no cambió
  su código ni producción. No se repitió build ni la suite editorial completa.
- Limpieza final comprobada por SQL: cero usuarios y ejercicios del prefijo temporal
  `authorization-`; las relaciones de sus intentos/borradores se eliminan en cascada.
  El lanzador retiró el puerto 55434 (`PortBindings={}`). App, base y Piston se
  detuvieron, la tarea manual quedó sin ejecución ni disparadores y WSL apagado.
- Límites: los intentos son fixtures sintéticos guardados en PostgreSQL real, no
  evaluaciones nuevas de Piston. Se acredita autorización de estas rutas/acciones,
  no aislamiento del ejecutor ni todos los endpoints de la aplicación. Las trazas
  de fallo pueden contener datos temporales y deben mantenerse privadas.

**Siguiente paso:** ampliar la revisión y las pruebas de autorización a diagnósticos
(lectura, borradores e identificadores usados al ejecutar), empezando sin servicios.

## Novena entrega: regresión de autorización entre cuentas (25 de octubre de 2026)

- Revisados el endpoint de consulta de intentos, el historial por ejercicio y el
  guardado de borradores: ya usan la identidad de sesión para sus filtros o altas.
  No se encontró una omisión de autorización en esos puntos ni se cambió código
  de producción, dependencias, interfaz o permisos de Windows.
- `tests/user-authorization.test.ts` importa el handler y las acciones reales,
  sustituyendo sesión, base y reconciliación por dobles mediante hooks de Node.
  Los hooks se retiran en `finally` y no se inicia ningún servicio.
- Cinco escenarios comprueban: intento ajeno indistinguible de uno inexistente
  (404), acceso del propietario con `no-store`, historial que ignora `userId`
  falsificado y selecciona solo el resumen, rechazo de revisiones de borradores
  ajenos sin devolver su contenido, creación/actualización con identidad propia
  y concurrencia optimista, y ausencia de consultas/escrituras sin sesión o con
  entradas inválidas. Las aserciones del filtro de actualización se hacen fuera
  del doble para que el `catch` de la acción no pueda ocultar un fallo de prueba.
- Verificación: prueba focalizada aprobada; suite general **172 pruebas aprobadas**
  (incluye el contenedor y cinco subpruebas nuevos), tipos aprobados y lint sin
  errores, con los 97 avisos previos de herramientas locales. No se repitió build:
  solo se añadieron pruebas y documentación, sin cambios de producción.
- Límite: estas pruebas verifican los filtros y respuestas del código real con
  dobles, no el aislamiento efectivo de PostgreSQL, las cookies ni el transporte
  de Server Actions. No se ejecutaron E2E ni se inició Docker/WSL/Next.

**Siguiente paso:** verificar estos accesos cruzados con dos cuentas temporales
en PostgreSQL y navegador reales, acordando antes el arranque del entorno.

## Octava entrega: privacidad HTTP verificada en navegador (25 de octubre de 2026)

- Autorización expresa para iniciar WSL/Docker, reconstruir la app y verificar
  cabeceras/acceso/recuperación con cuentas temporales. ACL de Windows fuera de
  alcance. Se reconstruyó y recreó la app de producción, sin seed ni migraciones.
- Nuevo recorrido Docker en Chromium: `tests/docker/http-security.spec.ts`,
  integrado en la configuración Docker pero no en la suite nativa con doble HTTP.
  Comprobó cabeceras recibidas, capacidades de cámara/micrófono/geolocalización
  denegadas y ausencia real de `Referer` en una petición local del navegador.
- Registro y acceso funcionaron con cookies HttpOnly/SameSite=Lax y `no-store`.
  La interfaz rechazó una clave común; el enlace de recuperación se leyó de su
  archivo real en el volumen de la app. Restablecer revocó las sesiones anteriores,
  la clave antigua recibió 401, la nueva permitió entrar y el token reutilizado
  recibió 400. Las respuestas sensibles conservaron `no-store`.
- Primera ejecución con dos pruebas: falló un selector ambiguo por el anunciador
  de Next. La siguiente detectó un fallo de extracción en la propia prueba: el
  correo temporal empezaba por `http-` y se confundía con una URL. Ambos corregidos,
  sin cambios en la app. El recorrido completo aprobó y luego se repitió dos veces:
  **4 ejecuciones aprobadas, ninguna omitida**, sin reiniciar la app entre ellas.
  Los reintentos por 429 respetan `Retry-After`, sin desactivar el limitador.
- La limpieza y consultas finales confirmaron cero usuarios y correos del prefijo
  temporal `http-security-` restantes. El puerto PostgreSQL temporal 55434 se retiró
  y `PortBindings` quedó vacío; app/base/Piston se detuvieron y WSL quedó apagado.
  No se borraron datos existentes ni se cambiaron permisos.
- El lanzador `docker:test:e2e` ahora reenvía argumentos a Playwright para poder
  seleccionar este archivo y sus repeticiones, manteniendo `finally` para retirar
  el puerto. Uso en [docker.md](docker.md#actualización-y-verificación).
- `npm test`: **166 aprobadas**, incluida una nueva con procesos sintéticos que
  verifica el reenvío de argumentos y la retirada del puerto cuando Playwright
  falla. Tipos y lint aprobados; lint conserva los 97 avisos locales previos.
  Build Docker aprobado; `npm ci` informó cero vulnerabilidades y un aviso previo
  de obsolescencia de ESLint, sin actualizar dependencias en esta entrega.
- No se ejecutó la suite completa editorial o
  de ejecución: no es necesaria para este cambio de pruebas/cabeceras y conserva
  las verificaciones anteriores, sin presentarlas como resultados nuevos.

**Siguiente paso:** reforzar las pruebas de autorización entre cuentas en consultas
de intentos y borradores, sin reabrir la tarea de ACL omitida por el usuario.

## Séptima entrega: privacidad HTTP (25 de octubre de 2026)

- Por indicación del usuario se omite la tarea de ACL de Windows. No se modifican
  permisos ni se inicia ningún servicio; el riesgo local sigue pendiente.
- `Referrer-Policy: no-referrer` evita enviar la URL de origen en `Referer`, incluso
  entre rutas de Itera. Reduce la circulación de consultas sensibles, como tokens
  de recuperación; no borra historial, logs existentes ni direcciones visitadas.
- `Permissions-Policy: camera=(), microphone=(), geolocation=()` deshabilita esas
  capacidades en navegadores compatibles. No hay usos de esas APIs en la app.
  Se conservan `nosniff`, `X-Frame-Options: DENY` y la ausencia de `X-Powered-By`.
- El handler público GET/POST de Better Auth marca sus respuestas devueltas como
  `Cache-Control: no-store`, incluidos errores y redirecciones. No depende de que
  cada endpoint lo haga individualmente; no cambia cuerpos, estados ni cookies.
  No cubre errores generados por Next antes de ejecutar el handler ni sustituye
  autenticación, comprobación de origen o revocación de sesiones.
- Cuatro pruebas nuevas comprueban configuración, respuestas con varias cookies,
  redirecciones inmutables y errores, además del handler real Better Auth en
  memoria para GET, registro y peticiones inválidas. El origen no permitido sigue
  recibiendo 403; su log `Invalid origin` es esperado en esa prueba negativa.
  No se usa PostgreSQL.
- `npm test`: **165 aprobadas**. Tipos y build aprobados; el manifiesto generado
  contiene las nuevas cabeceras. Lint sin errores y 97 avisos previos en herramientas
  locales ajenas. E2E y navegador no ejecutados: no se inició Next/Docker/WSL.
- No se añade HSTS a HTTP local ni una CSP sin validar Monaco, workers y Next.
  Las cabeceras no son un remedio para XSS o para permisos de archivos demasiado
  amplios. La imagen Docker existente debe reconstruirse y recrearse manualmente
  para aplicar el cambio. Se conservan los cambios locales ajenos.

**Siguiente paso:** comprobar estas cabeceras y los flujos de acceso/recuperación
en el servidor y navegador reales, con autorización de arranque, para validar la
integración más allá del handler en memoria. La tarea de ACL queda omitida por
decisión del usuario, no resuelta.

## Sexta entrega: comprobación real autorizada (25 de octubre de 2026)

- Autorización expresa para iniciar WSL/Docker y servicios necesarios, recrear
  Piston y restaurar en una base temporal sin sobrescribir la base de uso diario.
  No incluye cambiar ACL de Windows. Next permaneció detenido.
- Cinco sondas reales de Piston aprobadas, ninguna omitida; ocho pruebas del
  ejecutor real aprobadas, ninguna omitida, tras mantener WSL con su tarea manual.
  Imagen, montajes, cgroups y configuración cargada revisados; evidencia y límites
  en [runner-security.md](runner-security.md#verificación-autorizada-25-de-octubre-de-2026).
  Siguen `privileged=true` y la ausencia de techo global de recursos del contenedor.
- Nueva prueba optativa `npm run test:backup:real`, habilitada exclusivamente con
  `ITERA_BACKUP_RESTORE=1`: usa el exportador de respaldos real y una base nueva
  de nombre aleatorio; compara las tablas públicas sin imprimir filas ni huellas.
  No restaura ni escribe datos de prueba en la base principal.
- Restauración real aprobada: **22 tablas públicas**, mismos nombres, recuentos
  y huellas entre origen previo, copia restaurada y origen posterior. `pg_restore`
  terminó sin errores en una transacción y la base temporal fue eliminada;
  consulta posterior confirmó cero bases `itera_restore_check_*` restantes.
- Se conserva el respaldo real
  `.local/backups/restore-check-1792912914779-54b937ddd60e434e99a8060344323303.dump`,
  ignorado por Git/Docker y sin cifrar. No se publican sus datos ni credenciales.
  No se probaron otros esquemas, secuencias, roles, otra versión mayor ni el
  inicio de sesión de una app restaurada. Uso en [docker.md](docker.md#comprobación-real-de-restauración).
- `npm test`: 161 aprobadas; tipos aprobados y lint sin errores, con los 97 avisos
  locales previos. Se comprobó también la protección de la nueva prueba sin su
  variable: una omisión intencionada, sin contactar Docker. No se repitió build
  porque no cambian código de Next ni dependencias; E2E no ejecutado.
- Los servicios iniciados y la tarea se detuvieron al terminar; WSL quedó apagado.
  No se recreó la app ni se reconstruyó su imagen, no se modificaron ACL y se
  conservaron los cambios locales ajenos.

**Siguiente paso:** acordar la restricción de ACL de Windows sobre secretos y
respaldos, identificando antes los usuarios que deben conservar acceso. Para un
futuro servicio público hace falta diseñar otra frontera operativa del ejecutor;
estas pruebas locales no habilitan por sí solas un despliegue online.

## Quinta entrega: protección de respaldos (25 de octubre de 2026)

- `backup` e `import-local` comparten creación exclusiva del archivo: `pg_dump`
  escribe en un descriptor reservado con `wx+` y modo solicitado `0600`, sin
  reabrir/truncar la ruta después de una comprobación de existencia.
- Ambas exportaciones escriben directamente al archivo, sin acumular el dump en
  el búfer de Node. Se sincroniza antes de anunciar éxito; fallos del productor,
  salida vacía o cabecera incorrecta eliminan la copia parcial de esa operación.
  No se borran respaldos previos. Una interrupción forzada puede dejar un parcial;
  la cabecera solo detecta errores básicos, no acredita integridad/restaurabilidad.
- Los informes `*.dump.*.verification.json` quedan excluidos de Git y Docker,
  igual que los `.dump`. Los directorios nuevos solicitan modo POSIX `0700`;
  no se cambian ACL de Windows ni permisos existentes.
- [La guía Docker](docker.md#respaldo-y-restauración) aclara que el dump no está
  cifrado y puede contener datos personales, hashes y tokens; recomienda copia
  externa cifrada, conservación privada de secretos, retención y restauración de
  prueba. Se documentan los límites del método manual y los nombres personalizados.
- Verificación: seis pruebas nuevas con archivos sintéticos y un proceso Node,
  sin Docker, PostgreSQL ni datos reales. Comprueban exclusividad, bytes binarios,
  limpieza/reintento y rechazo de salida inválida, además de las exclusiones.
  `npm test`: 161 pruebas aprobadas; `node --check scripts/docker-data.mjs` y tipos:
  aprobados. Lint sin errores; conserva los 97 avisos locales ajenos.
- No se repitió el build: no cambian la aplicación Next, dependencias ni su
  compilación. No se ejecutaron E2E ni una copia/restauración con PostgreSQL real.
- No se cifran ni trasladan respaldos existentes y no se inicia ningún servicio.
  La exportación/restauración real sigue pendiente de autorización operativa.

**Siguiente paso:** verificar restauración y aislamiento de Piston en el entorno
real con autorización, y restringir las ACL de secretos/respaldos con permiso
separado. Las tareas pendientes requieren esas comprobaciones; más cambios de
código no las sustituyen.

## Cuarta entrega: límites declarados y sondas de Piston (25 de octubre de 2026)

- Compose explicita compilación (8 s de pared/CPU), descriptores (2048) y tamaño
  de archivo (10.000.000 bytes nominales). Mantiene red deshabilitada, memoria,
  salida, procesos y concurrencia existentes; no cambia el modo privilegiado.
- Nueva suite optativa `npm run test:runner:security`, con cinco sondas acotadas
  enviadas por el adaptador real: red, rutas/variables privadas, separación de
  archivos entre trabajos, límite efectivo de archivo y exceso finito de salida.
  Sin `ITERA_RUNNER_SECURITY=1` no contacta el ejecutor; con ella, los fallos de
  infraestructura no se omiten. Uso, alcance y carencias en
  [runner-security.md](runner-security.md).
- No se añaden dependencias ni presupuestos globales de contenedor sin medición.
  Cuatro trabajos no constituyen un techo global de memoria, el límite de archivo
  no es una cuota de disco y estas sondas no certifican ausencia de escapes.
- Metadatos de Impeccable actualizados al movimiento UIArc y muestra estática del
  botón corregida (escala 0.97, tamaños adaptables y movimiento reducido).
  `DESIGN.md` y la interfaz no cambian. `impeccable doctor --json`: sin hallazgos.
- `npm test`: 155 pruebas aprobadas, incluida una nueva de declaraciones Compose.
  Tipos aprobados; lint sin errores y los 97 avisos locales previos.
  La suite nueva se cargó con **cinco omisiones**, no cinco aprobados: todavía
  no hay autorización para ejecutarla contra Piston.
- No se repitió el build de la tercera entrega: no cambia código de la app,
  dependencias ni su compilación. No se ejecutaron E2E ni sondas reales; no se
  iniciaron servicios, Docker o WSL, ni se modificaron permisos de Windows.
  Compose no se validó mediante Docker para evitar activar WSL; su comprobación
  automatizada es estática, no un análisis completo de YAML/Compose.
- Para aplicar Compose hay que recrear Piston manualmente; reconstruir solamente
  la aplicación no aplica sus nuevos valores.

**Siguiente paso:** con autorización operativa, aplicar la configuración y ejecutar
las sondas contra Piston, inspeccionando imagen, montajes y cgroups efectivos.
Sin iniciar servicios, la siguiente revisión posible es la protección de respaldos.
Las ACL de Windows siguen pendientes de autorización independiente.

## Tercera entrega: nuevas contraseñas (25 de octubre de 2026)

- Política compartida por servidor y formularios: entre 10 y 128 caracteres,
  rechazo de una lista local acotada de claves comunes y sus sufijos numéricos,
  secuencias ascendentes/descendentes conocidas y bloques repetidos de hasta
  cuatro unidades UTF-16. También detecta variantes de mayúsculas, acentos,
  caracteres de ancho completo y separadores intercalados.
- La normalización solo sirve para reconocer esos patrones. No recorta ni cambia
  la contraseña enviada al hash. Se aceptan frases, espacios, Unicode y claves
  generadas sin imponer tipos de caracteres. No es un medidor de entropía ni una
  consulta a contraseñas filtradas; que una clave pase no garantiza que sea segura.
- El hook de Better Auth valida registro, cambio y recuperación aun en llamadas
  HTTP directas. Los formularios muestran el motivo mediante los avisos existentes,
  sin cambios de composición, colores o controles.
- No se aplica la nueva regla al inicio de sesión ni a la contraseña actual:
  las cuentas existentes siguen pudiendo entrar y cambiar su clave. Se conservan
  el hash scrypt, los controles de sesión y la recuperación local.
- `npm test`: 154 pruebas aprobadas, seis nuevas. Los tres flujos usan el handler
  real de Better Auth con un adaptador en memoria, sin servidor ni PostgreSQL.
  Se comprueba rechazo sin crear cuentas o cambiar hashes, acceso con una clave
  histórica y que una recuperación rechazada no consuma el token. La recuperación
  válida sigue revocando sesiones y no permite reutilizar ese token.
- `npm run typecheck`, `npm run build` y lint: aprobados; lint conserva los 97
  avisos ajenos de herramientas locales. Se reutiliza la auditoría de dependencias
  de la segunda entrega, pues no cambió el manifiesto, lockfile ni la instalación.
- No se iniciaron servicios ni se ejecutaron E2E o revisión visual en navegador.
  El detector mecánico solo señaló el tamaño preexistente del título del acceso;
  no se modificó. La prueba en memoria no certifica la integración con PostgreSQL.
- Se conservan las ACL y los cambios locales ajenos. Docker requiere reconstrucción
  manual para recibir esta entrega.

**Siguiente paso de aquella entrega (preparado en la cuarta):** revisar los límites globales y preparar pruebas de aislamiento
de Piston. Ejecutarlas contra el sandbox real requiere autorización para iniciar
el entorno. Corregir los permisos de Windows sigue pendiente de autorización
separada; ninguna de estas entregas sustituye esas dos verificaciones.

## Segunda entrega: dependencia transitiva (25 de octubre de 2026)

- `fast-uri` pasa de 3.1.8 a 3.1.9, versión corregida compatible con el rango
  `^3.0.1` requerido por Ajv en la cadena de herramientas de Prisma.
- Solo cambia esa entrada de `package-lock.json`: sin overrides nuevos, cambios
  de versión de Prisma ni dependencias directas adicionales.
- `npm audit --ignore-scripts --package-lock-only --json`: aprobado, sin
  vulnerabilidades conocidas, incluidas las dependencias de desarrollo. Esto
  no certifica que la aplicación carezca de vulnerabilidades propias.
- `npm test`: 148 pruebas aprobadas; `npm run typecheck` y `npm run build`:
  aprobados. El build regenera Prisma sin conectar a PostgreSQL ni migrar datos.
- Se reutiliza el lint de la primera entrega: no cambió ningún archivo de código
  ni la cadena ESLint. Se conservan sus 97 avisos de herramientas locales ajenas.
- No se ejecutaron E2E ni pruebas de Piston ni se iniciaron servicios. No se
  modificaron permisos locales. La imagen Docker existente requiere reconstrucción
  manual para recibir ambas entregas.

**Siguiente paso de aquella entrega (resuelto en la tercera):** rechazar contraseñas comunes y patrones
triviales en registro, cambio y recuperación, con validación del servidor y
pruebas de los tres flujos; sin servicios externos ni reglas arbitrarias de símbolos.
Las ACL y la comprobación real del sandbox siguen requiriendo autorización aparte.

## Primera entrega (25 de octubre de 2026)

### Cambios verificados

- Next.js y `eslint-config-next` pasan de 16.4.0 a 16.4.3. El lockfile queda
  actualizado sin cambiar las demás dependencias directas. Se corrige, entre
  otros avisos, la denegación de servicio de Server Actions
  [GHSA-p3m5-59mp-jv5r](https://github.com/advisories/GHSA-p3m5-59mp-jv5r).
- Better Auth ignora todas las cabeceras de IP al calcular el cupo local. Los
  clientes comparten un contador por ruta: variar `X-Forwarded-For`, `X-Real-IP`
  o `CF-Connecting-IP` no concede otro cupo. No se desactiva el seguimiento de IP
  con `disableIpTracking`, porque eso podría omitir el limitador. En producción,
  Better Auth puede advertir que usa un contador compartido al no resolver una IP;
  ese comportamiento es intencionado para esta instalación exclusivamente local.
- El endpoint de ejecución lee como máximo 184.096 bytes antes de rechazar el
  cuerpo con 413, sin depender de `Content-Length`. Cancela el flujo al exceder
  el límite y conserva 400 para JSON o UTF-8 inválido. El límite del código sigue
  siendo de 30.000 unidades UTF-16 (`String.length`), como en el editor y las
  copias recuperables. El presupuesto reserva seis bytes por unidad para escapes
  JSON y 4.096 para metadatos; Unicode válido y escapes no agotan antes el límite.
  El código que excede su límite recibe 400; un cuerpo con bytes sobrantes recibe
  413 aunque contenga código corto. Valores compartidos en `execution-limits.ts`.

No se cambian cookies, CSRF, permisos, roles, esquema ni evaluación del progreso.
No se añaden servicios ni dependencias.

### Comprobaciones

- `npm test`: 148 pruebas aprobadas, incluidas siete nuevas de seguridad.
- `npm run typecheck`: aprobado.
- `npm run lint`: sin errores; 97 avisos en `.agents/` y `.opencode/`, herramientas
  locales sin seguimiento que no se modificaron.
- `npm run build`: aprobado con Next.js 16.4.3; sin iniciar la aplicación.
- `npm audit --omit=dev --ignore-scripts --package-lock-only --json`: ya no
  informa de Next.js; termina con código 1 por el aviso moderado previo de
  `fast-uri` 3.1.8, perteneciente a la cadena de herramientas de Prisma. No se
  presenta la auditoría completa como aprobada.
- No se ejecutaron E2E ni pruebas del ejecutor real: requieren servicios y el
  alcance aprobado no autoriza iniciarlos. La prueba de autenticación usa el
  handler real de Better Auth en memoria, sin servidor ni base de datos.

### Pendientes históricos fuera de la primera entrega

- Restringir las ACL de Windows de secretos y datos privados, previa autorización.
- Verificar el aislamiento real y los límites globales de Piston, previa
  autorización para iniciar el entorno. No se certifica el sandbox con estas pruebas.
- Revisar la protección de respaldos. El aviso de `fast-uri` quedó resuelto en
  la segunda entrega y la política de nuevas contraseñas en la tercera.
- Antes de publicar: HTTPS, orígenes del entorno, recuperación entregada al
  titular, usuario PostgreSQL de privilegios mínimos y frontera explícita de proxy.
  El contador local compartido no sustituye un diseño de límites para Internet.
- Una instalación Docker existente necesita reconstruir la imagen y recrear la
  app manualmente para recibir los cambios; esta entrega no realiza esa operación.
