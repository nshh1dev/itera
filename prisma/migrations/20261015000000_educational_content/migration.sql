-- Ampliación aditiva: las versiones históricas no reciben contenido inventado.
ALTER TABLE "ExerciseVersion"
  ADD COLUMN "practiceGoals" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "prerequisiteSlugs" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "activityType" TEXT NOT NULL DEFAULT 'PRACTICE';

ALTER TABLE "TestCase" ADD COLUMN "explanation" TEXT NOT NULL DEFAULT '';
