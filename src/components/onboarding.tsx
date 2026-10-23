"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { finishOnboarding, skipOnboardingDiagnostic } from "@/server/learning-actions";
import { OnboardingProgress } from "./onboarding-progress";
import { DiagnosticStart, LearningPreferences, type LearningProfiles } from "./learning-preferences";
import { StartingPoint, type LearningSummary } from "./starting-point";
import { Button } from "./ui/button";

export function Onboarding({ step, name, email, profiles, summary, returnTo }: { step: number; name: string; email: string; profiles: LearningProfiles; summary: LearningSummary; returnTo: string }) {
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
  async function skip() {
    setBusy(true); setError("");
    try { await skipOnboardingDiagnostic(); router.push(href(4)); router.refresh(); }
    catch { setError("No se pudo guardar este paso. Vuelve a intentarlo."); }
    finally { setBusy(false); }
  }
  return <div className="w-full min-w-0 max-w-xl"><OnboardingProgress step={step} />
    <h1 className="page-title">{step === 1 ? "Tu cuenta está creada" : step === 2 ? "Aprende a tu manera" : step === 3 ? "Descubre tu nivel" : "Tu punto de partida"}</h1>
    <div className="mt-6">
      {step === 1 ? <div className="space-y-5"><p className="text-sm leading-6">{name} · <span className="break-all">{email}</span></p><p className="text-sm leading-6 text-muted-foreground">No necesitas crear otra cuenta. Puedes corregir tus datos desde Mi cuenta.</p><Link href="/configuracion?seccion=cuenta" className="text-link">Editar mis datos</Link><div><Button asChild><Link href={href(2)}>Continuar<ArrowRight aria-hidden="true" /></Link></Button></div></div>
      : step === 2 ? <LearningPreferences language={summary.language} profiles={profiles} onContinue={() => router.push(href(3))} />
      : step === 3 ? <div className="space-y-6"><p className="text-sm leading-7 text-muted-foreground">Prueba dos retos breves en tu lenguaje. Si quieres precisar el resultado, tendrás un tercero opcional. Sin límite de tiempo y sin afectar a tus ejercicios completados.</p><DiagnosticStart language={summary.language} onboarding returnTo={returnTo} /><Button variant="ghost" loading={busy} onClick={skip}>Saltar diagnóstico<ArrowRight aria-hidden="true" /></Button><p className="text-sm leading-6 text-muted-foreground">Puedes repetirlo cuando quieras desde Configuración → Aprendizaje.</p></div>
      : <div className="space-y-7"><StartingPoint summary={summary} /><div className="flex flex-wrap gap-3"><Button loading={busy} onClick={() => finish(`/rutas/${summary.path.slug}?lenguaje=${summary.language}`)}>Empezar mi ruta<ArrowRight aria-hidden="true" /></Button><Button variant="outline" disabled={busy} onClick={() => finish(`/ejercicios?lenguaje=${summary.language}`)}>Explorar ejercicios libremente</Button></div>{returnTo.startsWith("/ejercicios/") && <Button variant="ghost" disabled={busy} onClick={() => finish(returnTo)}>Volver a mi ejercicio</Button>}</div>}
    </div>
    {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
    <div className="mt-8 flex flex-wrap items-center gap-5">{step > 1 && <Link href={href(step - 1)} className="text-link text-sm"><ArrowLeft aria-hidden="true" />Atrás</Link>}<Link href="/inicio" className="text-sm text-muted-foreground hover:text-foreground">Continuar más tarde</Link></div>
  </div>;
}
