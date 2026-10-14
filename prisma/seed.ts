import "dotenv/config";
import { PrismaClient, Prisma } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { exercises, starter } from "./content";
import { introductoryExercises } from "./introductory-content";
import { learningPaths } from "../src/lib/learning-paths";
import type { Json } from "../src/lib/types";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const json = (value: Json) => value === null ? Prisma.JsonNull : value;

async function seed() {
  for (const [order, exercise] of exercises.entries()) {
    if (await db.exercise.findUnique({ where: { slug: exercise.slug } })) continue;
    await db.exercise.create({ data: {
      slug: exercise.slug, category: exercise.category, order: order - introductoryExercises.length,
      versions: { create: {
        title: exercise.title, description: exercise.description, statement: exercise.statement, published: true,
        objective: exercise.objective ?? "", prerequisites: exercise.prerequisites ?? [],
        level: exercise.level, minutes: exercise.minutes, constraints: exercise.constraints, hints: exercise.hints,
        variants: { create: (["python", "javascript"] as const).map((language) => ({
          language, starter: exercise.starters?.[language] ?? starter[language], solution: exercise[language], explanation: exercise.explanation,
          tests: { create: exercise.tests.map((test, index) => ({ input: json(test.input), expected: json(test.expected), visible: index < 2, order: index })) },
        })) },
      } },
    } });
  }
  const introSlugs = introductoryExercises.map(exercise => exercise.slug);
  for (const path of learningPaths) {
    if (await db.learningPath.findUnique({ where: { slug: path.slug } })) continue;
    const items = await db.exercise.findMany({ where: {
      slug: path.slugs ? { in: path.slugs } : { notIn: introSlugs },
      versions: { some: { level: path.level, published: true } },
    }, orderBy: { order: "asc" } });
    if (path.slugs) items.sort((a, b) => path.slugs!.indexOf(a.slug) - path.slugs!.indexOf(b.slug));
    await db.learningPath.create({ data: { slug: path.slug, title: path.title, description: path.description, order: path.order, items: { create: items.map((e, position) => ({ exerciseId: e.id, position })) } } });
  }
  console.log(`Catálogo listo: ${await db.exercise.count()} ejercicios, Python y JavaScript, tres niveles y una ruta desde cero.`);
}

seed().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => db.$disconnect());
