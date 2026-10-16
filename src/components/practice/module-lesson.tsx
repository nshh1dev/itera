import type { Language } from "@/lib/types";
import type { LearningModule } from "@/lib/learning-modules";

export type Lesson = Pick<LearningModule, "title" | "objective" | "theory"> & { example: string };
export function ModuleLesson({ lesson, language }: { lesson: Lesson; language: Language }) {
  return <details className="mt-5" open>
    <summary className="min-h-11 cursor-pointer py-3 text-sm font-semibold">Entiende la idea · {lesson.title}</summary>
    <p className="learning-copy mt-2 font-medium">{lesson.objective}</p>
    <p className="learning-copy mt-3 whitespace-pre-line text-muted-foreground">{lesson.theory}</p>
    <p className="mt-3 text-xs text-muted-foreground">Ejemplo de aprendizaje · No es la solución del reto</p>
    <pre className="code-block mt-2" aria-label={`Ejemplo de ${language}`}>{lesson.example}</pre>
    <p className="mt-3 text-xs leading-6 text-muted-foreground">Predice qué ocurre, sigue las instrucciones y después prueba tu propia solución.</p>
  </details>;
}
