-- Los datos históricos se mantienen sin atribuirles objetivos o conocimientos
-- previos que no formaban parte de la versión con la que se practicó.
ALTER TABLE "ExerciseVersion"
  ADD COLUMN "objective" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "prerequisites" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
