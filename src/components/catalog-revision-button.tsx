"use client";

import { useState, useTransition } from "react";
import { prepareCatalogRevision } from "@/server/admin-actions";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "./ui/dialog";

export function CatalogRevisionButton({ slug, versionId }: { slug: string; versionId: string }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  function prepare() {
    startTransition(async () => {
      setMessage("");
      try {
        const result = await prepareCatalogRevision({ slug, versionId });
        if ("error" in result) setMessage(result.error ?? "No se pudo preparar la revisión.");
        else {
          setMessage(result.created ? `Versión ${result.number} preparada en borrador. Revísala y valídala en Piston antes de publicar.` : "La última versión ya contiene esta revisión. No se ha creado otro borrador.");
        }
      } catch { setMessage("No se pudo preparar la revisión. Recarga y comprueba tu sesión administrativa."); }
      setOpen(false);
    });
  }

  return <section className="mt-6 rounded-xl border p-5" aria-label="Revisión didáctica del catálogo">
    <h2 className="text-sm font-medium">Una versión pensada para aprender</h2>
    <p className="mt-2 text-xs leading-6 text-muted-foreground">El catálogo incluye plantillas, pistas y explicaciones revisadas. Puedes prepararlas como borrador sin cambiar lo que ven los estudiantes.</p>
    <Dialog open={open} onOpenChange={value => { if (!pending) setOpen(value); }}>
      <DialogTrigger asChild><Button type="button" variant="outline" className="mt-3">Preparar revisión didáctica</Button></DialogTrigger>
      <DialogContent>
        <DialogTitle>¿Preparar la revisión del catálogo?</DialogTitle>
        <DialogDescription className="mt-3 text-sm leading-7">Se creará una versión nueva, nunca se reemplazarán versiones anteriores. Si ya hay un borrador distinto, no se importará nada. Guarda o copia los cambios sin guardar de este formulario antes de continuar. La publicación seguirá requiriendo Piston.</DialogDescription>
        <div className="mt-5 flex justify-end gap-2"><Button type="button" variant="outline" disabled={pending} onClick={() => setOpen(false)}>Cancelar</Button><Button type="button" disabled={pending} onClick={prepare}>{pending ? "Preparando…" : "Crear borrador didáctico"}</Button></div>
      </DialogContent>
    </Dialog>
    {message && <p role="status" className="mt-3 text-sm leading-6">{message}</p>}
  </section>;
}
