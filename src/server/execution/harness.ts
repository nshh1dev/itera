import type { Json, Language, RuntimeMode } from "@/lib/types";

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
if (compiled.error || compiled.status !== 0) {
  process.stderr.write('TypeScript: corrige los errores de tipos antes de ejecutar.\\n' + (compiled.stdout || '') + (compiled.stderr || '') + (compiled.error ? String(compiled.error) : ''));
  process.exit(1);
}
const executed = child.spawnSync(process.execPath, ['submission.js'], { input: fs.readFileSync(0, 'utf8'), encoding: 'utf8', timeout: 3000, maxBuffer: 65536 });
process.stdout.write(executed.stdout || '');
process.stderr.write(executed.stderr || '');
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
