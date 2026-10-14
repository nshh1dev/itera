import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const email = process.argv[2]?.trim().toLowerCase();
if (!email) { console.error("Uso: npm run admin -- tu-correo@ejemplo.com"); process.exit(1); }
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
try {
  const user = await db.user.update({ where: { email }, data: { role: "ADMIN" } });
  console.log(`${user.email} ahora puede acceder a /admin.`);
} catch { console.error("No se encontró esa cuenta. Regístrate primero en Itera."); process.exitCode = 1; }
finally { await db.$disconnect(); }
