-- JSON null es una expectativa válida; SQL NULL significa que el caso no la declara.
ALTER TABLE "TestCase" ADD COLUMN "expectedPersistence" JSONB;
