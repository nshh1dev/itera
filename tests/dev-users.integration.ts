import "dotenv/config";
import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { test } from "node:test";
import assert from "node:assert/strict";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { devProfiles, assertDevelopmentDatabase } from "../scripts/dev-users-data";

test("seed local: idempotencia, historial coherente y cuentas ajenas intactas", async () => {
  assertDevelopmentDatabase(process.env);
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
  const run = () => promisify(execFile)(process.execPath, ["node_modules/tsx/dist/cli.mjs", "scripts/dev-users.ts", "--apply"], { env: process.env });
  // Solo devuelve una huella; los hashes de contraseña no se imprimen ni en fallos.
  async function snapshot() {
    const rows = await Promise.all([
      db.user.findMany({ orderBy: { id: "asc" } }), db.account.findMany({ orderBy: { id: "asc" } }),
      db.userPreference.findMany({ orderBy: { userId: "asc" } }), db.session.findMany({ orderBy: { id: "asc" } }),
      db.progress.findMany({ orderBy: { id: "asc" } }), db.submission.findMany({ orderBy: { id: "asc" } }),
      db.draft.findMany({ orderBy: { id: "asc" } }), db.auditLog.findMany({ orderBy: { id: "asc" } }),
      db.helpUsage.findMany({ orderBy: { id: "asc" } }), db.accountActionLimit.findMany({ orderBy: { userId: "asc" } }),
      db.practiceContext.findMany({ orderBy: [{ userId: "asc" }, { exerciseId: "asc" }, { language: "asc" }] }),
    ]);
    return createHash("sha256").update(JSON.stringify(rows)).digest("hex");
  }
  try {
    await run();
    const before = await snapshot();
    const again = await run();
    assert.match(again.stdout, /Perfiles creados: 0/);
    assert.equal(await snapshot(), before);
    const ids = devProfiles.map(profile => `itera-dev-v1-${profile.key}`);
    assert.equal(await db.user.count({ where: { id: { in: ids } } }), 10);
    assert.equal(await db.progress.count({ where: { userId: ids[0] } }), 0);
    const progress = await db.progress.findMany({ where: { userId: { in: ids } } });
    for (const row of progress) {
      const attempts = await db.submission.findMany({ where: { userId: row.userId, variant: { language: row.language, version: { exerciseId: row.exerciseId } }, mode: "submit", status: { in: ["PASSED", "FAILED"] } }, orderBy: { finishedAt: "asc" }, select: { status: true, finishedAt: true } });
      assert.equal(row.attempts, attempts.length);
      assert.equal(row.firstPassedAt?.toISOString(), attempts.find(attempt => attempt.status === "PASSED")?.finishedAt?.toISOString());
      assert.equal(row.lastAttemptAt.toISOString(), attempts.at(-1)?.finishedAt?.toISOString());
    }
    const submissions = await db.submission.findMany({ where: { userId: { in: ids } }, select: { results: true } });
    for (const submission of submissions) for (const result of submission.results as { visible: boolean; input?: unknown; expected?: unknown; actual?: unknown }[]) if (!result.visible) {
      assert.equal(result.input, undefined); assert.equal(result.expected, undefined); assert.equal(result.actual, undefined);
    }
  } finally { await db.$disconnect(); }
});
