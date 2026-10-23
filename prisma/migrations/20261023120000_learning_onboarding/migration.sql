-- 0 exime a las cuentas existentes. Solo las altas nuevas comienzan en el paso 2.
ALTER TABLE "User" ADD COLUMN "onboardingStep" INTEGER NOT NULL DEFAULT 0;
CREATE TABLE "LearningProfile" (
  "userId" TEXT NOT NULL,
  "language" TEXT NOT NULL,
  "declaredLevel" "Level" NOT NULL,
  CONSTRAINT "LearningProfile_pkey" PRIMARY KEY ("userId", "language"),
  CONSTRAINT "LearningProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "LearningProfile" ("userId", "language", "declaredLevel")
SELECT "userId", "language", "level" FROM "UserPreference";
CREATE TABLE "Diagnostic" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "language" TEXT NOT NULL,
  "declaredLevel" "Level" NOT NULL,
  "rulesVersion" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "finishedAt" TIMESTAMP(3),
  "suggestedLevel" "Level",
  "reason" TEXT,
  CONSTRAINT "Diagnostic_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "Diagnostic_userId_language_createdAt_idx" ON "Diagnostic"("userId", "language", "createdAt");
CREATE TABLE "DiagnosticItem" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "diagnosticId" TEXT NOT NULL,
  "variantId" TEXT NOT NULL,
  "position" INTEGER NOT NULL,
  "code" TEXT NOT NULL,
  "revision" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "DiagnosticItem_diagnosticId_fkey" FOREIGN KEY ("diagnosticId") REFERENCES "Diagnostic"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "DiagnosticItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ExerciseVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "DiagnosticItem_diagnosticId_position_key" ON "DiagnosticItem"("diagnosticId", "position");
ALTER TABLE "Submission" ADD COLUMN "diagnosticItemId" TEXT;
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_diagnosticItemId_fkey" FOREIGN KEY ("diagnosticItemId") REFERENCES "DiagnosticItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX "Submission_diagnosticItemId_createdAt_idx" ON "Submission"("diagnosticItemId", "createdAt");
