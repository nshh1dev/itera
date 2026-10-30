"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { saveLearningPreferences, startDiagnostic } from "@/server/learning-actions";
import { declaredLevelNames, levelDescriptions } from "@/lib/learning-profile";
import { languages, languageNames, levels, type Language, type Level } from "@/lib/types";
import { Button } from "./ui/button";
import { learningPaths } from "@/lib/learning-paths";

export type LearningProfiles = { language: string; declaredLevel: Level }[];

export function LearningPreferences({ language: initialLanguage, profiles, onboardingReturnTo }: { language: Language; profiles: LearningProfiles; onboardingReturnTo?: string }) {
  const router = useRouter();
  const [language, setLanguage] = useState(initialLanguage);
  const [choices, setChoices] = useState<Partial<Record<Language, Level>>>(() => Object.fromEntries(profiles.map(profile => [profile.language, profile.declaredLevel])));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);
  const level = choices[language];
  const onboarding = onboardingReturnTo !== undefined;
  const path = learningPaths.find(path => path.level === level);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage(""); setError("");
    try {
      const diagnostic = (event.nativeEvent as SubmitEvent).submitter?.getAttribute("value") === "diagnostic";
      const result = await saveLearningPreferences({ language, level, finishOnboarding: onboarding && !diagnostic });
      if (result.error) { setError(result.error); return; }
      setDirty(false); setMessage("Tus preferencias están guardadas. Tu progreso no ha cambiado.");
      if (onboarding) {
        router.push(diagnostic ? `/bienvenida?paso=3&volver=${encodeURIComponent(onboardingReturnTo)}`
          : onboardingReturnTo.startsWith("/ejercicios/") ? onboardingReturnTo : `/rutas/${result.pathSlug}?lenguaje=${language}`);
      }
      router.refresh();
    } catch { setError("No se pudieron guardar las preferencias. Vuelve a intentarlo."); }
    finally { setBusy(false); }
  }
  return <form onSubmit={submit} className="space-y-6" onChange={() => { setDirty(true); setMessage(""); }}>
    <fieldset disabled={busy} className="space-y-6">
      <div><label htmlFor="learning-language" className="field-label">Lenguaje preferido</label><select id="learning-language" className="field" value={language} onChange={event => setLanguage(event.target.value as Language)}>{languages.map(value => <option key={value} value={value}>{languageNames[value]}</option>)}</select></div>
      <fieldset><legend className="mb-3 text-sm font-medium">¿Qué nivel consideras tener en {languageNames[language]}?</legend><div className="learning-levels">{levels.map(value => <label key={value} className="learning-level"><input type="radio" name="level" value={value} checked={level === value} required onChange={() => setChoices(current => ({ ...current, [language]: value }))} /><span><span className="block text-sm font-medium">{declaredLevelNames[value]}</span><span className="mt-1 block text-sm leading-6 text-muted-foreground">{levelDescriptions[value]}</span></span></label>)}</div></fieldset>
    </fieldset>
    <p className="text-sm leading-6 text-muted-foreground">Puedes cambiarlo después. Cada lenguaje conserva su nivel y su progreso independiente; ninguna ruta está bloqueada.</p>
    {onboarding && path && <p className="text-sm leading-6">Punto de partida según tu elección: <strong>{path.title}</strong>. Un diagnóstico previo aplicable puede ajustar la recomendación; siempre puedes explorar otra ruta.</p>}
    <div className="flex flex-wrap items-center gap-3"><Button loading={busy}>{onboarding ? onboardingReturnTo.startsWith("/ejercicios/") ? "Guardar y volver a mi ejercicio" : "Guardar y empezar mi ruta" : "Guardar preferencias"}{onboarding && <ArrowRight aria-hidden="true" />}</Button>{onboarding && <Button type="submit" name="intent" value="diagnostic" variant="ghost" disabled={busy}>Prefiero un diagnóstico opcional</Button>}{dirty && !message && <span className="text-xs text-muted-foreground">Cambios sin guardar</span>}</div>
    {message && <p role="status" className="text-sm text-muted-foreground">{message}</p>}{error && <p role="alert" className="text-sm text-destructive">{error}</p>}
  </form>;
}

export function DiagnosticStart({ language, onboarding = false, returnTo = "/inicio" }: { language: Language; onboarding?: boolean; returnTo?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function start() {
    setBusy(true); setError("");
    try {
      const result = await startDiagnostic(language);
      if (result.error) { setError(result.error); return; }
      router.push(`/diagnostico/${result.id}${onboarding ? `?bienvenida=1&volver=${encodeURIComponent(returnTo)}` : ""}`);
    } catch { setError("No se pudo preparar el diagnóstico. Puedes continuar y volver a intentarlo después."); }
    finally { setBusy(false); }
  }
  return <div><Button type="button" variant={onboarding ? "default" : "outline"} loading={busy} onClick={start}>{onboarding ? "Probar el diagnóstico" : "Repetir diagnóstico"}<ArrowRight aria-hidden="true" /></Button>{error && <p role="alert" className="mt-3 text-sm leading-6 text-destructive">{error}</p>}</div>;
}
