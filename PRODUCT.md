# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Quien mantiene el proyecto y unos pocos principiantes cercanos que quieren
aprender lógica de programación. Nadie llega con experiencia previa ni con inglés
técnico: se trabaja en español, en la computadora de cada persona, sin cuenta en
servicios de terceros.

Situación de uso: sesiones cortas, a menudo retomando lo que quedó a medias. La
persona necesita saber qué hacer ahora, qué falló y cómo seguir sin depender de
nadie. Quien mantiene el proyecto también escribe el contenido editorial y lo
publica desde la administración.

## Product Purpose

Itera enseña lógica de programación con ejercicios originales en español y cuatro
rutas guiadas. Un ejercicio se entiende al probarlo: el programa se ejecuta en un
entorno aislado, el resultado se compara con el esperado y la diferencia se
explica. El progreso se registra por persona, ejercicio y lenguaje.

Se considera logrado cuando alguien sin experiencia previa completa un recorrido,
entiende por qué falló un intento y puede explicar su solución.

## Positioning

Aprendizaje con ejecución real y sin nube: cuentas, borradores y progreso viven en
la computadora de quien aprende, y el código se ejecuta en un entorno aislado
local en lugar de un servicio de terceros. La comparación ocurre fuera del
entorno de ejecución, y los casos ocultos nunca exponen entradas, salidas ni
errores brutos.

Los ejercicios y el currículo son originales y en español. Las ayudas —pistas
progresivas, coste orientativo, errores comunes y solución explicada— acompañan
sin bloquear ni conceder progreso.

## Operating Context

- Node.js 24 LTS, PostgreSQL 16 o superior y, solo para ejecutar código, Docker
  con contenedores Linux y cgroup v2.
- `npm run setup` prepara el clúster PostgreSQL privado, Prisma, las migraciones y
  el catálogo. Después, `npm run dev` levanta la base y Next.js en
  `http://127.0.0.1:3000`.
- La recuperación de contraseña escribe un enlace local: `.local/mail/` en modo
  nativo o volumen `local-mail` en Docker; no se envía correo real.
- El trabajo editorial ocurre desde `/admin`: nuevas versiones en borrador,
  validación contra el entorno de ejecución y publicación.
- Lint, tipos, pruebas unitarias y editoriales, build y recorridos de navegador
  son la puerta de cada entrega; sus límites quedan registrados en
  `docs/verification.md`.

## Capabilities and Constraints

- Tres lenguajes: Python, JavaScript y TypeScript; niveles Iniciación,
  Principiante, Intermedio y Avanzado. Comparten 136 ejercicios en idéntico orden.
- Dos contratos de ejercicio. **Función:** se implementa `solve(data)` y se
  devuelve un valor JSON. **Programa:** se escribe el archivo completo y su salida
  estándar se compara con el texto esperado.
- Catálogo con casos visibles y ocultos, historial de intentos y búsqueda que
  ignora acentos.
- Cuatro rutas de aprendizaje con módulos, teoría breve, ejemplos por lenguaje,
  autoevaluación y orden editorial. Los cierres orientan: no bloquean ni conceden
  progreso.
- Ejecución asíncrona con resultado por caso, resumen de la primera diferencia y
  progreso que solo otorgan las evaluaciones completas.
- Los envíos son idempotentes. Se permite una evaluación activa por persona y
  cuatro globales; cada programa dispone de 3 segundos, 256 MiB, 64 procesos y
  64 KiB de salida, sin red.
- Restricciones firmes: la interfaz y los ejercicios están en español; no hay IA,
  analítica externa ni servicios de pago; el código de quien aprende nunca se
  ejecuta en el proceso principal de la aplicación.
- Alcance: lógica de programación y algoritmos. La IA sigue aplazada.
  El currículo nuevo requiere validación completa en Piston antes de activarse.

## Brand Commitments

No hay compromisos de marca declarados como fijos. El nombre Itera, el lema «Un
intento más cerca», el español como idioma único y la paleta monocromática con
azul para acciones y verde solo para éxito son decisiones vigentes en el código,
sujetas a revisión caso por caso con el responsable del proyecto.

## Evidence on Hand

- Contenido real: 136 ejercicios del currículo común en cuatro rutas, con tres
  variantes por identidad. Las referencias y plantillas se comprueban en la suite
  editorial; el catálogo de 63 ejercicios pertenece a una etapa histórica.
- Documentación: `README.md`, `docs/roadmap.md` con los criterios pedagógicos,
  `docs/curriculum.md`, `docs/ui-redesign.md` y `docs/motion.md`.
- Sistema visual implementado y verificable en `src/app/globals.css` y en
  `src/components/ui/`.
- Verificaciones registradas en `docs/verification.md`, con sus límites
  declarados.
- Evidencia histórica de ejecución real: `docs/verification.md` registra activación
  del currículo y comprobaciones con Piston, incluidas ocho pruebas del adaptador
  y ocho recorridos en Docker el 21 de octubre de 2026. No son mediciones actuales
  ni una garantía absoluta de aislamiento. En las mejoras del 26 de octubre,
  Piston permanece apagado y su medición de duración efectiva sigue pendiente.
- Ausencias que no deben inventarse: no hay testimonios, clientes, métricas de
  aprendizaje ni observaciones con principiantes reales registradas.

## Product Principles

1. Comprender antes que acertar: el valor está en explicar el resultado, no en
   pasar el caso.
2. Local y propio: sin nube, sin cuentas de terceros y sin telemetría.
3. Ayuda que se retira: las pistas acompañan y disminuyen; nunca bloquean ni
   conceden progreso.
4. Confidencialidad del caso oculto: comparar y explicar sin revelar lo que no
   debe revelarse.
5. Contenido en español, escrito y revisado, no traducido por máquina.

## Accessibility & Inclusion

No hay un estándar formal declarado. Se aplican buenas prácticas: navegación
completa por teclado, foco visible, contraste suficiente, movimiento reducido
respetado y adaptación móvil. Cada mejora se decide al medir la superficie
correspondiente.
