# Proyectos multarchivo

El soporte usa campos JSON aditivos en `ExerciseVariant`, `Draft`, `Submission` y
`TestCase`. Las filas antiguas conservan `project`, `solutionFiles`, `files` y
`expectedFiles` en `NULL`; el conductor y el guardado de un solo archivo siguen
su camino histórico.

Las migraciones aditivas son `20261026120000_project_files` y
`20261026130000_project_persistence`. Generar Prisma o compilar no las aplica.
Antes de usar esta revisión con una base existente hay que respaldarla y aplicar
las migraciones del modo de instalación elegido, sin resetear datos; consultar
[Docker](docker.md) o el flujo nativo del [README](../README.md). La activación
del currículo es otra operación explícita y requiere validar primero con Piston.

## Contrato y límites

`ProjectDefinition` versión 1 publica un `entrypoint`, archivos planos (incluidos
recursos preparados), un `testEntrypoint` opcional y `previousStep` orientativo.
Opcionalmente `verifyPersistence: true` activa una segunda invocación `solve([])`
en un proceso hijo limpio dentro del mismo sandbox y directorio de archivos. Se
admite solo en FUNCTION y para casos cuya entrada oficial sea un array; cada caso
debe definir `expectedPersistence` (incluido JSON null si ese es el resultado).
El juez compara por separado el retorno principal, el retorno del segundo proceso
y los archivos finales. Esta convención es explícita, no se supone para los demás
proyectos; no conserva estado entre casos/envíos.
Los nombres admiten letras ASCII, dígitos, punto, guion y guion bajo; se reservan
`submission.*` y `__itera*`. El máximo es 20 archivos, 64 KiB por archivo y
256 KiB por manifiesto/instantánea. Los archivos `readOnly` se comparan con la
plantilla. `projectSolutions` y `solutionFiles` son privados; solo la acción de
solución autorizada los devuelve.

Una evaluación conserva una instantánea completa en `Submission.files`. FUNCTION
importa `solve(data)` desde `main.*`; PROGRAM ejecuta el archivo completo. El
driver fijo vive en `__itera_runner.*`, y TypeScript compila los módulos dentro de
Piston con `--strict --noEmitOnError` y CommonJS. El código enviado nunca se
compila ni ejecuta en Next.

Los archivos nuevos y los recursos de datos editables cambiados respecto a la
instantánea se recogen dentro del sandbox. Código, recursos `readOnly`, symlinks y
archivos internos quedan fuera. Se limitan a 20 archivos, 32 KiB por archivo y
32 KiB totales tanto en validación editorial como en captura; las entradas de
archivo conservan sus límites independientes de hasta 64 KiB. El
conductor emite un marcador estructurado y `judgeProject` compara el valor/salida
y los artefactos en el servidor web. `expectedFiles` es editorial por caso y no
puede referirse a código ni a recursos de solo lectura; puede describir un recurso
editable existente o un archivo de datos nuevo. Los casos ocultos no persisten ni devuelven
entrada, expectativa, archivos reales, logs o errores.

La acción «Ejecutar mis pruebas» ejecuta solamente el `testEntrypoint` público,
reutiliza el ciclo asíncrono de envíos y distingue aserción, error y timeout. Su
resultado no certifica cobertura ni actualiza progreso. El validador editorial,
la publicación y `content:replace` comprueban por separado las referencias y
plantillas de cada proyecto, sin agruparlos en `functionBatch`.

El editor conserva un archivo por modelo, ofrece navegación compacta y mantiene
los borradores completos con revisión optimista. La recuperación local está
versionada, migra el código antiguo a `entrypoint`, conserva copias incompatibles
sin aplicarlas y permite copiar explícitamente archivos coincidentes de
`previousStep` después de comparar las alternativas.

## Administración y comprobaciones locales

- La administración conserva manifiestos y soluciones privadas por lenguaje como
  JSON, junto a `expectedFiles` y `expectedPersistence` de los casos. Guardar crea
  otra versión, no degrada un proyecto a código de un archivo. El cuerpo editorial
  tiene un máximo de 11 MiB y el transporte de acciones admite 12 MiB con margen
  para la codificación. Las copias locales dependen de la cuota del navegador;
  si falla su escritura, se ofrece descargar los cambios antes de salir.
- Las referencias fijas del repositorio se comprueban localmente contra los
  conductores y el juez, además de verificar archivos y procesos distintos.
  Esta simulación no verifica Piston ni aislamiento. Solo el código fijo de esas
  pruebas puede ejecutarse así; nunca los programas enviados por estudiantes.
- Verificación integrada del 26 de octubre de 2026: `npm test` aprobó 341 pruebas,
  sin fallos ni omisiones; lint sin avisos, typecheck, Prisma validate y build aprobados.
  `content:audit` informó 176 actividades y ninguna alerta automática. Se corrigió
  la simulación TypeScript para que no heredara `@types/node` del repositorio:
  el conductor conserva las declaraciones que necesita dentro de Piston.

## Validación operativa de la ampliación

Con autorización posterior del usuario, se preparó Docker y se verificó una
restauración del respaldo en una base temporal: 22 tablas con los mismos recuentos
y huellas, origen intacto y base temporal eliminada. Se conservaron los respaldos
en `.local/backups/`, fuera de Git. Las dos migraciones aditivas ya se aplicaron a
la base Docker (no a la base nativa).

La preparación real de los 176 borradores aprobó idempotencia y rechazo de una
instantánea obsoleta sin activación parcial. Después de migrar/preparar, los
recuentos y huellas de 15 tablas de estudiantes coincidieron con los anteriores.

Piston real detectó dos incompatibilidades que la simulación local no cubría:
su runtime TypeScript añade extensiones a todos los archivos recibidos y el
presupuesto solicitado de persistencia excedía el máximo configurado. El
adaptador ahora envía solo el conductor TypeScript y materializa los archivos
validados dentro del sandbox antes de compilar estrictamente; el presupuesto
exterior respeta los 12 segundos del ejecutor. Las cuatro regresiones reales
de módulos, artefactos y persistencia aprobaron tras corregirlo.

La plantilla editorial se evalúa por la suite completa: puede acertar un caso
trivial sin resolver todos. Una diferencia de persistencia no se confunde con
un fallo operativo. La suite local posterior aprobó 342 pruebas.

Después se validaron referencias y plantillas de las 176 actividades en los
tres lenguajes dentro de Piston, incluidos módulos, recursos y el segundo proceso
de inventario/agenda. La primera validación se detuvo ante un fallo de
una plantilla TypeScript mientras había compilaciones concurrentes, sin activar
parcialmente el catálogo. La ejecución posterior completa, sin esa carga
concurrente, aprobó y activó atómicamente las cuatro rutas; no se aisló la causa
del fallo inicial. Se comprobaron 176
actividades publicadas, 528 variantes y el orden de cada ruta, conservando los
recuentos y huellas de las 15 tablas de estudiantes tras la activación.

El cierre operativo aprobó las 12 pruebas de `npm run test:runner`, sin
omisiones, y los 43 recorridos de `npm run docker:test:e2e` contra la aplicación
compilada y Piston real. Las pruebas nuevas verifican proyectos completos en los
tres lenguajes y publicación administrativa. Se corrigió una espera de la prueba
que buscaba acciones del editor mientras estaba visible el enunciado móvil;
la repetición completa aprobó sin fallos. También aprobaron las dos pruebas de
zoom real al 200 %, en claro y oscuro, con Chromium y perfiles desechables.
Tras los recorridos, las 15 tablas de estudiantes conservaron los mismos
recuentos y huellas del respaldo inicial. Lint, tipos, build Docker y auditoría
de contenido aprobaron; la auditoría de dependencias de producción no informó
vulnerabilidades. Los avisos conocidos de Better Auth en pruebas y el aviso de
actualización de npm no implicaron cambios de dependencias.

## Alcance y límites

- `tests/real-runner.integration.ts` cubre módulos, recursos, reapertura,
  artefactos, aserciones y el segundo proceso de persistencia con Piston real.
  Las omisiones de la entrega inicial no cuentan como aprobaciones; la
  validación operativa posterior debe distinguirse de aquella simulación.
- `tests/real/projects.spec.ts` comprueba el editor multarchivo, guardado y
  recarga, recursos protegidos, pruebas propias sin progreso, evaluación oficial
  de persistencia en los tres lenguajes, copias entre pestañas y conservación de
  campos privados al guardar/publicar desde administración. Crea cuentas y
  contenido temporales y los elimina al finalizar cada prueba. En Docker se
  ejecuta con `npm run docker:test:e2e -- tests/real/projects.spec.ts` sobre la
  aplicación ya iniciada; no usar la base nativa como sustitución implícita.
- La base nativa y la base Docker son independientes. Aplicar cambios a Docker
  no actualiza la base nativa; no ejecutar reset ni duplicar la activación sin
  elegir explícitamente el modo que se pretende usar.
- `verifyPersistence` cubre solo la convención declarada de dos llamadas FUNCTION
  `solve(entrada)` y `solve([])` dentro de un mismo caso. No modela pipelines
  generales ni promete persistencia entre casos o envíos.
- Estas comprobaciones corresponden a la instalación Docker local y sus runtimes
  fijados; no certifican otros despliegues ni sustituyen una revisión pedagógica.
