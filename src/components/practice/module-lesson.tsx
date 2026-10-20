import { languageNames, type Language } from "@/lib/types";
import type { LearningModule } from "@/lib/learning-modules";

export type Lesson = Pick<LearningModule, "title" | "objective" | "theory"> & { example: string };
export function ModuleLesson({ lesson, language }: { lesson: Lesson; language: Language }) {
  return <section aria-label="Teoría y ejemplo">
    <h3 className="text-sm font-semibold">{lesson.title}</h3>
    <p className="learning-copy mt-3 whitespace-pre-line text-muted-foreground">{lesson.theory}</p>
    <figure className="mt-3">
      <figcaption className="text-xs text-muted-foreground">Ejemplo de aprendizaje en {languageNames[language]} · No es la solución del reto</figcaption>
      <pre className="code-block mt-2"><code>{lesson.example}</code></pre>
    </figure>
  </section>;
}
