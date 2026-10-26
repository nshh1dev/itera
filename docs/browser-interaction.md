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

Requiere autorización para iniciar la aplicación, una **base de pruebas preparada**
y Chromium instalado (`npx playwright install chromium`). En esta revisión se usa
una copia temporal: se aplican migraciones únicamente a la copia y se configura
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

Al terminar, comprobar que el servidor hijo se detuvo, retirar exclusivamente la
copia de base y perfiles creados para esta verificación y comparar los recuentos
y huellas de las tablas originales. No detener servicios ajenos para liberar puertos.

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
