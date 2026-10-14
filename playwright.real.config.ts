import { defineConfig, devices } from "@playwright/test";

// Recorridos contra el Piston real (puerto 2000). A diferencia de playwright.config.ts,
// aquí no hay doble HTTP: el código del usuario se ejecuta dentro del sandbox de verdad.
// Requiere `docker compose up -d` y `npm run runner:setup`, y los puertos 3000 y 2000 libres.
export default defineConfig({
  testDir:"tests/real", fullyParallel:false, workers:1, timeout:120000,
  expect:{timeout:20000}, reporter:"list",
  use:{baseURL:"http://127.0.0.1:3000",trace:"retain-on-failure",screenshot:"only-on-failure"},
  projects:[{name:"chromium",use:{...devices["Desktop Chrome"],viewport:{width:1440,height:1000}}}],
  webServer:{command:"npm run dev",url:"http://127.0.0.1:3000",reuseExistingServer:false,timeout:120000,env:{NEXT_TELEMETRY_DISABLED:"1"}},
});