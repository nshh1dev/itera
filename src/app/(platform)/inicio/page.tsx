import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { currentUser } from "@/server/auth";
import { getPracticeNavigation } from "@/server/practice-navigation";
import { languageNames, levelNames, type Language } from "@/lib/types";
import { exerciseHref } from "@/lib/learning-paths";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/arc/progress";
import { ExerciseRow } from "@/components/exercise-row";

export const metadata = { title: "Inicio" };
export default async function DashboardPage() {
  const user = await currentUser();
  const { recommendation, language, catalog, suggestedPath, learning } = await getPracticeNavigation(user?.id, (user?.preference?.language ?? "python") as Language);
  const solved = catalog.filter(exercise => exercise.solved).length;
  const recent = catalog.filter(exercise => exercise.lastActivityAt && exercise.id !== recommendation?.exercise.id).sort((a, b) => b.lastActivityAt!.localeCompare(a.lastActivityAt!)).slice(0, 3);
  return <div className="page-container">
    <div className="page-intro"><h1 className="page-title">{user ? `Hola, ${user.name.split(" ")[0]}.` : "Empieza a practicar."}</h1><span className="text-sm text-muted-foreground">{languageNames[language]}</span></div>
    {!!user?.onboardingStep && <p className="mb-6 text-sm leading-6 text-muted-foreground">Tu cuenta ya está lista. <Link href="/bienvenida" className="text-link">Retomar mi bienvenida</Link> cuando quieras; puedes seguir practicando ahora.</p>}
    {recommendation ? <section className="surface-panel rounded-2xl bg-surface p-6 sm:p-9" aria-labelledby="next-step-title">
      <h2 id="next-step-title" className="section-title">Tu siguiente paso</h2>
      <p className="mt-3 text-sm text-muted-foreground">{recommendation.resume ? "Continúa donde lo dejaste" : catalog.every(exercise => !exercise.started && !exercise.solved) ? learning ? `Tu punto de partida: ${learning.path.title}.` : "Empieza desde cero, a tu ritmo." : solved === catalog.length ? "Has completado este catálogo. Puedes repasar o probar otro lenguaje." : recommendation.pathSlug ? "Continúa tu ruta de aprendizaje." : "Un reto relacionado para seguir practicando."}</p>
      <h3 className="mt-5 max-w-prose text-2xl font-semibold tracking-tight sm:text-3xl">{recommendation.exercise.title}</h3>
      <p className="mt-3 text-sm text-muted-foreground">{levelNames[recommendation.exercise.level]} · {recommendation.exercise.category} · {recommendation.exercise.minutes} min aprox.</p>
      <Button asChild className="mt-6"><Link href={exerciseHref(recommendation.exercise.slug, language, recommendation.pathSlug)}>{recommendation.resume ? "Continuar ejercicio" : "Empezar ejercicio"}<ArrowRight data-icon="inline-end" /></Link></Button>
    </section> : <section className="empty-state"><h2 className="section-title">Todavía no hay ejercicios</h2><Link href="/rutas" className="text-link">Explorar rutas<ArrowRight /></Link></section>}
    <nav className="mt-6 flex flex-wrap gap-3" aria-label="Cómo quieres practicar">
      <Button asChild variant="secondary"><Link href={suggestedPath ? `/rutas/${suggestedPath.slug}?lenguaje=${language}` : `/rutas?lenguaje=${language}`}>Seguir mi ruta<ArrowRight data-icon="inline-end" /></Link></Button>
      <Button asChild variant="outline"><Link href={`/ejercicios?lenguaje=${language}`}>Práctica libre<ArrowRight data-icon="inline-end" /></Link></Button>
    </nav>
    {learning && <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">{learning.reason} <Link href="/configuracion?seccion=aprendizaje" className="text-primary-text hover:underline">Ajustar mi aprendizaje</Link></p>}
    <section className="mt-10 max-w-xl" aria-labelledby="progress-title"><div className="flex flex-wrap items-center justify-between gap-3"><h2 id="progress-title" className="text-sm font-medium">{solved} de {catalog.length} resueltos</h2><Link href={`/progreso?lenguaje=${language}`} className="text-link text-sm">Ver progreso</Link></div><Progress label={`Resueltos en ${languageNames[language]}`} value={solved} max={catalog.length} className="mt-3" /></section>
    {recent.length > 0 && <section className="mt-10" aria-labelledby="recent-title"><h2 id="recent-title" className="section-title mb-3">Volver a tu actividad reciente</h2>{recent.map(exercise => <ExerciseRow key={exercise.id} exercise={exercise} language={language} />)}</section>}
    {!user && <p className="mt-8 text-sm text-muted-foreground"><Link href="/registro" className="text-link">Crea una cuenta local</Link> para guardar tu progreso y continuar en otro navegador.</p>}
  </div>;
}
