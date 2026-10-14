# Verificación local

## Cobertura automatizada

- 10 pruebas de dominio y herramientas locales.
- Las 24 referencias de Python y las 24 de JavaScript pasan los mismos 120 casos por lenguaje.
- 9 recorridos de navegador con Chromium: catálogo, registro, preferencias, borradores, evaluación, ayudas, responsive, conflictos entre pestañas, recuperación de contraseña, aislamiento entre cuentas y administración.
- El editor se sirve sin CDN y cambia de tema junto con el resto de la interfaz.
- El flujo de evaluación verifica idempotencia, progreso separado por lenguaje y ausencia de entradas, salidas y errores de pruebas ocultas en la respuesta pública.
- Se comprobó el ciclo de parada y arranque del clúster PostgreSQL del proyecto.

Las pruebas de navegador usan un doble HTTP de Piston en el puerto 2001. La configuración normal apunta al puerto 2000. **Esto verifica la integración, no el aislamiento real del motor.**

## Pendiente por infraestructura

Docker y WSL2 no están instalados en este equipo. Por tanto, todavía falta probar Piston real, sus runtimes y sus límites de ejecución. La aplicación devuelve un error explícito si no encuentra el ejecutor, sin fabricar resultados ni ejecutar programas en el servidor principal.

## Dependencias

`npm audit --omit=dev` no reporta vulnerabilidades en las dependencias de producción en la revisión inicial. Se fijan parches de DOMPurify y mysql2, y una versión compatible corregida de deepmerge-ts mediante `overrides`.

La auditoría completa aún informa la cadena `eslint-config-next → fast-glob → micromatch → braces` en herramientas de desarrollo. La versión publicada de `braces` consultada no tiene corrección; no se ha degradado Next.js ni ocultado el aviso. Las entradas de estos analizadores proceden de los archivos del proyecto.

## Repetir la comprobación

Con PostgreSQL iniciado y el puerto 3000 libre:

```sh
npm test
npm run lint
npm run typecheck
npm run build
npm run test:e2e
npm run doctor
```

Las capturas de referencia están en `.local/screenshots/`, excluidas de Git.
