import "dotenv/config";
import { test,expect, type BrowserContext } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Ejercicios reales de principio a fin: lo que escribe una persona se ejecuta en el sandbox
// local y de ahí sale el veredicto, el progreso y la validación editorial. Sin dobles ni stubs.

const db=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL})});
const email=`itera-real-${Date.now()}@example.test`;
const password="Itera-real-local-12345";
const goodSlug=`prueba-real-ok-${Date.now()}`;
const badSlug=`prueba-real-rota-${Date.now()}`;
const piston=process.env.PISTON_URL||"http://127.0.0.1:2000";
let executor=false;
let authCookies: Awaited<ReturnType<BrowserContext["cookies"]>>=[];
test.describe.configure({mode:"serial"});

test.beforeAll(async()=>{
  try{ executor=(await fetch(`${piston}/api/v2/runtimes`,{signal:AbortSignal.timeout(4000)})).ok; }catch{ executor=false; }
  if(!executor) console.log(`Piston no responde en ${piston}; los recorridos reales se omiten.`);
  await mkdir(".local/screenshots",{recursive:true});
});
test.afterAll(async()=>{
  await db.exercise.deleteMany({where:{slug:{in:[goodSlug,badSlug]}}});
  await db.auditLog.deleteMany({where:{user:{email}}});
  await db.user.deleteMany({where:{email}});
  await db.$disconnect();
});
test.beforeEach(()=>{ test.skip(!executor,`requiere Piston en ${piston}`); });

async function solve(page:import("@playwright/test").Page, slug:string, language:"python"|"javascript", code:string){
  await page.goto(`/ejercicios/${slug}?lenguaje=${language}`);
  await page.getByRole("button",{name:"Editor sencillo",exact:true}).click();
  const label=language==="python"?"Editor sencillo de Python":"Editor sencillo de JavaScript";
  await page.getByRole("textbox",{name:label}).fill(code);
}

test("registro y preferencias con el ejecutor real disponible",async({page})=>{
  await page.goto("/registro");
  await page.getByLabel("Tu nombre").fill("Prueba Real");
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña",{exact:true}).fill(password);
  await page.getByRole("button",{name:"Crear mi cuenta"}).click();
  await expect(page.getByRole("heading",{name:"Bienvenido, Prueba."})).toBeVisible();
  await page.getByLabel("Nivel",{exact:true}).selectOption("BEGINNER");
  await page.getByRole("button",{name:"Guardar y empezar"}).click();
  await expect(page.getByText("Tus preferencias están guardadas.")).toBeVisible();
  authCookies=await page.context().cookies();
});

test("el sandbox real aprueba Python y guarda el progreso",async({page})=>{
  await page.context().addCookies(authCookies);
  await solve(page,"par-o-impar","python","def solve(data):\n    return data % 2 == 0\n");
  await page.getByRole("button",{name:"Comprobar solución",exact:true}).click();
  await expect(page.getByText("Un paso más. Ejercicio resuelto.")).toBeVisible({timeout:40000});
  await expect(page.getByText("5 / 5 pruebas")).toBeVisible();
  await expect(page.getByText("3 de 3 pruebas ocultas superadas")).toBeVisible();
  const user=await db.user.findUniqueOrThrow({where:{email}});
  const progress=await db.progress.findMany({where:{userId:user.id}});
  expect(progress).toHaveLength(1);
  expect(progress[0].language).toBe("python");
  expect(progress[0].attempts).toBe(1);
  expect(progress[0].firstPassedAt).not.toBeNull();
  await page.screenshot({path:".local/screenshots/real-workspace-passed.png",fullPage:true});
});

test("un resultado distinto y un bucle infinito no aprueban",async({page})=>{
  await page.context().addCookies(authCookies);
  await solve(page,"contar-vocales","python","def solve(data):\n    return 42\n");
  await page.getByRole("button",{name:"Comprobar solución",exact:true}).click();
  await expect(page.getByText("Tu solución todavía puede mejorar.")).toBeVisible({timeout:40000});
  await expect(page.getByText("Resultado diferente").first()).toBeVisible();
  await solve(page,"contar-vocales","python","def solve(data):\n    while True:\n        pass\n");
  await page.getByRole("button",{name:"Ejecutar ejemplos",exact:true}).click();
  await expect(page.getByText("Límite de tiempo").first()).toBeVisible({timeout:40000});
  const user=await db.user.findUniqueOrThrow({where:{email}});
  expect(await db.progress.count({where:{userId:user.id,language:"python",exercise:{slug:"contar-vocales"},firstPassedAt:{not:null}}})).toBe(0);
});

test("JavaScript registra un progreso independiente del de Python",async({page})=>{
  await page.context().addCookies(authCookies);
  await solve(page,"par-o-impar","javascript","function solve(data) {\n  return data % 2 === 0;\n}\n");
  await page.getByRole("button",{name:"Comprobar solución",exact:true}).click();
  await expect(page.getByText("Un paso más. Ejercicio resuelto.")).toBeVisible({timeout:40000});
  const user=await db.user.findUniqueOrThrow({where:{email}});
  const progress=await db.progress.findMany({where:{userId:user.id,exercise:{slug:"par-o-impar"}}});
  expect(progress.map((p:{language:string})=>p.language).sort()).toEqual(["javascript","python"]);
});

test("el progreso publica el ejercicio como resuelto en el catálogo",async({page})=>{
  await page.context().addCookies(authCookies);
  await page.goto("/ejercicios?lenguaje=python");
  await expect(page.getByText("2 / 24").first()).toBeVisible().catch(()=>{});
  await page.goto("/progreso");
  await expect(page.getByText("Resuelto",{exact:true}).first()).toBeVisible();
});

test("la administración publica tras ejecutar las referencias y rechaza una referencia rota",async({page})=>{
  await db.user.update({where:{email},data:{role:"ADMIN"}});
  await page.context().addCookies(authCookies);
  await page.goto("/admin/ejercicios/nuevo");

  await page.getByLabel("Título",{exact:true}).fill("Suma real de prueba");
  await page.getByLabel("Identificador URL").fill(badSlug);
  await page.getByLabel("Descripción breve").fill("Suma dos valores con una referencia defectuosa a propósito.");
  await page.getByLabel("Objetivo de aprendizaje",{exact:true}).fill("Practicar la suma de dos valores recibidos en un objeto.");
  await page.getByLabel("Conocimientos previos recomendados",{exact:true}).fill("Usar return\nAcceder a propiedades");
  await page.getByLabel("Enunciado",{exact:true}).fill("Recibe un objeto con a y b, y devuelve la suma de ambos valores.");
  await page.getByLabel("Pistas progresivas").fill("Utiliza el operador de suma.");
  await page.getByRole("tab",{name:"Pruebas",exact:true}).click();
  await page.getByLabel("Casos de prueba en JSON").fill(JSON.stringify([{input:{a:3,b:5},expected:8,visible:true},{input:{a:0,b:0},expected:0,visible:true},{input:{a:-2,b:7},expected:5,visible:false}]));
  await page.getByRole("tab",{name:"Python",exact:true}).click();
  await page.locator("#python-solution").fill("def solve(data):\n    return 0");
  await page.locator("#python-explanation").fill("Referencia defectuosa a propósito para comprobar la validación.");
  await page.getByRole("tab",{name:"JavaScript",exact:true}).click();
  await page.locator("#javascript-solution").fill("function solve(data) { return data.a + data.b; }");
  await page.locator("#javascript-explanation").fill("Referencia defectuosa a propósito para comprobar la validación.");
  await page.getByRole("button",{name:"Guardar nueva versión"}).click();
  await expect(page).toHaveURL(new RegExp(`/admin/ejercicios/${badSlug}`));
  await page.getByRole("button",{name:"Validar y publicar versión guardada"}).click();
  await expect(page.getByText(/no supera el caso/)).toBeVisible({timeout:60000});
  expect((await db.exercise.findUniqueOrThrow({where:{slug:badSlug}})).published).toBe(false);

  await page.goto("/admin/ejercicios/nuevo");
  await page.getByLabel("Título",{exact:true}).fill("Suma real correcta");
  await page.getByLabel("Identificador URL").fill(goodSlug);
  await page.getByLabel("Descripción breve").fill("Suma dos valores y valida sus referencias en el sandbox real.");
  await page.getByLabel("Objetivo de aprendizaje",{exact:true}).fill("Practicar la suma de dos valores recibidos en un objeto.");
  await page.getByLabel("Conocimientos previos recomendados",{exact:true}).fill("Usar return\nAcceder a propiedades");
  await page.getByLabel("Enunciado",{exact:true}).fill("Recibe un objeto con a y b, y devuelve la suma de ambos valores.");
  await page.getByLabel("Pistas progresivas").fill("Utiliza el operador de suma.");
  await page.getByRole("tab",{name:"Pruebas",exact:true}).click();
  await page.getByLabel("Casos de prueba en JSON").fill(JSON.stringify([{input:{a:3,b:5},expected:8,visible:true},{input:{a:0,b:0},expected:0,visible:true},{input:{a:-2,b:7},expected:5,visible:false}]));
  await page.getByRole("tab",{name:"Python",exact:true}).click();
  await page.locator("#python-solution").fill("def solve(data):\n    return data['a'] + data['b']");
  await page.locator("#python-explanation").fill("Accede a ambos valores y devuelve la suma. Tiempo constante.");
  await page.getByRole("tab",{name:"JavaScript",exact:true}).click();
  await page.locator("#javascript-solution").fill("function solve(data) { return data.a + data.b; }");
  await page.locator("#javascript-explanation").fill("Accede a ambos valores y devuelve la suma. Tiempo constante.");
  await page.getByRole("button",{name:"Guardar nueva versión"}).click();
  await expect(page).toHaveURL(new RegExp(`/admin/ejercicios/${goodSlug}`));
  expect((await page.request.get(`/ejercicios/${goodSlug}`)).status()).toBe(404);
  await page.getByRole("button",{name:"Validar y publicar versión guardada"}).click();
  await expect.poll(async()=>(await db.exercise.findUniqueOrThrow({where:{slug:goodSlug}})).published,{timeout:60000}).toBe(true);
  expect((await page.request.get(`/ejercicios/${goodSlug}`)).status()).toBe(200);
});
