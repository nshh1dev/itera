// Itera solo escucha en loopback: todos los clientes comparten el cupo local.
// No confiar en X-Forwarded-For ni en otras cabeceras aportadas por el cliente.
// Un despliegue público deberá definir su propia frontera de proxy confiable.
export const localAuthIpAddress = { ipAddressHeaders: [] as string[] };

// Aplicar también a errores y redirecciones, no solo a la consulta de sesión.
// Recrear Response permite tratar cabeceras inmutables sin tocar cuerpo/cookies.
export function uncachedAuthHandler(handler: (request: Request) => Promise<Response>) {
  return async (request: Request) => {
    const response = await handler(request);
    const headers = new Headers(response.headers);
    headers.set("Cache-Control", "no-store");
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  };
}
