import type { Json } from "@/lib/types";

export type PublicExample = { input: Json; expected: Json; explanation?: string };

export function Examples({ examples }: { examples: PublicExample[] }) {
  return <><h2 className="mt-6 text-sm font-semibold">Así debería funcionar</h2><div className="mt-3 flex flex-col gap-3">{examples.map((example, index) => <div key={index} className="example-panel">
    <p className="example-label">Ejemplo {index + 1}</p>
    <div className="grid grid-cols-[58px_minmax(0,1fr)] gap-x-3 gap-y-2 font-mono text-xs leading-6"><span className="font-sans text-muted-foreground">Entrada</span><pre className="overflow-x-auto whitespace-pre-wrap break-all">{JSON.stringify(example.input)}</pre><span className="font-sans text-muted-foreground">Salida</span><pre className="overflow-x-auto whitespace-pre-wrap break-all">{JSON.stringify(example.expected)}</pre></div>
    {example.explanation && <p className="mt-3 text-xs leading-6 text-muted-foreground">{example.explanation}</p>}
  </div>)}</div></>;
}
