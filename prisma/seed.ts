import "dotenv/config";
import { PrismaClient, Prisma } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { exercises, starter } from "./content";
import type { Json } from "../src/lib/types";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const json = (value: Json) => value === null ? Prisma.JsonNull : value;

async function seed() {
  for (const [order, exercise] of exercises.entries()) {
    if (await db.exercise.findUnique({ where: { slug: exercise.slug } })) continue;
    await db.exercise.create({ data: {
      slug: exercise.slug, category: exercise.category, order,
      versions: { create: {
        title: exercise.title, description: exercise.description, statement: exercise.statement, published: true,
        level: exercise.level, minutes: exercise.minutes, constraints: exercise.constraints, hints: exercise.hints,
        variants: { create: (["python", "javascript"] as const).map((language) => ({
          language, starter: starter[language], solution: exercise[language], explanation: exercise.explanation,
          tests: { create: exercise.tests.map((test, index) => ({ input: json(test.input), expected: json(test.expected), visible: index < 2, order: index })) },
        })) },
      } },
    } });
  }
  const paths = [
    { slug: "primeros-pasos", title: "Construye tus bases", description: "De tu primera suma a pensar en condiciones, bucles y datos. Un comienzo a tu ritmo.", level: "BEGINNER" },
    { slug: "pensar-en-soluciones", title: "Conecta las ideas", description: "Combina lo que sabes. Encuentra patrones y elige la estructura adecuada para cada problema.", level: "INTERMEDIATE" },
    { slug: "un-paso-mas", title: "Ve un paso más allá", description: "Ventanas, grafos y programación dinámica. Problemas que invitan a mirar desde otro ángulo.", level: "ADVANCED" },
  ];
  for (const [order, path] of paths.entries()) {
    if (await db.learningPath.findUnique({ where: { slug: path.slug } })) continue;
    const items = await db.exercise.findMany({ where: { versions: { some: { level: path.level as "BEGINNER" | "INTERMEDIATE" | "ADVANCED" } } }, orderBy: { order: "asc" } });
    await db.learningPath.create({ data: { slug: path.slug, title: path.title, description: path.description, order, items: { create: items.map((e, position) => ({ exerciseId: e.id, position })) } } });
  }
  console.log(`Catálogo listo: ${await db.exercise.count()} ejercicios, Python y JavaScript, tres niveles.`);
}

seed().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => db.$disconnect());
