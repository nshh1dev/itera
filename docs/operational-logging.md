# Registro seguro de fallos operativos

`src/server/operational-failure.ts` escribe una línea JSON en la consola del
servidor (`stderr`), sin servicios externos, archivos nuevos ni cambios de esquema.
En nativo se consulta la terminal de Next; con Docker ya iniciado, desde la raíz:

```sh
node scripts/docker.mjs logs --tail 100 app
```

## Campos y alcance

- `event`: siempre `itera.operational_failure`.
- `id`: UUID nuevo para identificar ese registro; no contiene datos de la cuenta.
- `phase`: valor enumerado de la operación fallida.
- `submissionId`: opcional en evaluación, solo si tiene formato UUID/CUID. Permite
  localizar el intento en mantenimiento autorizado; no incorpora su contenido.

Fases de borrador/edición: `draft.save`, `editorial.save`, `editorial.publish` y
`editorial.prepare`. Solo se registran excepciones operativas atrapadas; conflictos,
validaciones y resultados incorrectos del alumno no son fallos de infraestructura.

Fases de evaluación: `execution.load`, `execution.state`, `execution.runtime`,
`execution.case`, `execution.concept`, `execution.finalize`, `execution.error.persist`
y `execution.reconcile`. No se registra el número del caso ni si era visible.
La lectura inicial, la reconciliación o la persistencia fallidas siguen propagando
su excepción como antes; el registro no las convierte en operaciones aprobadas.

## Confidencialidad y límites

El helper no recibe el objeto de error ni acepta contexto arbitrario. No imprime
mensajes, stacks, causas, SQL, URLs, correos, cookies, tokens, código, entradas,
resultados esperados/reales o stderr del programa. Tampoco convierte objetos a
texto al validar una referencia. Si el destino de logs falla, no altera el resultado
de guardado o evaluación.

No es una auditoría exhaustiva de todos los logs de Next, Prisma, Better Auth o
Docker: estos pueden emitir sus propios avisos. No adjuntar logs completos sin
revisarlos. Los identificadores tampoco deben publicarse junto a datos personales.
No hay rotación ni retención propias; se aplica la configuración de la consola o
del motor Docker. Estos eventos no se devuelven al navegador ni cambian las reglas
de progreso, los mensajes al alumno o el reintento de borradores.
