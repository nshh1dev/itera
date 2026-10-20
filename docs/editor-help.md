# Ayuda del editor

La columna de enunciado tiene tres accesos de ayuda, inicialmente cerrados:

- **Comprender la idea:** habilidades concretas (o el objetivo general si no hay habilidades), teoría y ejemplo del módulo para el lenguaje seleccionado, coste orientativo y repaso previo opcional. Se omiten los campos vacíos, el relleno conocido y los duplicados literales del título, enunciado y otras habilidades. No se deducen conocimientos previos inexistentes ni se modifican los datos editoriales.
- **Pistas progresivas:** conserva la revelación y el registro de pistas existentes. Los errores comunes se consultan mediante «Revisar errores comunes», sin otro acordeón ni revelación automática. Se eliminan los errores que ya repiten una pista.
- **Solución explicada:** abrir el apartado no carga la solución. Sigue siendo necesario pulsar «Ver solución explicada»; consultar ayuda no concede progreso.

La teoría ya no repite el objetivo general del módulo ni instrucciones de cierre genéricas. Los conocimientos previos son recomendaciones con enlaces, no bloqueos. La deduplicación es conservadora: no se eliminan conceptos distintos mediante similitud de palabras.

Las condiciones necesarias se leen junto al enunciado, también sin JavaScript. El historial de hasta cinco intentos del ejercicio y lenguaje actuales pasa a **Resultados**, después del resultado actual y inicialmente plegado. Se conserva el componente compartido de actividad, el filtrado del servidor, el comportamiento de ejecución y los controles del editor.

## Verificación — 20 de octubre de 2026

- Pruebas unitarias: **104 aprobadas**, incluyendo deduplicación, ausencia de contenido, escape de HTML y estructura sin desplegables anidados.
- Build, TypeScript y ESLint de `src` y `tests`: aprobados. No se ejecutó lint global sobre las herramientas locales sin seguimiento; en entregas previas contiene avisos ajenos a la aplicación.
- E2E focalizadas: **63 aprobadas**, con tres lenguajes, móvil, escritorio, ventanas bajas, claro/oscuro, teclado, movimiento reducido y persistencia del editor y de las pistas. Incluyen el historial plegado en Resultados sin desplazar la ejecución actual.
- Confirmación global: **114 aprobadas, una fallida y una dependiente no ejecutada**. El fallo previo de `ux-polish.spec.ts` se reproduce al crear la cuenta temporal: Better Auth responde **429, Too many requests**. Ese archivo aprobó sus seis pruebas en el lote separado anterior; no se deshabilita la protección de autenticación para ocultar el fallo. No se presenta la ejecución global como completamente aprobada.
- Tras la confirmación se reforzaron dos casos unitarios de deduplicación: mantener operadores distintos y omitir hijos vacíos en una guía sin contenido. No cambian los recorridos con contenido comprobados en navegador.
- Capturas locales revisadas: `.local/screenshots/r1-*.png` y `.local/screenshots/help-inline-*.png`. Muestran contenido de prueba temporal, no datos de estudiantes.
- Las E2E utilizan el doble HTTP de Piston; no comprueban ejecución real ni aislamiento. No se ejecutaron las suites del runner real ni se inició Docker, al no cambiar código del ejecutor.
- Sin migraciones, dependencias nuevas ni cambios de casos, soluciones, borradores o progreso. Los servidores temporales de E2E se cierran al finalizar.
