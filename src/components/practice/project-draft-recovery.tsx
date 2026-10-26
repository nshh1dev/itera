"use client";

import type { ProjectDraftCopy } from "@/lib/project-draft-recovery";
import type { ProjectFile } from "@/lib/project";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function ProjectDraftRecovery({ pending, copies, onChoose }: { pending: boolean; copies: ProjectDraftCopy[]; onChoose: (copy: ProjectDraftCopy) => void }) {
  const [open, setOpen] = useState(false);
  if (!pending && !copies.length) return null;
  return <section aria-labelledby="project-recovery-title" className="border-b bg-surface px-4 py-3">
    {!pending && <Button variant="ghost" size="sm" onClick={() => setOpen(value => !value)}>{open ? "Ocultar copias guardadas" : `Copias conservadas (${copies.length})`}</Button>}
    {(pending || open) && <>
    <h2 id="project-recovery-title" className="text-sm font-semibold">Elige qué copia del proyecto continuar</h2>
    <p className="mt-1 text-xs leading-5 text-muted-foreground">{pending ? "Hay cambios locales, de otra pestaña o guardados en la cuenta. Elegir una copia no elimina las alternativas." : "Estas copias permanecen disponibles; restaurar una conserva también las demás."}</p>
    <div className="mt-3 flex flex-wrap gap-2">
      {copies.map((copy, index) => <Button key={`${copy.source}-${index}`} variant="outline" size="sm" onClick={() => { onChoose(copy); setOpen(false); }}>
        {copy.source === "remote" ? "Copia de la cuenta" : copy.source === "guest" ? "Copia transferida" : copy.source === "previous" ? "Hito anterior" : `Copia local ${index + 1}`} · {copy.files.length} archivos
      </Button>)}
    </div>
    {!copies.length && <p role="alert" className="mt-2 text-xs text-destructive">El formato local es desconocido; se conserva sin aplicar. Copia manualmente los datos antes de borrar el almacenamiento del navegador.</p>}
    </>}
  </section>;
}

export function cloneProjectFiles(files: readonly ProjectFile[]) { return files.map(file => ({ ...file })); }
