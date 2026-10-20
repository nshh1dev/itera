# Administración y perfiles locales

## Panel y permisos

`/admin` muestra estadísticas, actividad reciente y el contenido editorial existente.
`/admin/cuentas` permite buscar por nombre/correo y filtrar por rol y estado, en páginas
de 20 cuentas. El detalle muestra actividad y progreso actual por ruta y lenguaje,
sin enviar código privado, credenciales ni hashes al navegador administrativo.

`USER` conserva las funciones normales. `ADMIN` añade administración de cuentas y
contenido; el registro y la actualización de perfil no admiten asignarse ese rol.
Todas las páginas y acciones administrativas verifican permisos en el servidor.

Activar, desactivar o cambiar un rol requiere confirmación y contraseña del
administrador (cinco comprobaciones por minuto, compartidas con otras acciones de
cuenta). La transacción vuelve a verificar sesión vigente, rol, estado del actor y
estado esperado de la cuenta. Los cambios quedan registrados en `AuditLog` y revocan
las sesiones del destinatario. No se escriben contraseñas en el registro.

Desactivar o degradar al último administrador activo está prohibido, incluso con
acciones simultáneas. La autodesactivación, el panel y la promoción local por CLI
comparten el bloqueo de administración. Modificar tu propia cuenta obliga a volver
a iniciar sesión. Para preparar el primer administrador, registra una cuenta y usa
`npm run admin -- tu-correo`; esta herramienta local no necesita una sesión web y
no reactiva cuentas desactivadas.

## Desactivación, no borrado

Configuración permite desactivar con contraseña y confirmación. Se conserva el
usuario, preferencias, borradores, intentos y progreso. Se revocan sus sesiones y
la autenticación impide crear otras mientras esté desactivado. El panel permite
reactivarlo: recupera sus datos, nunca sus sesiones anteriores. No hay acción de
borrado permanente en la configuración ni en el panel.

## Crear diez perfiles de prueba

Requiere PostgreSQL preparado y el currículo actual publicado con sus cuatro rutas
y tres variantes. No publica ni sustituye ejercicios y no se ejecuta desde setup,
el seed editorial, el arranque o el build. Si falta el catálogo, aborta sin crear
cuentas: prepara Piston y sigue `content:replace -- --apply` según `curriculum.md`.

En PowerShell, desde la raíz:

```powershell
$env:ITERA_DEV_USERS = "1"
npm.cmd run db:seed:users -- --apply
Remove-Item Env:ITERA_DEV_USERS
```

El comando exige activación explícita, rechaza `NODE_ENV=production` y solo admite
PostgreSQL en `localhost`, `127.0.0.1` o `::1`. Es una protección contra accidentes,
no una forma de reconocer si una base local contiene información importante.
Solo admite `sslmode` como parámetro adicional de conexión; rechaza parámetros que
puedan sustituir el servidor, puerto o esquema.

Perfiles: nuevo sin actividad; iniciación en «Desde cero»; principiante; intermedio
con varias rutas parciales; avanzado; multilenguaje; práctica con fallos y
borradores sin completaciones; sin actividad reciente; desactivado con historial;
y administrador. Las preferencias de lenguaje/nivel corresponden a cada perfil.
El progreso se registra por ejercicio y lenguaje; los ejemplos no lo aumentan.

### Acceso y credenciales

Abre **solo en tu equipo** `.local/dev-users.json`: contiene el correo y contraseña
aleatoria de cada perfil. No hay contraseña compartida, valores públicos ni claves
en la documentación. El archivo está ignorado por Git y se crea con permisos
restrictivos donde el sistema los soporte; en Windows se aplican también las ACL
heredadas de la carpeta. No lo compartas ni subas capturas de su contenido.

Inicia Itera manualmente y entra en `http://127.0.0.1:3000/iniciar-sesion`.
El perfil administrador accede a `/admin`. El desactivado rechazará el login hasta
que un administrador lo reactive; después usará su contraseña local original.

PostgreSQL guarda hashes de Better Auth, nunca esas contraseñas en claro. El archivo
local se escribe de forma exclusiva antes de insertar datos y queda vinculado a la
identidad local de la base. No lo borres para intentar restablecer contraseñas.
Si ya existen perfiles y falta el archivo, el comando aborta sin generar claves falsas.
Si cambias correo/contraseña desde la aplicación, el archivo puede quedar obsoleto:
usa el correo actualizado y la recuperación local en `.local/mail/`.

### Repetición y conservación

Identidades, claves de idempotencia y fechas iniciales son estables. Cada cuenta
creada tiene una marca de propiedad del seed en `AuditLog`. Una colisión de ID o
correo sin esa marca cancela toda la transacción: nunca se adopta ni sobrescribe
una cuenta existente. Las cuentas de prueba ya creadas se conservan **sin actualizar
ningún dato**, incluidos los cambios de rol, estado y práctica posteriores. Si se
añaden ejercicios al catálogo, repetir el seed no rellena historiales antiguos.

Los intentos son **sintéticos**, con soluciones de referencia para aciertos y código
que provoca un error para fallos. Llevan un mensaje explícito de desarrollo y sus
resultados no contienen entradas, salidas esperadas/reales ni stderr ocultos.
No son evidencia de que Piston haya ejecutado esos programas. No se añade ninguna
vía de ejecución simulada a la aplicación normal.

## Interpretación de estadísticas

- Cuenta activa significa habilitada; no que tenga una sesión abierta.
- Actividad en siete días: visitas a ejercicios, guardados de borrador o intentos.
- Los totales incluyen perfiles ficticios, cuentas desactivadas y catálogo histórico.
- Una completación es usuario + ejercicio + lenguaje; resolver el mismo ejercicio
  en dos lenguajes cuenta dos veces, reintentar en el mismo no.
- Comprobaciones correctas/incorrectas solo cuentan `submit` evaluados; los ejemplos,
  errores de infraestructura y evaluaciones pendientes se distinguen del progreso.
- El detalle por ruta utiliza el mismo catálogo publicado que las vistas estudiantiles.

## Verificación

```powershell
npm.cmd run test:admin
$env:ITERA_DEV_USERS = "1"
npm.cmd run test:dev-users
Remove-Item Env:ITERA_DEV_USERS
npm.cmd run test:e2e -- tests/e2e/admin.spec.ts tests/e2e/account.spec.ts
```

`test:admin` comprueba permisos, sesión caducada/revocada, estado obsoleto, último
administrador y concurrencia en un esquema temporal aislado que elimina al terminar.
Requiere permisos locales de creación de esquemas; no altera cuentas de la aplicación.
`test:dev-users` crea los perfiles si faltan, repite el seed y contrasta huellas de
cuentas/historial antes y después, además de intentos/progreso y confidencialidad.
No ejecutarlo mientras se practica o cambia contenido: la huella debe permanecer estable.

E2E inicia su servidor (puertos 3000 y 2001 libres), crea y limpia cuentas temporales.
La prueba de acceso a los diez perfiles usa el archivo local; se omite si no existe.
Verifica los perfiles iniciales: si los has modificado, sus expectativas pueden no
corresponder. Usa un doble HTTP de Piston y no acredita ejecución ni aislamiento real.
