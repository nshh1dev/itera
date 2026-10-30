"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { finishOnboarding } from "@/server/learning-actions";
import { OnboardingProgress } from "./onboarding-progress";
import { DiagnosticStart, LearningPreferences, type LearningProfiles } from "./learning-preferences";
import { StartingPoint, type LearningSummary } from "./starting-point";
import { Button } from "./ui/button";

export function Onboarding({ step, profiles, summary, returnTo }: { step: number; profiles: LearningProfiles; summary: LearningSummary; returnTo: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const href = (next: number) => `/bienvenida?paso=${next}&volver=${encodeURIComponent(returnTo)}`;
  async function finish(destination: string) {
    setBusy(true); setError("");
    try { await finishOnboarding(); router.push(destination); router.refresh(); }
    catch { setError("No se pudo guardar el punto de partida. Vuelve a intentarlo."); }
    finally { setBusy(false); }
  }
  return <div className="w-full min-w-0 max-w-xl"><OnboardingProgress step={step === 3 ? 3 : 2} />
    <h1 className="page-title">{step === 3 ? "Encuentra un punto de partida" : "Aprende a tu manera"}</h1>
    <div className="mt-6">
      {step === 3 ? <div className="space-y-6"><p className="text-sm leading-7 text-muted-foreground">Prueba dos retos breves en tu lenguaje y un tercero opcional. Es una orientación para elegir dónde practicar, no una certificación de nivel. Sin límite de tiempo y sin afectar a tus ejercicios completados.</p><DiagnosticStart language={summary.language} onboarding returnTo={returnTo} /><Button variant="ghost" loading={busy} onClick={() => finish(returnTo.startsWith("/ejercicios/") ? returnTo : `/rutas/${summary.path.slug}?lenguaje=${summary.language}`)}>Continuar sin diagnóstico<ArrowRight aria-hidden="true" /></Button><p className="text-sm leading-6 text-muted-foreground">Puedes retomarlo desde Configuración → Aprendizaje.</p></div>
      : <div className="space-y-7">{summary.diagnosticDate && <StartingPoint summary={summary} />}<LearningPreferences language={summary.language} profiles={profiles} onboardingReturnTo={returnTo} /></div>}
    </div>
    {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
    <div className="mt-8 flex flex-wrap items-center gap-5">{step === 3 && <Link href={href(2)} className="text-link text-sm"><ArrowLeft aria-hidden="true" />Cambiar mi punto de partida</Link>}<Link href={returnTo.startsWith("/ejercicios/") ? returnTo : "/inicio"} className="text-sm text-muted-foreground hover:text-foreground">Continuar más tarde</Link></div>
  </div>;
}
