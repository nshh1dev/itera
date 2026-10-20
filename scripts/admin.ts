import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const email = process.argv[2]?.trim().toLowerCase();
if (!email) { console.error("Uso: npm run admin -- tu-correo@ejemplo.com"); process.exit(1); }
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
try {
  const user = await db.$transaction(async tx => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('itera:account-administration'))`;
    const account = await tx.user.update({ where: { email }, data: { role: "ADMIN" } });
    await tx.session.deleteMany({ where: { userId: account.id } });
    await tx.auditLog.create({ data: { userId: account.id, action: "account.role.ADMIN.cli", resource: account.id } });
    return account;
  });
  console.log(user.disabledAt ? `${user.email} tiene rol ADMIN, pero sigue desactivada. Otro administrador debe reactivarla.` : `${user.email} ahora puede acceder a /admin. Inicia sesión de nuevo.`);
} catch { console.error("No se encontró esa cuenta. Regístrate primero en Itera."); process.exitCode = 1; }
finally { await db.$disconnect(); }
