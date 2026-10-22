import "dotenv/config";
import { test,expect, type BrowserContext } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { languageNames, type Language } from "../../src/lib/types";
import { openSimpleEditor } from "../workspace";

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

async function solve(page:import("@playwright/test").Page, slug:string, language:Language, code:string){
  await page.goto(`/ejercicios/${slug}?lenguaje=${language}`);
  await openSimpleEditor(page);
  const label=`Editor sencillo de ${languageNames[language]}`;
  await page.getByRole("textbox",{name:label}).fill(code);
}

test("registro y preferencias con el ejecutor real disponible",async({page})=>{
  await page.goto("/registro");
  await page.getByLabel("Tu nombre").fill("Prueba Real");
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña",{exact:true}).fill(password);
  await page.getByRole("button",{name:"Crear cuenta",exact:true}).click();
  await expect(page.getByRole("heading",{name:"Bienvenido, Prueba."})).toBeVisible();
  await page.getByLabel("Nivel",{exact:true}).selectOption("BEGINNER");
  await page.getByLabel("Lenguaje preferido",{exact:true}).selectOption("typescript");
  await page.getByRole("button",{name:"Guardar y empezar"}).click();
  await expect(page.getByText("Tus preferencias están guardadas.")).toBeVisible();
  authCookies=await page.context().cookies();
});

test("el sandbox real aprueba Python y guarda el progreso",async({page})=>{
  await page.context().addCookies(authCookies);
  await solve(page,"logica-dos-requisitos","python","def solve(data):\n    return data % 3 == 0 and data % 5 == 0\n");
  await page.getByRole("button",{name:"Comprobar solución",exact:true}).click();
  await expect(page.getByText("Un paso más. Ejercicio resuelto.")).toBeVisible({timeout:40000});
  const caseCount = await db.testCase.count({ where: { variant: { language: "python", version: { published: true, exercise: { slug: "logica-dos-requisitos" } } } } });
  await expect(page.getByText(`${caseCount} / ${caseCount} pruebas`)).toBeVisible();
  await expect(page.getByText(`${caseCount - 2} de ${caseCount - 2} pruebas ocultas superadas`)).toBeVisible();
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
  await solve(page,"logica-vocales","python","def solve(data):\n    return 42\n");
  await page.getByRole("button",{name:"Comprobar solución",exact:true}).click();
  await expect(page.getByText("Tu solución todavía puede mejorar.")).toBeVisible({timeout:40000});
  await expect(page.getByText("Resultado diferente").first()).toBeVisible();
  await solve(page,"logica-vocales","python","def solve(data):\n    while True:\n        pass\n");
  await page.getByRole("button",{name:"Ejecutar ejemplos",exact:true}).click();
  await expect(page.getByText("Límite de tiempo").first()).toBeVisible({timeout:40000});
  const user=await db.user.findUniqueOrThrow({where:{email}});
  expect(await db.progress.count({where:{userId:user.id,language:"python",exercise:{slug:"logica-vocales"},firstPassedAt:{not:null}}})).toBe(0);
});

test("JavaScript registra un progreso independiente del de Python",async({page})=>{
  await page.context().addCookies(authCookies);
  await solve(page,"logica-dos-requisitos","javascript","function solve(data) {\n  return data % 3 === 0 && data % 5 === 0;\n}\n");
  await page.getByRole("button",{name:"Comprobar solución",exact:true}).click();
  await expect(page.getByText("Un paso más. Ejercicio resuelto.")).toBeVisible({timeout:40000});
  const user=await db.user.findUniqueOrThrow({where:{email}});
  const progress=await db.progress.findMany({where:{userId:user.id,exercise:{slug:"logica-dos-requisitos"}}});
  expect(progress.map((p:{language:string})=>p.language).sort()).toEqual(["javascript","python"]);
});

test("TypeScript rechaza errores de tipos sin conceder progreso y luego aprueba una función",async({page})=>{
  await page.context().addCookies(authCookies);
  await solve(page,"logica-opcional","typescript",'function solve(data: {cantidad?: number}): number { const incorrecto: number = "error"; return data.cantidad ?? 1; }');
  await page.getByRole("button",{name:"Comprobar solución",exact:true}).click();
  await expect(page.getByText("Error de ejecución").first()).toBeVisible({timeout:60000});
  await page.getByRole("button",{name:"Detalle del error",exact:true}).first().click();
  await expect(page.getByText(/TS2322/).first()).toBeVisible();
  const user=await db.user.findUniqueOrThrow({where:{email}});
  expect(await db.progress.count({where:{userId:user.id,language:"typescript",firstPassedAt:{not:null}}})).toBe(0);
  const submission=await db.submission.findFirstOrThrow({where:{userId:user.id,variant:{language:"typescript"}},orderBy:{createdAt:"desc"}});
  const response=await page.request.get(`/api/executions/${submission.id}`);
  for(const hidden of (await response.json()).results.filter((result:{visible:boolean})=>!result.visible)) {
    expect(hidden).not.toHaveProperty("input"); expect(hidden).not.toHaveProperty("expected");
    expect(hidden).not.toHaveProperty("error"); expect(hidden).not.toHaveProperty("output");
  }
  await page.getByRole("textbox",{name:"Editor sencillo de TypeScript",exact:true}).fill('function solve(data: {cantidad?: number}): number { return data.cantidad ?? 1; }');
  await page.getByRole("button",{name:"Comprobar solución",exact:true}).click();
  await expect(page.getByText("Un paso más. Ejercicio resuelto.")).toBeVisible({timeout:60000});
  expect(await db.progress.count({where:{userId:user.id,language:"typescript",exercise:{slug:"logica-opcional"},firstPassedAt:{not:null}}})).toBe(1);
});

test("TypeScript ejecuta un programa completo con entrada y salida",async({page})=>{
  await page.context().addCookies(authCookies);
  await solve(page,"logica-lee-suma","typescript","const lineas: string[] = require('fs').readFileSync(0, 'utf8').trim().split('\\n');\nconsole.log(Number(lineas[0]) + Number(lineas[1]));");
  await page.getByRole("button",{name:"Comprobar solución",exact:true}).click();
  await expect(page.getByText("Un paso más. Ejercicio resuelto.")).toBeVisible({timeout:60000});
  const user=await db.user.findUniqueOrThrow({where:{email}});
  expect(await db.progress.count({where:{userId:user.id,language:"typescript",exercise:{slug:"logica-lee-suma"},firstPassedAt:{not:null}}})).toBe(1);
});

test("el progreso publica el ejercicio como resuelto en el catálogo",async({page})=>{
  await page.context().addCookies(authCookies);
  await page.goto("/ejercicios?lenguaje=python&estado=resueltos");
  await expect(page.locator('a[href="/ejercicios/logica-dos-requisitos?lenguaje=python"]').getByText("Resuelto",{exact:true})).toBeVisible();
  await page.goto("/progreso?lenguaje=python");
  await expect(page.getByRole("button",{name:/Comprueba dos requisitos simultáneos Resuelto/})).toBeVisible();
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
  await page.getByLabel("Qué vas a practicar",{exact:true}).fill("Sumar las propiedades de una entrada agrupada.");
  await page.getByLabel("Enunciado",{exact:true}).fill("Recibe un objeto con a y b, y devuelve la suma de ambos valores.");
  await page.getByLabel("Pistas progresivas").fill("Necesitas combinar dos valores.\nObtén ambos por su nombre.\nUtiliza el operador de suma para combinarlos.");
  await page.getByRole("tab",{name:"Pruebas",exact:true}).click();
  await page.getByLabel("Casos de prueba en JSON").fill(JSON.stringify([{input:{a:3,b:5},expected:8,visible:true},{input:{a:0,b:0},expected:0,visible:true},{input:{a:-2,b:7},expected:5,visible:false}]));
  await page.getByRole("tab",{name:"Python",exact:true}).click();
  await page.locator("#python-solution").fill("def solve(data):\n    return 0");
  await page.locator("#python-explanation").fill("Referencia defectuosa a propósito para comprobar la validación.");
  await page.getByRole("tab",{name:"JavaScript",exact:true}).click();
  await page.locator("#javascript-solution").fill("function solve(data) { return data.a + data.b; }");
  await page.locator("#javascript-explanation").fill("Referencia defectuosa a propósito para comprobar la validación.");
  await page.getByRole("tab",{name:"TypeScript",exact:true}).click();
  await page.locator("#typescript-starter").fill("function solve(data: {a: number; b: number}): number { return 0; }");
  await page.locator("#typescript-solution").fill("function solve(data: {a: number; b: number}): number { return data.a + data.b; }");
  await page.locator("#typescript-explanation").fill("El contrato describe una entrada con dos propiedades numéricas y un retorno numérico.");
  await page.locator("#typescript-typeContract").fill("const __iteraContract: (data: {a: number; b: number}) => number = solve;");
  await page.getByRole("button",{name:"Guardar versión"}).click();
  await expect(page).toHaveURL(new RegExp(`/admin/ejercicios/${badSlug}`));
  await page.getByRole("button",{name:"Validar y publicar",exact:true}).click();
  await page.getByRole("button",{name:"Validar y publicar",exact:true}).click();
  await expect(page.getByText(/no supera el caso/)).toBeVisible({timeout:60000});
  expect((await db.exercise.findUniqueOrThrow({where:{slug:badSlug}})).published).toBe(false);

  await page.goto("/admin/ejercicios/nuevo");
  await page.getByLabel("Título",{exact:true}).fill("Suma real correcta");
  await page.getByLabel("Identificador URL").fill(goodSlug);
  await page.getByLabel("Descripción breve").fill("Suma dos valores y valida sus referencias en el sandbox real.");
  await page.getByLabel("Objetivo de aprendizaje",{exact:true}).fill("Practicar la suma de dos valores recibidos en un objeto.");
  await page.getByLabel("Conocimientos previos recomendados",{exact:true}).fill("Usar return\nAcceder a propiedades");
  await page.getByLabel("Qué vas a practicar",{exact:true}).fill("Sumar las propiedades de una entrada agrupada.");
  await page.getByLabel("Enunciado",{exact:true}).fill("Recibe un objeto con a y b, y devuelve la suma de ambos valores.");
  await page.getByLabel("Pistas progresivas").fill("Necesitas combinar dos valores.\nObtén ambos por su nombre.\nUtiliza el operador de suma para combinarlos.");
  await page.getByRole("tab",{name:"Pruebas",exact:true}).click();
  await page.getByLabel("Casos de prueba en JSON").fill(JSON.stringify([{input:{a:3,b:5},expected:8,visible:true},{input:{a:0,b:0},expected:0,visible:true},{input:{a:-2,b:7},expected:5,visible:false}]));
  await page.getByRole("tab",{name:"Python",exact:true}).click();
  await page.locator("#python-solution").fill("def solve(data):\n    return data['a'] + data['b']");
  await page.locator("#python-explanation").fill("Accede a ambos valores y devuelve la suma. Tiempo constante.");
  await page.getByRole("tab",{name:"JavaScript",exact:true}).click();
  await page.locator("#javascript-solution").fill("function solve(data) { return data.a + data.b; }");
  await page.locator("#javascript-explanation").fill("Accede a ambos valores y devuelve la suma. Tiempo constante.");
  await page.getByRole("tab",{name:"TypeScript",exact:true}).click();
  await page.locator("#typescript-starter").fill("function solve(data: {a: number; b: number}): number { return 0; }");
  await page.locator("#typescript-solution").fill("function solve(data: {a: number; b: number}): number { return data.a + data.b; }");
  await page.locator("#typescript-explanation").fill("El contrato describe una entrada con dos propiedades numéricas y un retorno numérico.");
  await page.locator("#typescript-typeContract").fill("const __iteraContract: (data: {a: number; b: number}) => number = solve;");
  await page.getByRole("button",{name:"Guardar versión"}).click();
  await expect(page).toHaveURL(new RegExp(`/admin/ejercicios/${goodSlug}`));
  expect((await page.request.get(`/ejercicios/${goodSlug}`)).status()).toBe(404);
  await page.getByRole("button",{name:"Validar y publicar",exact:true}).click();
  await page.getByRole("button",{name:"Validar y publicar",exact:true}).click();
  await expect.poll(async()=>(await db.exercise.findUniqueOrThrow({where:{slug:goodSlug}})).published,{timeout:60000}).toBe(true);
  expect((await page.request.get(`/ejercicios/${goodSlug}`)).status()).toBe(200);
});
