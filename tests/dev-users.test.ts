import { test } from "node:test";
import assert from "node:assert/strict";
import { devProfiles, profileSlugs, assertDevelopmentDatabase } from "../scripts/dev-users-data";
import { learningPaths } from "../src/lib/learning-paths";
import { adminAccountSchema } from "../src/lib/admin-account-validation";

test("el seed rechaza producción, activación implícita y bases remotas", () => {
  const env = { NODE_ENV: "development", ITERA_DEV_USERS: "1", DATABASE_URL: "postgresql://local:secret@127.0.0.1:5434/itera" };
  assert.equal(assertDevelopmentDatabase(env), "127.0.0.1:5434/itera");
  for (const change of [{ NODE_ENV: "production" }, { ITERA_DEV_USERS: "0" }, { DATABASE_URL: "postgresql://local:secret@db.example.com/itera" }, { DATABASE_URL: "https://localhost/itera" }, { DATABASE_URL: `${env.DATABASE_URL}?host=db.example.com` }, { DATABASE_URL: `${env.DATABASE_URL}?port=5432` }, { DATABASE_URL: `${env.DATABASE_URL}?options=-csearch_path=other` }]) assert.throws(() => assertDevelopmentDatabase({ ...env, ...change }));
});

test("diez perfiles distintos cubren niveles, desactivación y progreso independiente", () => {
  assert.equal(devProfiles.length, 10);
  assert.equal(new Set(devProfiles.map(profile => profile.key)).size, 10);
  const nuevo = devProfiles.find(profile => profile.key === "nuevo")!;
  assert.deepEqual(profileSlugs(nuevo, "python"), []);
  const advanced = devProfiles.find(profile => profile.key === "avanzado")!;
  assert.ok(profileSlugs(advanced, "typescript").some(slug => learningPaths[3].slugs?.includes(slug)));
  const multi = devProfiles.find(profile => profile.key === "multilenguaje")!;
  assert.equal(multi.languages.length, 3);
  assert.ok(profileSlugs(multi, "python").length > profileSlugs(multi, "typescript").length);
  assert.equal(devProfiles.filter(profile => profile.disabled).length, 1);
  assert.equal(devProfiles.filter(profile => profile.admin).length, 1);
  for (const profile of devProfiles) for (const language of profile.languages) {
    const slugs = profileSlugs(profile, language);
    assert.equal(new Set(slugs).size, slugs.length);
    assert.deepEqual(slugs, profileSlugs(profile, language));
  }
});

test("las acciones administrativas exigen confirmación, contraseña y estado esperado", () => {
  const input = { userId: "user", operation: "promote", expectedRole: "USER", expectedDisabled: false, password: "contraseña", confirmed: true };
  assert.ok(adminAccountSchema.safeParse(input).success);
  for (const change of [{ confirmed: false }, { confirmed: "true" }, { password: "" }, { operation: "delete" }, { expectedRole: "root" }, { expectedDisabled: "false" }, { role: "ADMIN" }]) assert.equal(adminAccountSchema.safeParse({ ...input, ...change }).success, false);
});
