// Requiere docker-desarrollar activo. No forma parte de npm test ni inicia servidores.
import { chromium, expect } from "@playwright/test";
import { mkdir, writeFile, unlink, rmdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { composeArgs, dockerCommand } from "../scripts/docker-command.mjs";

const [executable, args] = dockerCommand(composeArgs(["exec", "-T", "app", "node", "-p", "process.env.NODE_ENV"], true));
await expect.poll(() => {
  const mode = spawnSync(executable, args, { encoding: "utf8", timeout: 10000 });
  return mode.status === 0 ? mode.stdout.trim() : "no disponible";
}, { timeout: 120000, message: "Primero inicia docker-desarrollar; la app debe entrar en desarrollo." }).toBe("development");
const slug = `docker-dev-check-${Date.now()}`;
const directory = `src/app/${slug}`;
const file = `${directory}/page.tsx`;
const source = text => `export default function Probe() { return <h1>${text}</h1>; }\n`;
async function status(url) {
  try { return (await fetch(url, { signal: AbortSignal.timeout(10000) })).status; }
  catch { return 0; }
}
let browser;
await mkdir(directory);
try {
  await writeFile(file, source("Primera versión de desarrollo"));
  const url = `http://127.0.0.1:3000/${slug}`;
  await expect.poll(() => status(url), { timeout: 60000 }).toBe(200);
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url);
  await expect(page.getByRole("heading", { name: "Primera versión de desarrollo" })).toBeVisible();
  await writeFile(file, source("Cambio visible sin reconstruir"));
  // No hay page.reload ni navegación después de editar el archivo de Windows.
  await expect(page.getByRole("heading", { name: "Cambio visible sin reconstruir" })).toBeVisible({ timeout: 60000 });
  await writeFile(file, source("Primera versión de desarrollo"));
  await expect(page.getByRole("heading", { name: "Primera versión de desarrollo" })).toBeVisible({ timeout: 60000 });
  console.log("Alta, edición y restauración visibles en el navegador sin recarga manual ni reconstrucción: aprobadas.");
} finally {
  await browser?.close();
  await unlink(file);
  await rmdir(directory);
}
await expect.poll(() => status(`http://127.0.0.1:3000/${slug}`), { timeout: 60000 }).toBe(404);
console.log("Borrado del archivo sincronizado: ruta temporal retirada.");
