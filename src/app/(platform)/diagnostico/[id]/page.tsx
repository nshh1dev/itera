import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/server/auth";
import { db } from "@/server/db";
import { expireInterruptedSubmissions } from "@/server/execution/service";
import { getLearningSummary } from "@/server/learning";
import { DiagnosticWorkspace } from "@/components/diagnostic-workspace";
import { StartingPoint } from "@/components/starting-point";
import { Button } from "@/components/ui/button";
import type { ExecutionResult, Json, Language } from "@/lib/types";
import { safeReturnTo } from "@/lib/utils";

export const metadata = { title: "Descubre tu nivel" };
export default async function DiagnosticPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ bienvenida?: string; volver?: string }> }) {
  const [user, { id }, query] = await Promise.all([requireUser(), params, searchParams]);
  await expireInterruptedSubmissions();
  const diagnostic = await db.diagnostic.findFirst({ where: { id, userId: user.id }, include: { items: { orderBy: { position: "asc" }, include: { variant: { include: { version: { select: { title: true, statement: true, runtimeMode: true } }, tests: { where: { visible: true }, orderBy: { order: "asc" }, select: { input: true, expected: true } } } }, submissions: { orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: 1, select: { id: true, status: true, mode: true, passedCount: true, totalCount: true, results: true, message: true } } } } } });
  if (!diagnostic) notFound();
  const backHref = query.bienvenida === "1" && user.onboardingStep ? `/bienvenida?paso=4&volver=${encodeURIComponent(safeReturnTo(query.volver))}` : "/configuracion?seccion=aprendizaje";
  if (diagnostic.finishedAt) {
    const summary = await getLearningSummary(user.id, diagnostic.language as Language);
    return <div className="page-container max-w-3xl"><h1 className="page-title">Tu diagnóstico</h1><p className="mt-4 mb-7 text-sm leading-6 text-muted-foreground">{diagnostic.reason}</p><StartingPoint summary={summary} /><Button asChild className="mt-7"><Link href={backHref}>{query.bienvenida === "1" ? "Ver mi punto de partida" : "Volver a Aprendizaje"}</Link></Button></div>;
  }
  return <div className="page-container"><DiagnosticWorkspace id={id} userId={user.id} language={diagnostic.language as Language} backHref={backHref} onboarding={query.bienvenida === "1"} items={diagnostic.items.map(item => ({ id: item.id, variantId: item.variantId, code: item.code, revision: item.revision, title: item.variant.version.title, statement: item.variant.statement || item.variant.version.statement, runtimeMode: item.variant.version.runtimeMode, examples: item.variant.tests.map(test => ({ input: test.input as Json, expected: test.expected as Json })), result: item.submissions[0] ? { ...item.submissions[0], results: (item.submissions[0].results ?? []) as ExecutionResult["results"] } : null }))} /></div>;
}
