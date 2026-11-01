# Teoría de módulos Python

## Alcance y criterio

Se revisan las teorías y ejemplos de los **57 módulos**: **31 ajustes explícitos
de teoría**, **26 textos conservados** y **ocho ejemplos sustituidos**. Las
revisiones están en `src/lib/python-module-theory.ts` y se aplican solo a la
secuencia Python antes de construir `learningModules`.

La teoría presenta herramientas y decisiones del bloque, no la solución completa
de cada actividad. Se retiran comparaciones incidentales con otros lenguajes,
se distinguen nombres de contenedores y campos y se respetan los modelos de datos
actuales. El texto no certifica técnicas, identidad, no mutación ni rendimiento
por comparar resultados. Los enunciados conservan los límites específicos.

No cambian autoevaluaciones, títulos y descripciones ya revisados, pasos, orden,
niveles, dependencias ni las 224 actividades. Las teorías locales de las
actividades y sus explicaciones de solución son superficies distintas y tienen
trabajo pendiente; esta revisión no las sustituye globalmente.

## Las 31 decisiones de revisión

| Módulo | Decisión |
| --- | --- |
| `variables` | Asignación y auxiliar Python, sin let, const ni anotaciones de otros lenguajes. |
| `entrada` | input por línea e int; distinguir programas de la posterior llamada solve(data). |
| `tipos-comparaciones` | =, ==, True/False y texto impreso true/false; sin anotaciones TypeScript. |
| `funciones` | def, sangría, return y consulta por clave de diccionario. |
| `decisiones` | if/elif/else y and/or/not, sin operadores alternativos ajenos a Python. |
| `repeticion` | range con fin exclusivo, avance de while y append. |
| `listas` | Índices, vacío e inicialización de máximo sin tipos number[]. |
| `textos` | Inmutabilidad y normalización según contrato, sin justificar ASCII por otros lenguajes. |
| `funciones-datos` | Ficha/registro como diccionario, respaldo de clave y None/null en JSON. |
| `alcance` | Ámbito de función frente a if/for, sin reglas de bloque de otros lenguajes. |
| `referencias` | Copia superficial y límites de los resultados; ejemplo plano antes de registros anidados. |
| `errores` | ValueError, validación contractual y captura específica, sin NaN ni catch unknown. |
| `pruebas` | assert, expectativas independientes y cobertura no acreditada por contadores. |
| `integracion-gastos` | main y pruebas.py diferenciados; sin describir los dos hitos como un único archivo. |
| `mapas` | Conjuntos y diccionarios para pertenencia/frecuencia; agrupación remitida al módulo siguiente. |
| `python-iteradores` | Consumo y agotamiento; ejemplo con map(int, ...) sin adelantar lambda. |
| `python-formato` | Texto con posiciones decimales frente a redondeo; se retira floor, ajeno al reto. |
| `python-registros-anidados` | Consulta con respaldo y cero; copia para actualización remitida a prácticas posteriores. |
| `modulos` | Contrato de nombres y archivos .py; sin CommonJS ni compilación TypeScript. |
| `archivos` | Texto/JSON, cierre, estructura y errores; reapertura no equivale a segunda llamada. |
| `integracion-inventario` | Mutación declarada, rechazos por llamada y recuperación en proceso nuevo solo en el segundo hito. |
| `python-reporte-inventario` | Ficha como diccionario y céntimos; conservar contratos anteriores. |
| `python-academia` | Diccionarios anidados, None y cero; prácticas con estado recibido, no archivos persistentes. |
| `python-contactos` | Fichas como diccionarios; la agenda de tareas está después, no antes. |
| `integracion-agenda` | Tres hitos, reglas/pruebas propias y segundo proceso en los dos últimos. |
| `python-transformacion` | Copias y recuperación por campo; prácticas FUNCTION, no proyecto de disco. |
| `busqueda` | Intervalo y coste sin copias; el ejemplo define los índices antes de calcular medio. |
| `estado-recursion` | Vacío e IndexError, pila/cola y memoria de llamadas, sin undefined. |
| `arboles` | value/left/right, None/null, altura en nodos y restricciones heredadas. |
| `prioridades` | La raíz no tiene padre; hijos válidos, orden parcial y representación/desempates por contrato. |
| `integracion-avanzada` | Condición monótona y planificación en paralelo; sin repetir la introducción de lambda de otro bloque. |

## Los 26 textos conservados

Se mantienen tras contrastar su alcance con sus actividades, no por compartir
origen con otro lenguaje. Estos módulos no necesitan un reemplazo en el mapa.

| Módulos | Motivo de conservación |
| --- | --- |
| `instrucciones`, `operaciones`, `python-constantes` | Orden de ejecución, cálculo y convención de constantes con herramientas ya presentadas. |
| `python-decimales`, `seguimiento`, `integracion-inicial` | Conversión válida, seguimiento manual e integración breve; no cambian contratos. |
| `python-expresion-condicional`, `python-control-bucle` | Dos alternativas, break y continue, con límites y avance explicados. |
| `python-busqueda-lineal`, `python-secuencias`, `python-tuplas` | Primera coincidencia, ordenación/corte/unión y parejas, sin prometer técnicas certificadas. |
| `python-identidad`, `python-diccionarios` | Igualdad/identidad, parámetros predeterminados y operaciones de claves. |
| `integracion-bases`, `python-conjuntos`, `python-agrupacion` | Integración, operaciones de conjuntos y listas por categoría con alcance diferenciado. |
| `python-comprensiones`, `python-agregacion`, `python-acumulacion-inventario` | Transformación/filtro, agregación/ordenación y acumulación que admite negativos. |
| `recorridos`, `matrices`, `copias-anidadas` | Intervalos y positivos, dimensiones y copia por filas para celdas numéricas. |
| `integracion-intermedia`, `exploracion`, `dinamica`, `grafos` | Invariantes, restauración de decisiones, estados y modelos de conexiones. |

## Ejemplos y comprobación local

Los ocho ejemplos sustituidos son `referencias`, `integracion-gastos`,
`python-iteradores`, `python-registros-anidados`, `integracion-inventario`,
`integracion-agenda`, `busqueda` e `integracion-avanzada`. Se ajustan al concepto
del bloque, no reutilizan la resta genérica ni adelantan modelos innecesarios.
Los otros 49 ejemplos conservan su código.

`tests/python-module-theory.test.ts` ejecuta los **57 ejemplos fijos del
repositorio** con salidas o valores esperados redactados independientemente.
Comprueba, entre otros, cero frente a ausencia, agotamiento, copia/alias,
reapertura y condición monótona. Cada ejemplo tiene un directorio temporal propio
que se elimina; input recibe un texto fijo y el ejemplo de módulos materializa
medidas.py y ejecuta por separado el fragmento main.py. No se ejecuta código
enviado por estudiantes ni se utiliza el disco del producto como almacenamiento.
La simulación no acredita Piston, aislamiento ni persistencia entre procesos;
el ejemplo de inventario muestra únicamente reapertura en el mismo proceso.

La prueba de vocabulario recorre las 57 teorías y el inventario explícito de
ajustes. Una huella del inventario previo excluye solo las 31 teorías y los ocho
ejemplos Python sustituidos: protege todos los demás campos, incluidos títulos,
autoevaluaciones, teorías conservadas y ejemplos de otros lenguajes. La huella
anterior de rutas/módulos se separa por superficies, conservando documentado su
valor histórico. Las fuentes comunes y la huella completa de las 224 actividades
siguen intactas; no hace falta registrar otra entrega de contenido persistido.

## Límites pendientes

La interfaz toma esta proyección bajo las condiciones de currículo Python que
ya aplicaba al resolver sus módulos. No se activa contenido ni se modifica la
base. Quedan teoría local y explicaciones de actividades, revisión de ejemplos
públicos ya explicados y repeticiones entre superficies. La presentación de
teoría desplegable, comprobación visual y accesibilidad pertenecen a F y no se
dan por aprobadas mediante estas pruebas locales.
