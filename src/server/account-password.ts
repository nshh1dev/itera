import "server-only";
import { headers } from "next/headers";
import { auth } from "./auth";
import { db } from "./db";

export async function verifyCurrentPassword(userId: string, password: string) {
  const allowed = await db.$transaction(async tx => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`account-action:${userId}`}))`;
    const previous = await tx.accountActionLimit.findUnique({ where: { userId } });
    const now = new Date();
    if (!previous || now.getTime() - previous.startedAt.getTime() >= 60_000) {
      await tx.accountActionLimit.upsert({ where: { userId }, create: { userId, attempts: 1, startedAt: now }, update: { attempts: 1, startedAt: now } });
      return true;
    }
    if (previous.attempts >= 5) return false;
    await tx.accountActionLimit.update({ where: { userId }, data: { attempts: { increment: 1 } } });
    return true;
  });
  if (!allowed) return "Demasiados intentos. Espera un minuto antes de volver a intentarlo.";
  try {
    await auth.api.verifyPassword({ headers: await headers(), body: { password } });
    return null;
  } catch { return "No se pudo verificar tu contraseña actual. Revísala o vuelve a iniciar sesión."; }
}
