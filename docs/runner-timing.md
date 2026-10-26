# Medición de duración con Piston real

## Alcance

`tests/runner-timing.integration.ts` mide consultas de runtime, casos secuenciales,
comparación y comprobación conceptual mediante el adaptador real de Itera. Solo
ejecuta referencias fijas del repositorio y un bucle infinito fijo dentro de Piston;
nunca ejecuta código de estudiantes en Node/Next ni necesita una base de datos.

Por cada lenguaje, sin paralelismo:

- **FUNCTION**: referencia del currículo con mayor número de casos, sin regla
  conceptual, tres veces. El desempate por slug hace reproducible la selección.
- **PROGRAM + concepto**: referencia guiada con regla conceptual y mayor número
  de casos, tres veces. Incluye el parser AST de Python o TypeScript que corresponde
  al lenguaje; JavaScript también utiliza el parser TypeScript.
- **Diez tiempos agotados**: una evaluación secuencial de diez bucles infinitos
  fijos. Cada caso debe terminar como `timeout`; se conservan los límites reales
  de CPU, ejecución, compilación y transporte. No se agregan pausas artificiales.

Cada muestra registra runtime, referencia, número de casos, consulta de runtime,
mínimo/máximo de duración por caso, fase conceptual, duración total, presupuesto
calculado por `submissionBudgetMs` y margen restante. Los tiempos usan el reloj
monotónico `performance.now()`; el total incluye el adaptador y las aserciones.
Solo se imprimen agregados: no entradas, salidas, código ni datos de estudiantes.

La prueba exige los veredictos esperados, que cada caso termine antes del límite
HTTP y que el conjunto quede dentro del presupuesto global. No exige una velocidad
concreta: la compilación depende de la máquina y de la carga.

## Repetir

Requiere autorización para iniciar Docker/WSL/Piston. Usar una instalación de Piston
ya preparada con Python, JavaScript y TypeScript. No hace falta arrancar Next,
PostgreSQL, ejecutar setup, migrar, sembrar ni publicar el catálogo.

Desde la raíz, con Piston accesible en el destino local configurado:

```powershell
$env:ITERA_RUNNER_TIMING = "1"
npx.cmd tsx --conditions=react-server --test tests/runner-timing.integration.ts
Remove-Item Env:ITERA_RUNNER_TIMING
```

La condición `react-server` permite importar el adaptador `server-only`. El archivo
queda fuera de `tests/*.test.ts`: `npm test` y CI no inician Docker implícitamente.
Sin la variable se omiten los tres recorridos **sin consultar Piston**; con ella,
un runtime ausente o una interrupción hace fallar la prueba, no la omite.

Esperar varios minutos. No ejecutar otras suites del sandbox simultáneamente si
se pretende comparar resultados sin carga inducida. Registrar el estado inicial
de los servicios y apagar al terminar solo lo iniciado para esta medición; nunca
eliminar volúmenes. En WSL, mantener una sesión activa mientras dure la prueba.

## Interpretación y límites

- Comparar el presupuesto vigente, el mínimo histórico de 120 segundos y las
  duraciones observadas. No reducir márgenes a partir de unas pocas muestras.
- Esta medición **no llama `evaluateSubmission` ni los endpoints**: no mide cola,
  bloqueos/consultas PostgreSQL, `after()`, persistencia, sondeo ni latencia del
  navegador. La fórmula conserva 30 segundos adicionales para estado/finalización;
  esta prueba no demuestra que ese margen baste bajo cualquier carga.
- Tres muestras por referencia y una de diez tiempos agotados no son un percentil
  de producción, benchmark de saturación ni garantía universal de duración. Tampoco
  certifican el aislamiento del sandbox; existen otras pruebas específicas.
- La selección utiliza el catálogo fuente, no afirma que esas mismas revisiones
  estén publicadas en una base local. No modifica catálogos ni progreso.
- Resultados fechados, fallos previos y decisión sobre los límites:
  [verification.md](verification.md).
