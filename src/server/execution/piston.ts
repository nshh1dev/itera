import "server-only";
import { z } from "zod";
import type { Json, Language, RuntimeMode } from "@/lib/types";
import type { RunOutput } from "./judge";
import { languageNames } from "@/lib/types";
import { executionFiles, executionInput, executionOutput } from "./harness";
import { projectExecutionFiles } from "./harness";
import type { ProjectDefinition, ProjectFile } from "@/lib/project";
import { pistonOrigin } from "@/lib/piston-url.mjs";
import { runtimeLookupTimeoutMs, executionRequestTimeoutMs } from "@/lib/execution-limits";

export class RunnerUnavailable extends Error {
  constructor(message = "El ejecutor local no está disponible. Inicia Docker y Piston, y ejecuta npm run runner:setup. Tu código sigue guardado.") { super(message); }
}

function baseUrl() {
  try {
    return pistonOrigin(process.env.PISTON_URL || "http://127.0.0.1:2000", process.env.ITERA_CONTAINER === "1");
  } catch { throw new RunnerUnavailable("PISTON_URL debe apuntar al ejecutor HTTP local o al servicio Piston de Docker."); }
}

const runtimeSchema = z.array(z.object({ language: z.string(), version: z.string(), aliases: z.array(z.string()) }));
const outputSchema = z.object({ stdout: z.string().max(65536), stderr: z.string().max(65536), code: z.number().nullable(), signal: z.string().nullable().optional(), status: z.string().nullable().optional() });

export async function availableRuntime(language: Language) {
  try {
    const response = await fetch(`${baseUrl()}/api/v2/runtimes`, { cache: "no-store", signal: AbortSignal.timeout(runtimeLookupTimeoutMs) });
    if (!response.ok) throw new RunnerUnavailable();
    const runtimes = runtimeSchema.parse(await response.json());
    const names = language === "typescript" ? ["typescript", "ts"] : language === "javascript" ? ["javascript", "js", "node"] : ["python", "python3"];
    const runtime = runtimes.filter(r => names.includes(r.language) || r.aliases.some(alias => names.includes(alias))).sort((a,b) => b.version.localeCompare(a.version, undefined, { numeric:true }))[0];
    if (!runtime) throw new RunnerUnavailable(`Piston está iniciado, pero falta ${languageNames[language]}. Ejecuta npm run runner:setup.`);
    return { language: runtime.language, version: runtime.version };
  } catch (error) { throw error instanceof RunnerUnavailable ? error : new RunnerUnavailable(); }
}

export async function runCode(language: Language, runtime: {language:string;version:string}, code: string, input: Json, mode: RuntimeMode = "FUNCTION", typeContract = "", project?: { definition: ProjectDefinition; files: readonly ProjectFile[]; purpose?: "tests" }): Promise<RunOutput> {
  const files = project ? projectExecutionFiles(language, project.files, project.definition, project.purpose === "tests" ? "tests" : mode, typeContract) : executionFiles(language, code, mode, typeContract);
  const stdin = project?.purpose === "tests" ? "" : executionInput(input, mode);
  try {
    const response = await fetch(`${baseUrl()}/api/v2/execute`, {
      method: "POST", headers: { "Content-Type": "application/json" }, signal: AbortSignal.timeout(executionRequestTimeoutMs(language)),
       body: JSON.stringify({ ...runtime, files, stdin, run_timeout: language === "typescript" || (project && mode === "PROGRAM") ? 12000 : 3000, run_cpu_time: language === "typescript" || (project && mode === "PROGRAM") ? 10000 : 3000, compile_timeout: 8000, run_memory_limit: 268435456, compile_memory_limit: 268435456 }),
    });
    if (!response.ok) throw new RunnerUnavailable("Piston no pudo evaluar el programa. Comprueba los lenguajes instalados y vuelve a intentarlo.");
    const payload = await response.json();
    const result = outputSchema.parse(payload.compile && (payload.compile.code !== 0 || payload.compile.signal || payload.compile.status) ? payload.compile : payload.run ?? payload.compile);
    if (result.status === "XX") throw new RunnerUnavailable("El sandbox tuvo un error interno. Este intento no cuenta como incorrecto.");
    return executionOutput(language, result);
  } catch (error) { throw error instanceof RunnerUnavailable ? error : new RunnerUnavailable("Se perdió la conexión con el ejecutor local. Este intento no cuenta como incorrecto."); }
}
