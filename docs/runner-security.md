# Verificación de seguridad de Piston

## Alcance de esta entrega

`compose.yaml` declara red deshabilitada, cuatro trabajos simultáneos, 64 procesos
por trabajo, 256 MiB por etapa, 64 KiB por canal de salida, 2048 descriptores y
10.000.000 bytes por archivo. Ejecución: 12 s de pared y 10 s de CPU para permitir
el conductor TypeScript; el adaptador solicita 3 s para Python/JavaScript.
Compilación: 8 s de pared y CPU. Se explicitan archivos/descriptores con los
valores predeterminados del proyecto upstream; no se reducen sin probar runtimes.
Son valores solicitados: el código upstream divide archivos/memoria por 1000 al
invocar Isolate. La prueba de archivo admite hasta 10.240.000 bytes para cubrir
la conversión a KiB; no afirma que el techo efectivo sea exactamente el nominal.

Los nombres se contrastaron con el [configurador upstream](https://github.com/engineer-man/piston/blob/master/api/src/config.js).
Esto no prueba el contenido ni la configuración efectiva de la imagen fijada por
digest: hace falta verificarlos en la instalación real. Los tests estáticos solo
evitan cambios accidentales en las declaraciones, no certifican aislamiento.

## Suite real, explícita y acotada

Tras autorizar el entorno y preparar Piston, ejecutar desde PowerShell:

```powershell
$env:ITERA_RUNNER_SECURITY = "1"
npm.cmd run test:runner:security
Remove-Item Env:ITERA_RUNNER_SECURITY
```

En Docker completo, con los servicios ya activos, el equivalente es:

```powershell
node scripts/docker.mjs exec -T -e ITERA_RUNNER_SECURITY=1 app npm run test:runner:security
```

La suite no inicia servicios. Sin la variable, omite todas las sondas **sin
contactar Piston**. Con ella, un runtime ausente, fallo de conexión o respuesta
inconclusa falla: no se convierte en aprobado ni se omite silenciosamente.

Todas las sondas se envían por el adaptador habitual y se ejecutan en Python
dentro del sandbox. Comprueban:

- Solo loopback y ausencia de ruta IPv4 hacia una IP reservada de documentación.
  Un timeout o rechazo de conexión no basta para aprobar. No depende de Internet.
- Ausencia de nombres de secretos y rutas privadas conocidas, sin leer ni imprimir
  sus valores. No busca archivos ajenos ni certifica todos los montajes posibles.
- Un marcador sintético relativo que no sobrevive a otra ejecución.
- Límite efectivo `RLIMIT_FSIZE`, sin llenar disco.
- Emisión finita de 128 KiB, salida acotada y una ejecución sana posterior.

No hay bombas de procesos, asignaciones masivas de memoria ni intentos de escape.
La suite puede fallar si el ejecutor está ocupado: ejecutarla sin prácticas activas.
Las pruebas existentes `test:runner` cubren bucles y tiempo agotado; ambas suites
son independientes de E2E y no usan su doble HTTP.

## Lo que queda por comprobar

- Inspección autorizada de imagen/configuración efectiva, montajes, cgroups v2,
  límites de memoria/CPU/procesos y concurrencia bajo carga controlada.
- La sonda IPv4 y de interfaces no es una auditoría completa de IPv6 o sockets Unix.
- No hay presupuesto global de CPU/memoria del contenedor declarado aquí.
  Cuatro trabajos de 256 MiB no equivalen a un techo de 1 GiB del servicio.
- `privileged: true` sigue siendo necesario para esta integración de Isolate;
  Piston no es una frontera suficiente para código hostil en un servicio público.
- El límite de archivo no es una cuota total de disco. Los timeouts HTTP y la
  caducidad lógica de envíos no garantizan cancelar trabajos ya aceptados.

**Estado:** suite preparada, no ejecutada contra Piston. No se inició Docker/WSL,
Next ni PostgreSQL y no se certifica aislamiento real. Recrear manualmente Piston
es necesario para aplicar cambios de Compose; reconstruir solo la app no basta.
