import Link from "next/link";
import { ArrowUpRight, Check, Circle, Clock3 } from "lucide-react";
import type { ExerciseCard, Language } from "@/lib/types";
import { levelNames } from "@/lib/types";

export function ExerciseRow({ exercise: e, language = "python" }: { exercise: ExerciseCard; language?: Language }) {
  return <Link href={`/ejercicios/${e.slug}?lenguaje=${language}`} className="group flex items-center gap-4 border-b px-1 py-5 last:border-b-0 hover:bg-surface/60 sm:px-3">
    <span className="flex size-8 shrink-0 items-center justify-center">{e.solved ? <Check className="size-5 text-success" aria-label="Resuelto" /> : e.started ? <Circle className="size-4 text-primary" aria-label="En progreso" /> : <span className="font-mono text-xs text-muted-foreground">{String(e.order + 1).padStart(2, "0")}</span>}</span>
    <div className="min-w-0 flex-1"><h3 className="text-sm font-medium tracking-tight group-hover:text-primary">{e.title}</h3><p className="mt-1 text-xs text-muted-foreground">{e.category}<span className="mx-2 sm:hidden">·</span><span className="sm:hidden">{levelNames[e.level]}</span></p></div>
    <span className="hidden w-24 text-xs text-muted-foreground sm:block">{levelNames[e.level]}</span><span className="hidden w-20 items-center gap-1.5 text-xs text-muted-foreground lg:flex"><Clock3 className="size-3.5" />{e.minutes} min</span><ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
  </Link>;
}
