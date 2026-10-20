# Perfil, configuración y estado de cuenta

Configuración conserva la página `/configuracion`, la bienvenida y el panel
contextual. Sus cuatro secciones son Mi perfil, Práctica, Apariencia y Cuenta y
privacidad. El avatar abre un menú con identidad, Configuración y Cerrar sesión,
también en el espacio de práctica.

## Persistencia

- El nombre, correo, lenguaje preferido y nivel se guardan en PostgreSQL.
- El tema (claro, oscuro o sistema) se conserva por navegador mediante
  `next-themes`. Las preferencias del editor siguen usando `itera:workspace`.
- El borrador temporal de Configuración usa el identificador de usuario, no el
  correo mutable. Se recupera la clave anterior cuando existe. Solo contiene
  nombre, lenguaje y nivel: nunca contraseñas.
- Cerrar sesión invalida la sesión actual, vuelve al inicio público y conserva
  cuenta, progreso, intentos y borradores. No borra datos del navegador.

## Acciones sensibles

- Cambiar correo requiere sesión activa y contraseña actual. Normaliza y valida
  el correo, respeta su unicidad y lo marca como no verificado. No envía enlaces
  ni demuestra la propiedad del buzón: es la política elegida para esta
  instalación local. Invalida las otras sesiones.
- Cambiar contraseña usa Better Auth 1.7.7, con contraseña actual, nueva y
  confirmación en la interfaz. Admite de 10 a 128 caracteres y rechaza reutilizar
  la actual. El hook del servidor fuerza la revocación de las otras sesiones
  incluso si se invoca el endpoint directamente. Better Auth mantiene el hash
  scrypt; las acciones propias delegan su comprobación y no persisten contraseñas
  en claro.
- Correo y desactivación comparten un máximo persistente de cinco verificaciones
  de contraseña por minuto y usuario en `AccountActionLimit`, serializado con un
  bloqueo asesor de PostgreSQL. Los endpoints de Better Auth conservan sus
  límites propios y sus comprobaciones de origen y sesión.
- No se incorpora ni amplía recuperación de contraseña; su flujo previo queda
  fuera de este cambio.

## Desactivación, no eliminación

La acción solicita contraseña y confirmación explícita. Una transacción escribe
`User.disabledAt`, elimina todas las sesiones y registra la operación. No elimina
perfil, preferencias, progreso, borradores, intentos, ayudas ni contexto de
práctica; tampoco afecta al catálogo ni a otros usuarios.

`currentUser()` excluye cuentas desactivadas. El hook de creación de sesiones
impide volver a entrar y el middleware protege llamadas de autenticación con una
sesión de cuenta desactivada. El último administrador activo no puede
desactivarse: se necesita otro que pueda reactivar la cuenta.

Administración → Cuentas desactivadas (`/admin/cuentas`) permite reactivar con
`requireAdmin()`. La transacción elimina cualquier sesión residual y registra al
administrador que actuó. Reactivar requiere iniciar sesión de nuevo.

La migración `20261020210000_account_management` añade el estado y el contador
de verificaciones, sin transformar ni borrar datos existentes. En otra
instalación, aplicar `npm run db:migrate` y regenerar Prisma antes de arrancar.
