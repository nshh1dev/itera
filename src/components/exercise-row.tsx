import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import type { ExerciseCard, Language } from "@/lib/types";
import { levelNames } from "@/lib/types";
import { exerciseHref } from "@/lib/learning-paths";
import { exerciseState } from "@/lib/practice-navigation";
import { exerciseSkillSummary } from "@/lib/exercise-skills";

export function ExerciseRow({ exercise: e, language = "python", pathSlug, recommended = false }: { exercise: ExerciseCard; language?: Language; pathSlug?: string; recommended?: boolean }) {
  const summary = exerciseSkillSummary(e);
  return <Link href={exerciseHref(e.slug, language, pathSlug)} className="list-entry exercise-row group items-center gap-3" aria-current={recommended ? "step" : undefined}>
    {pathSlug && <span className="w-6 shrink-0 text-sm tabular-nums text-muted-foreground" aria-hidden="true">{String(e.order + 1).padStart(2, "0")}</span>}
    <div className="min-w-0 flex-1"><h3 className="text-sm font-medium group-hover:text-primary-text">{e.title}{recommended && <span className="ml-2 text-xs text-primary-text">{e.started ? "En curso" : "Siguiente"}</span>}</h3>{summary && <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{summary}</p>}<p className="mt-1 text-xs text-muted-foreground sm:hidden">{levelNames[e.level]} · {e.minutes} min</p>{e.solvedOther && <p className="mt-1 text-xs text-muted-foreground">Resuelto en otro lenguaje</p>}</div>
    <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">{e.solved && <Check className="size-3.5 text-success-text" aria-hidden="true" />}<span>{exerciseState(e)}</span></span>
    <span className="hidden w-24 text-xs text-muted-foreground sm:block">{levelNames[e.level]}</span><span className="hidden w-14 text-right text-xs tabular-nums text-muted-foreground sm:block">{e.minutes} min</span><ArrowRight aria-hidden="true" className="hidden size-4 shrink-0 text-muted-foreground sm:block" />
  </Link>;
}
