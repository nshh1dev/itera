import { pythonCurriculumSlugs, pythonCurriculumUnits, hasPythonCurriculum } from "./python-curriculum";
import type { Language } from "./types";

// No proyectar borradores: el catálogo recibido debe contener solo variantes publicadas.
export function orderLanguageCatalog<T extends { slug: string }>(catalog: T[], language: Language): T[] {
  if (language !== "python" || !hasPythonCurriculum(catalog)) return catalog;
  const ranks = new Map(pythonCurriculumSlugs.map((slug, index) => [slug, index]));
  return [...catalog].sort((a, b) => (ranks.get(a.slug) ?? ranks.size) - (ranks.get(b.slug) ?? ranks.size));
}

export function languagePaths<T extends { slug: string; items: { exerciseId: string }[] }>(paths: T[], catalog: readonly { id: string; slug: string }[], language: Language): T[] {
  if (language !== "python" || !hasPythonCurriculum(catalog)) return paths;
  const ids = new Map(catalog.map(entry => [entry.slug, entry.id]));
  const curriculumIds = new Set(pythonCurriculumSlugs.flatMap(slug => ids.has(slug) ? [ids.get(slug)!] : []));
  return paths.map(path => {
    const units = pythonCurriculumUnits.filter(unit => unit.path === path.slug);
    if (!units.length) return path;
    const slugs = units.flatMap(unit => unit.steps.map(step => step.key.startsWith("python-") ? step.key : `logica-${step.key}`));
    return { ...path, items: [
      ...slugs.flatMap(slug => ids.has(slug) ? [{ exerciseId: ids.get(slug)! }] : []),
      ...path.items.filter(item => !curriculumIds.has(item.exerciseId)),
    ] };
  });
}
