import { Disclosure } from "@/components/arc/disclosure";

export function ExerciseNotes({ complexity, commonErrors }: { complexity: string; commonErrors: string[] }) {
  const cost = complexity.trim();
  if (!cost && commonErrors.length === 0) return null;
  return <section className="mt-6" aria-label="Coste y errores comunes">
    {cost && <><h2 className="text-sm font-semibold">Coste</h2><p className="mt-2 text-sm leading-7 text-muted-foreground">{cost}</p></>}
    {commonErrors.length > 0 && <Disclosure className="mt-4" title="Errores comunes" triggerClassName="text-xs">
      <ul className="mt-1 flex list-disc flex-col gap-2 pl-4 text-xs leading-6 text-muted-foreground">{commonErrors.map((error, index) => <li key={index}>{error}</li>)}</ul>
    </Disclosure>}
  </section>;
}
