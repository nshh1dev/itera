# Seguridad local

## Alcance

La revisión local se cerró el **25 de octubre de 2026**. No certifica ausencia de
vulnerabilidades ni habilita publicar Itera en Internet. Esta guía conserva las
protecciones vigentes y los límites de las comprobaciones; los diarios de entregas
están disponibles en el historial de Git.

## Protecciones vigentes

- **Autenticación:** Better Auth conserva scrypt, controles de origen y sesiones.
  Los límites locales comparten contador por ruta; falsificar cabeceras de IP no
  concede otro cupo. No desactivar el seguimiento de IP para silenciar sus avisos.
- **Contraseñas nuevas:** entre 10 y 128 caracteres, con rechazo local de claves
  comunes y patrones triviales. Se aceptan frases, espacios y Unicode sin exigir
  clases de caracteres. La normalización solo detecta patrones: no transforma la
  clave enviada al hash. No es un medidor de entropía ni una consulta a filtraciones.
  La política no impide entrar con una contraseña histórica.
- **Recuperación:** enlaces locales privados, no SMTP. Restablecer revoca sesiones
  anteriores; el token no se puede reutilizar. En Docker el correo reside en su
  volumen, no en la carpeta nativa. Instrucciones en [docker.md](docker.md#recuperación-de-contraseña).
- **Privacidad HTTP:** `no-referrer`, `nosniff`, `X-Frame-Options: DENY`, sin
  `X-Powered-By`, y cámara/micrófono/geolocalización deshabilitados. El handler
  público de autenticación marca las respuestas que devuelve como `no-store`;
  no cubre errores generados antes de llegar al handler. No se añade HSTS a HTTP
  local ni una CSP sin validar sus integraciones con Next y Monaco.
- **Autorización:** intentos, borradores y diagnósticos se vinculan a la sesión,
  no a un `userId` enviado por el cliente. Los borradores conservan revisiones
  optimistas. Las acciones administrativas exigen `requireAdmin()`.
- **Ejecución:** todo programa de estudiantes pasa por Piston. El endpoint limita
  el cuerpo a 184.096 bytes y el código a 30.000 unidades UTF-16; conserva reserva
  idempotente y finalización atómica. Los casos ocultos no exponen entradas,
  resultados ni errores brutos. Los fallos operativos usan el registro acotado de
  [operational-logging.md](operational-logging.md).
- **Respaldos:** creación exclusiva, escritura directa y limpieza de parciales
  ante fallos detectados. No se sobrescriben copias previas. La cabecera no prueba
  integridad; una interrupción forzada puede dejar un parcial. Los dumps no se
  cifran automáticamente y pueden contener datos personales, hashes y tokens:
  conservar copia externa cifrada y probar su restauración. Véase [docker.md](docker.md#respaldo-y-restauración).

## Evidencia y límites

Resultados de la revisión del 25 de octubre, no comprobaciones repetidas en la
limpieza documental:

| Área | Comprobación registrada | Límite |
| --- | --- | --- |
| Dependencias | Actualización de Next/ESLint y `fast-uri`; auditoría del lockfile sin vulnerabilidades conocidas en esa revisión. | No es una auditoría actual ni certifica el código propio. |
| Autenticación y HTTP | Cuatro ejecuciones de Chromium contra Docker: cabeceras, cookies HttpOnly/SameSite=Lax, acceso, recuperación y revocación. | No cubre todos los navegadores ni escenarios de despliegue. |
| Intentos y borradores | Cinco repeticiones reales con dos cuentas: acceso cruzado rechazado, identidad propia y revisiones conservadas. | Los intentos eran fixtures sintéticos; no nuevas evaluaciones de Piston. |
| Diagnósticos | Ocho pruebas focalizadas con código real y dobles de sesión/base/runtime; cierre concurrente e idempotencia comprobados. | Sin E2E real de diagnósticos, PostgreSQL, cookies ni transporte de acciones en ese flujo. |
| Restauración | 22 tablas públicas con nombres, recuentos y huellas iguales entre origen previo, copia y origen posterior; copia temporal eliminada. | No comprueba roles, secuencias, otros esquemas/versiones ni acceso desde una app restaurada. |
| Piston | Cinco sondas reales y ocho pruebas del adaptador, sin omisiones. | No certifica ausencia de escapes o comportamiento bajo carga. Detalles en [runner-security.md](runner-security.md). |

Los fixtures temporales de las pruebas reales se retiraron. Las trazas de fallos
pueden contener información temporal y deben permanecer privadas. Una prueba
omitida o con dobles no se considera una comprobación real aprobada.

## Riesgos aceptados y fuera de alcance

- **ACL de Windows:** revisión omitida por decisión del usuario, no resuelta.
  Persiste el riesgo de acceso local a secretos, correo y respaldos. No cambiar
  permisos sin acordar qué usuarios necesitan conservar acceso.
- **Piston:** sigue privilegiado y sin presupuesto global Docker de memoria,
  CPU/PIDs. Los límites por trabajo y la concurrencia no equivalen a un techo
  global ni a una garantía absoluta de aislamiento.
- **Internet:** exigiría HTTPS, orígenes/proxy explícitos, recuperación privada al
  titular, privilegios mínimos de base, límites distribuidos y reevaluación de
  la frontera del ejecutor. El contador compartido solo está pensado para uso local.
- **Docker:** las modificaciones de código/configuración requieren reconstrucción
  o recreación manual según corresponda; una prueba de código no actualiza la
  imagen existente. Nunca iniciar servicios para verificar sin autorización.
