# Itera completa en Docker

## Alcance

`compose.yaml` conserva Piston y sus paquetes. `compose.app.yaml` añade la aplicación Next.js/Node y PostgreSQL. El modo nativo sigue disponible, pero ambas aplicaciones no pueden ocupar 3000 a la vez. La base Docker y la base Windows son **copias independientes**: los cambios posteriores no se sincronizan.

Versiones fijadas: Node 24.16.0 y PostgreSQL 18.3 con digest de imagen, Piston con digest, dependencias mediante `package-lock.json`; preparación de Python 3.12.0, Node 20.11.1 y TypeScript 5.0.3. Las actualizaciones son explícitas: no cambiar versiones mayores de PostgreSQL sin migrar datos. Las herramientas de mantenimiento se conservan en la imagen para ejecutar Prisma, importaciones y pruebas sin instalar dependencias en el host.

Se verificó Windows x64 + Ubuntu/WSL2 con cgroup v2. No se promete soporte ARM/macOS sin comprobar la imagen y el aislamiento de Piston. No es un despliegue público: la aplicación escucha solo en loopback, Piston permanece en `127.0.0.1:2000` y PostgreSQL no publica puerto. Solo Piston necesita `privileged`; la app usa el usuario `node`, no tiene el socket Docker ni carpetas del host montadas.

## Instalación nueva

Con Git, Docker Engine y Compose preparados, clona el repositorio y abre una terminal en su raíz. En Windows sin Desktop se necesita una distribución WSL2 con el motor instalado; una CLI sola no basta. Los comandos siguientes requieren Docker activo. No es necesario instalar Node ni PostgreSQL en el host para usar la aplicación.

En Windows sin Desktop, instala primero los lanzadores desde PowerShell (puede requerir permisos de administrador para registrar la tarea) y reabre la terminal. Esto no inicia la aplicación:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/install-docker-launchers.ps1
```

Crear secretos locales sin Node ni PostgreSQL en el host (no utiliza ni modifica `.env`):

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/docker-configure.ps1
Start-ScheduledTask -TaskName Docker-WSL
```

La tarea mantiene WSL activo durante la preparación inicial; se inicia solo porque ejecutaste este comando, no al entrar en Windows. Para equipos con Docker Desktop o Linux no se usa esa tarea.

En Linux, la alternativa sin Node en el host es:

```sh
docker run --rm --mount "type=bind,source=$(pwd),target=/app" -w /app node:24.16.0-bookworm-slim@sha256:2c87ef9bd3c6a3bd4b472b4bec2ce9d16354b0c574f736c476489d09f560a203 node scripts/docker-configure.mjs
```

Con Node instalado también sirve `npm run docker:configure`. Los secretos se guardan en `.local/docker.env`, excluido de Git y del contexto de construcción. Respalda ese archivo de forma privada; no compartas la salida de `docker compose config`, porque expande las contraseñas.

Preparar imagen, base y ejecutor:

```powershell
docker compose --env-file .local/docker.env -f compose.yaml -f compose.app.yaml build app
docker compose --env-file .local/docker.env -f compose.yaml -f compose.app.yaml up -d --wait database piston
docker compose --env-file .local/docker.env -f compose.yaml -f compose.app.yaml run --rm --no-deps app node scripts/docker-prepare.mjs
```

La preparación aplica migraciones, crea borradores sin publicarlos e instala los tres lenguajes. Para activar el currículo nuevo, explícitamente y con Piston funcionando:

```powershell
docker compose --env-file .local/docker.env -f compose.yaml -f compose.app.yaml run --rm --no-deps app npm run content:replace -- --apply
docker compose --env-file .local/docker.env -f compose.yaml -f compose.app.yaml up -d --wait
```

Abrir **http://127.0.0.1:3000**. La primera validación del catálogo puede tardar varios minutos. No se ejecuta al arrancar ni se publica contenido implícitamente. Para promover una cuenta existente, ejecutar el script `admin` dentro de `app`.

## Uso diario y lanzadores Windows

En el PC con Ubuntu-24.04 y el motor ya instalados, preparar los lanzadores una vez desde PowerShell:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/install-docker-launchers.ps1
```

Este comando instala `docker`, `docker-iniciar` y `docker-apagar` para el usuario actual y registra la tarea `Docker-WSL` **sin disparadores automáticos**. Conserva una copia de los lanzadores previos. El motor y la distribución deben existir antes; el instalador no los descarga. Si cambia el directorio del proyecto, repetirlo. Los scripts npm de mantenimiento en Windows usan Ubuntu-24.04.

Reabrir la terminal y usar:

```powershell
docker-iniciar
# Usar Itera en http://127.0.0.1:3000
docker-apagar
```

No hace falta `npm run dev`. Espera a que finalicen las evaluaciones antes de apagar. El apagado termina también otros procesos de esa distribución. Para comprobar que quedó apagada sin activarla: `wsl --list --verbose`. Véase [diagnóstico local](docker-local.md).

En Linux, o sin lanzadores, usar el comando Compose completo con `up -d --wait` y `stop`. Los atajos npm `docker:up`, `docker:stop`, `docker:status` y `docker:build` requieren Node en el host, pero no son necesarios para el uso normal. `docker:stop` detiene contenedores, no el motor/WSL.

## Copiar una instalación Windows existente

No ejecutes el seed ni la activación del catálogo encima de la copia como parte de esta migración. Cierra la aplicación original para impedir escrituras durante el respaldo, pero deja PostgreSQL disponible. Conserva el volumen de destino vacío y levanta únicamente `database` y `piston`.

Con Node y las dependencias del modo nativo disponibles:

```powershell
npm.cmd run docker:configure
node scripts/docker.mjs up -d --wait database piston
npm.cmd run docker:import-local
node scripts/docker.mjs run --rm --no-deps app npm run db:migrate
npm.cmd run docker:up
```

El importador usa `.env` como origen y `PG_BIN`/rutas habituales para `pg_dump`. Crea un respaldo en `.local/backups`, restaura mediante `pg_restore` en una transacción **solo si el destino está vacío**, compara recuentos y hashes de las filas de todas las tablas públicas con ambas sesiones en UTC y conserva el secreto de autenticación original. No borra ni detiene la base Windows. Si el origen cambia o las huellas difieren, informa del bloqueo; no sobrescribe un destino existente para reintentar.

`node scripts/docker-data.mjs verify-local archivo.dump` compara de nuevo las dos bases sin restaurar ni copiar secretos. Las diferencias después de usar una de ellas son esperables: no hay sincronización automática.

## Respaldo y restauración

Con la base Docker encendida:

```powershell
npm.cmd run docker:backup
```

Sin Node en el host, puede hacerse un respaldo dentro del contenedor y copiarlo sin redirección binaria de PowerShell:

```powershell
docker compose --env-file .local/docker.env -f compose.yaml -f compose.app.yaml exec database pg_dump -U itera -d itera -Fc --no-owner --no-privileges -f /tmp/itera.dump
docker compose --env-file .local/docker.env -f compose.yaml -f compose.app.yaml cp database:/tmp/itera.dump ./itera.dump
docker compose --env-file .local/docker.env -f compose.yaml -f compose.app.yaml exec database rm /tmp/itera.dump
```

Guarda los respaldos fuera de Git y cópialos a otro dispositivo de forma privada. Contienen datos personales. Guarda también `.local/docker.env` para conservar el secreto de autenticación. Los archivos de recuperación de contraseña viven en el volumen `local-mail`; se consultan mediante `exec app ls .local/mail` y se copian con Compose `cp` si se necesitan.

`pg_dump -Fc` comprime, **no cifra**. El respaldo contiene correos, hashes de
contraseñas, progreso y posiblemente sesiones o tokens. Usa almacenamiento cifrado
y acceso limitado para la copia externa; no lo adjuntes a incidencias ni lo subas
a repositorios. Conserva los secretos de configuración de forma privada y separada
del dump cuando sea posible. No hace falta copiar los enlaces temporales de
recuperación para restaurar el progreso; evita conservarlos sin necesidad.

Los comandos Node `backup` e `import-local` reservan el archivo exclusivamente y
no sobrescriben una ruta existente. Escriben directamente al descriptor, sin
redirección binaria de PowerShell ni acumular todo el dump en memoria. Si el
productor falla o no entrega una cabecera `PGDMP` con contenido, eliminan su copia
parcial y no anuncian éxito. Esa cabecera **no valida todo el archivo** ni sustituye
una restauración de prueba en una base vacía. Un cierre forzado o corte de energía
puede dejar un archivo incompleto: conserva las copias anteriores y usa un nombre
nuevo al reintentar. La restauración actual sigue leyendo el dump en memoria;
el envoltorio Docker mantiene `maxBuffer` de 256 MiB para la salida capturada.

Los archivos nuevos solicitan modo `0600` y el directorio nuevo `0700` en sistemas
POSIX. Esto no restringe las ACL heredadas de Windows ni modifica las de archivos
existentes. Su corrección sigue siendo una operación independiente autorizada.
El directorio debe ser de confianza: la creación exclusiva no impide que otra
persona con acceso de modificación borre o sustituya posteriormente el archivo.
Usa la extensión `.dump`: Git y el contexto Docker excluyen ese formato y sus
informes `*.dump.*.verification.json`, incluso fuera de `.local`; no cubren nombres
arbitrarios ni sustituyen el control de acceso. El procedimiento manual con Compose
`cp` de arriba no incorpora las garantías de creación exclusiva y limpieza de Node.

Mantén al menos una copia anterior fuera del equipo, revisa periódicamente la
retención y comprueba la restauración antes de depender del respaldo. No se elimina
ninguna copia automáticamente. No restaures dumps de procedencia no confiable:
pueden contener instrucciones SQL que se ejecutarán con el usuario de destino.

Para restaurar, prepara **una base vacía** en otro equipo o volumen y ejecuta:

```powershell
node scripts/docker-data.mjs restore ruta/al/respaldo.dump
```

Sin Node en el host: copia el archivo con Compose `cp` a `database:/tmp/itera.dump` y ejecuta `pg_restore -U itera -d itera --no-owner --no-privileges --exit-on-error --single-transaction /tmp/itera.dump` dentro del servicio. No restaura sobre una instalación en uso. Nunca utilices `down -v` ni elimines volúmenes para apagar el proyecto.

### Comprobación real de restauración

Con autorización operativa, Docker/base preparados y sin escrituras de la app,
desde PowerShell en el host con Node y dependencias:

```powershell
$env:ITERA_BACKUP_RESTORE = "1"
npm.cmd run test:backup:real
Remove-Item Env:ITERA_BACKUP_RESTORE
```

No inicia servicios por sí misma, pero consultar Docker puede activar WSL. Sin la
variable la prueba se omite sin contactar la base. Con ella, utiliza el exportador
real para conservar un dump nuevo en `.local/backups/restore-check-*.dump`, analiza
su índice y restaura transaccionalmente en una base nueva
`itera_restore_check_<identificador aleatorio>`, creada desde `template0` en el
mismo servidor PostgreSQL. Necesita permiso para crear/eliminar esa base temporal.
Nunca llama a `pg_restore` sobre `itera` ni elimina una base preexistente.

Compara nombres, recuentos y huellas de filas de todas las tablas públicas entre
origen previo, restauración y origen posterior, sin imprimir filas ni huellas. Si
hay diferencias o falla una operación, la prueba falla. El `finally` elimina solo
la base temporal que consiguió crear; conserva el dump. Un cierre forzado puede
dejar la base temporal y el respaldo: revisa la ejecución antes de eliminarlos,
sin borrar ni resetear la base de uso diario.

El respaldo contiene datos reales y **no está cifrado**; protégelo igual que las
otras copias. Esta prueba no valida roles/permisos del clúster, secuencias o datos
de otros esquemas, recuperación en otra versión mayor ni el arranque de la app
restaurada. `--no-owner --no-privileges` conserva el contrato actual de importación.

## Actualización y verificación

Con el entorno activo y un respaldo reciente:

```powershell
npm.cmd run docker:build
node scripts/docker.mjs run --rm --no-deps app npm run db:migrate
npm.cmd run docker:up
node scripts/docker.mjs exec -T app npm run test:runner
```

La imagen no incorpora secretos ni la base local. Las migraciones son explícitas y no se ejecutan durante el build. Los datos viven en `database-data`, los runtimes en `piston-packages` y la recuperación local en `local-mail`.

`docker-iniciar` sirve la compilación de producción: **no recarga al editar código**. Tras cambios terminados, reconstruye esa imagen y recrea la app con los comandos anteriores. Para editar con recarga automática dentro de Docker, usa `docker-desarrollar`: [guía de desarrollo](docker-development.md). El modo nativo sigue disponible con su propia base.

Para los recorridos reales de navegador, bienvenida, cuenta y configuración, con Node, dependencias y Chromium instalados en el host, y la app Docker activa en 3000:

```powershell
npm.cmd run docker:test:e2e
```

El script publica PostgreSQL temporalmente en **127.0.0.1:55434**, ejecuta la secuencia real completa contra la base Docker y retira el puerto en `finally`. No inicia un servidor Next nativo. Las pruebas crean y limpian cuentas y ejercicios temporales. Las suites con doble HTTP siguen siendo distintas y no acreditan aislamiento.

Para comprobar únicamente cabeceras, registro, acceso y recuperación local, con
los mismos requisitos y el entorno ya activo:

```powershell
npm.cmd run docker:test:e2e -- tests/docker/http-security.spec.ts --repeat-each=2
```

Los argumentos se pasan a Playwright; sin argumentos sigue ejecutándose la suite
Docker completa. El recorrido acotado crea una cuenta aleatoria, consulta su correo
en el volumen de la app y elimina únicamente esa cuenta, sus tokens y sus mensajes.
Respeta los límites reales de autenticación mediante `Retry-After`. Las trazas y
capturas de fallos pueden contener datos de la cuenta temporal o el enlace de
recuperación: son privadas, quedan fuera de Git y no deben adjuntarse sin revisión.

Para comprobar autorización entre dos cuentas en PostgreSQL y Chromium reales:

```powershell
npm.cmd run docker:test:e2e -- tests/docker/user-authorization.spec.ts --repeat-each=5
```

Este recorrido crea dos cuentas y un ejercicio temporales, con intentos sintéticos
en la base real; no evalúa programas ni acredita Piston. Usa sesiones separadas y
reenvía Server Actions capturadas de la interfaz con propietario/revisión
manipulados. Comprueba lectura de intentos e historial, borradores propios y ajenos,
rechazo de invitado y concurrencia optimista. Cierra los contextos antes de eliminar
solo sus fixtures en `finally`; no ejecuta seed ni migraciones.

Si se interrumpe el proceso a la fuerza, ejecutar `npm run docker:up` para retirar de nuevo ese puerto temporal.
