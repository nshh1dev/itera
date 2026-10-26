"use client";

import { useRef, useState } from "react";
import type { ProjectFile } from "@/lib/project";
import { parseStoredProjectDraft, prepareProjectDraftRecovery, type ProjectDraftCopy, type StoredProjectDraft } from "@/lib/project-draft-recovery";

export function useProjectDraftRecovery(storageKey: string, remote: { files: ProjectFile[]; revision: number }, template: ProjectFile[], signedIn: boolean, transferKey: string, entrypoint?: string) {
  const [initial] = useState(() => {
    let raw: string | null = null;
    let guest: string | null = null;
    let error = "";
    try { raw = localStorage.getItem(storageKey); } catch { error = "No se pudieron leer las copias locales del proyecto."; }
    if (signedIn) { try { guest = sessionStorage.getItem(transferKey); } catch { error = "No se pudo leer la transferencia del proyecto."; } }
    const local = parseStoredProjectDraft(raw, template, entrypoint);
    return { ...prepareProjectDraftRecovery(remote, local, guest, template, signedIn), raw, error, invalid: !!raw && !local };
  });
  const [files, setFiles] = useState(initial.files);
  const [pending, setPending] = useState(initial.pending || initial.invalid);
  const [copies, setCopies] = useState(initial.copies);
  const [error, setError] = useState(initial.error || (initial.invalid ? "La copia local del proyecto tiene un formato desconocido. No se ha descartado ni aplicado." : ""));
  const filesRef = useRef(files);
  const copiesRef = useRef(copies);

  function persist(nextFiles: ProjectFile[], revision: number, baseFiles: ProjectFile[]) {
    filesRef.current = nextFiles;
    const stored: StoredProjectDraft = { version: 2, files: nextFiles, revision, baseFiles, copies: copiesRef.current };
    try {
      localStorage.setItem(storageKey, JSON.stringify(stored));
      if (signedIn) { try { sessionStorage.removeItem(transferKey); } catch { /* la copia local ya está guardada */ } }
      setError("");
      return true;
    } catch { setError("No se pudo guardar la copia local del proyecto. Descárgala antes de salir."); return false; }
  }

  function resolve(copy: ProjectDraftCopy, current: ProjectFile[], revision: number, baseFiles: ProjectFile[]) {
    const alternatives = [copy, { files: current, revision, source: "local" as const }, { files: baseFiles, revision, source: "remote" as const }];
    const seen = new Set<string>();
    copiesRef.current = alternatives.filter(item => {
      const key = JSON.stringify(item.files.map(file => [file.path, file.content]));
      if (seen.has(key)) return false;
      seen.add(key); return true;
    }).slice(0, 12);
    setCopies(copiesRef.current);
    filesRef.current = copy.files;
    setFiles(copy.files);
    persist(copy.files, revision, baseFiles);
    setPending(false);
  }

  function offerCopies(alternatives: ProjectDraftCopy[]) {
    copiesRef.current = alternatives;
    setCopies(alternatives);
    setPending(true);
  }

  return { initialFiles: files, files, pending, copies, error, setFiles, persist, resolve, offerCopies, preserveGuest: (nextFiles: ProjectFile[]) => {
    try { sessionStorage.setItem(transferKey, JSON.stringify({ version: 2, files: nextFiles })); } catch { setError("No se pudo transferir el proyecto al registro. Conserva abierta esta pestaña."); }
  } };
}
