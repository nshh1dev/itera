import { test } from "node:test";
import assert from "node:assert/strict";
import { Prisma, type PrismaClient } from "../src/generated/prisma/client";
import { logicExercises } from "../prisma/logic-content";
import { seedVersionContent, type VersionContent } from "../prisma/editorial-revision";
import { preparePythonCatalog, pythonSnapshot, activatePythonCatalog } from "../prisma/python-install";
import { pythonCatalog } from "../prisma/python-content";
import { knownPythonReleases, pythonReleaseFingerprint } from "../prisma/python-releases";

type Version = VersionContent & { id: string; number: number; published: boolean };
type Exercise = { id: string; slug: string; category: string; order: number; published: boolean; versions: Version[] };
type CreateVersion = Omit<Version, "id" | "variants"> & { variants: { create: (Omit<VersionContent["variants"][number], "tests"> & { tests: { create: VersionContent["variants"][number]["tests"] } })[] } };
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value, (_key, value) => value === Prisma.JsonNull ? null : value));

// Doble transaccional: prueba contratos del importador, no PostgreSQL ni Piston.
function memoryDatabase() {
  let rows: Exercise[] = logicExercises.map((entry, index) => ({
    id: `e${index}`, slug: entry.slug, category: entry.category, order: index, published: true,
    versions: [{ ...clone(seedVersionContent(entry)), id: `v${index}`, number: 1, published: true }],
  }));
  let next = 1000;
  const version = (data: CreateVersion): Version => clone({ ...data, id: `v${next++}`, variants: data.variants.create.map(variant => ({ ...variant, tests: variant.tests.create })) });
  const connection = () => ({
    $executeRaw: async () => 1,
    exercise: {
      findUnique: async ({ where }: { where: { slug: string } }) => clone(rows.find(row => row.slug === where.slug) ?? null),
      findMany: async () => clone(rows),
      create: async ({ data }: { data: Omit<Exercise, "id" | "versions"> & { versions: { create: CreateVersion } } }) => {
        const row = { ...data, id: `e${next++}`, versions: [version(data.versions.create)] };
        rows.push(row);
        return row;
      },
      update: async ({ where, data }: { where: { id: string }; data: Partial<Exercise> }) => Object.assign(rows.find(row => row.id === where.id)!, data),
    },
    exerciseVersion: {
      create: async ({ data }: { data: CreateVersion & { exerciseId: string } }) => {
        const row = rows.find(row => row.id === data.exerciseId)!;
        const item = version(data);
        row.versions.unshift(item);
        return item;
      },
      update: async ({ where, data }: { where: { id: string }; data: Partial<Version> }) => Object.assign(rows.flatMap(row => row.versions).find(version => version.id === where.id)!, data),
    },
  });
  const db = {
    ...connection(),
    $transaction: async <T,>(operation: (tx: ReturnType<typeof connection>) => Promise<T>) => {
      const before = clone(rows);
      try { return await operation(connection()); }
      catch (error) { rows = before; throw error; }
    },
  } as unknown as PrismaClient;
  return { db, rows: () => rows };
}

test("preparar Python es idempotente y activar conserva versiones compartidas, orden y variantes ajenas", async () => {
  const memory = memoryDatabase();
  const before = clone(memory.rows());
  assert.ok(await preparePythonCatalog(memory.db) >= 48);
  assert.equal(await preparePythonCatalog(memory.db), 0);
  const snapshot = await pythonSnapshot(memory.db);
  assert.equal(snapshot.length, 224);
  for (const row of memory.rows().filter(row => row.slug.startsWith("python-"))) assert.equal(row.published, false);
  await activatePythonCatalog(memory.db, snapshot);
  for (const original of before) {
    const current = memory.rows().find(row => row.id === original.id)!;
    assert.equal(current.order, original.order);
    assert.equal(current.category, original.category);
    assert.deepEqual(current.versions.find(version => version.id === original.versions[0].id), original.versions[0]);
    for (const language of ["javascript", "typescript"]) {
      const active = current.versions.find(version => version.published && version.variants.some(variant => variant.language === language))!;
      assert.equal(active.id, original.versions[0].id);
    }
  }
  assert.equal(memory.rows().filter(row => row.published).length, 224);
  assert.equal(await preparePythonCatalog(memory.db), 0);
});

test("una entrega conocida admite revisiones de fuentes sin autorizar cambios locales ni borradores ajenos", async () => {
  assert.ok(knownPythonReleases.includes(pythonReleaseFingerprint(pythonCatalog)));
  const reverseKeys = (value: unknown): unknown => Array.isArray(value) ? value.map(reverseKeys) : value && typeof value === "object"
    ? Object.fromEntries(Object.entries(value).reverse().map(([key, item]) => [key, reverseKeys(item)])) : value;
  // PostgreSQL jsonb no conserva el orden de propiedades de las fuentes JSON.
  assert.equal(pythonReleaseFingerprint(reverseKeys(clone(pythonCatalog)) as typeof pythonCatalog), pythonReleaseFingerprint(pythonCatalog));
  const memory = memoryDatabase();
  await preparePythonCatalog(memory.db);
  await activatePythonCatalog(memory.db, await pythonSnapshot(memory.db));
  const source = pythonCatalog.find(entry => entry.slug === "python-centinela")!;
  const original = source.content;
  try {
    source.content = { ...original, description: "Practicar una salida anticipada con un centinela explícito." };
    assert.equal(await preparePythonCatalog(memory.db), 1);
    assert.equal(await preparePythonCatalog(memory.db), 0);
    const other = memoryDatabase();
    source.content = original;
    await preparePythonCatalog(other.db);
    await activatePythonCatalog(other.db, await pythonSnapshot(other.db));
    other.rows().find(row => row.slug === source.slug)!.versions[0].description = "Edición local publicada distinta";
    source.content = { ...original, description: "Una revisión posterior de las fuentes editoriales." };
    await assert.rejects(preparePythonCatalog(other.db), /difiere del catálogo/);
  } finally { source.content = original; }
});

test("un borrador distinto revierte el lote completo y conserva el trabajo editorial", async () => {
  const memory = memoryDatabase();
  const row = memory.rows().at(-1)!;
  row.versions.unshift({ ...clone(row.versions[0]), id: "ajeno", number: 2, published: false, description: "Trabajo editorial local distinto" });
  const before = clone(memory.rows());
  await assert.rejects(preparePythonCatalog(memory.db), /borrador distinto/);
  assert.deepEqual(memory.rows(), before);
});

test("una edición publicada local no se sobrescribe y una revisión cambiada no se activa", async () => {
  const memory = memoryDatabase();
  memory.rows().at(-1)!.versions[0].description = "Contenido local que debe conservarse";
  const before = clone(memory.rows());
  await assert.rejects(preparePythonCatalog(memory.db), /difiere del catálogo/);
  assert.deepEqual(memory.rows(), before);
  const clean = memoryDatabase();
  await preparePythonCatalog(clean.db);
  const checked = await pythonSnapshot(clean.db);
  clean.rows().find(row => row.slug === pythonCatalog.at(-1)!.slug)!.versions[0].variants[0].explanation = "Revisión concurrente distinta";
  const modified = clone(clean.rows());
  await assert.rejects(activatePythonCatalog(clean.db, checked), /no coincide/);
  assert.deepEqual(clean.rows(), modified);
});
