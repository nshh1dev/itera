import { normalizeProjectPath, projectLimits, type ProjectFile } from "./project";

export type ProjectDraftSnapshot = { files: ProjectFile[]; revision: number };
export type ProjectDraftCopy = ProjectDraftSnapshot & { source: "local" | "remote" | "guest" | "previous" };
export type StoredProjectDraft = ProjectDraftSnapshot & { version: 2; baseFiles?: ProjectFile[]; copies?: ProjectDraftCopy[] };
const maximumStoredCopies = 6;

function validFiles(value: unknown): value is ProjectFile[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > projectLimits.files) return false;
  const seen = new Set<string>();
  let total = 0;
  for (const file of value) {
    if (!file || typeof file.path !== "string" || file.path.length > 120 || !normalizeProjectPath(file.path) || typeof file.content !== "string") return false;
    const normalized = normalizeProjectPath(file.path)!;
    if (seen.has(normalized)) return false;
    seen.add(normalized);
    const bytes = new TextEncoder().encode(file.content).byteLength;
    if (bytes > projectLimits.fileBytes || (total += bytes) > projectLimits.totalBytes) return false;
  }
  return true;
}
export function sameProjectFiles(a: readonly ProjectFile[], b: readonly ProjectFile[]) {
  return a.length === b.length && a.every((file, index) => file.path === b[index]?.path && file.content === b[index]?.content && !!file.readOnly === !!b[index]?.readOnly);
}
export function uniqueProjectCopies(copies: ProjectDraftCopy[]) {
  const seen = new Set<string>();
  return copies.filter(copy => {
    const key = JSON.stringify(copy.files.map(file => [file.path, file.content, !!file.readOnly]));
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, maximumStoredCopies);
}

export function parseStoredProjectDraft(raw: string | null, template: readonly ProjectFile[], entrypoint = template.find(file => !file.readOnly)?.path): StoredProjectDraft | null {
  try {
    if (raw && raw.length > 18_000_000) return null;
    const parsed: unknown = JSON.parse(raw ?? "null");
    if (!parsed || typeof parsed !== "object") return null;
    const value = parsed as Record<string, unknown>;
    if (value.version === 2 && Number.isSafeInteger(value.revision) && (value.revision as number) >= 0 && validFiles(value.files) && value.files.length === template.length) {
      const byPath = new Map(value.files.map(file => [file.path, file]));
      if (template.some(file => !byPath.has(file.path))) return null;
      if (template.some(file => file.readOnly && byPath.get(file.path)!.content !== file.content)) return null;
      if (value.baseFiles !== undefined && (!validFiles(value.baseFiles) || !template.every(file => (value.baseFiles as ProjectFile[]).some(candidate => candidate.path === file.path)))) return null;
      if (value.copies !== undefined) {
        if (!Array.isArray(value.copies) || value.copies.length > maximumStoredCopies) return null;
        for (const candidate of value.copies) {
          if (!candidate || typeof candidate !== "object") return null;
          const copy = candidate as ProjectDraftCopy;
          if (!validFiles(copy.files) || !Number.isSafeInteger(copy.revision) || !["local", "remote", "guest", "previous"].includes(copy.source)) return null;
          if (!template.every(file => copy.files.some(item => item.path === file.path && (!file.readOnly || item.content === file.content)))) return null;
        }
      }
      return {
        version: 2,
        revision: value.revision as number,
        files: template.map(file => ({ ...file, content: byPath.get(file.path)!.content })),
        baseFiles: validFiles(value.baseFiles) ? value.baseFiles : undefined,
        copies: Array.isArray(value.copies) ? uniqueProjectCopies((value.copies as ProjectDraftCopy[]).map(copy => ({ ...copy, files: template.map(file => ({ ...file, content: copy.files.find(candidate => candidate.path === file.path)!.content })) }))) : [],
      };
    }
    // Migra las copias antiguas de un solo archivo sin perder su código.
    if (typeof value.code === "string" && value.code.length <= 30000 && Number.isSafeInteger(value.revision)) {
      const entry = template.find(file => file.path === entrypoint && !file.readOnly);
      if (!entry) return null;
      return { version: 2, revision: value.revision as number, files: template.map(file => ({ ...file, content: file.path === entry.path ? value.code as string : file.content })) };
    }
    return null;
  } catch { return null; }
}

export function prepareProjectDraftRecovery(remote: ProjectDraftSnapshot, local: StoredProjectDraft | null, guestRaw: string | null, template: readonly ProjectFile[], signedIn: boolean) {
  let guest: ProjectDraftCopy | null = null;
  try {
    const parsed: unknown = JSON.parse(guestRaw ?? "null");
    if (parsed && typeof parsed === "object" && validFiles((parsed as Record<string, unknown>).files)) {
      const files = (parsed as { files: ProjectFile[] }).files;
      if (template.length === files.length && template.every(file => files.some(candidate => candidate.path === file.path && (!file.readOnly || candidate.content === file.content)))) guest = { files: template.map(file => ({ ...file, content: files.find(candidate => candidate.path === file.path)!.content })), revision: 0, source: "guest" };
    }
  } catch { /* La copia inválida se conserva sin aplicarse. */ }
  if (!signedIn) return { files: local?.files ?? guest?.files ?? [...template], pending: false, copies: local?.copies ?? [] };
  const candidates = uniqueProjectCopies([...(local ? [{ ...local, source: "local" as const }] : []), ...(guest ? [guest] : []), ...(local?.copies ?? [])]);
  const remoteBase = local?.baseFiles && sameProjectFiles(local.baseFiles, remote.files) && local.revision === remote.revision;
  const localDiffers = !!local && !sameProjectFiles(local.files, remote.files);
  const conflict = (localDiffers && !remoteBase) || (!!guest && !!local && !sameProjectFiles(guest.files, local.files) && !sameProjectFiles(guest.files, remote.files)) || (!!guest && remote.revision > 0 && !sameProjectFiles(guest.files, remote.files));
  return { files: conflict ? [...remote.files] : guest?.files ?? (localDiffers ? local!.files : [...remote.files]), pending: conflict, copies: uniqueProjectCopies([...(conflict || guest ? [{ ...remote, source: "remote" as const }, ...candidates] : local?.copies ?? [])]) };
}
