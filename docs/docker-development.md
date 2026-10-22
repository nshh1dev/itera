# Desarrollar Itera dentro de Docker

## Dos modos, una aplicación a la vez

| Comando | Resultado |
| --- | --- |
| `docker-iniciar` | Ejecuta la última imagen compilada, `itera-local:docker`. |
| `docker-desarrollar` | Construye/inicia `itera-local:development`, ejecuta Next.js dev y sincroniza el código. |
| `docker-apagar` | Detiene los servicios y termina Ubuntu/WSL, conservando los datos. |

Ambos modos usan **http://127.0.0.1:3000** y el mismo servicio `app`: cambiar de modo reemplaza ese contenedor, no levanta otra aplicación en otro puerto. La imagen de desarrollo no sobrescribe la imagen compilada. Los modos comparten la base PostgreSQL, los paquetes de Piston y los correos locales: **las acciones sobre cuentas, ejercicios y progreso afectan a la misma base Docker**. No es una base de pruebas desechable.

El código permanece en `D:\proyectos\itera`. No se mueve a Linux ni se montan las dependencias de Windows. El contenedor conserva su propio `node_modules`, Prisma generado, Monaco y `.next`. No se ejecutan seed, migraciones ni publicación al iniciar o guardar archivos.

## Preparación y uso diario en Windows

Requiere el entorno Docker completo ya preparado, Ubuntu-24.04 y **Node.js 24 LTS en Windows** para el sincronizador. No necesita dependencias npm adicionales para seguir los archivos. El uso de la versión compilada sigue sin requerir Node en el host.

Reinstalar los lanzadores desde la raíz del proyecto una vez:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/install-docker-launchers.ps1
```

Después, en una terminal nueva:

```powershell
docker-desarrollar
```

Esperar al mensaje de disponibilidad y abrir **http://127.0.0.1:3000**. Dejar esa terminal abierta: muestra el seguimiento, las reconstrucciones y los registros iniciales de Next.js. Editar los archivos con el editor habitual en Windows. Los cambios se sincronizan aproximadamente cada segundo y Next.js actualiza el navegador; algunas modificaciones requieren una recarga completa que el propio servidor realiza.

`Ctrl+C` detiene **el seguimiento**, no borra ni apaga la aplicación. Para volver a la versión compilada, detener primero el seguimiento y ejecutar `docker-iniciar`. Si el seguimiento sigue activo, `docker-iniciar` y `docker-apagar` solicitan su cierre y esperan hasta cinco minutos: una reconstrucción en curso debe terminar antes de cambiar de modo o apagar WSL. El sincronizador también termina si detecta el cambio al modo compilado o el apagado de WSL. Antes de cada lote comprueba el modo y dirige las copias al ID del contenedor de desarrollo, no al contenedor de producción.

Al terminar:

```powershell
docker-apagar
```

Nada arranca al iniciar Windows. Si ya hay un servidor nativo en 3000, cerrarlo manualmente antes de cambiar de modo; los scripts no lo detienen.

## Qué ocurre al guardar

| Archivos | Acción |
| --- | --- |
| `src/`, `public/`, `scripts/`, `tests/` | Copiar altas/cambios al contenedor y retirar los archivos borrados; Next.js recarga lo que corresponde. |
| `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `prisma.config.ts` | Sincronizar y reiniciar la app. |
| `package.json`, `package-lock.json`, `Dockerfile`, `.dockerignore`, `.npmrc` | Reconstruir y recrear **solo la app de desarrollo**. La primera instalación puede tardar. |
| `prisma/` | Sincronizar y avisar; no ejecutar migraciones ni regenerar el cliente automáticamente. |
| Documentación y otros archivos fuera de la lista | No se sincronizan: no afectan a la aplicación en ejecución. |

Se excluyen secretos `.env*`, `.local`, `.git`, `.next`, `node_modules`, `src/generated`, `public/monaco`, archivos temporales y enlaces simbólicos del seguimiento Windows. Los archivos generados dentro de Linux no se copian de vuelta al host. Los cambios en el propio sincronizador requieren cerrar y volver a ejecutar `docker-desarrollar`.

Windows usa sondeo de contenido desde Node y copias mediante Docker: los eventos de archivos de Windows en `/mnt/d` no son fiables para Compose Watch ejecutado dentro de WSL. No necesita un puerto del motor Docker ni montar su socket dentro de la app. Un archivo de exclusión mutua en `.local/docker-development.lock` impide dos sincronizadores a la vez. Si un cierre forzado deja ese archivo, comprobar que ya no existe el proceso indicado antes de retirarlo; no eliminarlo con un seguimiento activo.

En Linux, con el proyecto y Docker preparados, puede utilizarse Compose Watch directamente:

```sh
docker compose --env-file .local/docker.env -f compose.yaml -f compose.app.yaml -f compose.dev.yaml up --build --watch
```

Las reglas están en `compose.dev.yaml`. El comando anterior no es el flujo recomendado para archivos guardados desde Windows en D:. No se ha verificado otra plataforma como equivalente al entorno Windows/WSL probado.

## Prisma y base de datos

Antes de modificar la base compartida, realizar un respaldo con `npm run docker:backup`. Una edición de `schema.prisma` no aplica cambios a PostgreSQL. Para regenerar el cliente dentro del contenedor, explícitamente:

```powershell
node scripts/docker.mjs --dev exec -T app node node_modules/prisma/build/index.js generate
```

Para aplicar migraciones **ya preparadas y revisadas**, explícitamente:

```powershell
node scripts/docker.mjs --dev exec -T app npm run db:migrate
```

No ejecutar `migrate reset`, `db push` ni preparar migraciones que puedan resetear la base compartida. Crear y ensayar nuevas migraciones sobre una base separada. La generación también se repite al construir la imagen de desarrollo, sin conectarse a la base.

## Publicar los cambios y actualizar la versión compilada

Verificar los cambios y guardarlos en GitHub mediante commit/push es independiente de Docker. La sincronización no publica nada en GitHub y no altera la imagen compilada.

Para actualizar la versión compilada con el código terminado:

```powershell
# Tras detener el seguimiento con Ctrl+C:
npm.cmd run docker:build
docker-iniciar
```

`scripts/docker.mjs --dev` añade el archivo de desarrollo a los comandos de mantenimiento. Por ejemplo, `node scripts/docker.mjs --dev logs --tail=50 app` muestra registros del modo de desarrollo.

## Comprobaciones

Con `docker-desarrollar` activo y las dependencias/Chromium de pruebas instalados en Windows:

```powershell
node tests/docker-development.integration.mjs
npm.cmd run docker:test:e2e
```

La primera prueba crea una página temporal única, comprueba altas, cambios y restauración en un navegador abierto sin `page.reload`, y retira la página al terminar. La segunda ejecuta los ocho recorridos reales completos contra la app que esté activa; crea y limpia sus cuentas y ejercicios temporales. No ejecutarlas sobre una evaluación en curso.

### Verificación local y límites

Verificado en Windows x64 + Ubuntu-24.04/WSL2: construcción de ambas imágenes, recarga en Chromium, reconstrucción automática al editar `Dockerfile`, reinicio de configuración, cambio de desarrollo a compilado y los ocho recorridos reales en cada modo. Typecheck y las 115 pruebas unitarias/editoriales aprobaron; lint mantiene 97 avisos de herramientas locales ajenas a esta entrega, sin errores.

Durante los recorridos en desarrollo se observaron un aviso de sistema de archivos lento, mensajes de stream interrumpido al navegar y una discrepancia de hidratación de las fechas de `/progreso` (UTC del contenedor frente a la zona local del navegador). Los recorridos aprobaron, pero no verifican ausencia de errores de consola. El formato de fechas pertenece a la aplicación existente y no se cambia en esta tarea de infraestructura. Compose Watch nativo de Linux no se ensayó en una instalación independiente. Las cinco vulnerabilidades altas notificadas por `npm ci` en dependencias de desarrollo tampoco se corrigen aquí.
