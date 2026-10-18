# Impeccable en Itera

`impeccable` es una skill de dirección de diseño para agentes (versión 4.6.0,
motor 0.1.15). Aporta un flujo de contexto —`PRODUCT.md` y `DESIGN.md`—, 24
comandos de diseño y un detector determinista de 59 reglas sobre la interfaz.
Este documento registra qué se instaló, qué se midió y en qué orden se piensa
usar. Los cambios concretos de interfaz llegan en la implementación.

## Instalación

| Elemento | Ruta | Nota |
| --- | --- | --- |
| Skill | `.opencode/skills/impeccable/` | `npx impeccable install --providers=opencode --scope=project` |
| Motor | `.opencode/skills/impeccable/scripts/bin/windows-x64/impeccable.exe` | Local al proyecto; `~/.impeccable` no existe |
| Comando | `.opencode/commands/impeccable.md` | Invoca `/impeccable` |
| Configuración | `.impeccable/config.json` | `"telemetry": false` |
| Ignorados | `.gitignore`, bloque `impeccable-ignore` | Salida efímera de `.impeccable/` |

- OpenCode descubre `.opencode/skills` con la precedencia más alta y conserva
  `.agents/skills` intacto; los identificadores no chocan.
- La skill y su motor no se versionan: `.opencode/` y `.agents/` siguen sin
  seguimiento, como ya estaban.
- Dos ajustes al comando instalado: `subtask: true` pasaba la conversación a una
  sesión hija, que no puede entrevistar al usuario en `init` —ahora es
  `subagent: false`—; y `skill({ name: … })` pasa a `skill({ id: … })`, la forma
  que lee OpenCode V2. `npx impeccable update` reescribe el archivo, así que hay
  que reaplicar los dos cambios tras cada actualización.
- La telemetría queda desactivada por proyecto, no por máquina: `impeccable
  telemetry status` confirma «off (`telemetry: false` in `.impeccable/config.json`)».
  El sorteo de direcciones sigue funcionando; solo se le pide a la API que no lo
  registre.

## Diagnóstico inicial

`impeccable context` informa de que no hay `PRODUCT.md` ni `DESIGN.md`, pero sí
una implementación visual vigente. Por eso `init` va antes de cualquier superficie
nueva; las refinaciones acotadas pueden tomar el código actual como autoridad.
`init` y `document` escribirían `PRODUCT.md` y `DESIGN.md` en la raíz.

`impeccable detect src` — 99 archivos `.css`, `.ts` y `.tsx`, coincidencia por
expresión regular: **un hallazgo**.

| Regla | Ubicación | Detalle |
| --- | --- | --- |
| `side-tab` (familia *slop*) | `src/app/globals.css:591` | `.landing-margin-note { border-left: 2px solid var(--primary) }` |

El motor avisa de que las reglas que necesitan una página renderizada —contraste,
tamaño de texto, objetivos táctiles— no corren sobre archivos. El recuento real
sale de escanear la URL con el servidor en marcha.

`impeccable doctor` no encuentra desajustes entre los artefactos del proyecto y lo
que lee esta versión.

## Cómo se usa

En el chat: `/impeccable <comando> [objetivo]`. También se puede cargar la skill
por identificador (`@impeccable`) o llamar al motor directamente:

```
.opencode\skills\impeccable\scripts\impeccable.cmd <verbo> [objetivo]
```

Verbos de diagnóstico: `context`, `signals`, `detect`, `doctor`.

## Plan por fases

### Fase 1. Contexto (bloqueante, sin tocar interfaz)

1. `/impeccable init` → `PRODUCT.md`. Exige una ronda corta de preguntas sobre
   usuarios, propósito, posición, restricciones y evidencia. No decide nada
   visual.
2. `/impeccable document` → `DESIGN.md` y `.impeccable/design.json`, que registran
   el sistema vigente: paleta, Geist y Geist Mono, radios, sombras, superficies,
   movimiento y estados. Solo lee código.

Sin esta fase, `shape` y cualquier superficie nueva quedan bloqueados; las
refinaciones acotadas, no.

### Fase 2. Medir antes de tocar

- `/impeccable critique` sobre las superficies principales, con informes en
  `.impeccable/critique/*.md` (versionados). Es la lista de trabajo que `polish`
  usa después.
- `/impeccable audit` con el servidor levantado, para que el detector lea la
  página renderizada.
- Resolver el hallazgo `side-tab`: retirar el borde, sustituirlo por otro recurso
  o declararlo excepción con un comentario `impeccable-disable` cuando el borde
  sea una decisión deliberada.

### Fase 3. Superficie por superficie

Una sola pasada por las diez superficies, en este orden de mayor a menor valor,
con los comandos que mejor encajan en cada una:

| Superficie | Modo | Comandos |
| --- | --- | --- |
| `/` portada | Persuade | `layout`, `typeset`, `polish` |
| `/iniciar-sesion`, `/registro`, `/recuperar-cuenta`, `/restablecer-contrasena` | Operate | `clarify`, `polish` |
| `/ejercicios/[slug]` taller | Operate | `polish`, `harden` |
| `/ejercicios` catálogo y filtros | Operate | `distill`, `clarify` |
| `/inicio` | Operate | `distill`, `onboard` |
| `/rutas`, `/rutas/[slug]` | Read | `clarify`, `layout` |
| `/configuracion` (panel interceptado) | Operate | `polish`, `adapt` |
| `/progreso` | Operate | `onboard`, `distill` |
| `/admin`, `/admin/ejercicios/[slug]` | Operate | `polish` acotado |
| `not-found`, `error` | Read | `clarify`, `harden` |

Al ser una pasada completa, conviene cerrar cada superficie con sus pruebas antes
de pasar a la siguiente: así una regresión se atribuye sin ambigüedad.

### Fase 4. Movimiento y detalle

- `/impeccable animate` como revisión de `docs/motion.md`, no como reescritura:
  comprobar que hay un momento autoral y no la misma entrada en cada sección.
- `/impeccable delight` solo en la portada, un único momento.
- `colorize` queda descartado: la paleta monocromática con azul de acción y verde
  solo para éxito es una decisión firme del proyecto.

### Fase 5. Cierre

- `/impeccable polish` final, que cierra el backlog de `critique`.
- `detect` contra la URL de producción, además del escaneo de archivos.
- `npm run lint`, `npm run typecheck`, `npm test` y `npm run test:e2e`: las
  comprobaciones de `docs/verification.md` siguen siendo la puerta.

## Guardarraíles

- La skill propone; las decisiones del proyecto mandan: Geist y Geist Mono, paleta
  monocromática con azul de acción, verde solo para éxito, `prefers-reduced-motion`,
  foco visible, Escape e historial. Sin dependencias nuevas.
- Cada cambio de interfaz cierra con las comprobaciones de `docs/verification.md` y
  sin degradar el tema opuesto.
- `live` y `generate` abren su propio navegador y escriben en `.impeccable/live/`:
  solo con el servidor en marcha y autorización explícita.
- El detector es evidencia mecánica, no prueba de calidad: no sustituye mirar la
  experiencia en los tamaños reales.

## Decisiones acordadas

1. Telemetría desactivada por proyecto (`.impeccable/config.json`).
2. Fase 3 en una sola pasada por las diez superficies.
3. Se versionan `PRODUCT.md`, `DESIGN.md`, `.impeccable/config.json` y
   `.impeccable/critique/*.md`; el resto de `.impeccable/` es salida efímera.
4. `live` y `generate` se habilitan cuando lleguemos a una superficie concreta.
5. El hallazgo `side-tab` se resuelve en la fase 2, al medir la portada.

## Primera entrega integrada · 18 de octubre de 2026

- Contexto de producto y sistema visual documentados en `PRODUCT.md`, `DESIGN.md`
  y `.impeccable/design.json`. Crítica archivada en `.impeccable/critique/`.
- Aplicados ajustes acotados de portada, sesión, taller, catálogo, inicio, rutas,
  administración y página de error. No se ha rediseñado configuración ni progreso.
  El taller conserva la guía visible, con teoría cerrada y acceso al código antes
  de la referencia; no se agrupó toda la ayuda en un único desplegable.
- Publicar y ocultar requieren confirmación. Los tests del doble HTTP y de Piston
  real incluyen ese paso; la suite real no se ejecutó en este cierre.
- Revisado el movimiento existente, sin añadir efectos ni dependencias. La demo
  conserva su feedback localizado; no se añadió otro momento de celebración.
  Corregida la referencia de animación cancelada durante el remontaje del diálogo.
- Detector estático final: 37 avisos informativos (29 de tamaño, 8 de radio), sin
  `side-tab`. No equivalen a 37 defectos visuales confirmados ni a un escaneo del DOM.
- Verificación: lint sin errores (97 avisos en herramientas locales), typecheck,
  81 pruebas unitarias y build correctos. La suite E2E completa pasó 95/95 en
  desarrollo y la comprobación final sobre el build de producción pasó 95/95
  (`ITERA_E2E_PRODUCTION=1`). Hubo también intentos fallidos en desarrollo
  (arranque, navegación y registro), además de una ejecución interrumpida por
  el reinicio del entorno; no se contabilizan como aprobados. La pasada final
  incluye la corrección del diálogo y las confirmaciones administrativas.
- Capturas de Chromium revisadas en claro/oscuro y escritorio/móvil; la suite
  recorre reflujo en cinco anchos, ampliación del texto y navegación por teclado.
  No se ejecutó el detector sobre la URL de producción, ni una auditoría formal
  con lector de pantalla, dispositivos físicos o navegadores distintos de Chromium.

Esta entrega no cierra todos los hallazgos de la crítica: quedan, entre otros,
la reorganización completa de la ayuda, el historial del cajón de navegación y
la revisión del orden de encabezados de sesión. No se retiran filtros funcionales
ni se añade cancelación de evaluaciones como parte del pulido visual.

## Cierre del plan · continuación del 18 de octubre de 2026

Las cinco fases quedan implementadas dentro del alcance acordado. El registro
anterior describe la primera entrega, no el estado actual. Evidencia y decisiones
de cierre en [la auditoría final](impeccable-cierre.md).

- Ayuda reunida en «Contexto y ayuda», cerrada inicialmente, sin eliminar teoría,
  objetivos, referencias, restricciones ni errores comunes. Reto y ejemplos siguen
  visibles; pistas y código mantienen acceso independiente.
- Atrás cierra el menú móvil; Adelante lo reabre. Escape restaura el foco. Elegir
  un destino retira primero la entrada temporal para no reabrir el menú al volver.
- Los cuatro formularios de sesión presentan el h1 antes del contenido secundario
  en el DOM y visualmente. Configuración distingue cambios pendientes del guardado;
  progreso explica el primer intento y el lenguaje de los contadores.
- La demo de portada muestra una única sustitución numérica al probar una entrada.
  Se conserva la dirección visual y no se añaden dependencias ni nuevos efectos
  en las superficies operativas. Movimiento reducido usa tokens de duración cero
  y desactiva indicadores giratorios, no una anulación global de toda animación.
- Detector sobre producción en 390/1440 px: 10/9 avisos de tipografía Geist,
  conservada por marca. Detector estático: 37 avisos informativos (29 de tamaño,
  8 de radio), sin `side-tab`. No se silencian ni se presentan como fallos corregidos.
- Build, typecheck y 81/81 unitarias correctos; lint sin errores y con los 97 avisos
  previos de herramientas locales. E2E final completo sobre producción: **101/101**.
  Antes hubo pasadas fallidas por la carrera del router y selectores de pruebas;
  están corregidas y no se cuentan como aprobadas.
- Revisión visual de las diez superficies en claro/oscuro y 390/1440 px, más
  cobertura E2E de cinco anchos y ampliación de texto. Cuenta temporal eliminada.

No quedan implementaciones pendientes de este plan visual. Permanecen límites de
verificación: Piston real, lectores de pantalla, dispositivos físicos y otros
navegadores no se verificaron en esta continuación. No se declara conformidad WCAG
formal. Cancelar evaluaciones no forma parte del plan; conservar filtros útiles y
tipografía de marca son decisiones explícitas, no tareas pendientes ocultas.
