import { setTimeout as backoff } from "node:timers/promises";
import type { APIRequestContext } from "@playwright/test";

// Respeta los límites reales de Better Auth sin desactivar protecciones para E2E.
export async function postAuth(request: APIRequestContext, path: string, data: Record<string, unknown>) {
  const options = { headers: { origin: "http://127.0.0.1:3000" }, data };
  let response = await request.post(path, options);
  for (let retry = 0; response.status() === 429 && retry < 3; retry++) {
    const seconds = Number(response.headers()["retry-after"] ?? 10);
    await backoff((Number.isFinite(seconds) ? Math.max(1, seconds) : 10) * 1000);
    response = await request.post(path, options);
  }
  return response;
}
