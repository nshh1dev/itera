# Optimización general de Itera

## Alcance implementado — 18 de octubre de 2026

- Inicio consulta catálogo, último borrador, rutas e historial en paralelo.
  El catálogo y el detalle de ruta también solapan sus lecturas independientes.
- La ficha de práctica solapa ejercicio, catálogo y ruta. El historial comienza
  cuando se conoce el ejercicio, sin esperar al catálogo ni a la ruta.
- Inicialmente se separó el detalle de una variante de sus metadatos. La medición
  posterior mostró más latencia por la consulta adicional, por lo que se recuperó
  la lectura original de variantes. Se conservan versión publicada, filtros de
  casos visibles, borradores por usuario y paralelismo entre lecturas independientes.
- `src/server/activity.ts` comparte las consultas del último borrador y del
  historial, manteniendo filtros, límites y selección de campos anteriores.
- El HTML inicial de práctica incluye el marco, el enunciado y los ejemplos.
  El editor espera a hidratar para recuperar el código local, la transferencia
  de invitado y las preferencias. Se mantiene el límite de 30 000 caracteres y
  el guardado local inmediato del código.
- Enunciado/ejemplos y resultados usan límites de memoización específicos. Al
  editar código, los resultados no repiten diferencias ni serialización JSON si
  sus datos no cambiaron. No se ha aplicado memoización generalizada.
- El arrastre de paneles agrupa actualizaciones por frame y persiste al soltar,
  cancelar o perder captura. El teclado sigue confirmando cada paso.
- El editor sencillo reconoce Ctrl/⌘+Enter y Ctrl/⌘+Shift+Enter. «Ir al código»
  traslada el foco al editor o a su panel si Monaco todavía no está preparado.

No cambian el esquema, las dependencias, las versiones editoriales, los tokens
visuales, el protocolo de evaluación ni la caducidad de envíos. La reconciliación
global del seguimiento se conserva: reducirla estaba condicionado a medir su
coste, no a suponer que constituye un cuello de botella.

## Verificación realizada

- `npm run typecheck`: aprobado durante la implementación; el build posterior
  también comprobó TypeScript, incluidas las pruebas añadidas.
- `npm test`: 81/81 aprobadas, sin omisiones. Incluye referencias fijas del
  repositorio; no equivale a ejecutar programas enviados en Piston.
- `npm run build`: aprobado, sin iniciar la aplicación ni migrar datos.
- `npm run lint`: sin errores. 97 avisos en herramientas locales sin seguimiento
  de `.agents/` y `.opencode/`, ajenas a esta entrega; ninguno en la aplicación.
  La revisión focalizada posterior de `src` y la nueva prueba E2E no tiene avisos.
- Detector de interfaz sobre los tres archivos modificados de práctica: sin
  hallazgos. No sustituye comprobaciones visuales ni una auditoría WCAG.
- Se añaden siete recorridos en `tests/e2e/workspace-optimization.spec.ts`:
  contenido sin JavaScript, foco y borrador móvil, cuatro combinaciones de
  atajos y persistencia del arrastre.
  `playwright test ... --list` descubre los siete; no los ejecuta ni inicia servidores.

Las comprobaciones anteriores corresponden a la implementación inicial. La
verificación sobre el servidor iniciado manualmente se recoge a continuación.

## Verificación sobre el servidor del usuario

El usuario inició Next en desarrollo y PostgreSQL. No se inició, reinició ni
detuvo ningún servidor. Una configuración temporal de Playwright, sin
`webServer`, ejecutó únicamente los recorridos públicos que no necesitan Piston,
sin cuentas ni escrituras en PostgreSQL:

- **14/14 aprobados:** los siete de `interface.spec.ts` y los siete de
  `workspace-optimization.spec.ts`. Incluyen 320/768/1024/1200/1440 px, temas,
  movimiento reducido, teclado, foco y persistencia local.
- Revisadas las capturas actuales de práctica clara/oscura, práctica a 320 px y
  catálogo oscuro a 390 px. El encabezado de práctica a 320 px queda muy estrecho
  y algunas etiquetas del catálogo se parten; son aspectos a revisar de forma
  focalizada, no una certificación completa de accesibilidad.
- Tras recuperar la lectura original, **7/7 recorridos de optimización** vuelven
  a pasar, además de `typecheck` y lint focalizado sin avisos.
- No se repitió build mientras se utiliza el servidor del usuario. El build y
  las 81 pruebas de la sección anterior corresponden al cambio inicial, no a
  esta corrección posterior de consulta. Las pruebas relevantes de esta
  corrección son tipos, lint y los siete recorridos contra PostgreSQL real.

### Comparación de lecturas

Sobre `suma-de-dos-numeros`, como invitado, se alternaron 30 lecturas de cada
implementación por lenguaje después de cinco pares de calentamiento. Se
comprobó igualdad de contenido seleccionado, versión y lenguajes disponibles.
Los tiempos miden la función completa vía Prisma, no una sentencia SQL aislada.

| Lenguaje | Original mediana / p95 | Separada mediana / p95 |
| --- | --- | --- |
| Python | 1,86 / 2,64 ms | 2,21 / 2,66 ms |
| JavaScript | 1,51 / 2,60 ms | 2,06 / 2,65 ms |
| TypeScript | 1,50 / 1,86 ms | 1,80 / 2,32 ms |

La representación JSON del objeto leído pasó de 4324 bytes a 2566–2615 bytes.
No son bytes medidos en PostgreSQL ni ahorro del payload RSC: el cliente ya
recibía solo la variante elegida. Por este pequeño ahorro no compensa mantener
la consulta adicional. Se recupera la lectura original sin alterar el resto de
las mejoras. La muestra no representa historiales grandes ni cuentas activas.

### Referencia de navegador en desarrollo

Chromium, invitado, 1440×1000, movimiento reducido, cinco cargas completas por
URL tras una de calentamiento, en el commit `efebc0b` antes de la corrección de
consulta. Caché del navegador reutilizada; sin limitación artificial de CPU/red.

| Pantalla | TTFB mediana / p95 | Tiempo observado hasta contenido/editor visible, mediana / p95 |
| --- | --- | --- |
| Inicio | 192 / 215 ms | 302 / 339 ms |
| Catálogo | 263 / 274 ms | 377 / 411 ms |
| Práctica Python | 118 / 138 ms | 1097 / 1103 ms |
| Práctica JavaScript | 149 / 157 ms | 1143 / 1159 ms |
| Práctica TypeScript | 141 / 157 ms | 1126 / 1183 ms |

El tiempo visible incluye la espera del localizador Playwright, no certifica que
todos los servicios de Monaco estén listos. Con cinco muestras, p95 equivale al
máximo observado. Se observó LCP provisional de 164–308 ms (medianas), sin cerrar
su ventana de observación: no se presenta como Web Vital definitivo.
Una muestra de escritura de 82 caracteres con intervalos de 16 ms en el editor
sencillo no registró tareas largas (más de 50 ms); no había resultados de ejecución
cargados. No hubo errores JavaScript de página en estos recorridos de medición.

**Pendiente:** comparación antes/después en producción, perfil de React con
resultados visibles, sesiones autenticadas, zoom, lector de pantalla y la suite
E2E completa. Piston estaba detenido; no se probó ejecución real. Estos 14
recorridos públicos no sustituyen la suite con doble HTTP ni las suites reales.

## Comparación pendiente en entorno local

Con autorización para servidores temporales y PostgreSQL preparado:

1. Comparar el commit anterior y este cambio con los mismos datos y máquina,
   separando `next dev` de producción local. Registrar versión, escenario,
   repeticiones, mediana y percentil 95; distinguir primera carga y navegación.
2. Medir Inicio, catálogo y práctica en Python/JavaScript/TypeScript como invitado
   y con cuenta: respuesta, número/duración de consultas y bytes leídos. La
   separación de variante queda descartada para el volumen medido.
3. Registrar con Performance/React Profiler escritura con resultados visibles y
   arrastres largos. Comparar commits, tareas largas y tiempo hasta editor listo.
   El límite de memoización no garantiza por sí solo una mejora perceptible.
4. Verificar claro/oscuro, 320–1440 px, zoom, movimiento reducido, teclado,
   recuperación local, conflicto entre pestañas y transferencia de invitado.
5. Ejecutar `npm run test:e2e` (doble HTTP) y, cuando corresponda, las suites de
   Piston real. Mantener el archivo serial `flows.spec.ts` completo.
6. Solo si aparece un coste relevante, optimizar la reconciliación del GET de
   ejecuciones. Preservar caducidad a dos minutos, reserva global, idempotencia y
   actualización atómica del progreso. No introducir índices o cachés sin datos.
