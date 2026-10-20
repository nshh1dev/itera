<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Alcance y mantenimiento de estas instrucciones

- Mantener este archivo por debajo de **180 líneas**, incluido el bloque generado por Next.js. No modificar ese bloque; conservar nuestras instrucciones en español.
- Incluir reglas vigentes y particularidades del proyecto. Guardar explicaciones extensas e historial de verificaciones en `docs/`, sin duplicarlos aquí.
- Resolver cada tarea con el menor cambio necesario. Acordar antes renombrados, reestructuraciones, cambios de dependencias o arreglos independientes que no sean necesarios para la tarea.
- Preservar el trabajo ajeno, incluidos archivos sin seguimiento. Investigar cambios desconocidos antes de sobrescribirlos o eliminarlos.

## Entorno local y archivos generados

- **El usuario inicia el servidor manualmente.** No iniciar, reiniciar ni dejar `next dev` / `next start` ejecutándose salvo petición explícita. Pedir permiso para pruebas que inicien la aplicación; no detener su servidor para liberar puertos sin autorización.
- Itera es una aplicación local: GitHub guarda el código, no un despliegue. Mantener fuentes y Monaco locales; la IA está aplazada. La interfaz y los ejercicios están en español.
- Ejecutar comandos desde la raíz. En PowerShell usar `npm.cmd` / `npx.cmd` si los envoltorios `.ps1` están bloqueados.
- Primera preparación: `npm ci` → `npm run setup`. Setup crea secretos faltantes, copia Monaco, inicia PostgreSQL privado, genera Prisma, aplica migraciones y prepara borradores editoriales. Para activar el currículo nuevo: Piston preparado → `npm run content:replace -- --apply`. Instalar dependencias no prepara por sí solo editor, base ni catálogo publicado.
- Arranque manual posterior: `npm run dev` inicia el PostgreSQL privado mediante `predev` antes de Next.js; no migra ni ejecuta el seed. Una `DATABASE_URL` personalizada requiere su servidor externo. Usar `http://127.0.0.1:3000`: autenticación y ejecución permiten explícitamente ese puerto; el puerto alternativo automático de Next no es equivalente. Diagnóstico: `npm run doctor`.
- PostgreSQL reside en `.local/postgres`, puerto **5434**, separado de los servicios de Windows. `PG_BIN` debe corresponder a la versión mayor del clúster. `db:stop` detiene este clúster privado, incluso con un `DATABASE_URL` personalizado.
- Piston usa `compose.yaml`, puerto **2000**, Docker Desktop, WSL2 y **cgroup v2**. Basta `wsl --install --no-distribution`, sin distribución Linux. Si WSL informa que falta virtualización, comprobar `VirtualMachinePlatform` con `Get-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform` antes de atribuirlo al firmware.
- Si `docker` no está en PATH, usar `C:\Program Files\Docker\Docker\resources\bin\docker.exe`; `npm run doctor` ya contempla esa ruta.
- Prisma 7 lee la URL desde `prisma.config.ts` y usa el adaptador `pg`. Generar con `npx prisma generate`; importar desde `src/generated/prisma/client`, no desde `@prisma/client`. `db:migrate` ejecuta **migrate deploy**, no crea migraciones. Build regenera Prisma, pero no migra ni ejecuta el seed.
- No editar manualmente ni subir `src/generated/`, `public/monaco/`, `.next/`, `.local/` ni archivos `.env` reales. Tras actualizar Monaco, repetir setup para renovar sus recursos servidos.

## Verificación y límites de las pruebas

- Comprobaciones disponibles: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`. No hay formateador ni flujo de CI configurado; no inventar un script `format`.
- Ejecutar las comprobaciones pertinentes. Informar cuáles aprobaron, cuáles fallaron o no se ejecutaron y por qué; separar avisos previos de problemas nuevos. No presentar una prueba omitida como aprobada.
- Reutilizar resultados recientes si el código comprobado no cambió. Para cambios solo documentales, revisar contenido, enlaces/rutas pertinentes y el diff; no iniciar la aplicación ni repetir toda la suite sin motivo.
- No ejecutar `typecheck` a la vez que el build regenera Prisma: puede producir errores transitorios de archivos faltantes. No ejecutar lint mientras Playwright crea o elimina resultados: puede provocar errores de lectura de directorios.
- Suite focalizada: `npx tsx --test tests/judge.test.ts`. `npm test` también ejecuta referencias fijas del repositorio; requiere Python (`PYTHON_BIN` sustituye a `python`). Esto no permite ejecutar código enviado por usuarios fuera del sandbox.
- E2E requiere PostgreSQL preparado, Chromium (`npx playwright install chromium`) y puertos **3000 y 2001 libres**. `npm run test:e2e` inicia su propio servidor y no reutiliza uno existente: respetar la autorización de arranque indicada arriba.
- `npm run test:e2e` (`tests/e2e`) usa un doble HTTP de Piston en **2001** que no ejecuta código. Aprobar esta suite no verifica aislamiento ni ejecución real.
- `npm run test:e2e:real` (`tests/real`, `playwright.real.config.ts`) usa Piston en **2000** y se omite si está desconectado. Ambas suites crean y eliminan usuarios y contenido editorial temporales.
- `npm run test:runner` comprueba el adaptador real y se omite si Piston está detenido. Su archivo `tests/real-runner.integration.ts` importa `server-only` mediante `piston.ts`: ejecutar con `tsx --conditions=react-server` y mantenerlo fuera de `tests/*.test.ts`.
- `tests/e2e/flows.spec.ts` es una **secuencia serial con estado**: las pruebas posteriores dependen de la cuenta y cookies iniciales. Ejecutar el archivo completo, no una prueba posterior aislada con `-g`. Limpia sus datos temporales; guarda capturas en `.local/screenshots/`.
- Preparación del ejecutor real: `docker compose up -d` → `npm run runner:setup`. Consultar `docs/verification.md` para cobertura y limitaciones conocidas.

## Reglas del dominio que deben conservarse

- `POST /api/executions` reserva un envío idempotente bajo un bloqueo asesor breve de PostgreSQL, responde 202 y programa la evaluación con Next `after()`. El cliente consulta `/api/executions/[id]`. No hay trabajador persistente; los intentos interrumpidos caducan a los dos minutos al reconciliarse desde los endpoints.
- Todo programa enviado pasa por `src/server/execution/piston.ts`. Cada versión tiene `runtimeMode`: `FUNCTION` (por defecto) envuelve `solve(data)` y devuelve JSON; `PROGRAM` ejecuta el archivo completo y compara la salida estándar con el texto esperado. `judge.ts` y `judgeProgram` comparan fuera del sandbox y eliminan entradas, salidas esperadas/reales, salida de depuración y stderr de casos ocultos antes de persistir o devolver resultados.
- Solo las evaluaciones `submit` completadas actualizan el progreso, por usuario + ejercicio + lenguaje. Los ejemplos, consultas de soluciones y errores de infraestructura no otorgan finalización. Conservar la finalización atómica para no contar reintentos dos veces.
- El catálogo público selecciona la versión **publicada** de mayor número de un ejercicio publicado. Los guardados administrativos crean nuevas versiones en borrador; publicar valida las referencias y plantillas de los tres lenguajes en Piston. Conservar variantes antiguas para los envíos históricos.
- TypeScript usa su runtime nativo de Piston y un conductor fijo que compila con `--strict --noEmitOnError` dentro del sandbox antes de ejecutar. El `typeContract` de la variante comprueba la firma de la función; nunca compilar código enviado en el servidor web. Las variantes pueden adaptar `statement`; vacío conserva el enunciado común.
- `src/lib/curriculum-v2.ts` define los 136 pasos, teoría y ejemplos; `learning-modules.ts` deriva módulos y orden de las cuatro rutas: Iniciación, Principiante, Intermedio y Avanzado. Acceso libre: los cierres orientan, no bloquean ni conceden progreso. Cada identidad nueva tiene tres variantes con los mismos casos y progreso independiente por lenguaje.
- `prisma/logic-content.ts` compone el catálogo nuevo; `prisma/content.ts` y `legacy-learning-modules.ts` conservan las referencias históricas. El seed prepara borradores, sin publicar. `content:replace -- --apply` valida referencias y plantillas en Piston, relee revisiones y sustituye atómicamente las rutas, retirando solo identidades históricas conocidas. Conserva datos de estudiantes y contenido personalizado. Sin Piston o ante conflictos no se sustituye el activo. `content:revisions -- --apply` prepara revisiones posteriores sin sobrepasar borradores distintos. Detalles en `docs/curriculum.md`.
- Cada versión puede documentar `complexity` (coste orientativo) y `commonErrors`; son opcionales y la interfaz solo los muestra cuando tienen contenido. `prisma/educational-exercise.ts` los deriva de `cost` y `mistakes`, y `content:metadata -- --apply` rellena los vacíos sin tocar otros campos.
- El cliente recibe solo los casos visibles y pide la solución aparte. El resumen de la primera diferencia (`src/lib/json-diff.ts`) se calcula en el navegador con datos visibles; no exponer casos ocultos ni mover esa lógica al servidor sin filtrar.
- Los borradores usan concurrencia optimista basada en revisión; no sustituirla por upserts incondicionales. Conservar las copias del navegador y la transferencia independiente de invitado a cuenta.
- La recuperación de Better Auth escribe enlaces en `.local/mail/`, no usa SMTP. Promover una cuenta existente con `npm run admin -- email@example.com`. Las acciones administrativas deben seguir llamando a `requireAdmin()`.

## Diseño e integración visual

- Reutilizar tokens y componentes existentes. `src/app/globals.css` centraliza los colores claro/oscuro de Tailwind, shadcn/ui y Monaco. Conservar la paleta monocromática, azul para acciones principales y verde solo para éxito.
- No rediseñar pantallas fuera del alcance acordado. Al cambiar un tema, comprobar que el otro no se degrade; revisar los tamaños de pantalla afectados, foco visible y movimiento reducido.
- Conservar la jerarquía aprobada de superficies, los controles compactos y el espacio útil del editor. No sustituir la separación tonal por divisores repetidos o tarjetas innecesarias.
- Los desplegables usan `appearance: base-select` dentro de `@supports`; los navegadores sin soporte mantienen el selector nativo. Conservar etiquetas, teclado y envío de formularios; no prometer apariencia idéntica en todos los navegadores.
- Monaco exige hexadecimales de seis dígitos aunque CSS los abrevie a `#fff`. Mantener normalización y observador de clase raíz en `src/components/practice/code-editor.tsx`: `next-themes` puede actualizar el DOM después de los efectos de React y dejar el editor con el tema incorrecto.
- Las preferencias del espacio de práctica (tamaño del código, ancho del enunciado, altura de resultados, editor sencillo) se guardan en `localStorage` bajo `itera:workspace` y se leen solo tras hidratar, para no romper el render del servidor.

## Flujo de Git y GitHub

- Preferencia permanente: al terminar y verificar un cambio, hacer commit y push a GitHub. Una instrucción posterior de no publicar tiene prioridad. No publicar trabajo incompleto como terminado; informar bloqueos o comprobaciones fallidas.
- Mantener el flujo sencillo actual en `main` para cambios terminados y acotados. Reservar ramas para cambios grandes o experimentales; respetar las protecciones del repositorio.
- Antes de preparar un commit, revisar `git status`, diff, rama, seguimiento y remoto. Hacer fetch antes de subir; si hay divergencias, resolverlas sin descartar trabajo local ni remoto.
- No forzar pushes, reescribir commits publicados ni renombrar ramas compartidas sin aprobación explícita. No reescribir el historial solo para traducir sus mensajes.
- Añadir al staging rutas explícitas de la tarea. Excluir secretos, entornos reales, recursos generados, bases locales, capturas, resultados de pruebas y dependencias; conservar herramientas locales ajenas a la entrega.
- Escribir títulos, descripciones de commits y pull requests, y resúmenes de entrega **en español**. Mantener prefijos Conventional Commits: `feat(ui): refinar las superficies`, `fix(tests): estabilizar las comparaciones`, `docs(workflow): aclarar las normas de publicación`.
- Usar commits coherentes y comprensibles por separado, con título concreto. Explicar en el cuerpo qué cambió, por qué, qué se verificó y qué limitaciones quedan. Evitar títulos como `cambios` o `final` y no dividir código acoplado en commits intermedios rotos.
- Antes del commit, revisar el diff preparado y `git diff --cached --check`. Aplicar los criterios de verificación anteriores, sin inventar pruebas ni confundir el doble HTTP con Piston real.
- Cuando haga falta una rama, usar nombres descriptivos como `feat/<tema>`, `fix/<tema>` o `docs/<tema>`. Las pull requests deben incluir título claro y secciones Resumen, Verificación y Limitaciones; no inventar referencias a incidencias.
- Tras el push, comprobar que la rama remota apunta al commit esperado. Comunicar identificadores, enlace de GitHub, verificaciones y cambios locales restantes. Un commit local por sí solo no completa la subida.
