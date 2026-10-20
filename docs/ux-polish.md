# Pulido puntual de experiencia

- El catálogo y las filas de rutas presentan habilidades breves para los 136 pasos, sin modificar versiones publicadas ni sus contratos. La búsqueda incluye estos resúmenes. El contenido personalizado conserva sus objetivos editoriales.
- El enunciado usa encabezados para entrada y resultado esperado; se eliminan instrucciones genéricas redundantes. Se conservan ayudas, pistas progresivas, solución voluntaria y resultados plegables.
- Las rutas retoman el pendiente iniciado más reciente, abren su módulo y señalan el ejercicio activo. Los integradores aparecen una sola vez como filas; su acceso final conserva la ruta. Se elimina el repaso que repetía los objetivos de los módulos.
- La recuperación conserva ejercicio, lenguaje y ruta al volver a iniciar sesión. Los mensajes distinguen borradores del navegador, datos de la instalación y recuperación mediante `.local/mail`, sin prometer correo ni copia en la nube.
- Progreso ofrece instrucciones específicas para visitantes, cuentas nuevas y cuentas con borradores pero sin intentos.

## Verificación (20 de octubre de 2026)

- 101 pruebas unitarias aprobadas; TypeScript, lint de `src` y `tests`, y build aprobados.
- Última ejecución global E2E: 111 aprobadas, un fallo al registrar la cuenta temporal del nuevo archivo y una prueba dependiente no ejecutada. No se considera una ejecución global completamente aprobada.
- Repetición final de `ux-polish.spec.ts`: 6 aprobadas, incluida recuperación completa, navegación en los tres lenguajes, módulo activo, estados vacíos y capturas claro/oscuro en móvil y escritorio.
- `flows.spec.ts` completo: 13 aprobadas tras adaptar la comparación del texto editorial a los encabezados semánticos. Los fallos transitorios anteriores de filtros móviles y atajo Control+Enter aprobaron al repetirse y en la última ejecución global.
- Se corrigió la espera de Monaco en la captura móvil: el editor está montado pero oculto al consultar Enunciado; solo se exige visible en escritorio.
- Capturas locales: `.local/screenshots/pulido/`. Los datos de la cuenta de prueba son temporales y se eliminan al finalizar.
- Las E2E usan un doble HTTP de Piston. No se verificó ejecución real ni aislamiento; no se inició Docker.
- Sin cambios de dependencias, migraciones o progreso. El servidor temporal de pruebas se cierra al finalizar; el arranque normal sigue siendo manual.
