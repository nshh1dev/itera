# Fundamentos y miniproyectos

El mapa siguiente corresponde a la ampliación común. Python añade después un [recorrido específico de 224 pasos](recorrido-python.md), conservando estas identidades y sus contratos; sus incorporaciones no crean variantes de JavaScript ni TypeScript.

## Mapa editorial

Ampliación de 40 identidades con tres variantes cada una. Resultado: 176 actividades, 36 bloques, cuatro rutas (30/57/53/36 por nivel). Los 136 slugs anteriores conservan contratos, nivel e identidad. La prueba `tests/fundamentals-content.test.ts` fija esa lista, no solo el recuento. Ninguna fuente histórica cambia.

Los slugs de la tabla llevan el prefijo `logica-`. Cada fila corresponde a una identidad nueva, no a tres progresos acreditados juntos: cada lenguaje conserva su progreso independiente.

| Bloque | Slug nuevo | Habilidad y contrato |
| --- | --- | --- |
| Seguimiento inicial | predice-valores | Predecir dos actualizaciones de un entero. |
| Seguimiento inicial | tabla-valores | Registrar tres estados en texto, sin exigir listas antes de enseñarlas. |
| Alcance | parametro-exterior | Usar el parámetro y conservar el valor exterior. |
| Alcance | llamadas-independientes | Reiniciar un contador local en dos llamadas. |
| Alcance | sin-estado-global | Recibir base y tasas explícitas en auxiliares. |
| Alcance | encadena-retornos | Pasar subtotal a otra función, sin variables compartidas. |
| Referencias | dos-nombres-lista | Observar una mutación a través de un alias. |
| Referencias | reasigna-o-muta | Reasignar un alias sin modificar su contenedor anterior. |
| Referencias | copia-plana | Copiar una lista antes de añadir un elemento. |
| Referencias | conserva-entrada | Construir valores ajustados sin alterar el original. |
| Referencias | registro-compartido | Declarar una mutación intencional de propiedad. |
| Validación | valida-divisor | Prevenir división por cero; conservar cero válido. |
| Validación | valido-cero-ausente | Separar null, negativo y cero. |
| Validación | localiza-error | Identificar un acceso inseguro y comprobar índices. |
| Excepciones | captura-conversion | Capturar conversión esperada; tratar NaN explícitamente. |
| Excepciones | error-dominio | Lanzar y comunicar un mensaje de regla violada. |
| Excepciones | recupera-elementos | Recuperar por elemento sin abortar el recorrido. |
| Pruebas | asercion-normal | Aserción real de una función auxiliar. |
| Pruebas | pruebas-limites | Probar vacío, negativo y un solo elemento. |
| Depuración | reproduce-fallo | Encontrar el mínimo reproductor de >= frente a >. |
| Depuración | conserva-regresion | Conservar pruebas de límite y resultado no negativo. |
| Gastos · 1 | gastos-registro | Registrar total y resumen por categoría, un archivo sin disco. |
| Gastos · 2 | gastos-validacion | Rechazar movimientos inválidos y completar pruebas propias. |
| Módulos | importa-preparado | Importar una función desde un archivo público preparado. |
| Módulos | extrae-modulo | Implementar y exportar una función en un auxiliar editable. |
| Módulos | separa-reglas-io | Separar regla numérica y formato del adaptador. |
| Módulos | repara-importacion | Corregir un nombre exportado, sin plantilla que se cae. |
| Módulos | organiza-modulos | Conectar reglas, formato y punto de entrada. |
| Archivos | lee-archivo | Abrir texto preparado y consultar una línea. |
| Archivos | escribe-archivo | Transformar, escribir y volver a abrir texto. |
| Archivos | valida-json | Leer cinco documentos y comprobar estructura y límites. |
| Archivos | guarda-recupera | Serializar y recuperar una lista en disco real. |
| Archivos | recupera-archivo-invalido | Distinguir archivo ausente y sintaxis JSON rota. |
| Archivos | actualiza-persistidos | Leer-modificar-escribir sin perder registros anteriores. |
| Inventario · 1 | inventario-modular | Separar operaciones y rechazar existencias negativas. |
| Inventario · 2 | inventario-persistente | Cargar stock inicial, aplicar, guardar y recuperar. |
| Copias anidadas | copia-anidada | Copiar cada fila antes de modificar una celda. |
| Agenda · 1 | agenda-operaciones | Crear y completar tareas con comandos deterministas. |
| Agenda · 2 | agenda-almacenamiento | Conectar reglas y archivo sin borrar tareas previas. |
| Agenda · 3 | agenda-regresion | Reproducir pérdida de estado y conservar regresiones. |

## Ubicación y prerrequisitos

- Iniciación mantiene instrucciones → variables → operaciones → entrada → tipos → funciones. Se insertan predicción y seguimiento antes de las cuatro integraciones existentes (`minutos-segundos`, `perimetro`, `repara-presupuesto`, `merienda`). No se exigen listas, importaciones ni decisiones en esos dos pasos.
- Principiante conserva decisiones → repetición → listas → textos → funciones y datos con nombre. `auxiliares` prepara el nuevo bloque de alcance. `variable-local` se mueve allí conservando slug y contrato. Siguen referencias planas → validación/excepciones → pruebas → integración existente (`factorial`, `fizzbuzz`, `mediciones`, `carrito`, `notas`, `saldo`) → dos hitos de gastos.
- Intermedio conserva mapas antes de módulos y archivos. Siguen dos hitos nuevos de inventario antes de búsqueda, recorridos y matrices. Solo después de `vecinos` se enseña copia anidada. Se conservan pilas/colas/recursión e integración existente, incluido `inventario`; cierran los tres hitos de agenda.
- Avanzado no añade algoritmos ni cambia orden, nivel o contratos. Se mantiene su preparación por árboles, prioridades, exploración, programación dinámica y grafos. Las nuevas integraciones refuerzan la explicación de corrección, tiempo y memoria, sin afirmar que pasar tests demuestra complejidad.
- `logic-content.ts` deriva los prerrequisitos del orden final, no del catálogo previo. Son orientación, no bloqueo. Las pruebas comprueban que siempre apuntan hacia atrás y que la secuencia relativa de las 135 identidades no movidas permanece intacta.

## Diferencias de lenguaje y APIs enseñadas

- Python crea ámbito local por función, no por cada `if` o `for`. JS/TS `let` y `const` tienen ámbito de bloque. No se requieren closures ni globales mutables.
- `const` no congela objetos. Los textos son inmutables. `list`/`slice` copia el contenedor plano; en matrices se copia cada fila. No se presenta JSON como copia universal.
- Python puede lanzar `ValueError` al convertir; JS `Number` puede producir `NaN`. Se rechaza texto vacío antes de convertir y se comprueba integralidad. TypeScript captura `unknown` y comprueba `instanceof Error`, sin `any` ni supresión de diagnósticos.
- Las primeras tablas usan `str`/`String` y concatenación. Los resúmenes de gastos presentan explícitamente claves dinámicas y `Record`, con categorías acotadas antes de enseñar mapas generales.
- Las aserciones son `assert` en Python y `node:assert/strict` en Node. `equal` compara escalares y `deepEqual` estructuras. Una aserción fallida no es fallo de infraestructura; imprimir un contador de pruebas aprobadas no es un veredicto.
- Python usa módulos locales. JS usa CommonJS en Node. Los archivos TS emitidos usan imports/exports reales y se compilan a CommonJS. Se comprueba el conjunto completo en modo estricto, no solo `main`.
- Se explican `open`, `with`, `read`, `write`, `json.load/dump`, `fs.readFileSync/writeFileSync/existsSync` y `JSON.parse/stringify`. Se introduce validación desde `unknown` antes de usar un documento leído. La gestión con `with` y el papel de `finally` se explican al trabajar con recursos.
- El almacenamiento preparado de los proyectos TS ofrece `cargar<T>()`: el parámetro de tipo representa datos controlados por ese proyecto, no validación de JSON arbitrario. Las reglas no necesitan implementar un sistema de tipos genérico propio.
- El ejemplo de matrices ya no introduce `reduce` implícitamente; usa bucles conocidos. El bloque de búsqueda explica la función flecha del comparador numérico antes de utilizarla.

## Contrato de proyectos y continuidad

Los 18 proyectos usan `FUNCTION`, no un modo nuevo. Python define `solve`, JS exporta la función mediante `module.exports = solve` y TS usa `export function solve`. Los auxiliares y recursos son archivos reales planos. El manifiesto público tiene `version`, `entrypoint`, `files` y, cuando corresponde, `testEntrypoint`, `previousStep` y `verifyPersistence`; las soluciones completas están únicamente en `projectSolutions`, fuera del manifiesto. El contenido importa los tipos compartidos `ProjectDefinition` y `ProjectFile` desde `src/lib/project.ts`; no mantiene copias estructurales temporales.

Los campos de solución y plantilla del archivo principal se derivan de los mismos datos editoriales por compatibilidad, no se editan como fuentes independientes. Los tres proyectos integradores tienen siete hitos, cada uno con identidad, casos, requisitos y plantilla propia. `previousStep` orienta una copia explícita sin modificar el original; no es un prerrequisito que cierre el acceso.

### Evaluación de archivos producidos

Seis actividades declaran `expectedFiles: [{path, content}]` en todos sus casos: `escribe-archivo`, `guarda-recupera`, `actualiza-persistidos`, `inventario-persistente`, `agenda-almacenamiento` y `agenda-regresion`. Son **20 expectativas editoriales independientes** (12 visibles y ocho ocultas), compartidas por los tres lenguajes. Los literales esperados no se obtienen ejecutando la referencia ni serializando su retorno.

Estas actividades evalúan **archivos nuevos** y mantienen `historial.json` y `estado.json` como recursos iniciales de solo lectura; las actualizaciones crean `guardado.json`. El contrato compartido también admite datos editables existentes, pero nunca código ni recursos `readOnly`. En inventario y agenda, `cargar` lee primero esa instantánea si ya existe y, antes del primer guardado, usa `estado.json`. La actividad de texto crea `resultado.txt`. Ninguno de esos archivos de salida se prepara en el manifiesto público.

Las expectativas comparan UTF-8 exacto. Para el JSON acotado de estas actividades se enseña una representación determinista: sin espacios de separación ni salto final; Python `json.dump(datos, archivo, ensure_ascii=False, separators=(',', ':'))`, JS/TS `JSON.stringify(datos)`. Se conservan el orden de listas y la inserción de claves: stock inicial antes de productos nuevos, y `titulo` antes de `hecha` en tareas. Los contratos explicitan ese formato; no se finge una comparación JSON semántica de archivos. Este formato no es una receta universal de canonicalización de JSON arbitrario.

Las pruebas locales abren los archivos reales y comparan sus contenidos, además del retorno; comprueban que los recursos iniciales sigan intactos y que un resultado correcto con archivo ausente o alterado sea rechazado. Los manifiestos públicos no contienen expectativas privadas. Los casos ocultos y sus artefactos deben seguir filtrándose mediante la plataforma.

### Persistencia en dos procesos

`inventario-persistente`, `agenda-almacenamiento` y `agenda-regresion` activan `verifyPersistence: true` en Python, JavaScript y TypeScript. Sus **once casos** (seis visibles y cinco ocultos) declaran `expectedPersistence` como datos editoriales independientes, no derivados del primer retorno ni del archivo esperado. La primera llamada usa la entrada del caso; la segunda ejecuta `solve([])` en un proceso nuevo sobre el mismo directorio, sin restaurar archivos. Inventario recupera el stock final y devuelve `rechazados: 0`: los rechazos de la primera entrada no se acumulan. Agenda recupera las tareas finales sin cambios. `guardado.json` conserva el contenido exacto esperado después de ambas llamadas, y `estado.json` permanece intacto.

Las pruebas curriculares arrancan **dos procesos nuevos y distintos por caso** para cada lenguaje (33 pares), sin reutilizar módulos ni globals ni ejecutar pruebas propias entre esas llamadas. Comparten únicamente el disco del caso; antes de cada par se prepara otro directorio limpio. TS se ejecuta como CommonJS tras la compilación estricta comprobada por la suite. Esto verifica referencias fijas locales, **no demuestra Piston probado, durabilidad ante fallos ni cada decisión interna de una solución alternativa**. El conductor de plataforma compara `expectedPersistence` fuera del sandbox; contrato y límites en [ejecución de proyectos](project-execution.md).

Cada actividad variable tiene al menos tres entradas distintas, dos visibles y las restantes ocultas. Las respuestas se escriben como datos independientes, no se calculan ejecutando la referencia. Las plantillas son ejecutables y no pasan todos los casos. Los fragmentos deliberadamente defectuosos se explican en el enunciado; no se admite una excepción deliberada en la plantilla oficial. Los fallos lógicos, como contar cero entre positivos, sí se permiten y terminan normalmente.

## Límites y activación

Las actividades de escritura comprueban reapertura y archivos; los tres hitos indicados añaden recuperación en un segundo proceso. Cada caso reinicia los recursos, no cada llamada del mismo caso. **No hay persistencia entre envíos.** Los tests curriculares ejecutan solo código fijo del repositorio con directorios temporales bajo `.local/`; no validan el aislamiento de Piston ni permiten ejecutar código de alumnos en Next.

Esta entrega incorpora el contrato compartido de plataforma, incluidos `projects`/`projectSolutions`, `verifyPersistence` y `expectedPersistence`. Antes de activar siguen pendientes: validar referencias y plantillas de los tres runtimes en Piston real, probar la conservación de historial/borradores/progreso en una base preparada y comprobar navegación con el catálogo publicado anterior. No ejecutar proyectos por `functionBatch` ni publicar rutas a actividades aún no publicadas. La activación y publicación no forman parte de las pruebas locales de contenido.

## Verificación editorial local · 26 de octubre de 2026

- `npm run content:audit`: 176 actividades, once reglas conceptuales, cero alertas.
- `npm run lint` y `npm run typecheck`: aprobados. Para tipos se generó Prisma con una URL de prueba no conectable; no se abrió ni modificó ninguna base.
- `npm test`: 287 pruebas aprobadas, sin omisiones. Incluye las fuentes históricas y las referencias/plantillas nuevas en los tres lenguajes, compilación estricta de todos los archivos TS, aislamiento de directorios temporales por caso y ejecución de las pruebas propias de referencia de los proyectos.
- `npm run build`: aprobado con variables de compilación locales ficticias, sin servidor ni base activa. Compilar no comprueba que la plataforma integrada pueda ejecutar o publicar los proyectos.
- No se ejecutaron Piston real, integraciones de base, preparación/activación de catálogo ni E2E: requieren plataforma integrada, entorno preparado y autorización. No se arrancó Next, PostgreSQL, Docker ni WSL.

Las primeras comprobaciones locales detectaron y corrigieron valores de retorno incompatibles en plantillas TS, agrupación indebida de proyectos en tests de un archivo y una indentación del conductor Python de pruebas. La comprobación global de tipos inicialmente falló por faltar el cliente Prisma generado; tras generarlo, aprobó. No quedan fallos de estas comprobaciones en el estado entregado.
