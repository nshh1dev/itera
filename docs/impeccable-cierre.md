# Cierre y auditoría de Impeccable · 18 de octubre de 2026

Auditoría técnica y revisión visual, no una nueva crítica heurística ni una
certificación de accesibilidad. Se mantiene la crítica original como registro
histórico, sin recalcular su puntuación ni atribuirle nuevas evaluaciones aisladas.

## Resultado por fase

| Fase | Resultado |
| --- | --- |
| Contexto | `PRODUCT.md`, `DESIGN.md` y `.impeccable/design.json` conservados |
| Medición | Crítica original archivada; detector inicial y final sobre producción; `side-tab` retirado en la primera entrega |
| Diez superficies | Implementación inicial más los ajustes de esta continuación; detalle abajo |
| Movimiento y detalle | Sistema existente preservado; sustitución numérica en portada; movimiento reducido localizado |
| Cierre | Detector de fuentes y DOM, capturas, lint, tipos, unitarias, build y E2E final |

## Diez superficies

| Superficie | Entrega acumulada y cierre |
| --- | --- |
| Portada | Demo funcional de código fijo, CTA al ejercicio, sin kicker; sustitución de `a` y `b` por los números introducidos tras pulsar «Probar entrada». Cambiar la entrada retira el resultado anterior; errores no muestran una suma obsoleta |
| Sesión y recuperación | Lenguaje directo, sin kicker; h1 del formulario antes de h2/h3 secundarios, también en escritorio. Se conservan los formularios y sus enlaces |
| Taller | Reto y ejemplos antes de «Contexto y ayuda», inicialmente cerrado. Se conservan todos sus contenidos y controles. Explicación de ejemplos frente a comprobación y del requisito de cuenta; guardado anunciado fuera de los paneles móviles |
| Catálogo | Búsqueda con contexto, filtros secundarios plegables en móvil, resultados separados; «Pendiente» visible en las filas |
| Inicio | Orientación de primer uso y siguiente ejercicio concreto; conserva recomendación, actividad y rutas sin duplicar tarjetas de métricas |
| Rutas | Índice de módulos, teoría y ejercicios; regresar al índice conserva el lenguaje en URL y en enlaces |
| Configuración | Página completa y panel interceptado conservados. Mensaje de cambios sin guardar, retirada del éxito al editar otra vez y explicación de recuperación local sin prometer correo SMTP |
| Progreso | Primera comprobación explicada, acceso al catálogo, lenguaje de los contadores y enlace a preferencias; actividad identificada como multilenguaje |
| Administración | Cabecera sin kicker redundante. Se conservan guardado de borrador y confirmaciones de publicación/ocultación de la entrega anterior |
| Error y 404 | Recuperación con salida al catálogo/inicio; instrucciones técnicas apartadas del mensaje principal. 404 sin un segundo rótulo redundante |

El armazón compartido añade historial al menú móvil: abrir crea una entrada
temporal en la misma URL, Atrás/Escape/cierre vuelven a la anterior, Adelante lo
reabre. Elegir un enlace consume esa entrada antes de navegar. La navegación
espera un turno tras `popstate` para no competir con la restauración de Next.

## Disposición de los hallazgos originales

- **Jerga, ayuda acumulada y registro sorpresa:** resueltos con redacción,
  agrupación cerrada y aviso antes de las acciones. Ejecutar y comprobar explican
  la diferencia entre casos visibles y evaluación completa con progreso.
- **Publicar/ocultar en un clic:** resuelto en la primera entrega con confirmaciones,
  conservadas y recorridas por la secuencia editorial E2E.
- **Región viva sobredimensionada:** el anuncio se limita a estado y recuento; los
  casos permanecen fuera. Distingue ejemplos correctos de progreso guardado.
- **Estado visible y semántica:** «Pendiente» es visible; h1 del taller y anuncio de
  guardado permanecen disponibles independientemente del panel móvil. Los cuatro
  formularios de sesión tienen orden h1→h2→h3. Se conservan las correcciones
  semánticas, de contraste y separadores táctiles de la entrega inicial.
- **Historial del menú:** resuelto; pruebas de Atrás, Adelante, Escape, enlaces y
  vuelta desde Configuración, sin perder el foco de un control visible.
- **Elección de lenguaje y filtros:** se mantienen por función. El catálogo hereda
  la preferencia, pero permite explorar otro lenguaje; el taller permite cambiar
  de variante y ajustes define el valor inicial. «Estado» filtra el catálogo por
  trabajo pendiente: que una fila muestre el estado no sustituye ese filtro.
- **Cancelar evaluación:** fuera del plan visual acordado. No se añade un botón
  que solo cancele el sondeo sin detener Piston ni una garantía falsa de cancelación.
  Los endpoints y la reconciliación de intentos interrumpidos no cambian.
- **Cabeceras y animación de dimensiones:** no se fuerza igualdad entre portada
  pública y taller compacto. Se conserva el movimiento funcional de navegación,
  detalles y resultados ya aprobado; no se animan dimensiones de Monaco al escribir.
- **Tamaños pequeños, radios y Geist:** se conservan tokens, controles compactos
  y jerarquía de marca. El detector no prueba que un aviso estático sea un defecto
  renderizado; no se eliminan avisos con excepciones nuevas para aparentar cero.
- **Botones de paneles móviles:** siguen siendo controles con estado pulsado para
  mostrar paneles; no se les asigna un `tablist` incompleto ni se promete interacción
  de pestañas ARIA. Su operación por teclado y el acceso al contenido se conservan.

## Evidencia técnica

### Detector

Servidor local de **producción** (`next start` con build verificado), Chromium
local de Playwright usado por el detector mediante `PUPPETEER_EXECUTABLE_PATH`.

- Inicial: portada, sesión y catálogo a 390×844; tres avisos `overused-font`.
- Final móvil: doce URL solicitadas (portada, cuatro de sesión, catálogo, taller,
  inicio, índice/detalle de rutas, progreso y configuración); diez avisos de Geist.
- Final escritorio: nueve URL solicitadas a 1440×900; nueve avisos de Geist.
- Final estático `src`: 37 avisos informativos: 29 `design-system-font-size` y
  8 `design-system-radius`; sin `side-tab`.

Los avisos de Geist son una excepción de marca razonada, no una nueva regla
silenciada. El detector visita como invitado: no demuestra cobertura de la
administración ni del panel de una cuenta; esos estados se revisaron con capturas
y E2E autenticado. El número de avisos no equivale al número de rutas verificadas.

### Revisión renderizada

Diez superficies capturadas a 390×900 y 1440×900, en claro y oscuro: 40 capturas
locales y cuatro hojas de revisión. Cuenta temporal con permiso de administración,
eliminada al terminar. Las capturas no se versionan.

Se revisaron jerarquía, separación tonal, texto, acciones principales y adaptación;
medición DOM sin desbordamiento horizontal ni botones sin texto/etiqueta en esas
capturas. El primer fotograma del editor puede mostrar su carga: la preparación de
Monaco, conservación del código y área útil se comprueban además en E2E. No se
infiere rendimiento, contraste de cada píxel ni conformidad WCAG a partir de fotos.

### Comprobaciones

| Comprobación | Resultado |
| --- | --- |
| `npm run lint` | 0 errores, 97 avisos existentes en herramientas locales |
| `npm run typecheck` | Correcto |
| `npm test` | 81/81 |
| `npm run build` | Correcto |
| `ITERA_E2E_PRODUCTION=1 npm run test:e2e` | **101/101**, suite completa, incluidos los 28 pasos editoriales seriales |

Se añadieron seis casos E2E de ayuda, demo, jerarquía de sesión en dos anchos,
lenguaje al volver a rutas y progreso/configuración de una cuenta nueva. Se
ampliaron historial móvil y pruebas editoriales para abrir la ayuda explícitamente.
Estas últimas esperan la URL tras cambiar de lenguaje antes de actuar sobre el
nuevo contenido. Los tests de reflujo/foco pasan a modalidad de teclado antes de
comprobar `:focus-visible`, sin exigir anillo tras una interacción de ratón.

Hubo pasadas intermedias fallidas: carrera entre `popstate` y restauración del router,
selectores ambiguos tras añadir regiones vivas/ayuda anidada y espera del cambio de
lenguaje. Se corrigieron; solo la pasada completa final se declara aprobada.

Archivos de evidencia locales: `.local/impeccable-completo-{build,lint,unitarias}.log`,
`.local/impeccable-completo-e2e-final.log`, `.local/impeccable-url-{mobile,desktop}.json`,
`.local/impeccable-static-final.json`, `.local/impeccable-visual.json` y
`.local/screenshots/plan-impeccable/`.

## Límites, no implementaciones pendientes

- El E2E usa un doble HTTP de Piston. No se verificaron ejecución ni aislamiento
  reales en esta continuación; no cambió el adaptador de ejecución.
- No hubo lector de pantalla, dispositivos físicos ni motores distintos de Chromium.
- Las pruebas de tokens cubren contraste definido en el sistema; no sustituyen una
  auditoría de contraste de todo el DOM, tamaños táctiles o rendimiento en hardware real.
- No se añaden dependencias, telemetría, despliegue ni una declaración formal WCAG.

La implementación del plan visual queda cerrada con estos límites explícitos.
