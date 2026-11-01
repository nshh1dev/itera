# Textos de rutas y módulos Python

## Alcance

`src/lib/python-route-copy.ts` contiene las descripciones de las cuatro rutas y
los títulos sin numeración y descripciones de los **57 módulos** de Python.
El inventario se contrastó con las actividades que realmente reúne cada módulo,
incluidos los pasos separados de búsqueda, agrupación e inventario y las 48
actividades exclusivas. No cambia la secuencia de 224 identidades.

Se mantienen deliberadamente los cuatro títulos de ruta —Desde cero, Construye
tus bases, Conecta las ideas y Ve un paso más allá— para conservar referencias
conocidas. La proyección no sustituye sus títulos guardados, niveles, slugs ni
posiciones. Las descripciones sí distinguen las herramientas y prácticas de
Python de las del currículo común.

## Decisiones editoriales

- Iniciación distingue salida, conversión de texto, retorno y seguimiento. Los
  títulos señalan la operación de cada bloque, no prometen certificar autonomía.
- Principiante nombra índices, alias, copias, None, parámetros predeterminados,
  validación y regresiones, además de decisiones y bucles. El gestor de gastos
  se describe como resumen por categoría, no como saldo bancario.
- El bloque `mapas` se titula **Repetidos y frecuencias**: ya no incluye la
  agrupación desplazada al módulo siguiente. Se evita «mapa» como sustituto
  impreciso de diccionario y no se confunde con la función Python map.
- Comprensiones, iteradores, agregación, formato y consulta anidada tienen una
  descripción de su operación. Formato no promete enseñar todas las formas de
  redondeo; consulta anidada no anticipa una copia que allí no se realiza.
- **Archivos de texto y JSON** describe lectura, escritura, análisis, estructura
  y errores esperados. No titula como persistencia entre procesos las prácticas
  que únicamente guardan y reabren en un mismo proceso.
- Inventario y agenda de tareas sí describen los proyectos multarchivo y la
  recuperación entre procesos declarada en sus contratos. La agenda de contactos
  se nombra por separado para evitar confundir ambos modelos.
- Academia, contactos y transformación usan **Prácticas:** en vez de
  **Proyecto:**. Son ejercicios FUNCTION con estados recibidos, no manifiestos
  multarchivo ni almacenamiento persistente. Sus objetivos mencionan las
  operaciones que efectivamente aparecen, incluido borrar contactos.
- Búsqueda binaria se diferencia de la búsqueda lineal ya practicada. Los
  recorridos nombran dos índices, prefijos y ventanas; el bloque de copia anidada
  limita la explicación a filas de enteros.
- Avanzado distingue árboles binarios, montículos, exploración, estados de
  programación dinámica, ciclos y dependencias. La integración enumera familias
  de problemas en lugar de prometer dominio por completarlas.

Las descripciones usan verbos de práctica y no se generan uniendo las frases
«Puedo…» de autoevaluación. Estas últimas permanecen intactas para su función de
repaso. También permanecen teoría, ejemplos de módulo y títulos de actividades:
el vocabulario global y la repetición entre esas superficies tienen revisión
pendiente. Una revisión posterior de la teoría de módulos se documenta en
[teoria-modulos-python.md](teoria-modulos-python.md), separada de este lote de
títulos y descripciones.

## Integración y protección del catálogo activo

- `python-curriculum.ts` aplica los títulos solo a la secuencia Python y conserva
  su numeración por ruta. `learning-modules.ts` usa las descripciones como
  objetivo introductorio; los módulos comunes siguen iguales.
- `languagePaths` proyecta descripciones únicamente con lenguaje Python y el
  marcador del currículo en el catálogo público recibido. Conserva rutas
  personalizadas y ejercicios añadidos, y no modifica los objetos originales.
- El listado, detalle de ruta y navegación reciben el mismo resultado
  proyectado. El detalle usa la descripción resuelta, no la fila compartida.
- El resumen del punto de partida consulta la existencia del marcador con
  ejercicio publicado, versión publicada y variante Python. Solo entonces
  muestra la descripción Python. Un borrador, un currículo anterior o un resumen
  de JavaScript/TypeScript conserva el texto previo. Para otros lenguajes no se
  realiza esa consulta adicional. No cambia la recomendación ni el nivel.

No hay migración ni escritura en `LearningPath`, variantes o progreso. Esta
proyección no activa contenido editorial: depende de la señal de publicación
existente, y no comprueba por sí sola que la última revisión del catálogo esté
activada.

## Evidencia y límites

`tests/python-route-copy.test.ts` cubre el inventario exacto de 57 módulos,
numeración, descripciones, distinción de los modelos y proyección de las cuatro
rutas con conservación de títulos y contenido personalizado. Las huellas
anteriores protegen los módulos/rutas comunes y todos los campos de unidades
Python salvo título. La huella completa del catálogo sigue siendo
`361d08526dac58c1dadfac4d939509e75a6f225b8f5355780a488f0a840eb480`:
no cambiaron tiempos, evaluación, enunciados ni explicaciones de actividades.

`tests/learning-summary.test.ts` comprueba la consulta de publicación y el
cambio de descripción, sin variar el nivel recomendado, y que otros lenguajes
no consultan ese marcador. Usa un doble de base, no una instalación real.
E2E, revisión visual de los nuevos saltos de línea en los tamaños previstos y
pruebas integradas siguen pendientes de un entorno autorizado. Esta revisión
completa el punto de títulos/descripciones, no la fase visual ni toda la fase E.
