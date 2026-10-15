// Reproductor de transporte sin Next, React, PostgreSQL ni código de usuarios.
// node scripts/diagnose-action-stream.mjs (necesita Chromium de Playwright).
import { chromium } from "playwright";
import { createServer } from "node:http";
import { createGzip } from "node:zlib";

const payload = `0:{"test":"${"a".repeat(12000)}"}\n`;
const records = new Map();
const timers = new Set();
const server = createServer((request, response) => {
  if (request.method !== "POST") {
    response.setHeader("Content-Type", "text/html");
    response.end("<!doctype html><html><body>Diagnóstico HTTP local</body></html>");
    return;
  }
  const record = { mode: request.url.startsWith("/gzip") ? "gzip" : "plain", serverFinished: false, nativeEof: false, intact: false, network: "pending" };
  records.set(request.url, record);
  response.on("finish", () => { record.serverFinished = true; });
  response.setHeader("Content-Type", "text/x-component");
  response.setHeader("Cache-Control", "no-store");
  const endLater = () => {
    // Latencia deliberada del reproductor, no una espera/reintento del E2E.
    const timer = setTimeout(() => { timers.delete(timer); response.end(); }, 250);
    timers.add(timer);
  };
  if (record.mode === "gzip") {
    response.setHeader("Content-Encoding", "gzip");
    const gzip = createGzip();
    gzip.pipe(response, { end: false });
    gzip.on("end", endLater);
    gzip.end(payload);
  } else {
    response.write(payload);
    endLater();
  }
});

let browser;
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
try {
  browser = await chromium.launch();
  const context = await browser.newContext();
  await context.tracing.start({ snapshots: true });
  const page = await context.newPage();
  page.on("requestfinished", request => {
    if (request.method() === "POST") records.get(new URL(request.url()).pathname + new URL(request.url()).search).network = "finished";
  });
  page.on("requestfailed", request => {
    if (request.method() === "POST") records.get(new URL(request.url()).pathname + new URL(request.url()).search).network = request.failure()?.errorText ?? "failed";
  });
  const address = server.address();
  await page.goto(`http://127.0.0.1:${address.port}`);
  for (const mode of ["plain", "gzip"]) for (let index = 0; index < 10; index++) {
    const url = `/${mode}?case=${index}`;
    const text = await page.evaluate(async url => {
      const response = await fetch(url, { method: "POST", headers: { "next-action": "diagnostic", Accept: "text/x-component" }, body: "test" });
      const reader = response.body.getReader();
      let text = "";
      while (true) {
        const entry = await reader.read();
        if (entry.done) return text;
        text += new TextDecoder().decode(entry.value);
      }
    }, url);
    Object.assign(records.get(url), { nativeEof: true, intact: text === payload });
  }
  console.log(JSON.stringify([...records.values()], null, 2));
  if ([...records.values()].some(record => !record.nativeEof || !record.intact)) process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  for (const timer of timers) clearTimeout(timer);
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
}
