export function OnboardingProgress({ step }: { step: number }) {
  return <nav aria-label="Pasos de bienvenida" className="mb-8"><ol className="onboarding-progress">{["Crear cuenta", "Punto de partida"].map((label, index) => <li key={label} aria-current={Math.min(step, 2) === index + 1 ? "step" : undefined} data-reached={index + 1 <= step}><span className="font-mono tabular-nums">{index + 1}</span><span>{label}</span></li>)}</ol><p className="mt-3 text-xs text-muted-foreground">{step === 3 ? "Diagnóstico opcional · Puedes continuar sin hacerlo" : `Paso ${Math.min(step, 2)} de 2`}</p></nav>;
}
