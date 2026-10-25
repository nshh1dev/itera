import { APIError } from "better-auth/api";
import { newPasswordIssue } from "../lib/password-policy";

// Función interna, no Server Action. No aplica la política a contraseñas actuales.
export function assertNewPasswordPolicy(path: string, body: unknown) {
  const field = path === "/sign-up/email" ? "password" : ["/change-password", "/reset-password"].includes(path) ? "newPassword" : null;
  if (!field || !body || typeof body !== "object" || !(field in body)) return;
  const password = (body as Record<string, unknown>)[field];
  // Better Auth conserva la validación de tipos y campos obligatorios.
  if (typeof password !== "string") return;
  const message = newPasswordIssue(password);
  if (message) throw new APIError("BAD_REQUEST", { code: "WEAK_PASSWORD", message });
}
