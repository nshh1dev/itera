import { defineConfig, devices } from "@playwright/test";

// Permite contrastar avisos de next dev con el build local, sin cambiar el doble
// de Piston ni reutilizar servidores. Preparar antes con npm run build.
const production = process.env.ITERA_E2E_PRODUCTION === "1";

export default defineConfig({
  testDir:"tests/e2e", fullyParallel:false, workers:1, timeout:60000,
  expect:{timeout:15000}, reporter:"list",
  use:{baseURL:"http://127.0.0.1:3000",trace:"retain-on-failure",screenshot:"only-on-failure"},
  projects:[{name:"chromium",use:{...devices["Desktop Chrome"],viewport:{width:1440,height:1000}}}],
  webServer:{command:production ? "npm run start" : "npm run dev",url:"http://127.0.0.1:3000",reuseExistingServer:false,timeout:120000,env:{PISTON_URL:"http://127.0.0.1:2001",NEXT_TELEMETRY_DISABLED:"1"}},
});
