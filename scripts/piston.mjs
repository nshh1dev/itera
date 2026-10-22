import { pistonOrigin } from "../src/lib/piston-url.mjs";
const base = pistonOrigin(process.env.PISTON_URL || "http://127.0.0.1:2000", process.env.ITERA_CONTAINER === "1");
try {
  const response = await fetch(`${base}/api/v2/packages`);
  if (!response.ok) throw new Error("No se pudieron consultar los paquetes.");
  const payload = await response.json();
  if (!Array.isArray(payload)) throw new Error("Piston devolvió una lista de paquetes inválida.");
  const packages = payload.map((pkg) => ({ ...pkg, version: pkg.language_version })).filter((pkg) => typeof pkg.language === "string" && typeof pkg.version === "string");
  for (const [language, version] of [["python", "3.12.0"], ["node", "20.11.1"], ["typescript", "5.0.3"]]) {
    const selected = packages.find((p) => p.language === language && p.version === version);
    if (!selected) throw new Error(`Paquete ${language} ${version} no disponible.`);
    if (!selected.installed) {
      console.log(`Instalando ${language} ${selected.version}…`);
      const result = await fetch(`${base}/api/v2/packages`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ language, version: selected.version }) });
      if (!result.ok) throw new Error(`No se pudo instalar ${language}: ${await result.text()}`);
    }
  }
  console.log("Python, JavaScript y TypeScript listos en el ejecutor local.");
} catch (error) {
  console.error(`${error.message}\nInicia primero Docker/WSL2 y ejecuta docker compose up -d.`);
  process.exitCode = 1;
}
