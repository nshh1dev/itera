import { expect, type Page } from "@playwright/test";

type ActionStream = { id: string; url: string; action: string; state: "pending" | "closed" | "error"; error?: string };

declare global {
  interface Window {
    __iteraReportActionStream: (entry: ActionStream) => Promise<void>;
  }
}

// Solo observación: no clona ni consume la respuesta, no cambia read/cancel y
// devuelve el mismo lector que solicita React. reader.closed confirma EOF o error.
export function observeBrowserActionStreams() {
  const bodies = new WeakMap<ReadableStream, ActionStream>();
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
  ReadableStream.prototype.getReader = function (this: ReadableStream, ...args: Parameters<typeof originalGetReader>) {
    const reader = originalGetReader.apply(this, args);
    const entry = bodies.get(this);
    if (entry) {
      void reader.closed.then(
        () => window.__iteraReportActionStream({ ...entry, state: "closed" }),
        error => window.__iteraReportActionStream({ ...entry, state: "error", error: String(error) }),
      );
    }
    return reader;
  } as typeof originalGetReader;
}

export async function actionStreamMonitor(page: Page) {
  // Los eventos se conservan en Node incluso si crear un ejercicio navega a su URL.
  const streams = new Map<string, ActionStream>();
  await page.exposeBinding("__iteraReportActionStream", (_source, entry: ActionStream) => { streams.set(entry.id, entry); });
  await page.addInitScript(observeBrowserActionStreams);
  return async (trigger: () => Promise<unknown>) => {
    const previous = new Set(streams.keys());
    const responsePromise = page.waitForResponse(response => response.request().method() === "POST" && response.request().headers()["next-action"] !== undefined);
    await trigger();
    const response = await responsePromise;
    expect(response.ok()).toBe(true);
    const action = response.request().headers()["next-action"];
    await expect.poll(() => [...streams.values()].find(entry => !previous.has(entry.id) && entry.url === response.url() && entry.action === action), {
      message: `La acción ${response.url()} debe cerrar su lector sin error`,
    }).toMatchObject({ state: "closed" });
  };
}
