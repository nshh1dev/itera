# Qué cambió y dónde verlo

Con la aplicación iniciada manualmente en `http://127.0.0.1:3000`:

| Pantalla | Qué revisar |
| --- | --- |
| `/` | Portada abreviada, demo de suma con resultado animado, selector de lenguaje/nivel y ayuda «¿Cómo funciona?» |
| `/inicio` | Siguiente ejercicio, recomendaciones, rutas y barra de progreso sin introducciones repetidas |
| `/ejercicios` | Búsqueda, filtros que despliegan hacia abajo en Chromium y respuestas de carga en los botones |
| `/rutas` | Nombres breves y barras de progreso; abre una ruta para desplegar su información secundaria |
| `/progreso` | Categorías e historial; necesita una cuenta para guardar el avance |
| `/iniciar-sesion` y `/registro` | Formularios simplificados y carga sin perder el nombre del botón |
| Mi cuenta → Configuración | Panel animado sobre la pantalla actual, preferencias y ayuda de datos locales desplegable |
| `/configuracion` directamente | Página completa de preferencias, sin necesidad de abrir un panel |
| Un ejercicio | Contexto y ayuda, teoría, restricciones y errores comunes desplegables; pestañas de pistas/solución sin scrollbar visible y resultados por caso |
| Opciones del editor | Menú y confirmación de restablecimiento; conserva cierre con Escape y devolución de foco |
| `/admin` (administrador) | Acciones abreviadas, pestañas editoriales, guardado y confirmaciones de publicación |

## Movimiento compartido

- Botones: respuesta breve al pulsar y transición de etiqueta.
- Pestañas y navegación: indicador que sigue la selección.
- Diálogos y menú móvil: entrada/salida amortiguada.
- Ayudas: apertura progresiva sin borrar el estado interno.
- Progreso: cambio continuo del valor, sin empezar de cero al entrar.
- Cambios de contenido: fundido breve sin desmontar el editor.
- Ambos temas conservan la paleta de Itera. Todo se sirve localmente, sin
  descargar componentes desde UIArc durante el uso.
- La preferencia del sistema de reducir movimiento elimina los desplazamientos
  y bucles; también responde si se cambia con la aplicación abierta.

## Ajustes de rendimiento

Se comparte la suscripción a movimiento reducido y se retira el desenfoque de
las etiquetas. Expandir la navegación cambia el ancho una sola vez, evitando
que Monaco se redimensione durante toda la animación.

La medición local pasó de 27 a 3 suscripciones activas y de 15 a 2 notificaciones
de tamaño del editor en esa interacción. No equivale a una mejora global del
tiempo de carga. Más detalles en [motion.md](motion.md).

`npm run dev` compila cada ruta al abrirla por primera vez. Para usar el código
ya compilado localmente, ejecuta `npm run build` y después `npm start` con
PostgreSQL iniciado (`npm run db:start`) y el puerto 3000 libre. Sigue siendo
una aplicación local, no un despliegue. El build no migra ni inicializa contenido.

El contenido educativo y las reglas de evaluación no se han recortado ni
modificado. Consultar [verification.md](verification.md) para los resultados
de las comprobaciones y la distinción entre Piston real y el doble de pruebas.
