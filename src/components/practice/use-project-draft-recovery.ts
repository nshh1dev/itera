"use client";

import { useEffect, useRef, useState } from "react";
import type { ProjectFile } from "@/lib/project";
import { maximumStoredProjectCopies, parseStoredProjectDraft, prepareProjectDraftRecovery, sameProjectFiles, uniqueProjectCopies, type ProjectDraftCopy, type StoredProjectDraft } from "@/lib/project-draft-recovery";

export function useProjectDraftRecovery(storageKey: string, remote: { files: ProjectFile[]; revision: number }, template: ProjectFile[], signedIn: boolean, transferKey: string, entrypoint?: string) {
  const [initial] = useState(() => {
    let raw: string | null = null;
    let guest: string | null = null;
    let error = "";
    try { raw = localStorage.getItem(storageKey); } catch { error = "No se pudieron leer las copias locales del proyecto."; }
    if (signedIn) { try { guest = sessionStorage.getItem(transferKey); } catch { error = "No se pudo leer la transferencia del proyecto."; } }
    const local = parseStoredProjectDraft(raw, template, entrypoint);
    const prepared = prepareProjectDraftRecovery(remote, local, guest, template, signedIn);
    const invalid = !!raw && !local;
    return { ...prepared, copies: invalid ? uniqueProjectCopies([{ ...remote, source: "remote" }, ...prepared.copies]) : prepared.copies, raw, error, invalid };
  });
  const [files, setFiles] = useState(initial.files);
  const [pending, setPending] = useState(initial.pending || initial.invalid);
  const [copies, setCopies] = useState(initial.copies);
  const [error, setError] = useState(initial.error || (initial.invalid ? "La copia local del proyecto tiene un formato desconocido. No se ha descartado ni aplicado." : ""));
  const filesRef = useRef(files);
  const copiesRef = useRef(copies);
  const latest = useRef({ files, revision: remote.revision });
  const observed = useRef(initial.raw);

  function remember(incoming: ProjectDraftCopy[]) {
    copiesRef.current = uniqueProjectCopies([...incoming, ...copiesRef.current]);
    setCopies(copiesRef.current);
  }

  useEffect(() => {
    function receive(event: StorageEvent) {
      if (event.storageArea !== localStorage || (event.key !== storageKey && event.key !== null)) return;
      const incoming = parseStoredProjectDraft(event.newValue, template, entrypoint);
      if (!incoming) return;
      const own: ProjectDraftCopy = { ...latest.current, source: "local" };
      const alternatives = uniqueProjectCopies([own, { ...incoming, source: "local" }, ...(incoming.copies ?? []), ...copiesRef.current]);
      copiesRef.current = alternatives;
      setCopies(alternatives);
      // Conservar nuestra edición en el almacenamiento compartido, sin cambiar
      // el contenido ni la revisión activos de ninguna de las dos pestañas.
      try {
        const raw = localStorage.getItem(storageKey);
        const stored = parseStoredProjectDraft(raw, template, entrypoint);
        if (!stored) return;
        const merged = uniqueProjectCopies([...alternatives, ...(stored.copies ?? [])]);
        if (merged.length > maximumStoredProjectCopies) { setError("Hay demasiadas copias para guardarlas juntas. Descárgalas antes de cerrar."); return; }
        if (!(stored.copies ?? []).some(copy => sameProjectFiles(copy.files, own.files))) localStorage.setItem(storageKey, JSON.stringify({ ...stored, copies: merged }));
      } catch { setError("No se pudieron conservar todas las copias entre pestañas. Descárgalas antes de cerrar."); }
    }
    window.addEventListener("storage", receive);
    return () => window.removeEventListener("storage", receive);
  }, [storageKey, template, entrypoint]);

  function persist(nextFiles: ProjectFile[], revision: number, baseFiles: ProjectFile[]) {
    filesRef.current = nextFiles;
    latest.current = { files: nextFiles, revision };
    try {
      const raw = localStorage.getItem(storageKey);
      const incoming = parseStoredProjectDraft(raw, template, entrypoint);
      if (raw && !incoming) {
        // Una elección explícita puede continuar la copia remota, pero nunca
        // destruye bytes de un formato desconocido o dañado.
        localStorage.setItem(`${storageKey}:unrecognized:${crypto.randomUUID()}`, raw);
      } else if (incoming && raw !== observed.current) {
        remember([{ ...incoming, source: "local" }, ...(incoming.copies ?? [])]);
      }
      if (copiesRef.current.length > maximumStoredProjectCopies) throw new Error("Demasiadas alternativas para guardar: descarga las copias.");
      const stored: StoredProjectDraft = { version: 2, files: nextFiles, revision, baseFiles, copies: copiesRef.current };
      const serialized = JSON.stringify(stored);
      localStorage.setItem(storageKey, serialized);
      observed.current = serialized;
      if (signedIn) {
        try {
          const transferred = sessionStorage.getItem(transferKey);
          if (transferred) localStorage.setItem(`${storageKey}:transfer:${crypto.randomUUID()}`, transferred);
          sessionStorage.removeItem(transferKey);
        } catch { setError("Tu proyecto está guardado; la transferencia original se conserva para recuperarla."); return true; }
      }
      setError("");
      return true;
    } catch { setError("No se pudo guardar la copia local del proyecto. Descárgala antes de salir."); return false; }
  }

  function resolve(copy: ProjectDraftCopy, current: ProjectFile[], revision: number, baseFiles: ProjectFile[]) {
    remember([copy, { files: current, revision, source: "local" }, { files: baseFiles, revision, source: "remote" }]);
    filesRef.current = copy.files;
    setFiles(copy.files);
    persist(copy.files, revision, baseFiles);
    setPending(false);
  }

  function offerCopies(alternatives: ProjectDraftCopy[]) {
    remember(alternatives);
    setPending(true);
  }

  return { initialFiles: files, files, pending, copies, error, unknownRaw: initial.invalid ? initial.raw : null, setFiles, persist, resolve, offerCopies, preserveGuest: (nextFiles: ProjectFile[]) => {
    try { sessionStorage.setItem(transferKey, JSON.stringify({ version: 2, files: nextFiles })); } catch { setError("No se pudo transferir el proyecto al registro. Conserva abierta esta pestaña."); }
  } };
}
