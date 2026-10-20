import "server-only";
import type { PrismaClient } from "@/generated/prisma/client";
import type { AdminAccountInput } from "@/lib/admin-account-validation";

type Change = Pick<AdminAccountInput, "userId" | "operation" | "expectedRole" | "expectedDisabled">;

// No es una Server Action: sus únicos llamadores verifican contraseña y sesión.
// El bloqueo también se comparte con la autodesactivación y la herramienta CLI.
export async function applyAccountChange(db: PrismaClient, actorId: string, sessionId: string, change: Change, selfDeactivation = false) {
  return db.$transaction(async tx => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('itera:account-administration'))`;
    const [actor, session, target] = await Promise.all([
      tx.user.findUnique({ where: { id: actorId }, select: { role: true, disabledAt: true } }),
      tx.session.findFirst({ where: { id: sessionId, userId: actorId, expiresAt: { gt: new Date() } }, select: { id: true } }),
      tx.user.findUnique({ where: { id: change.userId }, select: { role: true, disabledAt: true } }),
    ]);
    const selfAllowed = selfDeactivation && actorId === change.userId && change.operation === "deactivate";
    if (!actor || actor.disabledAt || !session || (!selfAllowed && actor.role !== "ADMIN")) return { error: "Ya no tienes permiso para realizar esta acción. Vuelve a iniciar sesión." };
    if (!target) return { error: "La cuenta ya no existe." };
    if (target.role !== change.expectedRole || !!target.disabledAt !== change.expectedDisabled) return { error: "La cuenta ha cambiado. Recarga la página antes de continuar." };
    const role = change.operation === "promote" ? "ADMIN" : change.operation === "demote" ? "USER" : target.role;
    const disabledAt = change.operation === "deactivate" ? new Date() : change.operation === "activate" ? null : target.disabledAt;
    if (target.role === "ADMIN" && !target.disabledAt && (role !== "ADMIN" || disabledAt)) {
      const others = await tx.user.count({ where: { role: "ADMIN", disabledAt: null, id: { not: change.userId } } });
      if (!others) return { error: "Debe quedar al menos un administrador activo. Designa otro antes de continuar." };
    }
    if (role === target.role && !!disabledAt === !!target.disabledAt) return { success: true };
    await tx.user.update({ where: { id: change.userId }, data: { role, disabledAt } });
    await tx.session.deleteMany({ where: { userId: change.userId } });
    const action = change.operation === "promote" ? "account.role.ADMIN" : change.operation === "demote" ? "account.role.USER" : disabledAt ? "account.deactivated" : "account.reactivated";
    await tx.auditLog.create({ data: { userId: actorId, action, resource: change.userId } });
    return { success: true };
  });
}
