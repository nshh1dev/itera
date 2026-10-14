import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { mkdir, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { db } from "./db";

export const auth = betterAuth({
  appName: "Itera",
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(db, { provider: "postgresql" }),
  trustedOrigins: ["http://127.0.0.1:3000", "http://localhost:3000"],
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
  user: { additionalFields: { role: { type: "string", defaultValue: "USER", input: false } } },
  rateLimit: { enabled: true, window: 60, max: 40 },
});

export const currentUser = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  return db.user.findUnique({ where: { id: session.user.id }, select: { id: true, name: true, email: true, role: true, createdAt: true, preference: true } });
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
