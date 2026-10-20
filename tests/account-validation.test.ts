import { test } from "node:test";
import assert from "node:assert/strict";
import { emailChangeSchema, passwordChangeSchema, deactivateAccountSchema } from "../src/lib/account-validation";

test("el cambio de correo normaliza el correo y exige contraseña", () => {
  assert.deepEqual(emailChangeSchema.parse({ email: "  Alumno@Example.test  ", password: "secreto" }), { email: "alumno@example.test", password: "secreto" });
  for (const input of [{ email: "invalido", password: "secreto" }, { email: "a@example.test", password: "" }, { email: "a@example.test", password: "x".repeat(129) }]) assert.equal(emailChangeSchema.safeParse(input).success, false);
});

test("la nueva contraseña respeta límites, confirmación y cambio efectivo", () => {
  const valid = { currentPassword: "actual-12345", newPassword: "nueva-12345", confirmation: "nueva-12345" };
  assert.equal(passwordChangeSchema.safeParse(valid).success, true);
  assert.equal(passwordChangeSchema.safeParse({ ...valid, confirmation: "otra" }).success, false);
  assert.equal(passwordChangeSchema.safeParse({ ...valid, currentPassword: valid.newPassword }).success, false);
  assert.equal(passwordChangeSchema.safeParse({ ...valid, newPassword: "corta", confirmation: "corta" }).success, false);
  assert.equal(passwordChangeSchema.safeParse({ ...valid, newPassword: "x".repeat(129), confirmation: "x".repeat(129) }).success, false);
});

test("desactivar requiere contraseña y confirmación explícita booleana", () => {
  assert.equal(deactivateAccountSchema.safeParse({ password: "secreto", confirmed: true }).success, true);
  for (const confirmed of [false, "true", "on", undefined]) assert.equal(deactivateAccountSchema.safeParse({ password: "secreto", confirmed }).success, false);
  assert.equal(deactivateAccountSchema.safeParse({ password: "", confirmed: true }).success, false);
});
