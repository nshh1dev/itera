# Prioridades de Itera

## Prioridades vigentes — 26 de octubre de 2026

- Mantener las regresiones de teclado, temas, móvil, movimiento reducido y zoom
  real al 200 %. La revisión contra Next/PostgreSQL ya se realizó en Chromium;
  no constituye certificación WCAG ni prueba de todos los navegadores/dispositivos.
- Mantener las regresiones de duración con Piston real. La medición secuencial
  de Python, JavaScript y TypeScript quedó dentro de los presupuestos vigentes;
  no se cambiaron límites. [Alcance](runner-timing.md): no mide endpoints, base ni
  saturación. Docker solo se inicia con autorización.
- Validación con principiantes **aplazada por acuerdo del usuario** al cerrar el
  plan técnico. El [protocolo está preparado](beginner-validation.md), pero no se
  han realizado sesiones; no sustituirlas por pruebas automáticas ni afirmar
  eficacia educativa. Retomarlas cuando se coordinen participantes.
- Mantener pendientes de decisión las protecciones de `main`, licencia y ampliaciones
  de infraestructura. El workflow existe, pero no se afirma aquí que sus ejecuciones
  remotas o comprobaciones obligatorias estén verificadas.

El currículo vigente tiene 136 ejercicios en cuatro rutas y tres lenguajes.
La recuperación de borradores, el seguimiento idempotente, la separación de estados
editoriales y los diagnósticos inconclusos ya se corrigieron. La carga de Inicio
comparte metadatos sin compartir progreso entre lenguajes. La primera diferencia
textual de PROGRAM ya está implementada: solo usa datos visibles y respeta la
normalización del evaluador. Las rutas curriculares ya ofrecen cierre por lenguaje
y repaso basado en `readiness`, sin acreditar autoevaluaciones. Las verificaciones actuales
y sus límites se registran en [verification.md](verification.md). El plan técnico
queda cerrado y su archivo temporal se elimina; se conserva explícitamente el
aplazamiento de la validación humana.

## Historial de entregas

Las secciones siguientes conservan decisiones, recuentos y comprobaciones de su
momento. Sus «pendientes» no son por sí solos prioridades vigentes; las cifras
antiguas y las pruebas realizadas no describen ni verifican automáticamente el
estado actual. Preparación y actualización vigentes: [curriculum.md](curriculum.md)
y [docker.md](docker.md). No resetear la base para actualizar contenido.

## Entregado en código: entrada desde cero

- Siete actividades guiadas y la suma existente como octavo paso.
- Primero observar un programa completo; después cambiar un número, devolver la entrada, sumar uno, multiplicar, usar una variable y acceder a una propiedad.
- Plantillas distintas por actividad y lenguaje, sin huecos de sintaxis inválidos.
- Referencias más explícitas para varios ejercicios principiantes.
- Instrucciones esenciales visibles para principiantes y tiempos orientativos.
- Pruebas editoriales independientes de una cantidad fija de ejercicios.
- Workflow de lint, tipos, referencias y build. No sustituye las pruebas con Piston real y todavía debe ejecutarse en GitHub.

## Aplicación segura del contenido

El seed añade contenido que no existe; nunca actualiza slugs o rutas existentes. `npm run db:start` y `npm run db:seed` incorporan Desde cero sin borrar datos. Las referencias nuevas de ejercicios antiguos requieren nuevas versiones mediante administración y validación con Piston. No resetear la base para actualizar contenido.

En esta entrega, Desde cero ya se incorporó a la base local y sus dos recorridos de navegador pasaron. Las referencias modificadas de ejercicios antiguos siguen pendientes de publicación y la ejecución real de los nuevos ejercicios sigue pendiente de Piston.

La primera actividad es de observación: que se apruebe sin editar es intencional, no demuestra dominio de programación. Las siguientes retiran ayuda gradualmente. Las pruebas verifican resultados, no obligan a utilizar una construcción sintáctica concreta.

## Segunda entrega: fundamentos y navegación

- Seis actividades guiadas: comparación con cero, condición, resto, acceso a una lista, bucle con contador y construcción de listas.
- Construye tus bases pasa a 13 pasos: introducciones antes de paridad, suma, máximos y retos integradores.
- Catálogo ordenado pedagógicamente y numeración consecutiva; las rutas numeran sus propios pasos.
- La continuación usa los ejercicios publicados de la ruta seleccionada y termina al finalizarla. Cambiar de lenguaje, registrarse o iniciar sesión conserva el contexto.
- `content:paths` muestra una vista previa; `content:paths -- --apply` actualiza explícitamente las dos rutas iniciales en una transacción, sin tocar el trabajo de estudiantes ni rutas personalizadas. El seed continúa sin reemplazar contenido existente.
- Aplicado en la base local. Verificados lint, tipos, 13 pruebas unitarias/editoriales, build y 12 recorridos de navegador con doble HTTP. Sigue pendiente la comprobación del catálogo ampliado dentro de Piston.

## Tercera entrega: cadenas, rangos y productos

- Ocho actividades guiadas: igualdad, selección entre tres caminos, construcción de cadenas, minúsculas, pertenencia a vocales, recorrido del 1 al n, producto de una lista y combinación de dos condiciones.
- Construye tus bases pasa a 21 pasos. Las introducciones preceden a paridad, inversión de cadenas, vocales, factorial y FizzBuzz.
- Pruebas que ejecutan las plantillas con todos sus ejemplos en ambos lenguajes y detectan actividades resueltas accidentalmente. La comparación de referencias Python también distingue booleanos y números, como el evaluador real.
- Pruebas de navegador que comprueban el orden completo de la ruta y las plantillas de rangos en Python y JavaScript.
- Incorporado en la base local sin resetearla. Verificados lint, tipos, 14 pruebas unitarias/editoriales, build y 14 recorridos con doble HTTP. No equivale a validación en Piston ni a una prueba de aprendizaje con principiantes reales.

## Pendiente histórico tras la tercera entrega: progresión completa

1. Validar el recorrido con principiantes y ajustar la retirada de ayuda: las introducciones ya cubren igualdad, condiciones combinadas, selección, cadenas, pertenencia, rangos y productos.
2. Publicar las revisiones didácticas ya preparadas de los retos originales tras validarlas en Piston; la instalación existente conserva sus versiones públicas antiguas hasta entonces.
3. Revisar la calibración de tiempos y la retirada de ayuda con estudiantes reales.
4. Añadir ejemplos explicados por lenguaje. Objetivos y prerrequisitos por versión ya están implementados; su incorporación a versiones públicas existentes requiere revisión y publicación.
5. Continuar con máximos distintos, ausencia de resultado, pilas, búsqueda, grafos y programación dinámica antes de sus respectivos retos. Las introducciones a conjuntos, mapas, filtrado y comparación de textos ya están incorporadas.
6. Probar Desde cero con personas sin experiencia: observar dudas y revisar explicaciones y tiempos. No equiparar completar con comprender.

## Cuarta entrega: revisiones de los retos originales

- Los ocho retos originales de principiantes tienen plantillas específicas, pistas alineadas con las actividades previas, explicaciones paso a paso y tiempos orientativos revisados. Se evitan slicing, reduce, ternarios y abreviaturas como requisito de resolución.
- Desde cada ficha administrativa se puede preparar la revisión del catálogo como versión en borrador. La operación exige administrador, valida el contenido y registra auditoría. No publica ni cambia versiones anteriores, progreso o borradores de estudiantes.
- La importación es idempotente, comprueba la versión que estaba abierta y no sobrepasa un borrador editorial distinto. El formulario avisa sobre cambios locales sin guardar antes de confirmar.
- El catálogo inicial usa las mismas revisiones en instalaciones nuevas. El seed sigue sin reemplazar ejercicios existentes.
- Corregida la doble navegación/refresco del editor administrativo al guardar una versión, que cancelaba el stream de la respuesta actualizada.
- Verificados lint, tipos, build, 20 tests unitarios/editoriales y 15 recorridos con doble HTTP, tanto en desarrollo como en producción local. `ITERA_E2E_PRODUCTION=1` permite repetir la segunda modalidad. Sigue pendiente la publicación real en Piston; este modo de navegador no sustituye al sandbox.

## Quinta entrega: objetivos y conocimientos previos

- Objetivo y conocimientos previos recomendados guardados por versión, editables en administración y visibles en el enunciado antes de los ejemplos. No bloquean la práctica ni conceden progreso.
- Metadatos definidos para los 45 ejercicios. La importación administrativa permite preparar cualquier ejercicio del catálogo como borrador; conserva autorización, auditoría, idempotencia y protección frente a borradores distintos.
- Migración aditiva aplicada localmente: las 45 versiones históricas conservan su contenido y reciben valores vacíos, con mensajes públicos que no los confunden con ausencia de requisitos. Recuentos y huellas de versiones, variantes, casos, borradores, progreso, envíos y cuentas iguales antes y después.
- Los objetivos son obligatorios para guardar y publicar nuevas versiones. Las instalaciones existentes no se actualizan ni publican automáticamente; el seed continúa omitiendo slugs existentes.
- Formulario administrativo deshabilitado hasta completar la hidratación para impedir que una edición temprana se mezcle con el texto inicial.
- Verificados lint, tipos, 25 pruebas unitarias/editoriales, build y 15 recorridos E2E con doble HTTP en desarrollo y producción local. Piston sigue pendiente; no se afirma validación real del catálogo.

## Sexta entrega: conjuntos y mapas

- Cuatro actividades guiadas: pertenencia a conjuntos, construcción de valores distintos, escritura con una clave variable y actualización de contadores por letra. Cada una pide un cambio acotado y tiene cinco casos en ambos lenguajes, objetivo y conocimientos previos.
- Conecta las ideas pasa de 8 a 12 pasos con una secuencia explícita; el catálogo también respeta ese orden. Los retos posteriores a frecuencias aún requieren conceptos no cubiertos por estas introducciones.
- Una sola vez y Cada letra cuenta tienen referencias explícitas, plantillas que retiran el recorrido, pistas y explicaciones revisadas. Se pueden importar como borradores; las versiones públicas existentes no se sobrescriben ni publican automáticamente.
- Nuevas actividades y orden aplicados en la base local. Recuentos y huellas del contenido anterior, borradores, progreso, envíos y cuentas idénticos antes y después.
- El catálogo llega a 49 ejercicios y 245 casos por lenguaje. `content:paths` ahora abarca las tres rutas con secuencia editorial; no toca la ruta avanzada ni rutas personalizadas.
- Verificados lint, tipos, 27 pruebas unitarias/editoriales, build y 20 recorridos E2E con doble HTTP en desarrollo y producción local. Las revisiones de ambos retos se importaron y eliminaron únicamente como borradores temporales de prueba. Docker y Piston no están disponibles: siguen pendientes la validación real y la publicación de las revisiones.

## Séptima entrega: filtrado y comparación de textos

- Cuatro actividades guiadas: omitir espacios con desigualdad, filtrar letras y dígitos en minúsculas, comparar cadenas y comparar tablas de frecuencias. Incluyen objetivos, conocimientos previos y un cambio acotado por plantilla.
- Conecta las ideas pasa de 12 a 16 pasos; palíndromos y anagramas aparecen después de sus introducciones, antes de los retos aún pendientes de máximos, búsqueda, rotación y pilas.
- De ida y vuelta y Las mismas letras tienen referencias con recorridos explícitos, plantillas que retiran ayuda y explicaciones sin exigir regex, slicing, ordenación ni funciones auxiliares. Se mantienen las reglas originales de entrada y normalización. Las referencias, casos y metadatos se importan como nuevas versiones en borrador, nunca sobrescribiendo las públicas.
- Nuevos casos cubren puntuación, dígitos, frecuencias distintas en ambos sentidos y discrepancias al final del alfabeto. Catálogo de 53 ejercicios y 272 casos por lenguaje.
- Nuevas actividades y orden incorporados localmente. Recuentos y huellas de las versiones, variantes y casos anteriores, borradores, progreso, envíos y cuentas iguales antes y después.
- Verificados lint, tipos, build, 30 pruebas unitarias/editoriales y 24 recorridos E2E en desarrollo. En producción local, dos ejecuciones se bloquearon esperando el cierre de la respuesta del segundo guardado administrativo: 18 recorridos aprobados, uno fallido y cinco no ejecutados en cada intento. Las actividades nuevas pasan en ambos modos, pero la suite completa de producción no está aprobada. Piston sigue sin estar disponible.

## Octava entrega: cierre de acciones administrativas

- Diagnóstico del bloqueo: se observó `finish` en el servidor y resolución de `reader.closed` en el navegador mientras `Response.finished()` de Playwright seguía pendiente. No era prueba de que el servidor mantuviese abierta la respuesta; la señal de Playwright no era fiable para estos streams en este entorno.
- Los E2E observan ahora el cierre del lector nativo usado por React, sin clonar, consumir, cancelar ni sustituir su lectura. Siguen esperando EOF y fallan si hay error o si el stream queda pendiente. Dos pruebas controladas verifican esa distinción.
- El formulario usa `action` de React y publicación/ocultación usan transiciones. Eliminados los refrescos redundantes tras acciones que ya revalidan la página. Se conservan autenticación, auditoría y revalidación del servidor.
- La regresión comprueba tres guardados, publicación, ocultación y las cinco importaciones editoriales, sin alterar contenido histórico ni el trabajo de estudiantes. No se han añadido reintentos ni ampliado los tiempos de espera.
- Lint, tipos, build y 30 pruebas unitarias/editoriales aprobados. Los 26 E2E pasan en desarrollo y en dos ejecuciones completas consecutivas de producción local. El catálogo no cambia; Piston real continúa pendiente.

## Novena entrega: máximos distintos y ausencia

- Tres actividades guiadas: Conserva el mayor, Cuando no hay un valor y El mayor por debajo del límite. Presentan el candidato inicial, listas vacías, None/null, comprobación explícita de ausencia y filtrado estricto antes de integrar las ideas.
- Conecta las ideas pasa de 16 a 19 pasos. El segundo lugar usa dos recorridos consecutivos, sin ordenar ni mantener simultáneamente dos máximos; su plantilla retira los recorridos guiados. La revisión conserva las reglas y los cinco casos originales, añade cobertura y se importa como borrador nuevo.
- Catálogo de 56 ejercicios y 296 casos editoriales por lenguaje. Una enumeración adicional comprueba 2911 entradas por lenguaje con listas cortas, negativos, cero, repetidos, ausencia y límites iguales o externos.
- Seed y rutas aplicados localmente: se conservaron las huellas de las diez tablas comprobadas para todas sus filas anteriores. No se modificaron versiones públicas existentes, borradores, envíos, progreso ni cuentas.
- Lint, tipos, build, 33 pruebas unitarias/editoriales y 29 E2E aprobados en desarrollo y producción local. Las seis importaciones editoriales incluyen El segundo lugar. En desarrollo se sigue observando un error de escritura de stream durante el recorrido administrativo, sin fallo del cierre de las acciones monitorizadas; queda registrado para diagnóstico. En producción no apareció. Piston real continúa pendiente.

## Décima entrega: índices y búsqueda binaria

- Cuatro actividades guiadas: Repite mientras se cumpla, Visita cada posición, Una posición en el centro y Descarta una mitad. Separan condición de parada, índice frente a valor, división entera y reducción estricta de un intervalo inclusivo.
- Conecta las ideas pasa de 19 a 23 pasos. Busca a la mitad retira el bucle de la plantilla y combina los conceptos anteriores con referencias explícitas en ambos lenguajes. Conserva los cinco casos originales y añade extremos, un único elemento y el índice de un cero. La revisión es importable como borrador nuevo, sin sobrescribir la versión pública.
- Catálogo de 60 ejercicios y 326 casos por lenguaje. Una prueba adicional comprueba 1718 entradas por lenguaje; usa búsqueda lineal como oráculo, rechaza accesos fuera de rango y limita los accesos de la referencia binaria según el logaritmo del tamaño, también con 10000 elementos. No atribuye esa complejidad a programas de usuarios.
- Seed y rutas aplicados localmente. Las filas previas de las diez tablas comprobadas conservan sus recuentos y huellas; solo se añadieron cuatro ejercicios, cuatro versiones, ocho variantes y 50 casos. Borradores y datos de estudiantes intactos.
- Lint, tipos, build, 36 pruebas unitarias/editoriales y 32 E2E aprobados en desarrollo y producción local. Las siete importaciones editoriales incluyen búsqueda binaria. No apareció el error de stream registrado en la entrega anterior, pero no se da por corregido sin diagnóstico. Piston real continúa pendiente.

## Undécima entrega: recorridos circulares y rotación

- Tres actividades guiadas: Las vueltas que sobran, Después del último, el primero y Empieza en otra posición. Presentan resto respecto al tamaño, avance circular y contador independiente de parada.
- Conecta las ideas pasa de 23 a 26 pasos. Un giro a la derecha combina normalización e índices, sin exigir segmentos, slicing ni operaciones para mover elementos. Conserva los cinco casos originales y amplía a diez; la revisión se importa como borrador nuevo.
- Catálogo de 63 ejercicios y 347 casos por lenguaje. Una prueba adicional comprueba 3066 entradas por lenguaje, con tamaño uno, listas vacías, negativos, cero, repetidos, vueltas completas y k de un millón. Los recorridos leen exactamente una vuelta, generan una lista distinta y no modifican la entrada.
- Seed y rutas aplicados localmente: las filas previas de las diez tablas comprobadas conservan sus recuentos y huellas. Solo se añadieron tres ejercicios, tres versiones, seis variantes y 32 casos. Se aclaró el enunciado de una de esas actividades nuevas sin tocar contenido anterior.
- Lint, tipos, build, 39 pruebas unitarias/editoriales y 35 E2E en desarrollo aprobados. Producción local: 26 aprobados, un fallo administrativo y ocho importaciones no ejecutadas. Los recorridos nuevos pasan en ambos modos. El fallo detecta dos peticiones canceladas al publicar y ocultar, aunque el observador del lector confirmó cierre; no se ha determinado la causa y se mantienen ambas comprobaciones. Piston real continúa pendiente.

## Duodécima entrega: distinguir EOF de cancelación

- Reproducida la discrepancia fuera de Next y React con scripts/diagnose-action-stream.mjs: veinte respuestas HTTP locales, con y sin gzip, terminaron en el servidor y llegaron íntegras hasta EOF en el navegador aunque DevTools informó ERR_ABORTED. No se atribuye una causa interna concreta a Chromium/Playwright ni un fallo de la aplicación a partir de ese aviso.
- El observador exige ahora read().done, no solo reader.closed, y distingue cancelación explícita, error y respuesta pendiente. Conserva lector y promesas nativas sin clonar ni consumir datos adicionales.
- requestfailed sigue observado por petición concreta: solo se clasifica ERR_ABORTED como discrepancia diagnóstica si esa misma petición tiene HTTP satisfactorio y EOF comprobado sin error ni cancelación. Se adjunta el registro a la prueba. Peticiones no observadas, otros errores y entregas incompletas siguen fallando.
- Nueve pruebas de observación/transporte cubren fragmentos pendientes, EOF, errores, cancelación del lector/cuerpo, HTTP real sin comprimir/gzip, conexión truncada, cancelación real y HTTP 503. Se mantienen las comprobaciones de interfaz y persistencia de los recorridos administrativos.
- Lint, tipos, build, 39 pruebas unitarias/editoriales y 42 E2E aprobados en desarrollo y en dos ejecuciones completas consecutivas de producción. Compresión y revalidación conservan su configuración original; no se añadieron reintentos ni se aumentaron timeouts. Catálogo y rutas sin cambios. Piston real continúa pendiente.

## Decimotercera entrega: currículo común de lógica

- 136 ejercicios nuevos, 28 de Iniciación, 36 de Principiante, 36 de Intermedio y 36 de Avanzado, agrupados en 25 bloques. Python, JavaScript y TypeScript comparten enunciados, casos y posiciones; solo cambian sintaxis, explicaciones y plantillas.
- Iniciación es un nivel real en esquema, filtros y preferencias. La ruta Desde cero presenta instrucciones, variables, operaciones, entrada, tipos, comparaciones, funciones e integración antes de las demás etapas. TypeScript introduce tipos desde la primera variante sin exigir JavaScript.
- La sustitución `npm run content:replace -- --apply` valida referencias y plantillas en Piston antes de publicar; retira solo las 140 identidades históricas conocidas y conserva cuentas, intentos, borradores, progreso y rutas personalizadas. Las identidades nuevas empiezan sin completados y el historial anterior queda consultable.
- La activación completa validó 116 funciones por lenguaje y 20 programas por lenguaje. Una revisión posterior convirtió «Corrige una fórmula con paréntesis» en un programa de salida fija para no adelantar la entrada de datos; se publicó como versión 2 y la anterior permanece en el historial.
- Lint focalizado, tipos, build, 89 pruebas unitarias/editoriales y 103 E2E aprobaron. La verificación corrigió una etiqueta de recuperación desactualizada y el desbordamiento de la autoevaluación con texto al 200 % a 320 px.

## Propuesta histórica tras la decimotercera entrega

Revisar con uso real la progresión de Iniciación y ajustar la dificultad de los primeros pasos; después, ensayar una instalación limpia con Piston y documentar el respaldo.

## Propuestas históricas de fiabilidad y experiencia

- Añadir una pantalla de cierre y repaso al completar una ruta; la continuación ya respeta sus límites.
- Ofrecer recuperación explícita de borradores de versiones anteriores.
- Mantener la clave idempotente tras una respuesta de ejecución incierta.
- Consola de depuración solo para ejemplos visibles; preservar confidencialidad de casos ocultos.
- Explicar JSON y sus diferencias con los valores de Python.
- Validar instalación limpia, build, E2E con doble y catálogo completo en Piston; registrar fecha y alcance.

## Propuestas históricas de GitHub y mantenimiento

- Ejecutar CI y después configurar sus comprobaciones como obligatorias para main.
- Organizar issues y un milestone de mejora pedagógica; completar descripción y temas.
- Revisar actualizaciones de dependencias y activar Dependabot sin integración automática.
- Decidir licencia con el propietario; no asumir una.
- Documentar y ensayar respaldo/restauración; fijar imagen de Piston verificable.
- Separar borradores, ejecución y ayudas del workspace sin una reescritura general.

IA opcional y ampliación masiva del catálogo quedan después de validar la experiencia básica.
