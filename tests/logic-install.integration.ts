// Comprobación local explícita: prepara el catálogo pedido sin arrancar Next ni Piston.
// No borra registros ni publica contenido. Requiere las migraciones aplicadas.
import "dotenv/config";
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { prepareLogicCatalog, logicSnapshot, activateLogicCatalog } from "../prisma/logic-install";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
async function protectedState() {
  const data = await Promise.all([
    db.user.findMany({ orderBy: { id: "asc" } }),
    db.userPreference.findMany({ orderBy: { userId: "asc" } }),
    db.draft.findMany({ orderBy: { id: "asc" } }),
    db.submission.findMany({ orderBy: { id: "asc" } }),
    db.progress.findMany({ orderBy: { id: "asc" } }),
    db.learningPathItem.findMany({ orderBy: [{ pathId: "asc" }, { position: "asc" }] }),
    db.exercise.findMany({ where: { published: true }, orderBy: { id: "asc" } }),
  ]);
  return createHash("sha256").update(JSON.stringify(data)).digest("hex");
}
test("preparar 136 borradores es idempotente y conserva íntegro el estado activo y de estudiantes", async () => {
  try {
    const before = await protectedState();
    await prepareLogicCatalog(db);
    assert.equal(await protectedState(), before, "La preparación no debe modificar datos de estudiantes ni el catálogo activo.");
    assert.equal((await logicSnapshot(db)).length, 136);
    assert.equal(await prepareLogicCatalog(db), 0);
    assert.equal(await protectedState(), before);
    const stale = await logicSnapshot(db);
    for (const exercise of stale) exercise.versions[0].id = "revision-que-no-fue-validada";
    await assert.rejects(() => activateLogicCatalog(db, stale), /cambió durante la validación/);
    assert.equal(await protectedState(), before, "Una instantánea obsoleta no debe activar ningún cambio parcial.");
  } finally { await db.$disconnect(); }
});
