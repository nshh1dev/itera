import Link from "next/link";

export type PreviousExercise = { title: string; href: string };

export function LearningGuide({ objective, prerequisites, practiceGoals = [], previousExercises = [] }: { objective: string; prerequisites: string[]; practiceGoals?: string[]; previousExercises?: PreviousExercise[] }) {
  const documented = objective.trim().length > 0;
  return <section className="nested-surface mt-6 rounded-xl bg-control p-4" aria-label="Guía de aprendizaje">
    <h2 className="text-sm font-semibold">Qué vas a practicar</h2>
    <p className="mt-2 text-sm leading-7 text-muted-foreground">{documented ? objective : "Esta versión todavía no tiene un objetivo editorial descrito. Puedes consultar el enunciado y las pistas."}</p>
    {practiceGoals.length > 0 && <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-6 text-muted-foreground">{practiceGoals.map(goal => <li key={goal}>{goal}</li>)}</ul>}
    <h3 className="mt-4 text-xs font-medium">Conocimientos previos recomendados</h3>
    {prerequisites.length > 0
      ? <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-6 text-muted-foreground">{prerequisites.map((item, index) => <li key={index}>{item}</li>)}</ul>
      : <p className="mt-2 text-xs leading-6 text-muted-foreground">{documented ? "No necesitas conocimientos de programación previos para esta actividad." : "Esta versión no especifica conocimientos previos."}</p>}
    {previousExercises.length > 0 && <nav aria-label="Ejercicios previos recomendados" className="mt-3"><p className="text-xs font-medium">Puedes repasarlos aquí</p><ul className="mt-1 flex flex-col items-start">{previousExercises.map(exercise => <li key={exercise.href}><Link className="text-link min-h-11 py-2 text-xs" href={exercise.href}>{exercise.title}</Link></li>)}</ul></nav>}
    <p className="mt-3 text-xs leading-6 text-muted-foreground">Son recomendaciones para orientarte, no bloqueos. Puedes abrir y practicar el ejercicio aunque aún estés aprendiendo estos conceptos.</p>
  </section>;
}
