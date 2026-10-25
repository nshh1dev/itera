export type DraftSnapshot = { code: string; revision: number };
export type DraftCopy = DraftSnapshot & { source: "local" | "remote" | "guest" };
export type StoredDraft = DraftSnapshot & { baseCode?: string; copies?: DraftCopy[] };

function snapshot(value: unknown): value is DraftSnapshot {
  if (!value || typeof value !== "object") return false;
  const draft = value as DraftSnapshot;
  return typeof draft.code === "string" && draft.code.length <= 30000 && Number.isSafeInteger(draft.revision) && draft.revision >= 0;
}

export function parseStoredDraft(raw: string | null): StoredDraft | null {
  try {
    const value: unknown = JSON.parse(raw ?? "null");
    if (!snapshot(value)) return null;
    const extra = value as StoredDraft;
    return {
      code: value.code, revision: value.revision,
      baseCode: typeof extra.baseCode === "string" && extra.baseCode.length <= 30000 ? extra.baseCode : undefined,
      copies: Array.isArray(extra.copies) ? extra.copies.filter(copy => snapshot(copy) && ["local", "remote", "guest"].includes(copy.source)) : [],
    };
  } catch { return null; }
}

// El contenido identifica una copia, no su número de revisión: el mismo código
// puede haberse guardado varias veces. Nunca se truncan alternativas recuperables.
export function uniqueDraftCopies(copies: DraftCopy[]): DraftCopy[] {
  const seen = new Set<string>();
  return copies.filter(copy => {
    if (seen.has(copy.code)) return false;
    seen.add(copy.code); return true;
  });
}

export function prepareDraftRecovery(remote: DraftSnapshot, local: StoredDraft | null, guest?: string | null, signedIn = true) {
  const transferred = typeof guest === "string" && guest.length <= 30000 ? { code: guest, revision: 0, source: "guest" as const } : null;
  const candidates = uniqueDraftCopies([
    ...(local ? [{ code: local.code, revision: local.revision, source: "local" as const }] : []),
    ...(transferred ? [transferred] : []),
    ...(local?.copies ?? []),
  ]);
  if (!signedIn) return { code: local?.code ?? remote.code, pending: false, copies: local?.copies ?? [] };
  const different = local && local.code !== remote.code;
  const knownBase = local?.revision === remote.revision && local.baseCode === remote.code;
  const transferCollision = transferred && local && local.code !== transferred.code && local.code !== remote.code;
  const pending = !!((different && !knownBase) || transferCollision || (transferred && remote.revision > 0 && transferred.code !== remote.code));
  const code = pending ? remote.code : transferred?.code ?? (different ? local.code : remote.code);
  return { code, pending, copies: uniqueDraftCopies([
    ...(pending || transferred ? [{ ...remote, source: "remote" as const }, ...candidates] : local?.copies ?? []),
  ]) };
}
