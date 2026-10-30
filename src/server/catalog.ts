import "server-only";
import { db } from "./db";
import { languages, type ExerciseCard, type Language } from "@/lib/types";
import { learningPaths } from "@/lib/learning-paths";
import { orderLanguageCatalog } from "@/lib/language-curriculum";
import { hasPythonCurriculum, pythonCurriculumMarker, pythonStepMetadata } from "@/lib/python-curriculum";

export async function getCatalog(userId?: string, language: Language = "python"): Promise<ExerciseCard[]> {
  const [catalog] = await getCatalogs(userId, [language]);
  return catalog;
}

// Una lectura común por llamada, sin caché global ni datos compartidos entre cuentas.
// El orden de salida corresponde al de los lenguajes solicitados.
export async function getCatalogs(userId?: string, requestedLanguages: readonly Language[] = languages): Promise<ExerciseCard[][]> {
  const [exercises, activities] = await Promise.all([db.exercise.findMany({
    where: { published: true, versions: { some: { published: true } } }, orderBy: { order: "asc" },
    select: { id: true, slug: true, category: true, order: true,
      versions: { where: { published: true }, orderBy: { number: "desc" }, select: { title: true, description: true, level: true, minutes: true, runtimeMode: true, practiceGoals: true, activityType: true, variants: { select: { language: true } } } },
      progress: { where: { userId: userId ?? "__guest__", language: { in: [...languages] } }, select: { language: true, firstPassedAt: true, attempts: true } },
    },
  }), Promise.all(requestedLanguages.map(language => userId ? db.exerciseVariant.findMany({
    where: { language, version: { exercise: { published: true } }, OR: [{ drafts: { some: { userId } } }, { submissions: { some: { userId, diagnosticItemId: null } } }] },
    select: { version: { select: { exerciseId: true } }, drafts: { where: { userId }, select: { updatedAt: true } }, submissions: { where: { userId, diagnosticItemId: null }, orderBy: { createdAt: "desc" }, take: 1, select: { createdAt: true } } },
  }) : []))]);
  const curriculum = learningPaths.flatMap(path => path.slugs ?? []);
  exercises.sort((a, b) => {
    const rank = (slug: string) => { const index = curriculum.indexOf(slug); return index < 0 ? curriculum.length : index; };
    return rank(a.slug) - rank(b.slug);
  });
  return requestedLanguages.map((language, languageIndex) => {
    const activityDates = new Map<string, string>();
    for (const variant of activities[languageIndex]) {
      for (const date of [...variant.drafts.map(draft => draft.updatedAt), ...variant.submissions.map(submission => submission.createdAt)]) {
        const value = date.toISOString();
        if (value > (activityDates.get(variant.version.exerciseId) ?? "")) activityDates.set(variant.version.exerciseId, value);
      }
    }
    const entries = exercises.flatMap(e => {
      const version = e.versions.find(version => version.variants.some(variant => variant.language === language));
      if (!version) return [];
      const { variants: _variants, ...metadata } = version;
      void _variants; // No enviar metadatos internos de variantes al catálogo público.
      const active = e.progress.find(item => item.language === language);
      const other = e.progress.find(item => item.language !== language && item.firstPassedAt);
      return [{ id: e.id, slug: e.slug, category: e.category, order: 0, ...metadata, solved: !!active?.firstPassedAt, started: activityDates.has(e.id) || (active?.attempts ?? 0) > 0, solvedOther: !!other?.firstPassedAt, lastActivityAt: activityDates.get(e.id) }];
    });
    return orderLanguageCatalog(entries, language).map((entry, order) => {
      const category = language === "python" && hasPythonCurriculum(entries) ? pythonStepMetadata(entry.slug)?.category ?? entry.category : entry.category;
      return { ...entry, category, order };
    });
  });
}

export async function getExercise(slug: string, language: Language, userId?: string) {
  const [exercise, pythonCurriculum] = await Promise.all([
    db.exercise.findUnique({
      where: { slug, published: true },
      select: { id: true, slug: true, category: true,
        versions: { where: { published: true }, orderBy: { number: "desc" }, select: {
          id: true, title: true, statement: true, constraints: true, hints: true, level: true, minutes: true, number: true,
          objective: true, prerequisites: true, practiceGoals: true, prerequisiteSlugs: true, activityType: true,
          runtimeMode: true, complexity: true, commonErrors: true,
          variants: { select: { id: true, language: true, starter: true, statement: true, project: true,
            tests: { where: { visible: true }, orderBy: { order: "asc" }, select: { input: true, expected: true, expectedFiles: true, explanation: true } },
            drafts: { where: { userId: userId ?? "__guest__" }, select: { code: true, files: true, revision: true } },
          } },
        } },
      },
    }),
    language === "python" ? db.exercise.findFirst({ where: { slug: pythonCurriculumMarker, published: true, versions: { some: { published: true, variants: { some: { language: "python" } } } } }, select: { id: true } }) : null,
  ]);
  if (!exercise) return null;
  const availableLanguages = languages.filter(language => exercise.versions.some(version => version.variants.some(variant => variant.language === language)));
  const version = exercise.versions.find(version => version.variants.some(variant => variant.language === language)) ?? exercise.versions[0];
  const category = language === "python" && pythonCurriculum ? pythonStepMetadata(exercise.slug)?.category ?? exercise.category : exercise.category;
  return { ...exercise, category, availableLanguages, versions: version ? [version] : [] };
}
