# Recorrido específico de Python

## Contrato

Python conserva las 176 identidades del currículo común y añade 48 actividades propias: 224 pasos (32/73/83/36 por nivel) en las mismas cuatro rutas. JavaScript y TypeScript conservan sus fuentes, orden, niveles, versiones publicadas, contratos y casos. Las competencias nuevas tienen slugs `python-*`; no heredan completados anteriores. El documento original `python-logica-y-flujo.md` no se importa ni se modifica.

La secuencia está en `src/lib/python-curriculum.ts`. `prisma/python-content.ts` compone una fila por actividad con posición, nivel, objetivo, prerrequisito anterior, modalidad, ayuda y pruebas. Las referencias nuevas y sus casos independientes están en `prisma/python-lessons.ts`; errores frecuentes y ejemplos explicados, en `prisma/python-help.ts`. Las fuentes compartidas permanecen intactas.

- No hay migración: una versión puede contener solo Python. Cada lenguaje selecciona su última versión publicada que contenga ese lenguaje, no la última versión global.
- La proyección solo se activa cuando el catálogo publicado contiene `python-constante`. Preparar borradores no cambia la experiencia activa. Se publica el lote entero en una transacción.
- Rutas, módulos, navegación, reanudación, recomendaciones y denominadores usan la misma proyección. Los ejercicios personalizados conservan su pertenencia a las rutas.
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
| Intermedio | Diccionarios y listas | Frecuencias → lista de categoría → agrupación | Crear antes de añadir; orden y repetidos |
| Intermedio | Bucle y filtro manual | Comprensión: transformación, filtro, condicional y diccionario | Filtrar no equivale a conservar posiciones |
| Intermedio | Auxiliares y tuplas | Agregación → función clave → lambda y desempate | Extremos ausentes, estabilidad, criterios opuestos |
| Intermedio | Decimales | Formato fijo frente a redondeo | Ceros finales y redondeo nativo al par |
| Intermedio | Diccionarios planos | Consulta anidada → inscripción → nota → resumen | `None` distinto de cero, ausencias y empates |
| Intermedio | Estado en memoria | Módulos → archivos → inventario persistente | Disco aislado por caso; proyectos conservados |
| Intermedio | Listas y comprensiones | Búsqueda, recorridos, matrices y copias | Explicaciones de diagonales e intervalos |
| Intermedio | Estructuras conocidas | Pilas, colas y recursión gradual | No exigir profundidad arbitraria al introducir diccionarios |
| Ampliación | Transformación y funciones | Iterador → generador → `map` → `filter` | Consumo, materialización, selección |
| Ampliación | Agregación y claves | Reporte de valor de inventario | Céntimos enteros; otra identidad, mismo stock anterior |
| Ampliación | Copias y textos | Contactos: crear → editar → borrar → criterios | Normalización, duplicados, campos y texto vacío |
| Ampliación | Recuperación por elemento | Un campo → reglas sobre registros | Operaciones por nombre; `ValueError` por campo |
| Avanzado | Bloques anteriores | Conservar los 36 pasos avanzados | Árboles, prioridades, exploración, dinámica y grafos |

Las ampliaciones tienen acceso libre y no bloquean algoritmos. Leer teoría o consultar soluciones no concede progreso.

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

`prisma/python-releases.ts` conserva las huellas normalizadas de entregas verificadas. Una publicación conocida puede recibir una revisión posterior desde fuentes sin perder protección frente a ediciones locales; una huella desconocida no autoriza sobrescribirlas. Registrar una nueva huella solo tras verificar y activar la entrega completa, manteniendo las anteriores.

## Verificación y límites

- `tests/python-curriculum.test.ts`: identidades, orden, cobertura, compatibilidad, referencias fijas y plantillas nuevas.
- `tests/python-install.test.ts`: doble transaccional para idempotencia, conservación y conflictos; no sustituye PostgreSQL real.
- `tests/catalog-loading.test.ts`: revisiones por lenguaje sin ocultar otros metadatos ni compartir actividad entre cuentas.
- La validación real pasa por `src/server/execution/piston.ts`. Pruebas locales de referencias no acreditan publicación ni sandbox.
- Las pruebas de resultado no certifican técnicas internas, complejidad o identidad. Las observaciones de salida fija requieren revisar el código.

## Activación en la instalación local

El 27 de octubre de 2026 se respaldó la base Docker en `.local/backups/itera-1793142065906.dump`, se prepararon 61 borradores (48 incorporaciones y 13 revisiones), se validaron las 224 referencias y plantillas en Piston Python —909 casos para cada conjunto— y se activó el lote. Preparar de nuevo creó cero borradores. Lectura posterior: Python 224, JavaScript 176, TypeScript 176; ningún borrador exclusivo pendiente.

Antes y después coincidieron 21 recuentos/huellas: las 17 tablas ajenas al contenido, ejercicios originales, versiones compartidas, variantes compartidas y sus casos. Se conservaron rutas, cuentas, sesiones, progreso, borradores, envíos y contenido histórico. No hubo migración ni sustitución global.

Las siete comprobaciones nuevas de navegador aprobaron navegación, aislamiento por lenguaje, reanudación del borrador/ruta, ejemplos sin progreso, envío real con progreso Python, claro/oscuro, teclado y ausencia de desbordamiento a 390/1440 px. Se revisaron las capturas de las rutas. Esto no equivale a una evaluación de aprendizaje con estudiantes ni certifica que una solución use la técnica sugerida.

La suite Docker completa produjo 47 aprobadas y tres fallidas: dos expectativas antiguas del denominador (30 en lugar de los 32 pasos Python) y un clic de diagnóstico sin petición POST registrada. Se adaptó el fixture del dashboard al recorrido por lenguaje, sin quitar sus aserciones. Los seis casos de dashboard/onboarding aprobaron al repetir ambos archivos completos; el fallo de diagnóstico no se reprodujo y no se modificó su código para ocultarlo. No se presenta esa repetición como una ejecución completa de 50/50.

Lint, tipos, suite unitaria completa (364/364, sin omisiones) y builds finales de Windows/Docker aprobados. Un build intermedio detectó una incompatibilidad de tipos en la comparación de huellas, corregida antes de cerrar; un intento Windows agotó su límite de 120 segundos y el reintento completo aprobó. La huella normalizada del catálogo publicado coincide con la entrega registrada, incluida la normalización del orden de propiedades JSON de PostgreSQL. Al terminar se detuvieron los servicios y Ubuntu quedó apagado, como al inicio; `docker-iniciar` recupera la imagen actualizada y el catálogo activado.
