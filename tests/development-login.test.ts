import { test } from "node:test";
import assert from "node:assert/strict";
import { developmentCredentials, developmentLoginAllowed } from "../src/lib/development-login";

test("el acceso rápido exige desarrollo y un origen local explícito", () => {
  const request = (origin?: string, site = "same-origin") => new Request("http://localhost:3000/api/development-login", {
    method: "POST", headers: { ...(origin ? { origin } : {}), "sec-fetch-site": site },
  });
  assert.equal(developmentLoginAllowed(request("http://127.0.0.1:3000"), "development"), true);
  assert.equal(developmentLoginAllowed(request("http://localhost:3000"), "development"), true);
  for (const environment of ["production", "test", undefined]) assert.equal(developmentLoginAllowed(request("http://localhost:3000"), environment), false);
  for (const origin of [undefined, "https://example.com", "http://localhost:3001", "null"]) assert.equal(developmentLoginAllowed(request(origin), "development"), false);
  assert.equal(developmentLoginAllowed(request("http://localhost:3000", "cross-site"), "development"), false);
});

test("las credenciales locales requieren valores válidos y no alteran la contraseña", () => {
  assert.deepEqual(developmentCredentials({ email: " LOCAL@example.com ", password: " clave local " }), { email: "local@example.com", password: " clave local " });
  for (const input of [null, {}, { email: 1, password: "clave" }, { email: "sin-correo", password: "clave" }, { email: "a@b", password: "" }, { email: "a@b", password: "a".repeat(129) }]) assert.equal(developmentCredentials(input), null);
});
