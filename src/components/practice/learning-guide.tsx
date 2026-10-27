import Link from "next/link";
import { Disclosure } from "@/components/arc/disclosure";
import { Children, type ReactNode } from "react";
import { learningHelp } from "@/lib/learning-help";

export type PreviousExercise = { title: string; href: string };

export function LearningGuide({ objective, prerequisites, practiceGoals = [], previousExercises = [], title, statement, children }: { objective: string; prerequisites: string[]; practiceGoals?: string[]; previousExercises?: PreviousExercise[]; title?: string; statement?: string; children?: ReactNode }) {
  const content = learningHelp({ title, statement, objective, practiceGoals, prerequisites });
  if (!content.goals.length && !content.prerequisites.length && !previousExercises.length && !Children.toArray(children).some(child => child !== "")) return null;
  return <section aria-label="Guía de aprendizaje">
    {(content.prerequisites.length > 0 || previousExercises.length > 0) && <Disclosure title="Antes de empezar"><div className="pb-3">
    {content.prerequisites.length > 0 && <ul className="mt-2 list-disc space-y-1 pl-4 text-base leading-7 text-muted-foreground">{content.prerequisites.map(item => <li key={item}>{item}</li>)}</ul>}
    {previousExercises.length > 0 && <nav aria-label="Ejercicios previos recomendados" className="mt-3"><p className="text-sm text-muted-foreground">Repaso opcional</p><ul className="mt-1 flex flex-col items-start">{previousExercises.map(exercise => <li key={exercise.href}><Link className="text-link min-h-11 py-2 text-sm" href={exercise.href}>{exercise.title}</Link></li>)}</ul></nav>}
    </div></Disclosure>}
    {(content.goals.length > 0 || Children.toArray(children).some(child => child !== "")) && <div className="space-y-5 py-5">
    {content.goals.length > 0 && <div><h3 className="text-sm font-semibold">Qué vas a practicar</h3><ul className="mt-2 list-disc space-y-1 pl-4 text-base leading-7 text-muted-foreground">{content.goals.map(goal => <li key={goal}>{goal}</li>)}</ul></div>}
    {children}
    </div>}
  </section>;
}
