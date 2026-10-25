import { test } from "node:test";
import assert from "node:assert/strict";
import { betterAuth } from "better-auth";
import { localAuthIpAddress } from "../src/lib/auth-security";

test("el cupo local de Better Auth no cambia al falsificar cabeceras de IP", async () => {
  const auth = betterAuth({
    baseURL: "http://127.0.0.1:3000",
    secret: "test-only-una-clave-de-prueba-sin-uso-real-1234567890",
    advanced: { ipAddress: localAuthIpAddress },
    rateLimit: { enabled: true, window: 60, max: 2, storage: "memory" },
  });
  for (const [index, ip] of ["192.0.2.1", "192.0.2.2", "192.0.2.3"].entries()) {
    const response = await auth.handler(new Request("http://127.0.0.1:3000/api/auth/ok", {
      headers: { "x-forwarded-for": ip, "x-real-ip": ip, "cf-connecting-ip": ip },
    }));
    assert.equal(response.status, index < 2 ? 200 : 429);
  }
});
