-- CreateEnum
CREATE TYPE "RuntimeMode" AS ENUM ('FUNCTION', 'PROGRAM');

-- AlterTable
ALTER TABLE "ExerciseVersion" ADD COLUMN     "runtimeMode" "RuntimeMode" NOT NULL DEFAULT 'FUNCTION';
