# Currículo común de lógica de programación

## Alcance

El currículo enseña programación y resolución de problemas, no desarrollo web, frameworks ni todas las bibliotecas de cada lenguaje. Se puede elegir Python, JavaScript o TypeScript desde el inicio; TypeScript no exige haber estudiado JavaScript.

`src/lib/curriculum-v2.ts` define los 136 ejercicios, sus títulos, orden, 25 bloques, teoría breve, ejemplos por lenguaje y criterios de salida. `learning-modules.ts` y `learning-paths.ts` derivan las cuatro secuencias. Cambiar de lenguaje conserva el reto y su posición. Cada identidad tiene tres variantes con los mismos casos de entrada y salida; el progreso sigue separado por persona, ejercicio y lenguaje.

## Etapas y competencias de salida

| Nivel y ruta | Ejercicios | Al terminar |
| --- | --- | --- |
| Iniciación · Desde cero | 28: instrucciones, variables, operaciones, entrada, tipos y comparaciones, funciones e integración. | Escribir un programa pequeño, explicar su orden, usar datos variables y distinguir imprimir de devolver. |
| Principiante · Construye tus bases | 36: decisiones, repetición, listas, textos, funciones y registros, integración. | Combinar condiciones, bucles y funciones sin una receta, tratar ausencias y proponer casos límite. |
| Intermedio · Conecta las ideas | 36: conjuntos y mapas, búsqueda y orden, recorridos eficientes, matrices, pilas/colas/recursión e integración. | Elegir estructuras, evitar trabajo repetido y justificar corrección y costes básicos. |
| Avanzado · Ve un paso más allá | 36: árboles, prioridades y estrategias voraces, exploración, programación dinámica, grafos e integración. | Modelar estados y conexiones, comparar alternativas y defender una estrategia con argumentos y contraejemplos. |

La progresión es entender → completar → resolver → integrar. Las plantillas nuevas se ejecutan sin errores, producen resultados JSON en modo función y no resuelven todos sus casos. Un fallo lógico puede coincidir con algún caso: no se exige que una plantilla falle todos. La actividad del bucle utiliza un avance incorrecto que termina, no una plantilla infinita.

Los cierres son `logica-merienda`, `logica-saldo`, `logica-inventario` y `logica-planifica-tareas`. Todas las etapas tienen acceso libre. Las casillas «Estás preparado para continuar si puedes…» son una autoevaluación no persistida: no certifican dominio, no actualizan progreso y no bloquean el siguiente nivel. Avanzado describe el dominio de lógica y algoritmos dentro del recorrido, no una certificación profesional.

## Revisión y conservación del catálogo

- Las identidades nuevas usan el prefijo `logica-`. No heredan completados, borradores ni intentos de las anteriores. Los registros históricos se conservan vinculados a sus variantes originales.
- `prisma/logic-lessons.ts` contiene los contratos nuevos; `logic-content.ts` compone el catálogo. Cuando el objetivo y el contrato coinciden se reutilizan referencias algorítmicas ya verificadas del catálogo histórico; se asignan nuevas identidades, títulos, nivel y prerrequisitos. No se afirma que todos los algoritmos sean nuevos.
- La teoría tiene ejemplos adaptados a los tres lenguajes. Los contratos comunes se mantienen y las particularidades sintácticas se explican por variante. TypeScript tiene firmas explícitas comprobadas en modo estricto.
- Las pruebas verifican valores y tipos; no demuestran que se haya empleado una técnica concreta ni una complejidad determinada. En actividades de salida fija se declara que imprimir directamente la respuesta puede coincidir con el resultado, aunque didácticamente se pida practicar un cálculo.
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

Pruebas focalizadas: `npx tsx --test tests/logic-content.test.ts` (contenido y referencias locales) y `npx tsx --test tests/logic-install.integration.ts` (preparación en la base configurada, idempotencia y conservación de datos). Esta última prepara borradores reales sin publicar. Las suites de navegador requieren el catálogo activado y permiso para arrancar la aplicación. Las limitaciones de la entrega están en [verification.md](verification.md).
