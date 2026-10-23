import Link from "next/link";
import { ArrowRight, Check, Code2, Route } from "lucide-react";
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
  const { recommendation, language, catalog, path, recent, reason } = await getPracticeNavigation(user?.id, (user?.preference?.language ?? "python") as Language);
  const routeHref = path ? `/rutas/${path.slug}?lenguaje=${language}` : `/rutas?lenguaje=${language}`;
  const complete = catalog.length > 0 && catalog.every(exercise => exercise.solved);
  return <div className="page-container">
    <div className="page-intro"><h1 className="page-title">{user ? `Hola, ${user.name.split(" ")[0]}.` : "Empieza a practicar."}</h1></div>
    {!!user?.onboardingStep && <p className="mb-6 text-sm leading-6 text-muted-foreground"><Link href="/bienvenida" className="text-link">Retomar mi bienvenida</Link> · Puedes seguir practicando ahora.</p>}
    <div className="dashboard-top">
      <section className="dashboard-next rounded-2xl bg-surface p-5 sm:p-6" aria-labelledby="next-step-title">
        <h2 id="next-step-title" className="section-title">Tu siguiente paso</h2>
        {recommendation ? <>
          <h3 className="mt-4 text-xl font-semibold tracking-tight">{recommendation.exercise.title}</h3>
          <p className="mt-2 max-w-prose text-sm leading-6 text-muted-foreground">{exerciseSkillSummary(recommendation.exercise)}</p>
          <ul aria-label="Contexto del ejercicio" className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <li>{languageNames[language]}</li><li>{recommendation.pathSlug ? path?.title : "Práctica libre"}</li><li>{recommendation.exercise.minutes} min aprox.</li>
          </ul>
          <div className="mt-5 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"><p className="max-w-sm text-sm leading-6 text-muted-foreground sm:flex-1">{reason}</p><Button asChild><Link href={exerciseHref(recommendation.exercise.slug, language, recommendation.pathSlug)}>{recommendation.resume ? "Continuar ejercicio" : "Empezar ejercicio"}<ArrowRight aria-hidden="true" /></Link></Button></div>
        </> : <>
          <h3 className="mt-4 text-xl font-semibold tracking-tight">{complete ? "Todo el catálogo completado" : "Todavía no hay ejercicios"}</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{complete ? `Has resuelto los ejercicios disponibles en ${languageNames[language]}. Puedes repasar una ruta o practicar en otro lenguaje.` : "Cuando haya ejercicios publicados, encontrarás aquí tu siguiente paso."}</p>
          <Button asChild className="mt-5"><Link href="/rutas">Explorar rutas<ArrowRight aria-hidden="true" /></Link></Button>
        </>}
      </section>
      <section className="dashboard-route" aria-labelledby="progress-title">
        <h2 id="progress-title" className="section-title">Tu ruta</h2>
        {path && path.total > 0 ? <>
          <h3 className="mt-4 text-base font-medium">{path.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{languageNames[language]}</p>
          <p className="mt-5 text-sm"><span className="font-medium tabular-nums">{path.completed} de {path.total}</span> ejercicios completados</p>
          <Progress label={`Avance de ${path.title} en ${languageNames[language]}`} value={path.completed} max={path.total} className="mt-3" />
          {path.completed === path.total && <p className="mt-3 flex items-center gap-2 text-sm"><Check aria-hidden="true" className="size-4 text-success-text" />Ruta completada</p>}
          <Link href={`/progreso?lenguaje=${language}`} className="text-link mt-4 min-h-11 text-sm">Ver mi progreso<ArrowRight aria-hidden="true" /></Link>
        </> : <p className="mt-4 text-sm leading-6 text-muted-foreground">Elige una ruta para empezar. Su avance aparecerá aquí cuando haya ejercicios disponibles.</p>}
      </section>
    </div>
    <nav className="dashboard-modes mt-6" aria-label="Cómo quieres practicar">
      <Link href={routeHref} className="dashboard-mode dashboard-mode-guided"><Route aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" /><span className="min-w-0 flex-1"><span className="block text-sm font-medium">Seguir mi ruta</span><span className="mt-1 block text-sm leading-6 text-muted-foreground">Avanza en orden, con teoría y ejercicios guiados.</span></span><ArrowRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" /></Link>
      <Link href={`/ejercicios?lenguaje=${language}`} className="dashboard-mode"><Code2 aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" /><span className="min-w-0 flex-1"><span className="block text-sm font-medium">Práctica libre</span><span className="mt-1 block text-sm leading-6 text-muted-foreground">Elige ejercicios por tema, nivel o tiempo.</span></span><ArrowRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" /></Link>
    </nav>
    {user && <section className="mt-8" aria-labelledby="recent-title">
      <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-1"><h2 id="recent-title" className="section-title">Actividad reciente</h2><Link href={`/progreso?lenguaje=${language}`} className="text-link min-h-11 text-sm">Ver historial completo<ArrowRight aria-hidden="true" /></Link></div>
      {recent.length ? <ul className="mt-2">{recent.map(exercise => <li key={exercise.id}><Link href={exerciseHref(exercise.slug, language)} className="dashboard-activity list-entry items-center justify-between gap-4"><span className="min-w-0 text-sm font-medium">{exercise.title}</span><span className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground">{exercise.solved && <Check aria-hidden="true" className="size-4 text-success-text" />}{exercise.solved ? "Resuelto" : "Pendiente"}<ArrowRight aria-hidden="true" className="size-4" /></span></Link></li>)}</ul>
        : <p className="mt-3 text-sm leading-6 text-muted-foreground">{recommendation?.resume ? "Tu ejercicio pendiente está en «Tu siguiente paso». Aquí aparecerá el resto de tu actividad." : "Cuando practiques, verás aquí tus últimos ejercicios resueltos y pendientes."}</p>}
    </section>}
    {!user && <p className="mt-8 text-sm leading-6 text-muted-foreground"><Link href="/registro" className="text-link">Crea una cuenta local</Link> para guardar tu progreso y continuar en otro navegador.</p>}
  </div>;
}
