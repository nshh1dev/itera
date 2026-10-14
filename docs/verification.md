# Verificación local

## Cobertura automatizada

- 30 pruebas de dominio, contenido, revisión editorial, metadatos de aprendizaje y herramientas locales.
- Las 53 referencias de Python y las 53 de JavaScript pasan los mismos 272 casos por lenguaje. Las plantillas guiadas también se ejecutan con todos sus ejemplos en ambos lenguajes. Solo la actividad inicial de observación debe venir completamente resuelta. En las actividades de colecciones y textos se comprueba además que el cambio indicado en el enunciado coincide con la referencia.
- 24 recorridos de navegador con Chromium: catálogo, registro, preferencias, borradores, evaluación, ayudas, responsive, conflictos entre pestañas, recuperación de contraseña, aislamiento entre cuentas, administración y rutas. Incluyen comprobación del orden completo de fundamentos y de Conecta las ideas, conservación de ruta al cambiar lenguaje o iniciar sesión, plantillas de colecciones y textos en ambos lenguajes y ausencia de salto al catálogo al terminar Desde cero.
- La importación editorial se comprueba sin publicar: mantiene intacta la versión anterior, no altera lo que sirve el catálogo público, no llama al ejecutor, no duplica una revisión idéntica y se detiene ante un borrador manual distinto. Las pruebas eliminan solo los borradores que ellas mismas crean.
- Los metadatos se validan para todo el catálogo; se prueban límites, duplicados, mensajes históricos y escape de HTML. El recorrido administrativo comprueba persistencia, normalización, visualización en ambos lenguajes y que un objetivo en borrador no cambie la versión pública ni la anterior.
- El editor se sirve sin CDN y cambia de tema junto con el resto de la interfaz.
- El flujo de evaluación verifica idempotencia, progreso separado por lenguaje y ausencia de entradas, salidas y errores de pruebas ocultas en la respuesta pública.
- Se comprobó el ciclo de parada y arranque del clúster PostgreSQL del proyecto.

## Sandbox real

Revisión del 14 de octubre de 2026 tras preparar las versiones didácticas de los retos originales: lint, TypeScript, 20 pruebas unitarias/editoriales, build y los 15 recorridos E2E con doble HTTP aprobados, tanto con `next dev` como con `next start`. Desde cero conserva 8 pasos y Construye tus bases tiene 21. Las revisiones están disponibles para importar desde administración; no se han publicado automáticamente en la base local. Piston no estaba disponible: no se verificó la ejecución real del nuevo contenido.

Se corrigió una doble navegación/refresco al guardar versiones administrativas: cancelaba la respuesta que `revalidatePath` ya estaba actualizando y producía un error de streaming. La prueba espera ahora a que termine la respuesta de la acción y pasa sin ese error en desarrollo y en producción local.

La entrega de objetivos y prerrequisitos aplicó la migración aditiva el 14 de octubre de 2026. Se compararon recuentos y huellas de siete tablas antes y después, excluyendo únicamente los dos campos añadidos: no cambió el contenido existente. Las 45 versiones históricas mantienen metadatos vacíos; no se publicaron revisiones automáticamente. También se corrigió una carrera de hidratación detectada al editar un objetivo existente: el formulario espera a tener sus manejadores React antes de aceptar cambios.

Verificación de esta entrega: lint, TypeScript, 25 pruebas unitarias/editoriales, build y 15 recorridos E2E aprobados en desarrollo y producción local. Repetir una importación idéntica ya no revalida páginas sin cambios: elimina una actualización de streaming innecesaria que bloqueó una ejecución de producción. Docker y Piston siguen sin estar disponibles; las pruebas E2E usan exclusivamente el doble HTTP.

Entrega de conjuntos y mapas del 14 de octubre de 2026: lint, TypeScript, 27 pruebas unitarias/editoriales, build y 20 recorridos E2E aprobados en desarrollo y producción local. El catálogo llega a 49 ejercicios y Conecta las ideas a 12 pasos. Los recorridos comprueban las cuatro plantillas nuevas en ambos lenguajes y la importación privada, idempotente y protegida ante otros borradores de Una sola vez y Cada letra cuenta. Tras el seed y la actualización de rutas, los recuentos y huellas de las versiones anteriores, variantes, pruebas y datos de estudiantes no cambiaron. No se publicaron revisiones antiguas ni se verificó el catálogo ampliado en Piston, que sigue sin estar disponible.

Entrega de filtrado y comparación de textos del 14 de octubre de 2026: lint, TypeScript, build, 30 pruebas unitarias/editoriales y 24 recorridos E2E en desarrollo aprobados. Catálogo de 53 ejercicios, 272 casos por lenguaje y Conecta las ideas con 16 pasos. El seed y la actualización de rutas conservan las huellas y recuentos del contenido anterior y los datos de estudiantes. Las revisiones de palíndromos y anagramas se comprueban como borradores temporales sin publicarse.

**Bloqueo pendiente en producción local:** dos ejecuciones completas dieron 18 recorridos aprobados, uno fallido y cinco no ejecutados. `flows.spec.ts` se detiene en `await (await save).finished()` tras el segundo guardado administrativo. La traza registra HTTP 200 de acciones administrativas, pero sin cierre de respuesta; no se ha determinado la causa. Las pruebas de las actividades nuevas sí pasan en producción, pero no las cinco importaciones editoriales posteriores, que quedan sin ejecutar por la secuencia serial. No se han relajado las esperas ni añadido reintentos para ocultarlo. Es la siguiente prioridad antes de ampliar el recorrido. El arreglo anterior de doble navegación no basta para dar este problema por resuelto. Docker y Piston siguen sin estar disponibles.

Las pruebas de navegador de `npm run test:e2e` usan un doble HTTP de Piston en el puerto 2001. Verifican la integración, no el aislamiento real del motor. Para eso hay dos suites separadas que **sí usan Piston** en el puerto 2000:

- `npm run test:runner` (`tests/real-runner.integration.ts`) llama al adaptador real y comprueba los runtimes, las soluciones de referencia dentro del sandbox, y los cuatro veredictos: aprobado, incorrecto, error en tiempo de ejecución y tiempo agotado, en Python y JavaScript. Por defecto valida un subconjunto de cinco ejercicios; con `ITERA_RUNNER_ALL=1` valida el catálogo completo actual, es decir 544 ejecuciones reales. Se salta si el ejecutor no responde.
- `npm run test:e2e:real` (`tests/real/flows.spec.ts`, `playwright.real.config.ts`) recorre la aplicación completa contra el sandbox: registro, aprobación real, rechazo de una respuesta distinta, tiempo agotado, progreso independiente por lenguaje, y publicación editorial que solo ocurre si las dos referencias superan las pruebas. También comprueba que una referencia defectuosa impida publicar.

Resultado histórico anterior a Desde cero: 24 ejercicios aprobados (240 ejecuciones reales), 5 pruebas de integración y 6 recorridos reales en verde. Esto no valida los nuevos ejercicios ni las referencias modificadas: deben volver a ejecutarse contra Piston.

## Requisitos del ejecutor

Docker Desktop con WSL2 y cgroup v2. Sin ellos la aplicación funciona igual, pero el botón de ejecución informa de que el sandbox está detenido; nunca se ejecuta código del usuario en Node o Python del servidor principal.

## Dependencias

`npm audit --omit=dev` no reporta vulnerabilidades en las dependencias de producción en la revisión inicial. Se fijan parches de DOMPurify y mysql2, y una versión compatible corregida de deepmerge-ts mediante `overrides`.

La auditoría completa aún informa la cadena `eslint-config-next → fast-glob → micromatch → braces` en herramientas de desarrollo. La versión publicada de `braces` consultada no tiene corrección; no se ha degradado Next.js ni ocultado el aviso. Las entradas de estos analizadores proceden de los archivos del proyecto.

## Repetir la comprobación

Con PostgreSQL iniciado, el sandbox levantado y los puertos 3000 y 2000 libres:

```sh
npm test
npm run lint
npm run typecheck
npm run build
npm run test:runner
npm run test:e2e:real
npm run doctor
```

`npm run test:e2e` usa el doble HTTP y solo necesita libre el puerto 3000 y el 2001.

Para repetir esos mismos recorridos contra el build de producción **local**, en PowerShell:

```powershell
npm.cmd run build
$env:ITERA_E2E_PRODUCTION = "1"
npm.cmd run test:e2e
Remove-Item Env:ITERA_E2E_PRODUCTION
```

Este modo usa `next start` en vez de `next dev`, pero conserva el doble HTTP de Piston en 2001. No verifica aislamiento real ni despliega nada. Es necesario volver a compilar después de modificar el código.

Las capturas de referencia están en `.local/screenshots/`, excluidas de Git.
