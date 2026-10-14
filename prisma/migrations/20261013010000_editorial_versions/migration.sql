ALTER TABLE "ExerciseVersion" ADD COLUMN "published" BOOLEAN NOT NULL DEFAULT false;
-- All versions predating the editorial workflow are the reviewed initial catalog.
UPDATE "ExerciseVersion" SET "published" = true;
