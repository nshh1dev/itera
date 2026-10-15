export const languages = ["python", "javascript", "typescript"] as const;
export type Language = (typeof languages)[number];
export const languageNames: Record<Language, string> = { python: "Python", javascript: "JavaScript", typescript: "TypeScript" };
export const levels = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;
export type Level = (typeof levels)[number];
export const categories = ["Fundamentos", "Cadenas", "Arreglos", "Algoritmos", "Estructuras", "Grafos"] as const;
export const activityNames = { OBSERVATION: "Observación", GUIDED: "Práctica guiada", PRACTICE: "Resolución", INTEGRATION: "Integración" } as const;
export type ActivityType = keyof typeof activityNames;
export const levelNames: Record<Level, string> = { BEGINNER: "Principiante", INTERMEDIATE: "Intermedio", ADVANCED: "Avanzado" };
export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };
export const runtimeModes = ["FUNCTION", "PROGRAM"] as const;
export type RuntimeMode = (typeof runtimeModes)[number];
export const runtimeModeNames: Record<RuntimeMode, string> = { FUNCTION: "Función que devuelve un valor", PROGRAM: "Programa que imprime el resultado" };
// output es la salida del programa (stdout). En modo FUNCTION recoge solo los
// print de depuración; en modo PROGRAM es lo que se compara. Nunca se incluye
// para pruebas ocultas.
export type TestResult = { index: number; visible: boolean; passed: boolean; status: "passed" | "wrong" | "runtime" | "timeout"; input?: Json; expected?: Json; actual?: Json; output?: string; error?: string };
export type ExecutionResult = { id: string; status: string; mode: string; passedCount: number; totalCount: number; results: TestResult[]; message?: string | null };
export type ExerciseCard = { id: string; slug: string; category: string; order: number; title: string; description: string; level: Level; minutes: number; runtimeMode: RuntimeMode; solved: boolean; started: boolean; solvedOther: boolean };
