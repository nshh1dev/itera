# Claridad editorial de Python

La auditoría de contratos de las 224 actividades se registra en
[auditoria-python.md](auditoria-python.md). Esta revisión editorial es posterior
y no se da por terminada por haber aprobado las pruebas de referencias.

## Criterios

- Separar **Tu tarea**, **Entrada** y **Resultado esperado**. Los requisitos
  imprescindibles y excepciones quedan en esos bloques, no escondidos en pistas.
- Usar lista, diccionario y clave cuando se describe una estructura de Python.
  Una ficha o un artículo es un dato del dominio representado por un diccionario;
  «objeto» sigue siendo válido al explicar identidad o elementos físicos.
- Escribir `None`, `True` y `False` al pedir valores Python. Explicar su
  representación `null`, `true` y `false` en JSON. PROGRAM conserva siempre el
  texto exacto de salida que exija su contrato, incluidas minúsculas.
- Mantener las técnicas como objetivos de práctica sin prometer que las salidas
  certifican el método. La receta progresiva pertenece a pistas y explicación de
  la referencia; no repetirla completa antes de que el alumno resuelva el reto.
- No cambiar identificadores, modalidades, recursos, casos ni ejemplos como
  efecto lateral de corregir vocabulario. No aplicar sustituciones globales sobre
  textos con fragmentos de código o JSON.

## Primer lote: 24 enunciados de datos, listas y recorridos

`prisma/python-editorial.ts` contiene revisiones explícitas, solo para Python,
aplicadas después de las adaptaciones de contrato de `python-content.ts`. Las
24 prácticas usan las tres secciones. Se retiran recetas duplicadas del reto,
conservando pistas y explicación de solución; tres juegos de pistas corrigen
«propiedades» o un `null` pedido como si fuera código Python. Cantidad opcional
corrige también objetivo y restricciones para hablar de claves.

Los ejemplos públicos siguen junto al enunciado, con sus explicaciones ya
existentes: no se duplican en otro bloque. Se conservan exactamente plantillas,
referencias, contratos, casos, artefactos, ejemplos y sus ayudas, orden, nivel,
duración y modalidad. `tests/python-editorial.test.ts` comprueba estructura,
vocabulario, excepciones relevantes y una huella previa de la evaluación de las
224 actividades; complementa, no sustituye, las pruebas ejecutables por actividad.

| Actividad | Revisión editorial |
| --- | --- |
| `logica-mayor-tres` | Diccionario y claves explícitas, con repetidos y negativos. |
| `logica-filtra-lista` | Lista nueva, límite incluido y orden/repeticiones conservados. |
| `logica-busqueda-lineal` | Diccionario de entrada y primera coincidencia desde índice cero. |
| `logica-ficha-resultado` | Ficha definida como diccionario; claves en vez de propiedades. |
| `logica-opcional` | Clave ausente distinta de cero y de None; restricciones y pistas coherentes. |
| `logica-auxiliares` | Regla de envío completa sin recetar la distribución entre auxiliares. |
| `logica-mediciones` | Diccionario de salida, vacío y None/JSON, sin receta de acumuladores. |
| `logica-carrito` | Diccionario exterior y artículos como diccionarios; descuento sobre el subtotal. |
| `logica-notas` | None en reto y pista, promedio sin truncar y aprobación inclusiva. |
| `logica-ordena-insercion` | Técnica como objetivo, sin describir todos los desplazamientos en el reto. |
| `logica-combina` | Dos listas, repetidos y vacíos; explicación de índices reservada a ayudas. |
| `logica-palindromo` | True/False Python frente a JSON, comparación literal y vacío. |
| `logica-pareja` | Índices, repetidos y desempate completos, sin receta de movimientos. |
| `logica-prefijos` | Definición de prefijo vacío y posición i como primeros i elementos. |
| `logica-ventana-fija` | Ventana definida como tramo, sin adelantar fórmula de actualización. |
| `logica-ventana-suma` | Positivos, objetivo inclusivo, lista vacía y longitud en vez de suma. |
| `logica-filas` | Matriz como lista de listas, filas irregulares y vacías conservadas. |
| `logica-diagonales` | Diccionario de diagonales y direcciones descritas sin fórmulas de índices. |
| `logica-pila` | Operaciones como listas Python y semántica LIFO, no implementación con pop. |
| `logica-cola` | Operaciones como listas Python y semántica FIFO, no implementación con pop(0). |
| `logica-suma-recursiva` | Recursión como objetivo y caso vacío, sin escribir la ecuación de solución. |
| `logica-une-intervalos` | Listas, contacto inclusivo y entrada desordenada. |
| `logica-segundo-maximo` | Valor distinto y ausencia como None, representada por null en JSON. |
| `logica-suma-maxima` | Tramo no vacío y consecutivo; conserva el caso completamente negativo. |

## Pendientes y límites

- El lote cubre **24/224 enunciados**, no el cierre editorial de todo el recorrido.
- Quedan los demás enunciados, teoría local y de módulos, vocabulario en otras
  ayudas y objetivos, revisión de ejemplos ya explicados, tiempos y textos de rutas.
- PROGRAM no se normaliza como FUNCTION. Los proyectos conservan sus contratos
  de archivos y persistencia; su repetición editorial se revisa por separado.
- No modifica el componente de presentación ni acredita revisión visual o
  accesibilidad. La jerarquía visual, teoría desplegable y ergonomía siguen en F.
- Las revisiones están en fuentes, no preparadas ni activadas en la base. La
  validación real y publicación requieren el entorno autorizado y su respaldo.
