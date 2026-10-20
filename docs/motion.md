# Movimiento con UIArc

## Decisión

El sistema anterior de CSS y Web Animations fue sustituido por componentes
gratuitos de [Arc](https://uiarc.dev/), adaptados a los tokens de Itera.
No se importan `foundation.css`, temas adicionales ni componentes Pro.
`motion` y `@radix-ui/react-accordion` son las nuevas dependencias de ejecución.
Todo el código se sirve localmente; el navegador no consulta el registro de Arc.

La fuente y licencia MIT de Elia Kuratli están identificadas en
`src/components/arc/`. Los componentes de `src/components/ui/` conservan la API
de Itera, los tamaños compactos y la integración Radix existente.

## Componentes y adaptaciones

| Fuente gratuita | Uso en Itera | Adaptación |
| --- | --- | --- |
| [Button](https://uiarc.dev/components/button/markdown) | Acciones, formularios y enlaces | Variantes existentes, `asChild`, etiquetas multilínea sin medir un ancho fijo, carga sin perder foco |
| [Tabs](https://uiarc.dev/components/tabs/markdown) | Pistas, administración, selección de navegación y secciones móviles | Indicador compartido acotado por `LayoutGroup`; formularios persistentes sin animar su altura |
| [Dialog](https://uiarc.dev/components/dialog/markdown) | Configuración, ayudas, confirmaciones y navegación móvil | Mantiene títulos/descripciones originales; entrada lateral para navegación; cierre de ruta después de salir |
| [Accordion](https://uiarc.dev/components/accordion/markdown) | Ayudas, teoría, restricciones, resultados y datos locales | `Disclosure` independiente, contenido inerte al cerrar, sin borrar su estado |
| [Progress](https://uiarc.dev/components/progress/markdown) | Inicio, rutas y categorías | Valor real desde el primer render, sin reiniciar a cero ni convertir la barra en celebración |

Los presets de `arc/motion-tokens.ts` proceden del registro gratuito de Arc:
`snappy` para pulsaciones, `smooth` para paneles y `morph` para indicadores.
Los tiempos CSS complementarios en `arc/motion.css` corresponden a `fast`
(160 ms) y `standard` (240 ms), con la curva estándar de Arc.

## Intención y cobertura

- El momento protagonista es probar una entrada y ver su resultado en la demo,
  no una cascada de apariciones al desplazarse por la portada.
- El movimiento responde a pulsar, seleccionar, abrir, cerrar o recibir un
  resultado. No retrasa peticiones, guardado, evaluación ni navegación.
- `MotionRegion` presenta cambios de contenido con un fundido localizado, sin
  claves que desmonten sus hijos. Abrir Configuración sobre el taller conserva
  el editor. Su activador se recuerda únicamente para devolverle el foco.
- `Disclosure` mantiene el contenido montado; los paneles cerrados son inertes
  y quedan fuera del árbol accesible. Las aperturas pueden invertirse.
- El menú del editor conserva cierre exterior, Escape y devolución de foco.
- Los filtros mantienen todos sus campos y el envío nativo. Los selectores
  siguen usando la mejora progresiva `appearance: base-select`.
- La navegación móvil conserva su entrada temporal de historial y su cierre
  con Atrás. Configuración directa sigue siendo una página completa.
- Los borradores pendientes del formulario siguen en `sessionStorage` por
  cuenta. Las preferencias del editor y el código no cambian de contrato.
- Se han retirado animaciones globales sobre `role=status`/`role=alert` y el
  controlador que interceptaba todos los `details` del documento.

## Menos texto

La portada prioriza demo, práctica y rutas. Las pantallas internas eliminan
introducciones repetidas y usan nombres breves. Las explicaciones secundarias
se abren bajo demanda. Se conservan enunciados, teoría, ejemplos, objetivos,
restricciones, pistas, soluciones, advertencias destructivas y errores útiles.

## Accesibilidad

`MotionConfig reducedMotion="user"`, las ramas de `useReducedMotion` y la media
query CSS eliminan desplazamientos, escalas, interpolación de altura y bucles
cuando se solicita menos movimiento. Los estados siguen siendo legibles.
El hook local de preferencia usa `useSyncExternalStore` para responder también
a cambios sobrevenidos; el hook de la versión instalada de Motion solo lee
el valor inicial. El render de servidor adopta la opción sin movimiento.
La consulta y su listener nativo se comparten entre los controles, en lugar de
crear uno por componente y consultar `matchMedia` en cada lectura del estado.
La modalidad, Escape, foco y semántica de pestañas y acordeones los proporciona
Radix. Los controles de carga conservan su nombre accesible y bloquean la acción
sin retirar el foco.

## Optimización posterior

La barra lateral cambia su ancho de una vez, sin interpolar ancho ni padding:
Monaco deja de recalcular su disposición en cada fotograma. Los botones
conservan la pulsación y el cambio de etiqueta, pero sin el filtro de desenfoque.

Medición local en Chromium, desarrollo, mismo ejercicio y expansión de la
navegación (`tests/e2e/performance.spec.ts`):

| Trabajo observado | Antes | Después |
| --- | ---: | ---: |
| Llamadas a `matchMedia` para movimiento reducido | 242 | 3 |
| Suscripciones activas a esa preferencia (incluye Motion) | 27 | 3 |
| Notificaciones de tamaño del editor (incluye la inicial) | 15 | 2 |

No son tiempos de carga ni una mejora porcentual de velocidad. Los bytes de
desarrollo dependen de la compilación y no se usan para afirmar ahorro de red.
La prueba comprueba límites de suscripciones y reajustes para evitar regresiones.

## Estado de verificación

La revisión posterior autorizada ejecutó pruebas unitarias, tipos, build y
recorridos de navegador. Resultados actuales y límites en
[verification.md](verification.md#revisión-de-uiarc-y-rendimiento-20-de-octubre-de-2026).

Las pestañas conservan el scroll horizontal para teclado/pantallas estrechas,
sin barra visible ni scroll vertical durante el movimiento del indicador. Los
selectores del catálogo desactivan los fallbacks hacia arriba y la selección
automática del área más grande; conservan el ajuste lateral de `base-select`.

El diálogo de pistas se ancla por arriba, en lugar de recentrarse al variar su
altura. El contenido crece hacia abajo, con scroll interno al alcanzar el límite
de pantalla. Sus dos paneles permanecen montados mientras el diálogo está abierto:
volver a Pistas no repite la aparición de pistas ya descubiertas. Solo el panel
activo es visible y accesible; cerrar y reabrir conserva la animación del diálogo.

### Entrega inicial (histórico)

Por petición expresa del usuario, no se ejecutaron pruebas, lint, comprobación
de tipos, build, detector de diseño ni aplicación. La revisión fue estática:
lectura de código, referencias, selectores y diff. Las expectativas existentes
se adaptaron al sistema nuevo, pero no se han ejecutado.

Pendiente verificar en navegador ambos temas, móvil/escritorio, navegación por
teclado, cierres rápidos, movimiento reducido inicial y sobrevenido, foco de
Configuración y conservación del nodo/cursor de Monaco. No se afirma fluidez
medida, accesibilidad auditada ni ejecución real comprobada.

Durante la instalación, npm informó de cinco vulnerabilidades de severidad
alta. No se aplicó `audit fix --force` ni se ampliaron dependencias ajenas a esta
migración. Es un aviso pendiente de diagnóstico separado, no una prueba aprobada.
