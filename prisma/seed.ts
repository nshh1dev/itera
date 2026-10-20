import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { prepareLogicCatalog } from "./logic-install";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function seed() {
  const created = await prepareLogicCatalog(db);
  console.log(`${created} borradores nuevos preparados. No se ha publicado contenido ni retirado el catálogo anterior.`);
  console.log("Con Piston preparado, ejecuta npm run content:replace -- --apply para validar los tres lenguajes y activar las cuatro rutas.");
}

seed().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => db.$disconnect());
