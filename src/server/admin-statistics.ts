import "server-only";
import { db } from "./db";

export async function getAdminStatistics() {
  const since = new Date(Date.now() - 7 * 86400_000);
  const [users, enabled, exercises, published, submissions, completed, failed, examples, drafts, completions, recentlyActive, recent] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { disabledAt: null } }),
    db.exercise.count(),
    db.exercise.count({ where: { published: true, versions: { some: { published: true } } } }),
    db.submission.count(),
    db.submission.count({ where: { mode: "submit", status: "PASSED" } }),
    db.submission.count({ where: { mode: "submit", status: "FAILED" } }),
    db.submission.count({ where: { mode: "examples" } }),
    db.draft.count(),
    db.progress.count({ where: { firstPassedAt: { not: null } } }),
    db.user.count({ where: { OR: [{ submissions: { some: { createdAt: { gte: since } } } }, { drafts: { some: { updatedAt: { gte: since } } } }, { practiceContexts: { some: { visitedAt: { gte: since } } } }] } }),
    db.submission.findMany({ orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: 10, select: { id: true, createdAt: true, mode: true, status: true, user: { select: { id: true, name: true } }, variant: { select: { language: true, version: { select: { title: true } } } } } }),
  ]);
  return { users, enabled, disabled: users - enabled, exercises, published, submissions, completed, failed, examples, drafts, completions, recentlyActive, recent };
}
