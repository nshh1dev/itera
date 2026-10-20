import { z } from "zod";

const currentPassword = z.string().min(1, "Introduce tu contraseña actual.").max(128, "La contraseña actual no puede superar los 128 caracteres.");
export const emailChangeSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Introduce un correo electrónico válido.").max(254)),
  password: currentPassword,
});
export const passwordChangeSchema = z.object({
  currentPassword,
  newPassword: z.string().min(10, "La nueva contraseña debe tener al menos 10 caracteres.").max(128, "La nueva contraseña no puede superar los 128 caracteres."),
  confirmation: z.string(),
}).refine(value => value.newPassword === value.confirmation, { message: "Las contraseñas no coinciden.", path: ["confirmation"] })
  .refine(value => value.currentPassword !== value.newPassword, { message: "Elige una contraseña diferente a la actual.", path: ["newPassword"] });
export const deactivateAccountSchema = z.object({ password: currentPassword, confirmed: z.literal(true) });
