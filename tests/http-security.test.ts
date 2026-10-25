import { test } from "node:test";
import assert from "node:assert/strict";
import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import { toNextJsHandler } from "better-auth/next-js";
import config from "../next.config";
import { uncachedAuthHandler } from "../src/lib/auth-security";

test("la configuración conserva las cabeceras básicas y limita referencia y dispositivos", async () => {
  const rules = await config.headers!();
  const global = rules.find(rule => rule.source === "/(.*)");
  assert.ok(global);
  const headers = new Headers(global.headers.map(({ key, value }) => [key, value]));
  assert.equal(headers.get("X-Content-Type-Options"), "nosniff");
  assert.equal(headers.get("X-Frame-Options"), "DENY");
  assert.equal(headers.get("Referrer-Policy"), "no-referrer");
  assert.equal(headers.get("Permissions-Policy"), "camera=(), microphone=(), geolocation=()");
  assert.equal(config.poweredByHeader, false);
  assert.equal(headers.has("Strict-Transport-Security"), false, "El entorno local funciona por HTTP.");
});

test("no-store conserva el cuerpo, estado y todas las cookies sin modificar el original", async () => {
  const headers = new Headers({ "Cache-Control": "public, max-age=3600", "Content-Type": "application/json" });
  headers.append("Set-Cookie", "session=synthetic; HttpOnly; Path=/; SameSite=Lax");
  headers.append("Set-Cookie", "other=synthetic; HttpOnly; Path=/; SameSite=Lax");
  const original = new Response('{"synthetic":true}', { status: 201, statusText: "Created", headers });
  const request = new Request("http://127.0.0.1:3000/api/auth/test");
  const response = await uncachedAuthHandler(async received => {
    assert.equal(received, request);
    return original;
  })(request);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  assert.equal(original.headers.get("Cache-Control"), "public, max-age=3600");
  assert.deepEqual(response.headers.getSetCookie(), original.headers.getSetCookie());
  assert.equal(response.status, 201);
  assert.equal(response.statusText, "Created");
  assert.equal(response.headers.get("Content-Type"), "application/json");
  assert.equal(await response.text(), '{"synthetic":true}');
});

test("no-store admite redirecciones inmutables y errores sin cambiar su significado", async () => {
  for (const original of [Response.redirect("http://127.0.0.1:3000/iniciar-sesion", 302), Response.json({ error: "synthetic" }, { status: 401 }), new Response(null, { status: 429 })]) {
    const response = await uncachedAuthHandler(async () => original)(new Request("http://127.0.0.1:3000/api/auth/test"));
    assert.equal(response.headers.get("Cache-Control"), "no-store");
    assert.equal(response.status, original.status);
    assert.equal(response.headers.get("Location"), original.headers.get("Location"));
  }
});

test("el handler real de Better Auth aplica no-store en GET, registro y errores", async () => {
  const auth = betterAuth({
    baseURL: "http://127.0.0.1:3000",
    secret: "test-only-una-clave-de-prueba-sin-uso-real-1234567890",
    database: memoryAdapter({ user: [], session: [], account: [], verification: [] }),
    emailAndPassword: { enabled: true, minPasswordLength: 10 },
    rateLimit: { enabled: false },
  });
  const { GET, POST } = toNextJsHandler(uncachedAuthHandler(request => auth.handler(request)));
  const ok = await GET(new Request("http://127.0.0.1:3000/api/auth/ok"));
  assert.equal(ok.status, 200);
  assert.equal(ok.headers.get("Cache-Control"), "no-store");
  const registered = await POST(new Request("http://127.0.0.1:3000/api/auth/sign-up/email", {
    method: "POST", headers: { "Content-Type": "application/json", Origin: "http://127.0.0.1:3000" },
    body: JSON.stringify({ email: "http-security@example.test", name: "Prueba", password: "tres faros junto al bosque" }),
  }));
  assert.equal(registered.status, 200);
  assert.equal(registered.headers.get("Cache-Control"), "no-store");
  assert.ok(registered.headers.getSetCookie().some(cookie => cookie.includes("session_token=")));
  const invalid = await POST(new Request("http://127.0.0.1:3000/api/auth/sign-in/email", {
    method: "POST", headers: { "Content-Type": "application/json", Origin: "http://127.0.0.1:3000" }, body: "{}",
  }));
  assert.equal(invalid.status, 400);
  assert.equal(invalid.headers.get("Cache-Control"), "no-store");
  const forbidden = await POST(new Request("http://127.0.0.1:3000/api/auth/sign-in/email", {
    method: "POST", headers: { "Content-Type": "application/json", Origin: "http://untrusted.example" },
    body: JSON.stringify({ email: "http-security@example.test", password: "tres faros junto al bosque" }),
  }));
  assert.equal(forbidden.status, 403);
  assert.equal(forbidden.headers.get("Cache-Control"), "no-store");
  const missing = await GET(new Request("http://127.0.0.1:3000/api/auth/does-not-exist"));
  assert.equal(missing.status, 404);
  assert.equal(missing.headers.get("Cache-Control"), "no-store");
});
