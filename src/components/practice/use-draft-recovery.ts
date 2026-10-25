"use client";

import { useEffect, useRef, useState } from "react";
import { parseStoredDraft, prepareDraftRecovery, uniqueDraftCopies, type DraftCopy, type DraftSnapshot, type StoredDraft } from "@/lib/draft-recovery";

// Compartido solo para las copias del navegador. Las revisiones y acciones de
// práctica y diagnóstico conservan sus contratos y autorización independientes.
export function useDraftRecovery(storageKey: string, remote: DraftSnapshot, signedIn = true, transferKey?: string) {
  const [initial] = useState(() => {
    let raw: string | null = null;
    let transferred: string | null = null;
    let error = "";
    try { raw = localStorage.getItem(storageKey); }
    catch { error = "No se pudieron leer las copias del navegador. Copia tu código antes de salir."; }
    if (transferKey && signedIn) {
      try { transferred = sessionStorage.getItem(transferKey); }
      catch { error = "No se pudo leer la transferencia de invitado. Conserva abierta la pestaña original."; }
    }
    return { ...prepareDraftRecovery(remote, parseStoredDraft(raw), transferred, signedIn), raw, error };
  });
  const [pending, setPending] = useState(initial.pending);
  const [copies, setCopies] = useState(initial.copies);
  const [error, setError] = useState(initial.error);
  const copiesRef = useRef(copies);
  const observed = useRef(initial.raw);
  const latestLocal = useRef<DraftCopy>({ code: initial.code, revision: remote.revision, source: "local" });

  function remember(incoming: DraftCopy[]) {
    const next = uniqueDraftCopies([...copiesRef.current, ...incoming]);
    if (next.length !== copiesRef.current.length) { copiesRef.current = next; setCopies(next); }
  }

  useEffect(() => {
    function receive(event: StorageEvent) {
      if (event.storageArea !== localStorage || (event.key !== storageKey && event.key !== null)) return;
      const incoming = parseStoredDraft(event.newValue);
      if (incoming) {
        remember([latestLocal.current, { code: incoming.code, revision: incoming.revision, source: "local" }, ...(incoming.copies ?? [])]);
        // Otra pestaña puede desplazar una edición aún sin sincronizar. Archivar
        // también la copia de esta pestaña, sin cambiar la copia activa de la otra.
        // Solo escribir si falta contenido: evita ecos de eventos entre pestañas.
        try {
          const current = parseStoredDraft(localStorage.getItem(storageKey));
          if (current) {
            const merged = uniqueDraftCopies([...(current.copies ?? []), ...copiesRef.current]);
            if (merged.length > (current.copies?.length ?? 0)) localStorage.setItem(storageKey, JSON.stringify({ ...current, copies: merged }));
          }
        } catch { setError("No se pudieron conservar todas las copias entre pestañas. Descárgalas antes de cerrar."); }
      }
      // No cambiar el código de una pestaña abierta ni su revisión autorizada.
    }
    window.addEventListener("storage", receive);
    return () => window.removeEventListener("storage", receive);
  }, [storageKey]);

  function persist(code: string, revision: number, baseCode: string) {
    latestLocal.current = { code, revision, source: "local" };
    try {
      const raw = localStorage.getItem(storageKey);
      const incoming = parseStoredDraft(raw);
      if (raw !== observed.current && incoming) remember([{ code: incoming.code, revision: incoming.revision, source: "local" }, ...(incoming.copies ?? [])]);
      const stored: StoredDraft = { code, revision, baseCode, copies: copiesRef.current };
      const serialized = JSON.stringify(stored);
      localStorage.setItem(storageKey, serialized);
      observed.current = serialized;
      setError("");
      if (transferKey && signedIn) { try { sessionStorage.removeItem(transferKey); } catch { /* La copia transferida ya está en el borrador local. */ } }
      return true;
    } catch {
      setError("No se pudo guardar la copia local. Las alternativas siguen abiertas aquí; descárgalas antes de cerrar.");
      return false;
    }
  }

  function resolve(selected: DraftCopy, current: DraftSnapshot, baseCode: string) {
    remember([{ ...current, source: "local" }, { code: baseCode, revision: current.revision, source: "remote" }, selected]);
    persist(selected.code, current.revision, baseCode);
    setPending(false);
  }

  return { initialCode: initial.code, pending, copies, error, persist, resolve };
}
