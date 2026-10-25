import "server-only";
import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { mkdir, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { db } from "./db";
import { localAuthIpAddress } from "@/lib/auth-security";

export const auth = betterAuth({
  appName: "Itera",
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(db, { provider: "postgresql" }),
  trustedOrigins: ["http://127.0.0.1:3000", "http://localhost:3000"],
  advanced: { ipAddress: localAuthIpAddress },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 10,
    maxPasswordLength: 128,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await mkdir(".local/mail", { recursive: true });
      await writeFile(`.local/mail/${Date.now()}-${randomUUID()}.txt`, `Para: ${user.email}\nAsunto: Recupera tu cuenta de Itera\n\nAbre este enlace para elegir una nueva contraseña:\n${url}\n\nEste mensaje solo existe en tu computadora.\n`, { mode: 0o600 });
    },
  },
  user: { additionalFields: { role: { type: "string", defaultValue: "USER", input: false }, onboardingStep: { type: "number", defaultValue: 2, input: false } } },
  databaseHooks: {
    session: { create: { before: async session => {
      const user = await db.user.findUnique({ where: { id: session.userId }, select: { disabledAt: true } });
      if (!user || user.disabledAt) throw new APIError("FORBIDDEN", { code: "ACCOUNT_DISABLED", message: "Esta cuenta está desactivada. Contacta con un administrador." });
    } } },
  },
  hooks: { before: createAuthMiddleware(async ctx => {
    if (ctx.path === "/sign-up/email") {
      const name = typeof ctx.body?.name === "string" ? ctx.body.name.trim() : "";
      if (name.length < 2 || name.length > 60) throw new APIError("BAD_REQUEST", { message: "El nombre debe tener entre 2 y 60 caracteres." });
      ctx.body.name = name;
    }
    // También protege las llamadas directas a Better Auth, no solo la interfaz.
    if (ctx.path === "/change-password" && ctx.body) {
      if (ctx.body.newPassword === ctx.body.currentPassword) throw new APIError("BAD_REQUEST", { message: "Elige una contraseña diferente a la actual." });
      ctx.body.revokeOtherSessions = true;
    }
    const token = await ctx.getSignedCookie(ctx.context.authCookies.sessionToken.name, ctx.context.secret);
    if (!token || ctx.path === "/sign-out") return;
    const session = await db.session.findUnique({ where: { token }, select: { user: { select: { disabledAt: true } } } });
    if (session?.user.disabledAt) throw new APIError("FORBIDDEN", { code: "ACCOUNT_DISABLED", message: "Esta cuenta está desactivada. Contacta con un administrador." });
  }) },
  rateLimit: { enabled: true, window: 60, max: 40 },
});

export const currentUser = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  return db.user.findFirst({ where: { id: session.user.id, disabledAt: null }, select: { id: true, name: true, email: true, role: true, createdAt: true, preference: true, onboardingStep: true } });
});

export async function requireUser() {
  const user = await currentUser();
  if (!user) redirect("/iniciar-sesion");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/inicio");
  return user;
}
