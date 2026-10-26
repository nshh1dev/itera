# Proyectos multarchivo

El soporte usa campos JSON aditivos en `ExerciseVariant`, `Draft`, `Submission` y
`TestCase`. Las filas antiguas conservan `project`, `solutionFiles`, `files` y
`expectedFiles` en `NULL`; el conductor y el guardado de un solo archivo siguen
su camino histórico.

## Contrato y límites

`ProjectDefinition` versión 1 publica un `entrypoint`, archivos planos (incluidos
recursos preparados), un `testEntrypoint` opcional y `previousStep` orientativo.
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

Los archivos presentes que no pertenecen a la instantánea de entrada se recogen
dentro del sandbox. Se limitan a 20 archivos y 32 KiB de texto total; el
conductor emite un marcador estructurado y `judgeProject` compara el valor/salida
y los artefactos en el servidor web. `expectedFiles` es editorial por caso y no
puede colisionar con rutas de entrada. Los casos ocultos no persisten ni devuelven
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

## Límites aún no verificados

- `tests/real-runner.integration.ts` cubre módulos, recursos, reapertura,
  artefactos y aserciones con Piston real cuando está disponible. En el entorno de
  esta entrega Piston no respondió; esas pruebas se omitieron, no se consideran
  aprobadas. No se inició ningún servicio.
- No se aplicó la migración ni se activó contenido; requieren autorización y una
  base preparada.
- No existe un protocolo editorial para declarar varios procesos de alumno como
  pasos; el programa o la función se ejecuta por caso en un entorno limpio. No se
  promete persistencia entre casos o envíos.
- E2E y build no se ejecutaron. La suite unitaria no sustituye la comprobación
  integrada de publicación, UI y runtime real.
