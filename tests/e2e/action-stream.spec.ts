import { test, expect } from "@playwright/test";
import { observeBrowserActionStreams } from "./action-stream";

for (const outcome of ["closed", "error"] as const) {
  test(`el observador distingue un stream pendiente de uno ${outcome === "closed" ? "cerrado" : "fallido"}`, async ({ page }) => {
    const events: { state: string; error?: string }[] = [];
    await page.exposeBinding("__iteraReportActionStream", (_source, entry) => { events.push(entry); });
    await page.goto("/iniciar-sesion");
    // Respuesta controlada: el observador no debe consumirla ni cerrarla por sí solo.
    await page.evaluate(() => {
      const body = new ReadableStream({ start(controller) { Reflect.set(window, "actionController", controller); } });
      window.fetch = async () => new Response(body);
    });
    await page.evaluate(observeBrowserActionStreams);
    await page.evaluate(async () => {
      const response = await fetch("/test-action", { method: "POST", headers: { "next-action": "test" } });
      if (response.body!.locked) throw new Error("El observador ha tomado el lector");
      Reflect.set(window, "actionReader", response.body!.getReader());
    });
    await expect.poll(() => events.map(event => event.state)).toEqual(["pending"]);
    // Escribir un fragmento no equivale a llegar al fin del stream.
    await page.evaluate(async () => {
      Reflect.get(window, "actionController").enqueue(new TextEncoder().encode("fragmento"));
      const entry = await Reflect.get(window, "actionReader").read();
      if (entry.done || new TextDecoder().decode(entry.value) !== "fragmento") throw new Error("Lectura alterada");
    });
    expect(events.map(event => event.state)).toEqual(["pending"]);
    await page.evaluate(result => {
      const controller = Reflect.get(window, "actionController");
      if (result === "closed") controller.close();
      else controller.error(new Error("Fallo de lectura controlado"));
    }, outcome);
    if (outcome === "closed") {
      // Cerrar la fuente no basta: React aún debe observar EOF en su lector.
      expect(events.map(event => event.state)).toEqual(["pending"]);
      await page.evaluate(async () => {
        const entry = await Reflect.get(window, "actionReader").read();
        if (!entry.done) throw new Error("No se observó EOF");
      });
    }
    await expect.poll(() => events.map(event => event.state)).toEqual(["pending", outcome]);
    if (outcome === "error") expect(events[1].error).toContain("Fallo de lectura controlado");
  });
}

for (const method of ["reader", "body"] as const) {
  test(`cancelar ${method === "reader" ? "el lector" : "el cuerpo"} no se confunde con EOF`, async ({ page }) => {
    const events: { state: string }[] = [];
    await page.exposeBinding("__iteraReportActionStream", (_source, entry) => { events.push(entry); });
    await page.goto("/iniciar-sesion");
    await page.evaluate(() => {
      window.fetch = async () => new Response(new ReadableStream());
    });
    await page.evaluate(observeBrowserActionStreams);
    await page.evaluate(async target => {
      const response = await fetch("/test-action", { method: "POST", headers: { "next-action": "cancel" } });
      if (target === "reader") {
        const reader = response.body!.getReader();
        const pendingRead = reader.read();
        await reader.cancel("Cancelación controlada");
        await reader.closed;
        if (!(await pendingRead).done) throw new Error("La cancelación no terminó la lectura");
      } else {
        await response.body!.cancel("Cancelación controlada");
        const reader = response.body!.getReader();
        if (!(await reader.read()).done) throw new Error("El cuerpo no está cancelado");
      }
    }, method);
    await expect.poll(() => events.map(event => event.state)).toEqual(["pending", "cancelled"]);
  });
}
