# Sistema de movimiento de Itera

## Intención

Relacionar control, superficie y resultado sin distraer de la escritura de código.
Se aplican principios de HIG a una aplicación web, no convenciones nativas de macOS:
`motion.md › Best practices`: “Add motion purposefully, supporting the experience
without overshadowing it.” `motion.md › Providing feedback`: “Let people cancel motion.”
Referencias locales en `.agents/skills/apple-design/references/hig/`.

## Base compartida

Sin dependencias nuevas ni APIs experimentales de React/Next. CSS y Web Animations
API comparten tiempos verificados por `tests/motion.test.ts`:

| Familia | Tiempo | Aplicación |
| --- | --- | --- |
| Respuesta | 120 ms | Pulsación y cambios de control |
| Despliegue | 200 ms | Detalles, filtros, menús y pestañas |
| Navegación | 200 ms | Cambio breve del contenido principal |
| Apertura de panel | 320 ms | Superficie desde su activador |
| Cierre de panel | 220 ms | Regreso al origen |

Curva: `cubic-bezier(.2, .8, .2, 1)`, sin rebotes. Tokens CSS en `globals.css`;
constantes y geometría en `src/lib/motion.ts`.

## Cobertura

- **Configuración y cuenta:** la ruta interceptada `@panel/(.)configuracion`
  conserva el contexto anterior, también desde el taller. Avatar y enlace lateral
  registran su origen. La superficie crece hacia un panel centrado en escritorio
  o una hoja de ancho completo en móvil; su contenido aparece sin escalar letras.
  Escape, cierre y exterior vuelven al historial anterior. El foco retorna al origen.
  Recargar o abrir `/configuracion` directamente muestra la página completa.
- **Bienvenida:** el registro usa deliberadamente navegación de documento hacia
  `/configuracion?bienvenida=1`, evitando interceptar el primer recorrido de cuenta.
- **Ediciones pendientes:** el formulario del panel guarda nombre, lenguaje y nivel
  en `sessionStorage`, por cuenta y pestaña. Cerrar no guarda en PostgreSQL. Reabrir
  restaura la edición; guardar correctamente elimina la copia temporal. No se
  almacenan contraseñas ni se cambian las reglas de borradores de código.
- **Navegación:** `MotionRegion` anima brevemente el contenido principal del shell
  y los formularios de acceso, registro y recuperación, sin usar claves para
  remontar sus hijos. La barra lateral cambia de ancho suavemente. El menú móvil
  usa una entrada lateral en lugar de expandirse desde un punto.
- **Catálogo:** `next/form` mantiene navegación cliente y los filtros en la URL,
  con estado de búsqueda pendiente. Se actualiza la región de resultados;
  los filtros móviles expanden y contraen su espacio, sin desmontar los campos.
- **Rutas e inicio:** transición de contenido al navegar, enlaces de módulos con
  desplazamiento suave y barras que interpolan valores reales. No hay cascadas
  de tarjetas ni barras que se reinicien artificialmente desde cero.
- **Ayudas, pistas y confirmaciones editoriales:** usan el mismo `Dialog` con
  origen. Cada pista nueva expande su propio espacio sin remontar las anteriores.
  La confirmación de restablecer el código vuelve al control de opciones,
  que sigue disponible después de cerrar el menú. Sin origen visible, la superficie
  usa una variación mínima de escala y fundido, no coordenadas obsoletas.
- **Teoría, restricciones, errores comunes, atajos y casos de prueba:** el controlador
  compartido anima la altura de los `details` nativos, permite invertir el gesto
  y conserva sus resúmenes y operación por teclado. El menú de opciones se excluye
  de esta lógica de altura y se despliega desde su esquina superior derecha.
- **Editor:** la presentación de paneles móviles cambia sin remontar Monaco.
  Los resultados contraídos recuperan espacio con transición de altura donde
  el navegador lo admite; al arrastrar el separador no hay interpolación atrasada.
- **Ejecución:** transición localizada entre espera, error y resultado, sin retrasar
  peticiones ni revelar casos ocultos. Autoguardado conserva sus mensajes legibles;
  no tiene un bucle animado en cada pulsación. La demo anima solo el nuevo resultado.
- **Preferencias y administración:** tema con transición breve de superficies,
  indicador deslizante en las pestañas administrativas, cambio de contenido y
  feedback localizado de guardado, validación, publicación y errores.

## Accesibilidad y compatibilidad

- `prefers-reduced-motion` elimina los desplazamientos y transformaciones JS y
  acorta las transiciones CSS. Cambiarlo durante una apertura termina las
  animaciones finitas sin intentar terminar indicadores infinitos de carga.
- Radix conserva modalidad, foco atrapado, Escape y semántica de título/descripción.
  El fondo continúa inerte; el botón de cierre no depende del scroll del formulario.
- El cierre de Configuración espera únicamente su transición de salida antes de
  volver; no retrasa el guardado ni otras operaciones. Atrás del navegador puede
  retirar la ruta inmediatamente: no se intercepta ni se bloquea la navegación nativa.
- Las transiciones espaciales usan transform/opacity. Solo los desplegables pequeños,
  el ancho de navegación y la altura de resultados animan dimensiones. Monaco no
  se incluye en una animación de tamaño al escribir; se mantienen sus temas locales.
- Si falta Web Animations, el panel aparece y cierra sin la transformación. La
  interpolación de resultados se habilita con `@supports`; los detalles conservan
  funcionamiento nativo sin JavaScript.
- No se habilita View Transitions experimental ni una transformación compartida
  de títulos entre rutas. La alternativa estable es el fundido/desplazamiento breve
  del destino; no se conservan capturas que puedan ocultar contenido o foco.

## Verificación

Pruebas específicas en `tests/e2e/motion.spec.ts`: geometría de origen y destino,
ambos temas en 390/1440 px, cerrar/reabrir, historial, copia temporal, guardado,
recarga como página completa, foco atrapado y restaurado, conservación del nodo de
Monaco, doble pulsación en detalles y movimiento reducido inicial y sobrevenido.
Las capturas locales `motion-settings-*` esperan el fin de las animaciones.

La suite E2E usa el doble HTTP de Piston: no demuestra ejecución ni aislamiento
reales. Otros navegadores, lectores de pantalla y la fluidez en dispositivos físicos
requieren revisión manual; las pruebas de Chromium no garantizan 60 fps.
