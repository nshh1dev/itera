# Rediseño integral de Itera

## Dirección

Un taller de programación claro, tranquilo y preciso: elegir qué practicar,
escribir una idea y entender el resultado. La relación **entrada → código →
resultado** conecta la portada con el espacio de práctica. Se conservan la paleta
monocromática, el azul para acciones, el verde para éxito, Geist y Geist Mono
locales. No se añaden dependencias, materiales translúcidos ni servicios externos.

Se priorizan claridad, jerarquía, legibilidad y feedback. Itera sigue siendo una
web: no se imitan ventanas nativas ni se eliminan los controles de apariencia
del navegador.

## Cambios

- **Sistema:** escala relativa de texto, controles que crecen con sus etiquetas,
  foco con margen de desplazamiento, colores secundarios con contraste suficiente
  y variantes de contraste aumentado y colores forzados.
- **Navegación:** grupo «Tu práctica», cabecera de altura flexible, títulos completos y objetivos
  táctiles ampliados según el tipo de puntero, conservando el modo compacto de
  escritorio y la preferencia de la barra lateral.
- **Portada:** nueva composición con titular central y demostración ancha; código
  y entrada/resultado en paralelo en escritorio y apilados en móvil. Demo legible
  sin encoger el código y sin la nota decorativa repetida.
- **Inicio:** bloque de continuidad dominante con orientación de práctica, ejercicios
  y rutas en paralelo, progreso y actividad en una franja secundaria. Explicación
  específica para visitantes y estado de catálogo vacío.
- **Catálogo:** herramientas de búsqueda en columna lateral y lista de resultados
  sobre una superficie propia en escritorio; en móvil se apilan. Búsqueda etiquetada,
  filtros conservados en URL, estados expresados
  también como texto y números reservados para el orden real de las rutas.
- **Rutas:** mapa de cuatro rutas, en dos columnas cuando hay espacio. Dentro de
  cada ruta, índice de módulos y contenido en paralelo, con siguiente ejercicio
  accesible desde la cabecera. No se añaden bloqueos ni se altera la autoevaluación.
- **Práctica:** hoja del reto y ejemplos diferenciada del material de consulta;
  lectura educativa a 16 px iniciales, acceso «Ver pistas», atajos en un único
  desplegable y acciones entre código y resultados. Se mantienen los separadores
  ajustables, las preferencias, el editor sencillo y Monaco local.
- **Resultados:** esperado y obtenido en columnas adaptables; se conserva la
  primera diferencia del navegador y solo se detallan los casos visibles.
- **Progreso y actividad:** resumen horizontal, categorías e historial en columnas,
  acceso a ejercicios pendientes y estados junto al intento correspondiente, sin
  interpretar finalización como dominio.
- **Cuenta y configuración:** cuenta con contexto local y formulario en dos columnas
  en escritorio, solo formulario en móvil. Configuración separa perfil y práctica
  de apariencia y datos locales. Títulos de acción claros y errores asociados.
- **Administración:** guía editorial y contenido en columnas en ventanas amplias,
  guardado separado de publicación, listado adaptable, versión y estado diferenciados, estado
  vacío y explicación del proceso guardar → validar → publicar. No cambian las
  acciones protegidas ni la validación editorial.
- **Errores:** mensajes directos y acciones de recuperación.

El sistema de movimiento que acompaña al rediseño se documenta aparte en
`docs/motion.md`: componentes locales sobre Motion y Radix, tiempos compartidos,
transiciones breves de navegación y respeto de
`prefers-reduced-motion`.

## Fundamento de diseño

### Ajuste de Inicio (23 de octubre de 2026)

El dashboard concentra la decisión en un siguiente ejercicio compacto, con resumen
de la habilidad, lenguaje, contexto, tiempo orientativo y motivo de recomendación.
«Continuar» se reserva para práctica pendiente; una visita sin borrador ni intentos
muestra «Empezar». Un catálogo terminado invita a explorar, no a empezar de nuevo
un ejercicio ya resuelto.

El avance corresponde a la ruta del ejercicio destacado o a la última ruta visitada
en el lenguaje preferido; sin contexto previo se usa la ruta recomendada del perfil.
El recuento incluye solo ejercicios publicados de esa ruta y completados en ese
lenguaje. Una ruta terminada conserva su estado, sin sustituirse silenciosamente
por otra. Las estadísticas globales siguen en Progreso.

«Seguir mi ruta» y «Práctica libre» son accesos secundarios explicados, no botones
que compiten con la acción principal. La actividad reciente contiene como máximo
tres ejercicios distintos del destacado, con estados Resuelto/Pendiente y acceso
al historial. Se retira la explicación permanente del nivel y su enlace de ajuste;
esas preferencias permanecen en Configuración → Aprendizaje.

Las reglas de presentación se prueban en `tests/dashboard.test.ts`; los recorridos
de cuenta temporal, continuación del borrador y capturas están en
`tests/real/dashboard.spec.ts`. No se cambia el editor ni la forma de conceder progreso.

### Referencias del rediseño inicial

Se tomaron como referencia las Human Interface Guidelines de Apple: legibilidad,
jerarquía visual, adaptación al tamaño del texto, redacción orientada a acciones,
feedback de estado y marca subordinada al contenido. Estas decisiones no requieren
una skill instalada para mantenerse.

La agrupación por módulos, la ausencia de números en el catálogo y el tratamiento
de entrada/código/resultado son decisiones específicas de Itera, no exigencias de
una plataforma Apple.

## Verificación y límites

`tests/design-tokens.test.ts` calcula contraste sRGB de los tokens de texto sobre
las superficies principales y de las etiquetas de las acciones primarias en ambos
temas. No sustituye una auditoría de cada píxel renderizado, del tema de sintaxis
de Monaco ni de todos los estados de interacción.

`tests/redesign.test.ts` comprueba numeración contextual, estados textuales y que
la nueva comparación no renderiza datos de casos ocultos, en modos función y
programa.

`tests/e2e/redesign.spec.ts` recorre portada, inicio, catálogo, rutas, progreso y
cuenta a 320, 390, 768, 1024 y 1440 px en claro y oscuro, con movimiento reducido.
Comprueba reflujo al ampliar el texto raíz al 200 %, interacción de la demo y
retorno de foco en ayudas. La ampliación del texto raíz **no equivale** a probar
zoom nativo del navegador ni un lector de pantalla real.

La suite E2E existente cubre además guardado, concurrencia de borradores, registro,
recuperación, progreso, Monaco, navegación móvil y publicación editorial con un
doble HTTP de Piston. No verifica aislamiento ni ejecución real.

El zoom nativo de Chromium se verifica por separado; preparación y límites en
[browser-interaction.md](browser-interaction.md). Los resultados se resumen en
[verification.md](verification.md). No se declara conformidad WCAG completa ni
evaluación con lectores de pantalla, dispositivos físicos o todos los navegadores.
