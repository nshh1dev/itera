import { test, expect } from "@playwright/test";
import { createServer, type ServerResponse } from "node:http";
import { createGzip } from "node:zlib";
import { actionStreamMonitor } from "./action-stream";

// HTTP real sin Next, React, base de datos ni ejecutor. Se separa la entrega
// del fragmento del cierre HTTP mediante una confirmación del consumidor.
for (const mode of ["plain", "gzip", "truncated", "cancelled", "status-error"] as const) {
  test(`el monitor distingue la entrega HTTP ${mode} por el EOF del consumidor`, async ({ page }) => {
    let responseReady!: (response: ServerResponse) => void;
    const received = new Promise<ServerResponse>(resolve => { responseReady = resolve; });
    const server = createServer((request, response) => {
      if (request.method !== "POST") {
        response.setHeader("Content-Type", "text/html");
        response.end("<!doctype html><html><body>Prueba de transporte</body></html>");
        return;
      }
      response.setHeader("Content-Type", "text/x-component");
      response.setHeader("Cache-Control", "no-store");
      responseReady(response);
      if (mode === "status-error") {
        response.statusCode = 503;
        response.end("error de servicio");
        return;
      }
      if (mode === "gzip") {
        response.setHeader("Content-Encoding", "gzip");
        const gzip = createGzip();
        gzip.pipe(response, { end: false });
        gzip.end("fragmento final");
      } else response.write("fragmento");
    });
    await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
    try {
      const address = server.address();
      if (!address || typeof address === "string") throw new Error("Falta el puerto de pruebas");
      const completeAction = await actionStreamMonitor(page);
      await page.goto(`http://127.0.0.1:${address.port}`);
      await page.evaluate(cancel => { Reflect.set(window, "httpShouldCancel", cancel); }, mode === "cancelled");
      const delivery = completeAction(() => page.evaluate(() => {
        Reflect.set(window, "httpReadState", "pending");
        Reflect.set(window, "httpReadText", "");
        void (async () => {
          const response = await fetch("/stream", { method: "POST", headers: { "next-action": "http-test" } });
          const reader = response.body!.getReader();
          while (true) {
            const entry = await reader.read();
            if (entry.done) break;
            Reflect.set(window, "httpReadText", Reflect.get(window, "httpReadText") + new TextDecoder().decode(entry.value));
            if (Reflect.get(window, "httpShouldCancel")) {
              await reader.cancel("Cancelación HTTP controlada");
              Reflect.set(window, "httpReadState", "cancelled");
              return;
            }
          }
          Reflect.set(window, "httpReadState", "eof");
        })().catch(() => Reflect.set(window, "httpReadState", "error"));
      }));
      // Capturar inmediatamente un rechazo esperado evita una promesa rechazada
      // sin manejador mientras el proceso de pruebas controla el servidor.
      const outcome = delivery.then(() => null, error => error as Error);
      const response = await received;
      if (mode === "status-error") {
        expect(await outcome).toBeInstanceOf(Error);
        await page.waitForFunction(() => Reflect.get(window, "httpReadState") === "eof");
      } else if (mode === "cancelled") {
        const error = await outcome;
        expect(error).toBeInstanceOf(Error);
        expect(error!.message).toContain("sin EOF válido");
        expect(await page.evaluate(() => Reflect.get(window, "httpReadState"))).toBe("cancelled");
      } else if (mode === "gzip") {
        await page.waitForFunction(() => Reflect.get(window, "httpReadText") === "fragmento final");
        expect(await page.evaluate(() => Reflect.get(window, "httpReadState"))).toBe("pending");
        expect(response.writableFinished).toBe(false);
        response.end();
        expect(await outcome).toBeNull();
        expect(response.writableFinished).toBe(true);
        expect(await page.evaluate(() => Reflect.get(window, "httpReadState"))).toBe("eof");
        await completeAction.assertComplete();
      } else {
        await page.waitForFunction(() => Reflect.get(window, "httpReadText") === "fragmento");
        expect(await page.evaluate(() => Reflect.get(window, "httpReadState"))).toBe("pending");
        if (mode === "plain") {
          response.end(" final");
          expect(await outcome).toBeNull();
          expect(await page.evaluate(() => Reflect.get(window, "httpReadState"))).toBe("eof");
          expect(await page.evaluate(() => Reflect.get(window, "httpReadText"))).toBe("fragmento final");
          await completeAction.assertComplete();
        } else {
          response.destroy();
          const error = await outcome;
          expect(error).toBeInstanceOf(Error);
          expect(error!.message).toContain("sin EOF válido");
          expect(await page.evaluate(() => Reflect.get(window, "httpReadState"))).toBe("error");
        }
      }
    } finally {
      server.closeAllConnections();
      await new Promise<void>(resolve => server.close(() => resolve()));
    }
  });
}
