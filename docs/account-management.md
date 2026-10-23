# Perfil, configuración y estado de cuenta

Configuración es una página completa en `/configuracion`, con cinco secciones:
Mi cuenta, Aprendizaje, Apariencia, Seguridad y Privacidad y cuenta. No se abre
como panel contextual. La bienvenida del registro vive en `/bienvenida`; véase
[learning-personalization.md](learning-personalization.md). El avatar mantiene
el menú con identidad, Configuración y Cerrar sesión, también en el taller.

## Persistencia

- El nombre, correo, lenguaje preferido, niveles por lenguaje y diagnósticos se
  guardan en PostgreSQL. Son independientes del progreso real.
- El tema (claro, oscuro o sistema) se conserva por navegador mediante
  `next-themes`. Las preferencias del editor siguen usando `itera:workspace`.
- Los cambios pendientes de los formularios se conservan al navegar entre
  secciones de la misma página. Cada sección se guarda por separado. No se
  guardan contraseñas en el almacenamiento del navegador.
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
- Correo, desactivación y acciones administrativas comparten un máximo persistente de cinco verificaciones
  de contraseña por minuto y usuario en `AccountActionLimit`, serializado con un
  bloqueo asesor de PostgreSQL. Los endpoints de Better Auth conservan sus
  límites propios y sus comprobaciones de origen y sesión.
- No se incorpora ni amplía recuperación de contraseña; su flujo previo queda
  fuera de este cambio.

## Desactivación, no eliminación

La acción solicita contraseña y confirmación explícita. Una transacción escribe
`User.disabledAt`, elimina todas las sesiones y registra la operación. No elimina
perfil, preferencias, diagnósticos, progreso, borradores, intentos, ayudas ni contexto de
práctica; tampoco afecta al catálogo ni a otros usuarios.

`currentUser()` excluye cuentas desactivadas. El hook de creación de sesiones
impide volver a entrar y el middleware protege llamadas de autenticación con una
sesión de cuenta desactivada. El último administrador activo no puede
desactivarse: se necesita otro que pueda reactivar la cuenta.

Administración → Gestionar usuarios (`/admin/cuentas`) permite consultar todas las
cuentas y filtrar por estado. El detalle permite reactivar, desactivar y gestionar
roles con `requireAdmin()`, contraseña y confirmación. La transacción elimina
cualquier sesión residual y registra al administrador que actuó. Reactivar requiere
iniciar sesión de nuevo. La protección del último administrador también impide
degradaciones de rol concurrentes. Detalles y perfiles ficticios en
[administration.md](administration.md).

La migración `20261020210000_account_management` añade el estado y el contador
de verificaciones, sin transformar ni borrar datos existentes. En otra
instalación, aplicar `npm run db:migrate` y regenerar Prisma antes de arrancar.
