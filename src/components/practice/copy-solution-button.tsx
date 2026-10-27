"use client";
import { useState } from "react";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CopySolutionButton({ code, filename }: { code: string; filename?: string }) {
  const [state, setState] = useState<"idle" | "copying" | "copied" | "error">("idle");

  async function copy() {
    setState("copying");
    try {
      await navigator.clipboard.writeText(code);
      setState("copied");
    } catch {
      setState("error");
    }
  }

  return <div className="mt-3">
    <Button variant="outline" size="sm" disabled={state === "copying"} aria-label={filename ? `Copiar solución de ${filename}` : "Copiar solución"} onClick={() => void copy()}><Copy aria-hidden="true" />Copiar solución</Button>
    {state === "copied" && <p role="status" className="mt-2 text-xs text-muted-foreground">{filename ? `${filename}: solución copiada.` : "Solución copiada."}</p>}
    {state === "error" && <p role="alert" className="mt-2 text-xs text-destructive">No se pudo copiar. Selecciona el código y cópialo manualmente.</p>}
  </div>;
}
