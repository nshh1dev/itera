import { redirect } from "next/navigation";
import { requireUser } from "@/server/auth";
import { db } from "@/server/db";
import { getLearningSummary } from "@/server/learning";
import { safeReturnTo } from "@/lib/utils";
import type { Language } from "@/lib/types";
import { Onboarding } from "@/components/onboarding";

export const metadata = { title: "Tu punto de partida" };
export default async function WelcomePage({ searchParams }: { searchParams: Promise<{ paso?: string; volver?: string }> }) {
  const [user, query] = await Promise.all([requireUser(), searchParams]);
  if (!user.onboardingStep) redirect("/configuracion?seccion=aprendizaje");
  const language = (user.preference?.language ?? "python") as Language;
  const [summary, profiles] = await Promise.all([getLearningSummary(user.id, language), db.learningProfile.findMany({ where: { userId: user.id }, select: { language: true, declaredLevel: true } })]);
  const requested = Number(query.paso ?? 2);
  const step = requested === 3 && summary.declaredLevel ? 3 : 2;
  return <Onboarding step={step} profiles={profiles} summary={summary} returnTo={safeReturnTo(query.volver)} />;
}
