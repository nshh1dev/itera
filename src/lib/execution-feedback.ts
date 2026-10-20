export function executionFeedback(status: string, error = "") {
  if (status === "timeout") return "El programa tardó demasiado. Revisa si un bucle termina y si puedes evitar trabajo repetido.";
  if (/SyntaxError|IndentationError|TabError/.test(error)) return "Hay un problema de sintaxis. Revisa la línea indicada, los signos y la sangría.";
  if (/NameError|ReferenceError/.test(error)) return "No se reconoce un nombre. Comprueba cómo lo escribiste y si tiene un valor antes de usarlo.";
  if (/error TS\d+/.test(error)) return "TypeScript no pudo compilar el programa. Revisa los tipos y la línea indicada antes de volver a ejecutar.";
  if (status === "runtime") return "El programa se detuvo antes de terminar. Revisa el detalle del error y los datos de este ejemplo.";
  return "Compara el resultado esperado con el obtenido y sigue los valores paso a paso.";
}
