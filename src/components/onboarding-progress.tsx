export function OnboardingProgress({ step }: { step: number }) {
  return <nav aria-label="Pasos de bienvenida" className="mb-8"><ol className="onboarding-progress">{["Crear cuenta", "Tu nivel", "Diagnóstico", "Tu ruta"].map((label, index) => <li key={label} aria-current={step === index + 1 ? "step" : undefined} data-reached={index + 1 <= step}><span className="font-mono tabular-nums">{index + 1}</span><span>{label}</span></li>)}</ol><p className="mt-3 text-xs text-muted-foreground">Paso {step} de 4{step === 3 ? " · Opcional" : ""}</p></nav>;
}
