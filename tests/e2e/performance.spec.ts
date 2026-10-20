import { mkdir, writeFile } from "node:fs/promises";
import { test, expect } from "@playwright/test";

test("el movimiento no multiplica suscripciones ni redimensiona el editor por fotograma", async ({ page }) => {
  await page.addInitScript(() => {
    const native = window.matchMedia.bind(window);
    const stats = { calls: 0, listeners: 0 };
    Object.assign(window, { __motionStats: stats });
    window.matchMedia = query => {
      const media = native(query);
      if (!query.includes("prefers-reduced-motion")) return media;
      stats.calls++;
      const add = media.addEventListener.bind(media);
      const remove = media.removeEventListener.bind(media);
      const listeners = new Set<EventListenerOrEventListenerObject>();
      media.addEventListener = (type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions) => {
        if (type === "change" && listener && !listeners.has(listener)) { listeners.add(listener); stats.listeners++; }
        if (listener) add(type, listener, options);
      };
      media.removeEventListener = (type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | EventListenerOptions) => {
        if (type === "change" && listener && listeners.delete(listener)) stats.listeners--;
        if (listener) remove(type, listener, options);
      };
      return media;
    };
  });
  await page.goto("/ejercicios/logica-dos-parametros?lenguaje=python");
  const editor = page.locator(".monaco-editor");
  await expect(editor).toBeVisible();
  await expect(page.getByRole("button", { name: "Expandir navegación", exact: true })).toBeVisible();
  await page.locator(".editor-region").evaluate(node => {
    const metrics = { changes: 0 };
    const observer = new ResizeObserver(() => metrics.changes++);
    observer.observe(node);
    Object.assign(window, { __editorResize: { metrics, observer } });
  });
  await page.getByRole("button", { name: "Expandir navegación", exact: true }).click();
  await expect(page.locator(".app-sidebar")).toHaveCSS("width", "224px");
  const metrics = await page.evaluate(async () => {
    for (let frame = 0; frame < 4; frame++) await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    const state = window as unknown as {
      __motionStats: { calls: number; listeners: number };
      __editorResize: { metrics: { changes: number }; observer: ResizeObserver };
    };
    state.__editorResize.observer.disconnect();
    const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
    return {
      ...state.__motionStats,
      editorResizes: state.__editorResize.metrics.changes,
      domNodes: document.querySelectorAll("*").length,
      scriptBytes: resources.filter(resource => resource.initiatorType === "script").reduce((total, resource) => total + resource.transferSize, 0),
    };
  });
  console.log("Medición de movimiento:", JSON.stringify(metrics));
  expect(metrics.listeners).toBeLessThanOrEqual(4);
  expect(metrics.calls).toBeLessThanOrEqual(6);
  expect(metrics.editorResizes).toBeLessThanOrEqual(3);
  await mkdir(".local/performance", { recursive: true });
  await writeFile(`.local/performance/motion-${process.env.ITERA_PERF_LABEL ?? "actual"}.json`, JSON.stringify(metrics, null, 2));
  await expect(editor).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: "Ver pistas", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Pistas y solución" })).toHaveCSS("transform", "none");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
