export function ExerciseNotes({ complexity, commonErrors }: { complexity: string; commonErrors: string[] }) {
  const cost = complexity.trim();
  if (!cost && commonErrors.length === 0) return null;
  return <section className="mt-6" aria-label="Coste y errores comunes">
    {cost && <><h2 className="text-sm font-semibold">Coste</h2><p className="mt-2 text-sm leading-7 text-muted-foreground">{cost}</p></>}
    {commonErrors.length > 0 && <div className="mt-4"><h3 className="text-sm font-semibold">Errores comunes</h3>
      <ul className="mt-2 flex list-disc flex-col gap-2 pl-4 text-base leading-7 text-muted-foreground">{commonErrors.map((error, index) => <li key={index}>{error}</li>)}</ul>
    </div>}
  </section>;
}
