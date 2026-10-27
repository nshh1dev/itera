# Ayuda del editor

La columna de enunciado muestra directamente las instrucciones, los ejemplos y la teoría esencial:

- **Guía visible:** habilidades concretas (o el objetivo general si no hay habilidades), teoría y ejemplo del módulo para el lenguaje seleccionado y coste orientativo. «Antes de empezar» conserva el repaso opcional plegado. Se omiten campos vacíos, relleno conocido y duplicados literales; no se deducen conocimientos previos inexistentes.
- **Mostrar una pista:** revela y registra una pista cada vez, sin tener que abrir antes otro panel. Los errores comunes se consultan mediante «Revisar errores comunes». Se eliminan los errores que ya repiten una pista.
- **Ver solución explicada:** carga la solución únicamente al pulsar esta acción y la muestra en un diálogo. Cerrar devuelve el foco al botón; volver a abrir reutiliza la solución cargada. Consultar ayuda no concede progreso.

La teoría ya no repite el objetivo general del módulo ni instrucciones de cierre genéricas. Los conocimientos previos son recomendaciones con enlaces, no bloqueos. La deduplicación es conservadora: no se eliminan conceptos distintos mediante similitud de palabras.

Las condiciones necesarias se leen junto al enunciado, también sin JavaScript. El historial de hasta cinco intentos del ejercicio y lenguaje actuales se consulta con **Historial**, junto a las opciones del editor, en un diálogo independiente. No se mezcla con los resultados del código actual. Se conserva el componente compartido de actividad y el filtrado del servidor.

En iniciación (salvo proyectos) solo aparece **Comprobar solución**. Ctrl / ⌘ + Enter y su variante con Shift hacen esa misma comprobación. En ejercicios posteriores se conserva **Ejecutar ejemplos** como acción secundaria; los proyectos mantienen sus pruebas propias sin progreso. En el diagnóstico ambos atajos corresponden a **Comprobar respuesta**, sin completar ejercicios de práctica.

Los ejemplos de programas muestran texto real con sus saltos de línea y omiten la entrada si no existe. Cuando hay un solo caso visible de programa sin artefactos, Resultados muestra primero su salida y después la evaluación; un acierto no añade otra tarjeta con la misma salida. Los fallos conservan la comparación y la primera diferencia visible. Las funciones conservan su representación de datos JSON y los casos ocultos nunca llegan a la comparación del navegador.

`src/lib/lesson-language.ts` contiene explicaciones explícitas por lenguaje para los bloques con diferencias sintácticas. Los bloques neutrales conservan su teoría común; no se filtran frases en el navegador. Los enunciados, pistas y explicaciones persistidos requieren nuevas versiones mediante el flujo editorial: cambiar estas fuentes no actualiza lo ya publicado.

Las fuentes de fundamentos y proyectos generan explicaciones específicas por lenguaje. `prisma/learning-revisions.ts` aplica las correcciones editoriales y conserva sus variantes; cuando una corrección sustituye un texto común, actualiza también el texto de las variantes para evitar que la importación recupere la explicación anterior. `tests/practice-clarity.test.ts` recorre las 176 actividades y los 36 bloques para detectar mezclas sintácticas. Esta comprobación no certifica por sí sola la claridad pedagógica de todos los textos ni su publicación en una instalación.

La interfaz utiliza Source Sans 3 con archivos y licencia locales en `src/app/fonts/`, mediante `next/font/local`; el código conserva Geist Mono.

## Comprobaciones

Las regresiones cubren deduplicación conservadora, operadores distintos, campos
vacíos, escape de HTML y estructura sin desplegables anidados. Los recorridos de
navegador cubren tres lenguajes, móvil/escritorio, ambos temas, teclado, movimiento
reducido y persistencia del editor, pistas y consulta secundaria del historial.

Las E2E con doble HTTP no verifican ejecución real ni aislamiento. No desactivar
el limitador de autenticación para ocultar un 429 al crear cuentas temporales.
Procedimientos y resultados generales: [verification.md](verification.md).
