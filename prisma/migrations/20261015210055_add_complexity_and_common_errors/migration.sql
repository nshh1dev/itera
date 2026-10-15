-- AlterTable
ALTER TABLE "ExerciseVersion" ADD COLUMN     "commonErrors" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "complexity" TEXT NOT NULL DEFAULT '';
