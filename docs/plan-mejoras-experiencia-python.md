# Plan de implementación: experiencia de uso y recorrido de Python

Fecha: 30 de octubre de 2026.

Estado: implementación iniciada en `feat/experiencia-recorrido-python`. No iniciar servicios sin autorización. Las fases sin verificar siguen pendientes.

### Avance del primer lote

- Implementados los accesos de portada sin slugs históricos, el logo hacia Inicio y la explicación anticipada del requisito de cuenta.
- Implementada navegación contigua en práctica libre y retorno al catálogo al terminar; la continuación libre deja de saltar por categoría.
- La lista de Rutas comparte la recomendación de Inicio para el lenguaje seleccionado.
- Verificación del lote: lint, tipos, 368 pruebas y build correctos. Sin E2E, navegador ni Piston real: no se han iniciado servicios. Los avisos de Better Auth durante pruebas de seguridad no producen fallos.
- Pendientes la comprobación en navegador, la conservación de filtros/contexto de historial, los ajustes restantes de recomendaciones y las fases B–F. No se ha publicado contenido ni consultado la base activa.

### Avance del segundo lote

- Implementada la bienvenida breve con salida directa a la ruta tras guardar, diagnóstico secundario y retorno prioritario al ejercicio de origen al registrarse.
- Los pasos antiguos 1/2/4 convergen en personalización; el paso 3 conserva el acceso optativo al diagnóstico. No se borran diagnósticos ni cambia su interpretación histórica.
- Actualizados el indicador de dos pasos, el título orientativo del diagnóstico, las pruebas de acciones/página y los recorridos E2E afectados.
- Verificación del lote: lint, tipos, 374 pruebas y build correctos. Corregida una incompatibilidad de inferencia de Prisma detectada por tipos durante el desarrollo; el chequeo posterior y el build aprobaron. E2E actualizado, pero no ejecutado.
- Pendientes la ejecución de E2E y revisión visual con entorno autorizado. Este lote no modifica las reglas v1 del diagnóstico, la organización de Configuración/Progreso ni el contenido Python.

### Avance del tercer lote

- Configuración agrupa datos personales, acceso y desactivación en Mi cuenta, junto a Aprendizaje y Apariencia. Los enlaces antiguos conservan su URL y enfocan el bloque equivalente; los formularios siguen montados.
- Progreso prioriza resumen, continuación compartida e historial; las categorías quedan plegadas, sin eliminar registros ni cambiar las consultas y límites de archivos históricos.
- Añadidas pruebas sin servicios para agrupación, continuidad, paginación y aislamiento, y un recorrido E2E de enlaces antiguos, foco y edición pendiente. La ejecución E2E y la revisión visual siguen pendientes de entorno autorizado.
- Verificación del lote: lint, tipos, 378 pruebas y build correctos. Se corrigieron los dobles y aserciones de las pruebas nuevas durante el desarrollo. No se iniciaron servicios ni se modificó el catálogo publicado.

### Avance del cuarto lote

- Revisadas las 12 plantillas Python usadas por el diagnóstico; la matriz de capacidades y límites queda en `docs/learning-personalization.md`. Se conserva la selección y no se modifica el contenido publicado.
- Las nuevas sesiones Python fijan reglas v2: tres aciertos no hacen saltar automáticamente de etapa. El contraste permite explorar, no certifica dominio. Las sesiones v1 y los otros lenguajes conservan sus reglas históricas.
- La finalización usa `rulesVersion` persistida y conserva reanudación e idempotencia. No requiere migración ni escribe progreso. Verificación en navegador y Piston real pendiente.
- Verificación del lote: lint, tipos, 384 pruebas y build correctos. No se iniciaron servicios ni se modificó el catálogo publicado.

### Avance del quinto lote

- Reordenadas las fuentes Python sin cambiar las 224 identidades: búsqueda lineal junto a listas, copia exterior/interior explicada en referencias, inventario como acumulación → stock → módulos → persistencia → valoración, iteradores tras comprensiones y contactos/transformación después de sus herramientas.
- El tramo intermedio se presenta en tres grupos visuales y las categorías se proyectan desde la secuencia Python sin escribir `Exercise.category`. Catálogo, tarjetas, recomendaciones y progreso comparten la proyección; las rutas de JavaScript y TypeScript no cambian.
- Los prerrequisitos ya no son la cadena del ejercicio anterior: cada módulo declara dependencias relevantes, se validan anteriores y sin ciclos, y las posiciones/denominadores se recalculan desde la misma secuencia.
- Metadatos explícitos por módulo y excepciones Python para las actividades compartidas afectadas; los enunciados distinguen saldo acumulado con negativos de stock no negativo. La entrega de fuentes queda registrada en `prisma/python-releases.ts` a falta de preparación y activación.
- Verificación del lote: lint, tipos, 385 pruebas, build y `content:python` sin conexión correctos. No se iniciaron servicios, no se prepararon borradores y no se modificó el catálogo publicado. La comprobación visual, E2E, Piston real y la activación siguen pendientes de autorización.

## 1. Objetivo, alcance y cierre

Corregir las incoherencias de navegación, simplificar el acceso a la práctica y alinear los objetivos, enunciados, plantillas, ayudas y evaluaciones de Python. Mantener la dirección visual actual y mejorar la jerarquía de información.

- La interfaz y los flujos generales sí forman parte del alcance.
- La revisión educativa incluye las 224 actividades del recorrido Python, también sus variantes de ejercicios compartidos. No revisar ni alterar el contenido, contratos, orden o progreso de JavaScript y TypeScript.
- Conservar las cuatro rutas, los identificadores de ejercicios, versiones históricas, cuentas, borradores y progreso. Reordenar no recrea identidades ni reinicia finalizaciones.
- No añadir dependencias, migraciones o nuevos tipos persistidos de actividad sin justificar su necesidad y acordarlos antes. Preferir los mecanismos existentes.
- No convertir esta tarea en un rediseño completo ni en una ampliación del número de ejercicios.
- Este archivo es temporal: **eliminarlo únicamente al terminar y verificar toda la implementación**, después de trasladar los contratos y límites vigentes a la documentación permanente. Incluir su eliminación en el commit de cierre y comprobar el push.
- Si una fase queda bloqueada o una comprobación necesaria no puede realizarse, conservar el plan con el estado y el bloqueo concreto. No eliminarlo ni declarar la entrega completa.

## 2. Punto de partida y reglas de ejecución

La auditoría inicial fue de fuentes y funciones puras; no comprobó la publicación actual en PostgreSQL ni la apariencia en navegador. Sus métricas de referencia son 224 actividades, 48 incorporaciones clasificadas como Fundamentos y 153 actividades con al menos un ejemplo público sin explicación. Recalcularlas antes de editar.

- [ ] Revisar `AGENTS.md`, estado de Git, rama, seguimiento, remoto y cambios locales. Investigar y preservar el trabajo ajeno; `next-env.d.ts` ya estaba modificado durante la planificación.
- [ ] Crear una rama descriptiva para la implementación amplia, por ejemplo `feat/experiencia-recorrido-python`, respetando las protecciones y el estado remoto.
- [ ] Leer las guías pertinentes de `node_modules/next/dist/docs/` antes de modificar código de Next.js.
- [ ] Consultar `docs/recorrido-python.md`, `docs/educational-validation.md`, `docs/project-execution.md`, `docs/learning-experience.md`, `docs/learning-personalization.md`, `docs/browser-interaction.md` y las guías del modo local utilizado.
- [ ] Identificar si se usa Docker o modo nativo. Pedir permiso antes de iniciar la aplicación o servicios necesarios para pruebas. No detener servicios que haya iniciado el usuario.
- [ ] Obtener, cuando esté disponible el entorno autorizado, una instantánea de solo lectura del catálogo publicado y de sus revisiones. Distinguir discrepancias de instalación de defectos de fuentes.
- [ ] Registrar una matriz de revisión por actividad: objetivo, modalidad, conocimientos previos, contrato, plantilla, referencia, casos, ayudas y decisión editorial. Guardar el resultado duradero en la documentación existente, no depender de este plan para reconstruir decisiones.

**Salida de esta fase:** alcance confirmado, diferencias con la auditoría identificadas y una lista trazable de las 224 actividades, sin tratar la validación estructural como validación pedagógica.

## 3. Fase A — Entrada, continuidad y recomendaciones

### A1. Reparar y unificar las entradas a la práctica

- [ ] Sustituir los enlaces históricos de «Empezar» y «Abrir editor» de `src/app/page.tsx` por destinos publicados del recorrido vigente.
- [ ] Dar a la portada una acción principal clara y una secundaria para explorar rutas. Reducir el buscador, accesos repetidos y cierre promocional a lo que aporte una decisión distinta.
- [ ] Para visitantes, orientar la entrada principal a Desde cero en Python, con cambio de lenguaje disponible antes de ejecutar. Para cuentas, respetar su preferencia y continuidad.
- [ ] Hacer que el logo del espacio de trabajo lleve a Inicio; mantener el de la portada como acceso a la propia portada.
- [ ] Explicar antes de editar que la cuenta es necesaria para ejecutar y guardar progreso. La exploración y el borrador de invitado siguen disponibles.
- [ ] Conservar ejercicio, lenguaje, ruta y copia local durante registro/inicio de sesión; volver directamente al ejercicio cuando ese sea el origen.

**Aceptación:** ninguna acción principal depende de un slug retirado; el invitado conoce el requisito de sesión antes de invertir trabajo; autenticarse no cambia el ejercicio ni pierde código.

### A2. Separar secuencia de sugerencias relacionadas

- [ ] Definir anterior/siguiente como posiciones contiguas de la ruta activa; sin ruta, usar el orden curricular del lenguaje seleccionado.
- [ ] Reservar «Otro ejercicio relacionado» para una acción secundaria explícita. No usar su heurística como destino de las flechas secuenciales.
- [ ] Mantener la secuencia aunque haya ejercicios resueltos: avanzar manualmente no debe confundirse con buscar el siguiente pendiente.
- [ ] Conservar el contexto de ruta al retomar desde Inicio, actividad reciente e historial cuando sea válido. Para el retorno al catálogo, preservar filtros/página mediante un contexto validado o la navegación existente, sin aceptar destinos arbitrarios.
- [ ] Resolver los finales de ruta y catálogo con un cierre o retorno visible, sin bucles silenciosos hacia el inicio.

Archivos principales: `src/lib/practice-navigation.ts`, `src/lib/learning-paths.ts`, `src/app/(workspace)/ejercicios/[slug]/page.tsx`, `src/components/practice/workspace.tsx`.

**Aceptación:** los casos auditados de filtrar listas, contar palabras y transformar registros tienen continuidad predecible; anterior/siguiente es coherente en ambos sentidos y no pierde lenguaje o ruta.

### A3. Compartir el criterio de recomendación

- [ ] Unificar la resolución de «continuar»: pendiente iniciado del lenguaje seleccionado; continuidad válida de su contexto; punto de partida del perfil cuando no haya actividad; primer pendiente disponible como respaldo.
- [ ] Aplicar el mismo resultado a Inicio y a la ruta destacada. En Aprendizaje, distinguir el punto de partida guardado de la actividad que se está retomando.
- [ ] Mostrar una razón breve cuando se retoma un borrador o se propone una ruta por perfil. Una simple visita no debe presentarse como ejercicio iniciado.
- [ ] Conservar el lenguaje explícitamente seleccionado al navegar por Rutas, Ejercicios y Progreso; distinguirlo de un cambio persistente de preferencia.
- [ ] Tratar catálogos vacíos, retiradas de ejercicios, rutas completadas y ausencia de perfil sin sugerir contenido inexistente.

Archivos principales: `src/server/practice-navigation.ts`, `src/lib/practice-navigation.ts`, `src/server/learning.ts`, páginas de Inicio/Rutas y `src/components/starting-point.tsx`.

**Aceptación:** una cuenta intermedia sin actividad recibe un punto de partida coherente; una cuenta con borradores recibe la misma continuación en Inicio y Rutas; el historial de otro lenguaje no sustituye la selección actual.

## 4. Fase B — Simplificar pantallas y flujos

### B1. Bienvenida breve y diagnóstico opcional

- [x] Reducir la bienvenida a una pantalla breve de lenguaje y punto de partida con acceso directo a la ruta. Incorporar el resumen a esa misma decisión, sin otro paso obligatorio.
- [x] Retirar la pantalla redundante «Tu cuenta está creada» del recorrido, también al usar Atrás.
- [x] Si el registro procede de un ejercicio, priorizar el retorno a ese ejercicio y permitir completar preferencias después.
- [x] Mantener una entrada secundaria al diagnóstico desde Aprendizaje y, si resulta útil, desde la bienvenida, sin interponerlo antes de practicar.
- [x] Compatibilizar cuentas con `onboardingStep` 0, 2, 3 y 4 y enlaces antiguos `paso`/`volver`; no exigir un reinicio de cuentas ni borrar diagnósticos pendientes.
- [x] Ajustar el indicador de pasos, enlaces de reanudación y mensajes para que describan el flujo nuevo.

Implementación y pruebas sin servicios completadas; aceptación en navegador pendiente.

### B2. Ajustar la promesa y las reglas del diagnóstico

- [x] Cambiar «Descubre tu nivel» por «Encuentra un punto de partida» y diferenciar declaración, orientación y ejercicios completados.
- [x] Revisar la selección Python: identificar cuánto resuelven las plantillas y qué competencias permiten observar realmente los dos retos y el contraste opcional.
- [x] Evitar recomendar saltar una etapa completa basándose únicamente en tres correcciones muy guiadas; proponer explorar o reforzar una ruta con una razón concreta.
- [x] Si cambian reglas o selección, versionarlas con el mecanismo existente y conservar las sesiones/resultados anteriores bajo su interpretación original. No modificar la selección educativa de otros lenguajes.
- [x] Mantener errores de infraestructura, retos omitidos y ejecuciones de ejemplos fuera de los fallos de conocimiento y del progreso.

### B3. Configuración y Progreso

- [x] Agrupar Configuración en Cuenta, Aprendizaje y Apariencia. Dentro de Cuenta, organizar datos personales, acceso y desactivación con sus controles actuales.
- [x] Mantener enlaces antiguos `seccion=seguridad` y `seccion=privacidad` mediante equivalencias al bloque correspondiente; conservar edición pendiente, foco y navegación atrás/adelante. Implementado; interacción pendiente de E2E.
- [x] En Progreso, priorizar resumen por lenguaje, continuación e historial. Dejar categorías, interpretación y archivos históricos como información secundaria desplegable.
- [x] Conservar acceso a todos los borradores e intentos históricos, su paginación y aislamiento por cuenta; simplificar presentación no significa eliminar datos.
- [x] Mantener Inicio como reanudación, Rutas como aprendizaje guiado y Ejercicios como biblioteca de búsqueda y repaso. No fusionar pantallas con funciones distintas.

Archivos principales: `src/components/auth-form.tsx`, `onboarding.tsx`, `onboarding-progress.tsx`, `learning-preferences.tsx`, `settings-page.tsx`, `diagnostic-workspace.tsx`, `src/server/learning-actions.ts`, `src/lib/learning-profile.ts` y páginas asociadas.

**Aceptación:** una cuenta nueva puede comenzar sin diagnóstico ni resumen intermedio; una cuenta antigua conserva acceso a preferencias, diagnósticos y seguridad; Progreso mantiene todo el historial con una jerarquía más simple.

## 5. Fase C — Modelo editorial y orden de Python

Esta fase precede a la reescritura extensa: acordar primero dónde y para qué se enseña cada concepto.

### C1. Aislar las revisiones por lenguaje

- [x] Aplicar cambios compartidos únicamente como revisiones Python desde `prisma/python-content.ts` y fuentes Python específicas. Evitar editar las fuentes comunes para resolver un problema exclusivo de este recorrido.
- [x] Sustituir reglas implícitas de modalidad, minutos y categoría por metadatos explícitos y revisados donde sea necesario.
- [x] Resolver las categorías con conciencia del modelo: `Exercise.category` es compartido y el instalador Python no actualiza categorías existentes. Usar una proyección Python consistente para filtros, tarjetas, recomendaciones y progreso; cualquier persistencia adicional necesita acuerdo previo.
- [x] Cubrir la activación de cambios de orden/metadatos: el marcador `python-constante` detecta el recorrido, no cada revisión posterior. Coordinar la publicación y la entrega de fuentes, o usar una selección de revisión comprobada, para no mostrar un recorrido nuevo con contenido antiguo durante un estado intermedio.

### C2. Reordenar manteniendo identidades

- [x] Acercar búsqueda lineal al bloque de listas y control del recorrido. Mantener búsqueda binaria y ordenación algorítmica en intermedio.
- [x] Adelantar la explicación de copia exterior/interior antes de agrupación y academia. Mantener la actividad de matrices como aplicación posterior, con metadatos que no afirmen que es la primera introducción.
- [x] Reordenar inventario: acumulación por producto → reglas de stock → módulos → persistencia → valoración. Integrarlo con los bloques de módulos/archivos sin anticipar sus dependencias.
- [x] Explicar expresamente que saldo acumulado con negativos y stock no negativo son modelos distintos; no cambiar silenciosamente contratos históricos.
- [x] Agrupar visualmente el tramo intermedio en Colecciones y transformación, Proyectos y persistencia, y Algoritmos y estructuras, conservando sus módulos y las cuatro rutas.
- [x] Revisar el lugar de iteradores, generadores, `map`, `filter`, contactos y transformaciones para que cada ampliación llegue tras sus herramientas necesarias.
- [x] Separar posición curricular de prerrequisito: reemplazar la cadena automática del ejercicio anterior por dependencias relevantes, anteriores en el recorrido y sin ciclos.
- [x] Recalcular posiciones, denominadores, cierres de módulo, navegación y recomendaciones desde una única proyección Python.

Archivos principales: `src/lib/python-curriculum.ts`, `src/lib/language-curriculum.ts`, `src/lib/learning-modules.ts`, `prisma/python-content.ts`, `prisma/python-install.ts` y pruebas de currículo/catálogo.

**Aceptación:** siguen existiendo las mismas 224 identidades; no hay dependencias posteriores o cíclicas; inventario sencillo prepara al persistente; las 48 incorporaciones tienen categorías útiles; el catálogo y las rutas de JavaScript/TypeScript no cambian.

## 6. Fase D — Corregir objetivos, contratos y evaluación Python

### D1. Actividades prioritarias

| Actividad | Implementación prevista | Evidencia de aceptación |
| --- | --- | --- |
| `python-identidad` | Contrastar original, alias y copia mediante igualdad, identidad y efectos observables; evitar reducir la actividad a dos verdaderos constantes. | Se observa una copia igual pero distinta y se distingue mutar un alias de mutar una copia. La ayuda no promete certificar identidad solo por JSON. |
| `python-decimal` | Dejar por completar la conversión que constituye el objetivo; conservar lectura preparada y formato de salida explícito. | La plantilla no realiza ya la habilidad evaluada; casos cero, negativo y resultado con `.0`. |
| `python-constante` | Clasificar como guiada; hacer que el alumno construya/use la equivalencia y añadir una transferencia explicada dentro de la actividad o su repaso. | Objetivo, plantilla y comprobación coherentes; evaluar si una regla secuencial existente es aplicable sin inventar certificación de mayúsculas. |
| `python-academia-resume` | Añadir medias fraccionarias, ausencia, cero y empates/desempates con valores próximos. | Una implementación que trunque medias falla; notas pendientes y ceros mantienen su significado. |
| `python-academia-califica` | Añadir cambios válidos intermedios y en 100, nota negativa, actualización de una previa y conservación de otros cursos. | Rechazar todas las notas salvo cero ya no supera los casos. |
| `python-contactos-edita` | Añadir edición válida de correo, teléfono y ambos; campos no permitidos, valores no textuales y normalización del nombre. | Ignorar siempre correo o descartar texto vacío produce un fallo observable. |
| `logica-pruebas-limites` | Dar una actividad donde seleccionar o ejecutar pruebas permita descubrir defectos conocidos; utilizar el soporte de proyectos/pruebas si resulta necesario. | Casos positivos repetidos no bastan; el alumno debe distinguir vacío y negativos. No acreditar calidad de tests por un contador o mensaje autodeclarado. |
| `logica-reproduce-fallo` | Retirar del reto inicial la causa exacta y su corrección; presentar síntoma/contrato y reservar caso mínimo y diagnóstico para pistas progresivas. | Se puede investigar el fallo antes de leer la respuesta; regresión explicada y comprobable. |

**Estado:** implementado y cubierto por `tests/python-curriculum.test.ts`. `python-constante` conserva la modalidad guiada y no usa una regla conceptual nueva: las reglas existentes no certifican mayúsculas y no se inventó un AST para ello. Las referencias y plantillas de las actividades prioritarias se ejecutan en la comprobación local de fuentes; la validación en Piston real sigue pendiente de autorización.

### D2. Revisar el resto del recorrido, no solo los casos señalados

- [ ] Auditar las 224 variantes por bloques: inicio, bases, intermedio y avanzado. Marcar cuáles necesitan cambios y justificar las que se mantienen.
- [x] Revisar especialmente `break`, `continue`, comprensiones, `map`, `filter`, generadores, parámetros opcionales, aserciones y excepciones: distinguir uso recomendado de requisito realmente comprobado.
- [x] Usar modalidades existentes: guiada cuando se completa/corrige una herramienta, práctica para resolver y integración para combinar. Presentar observación como una actividad guiada sin introducir de entrada otro tipo persistido.
- [x] No ampliar indiscriminadamente el AST a funciones, bucles o técnicas avanzadas. Preferir comportamiento observable, trazas, predicción y pruebas que distingan errores reales. Una ampliación del contrato conceptual exige diseño y acuerdo separado.
- [ ] Comprobar coherencia de «no modificar la entrada»: cuando sea central al aprendizaje, observar también el original mediante un contrato o prueba compatible; no afirmar que comparar solo el retorno comprueba la ausencia de mutaciones.
- [x] Revisar `logica-captura-conversion` y las conversiones posteriores: definir qué textos son válidos, qué excepción se trata y por qué se usa `int` o `float`; evitar complejidad incidental de una referencia multilenguaje.
- [x] Unificar el modelo de árboles de las revisiones Python y describir todos sus campos. Si cambia la forma de entrada, crear versión nueva y mantener accesibles los borradores antiguos sin ejecutarlos silenciosamente con el contrato nuevo.
- [ ] Ajustar número de nodos, profundidad, recursión y serialización JSON a límites reales del ejecutor; probar árboles sesgados y balanceados. No resolverlo elevando límites globales a ciegas.
- [ ] Mantener respuestas esperadas independientes de la solución de referencia. Revisar casos vacíos, límites, duplicados, negativos, normalización, estados previos y errores de conservación según cada contrato.
- [ ] Comprobar que cada plantilla es utilizable y no resuelve ya toda la actividad. Preservar PROGRAM/FUNCTION y proyectos salvo necesidad editorial explícita documentada.

**Auditoría parcial:** las 224 entradas conservan sus identidades y superan la validación estructural editorial. Las 48 incorporaciones y las referencias revisadas se ejecutan localmente con sus plantillas; esto no equivale a una revisión pedagógica individual de las 224 actividades. Se añaden casos de árboles sesgados de profundidad 50 y uno equilibrado, pendientes de validación en Piston real. La comprobación local de no mutación de referencias no demuestra que el evaluador detecte mutaciones en cualquier solución enviada. Las actividades compartidas se pueden revisar solo para Python, sin alterar JavaScript/TypeScript. Quedan abiertos el inventario por bloques, la cobertura de errores representativos y la comprobación integral en el ejecutor. No se añadió AST ni un tipo persistido nuevo.

**Verificación del lote:** lint, tipos, 386 pruebas sin omisiones, build y `content:python` sin conexión aprobados tras revisar los cambios pendientes. Se conservó también la huella de la entrega anterior. Los avisos de Better Auth de rate limiting y origen inválido pertenecen a las pruebas existentes. No se inició la aplicación ni Piston, ni se preparó o activó contenido en la base. Continúan pendientes D2, E, F y la verificación final; el plan se conserva.

**Aceptación:** las referencias resuelven los contratos revisados, las plantillas requieren trabajo y los errores educativos representativos fallan por la razón esperada. Pasar estos casos no se presenta como prueba formal de dominio o técnica interna.

**Primer bloque de auditoría individual D2:** [auditoria-python.md](auditoria-python.md) registra las 32 actividades de iniciación: 25 mantenidas y 7 con aclaraciones de enunciado, sin cambiar contratos, casos, modalidades ni reglas conceptuales. Se comprobaron localmente sus referencias y plantillas, y un error representativo por actividad contra sus casos existentes. Ninguna plantilla resuelve todo; cada error se distingue de las respuestas esperadas, conservadas de forma independiente. Se aclaran diccionarios, booleanos y el alcance de predicción/trazas. No equivale a volver a validar AST ni Piston real. Quedan 192 actividades por auditar; D2 sigue abierta.

**Verificación del bloque de iniciación:** lint, tipos, 391 pruebas sin omisiones, build y `content:python` sin conexión aprobados. La prueba nueva recorre los 102 casos existentes del bloque para referencias, plantillas y errores fijos. No se iniciaron servicios ni se modificó la base; Piston, E2E y revisión visual siguen pendientes de autorización. Se conserva la huella anterior y se añade la revisión de enunciados.

**Segundo bloque D2, principiante:** [auditoria-python.md](auditoria-python.md) registra las 74 actividades: 59 mantenidas y 15 revisadas. Se aclaran vocabulario, ausencia, alias y actividades que partían de una plantilla vacía descrita como defectuosa. Se elimina el paso por float en la conversión de enteros Python y se explicita su gramática. Se añaden 12 casos ocultos sin modificar los anteriores. Cuatro errores representativos pasaban todos los casos previos y ahora se detectan: media truncada, último artículo, vocales acentuadas y formato decimal aceptado por float. La prueba local ejecuta 74 referencias, plantillas y errores fijos sobre 321 casos; distingue las dos mutaciones intencionales y comprueba los archivos/pruebas de referencia de los dos proyectos de gastos, sin simular que esto valida Piston. Quedan 118 actividades por auditar individualmente (82 intermedias y 36 avanzadas). D2 y el resto de E/F siguen abiertos.

**Verificación del bloque de principiante:** lint, tipos, 393 pruebas sin omisiones, build y `content:python` sin conexión aprobados. La validación inicial detectó que conversión superaba diez casos; se mantuvo el límite existente y se distribuyó la cobertura con recuperación por elementos. Se conserva la huella anterior y se añade la entrega verificada. No se iniciaron servicios ni se modificó la base. Piston real, E2E, revisión visual y activación siguen pendientes de autorización.

## 7. Fase E — Claridad editorial y ayudas

- [ ] Reescribir las revisiones Python con estructura consistente: tarea, entrada, resultado, reglas relevantes y ejemplos. Mantener el reto separado de la receta de resolución.
- [ ] Usar `None`, `True`, `False`, lista y diccionario en instrucciones Python; explicar su representación `null`/`true`/`false` en JSON sin mezclarla con código ejecutable.
- [ ] Definir ficha/registro como datos representados mediante diccionarios; evitar alternar términos sin explicación.
- [x] Añadir explicación a todos los ejemplos públicos que carezcan de ella, priorizando primero inicio y estructuras complejas. Cada explicación debe justificar la salida, no repetirla con otras palabras.
- [ ] Revisar los ejemplos ya explicados: coherencia con la variante, límites, secuencia y vocabulario aprendido.
- [ ] Reducir repetición entre objetivo, teoría local, teoría del módulo, condiciones y solución. Mantener pistas escalonadas y trasladar allí las soluciones anticipadas de retos independientes.
- [x] Sustituir el texto genérico de Coste por una explicación concreta de la estrategia cuando aporte valor; omitirlo en actividades donde solo añada ruido. No atribuir esa complejidad a cualquier solución aceptada.
- [ ] Revisar minutos orientativos por actividad y hacerlos coherentes con la cantidad de trabajo, especialmente proyectos frente a ejercicios de una operación.
- [ ] Revisar títulos y descripciones de rutas/módulos para reflejar el recorrido Python actualizado sin cambiar los textos educativos de otros lenguajes.

Archivos principales: `prisma/python-content.ts`, `prisma/python-lessons.ts`, `prisma/python-help.ts` y proyecciones Python de teoría y metadatos.

**Aceptación:** cero ejemplos públicos Python sin explicación editorial; los enunciados usan una terminología coherente; las ayudas no contradicen el contrato ni convierten inadvertidamente un desafío independiente en una receta completa.

**Lote de ejemplos:** los 433 ejemplos públicos de las 224 actividades tienen explicación editorial (antes faltaban 278 ejemplos en 153 actividades). Se empezó por las 32 actividades de iniciación y las 12 de árboles/matrices, y se completaron después los otros bloques. Las ayudas justifican operaciones, límites, recorridos, índices, estados iniciales, normalización y conservación de copias. Los booleanos distinguen `True`/`False` de la representación exigida en la salida. Las ayudas se proyectan solo sobre Python, conservando entradas, respuestas, orden, visibilidad y ayudas ocultas. Se redactaron a partir de los contratos, recursos y casos, no ejecutando las referencias para generar respuestas. La prueba exige cero ejemplos públicos sin ayuda y correspondencia por orden; no certifica por sí sola la calidad pedagógica de cada explicación. El resto de E sigue pendiente.

**Verificación del lote de ejemplos:** lint, tipos, 387 pruebas sin omisiones, build y `content:python` sin conexión aprobados sobre la entrega completa. Se conserva la huella del lote anterior y se registra la nueva. Los avisos esperados de Better Auth no son fallos nuevos. No se ejecutó E2E, revisión visual ni Piston real por falta de autorización de arranque; no se modificó la base ni se activó el catálogo.

**Lote de Coste:** se sustituyen los textos genéricos de las 48 actividades exclusivas y 18 compartidas de proyectos/módulos/archivos por 53 notas concretas y 13 omisiones explícitas. Se distingue la referencia de cualquier solución aceptada, incluidos textos, copias, listas materializadas y persistencia completa. Cada nota respeta los 200 caracteres del contrato editorial; no se amplían límites ni se mide código enviado. El resto de los costes conserva su contenido anterior. Este lote no cierra la auditoría D2 ni el resto de E.

**Verificación del lote de Coste:** lint, tipos, 389 pruebas sin omisiones, build y `content:python` sin conexión aprobados. La validación inicial detectó notas mayores de 200 caracteres; se acortaron sin cambiar el límite. Se conserva la huella anterior y se registra la revisión nueva. No se ejecutaron E2E, revisión visual ni Piston real: requieren autorización de arranque. No se iniciaron servicios ni se modificó o activó la base.

## 8. Fase F — Jerarquía visual y ergonomía

- [ ] Mantener paleta, componentes, fuentes locales, Monaco y preferencias existentes. Mejorar jerarquía y densidad antes que añadir superficies o tarjetas.
- [ ] Priorizar reto y ejemplos en el panel de enunciado. Situar la teoría contextual bajo una sección desplegable claramente identificada; mantener a la vista cualquier instrucción imprescindible para comenzar.
- [ ] Facilitar el acceso a pistas y solución sin recorrer primero todos los bloques secundarios; conservar revelación progresiva y petición autenticada independiente de la solución.
- [ ] Mejorar `Statement` con encabezados editoriales reconocibles, incluidos «Antes de resolver» y «Entrada y resultado», y presentación segura de identificadores/código cuando el formato lo indique. No interpretar HTML ni deducir sintaxis alterando el contrato.
- [ ] Mostrar JSON anidado con sangrado y saltos de línea; mantener valores simples compactos y la representación exacta de texto PROGRAM. Preservar navegación por teclado y lectura en pantallas estrechas.
- [ ] Revisar 1024–1199 px: medir ancho útil de ambos paneles y decidir si puede ofrecerse vista dividida sin perjudicar lectura/editor. Mantener pestañas donde no quepan; no cambiar el breakpoint sin evidencia visual.
- [ ] Consolidar mensajes sobre finalización y dominio: una explicación estable en Progreso y avisos breves solo cuando importen. Eliminar repeticiones dentro del diálogo de solución.
- [ ] Revisar claro/oscuro, foco, teclado, ampliación del texto/zoom real, movimiento reducido, diálogos y controles táctiles de las pantallas modificadas.

Archivos principales: `src/components/practice/{workspace,statement,examples,learning-guide,module-lesson,exercise-notes}.tsx`, `src/components/path-review.tsx`, páginas de Progreso/Rutas y `src/app/globals.css`.

**Aceptación:** la tarea principal se entiende sin leer ayudas duplicadas; ejemplos complejos son legibles; teoría y pistas siguen siendo encontrables; no aparecen desbordamientos ni pérdidas de foco o espacio esencial del editor.

## 9. Verificación por lotes y comprobación final

### Sin iniciar servicios

- [ ] Ejecutar validación estructural de Python y revisar métricas antes/después.
- [ ] Ampliar pruebas existentes de navegación, perfil, currículo, instalación y carga de catálogo con escenarios de usuario y conservación de datos, no snapshots que reflejen únicamente la implementación.
- [ ] Comprobar secuencias y recomendaciones: sin sesión, sin perfil, nivel intermedio, borrador pendiente, resuelto, fin de ruta, cambio de lenguaje y contenido retirado.
- [ ] Comprobar regresiones editoriales concretas: identidad/copia, decimales, medias fraccionarias, calificación válida, edición de correo, descubrimiento de fallos y contratos de árboles.
- [ ] Verificar que las revisiones Python no alteran fuentes, orden, variantes, contratos ni pruebas de JavaScript/TypeScript.
- [ ] Ejecutar `npm run lint`, `npm run typecheck`, `npm test` y `npm run build` sobre la entrega integrada. No ejecutar tipos a la vez que build regenera Prisma.
- [ ] Reutilizar resultados válidos cuando el código comprobado no cambie. No añadir pruebas para cada ajuste cosmético reversible ni repetir toda la suite por cambios solo documentales.

### Con entorno autorizado

- [ ] Probar navegación, registro desde ejercicio, retorno de invitado, bienvenida antigua/nueva, configuración y continuidad de rutas con cuentas temporales.
- [ ] Ejecutar los archivos E2E afectados completos cuando sean secuencias con estado. Elegir los scripts correspondientes al entorno; el E2E nativo inicia su propio servidor y requiere permiso.
- [ ] Validar referencias, plantillas y casos educativos reales mediante Piston. Todo código de alumno o variante experimental pasa por `src/server/execution/piston.ts`, nunca por el host web.
- [ ] Verificar diferencias visibles/ocultas, errores de infraestructura, ejemplos sin progreso, diagnóstico sin progreso y submit con finalización atómica por lenguaje.
- [ ] Revisar visualmente, como mínimo, 390, 768, 1024, 1199 y 1440 px, ambos temas y zoom real al 200 % con la infraestructura existente.
- [ ] No ejecutar suites del sandbox en paralelo cuando puedan interferir; no ejecutar lint mientras Playwright crea/elimina resultados.
- [ ] Informar por separado pruebas con doble HTTP, Piston real y revisión visual. Una suite omitida o saltada no es una aprobación.

## 10. Publicación local del catálogo y entrega

- [ ] Actualizar documentación permanente de continuidad, personalización, validación educativa, ayudas, experiencia visual y recorrido Python. Corregir descripciones antiguas que ya no correspondan al código.
- [ ] Revisar contratos cambiados y conservación de borradores de versiones anteriores; no sobrescribirlos con plantillas nuevas ni reinterpretar envíos históricos.
- [ ] Respaldar la base activa antes de publicar contenido. Seguir `docs/docker.md` o el procedimiento nativo, sin mezclar bases.
- [ ] Ejecutar `content:python` para validar fuentes; preparar y activar con `--prepare`/`--apply` en el entorno correcto. No usar `content:replace`, reset ni seed para esta revisión.
- [ ] Mantener comprobación de revisiones y protección ante borradores ajenos. No registrar una huella desconocida para eludir conflictos editoriales.
- [ ] Validar publicación atómica, huella final y preparación idempotente. Registrar la nueva entrega conocida solo después de verificarla conforme al procedimiento vigente.
- [ ] Comparar antes/después: 224 identidades Python, catálogo ajeno intacto, cuentas, progreso, borradores, envíos y versiones históricas conservados. Verificar que las categorías y el orden visibles coinciden con las fuentes activadas.
- [ ] Comprobar la instalación real, no solo el build: portada, recomendación inicial, navegación, una actividad revisada, su explicación y una evaluación en Piston.
- [ ] Detener únicamente servicios, procesos y contenedores iniciados para la tarea; conservar volúmenes y verificar puertos. Si el usuario pidió dejarlos activos, indicarlo expresamente.
- [ ] Preparar commits coherentes en español, con rutas explícitas, verificaciones y limitaciones. Hacer fetch antes de push; revisar diff preparado y `git diff --cached --check`.
- [ ] Transferir a la documentación permanente toda decisión necesaria para mantenimiento y dejar evidencia de verificaciones y limitaciones reales.
- [ ] **Eliminar `docs/plan-mejoras-experiencia-python.md` cuando todas las fases y comprobaciones exigibles estén terminadas.** Quitar cualquier enlace temporal que se hubiera añadido.
- [ ] Publicar el commit de cierre y verificar que la rama remota apunta al commit esperado. Si el push falla, resolverlo antes de declarar la entrega terminada.
- [ ] Entregar resumen con cambios, identificadores y enlace de GitHub, estado de activación local, pruebas realizadas y cambios locales ajenos restantes.

## 11. Secuencia de trabajo y condiciones de finalización

Orden recomendado: preparación → A (continuidad) → B (flujos) → C (modelo/orden Python) → D (evaluación) → E (claridad) → F (presentación) → verificación integrada → publicación local y cierre.

Dividir la entrega en lotes coherentes, comprobables y reversibles. Los cambios de contenido y su presentación/proyección deben entregarse juntos cuando una parte dependa de la otra. No publicar estados intermedios que presenten como disponible contenido aún no activado.

Se considera terminado únicamente cuando:

1. Los problemas de entrada, secuencia y recomendaciones están resueltos con escenarios comprobados.
2. La bienvenida, el diagnóstico, Configuración y Progreso siguen los flujos simplificados sin perder datos ni acceso.
3. Las 224 actividades Python están revisadas; las correcciones de objetivos, orden, contratos, casos, ejemplos y ayudas están activadas y verificadas.
4. Los otros lenguajes mantienen su contenido educativo y su progreso.
5. La interfaz modificada está comprobada en ambos temas, tamaños afectados y accesibilidad indicada.
6. Las comprobaciones pertinentes aprueban; los bloqueos necesarios están resueltos y la documentación permanente coincide con lo entregado.
7. La limpieza operativa está hecha, este plan está eliminado y el cierre está publicado y confirmado en GitHub.
