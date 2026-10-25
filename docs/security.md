# Seguridad local

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
- El endpoint de ejecución lee como máximo 40.000 bytes antes de rechazar el
  cuerpo con 413, sin depender de `Content-Length`. Cancela el flujo al exceder
  el límite y conserva 400 para JSON o UTF-8 inválido. El límite del código sigue
  siendo de 30.000 caracteres; un cuerpo con caracteres multibyte puede alcanzar
  antes el límite HTTP de bytes, como ya ocurría con una longitud declarada.

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

### Pendientes fuera de la primera entrega

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
