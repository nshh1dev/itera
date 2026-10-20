import { expect, test, type Page, type Request } from "@playwright/test";

type ActionStream = { id: string; url: string; action: string; state: "pending" | "closed" | "error" | "cancelled"; error?: string };

declare global {
  interface Window {
    __iteraReportActionStream: (entry: ActionStream) => Promise<void>;
  }
}

// No clona ni consume datos adicionales. Devuelve el lector y las promesas
// nativas: observa read().done y cancel(), sin convertir cancelación en EOF.
export function observeBrowserActionStreams() {
  const bodies = new WeakMap<ReadableStream, ActionStream>();
  const finish = (entry: ActionStream, state: ActionStream["state"], error?: string) => {
    if (entry.state !== "pending") return;
    entry.state = state;
    entry.error = error;
    void window.__iteraReportActionStream({ ...entry });
  };
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const response = await originalFetch(...args);
    const action = new Headers(args[1]?.headers ?? (args[0] instanceof Request ? args[0].headers : undefined)).get("next-action");
    if (action && response.body) {
      const entry: ActionStream = { id: crypto.randomUUID(), url: response.url || String(args[0]), action, state: "pending" };
      bodies.set(response.body, entry);
      void window.__iteraReportActionStream(entry);
    }
    return response;
  };
  const originalGetReader = ReadableStream.prototype.getReader;
  const originalCancel = ReadableStream.prototype.cancel;
  ReadableStream.prototype.cancel = function (this: ReadableStream, ...args: Parameters<typeof originalCancel>) {
    const locked = this.locked;
    const result = originalCancel.apply(this, args);
    const entry = bodies.get(this);
    if (entry && !locked) finish(entry, "cancelled");
    return result;
  };
  ReadableStream.prototype.getReader = function (this: ReadableStream, ...args: Parameters<typeof originalGetReader>) {
    const reader = originalGetReader.apply(this, args);
    const entry = bodies.get(this);
    if (entry) {
      const originalRead = reader.read;
      reader.read = function (...readArgs: Parameters<typeof originalRead>) {
        const result = Reflect.apply(originalRead, this, readArgs) as ReturnType<typeof originalRead>;
        void result.then(
          value => { if (value.done) finish(entry, "closed"); },
          error => finish(entry, "error", String(error)),
        );
        return result;
      };
      const originalReaderCancel = reader.cancel;
      reader.cancel = function (...cancelArgs: Parameters<typeof originalReaderCancel>) {
        const result = originalReaderCancel.apply(this, cancelArgs);
        finish(entry, "cancelled");
        return result;
      };
      void reader.closed.catch(error => finish(entry, "error", String(error)));
    }
    return reader;
  } as typeof originalGetReader;
}

export async function actionStreamMonitor(page: Page) {
  // Los eventos se conservan en Node incluso si crear un ejercicio navega a su URL.
  const streams = new Map<string, ActionStream>();
  const deliveries = new Map<Request, { streamId: string; status: number }>();
  const responses = new Map<Request, number>();
  const failures = new Map<Request, string>();
  page.on("response", response => {
    const request = response.request();
    if (request.method() === "POST" && request.headers()["next-action"] !== undefined) responses.set(request, response.status());
  });
  page.on("requestfailed", request => {
    if (request.method() === "POST" && request.headers()["next-action"] !== undefined) {
      failures.set(request, request.failure()?.errorText ?? "Petición fallida");
    }
  });
  await page.exposeBinding("__iteraReportActionStream", (_source, entry: ActionStream) => { streams.set(entry.id, entry); });
  await page.addInitScript(observeBrowserActionStreams);
  const complete = async (trigger: () => Promise<unknown>) => {
    const previous = new Set(streams.keys());
    const responsePromise = page.waitForResponse(response => response.request().method() === "POST" && response.request().headers()["next-action"] !== undefined);
    await trigger();
    const response = await responsePromise;
    expect(response.ok()).toBe(true);
    const action = response.request().headers()["next-action"];
    const findStream = () => [...streams.values()].find(entry => !previous.has(entry.id) && entry.url === response.url() && entry.action === action);
    await expect.poll(() => {
      const stream = findStream();
      return stream && stream.state !== "pending" ? stream : undefined;
    }, {
      message: `La acción ${response.url()} debe alcanzar EOF sin error ni cancelación`,
    }).toBeDefined();
    expect(findStream(), `La acción ${response.url()} terminó sin EOF válido`).toMatchObject({ state: "closed" });
    deliveries.set(response.request(), { streamId: findStream()!.id, status: response.status() });
  };
  return Object.assign(complete, {
    async assertComplete() {
      for (const stream of streams.values()) {
        await expect.poll(() => streams.get(stream.id), { message: `Stream incompleto: ${stream.url}` }).toMatchObject({ state: "closed" });
        // También se comprueban las acciones automáticas (continuidad y guardado),
        // aunque no nazcan de un botón envuelto en complete(). Cada respuesta se
        // asigna una sola vez y exige la misma URL y el mismo identificador de acción.
        if (![...deliveries.values()].some(delivery => delivery.streamId === stream.id)) {
          const response = [...responses].find(([request]) => !deliveries.has(request) && request.url() === stream.url && request.headers()["next-action"] === stream.action);
          expect(response, `Sin respuesta HTTP para ${stream.url}`).toBeDefined();
          expect(response![1]).toBeGreaterThanOrEqual(200);
          expect(response![1]).toBeLessThan(300);
          deliveries.set(response![0], { streamId: stream.id, status: response![1] });
        }
        expect([...deliveries.values()].some(delivery => delivery.streamId === stream.id), `Entrega sin comprobar: ${stream.url}`).toBe(true);
      }
      // Se conserva la comprobación de requestfailed: no se permite atribuir un
      // fallo a EOF si no hay una entrega HTTP correcta y observada para ESA petición.
      const diagnostics = [...failures].map(([request, failure]) => {
        const delivery = deliveries.get(request);
        const stream = delivery ? streams.get(delivery.streamId) : undefined;
        expect(delivery, `Petición fallida sin entrega observada: ${request.url()} (${failure})`).toBeDefined();
        expect(delivery!.status).toBeGreaterThanOrEqual(200);
        expect(delivery!.status).toBeLessThan(300);
        expect(stream, `No hubo EOF nativo: ${request.url()} (${failure})`).toMatchObject({ state: "closed" });
        // Solo la cancelación de red tardía conocida puede coexistir con EOF.
        expect(failure).toBe("net::ERR_ABORTED");
        return { url: request.url(), failure, nativeState: stream!.state, status: delivery!.status };
      });
      if (diagnostics.length) await test.info().attach("devtools-aborts-with-native-eof", {
        body: JSON.stringify(diagnostics, null, 2), contentType: "application/json",
      });
    },
  });
}
