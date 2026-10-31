# Tiempos orientativos del recorrido Python

## Criterio y alcance

Revisión editorial de las **224 actividades**: **54 ajustes** y **170 valores
conservados**. Se contrasta el inventario por actividad con las decisiones de
[auditoría](auditoria-python.md), los enunciados y las plantillas actuales.
No se deducen minutos del tamaño de los casos ni del tiempo de ejecución.

La estimación contempla leer el reto y sus ayudas iniciales, resolverlo y
comprobar ejemplos y fronteras razonables. Supone los conceptos previos del
recorrido, pero no una solución ya conocida. No incluye instalar Itera ni
preparar servicios; no exige consultar la solución. Cada persona puede necesitar
más o menos tiempo: no es una cuenta atrás, requisito de acceso, nota ni promesa
de dominio. No se dispone de una medición con estudiantes que calibre estos
valores; una validación posterior puede refinarlos.

- Una operación o una reparación mínima guiada suele conservar 5–10 minutos.
- Un recorrido, una combinación de reglas o seguimiento de alias requiere
  distinguir más estados y fronteras; no se equipara a consultar un valor.
- Una integración añade comprobaciones de varias reglas, aunque su referencia
  sea corta. No se asigna tiempo automáticamente por nivel o por líneas de código.
- Los proyectos distinguen navegar un módulo ya preparado de implementar reglas,
  escribir/reabrir archivos, conectar almacenamiento y conservar pruebas.
- Los hitos posteriores tienen presupuesto propio: no se supone una copia
  automática del anterior. El recurso inicial y el contrato se revisan de nuevo.
- Generación de alternativas, programación dinámica y grafos requieren tiempo
  para plantear el estado y revisar fronteras, no solo ejecutar la referencia.

## Balance de las 224 decisiones

| Nivel | Revisadas | Ajustadas | Conservadas | Intervalo final, minutos |
| --- | ---: | ---: | ---: | ---: |
| Iniciación | 32 | 7 | 25 | 5–12 |
| Principiante | 74 | 11 | 63 | 10–35 |
| Intermedio | 82 | 27 | 55 | 10–50 |
| Avanzado | 36 | 9 | 27 | 25–45 |

Los 170 valores conservados no se normalizan solo para obtener múltiplos de
cinco ni para imponer crecimiento continuo. En iniciación permanecen los pasos
breves de impresión, variables y operaciones; en principiante, los recorridos y
prácticas acotadas con presupuestos ya diferenciados. En intermedio se conservan
las operaciones aisladas de colecciones, prácticas de copia y varios algoritmos
con tiempo suficiente; en avanzado, recorridos, selección y optimización ya
presupuestados entre 25 y 45 minutos. La ausencia en el mapa de ajustes significa
conservar el tiempo del catálogo previo, no aplicar una fórmula nueva.

## Ajustes individuales

`prisma/python-timing.ts` conserva identidad, valor previo, valor nuevo y motivo
de cada revisión. Esta tabla resume los cambios; los motivos concretos de
resolución y comprobación están junto a cada identidad en ese archivo.

| Actividad | Antes → ahora, minutos |
| --- | ---: |
| `logica-intercambia` | 5 → 10 |
| `logica-lee-suma` | 5 → 10 |
| `logica-predice-valores` | 15 → 10 |
| `logica-tabla-valores` | 15 → 12 |
| `logica-perimetro` | 5 → 8 |
| `logica-repara-presupuesto` | 5 → 10 |
| `logica-merienda` | 5 → 12 |
| `logica-tarifa` | 10 → 15 |
| `logica-palabras` | 10 → 15 |
| `python-identidad` | 10 → 15 |
| `python-opcional-seguro` | 10 → 15 |
| `python-recorre-pares` | 10 → 15 |
| `logica-pruebas-limites` | 15 → 20 |
| `logica-conserva-regresion` | 15 → 20 |
| `logica-carrito` | 10 → 20 |
| `logica-notas` | 10 → 20 |
| `logica-saldo` | 10 → 20 |
| `logica-gastos-validacion` | 25 → 35 |
| `python-iterador` | 10 → 15 |
| `python-filter` | 10 → 15 |
| `python-lambda-desempate` | 10 → 15 |
| `python-consulta-anidada` | 10 → 15 |
| `logica-importa-preparado` | 25 → 15 |
| `logica-extrae-modulo` | 25 → 20 |
| `logica-repara-importacion` | 25 → 15 |
| `logica-lee-archivo` | 25 → 20 |
| `logica-valida-json` | 25 → 30 |
| `logica-recupera-archivo-invalido` | 25 → 30 |
| `logica-actualiza-persistidos` | 25 → 30 |
| `logica-inventario-modular` | 25 → 35 |
| `logica-inventario-persistente` | 25 → 45 |
| `python-academia-resume` | 20 → 30 |
| `python-contactos-edita` | 20 → 25 |
| `python-contactos-busca` | 20 → 30 |
| `logica-agenda-operaciones` | 25 → 35 |
| `logica-agenda-almacenamiento` | 25 → 45 |
| `logica-agenda-regresion` | 25 → 50 |
| `python-transforma-registros` | 20 → 30 |
| `logica-insercion-posicion` | 15 → 20 |
| `logica-intervalos-suma` | 15 → 20 |
| `logica-vecinos` | 15 → 25 |
| `logica-delimitadores` | 20 → 25 |
| `logica-deshacer` | 15 → 25 |
| `logica-busqueda-recursiva` | 15 → 25 |
| `logica-segundo-maximo` | 15 → 25 |
| `logica-ancestro` | 25 → 35 |
| `logica-monticulo-extrae` | 25 → 35 |
| `logica-combina-archivos` | 25 → 30 |
| `logica-combinaciones` | 25 → 35 |
| `logica-reinas` | 25 → 45 |
| `logica-caminos-obstaculos` | 25 → 35 |
| `logica-ciclo-dirigido` | 25 → 40 |
| `logica-subsecuencia-creciente` | 35 → 40 |
| `logica-planifica-tareas` | 25 → 45 |

Los otros cinco proyectos conservan su estimación: gastos-registro,
separa-reglas-io, organiza-modulos, escribe-archivo y guarda-recupera mantienen
25 minutos. Son 18 proyectos en total: los tres con segunda llamada en proceso
nuevo disponen de al menos 45 minutos, y cada hito con `previousStep` tiene más
tiempo que el anterior por sus responsabilidades añadidas.

## Conservación y publicación

Los ajustes se aplican solo al catálogo Python después de componer sus textos;
no modifican los valores compartidos de JavaScript/TypeScript ni los valores
base por unidad empleados al preparar las lecciones exclusivas. El dato final
de cada versión es `content.minutes`, no una estimación calculada en la interfaz.

Una huella tomada antes de editar excluye únicamente `minutes` de las 54
identidades enumeradas. Conserva los otros 170 tiempos y todos los textos,
variantes, contratos, archivos, casos, identidades, categorías, niveles y orden.
Las pruebas verifican la procedencia de los valores previos y las diferencias
de carga entre proyectos. Las huellas editoriales anteriores usan una copia con
los minutos previos para seguir comprobando sus lotes históricos; no cambian sus
valores esperados ni se altera el catálogo para ejecutar esa comprobación.

La nueva huella de publicación se añade al historial. Esta revisión no prepara
borradores, no activa contenido ni modifica progreso. Para que sus minutos
aparezcan en una base existente se requiere la preparación/activación explícita
de Python, con respaldo y validación real previos. Las pruebas estructurales no
demuestran que cada estudiante termine dentro de la estimación.
