# Docker local sin Docker Desktop

## Configuración de este PC

Docker Engine, Docker CLI y Compose están instalados desde el repositorio oficial de Docker en **Ubuntu-24.04 sobre WSL2**, con cgroup v2. El código permanece en `D:\proyectos\itera`; la aplicación, Node, PostgreSQL y Piston funcionan ahora en contenedores. La instalación nativa de Windows se conserva como respaldo. Instalación, migración y actualizaciones: [Docker completo](docker.md).

**El encendido es manual.** La tarea de Windows `Docker-WSL` mantiene una sesión WSL activa cuando se solicita, pero no tiene disparadores de inicio de sesión. No hay que abrir Ubuntu para trabajar.

Los lanzadores están en `%LOCALAPPDATA%\DockerCLI`, carpeta añadida al PATH del usuario:

- `docker.cmd`: delega los comandos a Docker en Ubuntu, conservando el directorio de trabajo.
- `docker-iniciar.cmd`: inicia WSL y Docker y combina los dos archivos Compose para levantar los tres servicios.
- `docker-apagar.cmd`: detiene ordenadamente los servicios y la tarea, y termina Ubuntu-24.04.
- `LEEME.md`: instrucciones locales de la instalación.

Estos archivos y la tarea se instalan mediante `scripts/install-docker-launchers.ps1`: **no aparecen solo por clonar ni al ejecutar `npm run setup`**. El lanzador accede al motor como root dentro de Ubuntu; la aplicación se ejecuta como usuario no privilegiado. Si cambia la ubicación del proyecto, repite el instalador.

## Rutina diaria desde PowerShell

```powershell
docker-iniciar
```

Abre **http://127.0.0.1:3000**, entra en un ejercicio y usa **Ejecutar** o **Enviar**. No necesitas `npm run dev`. Si hay un servidor nativo en ese puerto, ciérralo tú con `Ctrl+C` antes de iniciar el modo Docker.

Al terminar, espera a que finalicen las evaluaciones y ejecuta:

```powershell
docker-apagar
```

Esto conserva los paquetes y datos de Docker. Termina también cualquier otro proceso de Ubuntu-24.04. La instalación nativa de Windows sigue siendo independiente; si la utilizaste, se detiene con `Ctrl+C` y `npm.cmd run db:stop`.

## Estado y diagnóstico

Para comprobar que Ubuntu está apagado, sin activarlo:

```powershell
wsl --list --verbose
```

Debe aparecer `Ubuntu-24.04` como `Stopped`. Abrir Ubuntu, ejecutar `docker` o un diagnóstico que consulte Docker puede activar WSL y su servicio Docker. Después usa `docker-apagar` si quieres liberar ese entorno.

Con el entorno encendido, desde la raíz del proyecto:

```powershell
node scripts/docker.mjs ps
docker compose logs --tail=50 piston
node scripts/docker.mjs exec -T app npm run test:runner
```

Piston debe aparecer como `Up` y responder en `127.0.0.1:2000`. Una prueba omitida por falta de Piston no acredita funcionamiento.

Si falta un comando, reinicia la aplicación de terminal para que recoja el PATH. También puedes invocar el lanzador directamente:

```powershell
& "$env:LOCALAPPDATA\DockerCLI\docker-iniciar.cmd"
```

`docker compose stop` sin los dos archivos solo conoce Piston. Usa `docker-apagar` para el entorno completo. No elimines la distribución ni los volúmenes para apagar Docker.

## Preparación y particularidades

Los runtimes ya están preparados. Solo para una instalación nueva o para añadir lenguajes:

```powershell
docker-iniciar
cd D:\proyectos\itera
node scripts/docker.mjs exec -T app npm run runner:setup
```

En otro equipo se necesita un motor Docker con contenedores Linux, Compose y cgroup v2. Puede usarse Docker Engine dentro de WSL2 o Docker Desktop. Una CLI sola no ejecuta contenedores. Con el motor preparado, el comando estándar del repositorio es `docker compose up -d`.

En esta instalación se desactivó `systemd-timesyncd` de Ubuntu para conservar la sincronización del entorno WSL/Windows: ambos mecanismos alternaban el reloj y provocaban falsos tiempos agotados. Es una corrección local observada, no un requisito general de Piston.

Verificación realizada durante la instalación: Python 3.12.0, JavaScript/Node 20.11.1 y TypeScript 5.0.3 disponibles; ocho pruebas reales aprobadas, ninguna omitida. Después se comprobó el inicio manual, la respuesta de los tres runtimes y el apagado con cero disparadores automáticos. Véase [verificación](verification.md).
