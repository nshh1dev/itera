-- Vacío mantiene el contrato de todas las versiones publicadas anteriormente.
ALTER TABLE "ExerciseVersion" ADD COLUMN "conceptRule" TEXT NOT NULL DEFAULT '';
