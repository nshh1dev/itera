# Rendimiento y decisiones de implementación

## Lecturas y aislamiento por usuario

Inicio usa `getCatalogs`: una lectura común de ejercicios publicados, su última
versión publicada y el progreso propio, seguida de proyecciones por lenguaje.
Las consultas de actividad siguen separadas por lenguaje y usuario y se solapan
con la lectura común. `getCatalog` conserva la carga individual para otras pantallas.

No hay caché global ni entre peticiones. Se conserva el orden curricular, el
contenido personalizado, la actividad de versiones históricas y la exclusión de
envíos de diagnóstico. Completar en un lenguaje no completa otro.

Las pruebas registran tres llamadas `exercise.findMany` antes y una después,
con catálogos equivalentes para invitado y cuenta. Son llamadas Prisma, no un
conteo de SQL ni una medición de latencia. `getLastDraft`, sin consumidores, se
retiró; Inicio continúa mediante el contexto de práctica actual.

La práctica solapa ejercicio, catálogo y ruta; el historial empieza cuando se
conoce el ejercicio. Se descartó separar la lectura de una variante de sus
metadatos: la medición local añadió latencia por una consulta adicional sin
reducir el payload que recibía el cliente. Se conserva la lectura original de
variantes, con selección de versión publicada y filtrado de casos visibles.

## Editor e interacción

- El HTML inicial contiene marco, enunciado y ejemplos. El editor recupera código
  local, transferencia de invitado y preferencias después de hidratar.
- Enunciado/ejemplos y resultados tienen límites de memoización específicos;
  no se introduce memoización generalizada.
- El arrastre agrupa actualizaciones por frame y persiste al soltar, cancelar o
  perder captura. El teclado confirma cada paso.
- El editor sencillo conserva Ctrl/⌘+Enter y Ctrl/⌘+Shift+Enter. «Ir al código»
  enfoca el editor o su panel si Monaco aún no está preparado.
- Movimiento reducido comparte suscripción; expandir la navegación no interpola
  el ancho de Monaco. Evidencia acotada en [motion.md](motion.md).

## Cómo decidir futuras optimizaciones

Medir en la misma máquina y con los mismos datos, separando desarrollo de
producción local y primera carga de navegación. Registrar versiones, escenario,
repeticiones, mediana y p95; distinguir llamadas Prisma, SQL, bytes y latencia.
Un conteo menor no demuestra por sí solo una mejora perceptible.

Perfilar escritura con resultados visibles y arrastres antes de añadir cachés,
índices o modificar la reconciliación del seguimiento. Conservar el presupuesto
de caducidad, reserva idempotente y progreso atómico. Las pruebas relevantes
incluyen `tests/e2e/workspace-optimization.spec.ts`,
`tests/e2e/performance.spec.ts` y las regresiones de catálogo.

Las comparaciones antiguas de desarrollo no son un benchmark actual. Las pruebas
de navegador requieren autorización de arranque; los recorridos con doble HTTP
no validan Piston real. Resultados y límites: [verification.md](verification.md).
