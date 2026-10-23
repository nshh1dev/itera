import { logicExercises } from "../prisma/logic-content";

// Lectura de fuentes, sin base de datos, ejecución de código ni escrituras.
let issues = 0;
for (const exercise of logicExercises) {
  const pairs = exercise.tests.map(test => JSON.stringify([test.input, test.expected]));
  const fixed = exercise.runtimeMode === "PROGRAM" && exercise.tests.every(test => test.input === "");
  const errors: string[] = [];
  if (new Set(pairs).size !== pairs.length) errors.push("casos duplicados");
  if (!fixed && new Set(exercise.tests.map(test => JSON.stringify(test.expected))).size < 2) errors.push("todas las respuestas son iguales");
  if (!fixed && !exercise.tests.some(test => !test.visible)) errors.push("sin prueba oculta");
  if (exercise.tests.length > 10) errors.push("más de diez casos");
  if (exercise.activityType === "PRACTICE" && /la plantilla (?:ya |prepara|devuelve|añade)|(?:corrige|completa|modifica) (?:la|el)/i.test(exercise.statement)) errors.push("revisar modalidad guiada");
  if (errors.length) { issues++; console.log(`${exercise.slug}: ${errors.join("; ")}`); }
}
console.log(`${logicExercises.length} ejercicios; ${logicExercises.filter(exercise => exercise.conceptRule).length} con comprobación conceptual; ${issues} alertas automáticas.`);
console.log("La auditoría automática no demuestra comprensión, calidad del enunciado ni complejidad del algoritmo. Requiere revisión editorial y pruebas de referencias/plantillas.");
if (issues) process.exitCode = 1;
