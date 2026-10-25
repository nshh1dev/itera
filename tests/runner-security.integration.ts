// Solo sandbox real, nunca el proceso web. Requiere autorización operativa y
// ITERA_RUNNER_SECURITY=1; no inicia Docker, Next ni PostgreSQL.
import "dotenv/config";
import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { availableRuntime, runCode } from "../src/server/execution/piston";

const options = {
  skip: process.env.ITERA_RUNNER_SECURITY === "1" ? false : "Requiere autorización y ITERA_RUNNER_SECURITY=1; consulta docs/runner-security.md",
  timeout: 60000,
};

async function probe(code: string) {
  const runtime = await availableRuntime("python");
  const result = await runCode("python", runtime, code, "", "PROGRAM");
  assert.equal(result.code, 0, "La sonda no terminó correctamente; revisar el sandbox sin volcar posibles datos privados.");
  assert.ok(!result.signal && !result.status, "El sandbox interrumpió la sonda.");
  return JSON.parse(result.stdout);
}

test("el sandbox no tiene interfaz externa ni ruta hacia una dirección de documentación", options, async () => {
  const result = await probe(`import socket, errno, json
interfaces = [name for _, name in socket.if_nameindex()]
with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as client:
    client.settimeout(0.5)
    try:
        client.connect(("192.0.2.1", 9))
        blocked = False
    except OSError as error:
        blocked = error.errno in (errno.ENETUNREACH, errno.EACCES, errno.EPERM)
print(json.dumps({"interfaces": interfaces, "blocked": blocked}))`);
  assert.deepEqual(result.interfaces, ["lo"]);
  // Un timeout o rechazo remoto NO demuestra aislamiento de red.
  assert.equal(result.blocked, true);
});

test("el sandbox no recibe secretos de Itera ni sus rutas privadas conocidas", options, async () => {
  const result = await probe(`import os, json
names = ["DATABASE_URL", "BETTER_AUTH_SECRET", "BETTER_AUTH_URL"]
paths = ["/app/.env", "/app/.local", "/piston/.env", "/var/run/docker.sock"]
print(json.dumps({"environmentAbsent": all(name not in os.environ for name in names), "pathsAbsent": all(not os.path.exists(path) for path in paths)}))`);
  assert.deepEqual(result, { environmentAbsent: true, pathsAbsent: true });
});

test("un archivo sintético no se conserva entre dos ejecuciones", options, async () => {
  const name = `itera-probe-${randomUUID()}.txt`;
  const created = await probe(`import json
with open(${JSON.stringify(name)}, "w") as marker:
    marker.write("synthetic-test-only")
print(json.dumps(True))`);
  assert.equal(created, true);
  const exists = await probe(`import os, json
print(json.dumps(os.path.exists(${JSON.stringify(name)})))`);
  assert.equal(exists, false);
});

test("el límite efectivo por archivo respeta el presupuesto con conversión de unidades", options, async () => {
  const result = await probe(`import resource, json
soft, hard = resource.getrlimit(resource.RLIMIT_FSIZE)
print(json.dumps({"soft": soft, "hard": hard}))`);
  // Consulta el límite sin escribir archivos grandes ni agotar disco.
  // Piston divide bytes por 1000; Isolate puede expresar ese valor en KiB.
  const ceiling = 10000 * 1024;
  assert.ok(result.soft > 0 && result.soft <= ceiling);
  assert.ok(result.hard > 0 && result.hard <= ceiling);
});

test("la salida excesiva se trunca o interrumpe y una ejecución posterior funciona", options, async () => {
  const runtime = await availableRuntime("python");
  // Emisión finita de 128 KiB, no bucle ilimitado.
  const result = await runCode("python", runtime, 'print("x" * 131072)', "", "PROGRAM");
  assert.ok(Buffer.byteLength(result.stdout, "utf8") <= 65536);
  assert.equal(await probe('import json; print(json.dumps("ok"))'), "ok");
});
