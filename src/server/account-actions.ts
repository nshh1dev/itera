"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth, requireAdmin, requireUser } from "./auth";
import { db } from "./db";
import { emailChangeSchema, deactivateAccountSchema } from "@/lib/account-validation";
import { adminAccountSchema } from "@/lib/admin-account-validation";
import { verifyCurrentPassword } from "./account-password";
import { applyAccountChange } from "./account-administration";

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
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Vuelve a iniciar sesión." };
  const result = await applyAccountChange(db, user.id, session.session.id, { userId: user.id, operation: "deactivate", expectedRole: user.role, expectedDisabled: false }, true);
  revalidatePath("/", "layout");
  return result;
}

export async function administerAccount(input: unknown) {
  const admin = await requireAdmin();
  const parsed = adminAccountSchema.safeParse(input);
  if (!parsed.success) return { error: "Confirma la acción e introduce tu contraseña actual." };
  const error = await verifyCurrentPassword(admin.id, parsed.data.password);
  if (error) return { error };
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Vuelve a iniciar sesión." };
  try {
    const result = await applyAccountChange(db, admin.id, session.session.id, parsed.data);
    revalidatePath("/", "layout");
    return result;
  } catch { return { error: "No se pudo actualizar la cuenta. Inténtalo de nuevo." }; }
}
