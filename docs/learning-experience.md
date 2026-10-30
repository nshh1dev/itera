# Continuidad y práctica

## Estados compartidos

- **Sin empezar:** no hay borrador ni ejecución en ese lenguaje.
- **En progreso:** existe un borrador o un intento, incluso de ejemplos, sin
  finalización registrada.
- **Resuelto:** existe `Progress.firstPassedAt`. Un fallo posterior no elimina
  la finalización. La clave sigue siendo usuario, ejercicio y lenguaje; entrar
  desde una ruta o desde el catálogo no duplica el progreso.

La actividad considera versiones anteriores de la misma identidad. Los borradores
de invitado siguen siendo locales; el catálogo de la cuenta utiliza PostgreSQL.
No se reinterpretan las identidades retiradas como ejercicios del catálogo nuevo.

## Inicio y contexto

«Tu siguiente paso» busca primero el pendiente iniciado con actividad más reciente
del lenguaje seleccionado. Después continúa según su contexto de ruta o su orden
curricular; sin actividad, utiliza el punto de partida del perfil y, como respaldo,
el primer pendiente disponible. La lista de Rutas usa esta misma recomendación
para destacar la ruta correspondiente; no calcula otra a partir de visitas.

Las flechas anterior/siguiente recorren posiciones contiguas de la ruta activa
o del catálogo del lenguaje, incluidos los ejercicios resueltos. No se confunden
con recomendaciones por similitud. Al terminar la secuencia, los resultados ofrecen
volver a la ruta o al catálogo, sin reiniciar el recorrido silenciosamente.

La portada invita a los visitantes a Desde cero en Python, sin depender de un
ejercicio histórico retirado; las cuentas acceden a su continuación desde Inicio.
El editor explica antes de escribir que ejecutar y guardar progreso requiere
cuenta; explorar y conservar un borrador local sigue disponible sin sesión.

`PracticeContext` conserva por usuario, ejercicio y lenguaje la última visita y
el origen validado: `pathSlug` para una ruta o `null` para práctica libre. No
contiene código ni concede progreso. Se escribe desde una acción autenticada al
abrir el editor. Si se retira una ruta, su contexto deja de orientar las nuevas
recomendaciones. El borrado de cuenta o ejercicio elimina sus contextos.

Para una instalación existente, ejecutar `npm run db:migrate` antes de iniciar
la aplicación con este cambio. La migración añade una tabla; no modifica
borradores, soluciones, intentos ni finalizaciones existentes.

## Pantallas

- **Editor:** enunciado, ejemplos, objetivos y teoría esencial visibles; repaso previo
  opcional plegado, pistas de una en una y solución voluntaria en un diálogo. Consultar
  ayuda no completa el ejercicio. Los diagnósticos técnicos quedan disponibles
  detrás de una orientación breve. Se conservan paneles ajustables, atajos,
  preferencias, pestañas móviles y sincronización optimista de borradores.
- **Inicio:** una recomendación principal, accesos secundarios a ruta y práctica
  libre y resumen del lenguaje de continuidad.
- **Catálogo:** filtros automáticos, búsqueda por conceptos editoriales y orden
  curricular, dificultad o duración. Cambiar filtros reinicia la página; quitar
  uno conserva el resto y el lenguaje. En móvil, las opciones se despliegan.
- **Rutas:** módulos independientes, recomendado abierto y «Empezar/Continuar»
  en la fila del ejercicio, sin tarjeta duplicada de siguiente paso; integradores publicados
  al cierre. No hay bloqueos ni casillas que simulen progreso. Si falta un
  integrador publicado se explica, sin inventar contenido.
- **Progreso:** lenguaje independiente de la preferencia; primero muestra el
  resumen, la continuación compartida con Inicio y el historial por ejercicio.
  El historial precede a las rutas también en el orden del documento y en móvil.
  Las categorías y la interpretación se consultan en desplegables secundarios.
  Se conservan el avance por ruta y las versiones anteriores. Los
  intentos se cargan de diez en diez mediante una acción que exige la cuenta
  actual y devuelve solo su código y resultado global, nunca casos ocultos.
  Los archivos y borradores históricos son secundarios y se paginan de veinte
  en veinte, sin descartar registros más antiguos.

Resolver mide finalización de práctica, no dominio. La interfaz evita interpretar
los intentos, la ayuda consultada o las barras de avance como una evaluación de
conocimientos.

## Orientación y recuperación

Los resúmenes de habilidades también se incluyen en la búsqueda del catálogo.
Las rutas retoman el pendiente iniciado más reciente y señalan su módulo; sus
cierres y repasos orientan sin bloquear ni conceder progreso.

La recuperación conserva ejercicio, lenguaje y ruta al volver a iniciar sesión.
Los mensajes distinguen borradores del navegador, datos de la instalación y
recuperación local de cuenta, sin prometer correo enviado ni copia en la nube.
Progreso distingue visitantes, cuentas nuevas y cuentas con borradores sin intentos.
