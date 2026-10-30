# Bienvenida y personalización del aprendizaje

## Experiencia

El registro crea la cuenta y continúa en `/bienvenida`, salvo que proceda de un
ejercicio: en ese caso vuelve directamente a ese ejercicio conservando `volver`,
lenguaje y ruta, y deja la personalización pendiente para otro momento.
La secuencia consta de Cuenta y Punto de partida. Guardar lenguaje y nivel lleva
directamente a la ruta recomendada, sin diagnóstico ni pantalla de resumen
obligatorios. Si hay un ejercicio de retorno, este tiene prioridad sobre la ruta.
La propuesta según la selección aparece en el propio formulario; un diagnóstico
previo aplicable puede ajustar el destino y se conserva al guardar.

El diagnóstico se ofrece como alternativa secundaria tras guardar la selección,
y sigue disponible desde Configuración → Aprendizaje. Se presenta como orientación
para encontrar un punto de partida, no como certificación del nivel. Las sesiones
conservan su versión de reglas; los nuevos diagnósticos Python usan v2, como se
detalla más abajo.

La bienvenida no bloquea el catálogo: se puede salir y retomarla desde Inicio.
Las cuentas con `onboardingStep = 0` quedan exentas y `/bienvenida` las dirige a
Aprendizaje. Las altas por Better Auth comienzan en el estado 2. Los estados
antiguos 1–4 se mantienen compatibles sin migración: los enlaces `paso=1`, `2`
y `4` muestran la personalización; `paso=3` abre la opción de diagnóstico solo
si existe un perfil guardado. Sin `paso` siempre se muestra personalización.
Guardar y empezar completa la bienvenida en la misma transacción que guarda
las preferencias; guardar para diagnosticar conserva el flujo pendiente.
No se borran sesiones diagnósticas ni se escribe progreso al completar estos pasos.

El diseño conserva las fuentes locales, controles y tonos de Itera. Configuración
es una página, no una ventana interceptada. Su navegación tiene tres apartados:
Mi cuenta, Aprendizaje y Apariencia; en pantallas estrechas usa enlaces compactos.
Mi cuenta agrupa los datos personales, el acceso y seguridad y los datos y
desactivación, con los mismos controles de correo, contraseña y confirmación.
Los enlaces antiguos `seccion=seguridad` y `seccion=privacidad` siguen siendo
válidos: muestran Mi cuenta, desplazan al bloque correspondiente y enfocan su
encabezado, sin cambiar la URL ni añadir una entrada al historial. Los tres
paneles y sus formularios permanecen montados al navegar para conservar las
ediciones pendientes. No se añaden exportación ni restauración de datos.

## Declaración, orientación y progreso

- `UserPreference.language`: lenguaje preferido. `level` mantiene compatibilidad
  con herramientas existentes, reflejando la declaración del lenguaje preferido.
- `LearningProfile`: nivel declarado por usuario y lenguaje. La migración copia
  las preferencias existentes únicamente a su lenguaje correspondiente.
- `Diagnostic`: lenguaje, declaración de partida, versión de reglas, fecha,
  recomendación y explicación. Se conserva el historial; repetir no lo reemplaza.
- `Progress`: sigue siendo el progreso real por usuario, ejercicio y lenguaje.
  Cambiar preferencias o terminar un diagnóstico no escribe en esta tabla.

La recomendación utiliza el último diagnóstico terminado del lenguaje, ordenado por
fecha de finalización, solo si coincide con la declaración actual. Si es inconcluso,
conserva el nivel declarado y muestra su razón; no rescata una sugerencia anterior.
En ausencia de diagnóstico utiliza el nivel declarado; sin declaración propone
Iniciación. Todas las rutas permanecen abiertas.
El dashboard prioriza la actividad pendiente del lenguaje preferido, luego su
continuidad habitual; sin actividad propone la ruta del perfil. El progreso de
otros lenguajes permanece disponible desde Progreso.

## Diagnóstico: selección y reglas versionadas

`src/lib/learning-profile.ts` contiene la selección editorial: dos retos del nivel
declarado y un tercero opcional de contraste. Se usan las últimas versiones
publicadas al crear la sesión y sus identificadores se fijan para todo el recorrido.
Si falta contenido publicado, la interfaz permite continuar sin diagnóstico.

La selección no cambia en esta revisión. Las variantes publicadas se fijan al crear
la sesión, por lo que el contenido instalado puede diferir de las fuentes. Ninguna
de estas tareas, por sí sola, comprueba dominio de toda una etapa.

### Revisión de las plantillas Python

Inspección estática de las fuentes del catálogo, sin ejecutar Python ni consultar
la publicación activa:

| Etapa | Actividad | Qué aporta la plantilla y qué queda por observar |
| --- | --- | --- |
| Iniciación | `logica-saludo` | Archivo vacío: escribir una salida fija. No observa entrada ni resolución variable. |
| Iniciación | `logica-actualiza-puntos` | Variable, segunda asignación e impresión ya presentes: corregir la actualización. No equivale a diseñar un programa. |
| Iniciación | `logica-elige-mensaje` | Función, condición y respuesta alternativa dadas: completar la otra respuesta. No demuestra elegir la estructura de control. |
| Bases | `logica-signo` | Las tres ramas y dos respuestas ya resueltas: completar el caso cero. No permite inferir dominio general de condiciones. |
| Bases | `logica-suma-lista` | Función, acumulador y retorno dados: implementar la acumulación. No cubre por sí sola búsqueda, filtrado ni gestión de estado. |
| Bases | `logica-repetido` | Esqueleto mínimo: detectar repetición. El retorno no prueba que se haya utilizado un conjunto ni una complejidad concreta. |
| Intermedio | `logica-frecuencias` | Diccionario y retorno preparados, con el recorrido sugerido: construir frecuencias. No cubre todas las operaciones de colecciones. |
| Intermedio | `logica-busqueda-binaria` | Extracción de datos y extremos del intervalo dados: completar la búsqueda. Las salidas no certifican descarte de mitades ni coste logarítmico. |
| Intermedio | `logica-cuenta-nodos` | Esqueleto mínimo: contar una estructura de árbol. No observa otros recorridos ni acredita una estrategia recursiva. |
| Avanzado | `logica-altura` | Esqueleto mínimo: obtener altura. No cubre árboles generales ni grafos. |
| Avanzado | `logica-potencia` | Esqueleto mínimo con objetivo de dividir por dos: calcular potencia. El resultado no certifica la estrategia rápida. |
| Avanzado | `logica-escalera` | Esqueleto mínimo: contar combinaciones. El resultado no certifica memorización ni diseño general de estados. |

Se conserva la selección para evitar confundir esta corrección de orientación con
una revisión editorial completa o una nueva prueba de nivel. La interfaz Python
explica el papel de las plantillas guiadas. La revisión del currículo sigue siendo
independiente y solo se activa mediante el procedimiento editorial habitual.

### Reglas v1: sesiones antiguas y JavaScript/TypeScript

Reglas orientativas, no psicométricas ni certificadoras:

- Menos de dos primeros retos evaluados válidamente: sin nueva sugerencia.
- Ninguno de esos dos superado: reforzar el nivel anterior, con mínimo Iniciación.
- Uno o dos superados: conservar el nivel declarado.
- Ambos y el tercero superados: probar el siguiente nivel, con máximo Avanzado.
- `ERROR`, `RUNNING` y retos no evaluados no se convierten en fallos de conocimiento.
- Se usa la última comprobación completa de cada reto, no sus ejecuciones de ejemplos.

### Reglas v2: nuevas sesiones Python

- Menos de dos primeros retos evaluados válidamente: sin nueva sugerencia; se
  conserva la declaración. Errores de infraestructura, omisiones y ejemplos no
  se convierten en fallos de conocimiento.
- Ninguno superado: se propone la ruta anterior como refuerzo, con mínimo
  Iniciación y sin bloquear la ruta declarada.
- Uno o dos superados: se conserva la ruta declarada, también con contraste
  superado. Los tres aciertos invitan a explorar la siguiente ruta libremente,
  pero no cambian automáticamente el punto de partida a otra etapa.
- La razón distingue práctica con ayuda de resolución independiente. El tercer
  reto sigue siendo voluntario y no penaliza si se omite o falla su infraestructura.

`Diagnostic.rulesVersion` ya existe: el inicio escribe 2 únicamente para una
nueva sesión Python y 1 para JavaScript/TypeScript, sin migraciones. Una sesión
abierta se retoma con su versión y variantes originales. La finalización despacha
según la versión persistida, no según las reglas actuales del lenguaje; las sesiones
v1 abiertas conservan su promoción histórica. Reintentar un cierre no recalcula
resultados finalizados y los resúmenes siguen leyendo la recomendación guardada.
Una versión desconocida finaliza sin sugerencia nueva, conservando la declaración
y explicando que no se puede interpretar, en vez de aplicar v1 silenciosamente.

Piston, el editor y la comparación de resultados son los mismos que en práctica.
No se muestran soluciones durante el diagnóstico. Los casos ocultos se filtran
antes de persistir exactamente como en la práctica normal.

## Aislamiento y concurrencia

`DiagnosticItem` conserva el código y su revisión optimista separados de `Draft`.
Las copias locales usan `itera:diagnostic:<usuario>:<item>` y no participan en la
transferencia invitado → cuenta. Las preferencias visuales del taller se conservan.

`Submission.diagnosticItemId` identifica la finalidad sin cambiar los modos
`examples` y `submit`. El endpoint comprueba propiedad, variante y sesión abierta.
La idempotencia incluye el contexto diagnóstico. La finalización sigue siendo
atómica, pero solo `submit` sin diagnóstico modifica `Progress`.

Los diagnósticos comparten los límites globales y por persona de ejecución.
Reservar y terminar un diagnóstico usan el mismo bloqueo breve de reservas para
evitar que se acepten envíos después de cerrarlo. La ejecución ocurre fuera de ese
bloqueo. No hay trabajador persistente; se conserva la reconciliación de intentos
interrumpidos según el lenguaje, el número de casos y la comprobación conceptual,
con un mínimo de dos minutos. `src/lib/execution-limits.ts` comparte el presupuesto
entre evaluador y endpoints; no se lanzan más casos tras finalizar o caducar.

Catálogo, actividad, historial de práctica, archivo y estadísticas administrativas
excluyen los envíos diagnósticos. Abrir el editor diagnóstico no escribe en
`PracticeContext`, `Draft`, `HelpUsage` ni `Progress`.

## Actualización y pruebas

Aplicar la migración aditiva con `npm run db:migrate` en la instalación que se
utiliza. En Docker: reconstruir la imagen y ejecutar la migración mediante
`node scripts/docker.mjs run --rm --no-deps app npm run db:migrate` antes de
iniciar la app nueva. No ejecutar reset ni seed para esta actualización.

Pruebas unitarias: `tests/learning-profile.test.ts`, `tests/diagnostic-rules.test.ts`,
`tests/diagnostic-authorization.test.ts` y `tests/practice-navigation.test.ts`. Recorridos reales:
`tests/real/onboarding.spec.ts`, con cuentas temporales, Piston real, comprobaciones
de propiedad, idempotencia, casos ocultos y ausencia de progreso. La configuración
Docker incluye además las suites de cuenta y navegación visual, que no dependen
del doble HTTP de Piston. Los recorridos con doble siguen usando su configuración
nativa independiente.

La apariencia y las preferencias del editor siguen en el navegador; los perfiles,
diagnósticos y datos de cuenta quedan en PostgreSQL local. Desactivar conserva
también estos datos y requiere reactivación administrativa.
