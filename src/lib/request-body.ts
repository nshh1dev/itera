export class RequestBodyTooLarge extends Error {
  constructor() { super("El cuerpo de la solicitud supera el límite permitido."); }
}

// El límite se mide en bytes recibidos, incluso sin Content-Length o si es falso.
export async function readLimitedJson(request: Request, maxBytes: number): Promise<unknown> {
  if (Number(request.headers.get("content-length")) > maxBytes) {
    void request.body?.cancel().catch(() => {});
    throw new RequestBodyTooLarge();
  }
  if (!request.body) throw new SyntaxError("Falta el cuerpo JSON.");
  const reader = request.body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let bytes = 0;
  let text = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > maxBytes) throw new RequestBodyTooLarge();
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
    return JSON.parse(text);
  } catch (error) {
    // No esperar al productor: la cancelación no debe retrasar el rechazo HTTP.
    void reader.cancel().catch(() => {});
    throw error;
  } finally {
    reader.releaseLock();
  }
}
