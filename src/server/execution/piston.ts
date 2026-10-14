import "server-only";
import { z } from "zod";
import type { Json, Language } from "@/lib/types";
import type { RunOutput } from "./judge";

export class RunnerUnavailable extends Error {
  constructor(message = "El ejecutor local no está disponible. Inicia Docker y Piston, y ejecuta npm run runner:setup. Tu código sigue guardado.") { super(message); }
}

function baseUrl() {
  const url = new URL(process.env.PISTON_URL || "http://127.0.0.1:2000");
  if (!["127.0.0.1", "localhost", "[::1]"].includes(url.hostname) || url.protocol !== "http:") throw new RunnerUnavailable("PISTON_URL debe apuntar al ejecutor HTTP de tu computadora.");
  return url.origin;
}

const runtimeSchema = z.array(z.object({ language: z.string(), version: z.string(), aliases: z.array(z.string()) }));
const outputSchema = z.object({ stdout: z.string().max(65536), stderr: z.string().max(65536), code: z.number().nullable(), signal: z.string().nullable().optional(), status: z.string().nullable().optional() });

export async function availableRuntime(language: Language) {
  try {
    const response = await fetch(`${baseUrl()}/api/v2/runtimes`, { cache: "no-store", signal: AbortSignal.timeout(2500) });
    if (!response.ok) throw new RunnerUnavailable();
    const runtimes = runtimeSchema.parse(await response.json());
    const names = language === "javascript" ? ["javascript", "js", "node"] : ["python", "python3"];
    const runtime = runtimes.filter(r => names.includes(r.language) || r.aliases.some(alias => names.includes(alias))).sort((a,b) => b.version.localeCompare(a.version, undefined, { numeric:true }))[0];
    if (!runtime) throw new RunnerUnavailable(`Piston está iniciado, pero falta ${language === "python" ? "Python" : "JavaScript"}. Ejecuta npm run runner:setup.`);
    return { language: runtime.language, version: runtime.version };
  } catch (error) { throw error instanceof RunnerUnavailable ? error : new RunnerUnavailable(); }
}

export async function runCode(language: Language, runtime: {language:string;version:string}, code: string, input: Json): Promise<RunOutput> {
  const files = language === "python" ? [
    { name: "main.py", content: "import json, sys\nfrom solution import solve\ndata = json.loads(sys.stdin.read())\nprint(json.dumps(solve(data), ensure_ascii=True, allow_nan=False))\n" },
    { name: "solution.py", content: code },
  ] : [
    { name: "main.js", content: "const fs = require('fs');\nconst solve = require('./solution.js');\nconst data = JSON.parse(fs.readFileSync(0, 'utf8'));\nconst result = solve(data);\nif (result === undefined) throw new Error('solve debe devolver un valor con return');\nconsole.log(JSON.stringify(result));\n" },
    { name: "solution.js", content: `${code}\nmodule.exports = solve;\n` },
  ];
  try {
    const response = await fetch(`${baseUrl()}/api/v2/execute`, {
      method: "POST", headers: { "Content-Type": "application/json" }, signal: AbortSignal.timeout(12000),
      body: JSON.stringify({ ...runtime, files, stdin: JSON.stringify(input), run_timeout: 3000, run_cpu_time: 3000, compile_timeout: 5000, run_memory_limit: 268435456, compile_memory_limit: 268435456 }),
    });
    if (!response.ok) throw new RunnerUnavailable("Piston no pudo evaluar el programa. Comprueba los lenguajes instalados y vuelve a intentarlo.");
    const payload = await response.json();
    const result = outputSchema.parse(payload.run ?? payload.compile);
    if (result.status === "XX") throw new RunnerUnavailable("El sandbox tuvo un error interno. Este intento no cuenta como incorrecto.");
    return result;
  } catch (error) { throw error instanceof RunnerUnavailable ? error : new RunnerUnavailable("Se perdió la conexión con el ejecutor local. Este intento no cuenta como incorrecto."); }
}
