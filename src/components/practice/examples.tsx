import type { Json, RuntimeMode } from "@/lib/types";

export type PublicExample = { input: Json; expected: Json; explanation?: string };

// En modo FUNCTION la entrada y el resultado son JSON. En modo PROGRAM son texto
// que el programa lee de la entrada estándar y escribe por la pantalla.
function Entry({ value, text }: { value: Json; text: boolean }) {
  if (text) {
    const output = String(value ?? "");
    return <pre className="overflow-x-auto whitespace-pre-wrap break-all">{output.length ? output : "(sin entrada)"}</pre>;
  }
  return <pre className="overflow-x-auto whitespace-pre-wrap break-all">{JSON.stringify(value)}</pre>;
}

export function Examples({ examples, runtimeMode = "FUNCTION" }: { examples: PublicExample[]; runtimeMode?: RuntimeMode }) {
  const text = runtimeMode === "PROGRAM";
  return <><h2 className="mt-6 text-sm font-semibold">Así debería funcionar</h2><div className="mt-3 flex flex-col gap-3">{examples.map((example, index) => <div key={index} className="example-panel">
    <p className="example-label">Ejemplo {index + 1}</p>
    <div className="grid grid-cols-[58px_minmax(0,1fr)] gap-x-3 gap-y-2 font-mono text-xs leading-6"><span className="font-sans text-muted-foreground">Entrada</span><Entry value={example.input} text={text} /><span className="font-sans text-muted-foreground">Salida</span><Entry value={example.expected} text={text} /></div>
    {example.explanation && <p className="mt-3 text-xs leading-6 text-muted-foreground">{example.explanation}</p>}
  </div>)}</div></>;
}
