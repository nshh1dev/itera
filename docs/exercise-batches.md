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

El catálogo quedó en 63 ejercicios y 361 casos editoriales por lenguaje, sin añadir entonces los otros 57 ni reclasificar niveles. La ampliación posterior se describe en la sección siguiente.

## Currículo completo: de 63 a 120 actividades

Entrega de ampliación (`prisma/beginner-expansion.ts`, `prisma/intermediate-expansion.ts` y `prisma/advanced-expansion.ts`), compuesta con el ayudante `prisma/educational-exercise.ts`. Añade 57 identidades nuevas —8 principiantes, 19 intermedios y 30 avanzados— y reclasifica once existentes sin cambiar identificadores, slugs, progreso, envíos ni borradores:

- Ocho intermedios pasan a principiantes: `repite-con-while`, `recorre-por-indices`, `maximo-de-una-lista`, `primer-valor-o-ausencia`, `quita-los-espacios`, `filtra-letras-y-digitos`, `compara-dos-textos` y `reduce-vueltas-completas`.
- Tres avanzados altos pasan a intermedios: `ventana-sin-repeticiones`, `unir-intervalos` y `suma-maxima`.

Recuento resultante: 45 principiantes (8 de Desde cero + 37 de Construye tus bases), 40 intermedios en Conecta las ideas y 35 avanzados en Ve un paso más allá; 120 ejercicios y 648 casos editoriales por lenguaje. Las reclasificaciones se aplican en `prisma/content.ts` mediante `levelOverrides`; los órdenes viven en `src/lib/learning-paths.ts` y la ruta avanzada pasa a tener secuencia explícita.

Cada actividad nueva incluye enunciado, objetivos de práctica, prerrequisitos, dos ejemplos explicados, tres pistas progresivas, referencia y plantilla en ambos lenguajes, explicación por lenguaje con razonamiento, pasos, coste y errores comunes, y entre cinco y ocho casos con al menos una explicación. Las respuestas esperadas se escribieron a mano; las pruebas del repositorio ejecutan la referencia y comparan por valor, nunca por coincidencia del código.

Los metadatos de las nuevas actividades viven junto a su definición y `prisma/learning-metadata.ts` los incorpora, de modo que el mapa sigue cubriendo todo el catálogo. En la base local, `npm run db:seed` inserta las 57 identidades nuevas como versiones publicadas y `npm run content:paths -- --apply` reescribe la pertenencia a las cuatro rutas.

Las versiones publicadas anteriores a la ampliación quedaron con la guía de aprendizaje vacía porque el seed omite los slugs existentes. `npm run content:metadata -- --apply` completa en la versión publicada más reciente **solo** los campos editoriales ausentes —objetivo, conocimientos previos, objetivos de práctica y enlaces a ejercicios previos— tomados del catálogo, sin sobrescribir valores ya presentes. Es idempotente y no toca enunciados, pistas, referencias, pruebas, borradores, envíos ni progreso. En la base local completó 45 versiones.

Las once identidades reclasificadas conservan en la base local su nivel publicado anterior (37/45/38) porque cambiarlo exige una nueva versión publicada, y la publicación valida referencias en Piston. El origen y las rutas ya reflejan 45/40/35. Cuando el sandbox vuelva a estar disponible, cada identidad afectada debe prepararse y publicarse desde administración.

Procedimientos y límites de verificación: [verification.md](verification.md).

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

Procedimientos y límites de verificación: [verification.md](verification.md).

## Revisión editorial pendiente

R1 revisó doce identidades y esta ampliación aportó 57 actividades nuevas, pero quedan **51 ejercicios previos sin revisión pedagógica completa**: conservan enunciado y pruebas originales. La revisión por lotes (R2–R6) debe completarse antes de dar por cerrado el currículo; no se presentan como terminados. Las referencias nuevas tampoco se han validado aún en Piston real.
