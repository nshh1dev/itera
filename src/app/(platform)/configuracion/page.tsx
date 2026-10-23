import { requireUser } from "@/server/auth";
import { SettingsPageContent } from "@/components/settings-page";
import { getLearningSummary } from "@/server/learning";
import { db } from "@/server/db";
import type { Language } from "@/lib/types";
export const metadata = { title: "Configuración" };
export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ seccion?: string }> }) {
  const [user, query] = await Promise.all([requireUser(), searchParams]);
  const [summary, profiles, history] = await Promise.all([
    getLearningSummary(user.id, (user.preference?.language ?? "python") as Language),
    db.learningProfile.findMany({ where: { userId: user.id }, select: { language: true, declaredLevel: true } }),
    db.diagnostic.findMany({ where: { userId: user.id, finishedAt: { not: null } }, orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: 10, select: { id: true, language: true, suggestedLevel: true, reason: true, finishedAt: true } }),
  ]);
  return <div className="page-container"><h1 className="page-title">Configuración</h1><SettingsPageContent section={query.seccion ?? "cuenta"} user={{ id: user.id, name: user.name, email: user.email }} profiles={profiles} summary={summary} history={history.map(entry => ({ ...entry, date: entry.finishedAt!.toISOString() }))} /></div>;
}
