import Link from "next/link";
import { ArrowUpRight, Check, Circle, Clock3 } from "lucide-react";
import type { ExerciseCard, Language } from "@/lib/types";
import { levelNames, languageNames } from "@/lib/types";
import { exerciseHref } from "@/lib/learning-paths";
import { Badge } from "./ui/badge";

export function ExerciseRow({ exercise: e, language = "python", pathSlug }: { exercise: ExerciseCard; language?: Language; pathSlug?: string }) {
  return <Link href={exerciseHref(e.slug, language, pathSlug)} className="list-entry group min-h-18 items-center gap-3">
    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface">{e.solved ? <Check className="size-4 text-success-text" aria-label="Resuelto" /> : e.started ? <Circle className="size-4 text-primary" aria-label="En progreso" /> : <span className="text-xs text-muted-foreground">{String(e.order + 1).padStart(2, "0")}</span>}</span>
    <div className="min-w-0 flex-1"><h3 className="text-sm font-medium tracking-tight group-hover:text-primary-text">{e.title}</h3><p className="mt-1 text-xs text-muted-foreground">{e.category}<span className="mx-2 sm:hidden">·</span><span className="sm:hidden">{levelNames[e.level]}</span>{e.solvedOther && <><span className="mx-2">·</span>También en {languageNames[language === "python" ? "javascript" : "python"]}</>}</p></div>
    <span className="hidden w-28 sm:block"><Badge>{levelNames[e.level]}</Badge></span><span className="hidden w-20 items-center gap-1.5 text-xs text-muted-foreground lg:flex"><Clock3 className="size-3.5" />{e.minutes} min</span><ArrowUpRight className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
  </Link>;
}
