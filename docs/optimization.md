# Optimización general de Itera

## Alcance implementado — 18 de octubre de 2026

- Inicio consulta catálogo, último borrador, rutas e historial en paralelo.
  El catálogo y el detalle de ruta también solapan sus lecturas independientes.
- La ficha de práctica solapa ejercicio, catálogo y ruta. El historial comienza
  cuando se conoce el ejercicio, sin esperar al catálogo ni a la ruta.
- `getExercise` obtiene las lenguas disponibles como metadatos y el detalle de
  una sola variante, vinculada a la versión publicada seleccionada. Conserva los
  filtros de casos visibles y borradores del usuario. Esto reduce datos leídos
  pero añade una consulta por clave única: falta medir la latencia neta con
  PostgreSQL real antes de atribuirle una mejora de tiempo.
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

**Pendiente:** ejecutar esos recorridos y la suite E2E existente. El usuario no
autorizó iniciar servidores y no había uno disponible en el puerto 3000.
Tampoco se ejecutaron las suites reales de Piston. No se han medido TTFB, LCP,
tiempo hasta editor listo, duración de commits React ni latencia SQL, y no se
afirma una reducción porcentual o absoluta de tiempos.

## Comparación pendiente en entorno local

Con autorización para servidores temporales y PostgreSQL preparado:

1. Comparar el commit anterior y este cambio con los mismos datos y máquina,
   separando `next dev` de producción local. Registrar versión, escenario,
   repeticiones, mediana y percentil 95; distinguir primera carga y navegación.
2. Medir Inicio, catálogo y práctica en Python/JavaScript/TypeScript como invitado
   y con cuenta: respuesta, número/duración de consultas y bytes leídos. Confirmar
   especialmente que la consulta adicional de variante compensa la menor carga.
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
