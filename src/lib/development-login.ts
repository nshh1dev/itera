export function developmentLoginAllowed(request: Request, environment: string | undefined) {
  return environment === "development"
    && ["http://127.0.0.1:3000", "http://localhost:3000"].includes(request.headers.get("origin") || "")
    && request.headers.get("sec-fetch-site") !== "cross-site";
}

export function developmentCredentials(input: unknown): { email: string; password: string } | null {
  if (!input || typeof input !== "object" || !("email" in input) || !("password" in input)) return null;
  if (typeof input.email !== "string" || typeof input.password !== "string") return null;
  const email = input.email.trim().toLowerCase();
  if (!email.includes("@") || email.length > 254 || !input.password.length || input.password.length > 128) return null;
  return { email, password: input.password };
}
