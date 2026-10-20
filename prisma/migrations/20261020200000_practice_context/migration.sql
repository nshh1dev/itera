CREATE TABLE "PracticeContext" (
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "pathSlug" TEXT,
    "visitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PracticeContext_pkey" PRIMARY KEY ("userId", "exerciseId", "language")
);
CREATE INDEX "PracticeContext_userId_visitedAt_idx" ON "PracticeContext"("userId", "visitedAt");
ALTER TABLE "PracticeContext" ADD CONSTRAINT "PracticeContext_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PracticeContext" ADD CONSTRAINT "PracticeContext_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
