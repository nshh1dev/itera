"use client";

import { useState } from "react";
import { uniqueDraftCopies, type DraftCopy } from "@/lib/draft-recovery";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const names = { local: "Copia de este navegador", remote: "Copia de la cuenta", guest: "Código de invitado" };

export function DraftRecovery({ pending, copies, current, onChoose }: { pending: boolean; copies: DraftCopy[]; current: DraftCopy; onChoose: (copy: DraftCopy) => void }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  if (!copies.length) return null;
  const options = uniqueDraftCopies([...copies, current]);
  function download() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(options, null, 2)], { type: "application/json" }));
    const link = document.createElement("a"); link.href = url; link.download = "itera-copias-de-codigo.json"; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <div className="shrink-0 bg-surface px-4 py-3 text-sm leading-6">
    <p role="status">{pending ? "Hay copias distintas de tu código. Elige una antes de editar o sincronizar." : "Otras copias de tu código disponibles para recuperar."}</p>
    <Dialog open={open} onOpenChange={value => { setOpen(value); setMessage(""); }}>
      <DialogTrigger asChild><Button variant="outline" size="sm" className="mt-2">Comparar borradores</Button></DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogTitle className="pr-7 text-lg font-semibold">Elige qué código continuar</DialogTitle>
        <DialogDescription className="mt-3 text-sm leading-6 text-muted-foreground">Compara el contenido, no solo la revisión. Usar una copia permite sincronizarla con tu cuenta; las alternativas se conservan en este navegador. Si el almacenamiento falla, descarga todas las copias antes de salir.</DialogDescription>
        <div className="mt-5 space-y-6">{options.map((copy, index) => {
          const label = `${names[copy.source]} · ${index + 1}`;
          return <section key={index} aria-label={label}>
            <h3 className="text-sm font-medium">{label}<span className="ml-2 font-normal text-muted-foreground">Revisión {copy.revision}</span></h3>
            <textarea aria-label={`Código: ${label}`} readOnly value={copy.code} spellCheck={false} className="mt-2 h-40 w-full resize-y rounded-lg bg-surface-inset p-3 font-mono text-sm leading-6" />
            <div className="mt-2 flex flex-wrap gap-2"><Button variant="outline" size="sm" aria-label={`Copiar código: ${label}`} onClick={async () => {
              try { await navigator.clipboard.writeText(copy.code); setMessage(`${label}: código copiado.`); }
              catch { setMessage("No se pudo copiar. Selecciona el texto del código o descarga todas las copias."); }
            }}>Copiar código</Button><Button size="sm" aria-label={`Usar esta copia: ${label}`} onClick={() => { onChoose(copy); setOpen(false); }}>Usar esta copia</Button></div>
          </section>;
        })}</div>
        <p role="status" className="mt-3 text-sm">{message}</p>
        <Button variant="outline" className="mt-3" onClick={download}>Descargar todas las copias</Button>
      </DialogContent>
    </Dialog>
  </div>;
}
