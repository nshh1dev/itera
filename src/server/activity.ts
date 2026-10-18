import "server-only";
import { db } from "./db";
import type { Language } from "@/lib/types";

export function getLastDraft(userId: string, language: Language) {
  return db.draft.findFirst({
    where: { userId, variant: { language, version: { exercise: { published: true } } } },
    orderBy: { updatedAt: "desc" },
    select: { variant: { select: { version: { select: { exercise: { select: { slug: true } } } } } } },
  });
}

export function getRecentSubmissions(userId: string, take: number, exerciseId?: string) {
  return db.submission.findMany({
    where: { userId, ...(exerciseId ? { variant: { version: { exerciseId } } } : {}) },
    orderBy: { createdAt: "desc" }, take,
    select: { id: true, status: true, mode: true, createdAt: true, passedCount: true, totalCount: true,
      variant: { select: { language: true, version: { select: { title: true, exercise: { select: { slug: true } } } } } },
    },
  });
}
