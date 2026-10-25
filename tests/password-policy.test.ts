import { test } from "node:test";
import assert from "node:assert/strict";
import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import { createAuthMiddleware } from "better-auth/api";
import { hashPassword, verifyPassword } from "better-auth/crypto";
import { newPasswordIssue } from "../src/lib/password-policy";
import { assertNewPasswordPolicy } from "../src/server/password-policy";
import { passwordChangeSchema } from "../src/lib/account-validation";

test("rechaza palabras comunes, secuencias y repeticiones sin limitarse a la longitud", () => {
  for (const password of ["password123", "PASSWORD123!", "P@ssw0rd123", "Contraseña123!", "ｐａｓｓｗｏｒｄ１２３", "HolaMundo123", "qwertyuiop", "1234567890", "0987654321", "abcdefghijklmn", "aaaaaaaaaa", "AbAbAbAbAb", "abcdabcdabcd", "🙂".repeat(10), " ".repeat(20)]) {
    assert.ok(newPasswordIssue(password));
    assert.equal(passwordChangeSchema.safeParse({ currentPassword: "anterior", newPassword: password, confirmation: password }).success, false);
  }
});

test("acepta frases, Unicode y claves generadas sin exigir mayúsculas ni símbolos", () => {
  for (const password of ["tres faros junto al bosque", "cañón nieve río montaña", "sol luna nube", "8729461035", "R8v!qK3m#z", "🌲 bosque y lluvia 🌧️", "🌲🚆☀️🌧️🏔️🦉🌊", "!@#%&*?+=~", "  dos trenes al amanecer  ", "una frase larga ".repeat(8)]) {
    assert.equal(newPasswordIssue(password), null);
    const parsed = passwordChangeSchema.parse({ currentPassword: "actual", newPassword: password, confirmation: password });
    assert.equal(parsed.newPassword, password);
  }
  assert.ok(newPasswordIssue("corta"));
  assert.ok(newPasswordIssue("una frase larga ".repeat(9)));
});

test("el control solo examina nuevas contraseñas, no login ni verificación de la actual", () => {
  for (const path of ["/sign-in/email", "/verify-password", "/request-password-reset", "/update-user"]) {
    assert.doesNotThrow(() => assertNewPasswordPolicy(path, { password: "password123", newPassword: "password123" }));
  }
  for (const body of [null, undefined, {}, { newPassword: 123 }, "password123"]) {
    assert.doesNotThrow(() => assertNewPasswordPolicy("/reset-password", body));
  }
});

function fixture() {
  const memory: Parameters<typeof memoryAdapter>[0] = { user: [], session: [], account: [], verification: [] };
  let resetToken = "";
  const auth = betterAuth({
    baseURL: "http://127.0.0.1:3000",
    secret: "test-only-una-clave-de-prueba-sin-uso-real-1234567890",
    database: memoryAdapter(memory),
    emailAndPassword: {
      enabled: true, minPasswordLength: 10, maxPasswordLength: 128,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({ token }) => { resetToken = token; },
    },
    rateLimit: { enabled: false },
    hooks: { before: createAuthMiddleware(async ctx => { assertNewPasswordPolicy(ctx.path, ctx.body); }) },
  });
  const post = (path: string, body: unknown, cookie = "") => auth.handler(new Request(`http://127.0.0.1:3000/api/auth${path}`, {
    method: "POST", headers: { "content-type": "application/json", origin: "http://127.0.0.1:3000", ...(cookie ? { cookie } : {}) }, body: JSON.stringify(body),
  }));
  return { memory, post, token: () => resetToken };
}

const validPassword = "tres faros junto al bosque";
const email = "password-policy@example.test";
const cookieFrom = (response: Response) => response.headers.getSetCookie().map(cookie => cookie.split(";")[0]).join("; ");

test("registro HTTP directo rechaza la contraseña débil antes de crear una cuenta", async () => {
  const { memory, post } = fixture();
  const rejected = await post("/sign-up/email", { name: "Prueba", email, password: "password123" });
  assert.equal(rejected.status, 400);
  assert.equal((await rejected.json()).code, "WEAK_PASSWORD");
  assert.equal(memory.user.length, 0);
  assert.equal(memory.account.length, 0);
  const accepted = await post("/sign-up/email", { name: "Prueba", email, password: validPassword });
  assert.equal(accepted.status, 200);
  assert.equal(await verifyPassword({ hash: memory.account[0].password, password: validPassword }), true);
});

test("el cambio HTTP rechaza la nueva clave débil y permite acceder con una clave histórica", async () => {
  const { memory, post } = fixture();
  assert.equal((await post("/sign-up/email", { name: "Prueba", email, password: validPassword })).status, 200);
  // Simula una cuenta anterior a la política sin pasar por un nuevo registro.
  memory.account[0].password = await hashPassword("password123");
  const previousHash = memory.account[0].password;
  const login = await post("/sign-in/email", { email, password: "password123" });
  assert.equal(login.status, 200);
  const cookie = cookieFrom(login);
  assert.ok(cookie);
  const rejected = await post("/change-password", { currentPassword: "password123", newPassword: "1234567890" }, cookie);
  assert.equal(rejected.status, 400);
  assert.equal((await rejected.json()).code, "WEAK_PASSWORD");
  assert.equal(memory.account[0].password, previousHash);
  const accepted = await post("/change-password", { currentPassword: "password123", newPassword: validPassword }, cookie);
  assert.equal(accepted.status, 200);
  assert.equal(await verifyPassword({ hash: memory.account[0].password, password: validPassword }), true);
});

test("la recuperación rechaza una clave débil sin consumir el token y conserva su uso único", async () => {
  const { memory, post, token } = fixture();
  assert.equal((await post("/sign-up/email", { name: "Prueba", email, password: validPassword })).status, 200);
  const previousHash = memory.account[0].password;
  assert.equal((await post("/request-password-reset", { email })).status, 200);
  assert.ok(token());
  const rejected = await post("/reset-password", { token: token(), newPassword: "aaaaaaaaaa" });
  assert.equal(rejected.status, 400);
  assert.equal((await rejected.json()).code, "WEAK_PASSWORD");
  assert.equal(memory.account[0].password, previousHash);
  const nextPassword = "dos trenes llegan al amanecer";
  assert.equal((await post("/reset-password", { token: token(), newPassword: nextPassword })).status, 200);
  assert.equal(await verifyPassword({ hash: memory.account[0].password, password: nextPassword }), true);
  assert.equal(memory.session.length, 0);
  assert.equal((await post("/reset-password", { token: token(), newPassword: validPassword })).status, 400);
  assert.equal(await verifyPassword({ hash: memory.account[0].password, password: nextPassword }), true);
});
