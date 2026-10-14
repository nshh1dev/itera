export function LearningGuide({ objective, prerequisites }: { objective: string; prerequisites: string[] }) {
  const documented = objective.trim().length > 0;
  return <section className="mt-7 rounded-xl border bg-surface/40 p-4" aria-label="Guía de aprendizaje">
    <h2 className="text-sm font-semibold">Qué vas a practicar</h2>
    <p className="mt-2 text-sm leading-7 text-muted-foreground">{documented ? objective : "Esta versión todavía no tiene un objetivo editorial descrito. Puedes consultar el enunciado y las pistas."}</p>
    <h3 className="mt-4 text-xs font-medium">Conocimientos previos recomendados</h3>
    {prerequisites.length > 0
      ? <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-6 text-muted-foreground">{prerequisites.map((item, index) => <li key={index}>{item}</li>)}</ul>
      : <p className="mt-2 text-xs leading-6 text-muted-foreground">{documented ? "No necesitas conocimientos de programación previos para esta actividad." : "Esta versión no especifica conocimientos previos."}</p>}
    <p className="mt-3 text-xs leading-6 text-muted-foreground">Son recomendaciones para orientarte, no bloqueos. Puedes abrir y practicar el ejercicio aunque aún estés aprendiendo estos conceptos.</p>
  </section>;
}
