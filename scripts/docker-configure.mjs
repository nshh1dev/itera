import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

mkdirSync(".local", { recursive: true });
const path = ".local/docker.env";
if (existsSync(path)) {
  console.log("La configuración Docker ya existe; se conservan sus secretos.");
} else {
  writeFileSync(path, `DOCKER_DB_PASSWORD=${randomBytes(24).toString("hex")}\nDOCKER_AUTH_SECRET=${randomBytes(48).toString("hex")}\n`, { mode: 0o600, flag: "wx" });
  console.log("Secretos Docker creados en .local/docker.env. No se modificó .env.");
}
