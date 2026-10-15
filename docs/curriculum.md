# Currículo de fundamentos y algoritmos

## Alcance

El currículo enseña programación y resolución de problemas, no desarrollo web, frameworks ni todas las bibliotecas de cada lenguaje. Se puede elegir Python, JavaScript o TypeScript desde el inicio; TypeScript no exige haber estudiado JavaScript.

`src/lib/learning-modules.ts` es la fuente del orden y la organización didáctica. Cada módulo contiene objetivo, teoría breve, ejemplos por lenguaje y criterios de autoevaluación. `learning-paths.ts` deriva sus secuencias de esos módulos. La navegación persistida se actualiza explícitamente con `content:paths`.

## Etapas y competencias de salida

| Ruta | Módulos | Al terminar |
| --- | --- | --- |
| Principiante · Desde cero | Instrucciones; valores y variables; entradas y operaciones; funciones y retorno; cierre inicial. | Escribir un programa pequeño, explicar su orden, usar datos variables y distinguir imprimir de devolver. |
| Principiante · Construye tus bases | Decisiones; listas y recorridos; textos; funciones y contratos; integración. | Combinar condiciones, bucles y funciones sin una receta, tratar ausencias y proponer casos límite. |
| Intermedio · Conecta las ideas | Mapas y conjuntos; agregaciones y matrices; búsqueda y orden; estado y recursión; ventanas e integración. | Elegir estructuras, reutilizar funciones con distintos tipos de datos y justificar una estrategia sencilla. |
| Avanzado · Ve un paso más allá | Divide y vencerás/backtracking; programación dinámica; árboles; grafos; integración de estrategias. | Argumentar corrección, coste y limitaciones, comparar alternativas y buscar contraejemplos. |

La progresión es entender → observar → completar → resolver → integrar, no una obligación de cinco ejercicios por concepto. La observación de una función sigue resuelta; las demás plantillas no superan todos sus casos. Un error lógico puede coincidir con algún caso, por lo que no se exige que una plantilla falle absolutamente todos.

Los retos de cierre son `presupuesto-de-merienda`, `resumen-de-mediciones`, `ranking-de-frecuencias` y `planifica-entregas`. Las casillas «Estás preparado para continuar si puedes…» son una autoevaluación no persistida: no certifican dominio, no actualizan progreso y no bloquean el siguiente nivel.

## Revisión y conservación del catálogo

- Se conservan las identidades anteriores, sus contratos de entrada/salida, referencias y casos históricos. Se reorganizan por módulos y se añade teoría contextual, sin reconstruir la aplicación.
- Se añaden actividades nuevas para secuencia, variables, actualizaciones, tipos básicos, conversiones, expresiones, mensajes, depuración, ausencia, opcionales, reutilización genérica y los cierres. Los conceptos nuevos no se atribuyen automáticamente al progreso anterior.
- Se adaptan los enunciados introductorios al lenguaje de la variante. Otros problemas conservan su formulación común y sus ejemplos de entrada/salida, junto con teoría y ejemplos de código del lenguaje elegido. No se afirma que todos los enunciados históricos hayan recibido una reescritura individual.
- Las pruebas verifican valores y tipos; no demuestran que se haya empleado una técnica concreta ni una complejidad determinada. En actividades de salida fija se declara que imprimir directamente la respuesta puede coincidir con el resultado, aunque didácticamente se pida practicar un cálculo.
- No se eliminan ejercicios, versiones, borradores, envíos ni progreso. En una base existente las revisiones son versiones nuevas, no cambios sobre contenido publicado. El progreso sigue separado por ejercicio y lenguaje.

## TypeScript

Las referencias comparten el algoritmo con JavaScript, pero tienen contratos editoriales explícitos en `prisma/typescript-content.ts`: tipos de entrada y salida, anotaciones locales, estructuras recursivas y comprobaciones de ausencia. No se infieren contratos desde los tests ni se utiliza `any`, `@ts-ignore` o `@ts-nocheck` en las referencias o plantillas.

La ruta inicial presenta inferencia y anotaciones simples; las funciones introducen firmas y propiedades; las bases añaden uniones y opcionales; las colecciones presentan `Record`, interfaces y genéricos. `reutiliza-una-funcion` practica la relación entre entrada y retorno de una función genérica. El contrato comprueba también esa función auxiliar, no solo el JSON final.

### Ejecución

1. `runner:setup` instala el paquete nativo `typescript` de Piston además de los otros runtimes.
2. Piston compila un conductor fijo. El código enviado está codificado como literal JSON, no interpolado como instrucciones del conductor.
3. Dentro del sandbox, el conductor escribe `submission.ts` y ejecuta `tsc --strict --noEmitOnError --target ES2022 --module commonjs`.
4. En modo función añade el `typeContract` de la variante. Si falla la compilación, devuelve los diagnósticos y no ejecuta el archivo emitido.
5. Solo después se ejecuta el JavaScript resultante con Node dentro del mismo sandbox y se aplica el juez correspondiente.

No se ejecuta ni compila código enviado en Next.js. La suite editorial sí compila y ejecuta referencias fijas del repositorio para comprobar su contenido; no forma parte del servidor. Los diagnósticos y salidas de casos ocultos siguen filtrados por el juez.

Monaco usa diagnósticos estrictos locales. La declaración de `require('fs').readFileSync` describe exclusivamente la lectura preparada en las plantillas, no es una dependencia del navegador ni una promesa de acceso al sistema de archivos de la aplicación.

## Actualizar una instalación existente

Con PostgreSQL preparado, sin necesidad de iniciar Next:

```sh
npm run db:migrate
npx prisma generate
npm run db:seed
npm run content:revisions
npm run content:revisions -- --apply
npm run content:paths -- --apply
```

`content:revisions` valida todo el catálogo y crea solo versiones en borrador para identidades existentes. Es idempotente: una revisión idéntica no crea otra versión; un borrador distinto se conserva y se informa como conflicto. No publica ni necesita Piston para preparar borradores.

Después el propietario debe iniciar Docker/Piston y ejecutar `npm run runner:setup`. Comprobar con `npm run test:runner`; en administración, validar y publicar cada revisión. No se debe publicar por haber aprobado únicamente las pruebas locales de referencias. Si una versión antigua no tiene TypeScript, la interfaz lo indica y ofrece sus lenguajes disponibles en lugar de usar silenciosamente otra versión.

El seed sigue incorporando identidades nuevas como contenido editorial inicial, con referencias comprobadas localmente. Esto no acredita la compatibilidad real del adaptador con Piston. Las limitaciones de la entrega están en [verification.md](verification.md).
