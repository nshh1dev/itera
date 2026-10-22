import { readFile } from "node:fs/promises";
import { auth } from "@/server/auth";
import { developmentCredentials, developmentLoginAllowed } from "@/lib/development-login";

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") return new Response(null, { status: 404 });
  if (!developmentLoginAllowed(request, process.env.NODE_ENV)) return new Response(null, { status: 403 });
  let credentials;
  try {
    credentials = developmentCredentials(JSON.parse(await readFile(".local/dev-login/credentials.json", "utf8")));
  } catch { /* No devolver rutas locales ni el contenido de las credenciales. */ }
  if (!credentials) return Response.json({ message: "Configura el acceso local en .local/dev-login/credentials.json y vuelve a intentarlo." }, { status: 503 });

  // El handler normal conserva contraseña, cookies, cuenta desactivada y límite de intentos.
  const headers = new Headers(request.headers);
  headers.set("content-type", "application/json");
  headers.delete("content-length");
  const response = await auth.handler(new Request(new URL("/api/auth/sign-in/email", request.url), {
    method: "POST", headers, body: JSON.stringify(credentials),
  }));
  const responseHeaders = new Headers(response.headers);
  responseHeaders.set("cache-control", "no-store");
  responseHeaders.delete("content-type");
  responseHeaders.delete("content-length");
  // Al navegador solo le hacen falta el estado y la cookie HttpOnly, no el token JSON.
  return new Response(null, { status: response.status, headers: responseHeaders });
}
