---
name: Itera
description: Un intento más cerca. Taller local de lógica de programación.
colors:
  canvas: "#F0F0F3"
  canvas-dark: "#111113"
  background: "#FFFFFF"
  background-dark: "#000000"
  panel: "#FFFFFF"
  panel-dark: "#1C1C1E"
  surface: "#F5F5F7"
  surface-dark: "#1C1C1E"
  surface-tertiary: "#EBEBEF"
  surface-tertiary-dark: "#242426"
  surface-inset: "#F0F0F2"
  surface-inset-dark: "#161618"
  control: "#FFFFFF"
  control-dark: "#242426"
  editor: "#FFFFFF"
  editor-dark: "#1C1C1E"
  foreground: "#1D1D1F"
  foreground-dark: "#F5F5F7"
  muted-foreground: "#68686D"
  muted-foreground-dark: "#A1A1A6"
  primary: "#0071E3"
  primary-dark: "#0A84FF"
  primary-text: "#0066CC"
  primary-text-dark: "#409CFF"
  primary-foreground: "#FFFFFF"
  primary-foreground-dark: "#000000"
  success: "#34C759"
  success-dark: "#30D158"
  success-text: "#237A3B"
  success-text-dark: "#30D158"
  destructive: "#B42318"
  destructive-dark: "#FF6961"
  warning: "#7A4B00"
  warning-dark: "#E5C07B"
  border: "#E5E5EA"
  border-dark: "#343437"
  border-soft: "#DEDEE5"
  border-soft-dark: "#29292D"
  panel-outline: "#DADAE1"
  panel-outline-dark: "#29292D"
  selection: "#EAEAED"
  selection-dark: "#2C2C2E"
  overlay: "#00000052"
  overlay-dark: "#00000099"
typography:
  display:
    fontFamily: "Geist, sans-serif"
    fontSize: "clamp(2.5rem, 5.5vw, 4.5rem)"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.055em"
  headline:
    fontFamily: "Geist, sans-serif"
    fontSize: "clamp(1.875rem, 3.6vw, 2.875rem)"
    fontWeight: 550
    lineHeight: 1.14
    letterSpacing: "-0.045em"
  title:
    fontFamily: "Geist, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.035em"
  body:
    fontFamily: "Geist, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.75
  compact:
    fontFamily: "Geist, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Geist, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.5
  mono:
    fontFamily: "Geist Mono, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.75
rounded:
  sm: "8px"
  md: "10px"
  lg: "12px"
  xl: "16px"
  feature: "20px"
  full: "9999px"
spacing:
  compact: "12px"
  control: "16px"
  page-block: "32px"
  panel: "28px"
  section: "40px"
  section-wide: "64px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.compact}"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
    height: "40px"
  button-secondary:
    backgroundColor: "{colors.surface-tertiary}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
    height: "40px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.muted-foreground}"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
    height: "40px"
  field:
    backgroundColor: "{colors.control}"
    textColor: "{colors.foreground}"
    typography: "{typography.compact}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
    height: "40px"
  badge:
    backgroundColor: "{colors.surface-tertiary}"
    textColor: "{colors.muted-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
  navigation-link:
    backgroundColor: "transparent"
    textColor: "{colors.muted-foreground}"
    typography: "{typography.compact}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
    height: "44px"
  list-entry:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.sm}"
    padding: "16px 12px"
  segment:
    backgroundColor: "transparent"
    textColor: "{colors.muted-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
    height: "36px"
  dialog:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.feature}"
    padding: "28px"
---

# Design System: Itera

## Overview

**Creative North Star: "El taller de escritorio"**

Itera se ve como un escritorio de trabajo bien ordenado, no como un producto que
quiere llamar la atención. Hay una superficie de fondo, encima paneles, y encima
las herramientas: el enunciado, el editor, los resultados. Cada capa se distingue
por tono antes que por línea, y lo que flota —un menú, un diálogo— es lo único que
proyecta sombra. La interfaz es precisa y callada: ordena, orienta y se aparta para
que el código y el resultado ocupen el centro.

El sistema es monocromático y frío. El azul de instrumento aparece solo cuando hay
una acción que ejecutar, un enlace que seguir o un foco que mostrar; el verde solo
confirma un éxito comprobado. Nada decora con color. La tipografía hace el trabajo
de jerarquía: Geist para leer y para la interfaz, Geist Mono para el código, las
cifras comparadas y el orden de los pasos.

La densidad es la de una herramienta, no la de una revista ni la de un panel de
métricas: bloques amplios, texto de lectura a 16 px, controles compactos y una
columna de trabajo que nunca se encoge por debajo de lo usable. El movimiento es
breve y funcional: responde, revela y se retira; nunca celebra.

**Key Characteristics:**
- Superficies tonales apiladas con contorno interior de 1 px; sombra solo para lo
  que flota.
- Azul escaso y funcional; verde reservado a la confirmación de éxito.
- Monoespaciada con propósito: código, cifras, números de paso y de ruta.
- Controles compactos en escritorio, objetivos de 44 px en punteros gruesos.
- Sin degradados, sin tarjetas de métricas, sin celebraciones.

## Colors

Paleta monocromática fría con un único acento funcional y un verde de confirmación.

### Primary

- **Azul de instrumento** (#0071E3 en claro, #0A84FF en oscuro): acción principal,
  enlaces con texto, anillo de foco, relleno de progreso y marca de la ruta activa.
  En oscuro se aclara para mantener contraste sobre negro; el texto de acción usa
  #0066CC / #409CFF, más oscuro o más claro que el relleno, para leerse sobre panel.

### Neutral

- **Grafito** (#1D1D1F / #F5F5F7): texto principal, marca y contornos de iconos.
- **Grafito medio** (#68686D / #A1A1A6): texto secundario sobre panel blanco. Sobre
  bandejas tonales se usa el mismo valor declarado como `tonal-foreground`, porque
  el gris claro pierde contraste sobre #F0F0F2.
- **Papel neutro** (#FFFFFF / #000000): la superficie base del tema.
- **Panel** (#FFFFFF / #1C1C1E): la capa de trabajo donde se lee y se escribe.
- **Lienzo** (#F0F0F3 / #111113): el fondo del espacio de práctica; enmarca el panel.
- **Bandeja** (#F5F5F7 / #1C1C1E) y **bandeja terciaria** (#EBEBEF / #242426):
  agrupaciones dentro de un panel y fondo de controles segmentados.
- **Contorno de panel** (#DADAE1 / #29292D): el filo de 1 px que separa panel de
  lienzo cuando el tono no basta.
- **Borde** (#E5E5EA / #343437) y **borde suave** (#DEDEE5 / #29292D): separadores
  internos y filos de barra.
- **Selección** (#EAEAED / #2C2C2E): hover de navegación, filas y enlaces de ruta.

### Named Rules

**La regla del azul escaso.** El azul solo señala acción, enlace o foco. Nunca es
fondo de sección, borde decorativo ni acento tipográfico.

**La regla del verde único.** El verde significa éxito comprobado. No marca
novedad, marca personal ni progreso genérico.

**La regla de la capa antes que la línea.** Si dos superficies se distinguen por
tono, no se les añade un divisor.

## Typography

**Display Font:** Geist (con `sans-serif`)
**Body Font:** Geist (con `sans-serif`)
**Label/Mono Font:** Geist Mono (con `monospace`)

**Character:** Una sola familia para todo lo que se lee y se opera, con una
monoespaciada que solo aparece cuando el contenido es código o cifra. La voz es
neutra y técnica; la jerarquía se construye con tamaño, peso y tracking negativo,
nunca con otra familia.

### Hierarchy

- **Display** (600, `clamp(2.5rem, 5.5vw, 4.5rem)`, 1.08, -0.055em): titular de
  la portada. Centrado solo en escritorio.
- **Headline** (550, `clamp(1.875rem, 3.6vw, 2.875rem)`, 1.14, -0.045em): títulos
  de sección de la portada y cierre.
- **Title** (600, 1.75–2rem, 1.25, -0.035em): `page-title` de cada página interna;
  `section-title` a 1rem para bloques dentro de una página.
- **Body** (400, 1rem, 1.75): prosa de lectura, enunciados y explicaciones, con
  medida de 65–70ch. El texto compacto de interfaz usa 0.875rem/1.6.
- **Label** (500, 0.8125rem, 1.5): etiquetas de campo, insignias y navegación.
- **Mono** (400, 0.875rem, 1.75): código, resultados comparados, numeración de
  pasos y marcas de ruta.

### Named Rules

**La regla del texto que no encoge.** El cuerpo educativo no baja de 1rem y la
interfaz no baja de 0.8125rem. Al estrechar la ventana se reorganiza; no se
reduce el texto.

**La regla de la mono con propósito.** Geist Mono se usa para código, cifras y
orden. Una etiqueta que no es ninguna de las tres va en Geist.

## Layout

Dos contenedores: `page-container` a 1280 px con relleno de 20 px (32 px desde
640 px) para el espacio de práctica, y `landing-container` a `min(100% - 40px,
1200px)` para la portada. El ritmo vertical va en pasos de 4 px; los bloques
grandes usan 40–64 px.

El espacio de práctica es la composición que define el sistema. Desde 1200 px es
una cuadrícula de tres zonas: enunciado con ancho ajustable (35 % por defecto,
mínimo 280 px), separador de 7 px y columna de editor. Los resultados ocupan una
franja inferior de 240 px, ampliable hasta 400 px. Por debajo de 1200 px la
misma información se organiza en pestañas —enunciado, código, resultados— y el
editor ocupa 56dvh.

La barra lateral mide 64 px en escritorio y se expande a 224 px desde 1200 px
cuando la persona lo pide; el contenido se desplaza, no se solapa. El catálogo
usa 260 px de herramientas más lista desde 1024 px; las rutas, 220 px de índice
fijo más contenido; la cuenta y la configuración, dos columnas desde 1024 px.

## Elevation & Depth

Sistema híbrido con predominio tonal. El fondo es lienzo; encima va el panel; dentro
del panel, bandejas más oscuras o más claras. El filo se resuelve con un contorno
interior de 1 px (`inset 0 0 0 1px`) que no altera medidas ni separadores. La
sombra es estructural, no ambiental: solo la llevan los controles elevados, lo que
flota y los diálogos.

### Shadow Vocabulary

- **Control** (`0 1px 2px #0000000A, inset 0 1px 0 #FFFFFF26`): botón principal y
  segmento activo; en oscuro `0 1px 3px #00000026, inset 0 1px 0 #FFFFFF14`.
- **Panel** (`inset 0 0 0 1px #DADAE1, 0 1px 2px #1D1D1F06, 0 4px 16px #1D1D1F05`):
  superficies de trabajo que necesitan separarse del lienzo.
- **Flotante** (`0 8px 28px #00000014, 0 1px 4px #00000008`): menús y tooltips.
- **Diálogo** (`0 24px 80px #00000029, 0 2px 8px #00000008`): panel de configuración
  y cajón de navegación móvil.

### Named Rules

**La regla de la sombra que se gana.** Una superficie plana no lleva sombra. Si no
flota ni se eleva sobre el lienzo, se separa con tono y contorno.

## Shapes

Esquinas suaves y uniformes: 8 px para campos y filas, 10 px para navegación y
segmentos, 12 px para controles y botones, 16 px para paneles, 20 px para la
superficie de diálogo y las piezas destacadas. Las insignias y los contadores de
paso son círculos o píldoras completas. La marca es un cuadrado de 10 px de radio
con el glifo de dos ángulos.

No hay recortes diagonales, ni marcos dobles, ni esquinas asimétricas. Los bordes
son de 1 px y siempre suaves; ningún borde lateral grueso marca tarjetas ni avisos.

## Components

Las decisiones siguientes se mantienen como documentación del proyecto, sin
depender de herramientas de diseño instaladas. Las fuentes de verdad son los
tokens de `src/app/globals.css` y los componentes locales. Conservar filtros
útiles, Geist/Geist Mono y el espacio de trabajo compacto; no rediseñar pantallas
como parte de una limpieza de herramientas.

### Buttons

- **Shape:** rectángulo redondeado de 12 px, altura mínima 44 px en móvil y 40 px
  desde 768 px.
- **Primary:** fondo azul de instrumento, texto blanco (negro en oscuro), relleno
  de 16 px, icono de 16 px.
- **Hover / Focus:** el principal baja el brillo al 95 % y se comprime a 0.97 al
  pulsar; el foco es un anillo de 2 px con desplazamiento de 3 px.

El movimiento compartido usa los componentes gratuitos de UIArc adaptados a
Itera: pulsaciones breves, indicadores de selección continuos y paneles con
resortes amortiguados. La portada prioriza la demo y acciones breves; las ayudas
secundarias se despliegan bajo demanda. El contenido educativo no se recorta.
Detalles de integración y límites de verificación en [motion.md](motion.md).
- **Secondary / Ghost / Outline:** secundario sobre bandeja terciaria, fantasma
  solo texto que gana fondo de selección, contorno de 1 px sobre control.

### Chips

- **Style:** píldora de fondo terciario con texto grafito medio; variante de
  contorno para metadatos y variante de filtro que cambia a selección al pasar.
- **State:** los filtros activos se conservan en la URL y se leen también como
  texto; nunca dependen solo del color.

### Cards / Containers

- **Corner Style:** 16 px en paneles, 12–14 px en piezas dentro de un panel.
- **Background:** panel blanco o bandeja según la profundidad; nunca dos tonos
  nuevos para el mismo nivel.
- **Shadow Strategy:** ver Elevation & Depth.
- **Border:** contorno interior de 1 px cuando el tono no separa.
- **Internal Padding:** 20–28 px; 36 px en la pieza destacada de escritorio.

### Inputs / Fields

- **Style:** fondo control, contorno de 1 px en gris de entrada, radio de 8 px,
  altura mínima 44 px en móvil y 40 px en escritorio.
- **Focus:** el borde pasa al azul y se suma el anillo global; no se sustituye el
  foco por color de fondo.
- **Error / Disabled:** el error se escribe junto al campo y se asocia con
  `aria-describedby`; el campo deshabilitado baja a 50 % de opacidad.

### Navigation

Barra lateral fija de iconos desde 768 px, con etiquetas al expandirse desde
1200 px y tooltips cuando está compacta. El enlace activo usa fondo de selección y
texto principal; su icono se tiñe de azul. En móvil, la misma navegación se abre
en un cajón desde la cabecera. La cabecera de la portada es independiente y usa
enlaces de 13 px con 44 px de alto.

### Workspace

La pieza firma del producto: enunciado, separador ajustable y editor en una sola
superficie continua. El enunciado y los resultados comparten bandeja; el editor es
blanco en claro y #1C1C1E en oscuro. Los controles de ejecución viven entre el
código y los resultados, y las pestañas móviles sustituyen la cuadrícula sin
duplicar contenido.

### Landing demo

La demostración de la portada imita el taller sin ser el taller: problema arriba,
código con números de línea y consola de entrada y resultado. Es la única pieza
que puede permitirse una sombra amplia y difusa, porque representa un objeto
apoyado sobre la página.

## Do's and Don'ts

### Do:

- **Do** resolver la separación con tono y, si hace falta, un contorno interior de
  1 px que no cambie medidas.
- **Do** usar el azul solo en acción, enlace y foco; comprobar ambos temas.
- **Do** mantener el cuerpo de lectura a 1rem y la interfaz a 0.8125rem como mínimo.
- **Do** conservar objetivos de 44 px en punteros gruesos y foco visible con anillo.
- **Do** dejar que Geist Mono aparezca solo en código, cifras y numeración.
- **Do** respetar `prefers-reduced-motion`: sin desplazamiento ni escala, con
  cambios instantáneos.

### Don't:

- **Don't** introducir degradados, cristal, ruido, ilustraciones ni color decorativo.
- **Don't** convertir secciones en rejillas de tarjetas de métricas.
- **Don't** añadir insignias, rachas, confeti ni celebraciones de progreso.
- **Don't** repetir divisores cuando el tono ya separa dos superficies.
- **Don't** reducir el tamaño del texto para que quepa más contenido.
- **Don't** sustituir el foco del navegador por un cambio de color de fondo.
