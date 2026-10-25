import { defineConfig } from "@playwright/test";
import real from "./playwright.real.config";

process.loadEnvFile(".local/docker.env");
process.env.DATABASE_URL = `postgresql://itera:${encodeURIComponent(process.env.DOCKER_DB_PASSWORD ?? "")}@127.0.0.1:55434/itera`;
process.env.PISTON_URL = "http://127.0.0.1:2000";

// La aplicación ya debe estar levantada con Compose. No inicia ni reutiliza
// automáticamente servidores de Windows. DATABASE_URL debe ser la de Docker.
export default defineConfig({
  ...real,
  testDir: "tests",
  testMatch: ["real/**/*.spec.ts", "docker/**/*.spec.ts", "e2e/account.spec.ts", "e2e/motion.spec.ts"],
  webServer: undefined,
});
