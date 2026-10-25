# Seguridad local

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

**Siguiente paso de solo código:** rechazar contraseñas comunes y patrones
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
- Revisar la política de contraseñas y la protección de respaldos. El aviso de
  `fast-uri` quedó resuelto en la segunda entrega.
- Antes de publicar: HTTPS, orígenes del entorno, recuperación entregada al
  titular, usuario PostgreSQL de privilegios mínimos y frontera explícita de proxy.
  El contador local compartido no sustituye un diseño de límites para Internet.
- Una instalación Docker existente necesita reconstruir la imagen y recrear la
  app manualmente para recibir los cambios; esta entrega no realiza esa operación.
