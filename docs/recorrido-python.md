# Recorrido específico de Python

## Contrato

Python conserva las 176 identidades del currículo común y añade 48 actividades propias: 224 pasos (32/74/82/36 por nivel) en las mismas cuatro rutas. JavaScript y TypeScript conservan sus fuentes, orden, niveles, versiones publicadas, contratos y casos. Las competencias nuevas tienen slugs `python-*`; no heredan completados anteriores. El documento original `python-logica-y-flujo.md` no se importa ni se modifica.

La secuencia está en `src/lib/python-curriculum.ts`. `prisma/python-content.ts` compone una fila por actividad con posición, nivel, objetivo, dependencias por módulo, modalidad, ayuda y pruebas. Las referencias nuevas y sus casos independientes están en `prisma/python-lessons.ts`; errores frecuentes y ejemplos explicados, en `prisma/python-help.ts`. Las fuentes compartidas permanecen intactas.

- No hay migración: una versión puede contener solo Python. Cada lenguaje selecciona su última versión publicada que contenga ese lenguaje, no la última versión global.
- La proyección solo se activa cuando el catálogo publicado contiene `python-constante`. Preparar borradores no cambia la experiencia activa. Se publica el lote entero en una transacción. Desplegar las fuentes y activar el catálogo debe coordinarse: el marcador detecta el recorrido, no cada revisión posterior.
- Rutas, módulos, navegación, reanudación, recomendaciones y denominadores usan la misma proyección. Los ejercicios personalizados conservan su pertenencia a las rutas.
- Las categorías visibles de Python se proyectan desde la secuencia sin escribir `Exercise.category`, que sigue siendo compartido. Filtros, tarjetas, recomendaciones y progreso usan la misma categoría proyectada.
- La base conserva el orden global y los 176 elementos de las rutas comunes. No se eliminan versiones, variantes, borradores, envíos ni progreso.
- Las versiones exclusivas se consultan en administración, pero no se guardan desde el formulario de tres lenguajes. Los importadores compartidos no deben sobrepasarlas.
- Las soluciones siguen siendo privadas; el espacio de trabajo solo recibe casos visibles. Las técnicas sugeridas no se certifican mediante AST salvo las reglas iniciales ya existentes.

## Matriz de conceptos

Las filas indican conocimientos previos → introducción/práctica → integración y límites. Los contratos individuales y sus casos se mantienen junto a cada actividad en las fuentes anteriores.

| Etapa | Conocimientos previos | Introducción y práctica | Integración / límites |
| --- | --- | --- | --- |
| Iniciación | Ninguno | Instrucciones, variables, cálculo; constante por convención | Cajas sin entrada: nombre frente a literal |
| Iniciación | Textos y cálculo | Entrada entera → decimal con `float` | Punto decimal, negativos y `.0` en PROGRAM |
| Iniciación | Comparación | Funciones, parámetros, retorno y seguimiento | FUNCTION solo después de enseñar `solve(data)` |
| Principiante | Booleanos | Ramas → expresión condicional | Igualdad en el límite de edad |
| Principiante | Bucles y `append` | `break` y `continue` por separado | Centinela inicial; cero no negativo; vacío |
| Principiante | Listas y textos | `sorted` numérico, rebanadas, `split`/`join` | No mutar; fin exclusivo; espacios |
| Principiante | Listas y funciones | Desempaquetado → `enumerate` → `zip` → retorno múltiple | Repetidos y longitudes distintas |
| Principiante | Alcance y copias | Identidad y parámetro opcional seguro | Dos llamadas sin lista compartida |
| Principiante | Datos con nombre | Actualizar → borrar → parejas → lista de registros | Ausencia frente a cero; puente previo a gastos |
| Principiante | Diccionarios | Errores concretos, pruebas y regresión | Gastos en memoria, sin archivos |
| Intermedio | Ordenación numérica | Conjuntos: actualización y cinco operaciones/relaciones | Vacíos, duplicados, resta dirigida, salida ordenada |
| Intermedio | Diccionarios y listas | Frecuencias → agrupación por categoría | Crear antes de añadir; orden y repetidos |
| Intermedio | Bucle y filtro manual | Comprensión → iterador/generador/`map`/`filter` | Consumo, materialización, selección |
| Intermedio | Auxiliares y tuplas | Agregación → función clave → lambda y desempate | Extremos ausentes, estabilidad, criterios opuestos |
| Intermedio | Decimales | Formato fijo frente a redondeo | Ceros finales y redondeo nativo al par |
| Intermedio | Diccionarios planos | Consulta anidada → acumulación por producto | `None` distinto de cero, saldos negativos |
| Intermedio | Estado en memoria | Módulos → archivos → inventario persistente → valoración | Disco aislado por caso; stock no negativo |
| Intermedio | Registros y copias | Academia → contactos → agenda → transformación | Normalización, campos y conservación |
| Intermedio | Listas y comprensiones | Búsqueda binaria, recorridos, matrices y copias | Explicaciones de diagonales e intervalos |
| Intermedio | Estructuras conocidas | Pilas, colas y recursión gradual | No exigir profundidad arbitraria al introducir diccionarios |
| Avanzado | Bloques anteriores | Conservar los 36 pasos avanzados | Árboles, prioridades, exploración, dinámica y grafos |

Las ampliaciones tienen acceso libre y no bloquean algoritmos. Leer teoría o consultar soluciones no concede progreso.

## Orden, categorías y dependencias (revisión del 30 de octubre de 2026)

La secuencia fuente se revisó sin cambiar las 224 identidades ni las variantes de otros lenguajes:

- La búsqueda lineal se separó de búsqueda/ordenación y se sitúa tras listas y tuplas, como primer recorrido con índice. La búsqueda binaria y la ordenación algorítmica siguen en intermedio.
- La explicación de copia exterior/interior se adelantó al módulo de referencias, antes de agrupación y academia. `logica-copia-anidada` sigue después de matrices y su descripción ya no la presenta como primera introducción.
- El inventario se ordena como acumulación por producto (`logica-inventario`), reglas de stock (`logica-saldo`, en bases), módulos, persistencia y valoración (`python-inventario-valora`). Los enunciados distinguen saldo con negativos de stock no negativo.
- Iteradores, generadores, `map` y `filter` pasan tras comprensiones; contactos y transformación quedan después de diccionarios, copias y validación.
- El tramo intermedio se agrupa visualmente en «Colecciones y transformación», «Proyectos y persistencia» y «Algoritmos y estructuras». La agrupación es de presentación; los módulos y las cuatro rutas se conservan.
- Los prerrequisitos dejan de ser la cadena del ejercicio anterior. Cada módulo declara dependencias relevantes; dentro del módulo se conserva el orden. La validación exige que sean anteriores y sin ciclos.
- Las categorías visibles de Python se proyectan desde la secuencia (`Fundamentos`, `Colecciones`, `Proyectos`, `Algoritmos`, `Estructuras`, `Grafos`) sin escribir `Exercise.category`, que sigue siendo compartido. El catálogo, las tarjetas, las recomendaciones y el progreso usan la misma proyección.
- Las cifras por nivel pasan a 32/74/82/36: la búsqueda lineal se reclasifica como principiante y su versión Python lo refleja.

La huella de esta entrega de fuentes está registrada en `prisma/python-releases.ts`. La base activa no se ha modificado en esta revisión: la publicación atómica con `content:python -- --apply` sigue pendiente y debe coordinarse con el despliegue de las fuentes para no mostrar orden nuevo sobre contenido antiguo.

## Contratos y evaluación (revisión del 30 de octubre de 2026)

La revisión de contratos no cambia identidades ni el contenido de JavaScript/TypeScript. Las variantes Python que necesitan otro contrato conservan la versión anterior y se publican como una revisión nueva; los borradores antiguos siguen accesibles y no se ejecutan con el contrato nuevo.

- `python-constante` es una práctica guiada: la plantilla conserva `cajas` y una salida incorrecta, y el alumno debe construir la equivalencia `LAPICES_POR_CAJA`. La comprobación observa `18`; no certifica el uso de mayúsculas ni de la constante, que se explica como convención y transferencia.
- `python-decimal` lee el texto sin convertirlo. Los casos incluyen cero, negativos y resultados con `.0`; convertir con `int` o sumar textos no supera la suite.
- `python-identidad` construye una lista local desde `data`, no muta la entrada y devuelve `antes`, `original`, `copia`, `igual`, `misma` y `copiaMisma`. Así se observa el efecto de mutar un alias y de conservar una copia distinta, sin dos respuestas verdaderas constantes.
- `python-academia-resume` cubre medias fraccionarias, ausencias, cero y empates próximos. `python-academia-califica` distingue notas válidas intermedias, límites `0` y `100`, negativos y cursos no existentes. `python-contactos-edita` cubre correo, teléfono, ambos, campos no permitidos, valores no textuales y normalización.
- `logica-pruebas-limites` parte de una implementación defectuosa con `actual = 0`; las pruebas de vacío y negativos descubren el supuesto. `logica-reproduce-fallo` ya no revela en el enunciado que el defecto es `n >= 0`: el caso mínimo y la corrección aparecen en pistas progresivas. En ambas, las aserciones son una ayuda local; la suite evalúa el resultado, no un contador ni un mensaje autodeclarado.
- Las actividades de aserciones y excepciones distinguen el resultado observable de la técnica recomendada. `logica-asercion-normal` y `logica-conserva-regresion` señalan que la comprobación no certifica la presencia de aserciones; `captura-conversion`, `error-dominio` y `recupera-elementos` mantienen textos válidos, errores previstos y errores de infraestructura separados.

El modelo de árboles de Python se unifica en `value`, `left` y `right` para `logica-altura`, `logica-preorden`, `logica-niveles` y `logica-arbol-busqueda`. `logica-cuenta-nodos` ya lo describía y `logica-ancestro` repite la forma de cada nodo. Las variantes JavaScript/TypeScript conservan `v`, `izq` y `der`. El cambio de entradas y referencias Python crea una revisión nueva; no reinterpreta envíos históricos. Los casos Python limitan los árboles a 500 nodos y profundidad 50, e incluyen una cadena sesgada y un árbol equilibrado; no se elevan límites globales del ejecutor.

Las pruebas de resultado no certifican por sí solas el uso de `break`, `continue`, comprensiones, `map`, `filter`, generadores, aserciones o excepciones. En iteradores, listas nuevas por llamada e identidad, los resultados permiten observar efectos compatibles con la técnica, pero también pueden reproducirse con otras implementaciones. La técnica queda como objetivo de revisión humana. Tampoco se certifican complejidad, precisión decimal general ni dominio de un algoritmo. La auditoría pedagógica individual de las 224 actividades y los límites de árboles en Piston real siguen pendientes en el plan.

## Destino del documento de referencia

«Fusionar» evita duplicar una competencia; nunca significa importar su código sin revisión.

| Lecciones | Decisión y destino |
| --- | --- |
| 1.1 | Incorporar constante sin funciones anticipadas |
| 1.2–1.4 | Reutilizar variables y auxiliar; añadir desempaquetado después |
| 1.5–1.6 | Separar redondeo de formato; materializar listas en iteradores |
| 2.1–2.4 | Reutilizar fichas; añadir actualización explícita |
| 2.5 | Fusionar con diccionarios/conjuntos; ingredientes son colecciones |
| 3.1–3.4 | Añadir borrado, parejas y consulta anidada; recorrer diccionarios reales |
| 3.5 | Reutilizar `logica-frecuencias` |
| 4.1 | Descartar menú interactivo persistente: usar contratos deterministas |
| 4.2–4.7 | Contactos por cuatro hitos con estado observable |
| 5.1–5.4 | Añadir expresión e identidad; reutilizar pertenencia y sangría |
| 5.5 | Fusionar con decisiones y filtros existentes |
| 6.1–6.3 | Conjunto vacío, hashabilidad, `add` y `discard` |
| 6.4 | Reutilizar `logica-deduplica` sin perder orden estable |
| 7.1–7.4 | Operaciones y relaciones; no atribuir orden a un conjunto |
| 7.5 | Requisitos faltantes; corregir la separación del cofre |
| 7.6 | Fusionar con conjuntos y ranking, sin duplicar torneo |
| 8.1–8.4 | Consulta, inscripción y calificación; nota pendiente distinta de cero |
| 8.5–8.7 | Medias y clasificación; reutilizar recorridos para listados |
| 9.1–9.2 | Agregación con vacío explícito |
| 9.3–9.4 | Claves y desempates; mejorar `logica-ordena-registros` |
| 10.1–10.3 | Transformación y filtro, normalizando vocales |
| 10.4–10.6 | Generador después de iteradores; comprensión condicional y de diccionario |
| 11.1–11.4 | Retorno múltiple y lambda con clave compuesta |
| 11.5–11.7 | Reutilizar potencia, recursión y copias anidadas |
| 12.1–12.4 | Reutilizar errores, recuperación concreta y carrito |
| 13.1–13.4 | Reutilizar hitos existentes sin cambiar stock |
| 13.5 | Añadir reporte y valoración en céntimos |
| 14.1–14.2 | `map` y `filter` con materialización |
| 14.3–14.4 | Fusionar con criterios y conversiones; no prometer validar todo el estándar de correo |
| 15.1 | Búsqueda de contactos por todos los criterios |
| 15.2 | No duplicar analizador: frecuencias y normalización cubren la competencia; no inventar reglas lingüísticas |
| 15.3 | Transformador con operaciones consistentes y conversión numérica real |

## Preparación y activación

```powershell
npm run content:python
npm run content:python -- --prepare
npm run content:python -- --apply
```

Sin opciones valida fuentes sin conectarse a la base. `--prepare` crea borradores idempotentes. `--apply` requiere Python en Piston y valida referencias y plantillas, incluidos archivos y persistencia; vuelve a comprobar revisiones y publica atómicamente. Un fallo conserva la publicación anterior. Nunca se ejecuta código de alumnos en el host.

En Docker, respaldar con `npm run docker:backup` y ejecutar `node scripts/docker.mjs exec -T app npm run content:python -- --apply` sobre una imagen actualizada. No usar `content:replace` para esta ampliación. Una versión local distinta o un borrador ajeno bloquean la preparación: resolver la discrepancia explícitamente, nunca resetear la base.

`prisma/python-releases.ts` conserva las huellas normalizadas de entregas verificadas. Una publicación conocida puede recibir una revisión posterior desde fuentes sin perder protección frente a ediciones locales; una huella desconocida no autoriza sobrescribirlas. La huella de una entrega de fuentes se registra cuando la suite y el build la verifican; la activación real sigue siendo el paso que publica el catálogo y debe conservar las huellas anteriores.

## Verificación y límites

### Coste orientativo

`prisma/python-costs.ts` decide explícitamente el coste o su omisión para las 48 actividades exclusivas y 18 actividades compartidas de proyectos, módulos y archivos. Hay 53 notas concretas y 13 omisiones; se eliminan las dos fórmulas genéricas anteriores sin cambiar las fuentes JavaScript/TypeScript. El resto conserva su coste previo.

Las notas describen la referencia, no cualquier solución aceptada: distinguen recorridos, copias, memoria auxiliar y salida, caracteres comparados, operaciones hash de coste esperado y lectura/escritura completa. Mantienen el límite editorial de 200 caracteres. Las pruebas comprueban cobertura, límites y conservación de fuentes; no miden código del alumno ni certifican su complejidad.

### Explicaciones de ejemplos públicos

`pythonSharedCaseHelp`, en `prisma/python-help.ts`, contiene explicaciones editoriales para las revisiones Python de actividades compartidas. Se aplican por slug y orden del caso, solo a ejemplos visibles, sin modificar entradas, respuestas, visibilidad ni explicaciones de casos ocultos. Las fuentes y variantes de JavaScript/TypeScript permanecen intactas. Una prueba comprueba la correspondencia entre órdenes y ayudas y exige cobertura del bloque revisado; las explicaciones no se generan ejecutando soluciones.

Los 433 ejemplos públicos de las 224 actividades tienen explicación (se completaron 278 antes vacíos). Se explican las operaciones concretas, límites, orden de visita, índices, efectos sobre las copias y estados iniciales de proyectos y persistencia. En los programas que imprimen `true`/`false`, se distingue ese texto de los valores Python `True`/`False`; en FUNCTION se aclara la representación JSON cuando resulta relevante. No se presenta la observación de una salida como certificación de la técnica interna. La prueba exige cobertura completa y conservación de los casos; no acredita la calidad pedagógica por sí sola. El resto de la revisión editorial sigue pendiente en el plan.

- `tests/python-curriculum.test.ts`: identidades, orden, grupos, categorías proyectadas, prerrequisitos anteriores y sin ciclos, cobertura, compatibilidad, referencias fijas, contratos prioritarios, modelo de árboles y plantillas nuevas.
- `tests/python-install.test.ts`: doble transaccional para idempotencia, conservación y conflictos; no sustituye PostgreSQL real.
- `tests/catalog-loading.test.ts`: revisiones por lenguaje sin ocultar otros metadatos ni compartir actividad entre cuentas.
- La validación real pasa por `src/server/execution/piston.ts`. Pruebas locales de referencias no acreditan publicación ni sandbox.
- Las pruebas de resultado no certifican técnicas internas, complejidad, identidad ni presencia de aserciones. Las observaciones de salida fija requieren revisar el código; el modelo de árboles se comprueba con las entradas y referencias de la revisión Python.

## Activación en la instalación local

El 27 de octubre de 2026 se respaldó la base Docker en `.local/backups/itera-1793142065906.dump`, se prepararon 61 borradores (48 incorporaciones y 13 revisiones), se validaron las 224 referencias y plantillas en Piston Python —909 casos para cada conjunto— y se activó el lote. Preparar de nuevo creó cero borradores. Lectura posterior: Python 224, JavaScript 176, TypeScript 176; ningún borrador exclusivo pendiente.

Antes y después coincidieron 21 recuentos/huellas: las 17 tablas ajenas al contenido, ejercicios originales, versiones compartidas, variantes compartidas y sus casos. Se conservaron rutas, cuentas, sesiones, progreso, borradores, envíos y contenido histórico. No hubo migración ni sustitución global.

Las siete comprobaciones nuevas de navegador aprobaron navegación, aislamiento por lenguaje, reanudación del borrador/ruta, ejemplos sin progreso, envío real con progreso Python, claro/oscuro, teclado y ausencia de desbordamiento a 390/1440 px. Se revisaron las capturas de las rutas. Esto no equivale a una evaluación de aprendizaje con estudiantes ni certifica que una solución use la técnica sugerida.

La suite Docker completa produjo 47 aprobadas y tres fallidas: dos expectativas antiguas del denominador (30 en lugar de los 32 pasos Python) y un clic de diagnóstico sin petición POST registrada. Se adaptó el fixture del dashboard al recorrido por lenguaje, sin quitar sus aserciones. Los seis casos de dashboard/onboarding aprobaron al repetir ambos archivos completos; el fallo de diagnóstico no se reprodujo y no se modificó su código para ocultarlo. No se presenta esa repetición como una ejecución completa de 50/50.

Lint, tipos, suite unitaria completa (364/364, sin omisiones) y builds finales de Windows/Docker aprobados. Un build intermedio detectó una incompatibilidad de tipos en la comparación de huellas, corregida antes de cerrar; un intento Windows agotó su límite de 120 segundos y el reintento completo aprobó. La huella normalizada del catálogo publicado coincide con la entrega registrada, incluida la normalización del orden de propiedades JSON de PostgreSQL. Al terminar se detuvieron los servicios y Ubuntu quedó apagado, como al inicio; `docker-iniciar` recupera la imagen actualizada y el catálogo activado.

El 30 de octubre de 2026 se revisaron las fuentes del orden, los metadatos, los prerrequisitos, los contratos prioritarios y el modelo de árboles descritos arriba. Esta revisión no se ha preparado ni activado en la base: la instantánea publicada sigue siendo la del 27 de octubre. La entrega de fuentes se valida con `npm run content:python`; la activación requiere Piston y el procedimiento de publicación atómica.
