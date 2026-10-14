# Prioridades de Itera

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

## Pendiente: progresión completa

1. Validar el recorrido con principiantes y ajustar la retirada de ayuda: las introducciones ya cubren igualdad, condiciones combinadas, selección, cadenas, pertenencia, rangos y productos.
2. Publicar las revisiones didácticas ya preparadas de los retos originales tras validarlas en Piston; la instalación existente conserva sus versiones públicas antiguas hasta entonces.
3. Revisar la calibración de tiempos y la retirada de ayuda con estudiantes reales.
4. Añadir ejemplos explicados por lenguaje. Objetivos y prerrequisitos por versión ya están implementados; su incorporación a versiones públicas existentes requiere revisión y publicación.
5. Añadir introducciones a conjuntos, mapas, pilas, búsqueda, grafos y programación dinámica antes de sus respectivos retos.
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

## Siguiente entrega

Introducir conjuntos y mapas con actividades guiadas antes de los retos intermedios que eliminan duplicados o cuentan frecuencias. Revisar su orden y conocimientos previos, sin saltar directamente a grafos o programación dinámica.

## Fiabilidad y experiencia

- Añadir una pantalla de cierre y repaso al completar una ruta; la continuación ya respeta sus límites.
- Ofrecer recuperación explícita de borradores de versiones anteriores.
- Mantener la clave idempotente tras una respuesta de ejecución incierta.
- Consola de depuración solo para ejemplos visibles; preservar confidencialidad de casos ocultos.
- Explicar JSON y sus diferencias con los valores de Python.
- Validar instalación limpia, build, E2E con doble y catálogo completo en Piston; registrar fecha y alcance.

## GitHub y mantenimiento

- Ejecutar CI y después configurar sus comprobaciones como obligatorias para main.
- Organizar issues y un milestone de mejora pedagógica; completar descripción y temas.
- Revisar actualizaciones de dependencias y activar Dependabot sin integración automática.
- Decidir licencia con el propietario; no asumir una.
- Documentar y ensayar respaldo/restauración; fijar imagen de Piston verificable.
- Separar borradores, ejecución y ayudas del workspace sin una reescritura general.

IA opcional y ampliación masiva del catálogo quedan después de validar la experiencia básica.
