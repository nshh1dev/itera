import "dotenv/config";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import assert from "node:assert/strict";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { applyAccountChange } from "../src/server/account-administration";

test("administración transaccional: permisos, concurrencia y último administrador", async () => {
  // Esquema efímero con las mismas columnas/índices: no modifica usuarios de la aplicación.
  const schema = `test_admin_${randomUUID().replaceAll("-", "")}`;
  const root = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }, { schema }) });
  try {
    await root.$executeRawUnsafe(`CREATE SCHEMA "${schema}"`);
    for (const table of ["User", "Session", "AuditLog"]) await root.$executeRawUnsafe(`CREATE TABLE "${schema}"."${table}" (LIKE "public"."${table}" INCLUDING ALL)`);
    await root.$executeRawUnsafe(`CREATE TYPE "${schema}"."Role" AS ENUM ('USER', 'ADMIN')`);
    await root.$executeRawUnsafe(`ALTER TABLE "${schema}"."User" ALTER COLUMN "role" DROP DEFAULT, ALTER COLUMN "role" TYPE "${schema}"."Role" USING "role"::text::"${schema}"."Role"`);
    await root.$executeRawUnsafe(`ALTER TABLE "${schema}"."User" ALTER COLUMN "role" SET DEFAULT 'USER'::"${schema}"."Role"`);
    for (const [id, role] of [["a", "ADMIN"], ["b", "ADMIN"], ["u", "USER"]] as const) {
      await db.user.create({ data: { id, email: `${id}@example.test`, name: id, role } });
      await db.session.create({ data: { id, token: id, userId: id, expiresAt: new Date(Date.now() + 3600_000) } });
    }
    const change = { userId: "a", operation: "deactivate", expectedRole: "ADMIN", expectedDisabled: false } as const;
    assert.ok((await applyAccountChange(db, "u", "u", change)).error);
    assert.ok((await applyAccountChange(db, "u", "u", change, true)).error);
    assert.ok((await applyAccountChange(db, "a", "missing", change)).error);
    assert.ok((await applyAccountChange(db, "a", "u", change)).error);
    await db.session.update({ where: { id: "a" }, data: { expiresAt: new Date(Date.now() - 1000) } });
    assert.ok((await applyAccountChange(db, "a", "a", change)).error);
    await db.session.update({ where: { id: "a" }, data: { expiresAt: new Date(Date.now() + 3600_000) } });
    assert.ok((await applyAccountChange(db, "a", "a", { ...change, expectedRole: "USER" })).error);
    const results = await Promise.all([
      applyAccountChange(db, "a", "a", change, true),
      applyAccountChange(db, "b", "b", { userId: "b", operation: "demote", expectedRole: "ADMIN", expectedDisabled: false }),
    ]);
    assert.equal(results.filter(result => result.success).length, 1);
    assert.equal(results.filter(result => result.error).length, 1);
    assert.equal(await db.user.count({ where: { role: "ADMIN", disabledAt: null } }), 1);
    const survivor = await db.user.findFirstOrThrow({ where: { role: "ADMIN", disabledAt: null } });
    const removed = survivor.id === "a" ? "b" : "a";
    assert.equal(await db.session.count({ where: { userId: removed } }), 0);
    assert.equal(await db.auditLog.count(), 1);
    assert.ok((await applyAccountChange(db, survivor.id, survivor.id, { userId: survivor.id, operation: "deactivate", expectedRole: "ADMIN", expectedDisabled: false }, true)).error);
    assert.ok((await applyAccountChange(db, survivor.id, survivor.id, { userId: survivor.id, operation: "demote", expectedRole: "ADMIN", expectedDisabled: false })).error);
    const member = await db.user.findUniqueOrThrow({ where: { id: removed } });
    const outcome = await applyAccountChange(db, survivor.id, survivor.id, { userId: removed, operation: member.disabledAt ? "activate" : "promote", expectedRole: member.role, expectedDisabled: !!member.disabledAt });
    assert.ok(outcome.success);
    await db.user.update({ where: { id: survivor.id }, data: { disabledAt: new Date() } });
    assert.ok((await applyAccountChange(db, survivor.id, survivor.id, { userId: "u", operation: "promote", expectedRole: "USER", expectedDisabled: false })).error);
  } finally {
    await db.$disconnect();
    await root.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
    await root.$disconnect();
  }
});
