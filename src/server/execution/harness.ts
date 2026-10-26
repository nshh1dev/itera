import type { Json, Language, RuntimeMode } from "@/lib/types";
import type { RunOutput } from "./judge";
import { normalizeProjectPath, projectLimits, validateProjectSnapshot, type ProjectDefinition, type ProjectFile } from "@/lib/project";

export const typescriptTimeoutExitCode = 124;

export function projectExecutionFiles(language: Language, files: readonly ProjectFile[], project: ProjectDefinition, mode: RuntimeMode | "tests", typeContract = "") {
  files = validateProjectSnapshot(project, files);
  if (files.length === 0 || files.length > projectLimits.files) throw new Error("Cantidad de archivos de proyecto inválida.");
  let totalBytes = 0;
  const normalized = new Set<string>();
  for (const file of files) {
    const path = normalizeProjectPath(file.path);
    if (!path || path.startsWith("__itera") || normalized.has(path)) throw new Error("El proyecto contiene una ruta inválida, duplicada o reservada.");
    normalized.add(path);
    const bytes = Buffer.byteLength(file.content, "utf8");
    if (bytes > projectLimits.fileBytes || (totalBytes += bytes) > projectLimits.totalBytes) throw new Error("El proyecto supera los límites de archivos.");
  }
  const selectedEntrypoint = mode === "tests" ? project.testEntrypoint : project.entrypoint;
  if (!selectedEntrypoint) throw new Error("Este proyecto no tiene un archivo público de pruebas propias.");
  const entry = normalizeProjectPath(selectedEntrypoint);
  if (!entry || !normalized.has(entry)) throw new Error("El punto de entrada no existe en el proyecto.");
  const expectedExtension = language === "python" ? ".py" : language === "typescript" ? ".ts" : ".js";
  if (!selectedEntrypoint.toLowerCase().endsWith(expectedExtension)) throw new Error("La extensión del punto de entrada no corresponde al lenguaje.");
  const userFiles = files.map(file => ({ name: file.path, content: file.path === project.entrypoint && language === "typescript" && typeContract ? `${file.content}\n${typeContract}` : file.content }));
  const nodeDeclarations = `declare module "fs" { export function readFileSync(path: string | number, encoding: "utf8"): string; export function writeFileSync(path: string, data: string, encoding?: "utf8"): void; export function existsSync(path: string): boolean; export function unlinkSync(path: string): void; export function readdirSync(path: string): string[]; }\ndeclare module "node:assert/strict" { export function equal(actual: unknown, expected: unknown, message?: string): void; export function deepEqual(actual: unknown, expected: unknown, message?: string): void; export function ok(value: unknown, message?: string): asserts value; }\ndeclare function require(name: string): any;\n`;
  if (language === "typescript") userFiles.push({ name: "__itera_node.d.ts", content: nodeDeclarations });
  if (mode === "tests" && language !== "typescript") return [userFiles.find(file => file.name === selectedEntrypoint)!, ...userFiles.filter(file => file.name !== selectedEntrypoint)];
  const artifactCollection = (ignored: string[]) => language === "python"
    ? `def __itera_collect():\n import json, os\n ignored = set(${JSON.stringify(ignored)})\n found = []\n total = 0\n for name in os.listdir('.'):\n  if name in ignored or name.startswith('__itera_') or not os.path.isfile(name): continue\n  size = os.path.getsize(name)\n  if size > 32768 or total + size > 32768 or len(found) >= 20: raise RuntimeError('Límite de archivos generados excedido')\n  with open(name, encoding='utf-8') as file: found.append({'path':name,'content':file.read()})\n  total += size\n return found\n`
    : `function __itera_collect() { const ignored = new Set(${JSON.stringify(ignored)}); const found = []; let total = 0; for (const entry of fs.readdirSync('.',{withFileTypes:true})) { if (!entry.isFile() || ignored.has(entry.name) || entry.name.startsWith('__itera_')) continue; const size = fs.statSync(entry.name).size; if (size > 32768 || total + size > 32768 || found.length >= 20) throw new Error('Límite de archivos generados excedido'); found.push({path:entry.name,content:fs.readFileSync(entry.name,'utf8')}); total += size; } return found; }\n`;
  const ignoredInputs = userFiles.map(file => file.name);
  if (language === "python") {
    const imports = `import json, os, sys, subprocess, importlib.util\n${artifactCollection(ignoredInputs)}`;
    const runner = mode === "FUNCTION"
      ? `__itera_spec = importlib.util.spec_from_file_location('__itera_student_main', ${JSON.stringify(project.entrypoint)})\n__itera_module = importlib.util.module_from_spec(__itera_spec)\nsys.modules[__itera_spec.name] = __itera_module\n__itera_spec.loader.exec_module(__itera_module)\nresult = __itera_module.solve(json.loads(sys.stdin.read()))\nprint('__ITERA_PROJECT__' + json.dumps({'kind':'function','value':result,'files':__itera_collect()},ensure_ascii=True,allow_nan=False))`
      : `try:\n process = subprocess.run([sys.executable, ${JSON.stringify(project.entrypoint)}], input=sys.stdin.read(), text=True, capture_output=True, timeout=3)\n payload = {'kind':'program','stdout':process.stdout,'stderr':process.stderr,'code':process.returncode,'files':__itera_collect()}\nexcept subprocess.TimeoutExpired as error:\n payload = {'kind':'program','timeout':True,'stdout':error.stdout or '', 'stderr':error.stderr or '', 'files':__itera_collect()}\nprint('__ITERA_PROJECT__' + json.dumps(payload,ensure_ascii=True,allow_nan=False))`;
    return [{ name: "__itera_runner.py", content: `${imports}\n${runner}\n` }, ...userFiles];
  }
  if (language === "javascript") {
    const imports = `const fs = require('fs');\nconst child = require('child_process');\n${artifactCollection(ignoredInputs)}`;
    const runner = mode === "FUNCTION"
      ? `const solve = require('./${project.entrypoint}');\nconst result = solve(JSON.parse(fs.readFileSync(0,'utf8')));\nif (result === undefined) throw new Error('solve debe devolver un valor con return');\nconsole.log('__ITERA_PROJECT__' + JSON.stringify({kind:'function',value:result,files:__itera_collect()}));`
      : `const processResult = child.spawnSync(process.execPath,[${JSON.stringify(project.entrypoint)}],{input:fs.readFileSync(0,'utf8'),encoding:'utf8',timeout:3000,maxBuffer:32768});\nconst payload = {kind:'program',stdout:processResult.stdout||'',stderr:processResult.stderr||'',code:processResult.status,timeout:!!(processResult.error&&processResult.error.code==='ETIMEDOUT'),files:__itera_collect()};\nconsole.log('__ITERA_PROJECT__' + JSON.stringify(payload));`;
    return [{ name: "__itera_runner.js", content: `${imports}\n${runner}\n` }, ...userFiles];
  }
  if (language !== "typescript") throw new Error("Modo de ejecución de proyecto no válido.");
  const sourcePaths = userFiles.filter(file => file.name.toLowerCase().endsWith(".ts")).map(file => file.name);
  if (!userFiles.some(file => file.name === selectedEntrypoint && file.name.toLowerCase().endsWith(".ts"))) throw new Error("El entrypoint TypeScript no se incluye entre los módulos compilables.");
  const compiledEntry = selectedEntrypoint.replace(/\.ts$/i, ".js");
  const runCompiled = mode === "FUNCTION"
    ? `const target = require('./__itera_build/${compiledEntry}');\nconst result = target.solve(JSON.parse(fs.readFileSync(0, 'utf8')));\nif (result === undefined) throw new Error('solve debe devolver un valor con return');\nconsole.log('__ITERA_VALUE__' + JSON.stringify(result));`
    : "";
  const collectJs = artifactCollection(ignoredInputs);
  const runCommand = mode === "FUNCTION" ? `['-e', ${JSON.stringify(runCompiled)}]` : `[${JSON.stringify(`__itera_build/${compiledEntry}`)}]`;
  const marker = mode === "tests"
    ? `process.stdout.write(executed.stdout || ''); process.exit(executed.status === null ? 1 : executed.status);`
    : mode === "FUNCTION"
    ? `const lines = (executed.stdout || '').trimEnd().split(/\\r?\\n/); const last = lines.pop() || ''; if (!last.startsWith('__ITERA_VALUE__')) throw new Error('solve debe devolver un valor JSON'); const payload = {kind:'function',value:JSON.parse(last.slice('__ITERA_VALUE__'.length)),files:__itera_collect()}; process.stdout.write(lines.join('\\n') + (lines.length ? '\\n' : '') + '__ITERA_PROJECT__' + JSON.stringify(payload) + '\\n');`
    : `const payload = {kind:'program',stdout:executed.stdout||'',stderr:executed.stderr||'',code:executed.status,timeout:!!(executed.error&&executed.error.code==='ETIMEDOUT'),files:__itera_collect()}; process.stdout.write('__ITERA_PROJECT__' + JSON.stringify(payload) + '\\n');`;
  const runner = `declare function require(name: string): any;\ndeclare const process: { execPath: string; exit(code: number): never; stdout: { write(text: string): void }; stderr: { write(text: string): void } };\nconst fs = require('fs');\nconst child = require('child_process');\n${collectJs}\nconst sources = ${JSON.stringify(sourcePaths)};\nconst compiled = child.spawnSync('tsc', [...sources, '--strict', '--noEmitOnError', '--target', 'ES2022', '--module', 'commonjs', '--moduleResolution', 'node', '--rootDir', '.', '--outDir', '__itera_build'], { encoding: 'utf8', timeout: 8000 });\nif (compiled.error && compiled.error.code === 'ETIMEDOUT') process.exit(${typescriptTimeoutExitCode});\nif (compiled.error || compiled.status !== 0) { process.stderr.write('TypeScript: corrige los errores de tipos antes de ejecutar.\\n' + (compiled.stdout || '') + (compiled.stderr || '')); process.exit(1); }\nconst executed = child.spawnSync(process.execPath, ${runCommand}, { input: fs.readFileSync(0, 'utf8'), encoding: 'utf8', timeout: 3000, maxBuffer: 32768 });\nprocess.stderr.write(executed.stderr || '');\nif (executed.error && executed.error.code === 'ETIMEDOUT') process.exit(${typescriptTimeoutExitCode});\nif (executed.error || executed.signal) { process.stderr.write('Se alcanzó el límite de ejecución o de salida.'); process.exit(1); }\n${marker}`;
  return [{ name: "__itera_runner.ts", content: runner }, ...userFiles];
}

// Construye archivos; nunca compila ni ejecuta código enviado en el servidor web.
export function executionFiles(language: Language, code: string, mode: RuntimeMode, typeContract = "") {
  if (language === "typescript") {
    // El paquete nativo de Piston compila sin --strict. Un conductor fijo ejecuta
    // una segunda compilación estricta DENTRO del sandbox y solo después Node.
    // El código enviado es un literal JSON, no parte del conductor compilado.
    const program = `${code}\n${typeContract}\n${mode === "FUNCTION" ? `const __iteraInput = JSON.parse(require('fs').readFileSync(0, 'utf8'));
const __iteraResult = solve(__iteraInput);
if (__iteraResult === undefined) throw new Error('solve debe devolver un valor con return');
console.log(JSON.stringify(__iteraResult));` : ""}\n`;
    return [{ name: "main", content: `declare function require(name: string): any;
declare const process: { execPath: string; exit(code: number): never; stdout: { write(text: string): void }; stderr: { write(text: string): void } };
const fs = require('fs');
const child = require('child_process');
fs.writeFileSync('submission.ts', ${JSON.stringify(`declare function require(name: "fs"): { readFileSync(fd: number, encoding: "utf8"): string };\n${program}`)});
const compiled = child.spawnSync('tsc', ['submission.ts', '--strict', '--noEmitOnError', '--target', 'ES2022', '--module', 'commonjs'], { encoding: 'utf8', timeout: 8000 });
if (compiled.error && compiled.error.code === 'ETIMEDOUT') process.exit(${typescriptTimeoutExitCode});
if (compiled.error || compiled.status !== 0) {
  process.stderr.write('TypeScript: corrige los errores de tipos antes de ejecutar.\\n' + (compiled.stdout || '') + (compiled.stderr || '') + (compiled.error ? String(compiled.error) : ''));
  process.exit(1);
}
const executed = child.spawnSync(process.execPath, ['submission.js'], { input: fs.readFileSync(0, 'utf8'), encoding: 'utf8', timeout: 3000, maxBuffer: 65536 });
process.stdout.write(executed.stdout || '');
process.stderr.write(executed.stderr || '');
if (executed.error && executed.error.code === 'ETIMEDOUT') process.exit(${typescriptTimeoutExitCode});
if (executed.error || executed.signal) { process.stderr.write('Se alcanzó el límite de ejecución o de salida.'); process.exit(1); }
process.exit(executed.status === null ? 1 : executed.status);
` }];
  }
  if (mode === "PROGRAM") return [{ name: language === "python" ? "main.py" : "main.js", content: code }];
  return language === "python" ? [
    { name: "main.py", content: "import json, sys\nfrom solution import solve\ndata = json.loads(sys.stdin.read())\nprint(json.dumps(solve(data), ensure_ascii=True, allow_nan=False))\n" },
    { name: "solution.py", content: code },
  ] : [
    { name: "main.js", content: "const fs = require('fs');\nconst solve = require('./solution.js');\nconst data = JSON.parse(fs.readFileSync(0, 'utf8'));\nconst result = solve(data);\nif (result === undefined) throw new Error('solve debe devolver un valor con return');\nconsole.log(JSON.stringify(result));\n" },
    { name: "solution.js", content: `${code}\nmodule.exports = solve;\n` },
  ];
}

export function executionInput(input: Json, mode: RuntimeMode) {
  return mode === "PROGRAM" ? (typeof input === "string" ? input : JSON.stringify(input ?? "")) : JSON.stringify(input);
}

// El proceso exterior terminó normalmente, pero su hijo agotó el plazo.
// Conserva el mismo veredicto que el límite nativo de Piston, sin depender del
// texto impreso por el programa (que nunca puede convertir un fallo en aprobado).
export function executionOutput(language: Language, output: RunOutput): RunOutput {
  return language === "typescript" && output.code === typescriptTimeoutExitCode && !output.signal && (!output.status || output.status === "RE")
    ? { ...output, status: "TO" }
    : output;
}
