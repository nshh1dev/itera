import { languageNames, type Language } from "@/lib/types";
import type { LearningModule } from "@/lib/learning-modules";
import { Disclosure } from "@/components/arc/disclosure";

export type Lesson = Pick<LearningModule, "title" | "objective" | "theory"> & { example: string };
export function ModuleLesson({ lesson, language }: { lesson: Lesson; language: Language }) {
  return <Disclosure className="mt-5" title={`Entiende la idea · ${lesson.title}`}>
    <p className="learning-copy mt-2 font-medium">{lesson.objective}</p>
    <p className="learning-copy mt-3 whitespace-pre-line text-muted-foreground">{lesson.theory}</p>
    <figure className="mt-3">
      <figcaption className="text-xs text-muted-foreground">Ejemplo de aprendizaje en {languageNames[language]} · No es la solución del reto</figcaption>
      <pre className="code-block mt-2"><code>{lesson.example}</code></pre>
    </figure>
    <p className="mt-3 text-xs leading-6 text-muted-foreground">Predice qué ocurre, sigue las instrucciones y después prueba tu propia solución.</p>
  </Disclosure>;
}
