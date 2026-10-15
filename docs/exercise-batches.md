# Revisión de ejercicios por lotes

## R1: primer contacto y primeras decisiones

Implementado en `prisma/initial-batch.ts`. Conserva las doce identidades y sus contratos:

1. `tu-primer-resultado` — observación, sin edición.
2. `cambia-un-numero` — literal numérico frente a texto.
3. `devuelve-la-entrada` — entrada variable.
4. `suma-uno` — expresión de suma.
5. `el-doble` — resolución con multiplicación.
6. `guarda-un-resultado` — asignación y uso de una variable.
7. `lee-un-dato-con-nombre` — acceso a una propiedad.
8. `suma-de-dos-numeros` — integración de acceso y suma.
9. `compara-con-cero` — comparación y booleanos.
10. `elige-con-una-condicion` — bloque condicional y retorno anticipado.
11. `compara-igualdad` — asignación frente a igualdad.
12. `tres-caminos` — selección entre varios casos.

Cada revisión incluye entrada/salida explícitas, objetivos concretos, conocimientos previos y enlaces, dos ejemplos explicados, tres pistas sin instrucciones de solución completas, restricciones y explicación independiente por lenguaje con razonamiento, pasos, coste y errores comunes. Las referencias y plantillas conservan `solve(data)`; solo la observación empieza resuelta. R1 tiene 74 casos compartidos entre Python y JavaScript.

El catálogo sigue teniendo 63 ejercicios, ahora con 361 casos editoriales por lenguaje. No se han añadido los otros 57 ejercicios del plan ni se han reclasificado niveles en esta entrega.

## Compatibilidad y puesta en uso

La migración `20261015000000_educational_content` añade objetivos de práctica, referencias de prerrequisitos y tipo de actividad a cada versión, y una explicación opcional a cada caso. No atribuye contenido nuevo a versiones históricas. Antes de iniciar una copia actualizada:

```powershell
npm run db:migrate
npx prisma generate
```

En una instalación existente, repetir el seed **no actualiza** estos ejercicios. Desde una cuenta administradora, para cada identidad del lote:

1. Abrir su ficha en `/admin/ejercicios/<slug>`.
2. Elegir **Preparar revisión didáctica → Crear borrador didáctico**.
3. Revisar el borrador. La importación es idempotente y no sobrepasa un borrador manual distinto.
4. Con Piston y ambos lenguajes disponibles, elegir **Validar y publicar versión guardada**.

La publicación comprueba objetivos de práctica, tres pistas y referencias a ejercicios anteriores publicados; ejecuta ambas referencias y plantillas dentro de Piston. Las plantillas deben devolver JSON sin fallar y no resolver todos los casos, salvo las de observación, que deben estar completas. Los resultados se comparan por su JSON, nunca por coincidencia del código con la referencia. Distintas implementaciones correctas siguen siendo aceptadas.

No se cambian IDs, progreso, envíos ni borradores de estudiantes. Las variantes históricas permanecen; no se transfiere automáticamente código de un estudiante a una plantilla nueva. Las explicaciones de casos ocultos tampoco se seleccionan para el cliente.

## Estado local y límite de la entrega

La migración aditiva está aplicada. Las doce revisiones están disponibles para importar desde administración, **no publicadas automáticamente**. Docker y Piston no estaban disponibles: no se debe confundir la verificación de referencias fijas del repositorio o el doble HTTP E2E con validación real del sandbox. Los mensajes históricos de metadatos ausentes seguirán en las versiones públicas antiguas hasta publicar sus revisiones.

Verificaciones y resultados: [verification.md](verification.md#lote-r1-contenido-educativo-inicial).

## Siguiente lote

R2 corregirá otros doce ejercicios existentes de decisiones, listas y recorridos. Después se completará la revisión del resto del catálogo; solo entonces se añadirán los conceptos ausentes en lotes pequeños. El objetivo de 120 actividades es curricular y revisable, no una cuota de ejercicios para generar de una vez.
