# Currículo común de lógica de programación

## Alcance

El currículo enseña programación y resolución de problemas, no desarrollo web, frameworks ni todas las bibliotecas de cada lenguaje. Se puede elegir Python, JavaScript o TypeScript desde el inicio; TypeScript no exige haber estudiado JavaScript.

`src/lib/curriculum-v2.ts` compone 176 ejercicios en 36 bloques, con títulos, orden, teoría breve, ejemplos por lenguaje y criterios de salida. Los once bloques añadidos se definen en `src/lib/fundamentals-curriculum.ts`. `learning-modules.ts` y `learning-paths.ts` derivan las cuatro secuencias. Cambiar de lenguaje conserva el reto y su posición. Cada identidad tiene tres variantes con los mismos casos de entrada y salida; el progreso sigue separado por persona, ejercicio y lenguaje. La ampliación conserva los 136 slugs anteriores y añade 40 identidades; no sustituye un ejercicio completado por un contrato más exigente.

## Etapas y competencias de salida

| Nivel y ruta | Ejercicios | Al terminar |
| --- | --- | --- |
| Iniciación · Desde cero | 30: instrucciones, variables, operaciones, entrada, tipos, funciones, seguimiento e integración. | Escribir un programa pequeño, predecir sus estados y distinguir imprimir de devolver. |
| Principiante · Construye tus bases | 57: decisiones, repetición, listas, textos, funciones y registros, alcance, referencias, validación, pruebas e integración con gastos. | Comprender estado local, efectos y copias; recuperar errores y construir un gestor pequeño con pruebas. |
| Intermedio · Conecta las ideas | 53: conjuntos y mapas, módulos, archivos, inventario persistente, búsqueda, recorridos, matrices y copias anidadas, pilas/colas/recursión, integración y agenda. | Organizar programas en archivos, conservar datos dentro de la ejecución, comprobar integraciones y justificar corrección y costes. |
| Avanzado · Ve un paso más allá | 36: árboles, prioridades y estrategias voraces, exploración, programación dinámica, grafos e integración. | Modelar estados y conexiones, comparar alternativas y defender una estrategia con argumentos y contraejemplos. |

La progresión es entender → completar → resolver → integrar. Las plantillas nuevas se ejecutan sin errores, producen resultados JSON en modo función y no resuelven todos sus casos. Un fallo lógico puede coincidir con algún caso: no se exige que una plantilla falle todos. La actividad del bucle utiliza un avance incorrecto que termina, no una plantilla infinita.

Los cierres son `logica-merienda`, `logica-gastos-validacion`, `logica-agenda-regresion` y `logica-planifica-tareas`. `logica-saldo` y `logica-inventario` se conservan como integraciones anteriores a los proyectos. Todas las etapas tienen acceso libre. Las casillas «Estás preparado para continuar si puedes…» son una autoevaluación no persistida: no certifican dominio, no actualizan progreso y no bloquean el siguiente nivel. Avanzado describe el dominio de lógica y algoritmos dentro del recorrido, no una certificación profesional.

El mapa completo de las 40 actividades, sus contratos y dependencias se documenta en [Fundamentos y miniproyectos](fundamentos.md). Las fuentes editoriales nuevas son `prisma/fundamentals-lessons.ts` (22 funciones de un archivo) y `prisma/fundamentals-project-lessons.ts` (18 proyectos: cinco de módulos, seis de archivos y siete hitos). Las soluciones multarchivo viven en `projectSolutions`, nunca dentro del manifiesto público `projects`.

## Revisión y conservación del catálogo

- Guardado, preparación/activación del catálogo y publicación comparten las reglas
  de `editorial-tests.ts`: de uno a diez casos, algún ejemplo visible y, con entrada,
  al menos tres entradas distintas y alguna prueba oculta. En JSON, el orden de
  propiedades no distingue entradas; los tipos y el orden de los arreglos sí.
  Una misma entrada no admite resultados contradictorios. Los programas sin entrada
  (`PROGRAM` con todos los `input` vacíos) no necesitan tres casos ni casos ocultos.
  Se conservan duplicados históricos compatibles, pero no cuentan como diversidad.
  Las salidas de texto usan la equivalencia del juez (finales de línea y espacios
  finales); no se modifican casos, versiones ni envíos guardados. La publicación
  revisa las tres variantes antes de consultar runtimes o ejecutar referencias.
- Las identidades nuevas usan el prefijo `logica-`. No heredan completados, borradores ni intentos de las anteriores. Los registros históricos se conservan vinculados a sus variantes originales.
- Al ampliar un catálogo ya activo, los 136 slugs actuales mantienen su identidad y completados. `logica-variable-local` cambia de bloque, no de contrato ni slug. Los 40 nuevos empiezan pendientes: el porcentaje puede bajar al aumentar el denominador, sin perder ningún completado. No atribuir las habilidades nuevas a un progreso anterior.
- `prisma/logic-lessons.ts` contiene los contratos nuevos; `logic-content.ts` compone el catálogo. Cuando el objetivo y el contrato coinciden se reutilizan referencias algorítmicas ya verificadas del catálogo histórico; se asignan nuevas identidades, títulos, nivel y prerrequisitos. No se afirma que todos los algoritmos sean nuevos.
- La teoría tiene ejemplos adaptados a los tres lenguajes. Los contratos comunes se mantienen y las particularidades sintácticas se explican por variante. TypeScript tiene firmas explícitas comprobadas en modo estricto.
- Las pruebas verifican valores y tipos. Once prácticas guiadas sin entrada añaden una regla conceptual versionada: imprimir una respuesta fija no basta para acreditar una resta o el uso de una variable. El análisis AST se realiza en Piston y admite solo las construcciones iniciales documentadas. En desafíos independientes se aceptan implementaciones equivalentes; no se certifica una complejidad concreta. Detalles y límites en [validación educativa](educational-validation.md).
- La sustitución retira del catálogo activo solo las identidades editoriales históricas conocidas. No elimina ejercicios, versiones, borradores, envíos ni progreso, ni retira contenido personalizado. Progreso muestra el conteo anterior y los últimos 20 borradores y 20 intentos archivados propios, de todos los lenguajes. No entrega datos de otras personas ni casos ocultos.

## TypeScript

Las referencias comparten el algoritmo con JavaScript, pero tienen contratos editoriales explícitos: los del catálogo nuevo viven en `prisma/logic-lessons.ts` y los históricos en `prisma/typescript-content.ts`. Incluyen tipos de entrada y salida, anotaciones locales, estructuras recursivas y comprobaciones de ausencia. No se infieren contratos desde los tests ni se utiliza `any`, `@ts-ignore` o `@ts-nocheck` en las referencias o plantillas.

La ruta inicial presenta inferencia y anotaciones simples; las funciones introducen firmas y propiedades; las bases añaden uniones y opcionales; las colecciones utilizan `Record` y parámetros de tipos de `Map` y `Set`. Los tipos acompañan la lógica sin crear un itinerario distinto ni exigir estudiar JavaScript primero.

### Ejecución

1. `runner:setup` instala el paquete nativo `typescript` de Piston además de los otros runtimes.
2. Piston compila un conductor fijo. El código enviado está codificado como literal JSON, no interpolado como instrucciones del conductor.
3. Dentro del sandbox, el conductor escribe `submission.ts` y ejecuta `tsc --strict --noEmitOnError --target ES2022 --module commonjs`.
4. En modo función añade el `typeContract` de la variante. Si falla la compilación, devuelve los diagnósticos y no ejecuta el archivo emitido.
5. Solo después se ejecuta el JavaScript resultante con Node dentro del mismo sandbox y se aplica el juez correspondiente.

El presupuesto exterior del conductor es de 12 segundos (10 de CPU); la compilación estricta tiene un plazo de 8 segundos y el programa del alumno conserva un plazo de 3 segundos. `compose.yaml` debe permitir el presupuesto exterior: después de actualizar la configuración, ejecutar `docker compose up -d piston` para recrear solo el ejecutor y conservar su volumen de paquetes. Un contenedor anterior con máximo de 3 segundos rechaza la solicitud antes de compilar.

Si el hijo alcanza su plazo, el conductor termina con el código reservado 124. El adaptador convierte ese resultado (`RE` en Piston) en `TO`, igual que un timeout nativo. Una salida correcta seguida de un bucle infinito no aprueba. Los demás errores, señales y fallos internos conservan su clasificación.

No se ejecuta ni compila código enviado en Next.js. La suite editorial sí compila y ejecuta referencias fijas del repositorio para comprobar su contenido; no forma parte del servidor. Los diagnósticos y salidas de casos ocultos siguen filtrados por el juez.

Monaco usa diagnósticos estrictos locales. La declaración de `require('fs').readFileSync` describe exclusivamente la lectura preparada en las plantillas, no es una dependencia del navegador ni una promesa de acceso al sistema de archivos de la aplicación.

## Actualizar una instalación existente

Con PostgreSQL preparado, sin necesidad de iniciar Next:

```sh
npm run db:migrate
npx prisma generate
npm run db:seed
npm run content:replace
```

`db:seed` equivale a preparar borradores: no publica ni modifica las rutas activas. `content:replace` sin argumentos es una vista previa sin escrituras; `-- --prepare` también prepara el catálogo de forma idempotente. Un borrador distinto impide importar el lote y se conserva. No hacen falta Next ni Piston para preparar el contenido.

Después, con Docker/Piston y sus tres runtimes preparados:

En el **modo Docker completo**, ejecuta primero `docker-iniciar` y usa `node scripts/docker.mjs exec -T app npm run content:replace -- --apply` para actuar sobre la base Docker. Al terminar puedes usar `docker-apagar`. La preparación de una instalación nueva está en [Docker completo](docker.md). Los comandos siguientes corresponden al modo nativo y actúan sobre su propia base; no mezclar ambos modos.

```sh
docker compose up -d
npm run runner:setup
npm run content:replace -- --apply
```

La activación ejecuta las referencias y plantillas de los tres lenguajes contra todos sus casos en Piston, sin usar el doble HTTP. Solo si todo funciona relee las revisiones y sustituye las cuatro rutas en una transacción serializable. Si falta el ejecutor, falla un caso o cambia una revisión, conserva el catálogo activo. Las escrituras nuevas se limitan a borradores preparados antes de una validación fallida. No se inicia Next automáticamente.

Las revisiones posteriores se preparan con `content:revisions -- --apply` y se validan desde administración. `content:paths` sigue actualizando únicamente la navegación de ejercicios ya publicados. Las fuentes históricas y sus pruebas editoriales siguen en el repositorio para verificar los envíos anteriores.

Los tres hitos `inventario-persistente`, `agenda-almacenamiento` y `agenda-regresion` activan `verifyPersistence` en los tres lenguajes y declaran once expectativas independientes `expectedPersistence`. Cada caso llama primero a `solve(input)` y después a `solve([])` en otro proceso sobre el mismo directorio: inventario conserva el stock con cero rechazos nuevos; agenda conserva las tareas finales. `cargar()` prefiere `guardado.json` y solo recurre al recurso inicial de solo lectura cuando aún no existe la instantánea. Los archivos esperados deben seguir intactos después de ambas llamadas. No hay persistencia entre casos ni envíos. Contrato compartido: [ejecución de proyectos](project-execution.md).

Pruebas focalizadas: `npx tsx --test tests/logic-content.test.ts tests/fundamentals-content.test.ts tests/learning-revisions.test.ts` (contenido, conservación de slugs, referencias y plantillas locales, compilación estricta de todos los módulos, archivos reales aislados por caso y 33 pares de procesos nuevos para persistencia). Solo ejecutan referencias fijas del repositorio: no prueban Piston ni su aislamiento. `npx tsx --test tests/logic-install.integration.ts` comprueba preparación en la base configurada, idempotencia y conservación de datos; prepara borradores reales sin publicar y requiere autorización. Las suites de navegador requieren el catálogo activado y permiso para arrancar la aplicación. Las limitaciones de validación y activación están en [Fundamentos](fundamentos.md); las verificaciones previas a esta ampliación están en [verification.md](verification.md).
