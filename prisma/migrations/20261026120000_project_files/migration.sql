-- Campos opcionales: las filas históricas permanecen en el camino de un archivo.
ALTER TABLE "ExerciseVariant"
  ADD COLUMN "project" JSONB,
  ADD COLUMN "solutionFiles" JSONB;

ALTER TABLE "Draft"
  ADD COLUMN "files" JSONB;

ALTER TABLE "Submission"
  ADD COLUMN "files" JSONB;

ALTER TABLE "TestCase"
  ADD COLUMN "expectedFiles" JSONB;
