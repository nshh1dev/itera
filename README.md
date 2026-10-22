# Itera

**Un intento más cerca.** Un espacio local para aprender lógica de programación con ejercicios originales y rutas guiadas.

Aplicación personal, gratuita y sin servicios cloud. Las cuentas, los borradores y el progreso se guardan en tu computadora. La IA se implementará más adelante.

## Qué incluye

- Landing, espacio personal, catálogo con filtros y cuatro rutas de aprendizaje.
- 136 ejercicios de lógica en español: Iniciación (28), Principiante (36), Intermedio (36) y Avanzado (36).
- Ruta **Desde cero**: instrucciones, valores, variables, entrada y operaciones antes de introducir funciones, con plantillas propias por lenguaje.
- Ruta **Construye tus bases**: comparaciones, condiciones, listas, cadenas, rangos y acumuladores antes de combinarlos en retos.
- Los mismos ejercicios y el mismo orden en Python, JavaScript y TypeScript, con variantes propias y los mismos casos visibles y ocultos.
- Módulos con teoría breve, ejemplos adaptados y retos de integración. Autoevaluación al terminar cada ruta, sin bloqueos.
- Registro e inicio de sesión con correo y contraseña; recuperación en una bandeja de correo local.
- Monaco servido localmente, editor sencillo alternativo, tamaño de fuente, paneles ajustables y copia del código; las preferencias se recuerdan en el navegador.
- Borrador local y guardado en PostgreSQL con detección de conflictos entre pestañas.
- Ejecución asíncrona, ejemplos, comprobación completa, resumen de la primera diferencia y progreso por lenguaje.
- Pistas progresivas, coste orientativo, errores comunes y soluciones explicadas a petición.
- Historial de intentos de cada ejercicio y búsqueda del catálogo sin distinguir acentos.
- Administración con nuevas versiones, pruebas, validación de referencias y publicación.
- Revisiones didácticas importables como borradores privados, sin sobrescribir el trabajo existente.
- Temas claro/oscuro, fuentes locales Geist, navegación por teclado y adaptación móvil.

## Requisitos

- **Node.js 24 LTS** y npm (también es compatible Node 22.12+).
- **PostgreSQL 16 o superior**, con `initdb`, `pg_ctl`, `psql` y `createdb`.
- **Para ejecutar código y validar la primera activación del catálogo:** Docker con contenedores Linux, Docker Compose y cgroup v2. En Windows, Docker necesita un backend como WSL2.

Una instalación con el catálogo ya activado funciona sin Piston; el botón de ejecución informa si el sandbox está detenido. La primera activación valida las referencias en Piston antes de publicar. Nunca se ejecuta el código del usuario en Node o Python del servidor principal.

## Primer inicio

Desde la carpeta del proyecto:

```sh
npm ci
npm run setup
npm run dev
```

Abre **http://127.0.0.1:3000** y crea tu cuenta. Utiliza siempre el mismo hostname para conservar la sesión.

`setup`:

1. Crea `.env` con contraseñas aleatorias si todavía no existe.
2. Copia Monaco a `public/monaco`; no utiliza CDN.
3. Inicializa un clúster privado en `.local/postgres`, puerto **5434**, escuchando solo en loopback.
4. Genera Prisma, aplica migraciones y prepara el catálogo nuevo en borrador, sin sobrescribir trabajo existente ni publicarlo.
5. Desactiva la telemetría de Next.js.

No modifica los servicios PostgreSQL ni las bases existentes. No sobrescribe un `.env` personalizado; únicamente añade la desactivación de telemetría si falta.

Para activar por primera vez el currículo nuevo, prepara Piston siguiendo la sección siguiente y ejecuta `npm run content:replace -- --apply`. Se validan referencias y plantillas de los tres lenguajes antes de publicar las cuatro rutas. El proceso puede tardar varios minutos. Sin Piston no se publica el catálogo nuevo ni se retira el anterior.

En Windows detecta instalaciones habituales, incluida `D:/PostgresSQL/bin`. Si tu instalación está en otra ruta, configura `PG_BIN` en `.env`. Debe ser la misma versión mayor de PostgreSQL con la que creaste el clúster.

Si ya tienes una base propia, copia `.env.example` a `.env`, establece `DATABASE_URL` y un secreto de autenticación aleatorio de al menos 32 caracteres, y ejecuta `npm run setup`. Una URL distinta de `127.0.0.1:5434` se trata como un servidor administrado por ti; el script no lo inicia ni lo detiene.

### Inicios siguientes

En el PC configurado con Docker CLI en WSL2, ejecuta primero `docker-iniciar` en PowerShell si vas a ejecutar ejercicios. Docker no arranca al iniciar Windows. Después:

```sh
npm run dev
```

`npm run dev` inicia primero el PostgreSQL privado mediante `predev` y después Next.js. Si la base ya está encendida, la reutiliza; si no puede arrancar, no inicia Next.js. No aplica migraciones ni ejecuta el seed: la primera preparación sigue siendo `npm run setup`. Con una `DATABASE_URL` personalizada debes iniciar tu servidor PostgreSQL por separado.

Para parar la aplicación: `Ctrl+C`. Para parar **solo el clúster del proyecto**: `npm run db:stop`.

Al terminar los ejercicios, `docker-apagar` apaga Ubuntu, Docker y Piston y conserva sus datos. No detiene Next.js ni PostgreSQL. Estos dos comandos son lanzadores locales de este PC, no vienen al clonar el repositorio. Consulta [Docker local y uso diario](docs/docker-local.md).

Si necesitas investigar PostgreSQL, consulta `.local/postgres.log`. `npm run doctor` comprueba configuración, base, editor, Docker y lenguajes del ejecutor sin mostrar credenciales.

## Activar la ejecución aislada

La instalación local actual usa **Docker Engine, CLI y Compose dentro de Ubuntu-24.04/WSL2**, sin Docker Desktop. Itera, Node y PostgreSQL siguen en Windows. En este PC, `docker-iniciar` arranca el entorno y ejecuta Compose; después usa `npm run runner:setup` si faltan los lenguajes.

En cualquier otro entorno con un motor Docker y Compose funcionando, la preparación general es:

```sh
docker compose up -d
npm run runner:setup
npm run doctor
```

La primera preparación descarga la imagen de Piston y los runtimes gratuitos de Python, Node y TypeScript. Después, los ejercicios se ejecutan localmente.

Si ya tenías Piston instalado antes de incorporar TypeScript, repite `docker compose up -d piston` y `npm run runner:setup`: se actualiza el presupuesto de compilación y se conserva el volumen de runtimes. El programa del alumno sigue limitado a 3 segundos.

- Piston está expuesto únicamente en **127.0.0.1:2000**.
- Usa Isolate y necesita el contenedor privilegiado definido por su instalación oficial, cgroup v2 y soporte de namespaces. No se monta la carpeta de Itera ni la base de datos dentro del ejecutor.
- Los programas tienen límite de 3 segundos, 256 MiB, 64 procesos y 64 KiB por salida. TypeScript dispone además de una compilación estricta dentro del sandbox (hasta 8 segundos); el conductor tiene un presupuesto de 12 segundos. La red está deshabilitada explícitamente en el sandbox.
- Las salidas esperadas se comparan en Itera; no forman parte del programa evaluado.
- Las pruebas ocultas devuelven solo su estado, nunca entradas, salidas ni errores brutos.
- Se permiten como máximo una evaluación activa por usuario y cuatro globales.
- Si se interrumpe Next.js, los intentos pendientes se marcan como error al consultarlos después de dos minutos. No cuentan como respuestas incorrectas.

El repositorio no llama a la API pública de Piston ni necesita una clave de terceros. `docker compose stop` detiene solo el sandbox; en este PC, usa `docker-apagar` para apagar también su entorno WSL y liberar sus recursos.

**Verificación del sandbox.** Con Docker y Piston activos (`docker-iniciar` en este PC), `npm run test:runner` ejecuta las soluciones de referencia dentro de Piston y `npm run test:e2e:real` recorre la aplicación completa con el ejecutor real. Las pruebas se omiten cuando el ejecutor no está disponible: eso no acredita su funcionamiento. Consulta el estado de cada entrega en [docs/verification.md](docs/verification.md). No hay ejecución simulada en la aplicación normal.

## Contrato de los ejercicios

Hay dos modelos que conviven:

- **Programa:** escribe el archivo completo, lee la entrada estándar preparada en la plantilla y muestra la respuesta. Se compara el texto impreso, normalizando finales de línea y espacios finales.
- **Función:** implementa `solve(data)` y devuelve un valor JSON. La aplicación proporciona los datos; no necesitas leer la entrada ni imprimir el resultado. Puedes imprimir para depurar: el panel de salida muestra esas líneas solo en ejemplos visibles.

TypeScript puede elegirse sin conocer JavaScript. Aprende inferencia y anotaciones desde las variables, después firmas, objetos, uniones, opcionales y genéricos. La evaluación exige compilar sin errores de tipos antes de ejecutar, y las funciones tienen un contrato editorial independiente de la firma que escriba el alumno.

Los ejemplos no aprueban el ejercicio. **Comprobar solución** ejecuta todos los casos y registra el resultado. La comparación es estructural: ignora el orden de claves de los objetos, pero respeta tipos y orden de arreglos.

## Correo y administración locales

La recuperación de contraseña crea un archivo de texto en `.local/mail/` con un enlace de un solo uso. No se envía ningún correo real. En esta aplicación personal, registrar una cuenta no exige verificar el correo; no se marca como verificado artificialmente.

Tras registrarte, puedes convertir tu cuenta en administradora:

```sh
npm run admin -- tu@correo.com
```

Abre `/admin`. Guardar crea una versión en borrador. **Validar y publicar** comprueba las referencias y plantillas de todos los lenguajes en Piston; TypeScript debe cumplir también su contrato de tipos. El seed prepara el currículo nuevo sin publicarlo. Las pruebas editoriales locales no sustituyen a Piston.

En una instalación existente, `npm run content:replace` previsualiza la sustitución. `-- --prepare` crea borradores; `-- --apply` valida el lote completo en Piston y sustituye el catálogo activo atómicamente. Se conservan cuentas, preferencias, intentos, borradores y progreso anteriores; las identidades nuevas empiezan sin completados. El contenido personalizado no se retira automáticamente. Los últimos códigos archivados propios se consultan en Progreso.

Para revisiones posteriores, `npm run content:revisions -- --apply` prepara nuevas versiones del catálogo de lógica sin publicar ni sobrepasar borradores distintos. Valídalas desde administración con Piston disponible. Procedimiento y currículo: [docs/curriculum.md](docs/curriculum.md).

Los usuarios nuevos no pueden asignarse el rol de administrador. Los permisos se comprueban en cada operación del servidor.

El panel también permite buscar cuentas, consultar progreso, gestionar roles y
desactivar/reactivar sin borrar datos. Para crear diez perfiles ficticios locales,
usa el seed independiente de desarrollo; credenciales, garantías de conservación y
comandos en [Administración y perfiles locales](docs/administration.md).

## Comandos

| Comando | Función |
| --- | --- |
| `npm run setup` | Preparación local completa e idempotente. |
| `npm run dev` | Iniciar PostgreSQL privado y desarrollo en `127.0.0.1:3000`. |
| `npm run build` / `npm start` | Build y ejecución de producción local. |
| `npm run db:start` / `npm run db:stop` | Controlar el clúster privado. |
| `npm run db:migrate` / `npm run db:seed` | Migraciones y catálogo. |
| `npm run db:seed:users -- --apply` | Crear perfiles ficticios sin sobrescribir cuentas; requiere activación local explícita. |
| `npm run test:admin` / `npm run test:dev-users` | Verificar administración transaccional y seed local con PostgreSQL. |
| `npm run db:studio` | Inspección local mediante Prisma Studio. |
| `npm run content:paths` | Vista previa del orden de las cuatro rutas con secuencia editorial. Añade `-- --apply` para actualizarlo explícitamente. |
| `npm run content:metadata` | Vista previa de la guía de aprendizaje (objetivo y conocimientos previos) que falta en versiones publicadas antiguas. Añade `-- --apply` para completarla sin sobrescribir. |
| `npm run content:revisions` | Previsualizar revisiones del catálogo; `-- --apply` crea borradores nuevos sin publicar ni modificar versiones existentes. |
| `npm run content:replace` | Previsualizar la sustitución; `-- --prepare` prepara borradores y `-- --apply` valida en Piston antes de activar el currículo nuevo. |
| `npm run doctor` | Estado de dependencias locales. |
| `npm run lint` / `npm run typecheck` | Calidad estática. |
| `npm test` | Evaluador, validación y referencias editoriales. |
| `npm run test:e2e` | Recorridos reales de navegador. |

## Pruebas

```sh
npm test
npm run lint
npm run typecheck
npm run build
npx playwright install chromium
npm run test:e2e
```

Las pruebas editoriales ejecutan **únicamente las referencias fijas del repositorio**, no código de usuarios. Requieren Python local (`PYTHON_BIN` permite elegir su ejecutable).

`npx tsx --test tests/logic-install.integration.ts` prepara el catálogo nuevo en la base configurada y comprueba idempotencia y conservación de los datos existentes, sin publicarlo. Las suites de navegador requieren haber activado previamente el currículo nuevo; nunca lo publican con el doble HTTP.

Las pruebas E2E levantan su propia aplicación en el puerto 3000; detén antes cualquier instancia de Itera. Usan un doble de contrato HTTP en **2001**, sin ejecutar código, para verificar evaluación asíncrona, confidencialidad e idempotencia. La aplicación normal usa **2000**, reservado al Piston real. Crean cuentas y contenido temporales, los eliminan al terminar y dejan capturas en `.local/screenshots`.

`npm run test:e2e:real` sí usa el Piston real (puerto 2000, sin dobles): comprueba que un envío se apruebe, que un resultado distinto y un bucle infinito no aprueben, que JavaScript tenga progreso independiente y que la administración solo publique tras ejecutar las referencias. Se omite solo si el sandbox está apagado.

Los recorridos con doble HTTP también se pueden ejecutar contra `next start`, tras compilar, estableciendo `ITERA_E2E_PRODUCTION=1`. No publica un sitio ni ejecuta programas reales. Instrucciones para PowerShell y límites de la verificación: [docs/verification.md](docs/verification.md).

## Arquitectura

```text
src/app/                 Rutas, layouts, Server Components y endpoints
src/components/ui/       Primitivas shadcn/ui sobre Radix
src/components/practice/ Editor, ayudas y resultados
src/server/              Autenticación, datos y acciones autorizadas
src/server/execution/    Adaptador Piston, evaluación y progreso
src/lib/                 Tipos, validaciones y utilidades
prisma/                  Esquema, migraciones y contenido original
scripts/                 Preparación, diagnóstico y administración local
tests/                   Pruebas editoriales, de dominio y de navegador
```

Stack: Next.js App Router, React, TypeScript, PostgreSQL, Prisma, Tailwind CSS, shadcn/ui, Better Auth y Monaco. Sin IA, Redis, servicios de pago ni analítica externa.

La paleta se centraliza en `src/app/globals.css`. Los componentes consumen tokens semánticos; el editor deriva su tema de esos mismos tokens. Las fuentes se empaquetan con la aplicación.

## Datos y Git

`.env`, `.local`, los binarios de Monaco, dependencias y builds están excluidos de Git. Se versionan código, lockfile, migraciones y el catálogo editorial; nunca sesiones, credenciales ni borradores.

Estrategia: `main` estable, ramas cortas `feat/...` y `fix/...`, commits pequeños con prefijos `feat:`, `fix:`, `docs:` y `chore:`. La versión inicial es `0.1.0`.

El código se versiona en [github.com/nshh1dev/itera](https://github.com/nshh1dev/itera). La aplicación sigue ejecutándose localmente; el repositorio no despliega un sitio web ni contiene tu base de datos.

Para respaldar tus datos usa `pg_dump` de tu versión de PostgreSQL, o copia `.local/postgres` únicamente con el clúster detenido. El código y la base se respaldan por separado.

## Después

Prioridades y criterios pedagógicos: [docs/roadmap.md](docs/roadmap.md).

El currículo común sustituye al catálogo anterior con `npm run content:replace -- --apply`, previa validación en Piston. No hace falta resetear la base: no se eliminan cuentas, intentos, borradores ni progreso. Las identidades `logica-` empiezan sin completados y los registros anteriores quedan consultables en Progreso.

Para revisiones posteriores del contenido, ejecuta `npm run content:revisions -- --apply` o abre `/admin/ejercicios/<slug>`. Revisa el borrador y usa **Validar y publicar versión guardada** con Piston disponible. Preparar una revisión nunca la publica ni cambia el progreso, los borradores de estudiantes o los intentos históricos.
