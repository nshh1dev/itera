# Plan temporal: claridad educativa y espacio de práctica

## Ciclo de vida

Este archivo registra el plan acordado a partir de las diez capturas del usuario. **Eliminarlo cuando toda su implementación y verificación hayan finalizado**, no al completar solo una parte. Mantener aquí el avance mientras quede trabajo pendiente.

## Avance de la primera entrega

- Implementados: diagnóstico con una acción, reutilización de ejemplos legibles, teoría esencial visible, pistas directas, solución e historial en diálogos, acción integrada en la fila de la ruta y Source Sans 3 local.
- Adaptada la teoría con diferencias de sintaxis por lenguaje; una regresión recorre los 36 bloques. No equivale a haber completado la revisión editorial de los 176 ejercicios.
- Revisados inicialmente los enunciados de saludo, actualización de puntos y elección de mensaje; adaptada la ayuda de saludo, dos líneas, lectura de nombre/doble, booleano e igualdad. El resto del catálogo y sus metadatos siguen pendientes de revisión integral.
- Adaptadas las explicaciones de fundamentos con diferencias sintácticas y las instrucciones de módulos/archivos de los proyectos. Corregidas mezclas adicionales en pistas y soluciones de colecciones, conversión, ausencia, aserciones y dependencias. Una regresión recorre las 176 actividades y sus tres variantes; comprueba coherencia de lenguaje, no acredita por sí sola la revisión pedagógica integral.
- Las revisiones editoriales **no están activadas**. La instalación nativa conserva 136 ejercicios publicados y Piston real no está disponible. No sustituir el catálogo ni publicar con el doble HTTP.
- Primera entrega acotada a interfaz, coherencia sintáctica y correcciones editoriales parciales. Publicar este avance de código no equivale a activar revisiones ni a completar la revisión pedagógica integral. Mantener este plan hasta terminar también ese trabajo.

### Verificación parcial (27 de octubre de 2026)

- Verificación final: **lint, tipos y build aprobados**; suite unitaria con **351 aprobadas, sin fallos ni omisiones**.
- Tanda ampliada inicial: **47 aprobadas, 19 fallidas y 12 no ejecutadas**. Nueve fallos corresponden a rutas que esperan el catálogo de 176 actividades mientras la base conserva 136. No se han rebajado esas expectativas ni activado contenido con el proveedor falso.
- Corregidas expectativas de tipografía, etiquetas y mensajes de estado; corregida una carrera real de hidratación que podía sobrescribir una selección recién hecha en filtros.
- Tras las correcciones: guía inicial, tipografía y ayuda aprueban en los tres lenguajes; el recorrido serial de flujos aprueba completo (**13 pruebas**). Teoría visible y reflujo en ambos temas aprueban (**3 pruebas**). Zoom real al 200 % aprobó en ambos temas en la tanda ampliada.
- Repetición completa de `ux-learning` y `plan-impeccable`: **9 aprobadas y 2 fallidas**. Configuración espera un diálogo aunque la implementación vigente es una página; continuidad espera cambiar automáticamente de lenguaje aunque `personalizedPractice` limita la recomendación al preferido. Esas implementaciones no se han modificado en esta entrega; no cambiar sus reglas ni rebajar sus pruebas como arreglo independiente.
- Los resultados E2E usan el doble HTTP y no verifican Piston real, aislamiento ni activación editorial. Se observaron avisos de movimiento reducido y un aviso de hidratación asociado al estilo de cursor transparente de las capturas; no se presenta la tanda global como aprobada.
- Última tanda focalizada de 46 E2E: **34 aprobadas, 1 fallida por el límite real de registro y 11 no ejecutadas** al ser seriales. Repetido `flows.spec.ts` completo por separado: **13 aprobadas**. Aprueban controles, recuperación de ejecuciones y diagnóstico, ayuda, tipografía, reflujo y zoom real al 200 % en ambos temas. No se desactivaron límites de autenticación.
- Terminadas las pruebas, los puertos 3000 y 2001 quedaron sin servidores temporales; se detuvo el PostgreSQL privado que se había iniciado para esta tarea. La base conserva el respaldo previo a las cuatro migraciones aplicadas, sin reset ni sustitución del catálogo.

## Objetivo

Que alguien que empieza entienda qué hacer, qué ocurrió al ejecutar su código y cómo continuar, sin interpretar detalles internos de la plataforma. Conservar el diseño sobrio, la paleta y el espacio útil del editor.

## 1. Simplificar el diagnóstico (imágenes 1 y 2)

- [x] Mostrar las entradas y salidas de programas como texto real, no como JSON con comillas y secuencias como `\n`.
- [x] Usar una etiqueta comprensible: «Salida esperada» en los programas sin entrada.
- [x] Omitir la entrada cuando el ejercicio no recibe datos, en lugar de mostrar `Entrada: ""`.
- [x] Sustituir «Probar ejemplos» y «Evaluar reto» por una sola acción: «Comprobar respuesta».
- [x] Alinear atajos, mensajes de resultados y estados vacíos con esa acción única.
- [x] Conservar el diagnóstico opcional, su recomendación y sus borradores independientes; no conceder progreso de práctica.

## 2. Revisar todo el contenido educativo (imágenes 3, 4, 6 y 10)

- [ ] Revisar los 176 ejercicios y los 36 bloques de teoría, incluidos enunciados, objetivos, pistas y soluciones explicadas de Python, JavaScript y TypeScript.
- [ ] Explicar qué problema se resuelve y qué código está preparado, qué hay que completar o corregir, qué datos se reciben y qué se debe mostrar o devolver.
- [ ] Incluir ejemplos comprensibles y condiciones relevantes, con vocabulario acorde al nivel y sin adelantar conceptos innecesarios.
- [ ] Contrastar cada descripción con su plantilla, sus casos y la regla conceptual, sin cambiar los contratos como parte de una corrección editorial.
- [ ] Adaptar toda explicación sintáctica al lenguaje elegido. En Python no deben aparecer instrucciones de JavaScript o TypeScript irrelevantes para el ejercicio.
- [ ] Corregir la generación de textos compartidos y las revisiones editoriales que reemplazan explicaciones específicas por textos comunes; no limitarse a ocultar nombres de lenguajes en la interfaz.
- [ ] Mantener los contratos comunes, las identidades, el progreso y las versiones históricas.

### Ejemplos de redacción propuestos

**Actualiza una puntuación**

> El código empieza guardando 8 puntos en la variable `puntos`. Después debes añadir los 3 puntos que has ganado, pero la actualización está mal.
>
> Corrige esa instrucción para conservar los puntos anteriores y sumar los nuevos. Al terminar, muestra el valor de `puntos`: debe ser 11.

**Elige entre dos mensajes**

> La función recibe un número y debe devolver uno de estos textos:
> - `"positivo"` cuando el número sea mayor que 0.
> - `"no positivo"` cuando sea 0 o negativo.
>
> El código ya comprueba el número, pero devuelve un texto equivocado cuando es positivo. Corrige esa respuesta.

Confirmar estos textos contra las plantillas efectivas antes de aplicarlos.

## 3. Unificar la presentación de la ruta (imagen 5)

- [x] Eliminar la tarjeta independiente «Tu siguiente paso» de la página de una ruta.
- [x] Integrar «Empezar» o «Continuar» en el ejercicio correspondiente dentro del recorrido, con su nombre visible y el módulo abierto.
- [ ] Conservar un solo recorrido reconocible, la selección de lenguaje, el progreso por lenguaje y el acceso libre.
- [x] No extender este cambio a otras pantallas sin necesidad.

## 4. Reorganizar el espacio de práctica (imágenes 7, 8 y 9)

### Panel izquierdo

- [ ] Mostrar directamente qué hay que hacer, el resultado esperado o los ejemplos, una explicación breve del concepto y un ejemplo de aprendizaje del lenguaje elegido.
- [x] No esconder la información necesaria para empezar en una colección de desplegables.
- [x] Revelar pistas mediante «Mostrar una pista», manteniendo su carácter progresivo.
- [x] Mantener la solución detrás de una acción explícita «Ver solución explicada», sin cargarla ni mostrarla anticipadamente.

### Ejecución y resultados

- [x] Mostrar primero la salida del programa cuando corresponda al modo de ejecución y después un mensaje claro de evaluación.
- [x] No confundir salida, ejemplos y comprobaciones: el indicador de éxito de un caso no sustituye la explicación del resultado.
- [x] Mostrar comparaciones entre resultado esperado y obtenido cuando ayuden a entender un fallo.
- [x] Ofrecer el detalle de comprobaciones cuando haya varios casos, sin repetir paneles innecesarios en ejercicios sencillos.
- [x] Retirar el historial de intentos del panel principal de resultados y dejarlo accesible mediante una opción secundaria «Historial».
- [x] En iniciación, usar «Comprobar solución» como única acción principal; mantener la ejecución de ejemplos como acción secundaria en ejercicios posteriores, con explicación breve.
- [x] Mantener las pruebas propias de proyectos y distinguirlas de la comprobación que concede progreso.
- [ ] Alinear atajos, accesibilidad, estados vacíos, errores y avisos de código editado con los nuevos controles.
- [x] Preservar el filtrado de casos ocultos, las diferencias calculadas solo con datos visibles y la finalización atómica por usuario, ejercicio y lenguaje.

## 5. Tipografía global

- [x] Usar **Source Sans 3** para títulos, explicaciones, navegación y controles, servida localmente y sin solicitudes externas en ejecución.
- [x] Conservar una fuente monoespaciada para el código.
- [ ] Revisar legibilidad, pesos, jerarquía y saltos de línea en ambos temas y tamaños de pantalla.
- [x] No se necesitaron cambios de dependencias; se conservaron las existentes.

## Orden de implementación

1. Corregir el diagnóstico y definir la nueva pantalla de práctica.
2. Reorganizar práctica, resultados y navegación de ruta.
3. Completar la revisión editorial y la coherencia por lenguaje, no solo los ejemplos señalados.
4. Aplicar la tipografía global y revisar su integración.
5. Verificar, activar las revisiones editoriales cuando corresponda y completar la entrega.

## Publicación del contenido y protección de datos

- [ ] Preparar nuevas revisiones mediante el flujo editorial existente: cambiar fuentes no actualiza por sí solo el catálogo publicado en la base de datos.
- [ ] Comprobar el entorno de instalación antes de actuar sobre la base nativa o Docker; no mezclarlos.
- [ ] Validar y publicar mediante el flujo admitido y Piston cuando corresponda, sin sobrescribir borradores editoriales distintos ni borrar datos de estudiantes.
- [ ] No iniciar ni reiniciar la aplicación o servicios sin la autorización requerida por `AGENTS.md`.

## Verificación y cierre

- [x] Leer las guías pertinentes de la versión local de Next.js antes de escribir código de la aplicación.
- [x] Añadir o ajustar pruebas focalizadas de contenido, adaptación por lenguaje, diagnóstico, navegación y resultados.
- [x] Ejecutar lint, tipos, pruebas y build según los cambios, sin ejecutar tipos a la vez que build regenera Prisma.
- [x] Verificar temas claro y oscuro, móvil y escritorio, teclado, foco, movimiento reducido y zoom real al 200 % en la interfaz de esta entrega; conservar las limitaciones de recorridos indicadas arriba.
- [x] Solicitar autorización para las pruebas que inicien la aplicación. Distinguir el doble HTTP de Piston de la ejecución real.
- [x] Informar comprobaciones aprobadas, fallidas y omitidas, y cualquier bloqueo de activación editorial.
- [ ] Revisar el diff y publicar los cambios terminados mediante el flujo Git del repositorio, salvo instrucción posterior en contra.
- [ ] Eliminar este archivo al concluir toda la implementación y su verificación; conservar las decisiones permanentes necesarias en la documentación correspondiente.
