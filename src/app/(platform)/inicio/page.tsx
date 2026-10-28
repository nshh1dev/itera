import Link from "next/link";
import { Check } from "lucide-react";
import { currentUser } from "@/server/auth";
import { getPracticeNavigation } from "@/server/practice-navigation";
import { languageNames, type Language } from "@/lib/types";
import { exerciseHref } from "@/lib/learning-paths";
import { exerciseSkillSummary } from "@/lib/exercise-skills";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/arc/progress";

export const metadata = { title: "Inicio" };
export default async function DashboardPage() {
  const user = await currentUser();
  const { recommendation, language, catalog, path, recent } = await getPracticeNavigation(user?.id, (user?.preference?.language ?? "python") as Language);
  const progressHref = `/progreso?lenguaje=${language}`;
  const complete = catalog.length > 0 && catalog.every(exercise => exercise.solved);
  return <div className="dashboard-page">
    <h1 className="dashboard-greeting">{user ? `Hola, ${user.name.split(" ")[0]}.` : "Empieza a practicar."}</h1>
    {!!user?.onboardingStep && <Link href="/bienvenida" className="dashboard-quiet-link dashboard-onboarding">Retomar mi bienvenida</Link>}
    <section className="dashboard-next" aria-label="Tu siguiente paso">
      <p className="dashboard-context">{languageNames[language]}{path && <> · {path.title}</>}</p>
      {recommendation ? <>
        <h2 className="dashboard-exercise-title">{recommendation.exercise.title}</h2>
        <p className="dashboard-description">{exerciseSkillSummary(recommendation.exercise)}</p>
        <p className="dashboard-duration">{recommendation.exercise.minutes} min aprox.</p>
        <Button asChild className="dashboard-continue"><Link href={exerciseHref(recommendation.exercise.slug, language, recommendation.pathSlug)}>Continuar</Link></Button>
      </> : <>
        <h2 className="dashboard-exercise-title">{complete ? "Todo el catálogo completado" : "Todavía no hay ejercicios"}</h2>
        <p className="dashboard-description">{complete ? "Puedes repasar una ruta o practicar en otro lenguaje." : "Tu siguiente ejercicio aparecerá aquí cuando esté disponible."}</p>
        <Button asChild className="dashboard-continue"><Link href="/rutas">Explorar rutas</Link></Button>
      </>}
      {path && path.total > 0 && <Link href={progressHref} className="dashboard-progress" aria-label={`Progreso de ${path.title}: ${path.completed} de ${path.total} ejercicios completados`}>
        <span className="dashboard-progress-caption"><span>{path.completed === path.total ? "Ruta completada" : "Progreso de la ruta"}</span><span>{path.completed} de {path.total}</span></span>
        <Progress label={`Avance de ${path.title} en ${languageNames[language]}`} value={path.completed} max={path.total} />
      </Link>}
    </section>
    {user && <section className="dashboard-recent" aria-labelledby="recent-title">
      <div className="dashboard-recent-heading"><h2 id="recent-title">Actividad reciente</h2>{recent.length > 0 && <Link href={progressHref} className="dashboard-quiet-link">Ver todo</Link>}</div>
      {recent.length ? <ul>{recent.map(exercise => <li key={exercise.id}>
        <Link href={exerciseHref(exercise.slug, language)} className="dashboard-activity">
          <span>{exercise.title}</span>
          <span className="dashboard-activity-status">{exercise.solved ? <><Check aria-hidden="true" className="size-4" strokeWidth={1.5} /><span className="sr-only">Resuelto</span></> : "Pendiente"}</span>
        </Link>
      </li>)}</ul> : <p className="dashboard-description">Aún no hay actividad reciente.</p>}
    </section>}
    {!user && <p className="dashboard-guest"><Link href="/registro" className="dashboard-quiet-link">Crea una cuenta local</Link> para guardar tu progreso.</p>}
  </div>;
}
