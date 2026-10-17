# Impeccable en Itera

`impeccable` es una skill de dirección de diseño para agentes (versión 4.6.0,
motor 0.1.15). Aporta un flujo de contexto —`PRODUCT.md` y `DESIGN.md`—, 24
comandos de diseño y un detector determinista de 59 reglas sobre la interfaz.
Este documento registra qué se instaló, qué se midió y en qué orden se piensa
usar. No describe cambios de interfaz ya acordados.

## Instalación

| Elemento | Ruta | Nota |
| --- | --- | --- |
| Skill | `.opencode/skills/impeccable/` | `npx impeccable install --providers=opencode --scope=project` |
| Motor | `.opencode/skills/impeccable/scripts/bin/windows-x64/impeccable.exe` | Local al proyecto; `~/.impeccable` no existe |
| Comando | `.opencode/commands/impeccable.md` | Invoca `/impeccable` |
| Ignorados | `.gitignore`, bloque `impeccable-ignore` | Salida efímera de `.impeccable/` |

- OpenCode descubre `.opencode/skills` con la precedencia más alta y conserva
  `.agents/skills` intacto; los identificadores no chocan.
- Nada de esto se versiona: `.opencode/` y `.agents/` siguen sin seguimiento, como
  ya estaban.
- Dos ajustes al comando instalado: `subtask: true` pasaba la conversación a una
  sesión hija, que no puede entrevistar al usuario en `init` —ahora es
  `subagent: false`—; y `skill({ name: … })` pasa a `skill({ id: … })`, la forma
  que lee OpenCode V2. `npx impeccable update` reescribe el archivo, así que hay
  que reaplicar los dos cambios tras cada actualización.

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

Orden propuesto de mayor a menor valor, con los comandos que mejor encajan:

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

## Decisiones pendientes

1. Telemetría. Por defecto, `impeccable` envía un registro anónimo al elegir
   dirección visual; nunca envía código ni `PRODUCT.md`. Propuesta: desactivarla
   con `"telemetry": false` en `.impeccable/config.json`.
2. `live` y `generate`: ¿se habilitan para iterar en el navegador?
3. ¿Se versionan `PRODUCT.md`, `DESIGN.md` y `.impeccable/critique/*.md`?
4. Alcance de la fase 3: todas las superficies o empezar por portada y taller.
5. Hallazgo `side-tab`: ¿retirar, sustituir o exceptuar?
