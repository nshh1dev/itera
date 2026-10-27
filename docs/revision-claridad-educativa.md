# Claridad educativa: revisión del catálogo

## Alcance editorial

Revisión de los 176 ejercicios de las fuentes y los 36 bloques de teoría en Python,
JavaScript y TypeScript. Se contrastan las instrucciones, objetivos, pistas y
explicaciones con las plantillas, referencias, casos y reglas conceptuales.
No implica demostrar todas las entradas posibles ni certificar automáticamente
la técnica interna de cualquier solución de un estudiante.

| Ruta | Bloques revisados (ejercicios) | Total |
| --- | --- | --- |
| Iniciación | instrucciones (4), variables (4), operaciones (4), entrada (4), tipos-comparaciones (4), funciones (4), seguimiento (2), integracion-inicial (4) | 30 |
| Principiante | decisiones (6), repeticion (6), listas (6), textos (6), funciones-datos (5), alcance (5), referencias (5), errores (6), pruebas (4), integracion-bases (6), integracion-gastos (2) | 57 |
| Intermedio | mapas (6), modulos (5), archivos (6), integracion-inventario (2), busqueda (6), recorridos (6), matrices (6), copias-anidadas (1), estado-recursion (6), integracion-intermedia (6), integracion-agenda (3) | 53 |
| Avanzado | arboles (6), prioridades (6), exploracion (6), dinamica (6), grafos (6), integracion-avanzada (6) | 36 |

## Criterios y correcciones

- Distinguir mostrar una salida de devolver un resultado; explicar qué contiene la
  plantilla y qué debe escribir o corregir el estudiante.
- Expresar los datos de los 22 fundamentos en español, sin exigir anotaciones de
  TypeScript en Python o JavaScript. Precisar las dos entradas de los contadores
  independientes; conservar las firmas estrictas en TypeScript.
- Escribir objetivos educativos concretos en los 63 ejercicios de `logic-lessons`,
  en lugar de generar objetivos repitiendo su título. Los 22 fundamentos también
  tienen objetivos explícitos en vez de extraer la primera frase del problema.
- Mantener autocontenidos los contratos de los hitos de gastos, inventario y
  agenda; no obligar a reconstruir la entrada consultando un ejercicio anterior.
- Declarar las propiedades reales de cada árbol: `v/izq/der` y
  `value/left/right` son contratos diferentes que se conservan.
- Aclarar grafos no dirigidos, pesos, movimientos permitidos, distancia inicial,
  orden lexicográfico numérico y límites de potencia coherentes con sus casos.
- Corregir explicaciones y costes: rangos heredados en árboles de búsqueda,
  ordenación final de alcanzables, copias y salida de permutaciones y selección
  lineal de Dijkstra. En Python, infinito se representa con `float('inf')`.
- Evitar referencias a actividades ausentes en factorial y afirmar correctamente
  cuándo también se comprueba un concepto, además de la salida.
- Conservar soluciones, plantillas, entradas y expectativas, identidades y progreso.
  Las nuevas redacciones se publican como versiones, no reescribiendo las antiguas.

La adaptación por lenguaje se genera en las fuentes editoriales. No se ocultan
frases incompatibles mediante filtros del navegador. La interfaz y los límites de
su comprobación se documentan en [Ayuda del editor](editor-help.md).

## Verificación e instalación

La regresión `tests/practice-clarity.test.ts` recorre las 176 actividades y los 36
bloques, comprueba coherencia sintáctica y fija los contratos aclarados. Las suites
de contenido comprueban referencias, plantillas, casos, proyectos y persistencia;
sus ejecuciones locales usan exclusivamente referencias fijas del repositorio.
El código de estudiantes sigue pasando siempre por Piston.

La instalación de cierre usa Docker, separado de la base nativa. Antes de la
activación se guardó el respaldo `.local/backups/itera-1793070883401.dump`.
La base Docker tenía 176 ejercicios publicados; las 136 publicaciones de la base
nativa no describen el catálogo de Docker. No se migra ni reemplaza la base nativa.

### Resultados comprobados (27 de octubre de 2026)

- **Validación y activación**: `content:replace -- --apply` ejecutó las referencias y
  plantillas de los tres lenguajes en el Piston real del entorno Docker —138 funciones
  y 20 programas por lenguaje— y activó 176 ejercicios con sus cuatro rutas. Las
  versiones anteriores se conservan y las nuevas quedan publicadas.
- **Datos de estudiantes**: antes y después de la activación, usuarios (17), borradores
  (44), envíos (1.093) y progreso (376; 351 con aprobado) conservan recuento y huella
  idénticos. No se reescribieron envíos ni progreso históricos.
- **Ejecutor real**: `npm run test:runner` aprobó **12 de 12** pruebas, incluidas
  TypeScript estricto, módulos, archivos, aserciones y persistencia en un segundo
  proceso limpio.
- **Comprobaciones del repositorio**: lint y tipos sin errores; **355 pruebas
  unitarias aprobadas, sin fallos ni omisiones**.
- **Navegador** (aplicación Docker activa, Piston real): **26 aprobadas** en
  `flows.spec.ts` y `onboarding.spec.ts` (11 + 15), más **12 aprobadas** en controles,
  rutas, currículo y ayuda. La condición añadida a la primera práctica corrige la
  única prueba que fallaba por ausencia de «Condiciones».
- **Excluidas, no aprobadas**: dos pruebas de `flows.spec.ts` simulan una caída del
  proveedor y leen el correo de recuperación en el disco del host. Ese montaje
  corresponde al doble HTTP de Piston (2001) y al modo nativo; la aplicación Docker
  usa Piston real y escribe el correo dentro del contenedor. No se ejecutaron para no
  alterar esas reglas ni el entorno activo.
- **Fuera del alcance de esta entrega**: los dos recorridos que esperan Configuración
  como diálogo y continuidad automática entre lenguajes siguen sin cambios, porque
  responden a decisiones de producto distintas y no a esta revisión.
