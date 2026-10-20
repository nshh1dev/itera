import "server-only";
import { db } from "./db";
import { languages, type ExerciseCard, type Language } from "@/lib/types";
import { learningPaths } from "@/lib/learning-paths";

export async function getCatalog(userId?: string, language: Language = "python"): Promise<ExerciseCard[]> {
  const [exercises, activity] = await Promise.all([db.exercise.findMany({
    where: { published: true, versions: { some: { published: true } } }, orderBy: { order: "asc" },
    select: { id: true, slug: true, category: true, order: true,
      versions: { where: { published: true }, orderBy: { number: "desc" }, take: 1, select: { title: true, description: true, level: true, minutes: true, runtimeMode: true, practiceGoals: true, activityType: true } },
      progress: { where: { userId: userId ?? "__guest__", language: { in: [...languages] } }, select: { language: true, firstPassedAt: true, attempts: true } },
    },
  }), userId ? db.exerciseVariant.findMany({
    where: { language, version: { exercise: { published: true } }, OR: [{ drafts: { some: { userId } } }, { submissions: { some: { userId } } }] },
    select: { version: { select: { exerciseId: true } }, drafts: { where: { userId }, select: { updatedAt: true } }, submissions: { where: { userId }, orderBy: { createdAt: "desc" }, take: 1, select: { createdAt: true } } },
  }) : []]);
  const activityDates = new Map<string, string>();
  for (const variant of activity) {
    for (const date of [...variant.drafts.map(draft => draft.updatedAt), ...variant.submissions.map(submission => submission.createdAt)]) {
      const value = date.toISOString();
      if (value > (activityDates.get(variant.version.exerciseId) ?? "")) activityDates.set(variant.version.exerciseId, value);
    }
  }
  const curriculum = learningPaths.flatMap(path => path.slugs ?? []);
  exercises.sort((a, b) => {
    const rank = (slug: string) => { const index = curriculum.indexOf(slug); return index < 0 ? curriculum.length : index; };
    return rank(a.slug) - rank(b.slug);
  });
  return exercises.flatMap((e, index) => {
    if (!e.versions[0]) return [];
    const active = e.progress.find(item => item.language === language);
    const other = e.progress.find(item => item.language !== language && item.firstPassedAt);
    return [{ id: e.id, slug: e.slug, category: e.category, order: index, ...e.versions[0], solved: !!active?.firstPassedAt, started: activityDates.has(e.id) || (active?.attempts ?? 0) > 0, solvedOther: !!other?.firstPassedAt, lastActivityAt: activityDates.get(e.id) }];
  });
}

export async function getExercise(slug: string, language: Language, userId?: string) {
  return db.exercise.findUnique({
    where: { slug, published: true },
    select: { id: true, slug: true, category: true,
      versions: { where: { published: true }, orderBy: { number: "desc" }, take: 1, select: {
        id: true, title: true, statement: true, constraints: true, hints: true, level: true, minutes: true, number: true,
        objective: true, prerequisites: true, practiceGoals: true, prerequisiteSlugs: true, activityType: true,
        runtimeMode: true, complexity: true, commonErrors: true,
        variants: { select: { id: true, language: true, starter: true, statement: true,
          tests: { where: { visible: true }, orderBy: { order: "asc" }, select: { input: true, expected: true, explanation: true } },
          drafts: { where: { userId: userId ?? "__guest__" }, select: { code: true, revision: true } },
        } },
      } },
    },
  });
}
