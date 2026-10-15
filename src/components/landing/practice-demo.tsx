"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, Check, Code2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

// Solo se calculan entradas numéricas con esta función fija; nunca se evalúa código del visitante.
function solve(data: { a: number; b: number }) {
  return data.a + data.b;
}

export function PracticeDemo() {
  const [a, setA] = useState("3");
  const [b, setB] = useState("5");
  const [result, setResult] = useState<number | null>(() => solve({ a: 3, b: 5 }));
  const [error, setError] = useState("");

  function calculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const first = Number(a);
    const second = Number(b);
    if (!a.trim() || !b.trim() || ![first, second].every(value => Number.isInteger(value) && Math.abs(value) <= 1_000_000)) {
      setResult(null);
      setError("Introduce dos enteros entre −1.000.000 y 1.000.000.");
      return;
    }
    setError("");
    setResult(solve({ a: first, b: second }));
  }

  return <div className="landing-demo" aria-label="Demostración de Dos números, una suma">
    <div className="landing-demo-toolbar"><span className="flex items-center gap-2"><Code2 className="size-4" aria-hidden="true" /> Espacio de práctica</span><span className="text-muted-foreground">JavaScript</span></div>
    <div className="landing-demo-problem">
      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground"><span>Fundamentos</span><span>Principiante</span></div>
      <h2>Dos números, una suma.</h2>
      <p>Recibe dos números, <code>a</code> y <code>b</code>.<br className="sm:hidden" /> Devuelve su suma.</p>
    </div>
    <div className="landing-demo-editor">
      <div className="landing-file-label"><span>solucion.js</span><span>Solo lectura</span></div>
      <pre className="landing-code" aria-label="Solución en JavaScript"><code>
        <span className="landing-code-line"><span className="landing-line-number" aria-hidden="true">1</span><span><span className="text-primary-text">function</span> solve(data) &#123;</span>{"\n"}</span>
        <span className="landing-code-line"><span className="landing-line-number" aria-hidden="true">2</span><span className="text-muted-foreground">{"  // Una idea: sumar ambos valores."}</span>{"\n"}</span>
        <span className="landing-code-line landing-code-active"><span className="landing-line-number" aria-hidden="true">3</span><span>{"  "}<span className="text-primary-text">return</span> data.a + data.b;</span>{"\n"}</span>
        <span className="landing-code-line"><span className="landing-line-number" aria-hidden="true">4</span><span>&#125;</span></span>
      </code></pre>
    </div>
    <form onSubmit={calculate} className="landing-demo-console" noValidate>
      <fieldset>
        <legend>Cambia los números. Prueba tu idea.</legend>
        <div className="landing-demo-inputs">
          <label htmlFor="demo-a"><span>a</span><input id="demo-a" name="a" type="number" step="1" min="-1000000" max="1000000" required value={a} aria-describedby="demo-help demo-error" aria-invalid={!!error} onChange={event => { setA(event.target.value); setResult(null); setError(""); }} /></label>
          <span className="text-muted-foreground" aria-hidden="true">+</span>
          <label htmlFor="demo-b"><span>b</span><input id="demo-b" name="b" type="number" step="1" min="-1000000" max="1000000" required value={b} aria-describedby="demo-help demo-error" aria-invalid={!!error} onChange={event => { setB(event.target.value); setResult(null); setError(""); }} /></label>
          <Button variant="outline" type="submit"><Play aria-hidden="true" data-icon="inline-start" />Probar entrada</Button>
        </div>
      </fieldset>
      <div id="demo-error" role="alert" className="text-xs text-destructive">{error}</div>
      <div className="landing-demo-result" role="status" aria-live="polite" aria-atomic="true">
        <div className="flex items-center gap-3"><ArrowRight className="size-4 text-muted-foreground" aria-hidden="true" /><span>Resultado</span><output htmlFor="demo-a demo-b">{result ?? "—"}</output></div>
        <span className={result === null ? "text-muted-foreground" : "text-success-text"}>{result === null ? "Entrada modificada" : <><Check className="size-3.5" aria-hidden="true" /> Suma calculada</>}</span>
      </div>
      <p id="demo-help" className="landing-demo-help">Esta demo calcula la suma en tu navegador. En el editor completo puedes escribir y evaluar tu propio código.</p>
    </form>
  </div>;
}
