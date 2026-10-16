"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Copy, Minus, MoreHorizontal, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { originFrom, type MotionOrigin } from "@/lib/motion";

export function EditorOptions({ fontSize, onFontSize, code, onReset }: { fontSize: number; onFontSize: (size: number) => void; code: string; onReset: () => void }) {
  const details = useRef<HTMLDetailsElement>(null);
  const trigger = useRef<HTMLElement>(null);
  const [confirming, setConfirming] = useState(false);
  const [copied, setCopied] = useState(false);
  const [resetOrigin, setResetOrigin] = useState<MotionOrigin>();
  useEffect(() => {
    function dismiss(event: PointerEvent) { if (details.current && !details.current.contains(event.target as Node)) details.current.open = false; }
    function escape(event: KeyboardEvent) { if (event.key === "Escape" && details.current?.open) { details.current.open = false; trigger.current?.focus(); event.preventDefault(); } }
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", dismiss); document.removeEventListener("keydown", escape); };
  }, []);
  return <>
    <details ref={details} className="action-menu relative" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) event.currentTarget.open = false; }}>
      <summary ref={trigger} aria-label="Opciones del editor" title="Opciones del editor" className="flex size-11 cursor-pointer list-none items-center justify-center rounded-lg text-muted-foreground hover:bg-surface md:size-8"><MoreHorizontal className="size-4" /></summary>
      <div className="floating-menu absolute top-full right-0 z-40 mt-2 w-64 rounded-xl bg-elevated p-2" role="group" aria-label="Opciones del editor">
        <div className="flex items-center gap-1 rounded-lg bg-surface-inset px-2 py-1"><span className="mr-auto text-xs text-tonal-foreground">Tamaño del código</span><Button variant="ghost" size="icon" aria-label="Reducir tamaño del código" disabled={fontSize <= 12} onClick={() => onFontSize(fontSize - 1)}><Minus /></Button><output className="w-6 text-center font-mono text-xs" aria-label="Tamaño del código">{fontSize}</output><Button variant="ghost" size="icon" aria-label="Aumentar tamaño del código" disabled={fontSize >= 22} onClick={() => onFontSize(fontSize + 1)}><Plus /></Button></div>
        <button className="mt-1 flex min-h-11 w-full items-center gap-2 rounded-lg px-2 text-left text-[13px] hover:bg-surface md:min-h-9" onClick={() => { void navigator.clipboard.writeText(code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }).catch(() => {}); }}><Copy className="size-4 text-muted-foreground" />{copied ? "Copiado" : "Copiar código"}</button>
        <button className="mt-1 flex min-h-11 w-full items-center gap-2 rounded-lg px-2 text-left text-[13px] hover:bg-surface md:min-h-9" onClick={() => { if (trigger.current) setResetOrigin(originFrom(trigger.current)); if (details.current) details.current.open = false; setConfirming(true); }}><RotateCcw className="size-4 text-muted-foreground" />Restablecer plantilla</button>
      </div>
    </details>
    <Dialog open={confirming} onOpenChange={setConfirming}><DialogContent origin={resetOrigin} onCloseAutoFocus={event => { event.preventDefault(); trigger.current?.focus(); }}><DialogTitle className="pr-7 text-lg font-semibold tracking-tight">¿Volver al punto de partida?</DialogTitle><DialogDescription className="mt-3 text-sm leading-6 text-muted-foreground">La plantilla reemplazará tu borrador actual. Tus intentos anteriores siguen guardados en <Link className="text-link" href="/progreso">tu progreso</Link>.</DialogDescription><div className="mt-6 flex flex-wrap justify-end gap-2"><DialogClose asChild><Button variant="outline">Seguir editando</Button></DialogClose><DialogClose asChild><Button onClick={onReset}>Restablecer</Button></DialogClose></div></DialogContent></Dialog>
  </>;
}
