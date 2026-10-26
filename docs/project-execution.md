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

## Límites aún no verificados

- `tests/real-runner.integration.ts` cubre módulos, recursos, reapertura,
  artefactos, aserciones y el segundo proceso de persistencia con Piston real cuando está disponible. En el entorno de
  esta entrega Piston no respondió; esas pruebas se omitieron, no se consideran
  aprobadas. No se inició ningún servicio.
- No se aplicaron las migraciones ni se activó contenido; requieren autorización y una
  base preparada.
- `verifyPersistence` cubre solo la convención declarada de dos llamadas FUNCTION
  `solve(entrada)` y `solve([])` dentro de un mismo caso. No modela pipelines
  generales ni promete persistencia entre casos o envíos.
- E2E no se ejecutó por la restricción de no iniciar servicios. La suite unitaria no sustituye la comprobación
  integrada de publicación, UI y runtime real.
