import "server-only";
import { db } from "./db";
import type { ExerciseCard, Language } from "@/lib/types";
import { foundationSteps, introductorySteps } from "@/lib/learning-paths";

export async function getCatalog(userId?: string, language: Language = "python"): Promise<ExerciseCard[]> {
  const exercises = await db.exercise.findMany({
    where: { published: true, versions: { some: { published: true } } }, orderBy: { order: "asc" },
    select: { id: true, slug: true, category: true, order: true,
      versions: { where: { published: true }, orderBy: { number: "desc" }, take: 1, select: { title: true, description: true, level: true, minutes: true } },
      progress: { where: { userId: userId ?? "__guest__", language }, select: { firstPassedAt: true, attempts: true } },
    },
  });
  const curriculum = [...introductorySteps, ...foundationSteps];
  exercises.sort((a, b) => {
    const rank = (slug: string) => { const index = curriculum.indexOf(slug); return index < 0 ? curriculum.length : index; };
    return rank(a.slug) - rank(b.slug);
  });
  return exercises.flatMap((e, index) => e.versions[0] ? [{ id: e.id, slug: e.slug, category: e.category, order: index, ...e.versions[0], solved: !!e.progress[0]?.firstPassedAt, started: (e.progress[0]?.attempts ?? 0) > 0 }] : []);
}

export async function getExercise(slug: string, language: Language, userId?: string) {
  return db.exercise.findUnique({
    where: { slug, published: true },
    select: { id: true, slug: true, category: true,
      versions: { where: { published: true }, orderBy: { number: "desc" }, take: 1, select: {
        id: true, title: true, statement: true, constraints: true, hints: true, level: true, minutes: true, number: true,
        objective: true, prerequisites: true,
        variants: { where: { language }, select: { id: true, language: true, starter: true,
          tests: { where: { visible: true }, orderBy: { order: "asc" }, select: { input: true, expected: true } },
          drafts: { where: { userId: userId ?? "__guest__" }, select: { code: true, revision: true } },
        } },
      } },
    },
  });
}
