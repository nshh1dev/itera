"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth, requireAdmin, requireUser } from "./auth";
import { db } from "./db";
import { emailChangeSchema, deactivateAccountSchema } from "@/lib/account-validation";

async function verifyCurrentPassword(userId: string, password: string) {
  // Límite persistente compartido entre pestañas y procesos. Nunca guarda contraseñas.
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

export async function changeAccountEmail(input: unknown) {
  const user = await requireUser();
  const parsed = emailChangeSchema.safeParse(input);
  if (!parsed.success) return { error: "Introduce un correo válido y tu contraseña actual." };
  const { email, password } = parsed.data;
  if (email === user.email) return { error: "Introduce un correo diferente al actual." };
  const error = await verifyCurrentPassword(user.id, password);
  if (error) return { error };
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { error: "Vuelve a iniciar sesión para cambiar tu correo." };
    await db.$transaction(async tx => {
      const updated = await tx.user.updateMany({ where: { id: user.id, disabledAt: null }, data: { email, emailVerified: false } });
      if (!updated.count) throw new Error("inactive");
      await tx.session.deleteMany({ where: { userId: user.id, id: { not: session.session.id } } });
      await tx.auditLog.create({ data: { userId: user.id, action: "account.email.changed", resource: user.id } });
    });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") return { error: "No se puede utilizar este correo. Prueba con otro." };
    return { error: "No se pudo cambiar el correo. Inténtalo de nuevo." };
  }
  revalidatePath("/", "layout");
  return { success: true };
}

export async function deactivateAccount(input: unknown) {
  const user = await requireUser();
  const parsed = deactivateAccountSchema.safeParse(input);
  if (!parsed.success) return { error: "Confirma la desactivación e introduce tu contraseña actual." };
  const error = await verifyCurrentPassword(user.id, parsed.data.password);
  if (error) return { error };
  const result = await db.$transaction(async tx => {
    // Serializa las desactivaciones administrativas para evitar dejar la instalación sin administrador.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('itera:account-administration'))`;
    if (user.role === "ADMIN" && await tx.user.count({ where: { role: "ADMIN", disabledAt: null, id: { not: user.id } } }) === 0) {
      return { error: "Otro administrador activo debe poder reactivar tu cuenta. Designa uno antes de desactivarla." };
    }
    await tx.user.update({ where: { id: user.id }, data: { disabledAt: new Date() } });
    await tx.session.deleteMany({ where: { userId: user.id } });
    await tx.auditLog.create({ data: { userId: user.id, action: "account.deactivated", resource: user.id } });
    return { success: true };
  });
  return result;
}

export async function reactivateAccount(formData: FormData) {
  const admin = await requireAdmin();
  const userId = formData.get("userId");
  if (typeof userId !== "string" || !userId || userId.length > 100) return { error: "No se pudo identificar la cuenta." };
  try {
    await db.$transaction(async tx => {
      const updated = await tx.user.updateMany({ where: { id: userId, disabledAt: { not: null } }, data: { disabledAt: null } });
      if (updated.count) {
        await tx.session.deleteMany({ where: { userId } });
        await tx.auditLog.create({ data: { userId: admin.id, action: "account.reactivated", resource: userId } });
      }
    });
  } catch { return { error: "No se pudo reactivar la cuenta. Inténtalo de nuevo." }; }
  revalidatePath("/admin/cuentas");
  return { success: true };
}
