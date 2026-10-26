# Verificación local

## Qué ejecutar

Desde la raíz, sin iniciar la aplicación:

```sh
npm run lint
npm run typecheck
npm test
```

`npm test` ejecuta referencias fijas del repositorio y requiere Python local
(`PYTHON_BIN` permite elegirlo). Nunca ejecuta código de estudiantes fuera de Piston.
`npm run build` regenera Prisma y `.next`, sin migrar ni publicar contenido.
No ejecutar tipos a la vez que el build regenera Prisma.

Las configuraciones de navegador están en `tests/playwright*.config.ts`. Usar los
scripts npm de esta guía, o pasar explícitamente `-c tests/playwright.config.ts`
(doble HTTP), `-c tests/playwright.real.config.ts` o
`-c tests/playwright.docker.config.ts`. Los servidores temporales siguen usando
la raíz del proyecto y los resultados se guardan en `test-results/`.

## Pruebas con servicios

Iniciar servicios y servidores temporales requiere autorización previa. El usuario
controla el arranque normal; no detener su servidor para liberar un puerto.

| Comando | Preparación y alcance |
| --- | --- |
| `npm run test:e2e` | PostgreSQL preparado, Chromium y puertos 3000/2001 libres. Inicia su propio Next y un doble HTTP de Piston; no ejecuta código ni verifica aislamiento. |
| `npm run test:e2e:real` | PostgreSQL, puerto 3000 libre y Piston real en 2000. Se omite si el sandbox está apagado. |
| `npm run test:runner` | Adaptador y referencias contra Piston real; se omite si está detenido. No valida por sí solo todo el catálogo. |
| `npm run docker:test:e2e` | App Docker ya activa; expone PostgreSQL temporalmente y retira el puerto al terminar. Véase [docker.md](docker.md). |
| `npm run test:runner:security` | Sondas optativas con `ITERA_RUNNER_SECURITY=1`; alcance en [runner-security.md](runner-security.md). |
| `npm run test:backup:real` | Restauración optativa con `ITERA_BACKUP_RESTORE=1`; usa una base temporal, no sobrescribe la principal. Véase [docker.md](docker.md#comprobación-real-de-restauración). |

Para ejecutar los recorridos con doble HTTP contra un build local, en PowerShell:

```powershell
npm.cmd run build
$env:ITERA_E2E_PRODUCTION = "1"
npm.cmd run test:e2e
Remove-Item Env:ITERA_E2E_PRODUCTION
```

Esto usa `next start`, no publica un sitio ni convierte el doble HTTP en ejecución
real. Volver a compilar si cambia el producto. `tests/e2e/flows.spec.ts` es serial
y tiene estado compartido: ejecutar el archivo completo, no un paso posterior aislado.
No ejecutar lint mientras Playwright crea o elimina resultados.

## Comprobación de las rutas reorganizadas — 26 de octubre de 2026

- Lint sin errores/avisos, tipos y **344 pruebas aprobadas sin omisiones**.
- Las tres configuraciones cargan y enumeran 164, 24 y 43 tests respectivamente
  (doble HTTP, real y Docker). `--list` no ejecuta recorridos ni inicia servidores.
- Cuatro YAML analizados y comparados con los anteriores: equivalentes salvo
  las rutas previstas de construcción y seguimiento. Instalador PowerShell y
  enlaces documentales revisados; lanzadores locales actualizados sin ejecutarlos.
- No se ejecutaron build, E2E ni Compose contra Docker: se conserva `.next`
  intacta y no se inician servicios. La comprobación estática no acredita una
  nueva construcción de imágenes, recarga real ni uso de los volúmenes existentes.

## Evidencia funcional conservada — 26 de octubre de 2026

Estos resultados son registros anteriores a la limpieza documental, no pruebas
repetidas por ella ni una garantía sobre modificaciones futuras.

- Cierre técnico: **280 pruebas aprobadas sin omisiones**, tipos aprobados y lint
  sin errores ni avisos. En ese cierre no se repitieron build ni E2E porque el
  código de producto no había cambiado respecto a la entrega anterior.
- Interacción: cinco archivos completos (`interface`, `controls`, `motion`,
  `curriculum`, `redesign`), 39 recorridos repetidos dos veces: **78 aprobaciones**
  contra producción local y PostgreSQL temporal. Cubren temas, teclado, foco,
  persistencia, rutas y movimiento reducido. No ejecutan programas reales.
- Zoom nativo al 200 %: dos recorridos claro/oscuro repetidos dos veces,
  **cuatro aprobaciones**, con Chromium completo y extensión en perfiles
  desechables. Anchos útiles de 720, 390 y 320 px. No equivale a CSS `zoom`,
  ampliar la fuente o pinch zoom. Preparación y límites: [browser-interaction.md](browser-interaction.md).
- Duración real de Piston: **tres recorridos sin omisiones**, 21 muestras en
  Python/JavaScript/TypeScript. La más larga fue 50,373 s; no se cambiaron los
  presupuestos. Mide adaptador/casos/parser, no endpoints, PostgreSQL, `after()`,
  sondeo ni carga concurrente. Detalles y repetición: [runner-timing.md](runner-timing.md).
- Activación del currículo ampliado, conservación de datos y proyectos:
  [fundamentos.md](fundamentos.md) y [project-execution.md](project-execution.md).
- Seguridad, autorización y restauración: [security.md](security.md). Las pruebas
  con dobles no sustituyen las comprobaciones reales descritas allí.

Los intentos fallidos, interrumpidos y omitidos no cuentan como aprobaciones.
Una suite con doble HTTP no acredita aislamiento, ni una muestra de referencias
valida automáticamente todo el catálogo. La validación con principiantes está
**aplazada por acuerdo del usuario**; [su protocolo](beginner-validation.md) no
constituye sesiones realizadas ni evidencia de eficacia educativa. No se declara
certificación WCAG, auditoría con lector de pantalla ni cobertura de todos los navegadores.

## Resultados y mantenimiento

Las suites pueden regenerar `test-results/`, `.local/screenshots/`, informes y
registros. Son evidencia temporal excluida de Git; conservar solo lo necesario
para diagnosticar un fallo abierto. No borrar `.local` completa: contiene la base
nativa, respaldos, correo de recuperación, secretos Docker y posibles worktrees.

Esta guía resume el estado y los procedimientos vigentes. El diario detallado
de entregas anteriores se consulta en el historial de Git, sin duplicarlo aquí.
