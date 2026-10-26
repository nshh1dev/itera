"use client";

import { uniqueProjectCopies, type ProjectDraftCopy } from "@/lib/project-draft-recovery";
import type { ProjectFile } from "@/lib/project";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function ProjectDraftRecovery({ pending, copies, current, unknownRaw, onChoose }: { pending: boolean; copies: ProjectDraftCopy[]; current: ProjectDraftCopy; unknownRaw?: string | null; onChoose: (copy: ProjectDraftCopy) => void }) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<number | null>(null);
  if (!pending && !copies.length) return null;
  const options = uniqueProjectCopies([...copies, current]);
  function download() {
    const url = URL.createObjectURL(new Blob([JSON.stringify({ version: 2, copies: options, ...(unknownRaw ? { unrecognized: unknownRaw } : {}) }, null, 2)], { type: "application/json" }));
    const link = document.createElement("a"); link.href = url; link.download = "itera-copias-del-proyecto.json"; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <section aria-labelledby="project-recovery-title" className="border-b bg-surface px-4 py-3">
    {!pending && <Button variant="ghost" size="sm" onClick={() => setOpen(value => !value)}>{open ? "Ocultar copias guardadas" : `Copias conservadas (${copies.length})`}</Button>}
    {(pending || open) && <>
    <h2 id="project-recovery-title" className="text-sm font-semibold">Elige qué copia del proyecto continuar</h2>
    <p className="mt-1 text-xs leading-5 text-muted-foreground">{pending ? "Hay cambios locales, de otra pestaña o guardados en la cuenta. Elegir una copia no elimina las alternativas." : "Estas copias permanecen disponibles; restaurar una conserva también las demás."}</p>
    <div className="mt-3 flex flex-wrap gap-2">
      {options.map((copy, index) => <Button key={`${copy.source}-${index}`} variant="outline" size="sm" aria-expanded={preview === index} onClick={() => setPreview(preview === index ? null : index)}>
        {copy.source === "remote" ? "Copia de la cuenta" : copy.source === "guest" ? "Copia transferida" : copy.source === "previous" ? "Hito anterior" : `Copia local ${index + 1}`} · {copy.files.length} archivos · Ver contenido
      </Button>)}
    </div>
    {preview !== null && options[preview] && <div className="mt-3 flex max-h-64 flex-col gap-3 overflow-auto">
      {options[preview].files.map(file => <label key={file.path} className="flex flex-col gap-1 text-xs">{file.path}<textarea aria-label={`Copia ${preview + 1}: ${file.path}`} readOnly value={file.content} spellCheck={false} className="min-h-24 w-full resize-y rounded-md bg-surface-inset p-2 font-mono text-xs" /></label>)}
      <Button size="sm" onClick={() => { onChoose(options[preview]); setPreview(null); setOpen(false); }}>Usar esta copia</Button>
    </div>}
    <Button variant="outline" size="sm" className="mt-3" onClick={download}>Descargar todas las copias</Button>
    {!copies.length && <p role="alert" className="mt-2 text-xs text-destructive">El formato local es desconocido; se conserva sin aplicar. Copia manualmente los datos antes de borrar el almacenamiento del navegador.</p>}
    </>}
  </section>;
}

export function cloneProjectFiles(files: readonly ProjectFile[]) { return files.map(file => ({ ...file })); }
