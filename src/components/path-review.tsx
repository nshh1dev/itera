import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Disclosure } from "@/components/arc/disclosure";
import { exerciseHref } from "@/lib/learning-paths";
import type { LearningModule } from "@/lib/learning-modules";
import { languageNames, type ExerciseCard, type Language } from "@/lib/types";

export function PathCompletion({ language, count }: { language: Language; count: number }) {
  return <section className="surface-panel mt-6 rounded-xl bg-surface p-5 wrap-anywhere" aria-labelledby="path-completion">
    <h2 id="path-completion" className="text-lg font-semibold">Ruta completada en {languageNames[language]}</h2>
    <p className="mt-2 max-w-prose text-sm leading-6 text-muted-foreground">Has completado {count === 1 ? "el ejercicio publicado" : `los ${count} ejercicios publicados`} de esta ruta en {languageNames[language]}. Esto registra tu práctica, no demuestra por sí solo dominio. El progreso en los otros lenguajes es independiente.</p>
    <a className="text-link mt-4 text-sm" href="#path-readiness">Repasar lo aprendido<ArrowRight className="size-4" aria-hidden="true" /></a>
  </section>;
}

export function PathReview({ pathSlug, language, modules, exercises, next }: { pathSlug: string; language: Language; modules: LearningModule[]; exercises: ExerciseCard[]; next?: { slug: string; title: string } }) {
  const firstIntegration = exercises.find(exercise => exercise.activityType === "INTEGRATION");
  return <section className="mt-10 rounded-xl bg-surface p-5 wrap-anywhere" aria-labelledby="path-readiness">
    <h2 id="path-readiness" tabIndex={-1} className="scroll-mt-20 text-lg font-semibold">Pon en práctica lo aprendido</h2>
    <p className="mt-2 max-w-prose text-sm leading-6 text-muted-foreground">Intenta resolver los desafíos integradores sin consultar la solución y explica por qué funciona tu código. Completarlos registra práctica, no demuestra por sí solo dominio.</p>
    <Disclosure title="Repasar por módulo" className="mt-4">
      <p className="max-w-prose text-sm leading-6 text-muted-foreground">Elige un criterio que todavía te cueste explicar. Abre su ejercicio, intenta resolverlo sin copiar y comprueba tu explicación con un ejemplo. Este repaso no marca ejercicios como completados: solo una comprobación de solución superada guarda ese progreso.</p>
      <div className="mt-5 space-y-6 pb-3">{modules.map(module => {
        const entries = module.slugs.flatMap(slug => exercises.filter(exercise => exercise.slug === slug));
        const practice = entries.find(exercise => exercise.activityType === "INTEGRATION") ?? entries.at(-1);
        return <section key={module.slug} aria-label={`Repaso: ${module.title}`}>
          <h3 className="text-sm font-semibold">{module.title}</h3>
          <ul className="mt-2 max-w-prose list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">{module.readiness.map(criterion => <li key={criterion}>{criterion}</li>)}</ul>
          {practice ? <Link className="text-link mt-3 text-sm" href={exerciseHref(practice.slug, language, pathSlug)}>Repasar: {practice.title}<ArrowRight className="size-4 shrink-0" aria-hidden="true" /></Link> : <p className="mt-3 text-sm text-muted-foreground">Este módulo todavía no tiene ejercicios publicados para repasar.</p>}
        </section>;
      })}</div>
    </Disclosure>
    <div className="mt-4 flex flex-col items-start gap-4">
      {firstIntegration ? <Link className="text-link text-sm" href={exerciseHref(firstIntegration.slug, language, pathSlug)}>Abrir primer integrador<ArrowRight className="size-4" aria-hidden="true" /></Link> : <p className="text-sm text-muted-foreground">Esta ruta todavía no tiene desafíos integradores publicados. Puedes repasar sus ejercicios.</p>}
      {next ? <Link className="text-link" href={`/rutas/${encodeURIComponent(next.slug)}?lenguaje=${language}`}>Continuar con {next.title}</Link> : <p className="text-sm text-muted-foreground">Vuelve a los retos con otra estrategia y compara su corrección y coste.</p>}
    </div>
  </section>;
}
