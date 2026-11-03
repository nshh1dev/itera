# Verificación de interacción en navegador

## Alcance

La revisión combina recorridos reales de Next y PostgreSQL con comprobaciones de
componentes. No equivale a certificar WCAG, usar un lector de pantalla, probar un
dispositivo físico o verificar la ejecución de código en Piston.

Recorridos reutilizados:

- `interface.spec.ts`: navegación, foco al cerrar, filtros móviles, tamaños del
  taller, temas de Monaco y conservación del código entre paneles.
- `controls.spec.ts`: ayudas por teclado y selectores en ambos temas/tamaños.
- `motion.spec.ts`: navegación y borradores de Configuración, diálogos, foco y
  cambios de preferencia de movimiento durante una interacción.
- `curriculum.spec.ts`: las cuatro rutas sin bloqueos y el editor TypeScript móvil.
- `redesign.spec.ts`: reflujo de pantallas públicas, salto al contenido y taller
  en ventanas bajas. Su ampliación del texto raíz **no es zoom del navegador**.
- `browser-zoom.spec.ts`: zoom real al 200 %, páginas públicas, taller, cierre/repaso
  con sesión, Configuración y vistas administrativas de una cuenta temporal.

## Teoría opcional en el taller Python

El taller Python muestra «Teoría y objetivos» cerrado por defecto. Contiene
objetivos de práctica, teoría/ejemplo del módulo y coste, cuando existen. El reto,
sus condiciones y ejemplos permanecen visibles; no se extrae automáticamente
teoría del enunciado ni se ocultan instrucciones imprescindibles. El repaso
«Antes de empezar» es independiente. Pistas, errores comunes y solución quedan
fuera del desplegable, conservando revelación progresiva y consulta autenticada
de la solución. JavaScript/TypeScript mantienen la teoría visible por defecto.

Se reutiliza `Disclosure`: contenido plegado con `inert` y `aria-hidden`, estado
`aria-expanded`, teclado de Radix y preferencia de movimiento reducido. No se
añaden colores, estilos globales, breakpoints ni preferencias persistidas. Abrir
o cerrar la teoría no desmonta el editor ni reinicia las pistas reveladas.

Cobertura ejecutada el 3 de noviembre de 2026:

- `learning-help.test.ts`: render inicial cerrado, contenido conservado/escapado,
  objetivos sin duplicar, repaso separado, ausencia de secciones vacías y modo
  anterior visible por defecto.
- `learning-help.spec.ts`: Python cerrado frente a JavaScript/TypeScript visibles;
  botones de pista y solución disponibles con teoría plegada.
- `controls.spec.ts`: apertura/cierre con espacio y foco en ambos temas/tamaños.
- `help-motion.spec.ts`: Enter, movimiento reducido, conservación de pista/editor
  y retorno de foco desde la solución en ventanas estrechas y bajas.
- `educational-validation.spec.ts`: estado plegado y salida PROGRAM conservada.

Con autorización, aprobaron los 39 casos de `controls`, `help-motion`,
`initial-batch`, `learning-help`, `plan-impeccable`, `python-presentation` y
`browser-zoom` usando Next dev y PostgreSQL nativo. El zoom real global al 200 %
aprobó en ambos temas; ese recorrido usa el editor TypeScript. La ampliación
Python posterior se documenta abajo, sin atribuirle toda la revisión visual.
También aprobaron los cinco casos de
`educational-validation` contra Piston real, separados de las pruebas con destino
HTTP 2001. No es la suite E2E completa ni una certificación de accesibilidad.

## Enunciados y JSON legible en Python

### Encabezados y ayudas Python ampliadas: comprobación posterior

El 3 de noviembre de 2026 se amplió `browser-zoom.spec.ts` con dos recorridos
Python, uno por tema. El archivo completo terminó con **4/4 pruebas aprobadas**
sin omisiones en Next dev/Chromium, unos 96 segundos en la ejecución final.
No usa Piston real: no evalúa programas y el servidor conserva su destino HTTP
2001. No se inició Piston ni WSL para esta comprobación.

- Una identidad editorial temporal, derivada de la fuente Python actual, permite
  mostrar «Antes de resolver»/«Entrada y resultado» y marcas de código sin cambiar
  identidades del propietario. Comprueba encabezados, dos elementos `code`, HTML
  literal sin ejecución y marcas dobles/incompletas conservadas en **390, 768,
  1024, 1199 y 1440 px**, ambos temas, sin desbordamiento horizontal de página.
- Con la extensión local y perfil desechable comprueba zoom real **2**, DPR **2**
  y anchura útil de **720, 390 y 320 px** (ventanas 1440/780/640), sin cambiar el
  tamaño raíz. En cada ancho vuelve a comprobar los encabezados y abre las ayudas
  del ejercicio publicado `logica-dos-parametros`: teoría cerrada inicialmente,
  apertura/cierre con espacio, ejemplo modular, pista, solución con Enter,
  desplazamiento hasta el código, Escape y retorno del foco. Conserva código del
  editor sencillo al alternar paneles y deja progreso en cero.
- El ejercicio publicado verifica la presentación del contenido **instalado**,
  no la activación de las revisiones actuales. La cuenta y el intento temporal
  permiten consultar la solución sin cambiar progreso ni envíos del propietario.
  No modifica textos, contratos ni revisiones activas del propietario.

Revisión visual directa de siete capturas: encabezados claro 390/1024 y oscuro
ampliado 780; teoría oscuro ampliado 640 y claro ampliado 1440; solución claro
ampliado 640 y su código oscuro ampliado 640. Se ven reflujo, jerarquía y foco;
el código largo conserva desplazamiento interno, no se promete ajuste de línea.
No equivale a inspeccionar todas las capturas, accesibilidad completa, lector de
pantalla, zoom en otros navegadores o toda la interfaz afectada por el plan.
Las capturas locales `python-headings-*`, `python-theory-zoom-*` y
`python-solution*-zoom-*` no forman parte de la entrega.

La primera ejecución completó los cuatro casos, pero no cerró el comando y
agotó 20 minutos: **no se contó como suite aprobada**. La repetición inmediata
falló al arrancar por conexión PostgreSQL interrumpida. Tras detener y arrancar
explícitamente solo el clúster privado, el archivo completo aprobó dos veces;
la última incluye la captura del código de solución desplazado. No se cambió
producto ni configuración para ocultar esos fallos. Los avisos de Motion sobre
movimiento reducido no impidieron las comprobaciones. Logs locales en
`C:\Users\Admin\AppData\Local\Temp\opencode\python-zoom-browser*.log`.

Limpieza verificada en base: cero ejercicios/cuentas con el prefijo temporal
`python-zoom-`. Contextos y perfiles desechables cerrados/eliminados; Next y
PostgreSQL apagados al terminar, sin tocar el servicio PostgreSQL de Windows.
Lint y tipos aprobados; se reutilizan pruebas unitarias/build anteriores porque
solo cambian pruebas E2E y documentación. No hubo preparación ni activación.

Las condiciones concretas siguen junto al reto. El cierre editorial posterior
omite únicamente el respaldo exacto «Usa únicamente los datos y límites
descritos en el enunciado.», sin regla propia (52 actividades de fuentes), sin
tocar datos ni otras condiciones. Los 13 casos de `python-presentation.spec.ts`
aprobaron tras este cambio: omisión Python en cinco anchos y ambos temas,
conservación de instrucciones concretas, de la frase en JS/TS, JSON y PROGRAM.
No amplía por sí solo la revisión visual directa. Procedimiento y límites del
reparto en [repeticiones-python.md](repeticiones-python.md#reparto-final-de-las-ayudas).

El taller activa estas opciones de presentación solo para Python:

- `Statement` reconoce también las etiquetas exactas «Antes de resolver» y
  «Entrada y resultado», con dos puntos opcionales y cuerpo en la línea siguiente.
  No infiere secciones por palabras sueltas ni interpreta HTML. Las etiquetas ya
  admitidas conservan su render. Solo presenta como código el texto delimitado
  explícitamente por una comilla invertida a cada lado en la misma línea; no
  deduce identificadores desde la prosa ni admite Markdown general. Marcas vacías,
  incompletas, multilínea o dobles/triples quedan literales. El contenido sigue
  escapado por React, también dentro de `code`; no se cambia el texto editorial.
- `Examples` usa sangrado de dos espacios para diccionarios no vacíos y listas
  que contienen otras listas/diccionarios. Valores simples, listas planas, `[]`
  y `{}` siguen compactos. Se mantienen orden, valores, claves y escapes JSON;
  la presentación no modifica las entradas ni las salidas comparadas.

PROGRAM no pasa por el formateador JSON: conserva espacios, saltos y texto
exactos. Tampoco se formatea el contenido de archivos esperados. La deduplicación
de ejemplos públicos no cambia. JavaScript/TypeScript mantienen presentación
compacta y reconocimiento anterior de etiquetas.

`python-presentation.test.ts` cubre formatos, conservación, escapes, código
explícito optativo y marcas incompletas/literales. Tras completar código marcado
aprobaron lint, tipos, diez pruebas focalizadas, las 582 pruebas completas sin
omisiones (concurrencia 2) y build; no cambió el catálogo.
Los 13 casos de `python-presentation.spec.ts` aprobaron: matrices en 390, 768,
1024, 1199 y 1440 px y ambos temas, regresión compacta de JavaScript/TypeScript y
salida literal PROGRAM. Se crean dos identidades temporales y se eliminan al
terminar, sin activar fuentes sobre el catálogo del propietario. La primera
ejecución falló porque la identidad de matrices no estaba publicada en la base
nativa; las copias temporales resuelven la dependencia de instalación, no ocultan
un fallo de presentación. Se comprobó que no quedaron esas copias.

Se guardaron capturas locales de los diez escenarios JSON y cuatro del editor
en `.local/screenshots/python-{json,code}-*.png`; la revisión visual directa de
390 oscuro, 1024 claro, 1199 oscuro/editor y 1440 claro no mostró recortes
horizontales del JSON. Las comprobaciones automáticas de anchura cubren los diez
escenarios; no se presenta esa muestra visual como revisión manual de todos.

En 1024 y 1199 px, con navegación contraída, ambos paneles ocupan respectivamente
960 y 1135 px en sus pestañas; Monaco está visible y el acceso al código no exige
encoger el enunciado. Se conservan las pestañas y el breakpoint de 1200 px: no hay
evidencia suficiente para reducirlo y sacrificar ese espacio al dividirlo. Estas
mediciones no demuestran que una alternativa dividida sea imposible u óptima.

## Avisos de finalización Python

Progreso conserva una explicación estable: los completados registran práctica,
no dominio; solo superar la comprobación de solución completa un ejercicio,
no ejecutar ejemplos o consultar ayudas. Cada ejercicio cuenta una vez por
lenguaje desde ruta o práctica libre. El bloque de ayudas mantiene el dato de
ejercicios resueltos tras consultar ayuda y una sugerencia de repaso, sin repetir
la advertencia de dominio.

Los cierres de ruta Python conservan cantidad publicada, lenguaje independiente
y acceso al repaso, con enlace a Progreso para interpretar el dato. El repaso
mantiene la invitación a resolver/explicar y que no concede finalización por sí
mismo, sin repetir el aviso de dominio. En el diálogo de solución queda un único
aviso breve en la descripción, también durante carga/error; se retira solo el
duplicado del pie. JavaScript/TypeScript mantienen sus textos anteriores.

Las pruebas de render de rutas y Progreso verifican mensajes, enlaces, cuentas,
lenguajes y conservación de archivos/paginación. `help-motion.spec.ts` e
`initial-batch.spec.ts` aprobaron el aviso único después de cargar la solución,
foco de retorno y consulta sin progreso. `plan-impeccable.spec.ts` comprueba la
página vigente de Configuración, guardado independiente del nombre y preferencias
pendientes/guardadas; se retiró su expectativa obsoleta de un diálogo. No cambian
consultas, acciones, criterios de evaluación ni escritura de progreso.

## Ejecución real y límites de instalación

Las 12 pruebas de `npm run test:runner` aprobaron sin omisiones con los tres
runtimes, compilación TypeScript, veredictos, ocultación y persistencia entre
procesos. No cubren por sí solas las 224 revisiones Python ni sus límites máximos.
La primera llamada se omitió por falta de conexión con WSL; solo la repetición con
la tarea manual `Docker-WSL` activa acredita Piston real.

Los cinco casos de `educational-validation.spec.ts` aprobaron sin omisiones.
Los tres de evaluación usan una copia temporal de `logica-cambio` de las fuentes:
la instalación nativa conserva una versión antigua sin regla conceptual, en la
que la respuesta fija sí cumple el contrato publicado. La primera ejecución
detectó esa diferencia; no se cambió el contrato existente para pasar la prueba.
La copia comprueba ejemplos sin progreso, rechazo de respuesta fija/cálculo
desconectado y submit correcto por lenguaje. Los dos casos visuales usan el
ejercicio publicado existente. No se certifica activación del catálogo nuevo.

Solo se escribieron cuentas/contenido/datos temporales de pruebas; no hubo seed,
migraciones, preparación ni activación. Se apagaron PostgreSQL privado, Piston y
la tarea manual de WSL conservando volúmenes. Sigue pendiente validar el catálogo
Python completo y sus límites, la instalación activa y el resto de E2E/visual.
Tras los ajustes exclusivos de pruebas/documentación aprobaron lint, tipos y
build. Se reutilizan las 582 pruebas unitarias de la entrega anterior porque no
cambiaron producto, catálogo ni pruebas unitarias. Los avisos observados de
Better Auth sobre IP y de Motion sobre movimiento reducido no impidieron los
recorridos; no se modificó su configuración para silenciarlos.

## Cómo se comprueba el zoom real

`tests/fixtures/browser-zoom` es una extensión mínima Manifest V3, solo para pruebas.
Usa `chrome.tabs.setZoom` desde el worker de Chromium. No modifica CSS, la fuente
raíz ni el factor de escala de página de CDP. No contiene scripts de contenido,
peticiones de red o lógica de producto; no se instala en el navegador habitual.

Cada prueba crea su propio perfil temporal y lo elimina al cerrar. Solicita el
canal `chromium` completo de Playwright, que admite extensiones en modo headless;
no el ejecutable headless-shell. Se verifica la línea base de 1440 px/DPR 1 antes
de aplicar el factor 2 y luego se comprueban:

| Ventana de prueba | Ancho CSS útil con zoom 200 % |
| --- | --- |
| 1440 px | 720 px |
| 780 px | 390 px |
| 640 px | 320 px |

El DPR pasa a 2 mientras la raíz sigue en 16 px. Estas comprobaciones evitan
presentar pinch zoom, un viewport pequeño o `font-size: 200%` como zoom real.
El viewport estrecho verifica reflujo; no simula por sí solo gestos táctiles.

## Repetir

Requiere autorización para iniciar la aplicación, una **base preparada**
y Chromium instalado (`npx playwright install chromium`). Para aislar una revisión
completa se puede usar una copia temporal: aplicar migraciones solo a la copia y configurar
`DATABASE_URL` para todo el proceso de pruebas y su servidor hijo, sin imprimirla.
Nunca resetear o migrar la base original para satisfacer estas comprobaciones.

Con 3000 y 2001 libres, desde la raíz y tras `npm run build`:

```powershell
$env:ITERA_E2E_PRODUCTION = "1"
npm.cmd run test:e2e -- tests/e2e/interface.spec.ts tests/e2e/controls.spec.ts tests/e2e/motion.spec.ts tests/e2e/curriculum.spec.ts tests/e2e/redesign.spec.ts tests/e2e/browser-zoom.spec.ts
```

No ejecutar lint mientras se crean/eliminan resultados de Playwright. Estas pruebas
no necesitan iniciar Docker ni Piston: el servidor conserva el destino de pruebas
en 2001 y los recorridos anteriores no evalúan programas. Las cuentas, borradores
y completados de demostración son temporales, no evidencia de aprendizaje humano.

Al terminar, comprobar que el servidor hijo se detuvo y retirar exclusivamente los
datos, perfiles y copia de base que se hayan creado para la verificación. Comparar
recuentos y huellas originales cuando se verifique conservación integral. En el
lote del 3 de noviembre se usó la base nativa con datos temporales, no una copia
integral ni una comparación de todas las tablas. No detener servicios ajenos.

## Matriz visual y entrada táctil Python

La comprobación posterior amplía `ux-polish.spec.ts` a **390, 768, 1024,
1199 y 1440 px**, altura 900, claro/oscuro y movimiento reducido. Recorre
Progreso con borrador sin intentos, Desde cero con módulo activo, enunciado
Python y catálogo: **40 capturas**, sin desbordamiento horizontal de página.
Se fija la preferencia en localStorage antes de navegar y se comprueba la clase
real del tema; no basta con emular `prefers-color-scheme`. No se acumulan scripts
de inicialización de temas cuyo orden de ejecución sería indeterminado.

Se inspeccionaron directamente ocho composiciones locales de esas capturas
(una por superficie/tema, cinco anchos ordenados de menor a mayor), más los
originales `editor-light-1440`, `editor-dark-1199`, `progreso-dark-1440` y
`ruta-light-1024` en `.local/screenshots/pulido/`. Las composiciones
`revision-*.png` reducen cada imagen a 300 px: sirven para comparar jerarquía y
reflujo, no para certificar legibilidad de todo el texto a tamaño nativo.
No se observaron solapamientos ni controles fuera de página en esta muestra.
Se mantienen reto/condiciones/ejemplos antes de la teoría cerrada y la
separación tonal existente. A 1199 se conserva el panel de pestañas; a 1440,
Monaco y resultados mantienen su espacio propio. Las descripciones truncadas
en filas móviles no impiden identificar título, estado y acción Continuar.

`help-motion.spec.ts` añade dos contextos Chromium con `hasTouch: true`,
390 × 844, tema explícito y movimiento reducido. Con `tap()` abre/cierra teoría,
revela una pista, consulta/cierra solución y vuelve al editor sencillo sin perder
el código. Teoría, acceso a solución y cierre del diálogo miden al menos
44 × 44 CSS px; el foco vuelve al acceso a solución. Se revisaron directamente
`python-touch-light.png` y `python-touch-dark.png`: diálogo contenido dentro de
la pantalla, cierre disponible y explicación con desplazamiento interno. Es
entrada táctil emulada, no una prueba en teléfono físico ni auditoría de todos
los objetivos táctiles. Se reutiliza la cobertura anterior de teclado y zoom
real al 200 %, sin volver a atribuirla a estas pruebas.

Los dos archivos completos aprobaron **12/12**, sin omisiones, con la app
compilada (`ITERA_E2E_PRODUCTION=1`). Se reutilizó el build anterior porque no
cambió producto ni catálogo; lint y tipos aprobados. La primera ejecución
aprobó diez casos y agotó dos nuevos: intentaban consultar `boundingBox()` de
controles exteriores mientras el diálogo los dejaba inertes. Las mediciones
se movieron antes de abrirlo; no se cambió el producto ni se suprimieron las
aserciones. Dos repeticiones completas aprobaron, la última también con la
preferencia de tema sin scripts acumulados. El aviso previo de Better Auth
sobre IP no se silenció ni se trató como fallo de producto.

Al terminar quedaron cero cuentas `help-motion-` y `pulido-`; se detuvieron
Next y PostgreSQL privado conservando datos. No se inició Piston ni se
preparó/activó contenido. Los recuentos capturados (136 publicados; rutas
28/36/36/36) corresponden a la instalación anterior, no a las 224 fuentes:
las nueve discrepancias de onboarding siguen abiertas. Esta muestra amplía
F, pero no cierra su revisión global: faltan estados/superficies restantes,
incluidos repaso/cierre de ruta y configuración en la matriz integrada. No
acredita conservación integral de la base, lectores de pantalla, contraste
medido ni pruebas físicas.

## Interpretar fallos y límites

- No sustituir las expectativas de conservación por recargas que descarten código.
  Al volver atrás, la caché puede restaurar props antiguas: si la recuperación pide
  elegir, comprobar las copias, elegir explícitamente y verificar el guardado real.
- Distinguir recorte dentro de un panel de desplazamiento horizontal de página.
  Se permite desplazamiento local de código; los controles y el texto educativo
  deben seguir accesibles.
- Las capturas son locales en `.local/screenshots/`; no contienen datos reales de
  estudiantes. Inspeccionar una tanda representativa antes de decidir cambios y
  evitar rediseños o ajustes visuales sin un defecto reproducido.
- Fecha, resultados, fallos previos y límites de cada ejecución: [verification.md](verification.md).
  Piston real, lectores de pantalla, alto contraste del sistema y observaciones
  humanas requieren verificaciones adicionales; no se deducen de esta suite.
