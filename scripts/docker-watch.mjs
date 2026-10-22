import { createHash } from "node:crypto";
import { lstat, readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const directories = ["src", "public", "prisma", "scripts", "tests"];
const rebuild = new Set(["package.json", "package-lock.json", "Dockerfile", ".dockerignore", ".npmrc"]);
const restart = new Set(["next.config.ts", "tsconfig.json", "postcss.config.mjs", "prisma.config.ts"]);

/** @param {string} path */
export function watchAction(path) {
  const relative = path.replaceAll("\\", "/");
  if (relative.split("/").some(p => p === ".." || p === "." || p === "" || p === "node_modules" || p === ".git" || p === ".local" || p === ".next" || p.startsWith(".env"))) return "ignore";
  if (/^(src\/generated|public\/monaco)(\/|$)/.test(relative)) return "ignore";
  if (rebuild.has(relative)) return "rebuild";
  if (restart.has(relative)) return "restart";
  if (!directories.some(p => relative.startsWith(`${p}/`))) return "ignore";
  if (/(~|\.swp|\.tmp|\.log|\.dump|\.tsbuildinfo)$/.test(relative)) return "ignore";
  return relative.startsWith("prisma/") ? "schema" : "sync";
}

/** @param {string} root */
export async function sourceSnapshot(root) {
  const files = new Map();
  /** @param {string} relative */
  async function visit(relative) {
    let entries;
    try {
      if ((await lstat(join(root, relative))).isSymbolicLink()) return;
      entries = await readdir(join(root, relative), { withFileTypes: true });
    }
    catch (error) { if (error.code === "ENOENT") return; throw error; }
    for (const entry of entries) {
      const path = `${relative}/${entry.name}`;
      if (watchAction(path) === "ignore" || entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) await visit(path);
      else if (entry.isFile()) await record(path);
    }
  }
  /** @param {string} relative */
  async function record(relative) {
    try {
      if ((await lstat(join(root, relative))).isSymbolicLink()) return;
      files.set(relative, createHash("sha256").update(await readFile(join(root, relative))).digest("hex"));
    }
    catch (error) { if (error.code !== "ENOENT") throw error; }
  }
  for (const directory of directories) await visit(directory);
  for (const file of [...rebuild, ...restart]) await record(file);
  return files;
}

/** @param {Map<string,string>} previous @param {Map<string,string>} current */
export function sourceChanges(previous, current) {
  return [...new Set([...previous.keys(), ...current.keys()])]
    .filter(path => previous.get(path) !== current.get(path))
    .map(path => ({ path, action: watchAction(path), deleted: !current.has(path) }));
}
