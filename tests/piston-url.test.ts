import { test } from "node:test";
import assert from "node:assert/strict";
import { pistonOrigin } from "../src/lib/piston-url.mjs";

test("Piston conserva el acceso HTTP de loopback dentro y fuera de Docker", () => {
  for (const origin of ["http://127.0.0.1:2000", "http://localhost:2001", "http://[::1]:2000"]) {
    assert.equal(pistonOrigin(origin), origin);
    assert.equal(pistonOrigin(origin, true), origin);
  }
});

test("el servicio Piston solo se autoriza explícitamente en el entorno contenedor", () => {
  assert.throws(() => pistonOrigin("http://piston:2000"));
  assert.equal(pistonOrigin("http://piston:2000", true), "http://piston:2000");
  for (const url of ["http://piston:2001", "http://piston.example:2000", "http://database:5432", "http://192.168.1.1:2000", "https://piston:2000", "http://user:pass@piston:2000", "not-a-url"]) {
    assert.throws(() => pistonOrigin(url, true), url);
  }
});
