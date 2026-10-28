import Link from "next/link";
import { currentUser } from "@/server/auth";
import { getPracticeNavigation } from "@/server/practice-navigation";
import { languageNames, type Language } from "@/lib/types";
import { exerciseHref } from "@/lib/learning-paths";
import { exerciseSkillSummary } from "@/lib/exercise-skills";
import { ActivityDate } from "@/components/activity-date";

export const metadata = { title: "Inicio" };
export default async function DashboardPage() {
  const user = await currentUser();
  const { recommendation, language, catalog, path, recent } = await getPracticeNavigation(user?.id, (user?.preference?.language ?? "python") as Language);
  const progressHref = `/progreso?lenguaje=${language}`;
  const complete = catalog.length > 0 && catalog.every(exercise => exercise.solved);
  return <div className="dashboard-page">
    <p className="dashboard-greeting">{user ? `Hola, ${user.name.split(" ")[0]}.` : "Empieza a practicar."}</p>
    <section className="dashboard-next" aria-label="Tu siguiente paso">
      {recommendation ? <>
        <h1 className="dashboard-exercise-title" title={recommendation.exercise.title}>{recommendation.exercise.title}</h1>
        <p className="dashboard-description">{exerciseSkillSummary(recommendation.exercise)}</p>
        <p className="dashboard-context">{languageNames[language]}{path && <> · {path.title}</>} · {recommendation.exercise.minutes} min</p>
        <Link className="dashboard-continue" href={exerciseHref(recommendation.exercise.slug, language, recommendation.pathSlug)}>Continuar</Link>
      </> : <>
        <h1 className="dashboard-exercise-title">{complete ? "Todo el catálogo completado" : "Todavía no hay ejercicios"}</h1>
        <p className="dashboard-description">{complete ? "Puedes repasar una ruta o practicar en otro lenguaje." : "Tu siguiente ejercicio aparecerá aquí cuando esté disponible."}</p>
        <Link className="dashboard-continue" href="/rutas">Explorar rutas</Link>
      </>}
    </section>
    {path && path.total > 0 && <Link href={progressHref} className="dashboard-progress" aria-label={`Progreso de ${path.title}: ${path.completed} de ${path.total} ejercicios completados`}>
      <span className="dashboard-progress-track" aria-hidden="true"><span style={{ width: `${Math.min(100, path.completed / path.total * 100)}%` }} /></span>
      <span className="dashboard-progress-caption">{path.completed} de {path.total} ejercicios</span>
    </Link>}
    {user && <section className="dashboard-recent" aria-labelledby="recent-title">
      <div className="dashboard-recent-heading"><h2 id="recent-title">Actividad reciente</h2>{recent.length > 0 && <Link href={progressHref} className="dashboard-see-all">Ver todo</Link>}</div>
      {recent.length ? <ul>{recent.map(exercise => <li key={exercise.id}>
        <Link href={exerciseHref(exercise.slug, language)} className="dashboard-activity">
          <span>{exercise.title}</span>
          {exercise.lastActivityAt && <ActivityDate date={exercise.lastActivityAt} />}
        </Link>
      </li>)}</ul> : <p className="dashboard-description">Aún no hay actividad reciente.</p>}
    </section>}
    {!!user?.onboardingStep && <Link href="/bienvenida" className="dashboard-quiet-link dashboard-onboarding">Retomar mi bienvenida</Link>}
    {!user && <p className="dashboard-guest"><Link href="/registro" className="dashboard-quiet-link">Crea una cuenta local</Link> para guardar tu progreso.</p>}
  </div>;
}
