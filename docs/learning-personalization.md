# Bienvenida y personalización del aprendizaje

## Experiencia

El registro crea la cuenta en el primer paso y continúa en `/bienvenida`. Los
pasos son Cuenta, Personalizar, Diagnóstico opcional y Tu ruta. La bienvenida no
bloquea el catálogo: se puede salir y retomarla desde Inicio. Las cuentas creadas
antes de la migración quedan exentas (`onboardingStep = 0`). Las altas por Better
Auth comienzan en el paso 2; este campo no admite entrada del cliente.

El diseño conserva las fuentes locales, controles y tonos de Itera. Configuración
es una página, no una ventana interceptada. Su navegación lateral se convierte en
una lista compacta de enlaces en pantallas estrechas; `seccion` permite enlazar
directamente a Mi cuenta, Aprendizaje, Apariencia, Seguridad o Privacidad y cuenta.
Los formularios permanecen montados al navegar entre secciones para conservar
ediciones pendientes. No se añaden exportación ni restauración de datos.

## Declaración, orientación y progreso

- `UserPreference.language`: lenguaje preferido. `level` mantiene compatibilidad
  con herramientas existentes, reflejando la declaración del lenguaje preferido.
- `LearningProfile`: nivel declarado por usuario y lenguaje. La migración copia
  las preferencias existentes únicamente a su lenguaje correspondiente.
- `Diagnostic`: lenguaje, declaración de partida, versión de reglas, fecha,
  recomendación y explicación. Se conserva el historial; repetir no lo reemplaza.
- `Progress`: sigue siendo el progreso real por usuario, ejercicio y lenguaje.
  Cambiar preferencias o terminar un diagnóstico no escribe en esta tabla.

La recomendación utiliza el último diagnóstico terminado del lenguaje, ordenado por
fecha de finalización, solo si coincide con la declaración actual. Si es inconcluso,
conserva el nivel declarado y muestra su razón; no rescata una sugerencia anterior.
En ausencia de diagnóstico utiliza el nivel declarado; sin declaración propone
Iniciación. Todas las rutas permanecen abiertas.
El dashboard prioriza la actividad pendiente del lenguaje preferido, luego su
continuidad habitual; sin actividad propone la ruta del perfil. El progreso de
otros lenguajes permanece disponible desde Progreso.

## Diagnóstico v1

`src/lib/learning-profile.ts` contiene la selección editorial: dos retos del nivel
declarado y un tercero opcional de contraste. Se usan las últimas versiones
publicadas al crear la sesión y sus identificadores se fijan para todo el recorrido.
Si falta contenido publicado, la interfaz permite continuar sin diagnóstico.

Reglas orientativas, no psicométricas ni certificadoras:

- Menos de dos primeros retos evaluados válidamente: sin nueva sugerencia.
- Ninguno de esos dos superado: reforzar el nivel anterior, con mínimo Iniciación.
- Uno o dos superados: conservar el nivel declarado.
- Ambos y el tercero superados: probar el siguiente nivel, con máximo Avanzado.
- `ERROR`, `RUNNING` y retos no evaluados no se convierten en fallos de conocimiento.
- Se usa la última comprobación completa de cada reto, no sus ejecuciones de ejemplos.

Piston, el editor y la comparación de resultados son los mismos que en práctica.
No se muestran soluciones durante el diagnóstico. Los casos ocultos se filtran
antes de persistir exactamente como en la práctica normal.

## Aislamiento y concurrencia

`DiagnosticItem` conserva el código y su revisión optimista separados de `Draft`.
Las copias locales usan `itera:diagnostic:<usuario>:<item>` y no participan en la
transferencia invitado → cuenta. Las preferencias visuales del taller se conservan.

`Submission.diagnosticItemId` identifica la finalidad sin cambiar los modos
`examples` y `submit`. El endpoint comprueba propiedad, variante y sesión abierta.
La idempotencia incluye el contexto diagnóstico. La finalización sigue siendo
atómica, pero solo `submit` sin diagnóstico modifica `Progress`.

Los diagnósticos comparten los límites globales y por persona de ejecución.
Reservar y terminar un diagnóstico usan el mismo bloqueo breve de reservas para
evitar que se acepten envíos después de cerrarlo. La ejecución ocurre fuera de ese
bloqueo. No hay trabajador persistente; se conserva la reconciliación de intentos
interrumpidos según el lenguaje, el número de casos y la comprobación conceptual,
con un mínimo de dos minutos. `src/lib/execution-limits.ts` comparte el presupuesto
entre evaluador y endpoints; no se lanzan más casos tras finalizar o caducar.

Catálogo, actividad, historial de práctica, archivo y estadísticas administrativas
excluyen los envíos diagnósticos. Abrir el editor diagnóstico no escribe en
`PracticeContext`, `Draft`, `HelpUsage` ni `Progress`.

## Actualización y pruebas

Aplicar la migración aditiva con `npm run db:migrate` en la instalación que se
utiliza. En Docker: reconstruir la imagen y ejecutar la migración mediante
`node scripts/docker.mjs run --rm --no-deps app npm run db:migrate` antes de
iniciar la app nueva. No ejecutar reset ni seed para esta actualización.

Pruebas unitarias: `tests/learning-profile.test.ts` y
`tests/practice-navigation.test.ts`. Recorridos reales:
`tests/real/onboarding.spec.ts`, con cuentas temporales, Piston real, comprobaciones
de propiedad, idempotencia, casos ocultos y ausencia de progreso. La configuración
Docker incluye además las suites de cuenta y navegación visual, que no dependen
del doble HTTP de Piston. Los recorridos con doble siguen usando su configuración
nativa independiente.

La apariencia y las preferencias del editor siguen en el navegador; los perfiles,
diagnósticos y datos de cuenta quedan en PostgreSQL local. Desactivar conserva
también estos datos y requiere reactivación administrativa.
