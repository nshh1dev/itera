import { closeSync, fsyncSync, fstatSync, openSync, readSync, unlinkSync } from "node:fs";

// El productor escribe en un descriptor ya reservado: nunca reabre una ruta con
// truncamiento. No cifra el archivo ni sustituye las ACL del directorio en Windows.
export function createPgBackup(file, produce) {
  const fd = openSync(file, "wx+", 0o600);
  let complete = false;
  try {
    produce(fd);
    const header = Buffer.alloc(5);
    if (fstatSync(fd).size <= 5 || readSync(fd, header, 0, 5, 0) !== 5 || header.toString("ascii") !== "PGDMP") {
      throw new Error("El respaldo no contiene una cabecera PostgreSQL válida; no se conserva como copia correcta.");
    }
    fsyncSync(fd);
    complete = true;
  } finally {
    try { closeSync(fd); }
    finally { if (!complete) unlinkSync(file); }
  }
}
