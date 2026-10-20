import { learningPaths } from "../src/lib/learning-paths";
import type { Language, Level } from "../src/lib/types";

export const devProfiles: { key: string; name: string; level: Level; languages: Language[]; fractions: number[]; inactive?: boolean; disabled?: boolean; admin?: boolean; practice?: boolean }[] = [
  { key: "nuevo", name: "Nora · Nuevo", level: "INITIATION", languages: ["python"], fractions: [0, 0, 0, 0] },
  { key: "iniciacion", name: "Inés · Iniciación", level: "INITIATION", languages: ["python"], fractions: [.25, 0, 0, 0] },
  { key: "principiante", name: "Pablo · Principiante", level: "BEGINNER", languages: ["python"], fractions: [1, .25, 0, 0] },
  { key: "intermedio", name: "Irene · Intermedio", level: "INTERMEDIATE", languages: ["javascript"], fractions: [.75, .55, .35, 0] },
  { key: "avanzado", name: "Álex · Avanzado", level: "ADVANCED", languages: ["typescript"], fractions: [1, 1, .8, .65] },
  { key: "multilenguaje", name: "Mar · Multilenguaje", level: "INTERMEDIATE", languages: ["python", "javascript", "typescript"], fractions: [.5, .3, .15, 0] },
  { key: "practica", name: "Luca · En práctica", level: "INITIATION", languages: ["javascript"], fractions: [0, 0, 0, 0], practice: true },
  { key: "inactivo", name: "Olivia · Sin actividad reciente", level: "BEGINNER", languages: ["python"], fractions: [.6, .15, 0, 0], inactive: true },
  { key: "desactivado", name: "Dani · Cuenta desactivada", level: "INTERMEDIATE", languages: ["python", "typescript"], fractions: [.5, .2, .1, 0], disabled: true },
  { key: "admin", name: "Ada · Administración", level: "BEGINNER", languages: ["python"], fractions: [.3, .1, 0, 0], admin: true },
];

export function profileSlugs(profile: (typeof devProfiles)[number], language: Language) {
  const offset = profile.languages.indexOf(language);
  return learningPaths.flatMap((path, index) => {
    const slugs = path.slugs ?? [];
    const fraction = Math.max(0, (profile.fractions[index] ?? 0) - offset * .1);
    return slugs.slice(0, Math.floor(slugs.length * fraction));
  });
}

export class DevSeedError extends Error {}

export function assertDevelopmentDatabase(env: Record<string, string | undefined>) {
  if (env.NODE_ENV === "production" || env.ITERA_DEV_USERS !== "1") throw new DevSeedError("Solo desarrollo: establece ITERA_DEV_USERS=1 y no uses NODE_ENV=production.");
  let url: URL;
  try { url = new URL(env.DATABASE_URL ?? ""); }
  catch { throw new DevSeedError("DATABASE_URL debe ser una URL válida de PostgreSQL local."); }
  if (!["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) || !["postgres:", "postgresql:"].includes(url.protocol)) throw new DevSeedError("El seed solo admite un PostgreSQL local. No se modificó ninguna cuenta.");
  // pg permite que parámetros como ?host= sustituyan al servidor de la URL.
  if ([...url.searchParams.keys()].some(key => key !== "sslmode")) throw new DevSeedError("El seed no admite parámetros de conexión adicionales salvo sslmode. Usa una URL local directa.");
  return `${url.hostname}:${url.port || "5432"}${url.pathname}`;
}
