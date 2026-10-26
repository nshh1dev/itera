# Ayuda del editor

La columna de enunciado tiene tres accesos de ayuda, inicialmente cerrados:

- **Comprender la idea:** habilidades concretas (o el objetivo general si no hay habilidades), teoría y ejemplo del módulo para el lenguaje seleccionado, coste orientativo y repaso previo opcional. Se omiten los campos vacíos, el relleno conocido y los duplicados literales del título, enunciado y otras habilidades. No se deducen conocimientos previos inexistentes ni se modifican los datos editoriales.
- **Pistas progresivas:** conserva la revelación y el registro de pistas existentes. Los errores comunes se consultan mediante «Revisar errores comunes», sin otro acordeón ni revelación automática. Se eliminan los errores que ya repiten una pista.
- **Solución explicada:** abrir el apartado no carga la solución. Sigue siendo necesario pulsar «Ver solución explicada»; consultar ayuda no concede progreso.

La teoría ya no repite el objetivo general del módulo ni instrucciones de cierre genéricas. Los conocimientos previos son recomendaciones con enlaces, no bloqueos. La deduplicación es conservadora: no se eliminan conceptos distintos mediante similitud de palabras.

Las condiciones necesarias se leen junto al enunciado, también sin JavaScript. El historial de hasta cinco intentos del ejercicio y lenguaje actuales pasa a **Resultados**, después del resultado actual y inicialmente plegado. Se conserva el componente compartido de actividad, el filtrado del servidor, el comportamiento de ejecución y los controles del editor.

## Comprobaciones

Las regresiones cubren deduplicación conservadora, operadores distintos, campos
vacíos, escape de HTML y estructura sin desplegables anidados. Los recorridos de
navegador cubren tres lenguajes, móvil/escritorio, ambos temas, teclado, movimiento
reducido y persistencia del editor, pistas e historial plegado.

Las E2E con doble HTTP no verifican ejecución real ni aislamiento. No desactivar
el limitador de autenticación para ocultar un 429 al crear cuentas temporales.
Procedimientos y resultados generales: [verification.md](verification.md).
