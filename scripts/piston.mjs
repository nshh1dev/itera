const base = process.env.PISTON_URL || "http://127.0.0.1:2000";
const url = new URL(base);
if (!["127.0.0.1", "localhost", "[::1]"].includes(url.hostname)) throw new Error("Piston debe ser local.");
try {
  const response = await fetch(`${base}/api/v2/packages`);
  if (!response.ok) throw new Error("No se pudieron consultar los paquetes.");
  const payload = await response.json();
  if (!Array.isArray(payload)) throw new Error("Piston devolvió una lista de paquetes inválida.");
  const packages = payload.map((pkg) => ({ ...pkg, version: pkg.language_version })).filter((pkg) => typeof pkg.language === "string" && typeof pkg.version === "string");
  for (const language of ["python", "node", "typescript"]) {
    const available = packages.filter((p) => p.language === language).sort((a, b) => b.version.localeCompare(a.version, undefined, { numeric: true }));
    const selected = available[0];
    if (!selected) throw new Error(`Paquete ${language} no disponible.`);
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
