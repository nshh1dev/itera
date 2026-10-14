import "dotenv/config";
import { test,expect, type BrowserContext } from "@playwright/test";
import { createServer, type Server } from "node:http";
import { mkdir, readdir, readFile, unlink } from "node:fs/promises";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { catalogRevision, catalogRevisionDecision, seedVersionContent } from "../../prisma/editorial-revision";
import { actionStreamMonitor } from "./action-stream";

const db=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL})});
const email=`itera-e2e-${Date.now()}@example.test`;
const password="Itera-test-local-12345";
const otherEmail=`other-${email}`;
const editorialSlug=`prueba-editorial-${Date.now()}`;
const revisionSlugs=["suma-de-dos-numeros","sin-duplicados","frecuencia-caracteres","palindromo","anagramas"];
let server:Server;
let providerRequests=0;
let providerOnline=true;
let authCookies: Awaited<ReturnType<BrowserContext["cookies"]>>=[];
test.describe.configure({mode:"serial"});

test.beforeAll(async()=>{
  // Doble de contrato del proveedor, únicamente en el puerto del entorno de pruebas.
  // No ejecuta código y nunca se utiliza por la aplicación normal (Piston real: 2000).
  server=createServer(async(req,res)=>{
    res.setHeader("Content-Type","application/json");
    if(!providerOnline){res.statusCode=503;res.end("{}");return;}
    if(req.url==="/api/v2/runtimes"){res.end(JSON.stringify([{language:"python",version:"3.12.0",aliases:[]},{language:"javascript",version:"22.0.0",aliases:["node","js"]}]));return;}
    if(req.url==="/api/v2/execute"){
      providerRequests++;
      let raw="";for await(const chunk of req)raw+=chunk;
      const payload=JSON.parse(raw);
      const input=JSON.parse(payload.stdin);
      const source=payload.files[1].content as string;
      const correct=source.includes("data['a'] + data['b']")||source.includes("data.a + data.b");
      const output=correct ? input.a+input.b : 999;
      res.end(JSON.stringify({run:{stdout:JSON.stringify(output)+"\n",stderr:"",code:0,signal:null,status:null}}));return;
    }
    res.statusCode=404;res.end("{}");
  });
  await new Promise<void>(resolve=>server.listen(2001,"127.0.0.1",resolve));
  await mkdir(".local/screenshots",{recursive:true});
});
test.afterAll(async()=>{
  await new Promise<void>(resolve=>server.close(()=>resolve()));
  // Borrar únicamente las versiones en borrador creadas por este usuario temporal.
  const revisions=await db.auditLog.findMany({where:{user:{email},action:{in:["exercise.version.imported","exercise.version.created"]}},select:{resource:true}});
  await db.exerciseVersion.deleteMany({where:{id:{in:revisions.map(log=>log.resource)},exercise:{slug:{in:revisionSlugs}},published:false}});
  await db.exercise.deleteMany({where:{slug:editorialSlug}});
  await db.auditLog.deleteMany({where:{user:{email:{in:[email,otherEmail]}}}});
  await db.user.deleteMany({where:{email:{in:[email,otherEmail]}}});
  for(const file of await readdir(".local/mail").catch(()=>[])){
    const content=await readFile(`.local/mail/${file}`,"utf8");
    if(content.startsWith(`Para: ${otherEmail}\n`))await unlink(`.local/mail/${file}`);
  }
  await db.$disconnect();
});

test("catálogo público, filtros y navegación móvil sin desbordamientos",async({page})=>{
  const external:string[]=[];
  page.on("request",req=>{if(!req.url().startsWith("http://127.0.0.1")&&!req.url().startsWith("data:")&&!req.url().startsWith("blob:"))external.push(req.url());});
  await page.goto("/");
  await expect(page.getByRole("heading",{name:/La lógica se aprende/})).toBeVisible();
  await page.goto("/ejercicios");
  await page.getByLabel("Nivel",{exact:true}).selectOption("ADVANCED");
  await page.getByRole("button",{name:"Aplicar filtros"}).click();
  await expect(page.getByText("8 ejercicios",{exact:true})).toBeVisible();
  await page.setViewportSize({width:390,height:844});
  await page.goto("/inicio");
  await expect(page.getByRole("heading",{name:"Un buen día para aprender."})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBeTruthy();
  await page.screenshot({path:".local/screenshots/mobile-home.png",fullPage:true});
  expect(external).toEqual([]);
});

test("registro, preferencias y borrador persistente entre sesiones",async({page})=>{
  await page.goto("/registro");
  await page.getByLabel("Tu nombre").fill("Prueba Itera");
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña",{exact:true}).fill(password);
  await page.getByRole("button",{name:"Crear mi cuenta"}).click();
  await expect(page.getByRole("heading",{name:"Bienvenido, Prueba."})).toBeVisible();
  await page.getByLabel("Nivel",{exact:true}).selectOption("INTERMEDIATE");
  await page.getByRole("button",{name:"Guardar y empezar"}).click();
  await expect(page.getByText("Tus preferencias están guardadas.")).toBeVisible();
  await page.goto("/ejercicios/suma-de-dos-numeros?lenguaje=python");
  await expect(page.locator(".monaco-editor")).toBeVisible();
  await page.getByRole("button",{name:"Editor sencillo",exact:true}).click();
  await page.getByRole("textbox",{name:"Editor sencillo de Python"}).fill("def solve(data):\n    return data['a'] + data['b']\n");
  await expect(page.getByText("Guardado",{exact:true})).toBeVisible();
  await page.goto("/inicio");
  await expect(page.getByText("Continúa donde lo dejaste")).toBeVisible();
  await page.screenshot({path:".local/screenshots/desktop-home.png",fullPage:true});
  await page.getByRole("button",{name:"Cerrar sesión"}).click();
  await page.goto("/iniciar-sesion");
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña",{exact:true}).fill(password);
  await page.getByRole("button",{name:"Iniciar sesión",exact:true}).click();
  await expect(page).toHaveURL(/\/inicio/);
  await page.goto("/ejercicios/suma-de-dos-numeros?lenguaje=python");
  await page.getByRole("button",{name:"Editor sencillo",exact:true}).click();
  await expect(page.getByRole("textbox",{name:"Editor sencillo de Python"})).toHaveValue("def solve(data):\n    return data['a'] + data['b']\n");
  authCookies=await page.context().cookies();
});

test("evaluación asíncrona, pruebas ocultas e idempotencia del progreso",async({page})=>{
  await page.context().addCookies(authCookies);
  await page.goto("/ejercicios/suma-de-dos-numeros?lenguaje=python&ruta=desde-cero");
  await page.getByRole("button",{name:"Ejecutar ejemplos",exact:true}).click();
  await expect(page.getByText("Los ejemplos funcionan.",{exact:true})).toBeVisible();
  const user=await db.user.findUniqueOrThrow({where:{email}});
  expect(await db.progress.count({where:{userId:user.id,firstPassedAt:{not:null}}})).toBe(0);
  await page.getByRole("button",{name:"Comprobar solución",exact:true}).click();
  await expect(page.getByText("Un paso más. Ejercicio resuelto.")).toBeVisible();
  await expect(page.getByText("3 de 3 pruebas ocultas superadas")).toBeVisible();
  // La suma cierra Desde cero: no saltar al siguiente ejercicio del catálogo global.
  await expect(page.getByRole("link",{name:"Continuar con otro ejercicio"})).toHaveCount(0);
  await expect(page.getByRole("link",{name:"Volver a la ruta"})).toHaveAttribute("href","/rutas/desde-cero?lenguaje=python");
  const submission=await db.submission.findFirstOrThrow({where:{userId:user.id,mode:"submit"},orderBy:{createdAt:"desc"}});
  const result=await page.request.get(`/api/executions/${submission.id}`);
  const payload=await result.json();
  for(const hidden of payload.results.filter((r:{visible:boolean})=>!r.visible)){
    expect(hidden).not.toHaveProperty("input");expect(hidden).not.toHaveProperty("expected");expect(hidden).not.toHaveProperty("actual");
  }
  const count=providerRequests;
  const retry=await page.request.post("/api/executions",{headers:{origin:"http://127.0.0.1:3000"},data:{variantId:submission.variantId,code:submission.code,mode:"submit",idempotencyKey:submission.idempotencyKey}});
  expect(retry.status()).toBe(202);expect((await retry.json()).id).toBe(submission.id);
  expect(providerRequests).toBe(count);
  expect((await db.progress.findFirstOrThrow({where:{userId:user.id}})).attempts).toBe(1);
  await page.screenshot({path:".local/screenshots/workspace-light.png",fullPage:true});
  await page.getByRole("button",{name:"Cambiar tema claro u oscuro"}).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(page.locator(".monaco-editor-background").first()).toHaveCSS("background-color","rgb(0, 0, 0)");
  await page.screenshot({path:".local/screenshots/workspace-dark.png",fullPage:true});
  await page.goto("/progreso");
  await expect(page.getByText("Resuelto",{exact:true}).first()).toBeVisible();
});

test("ayudas progresivas, solución explícita y autorización administrativa",async({page})=>{
  await page.context().addCookies(authCookies);
  await page.goto("/ejercicios/par-o-impar");
  await page.getByRole("button",{name:"Un pequeño empujón"}).click();
  await expect(page.getByText("Un número par puede dividirse entre dos sin resto.")).toHaveCount(0);
  await page.getByRole("button",{name:"Descubrir la primera pista"}).click();
  await expect(page.getByText("Un número par puede dividirse entre dos sin resto.")).toBeVisible();
  await page.getByRole("tab",{name:"Solución explicada"}).click();
  await page.getByRole("button",{name:"Ver solución explicada"}).click();
  await expect(page.getByText("return data % 2 == 0",{exact:false})).toBeVisible();
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/inicio/);
  const noOrigin=await page.request.post("/api/executions",{data:{}});
  expect(noOrigin.status()).toBe(403);
});

test("workspace móvil conserva el código al cambiar de panel",async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto("/ejercicios/suma-de-dos-numeros?lenguaje=javascript");
  await page.getByRole("button",{name:"Código",exact:true}).click();
  await page.getByRole("button",{name:"Editor sencillo",exact:true}).click();
  await page.getByRole("textbox",{name:"Editor sencillo de JavaScript"}).fill("function solve(data) { return data.a + data.b; }");
  await page.getByRole("button",{name:"Enunciado",exact:true}).click();
  await page.getByRole("button",{name:"Código",exact:true}).click();
  await expect(page.getByRole("textbox",{name:"Editor sencillo de JavaScript"})).toHaveValue("function solve(data) { return data.a + data.b; }");
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBeTruthy();
  await page.screenshot({path:".local/screenshots/mobile-workspace.png",fullPage:true});
});

test("el borrador detecta cambios de otra pestaña sin sobrescribirlos",async({page,context})=>{
  await page.context().addCookies(authCookies);
  await page.goto("/ejercicios/par-o-impar?lenguaje=python");
  await page.getByRole("button",{name:"Editor sencillo",exact:true}).click();
  const input=page.getByRole("textbox",{name:"Editor sencillo de Python"});
  await input.fill("def solve(data):\n    return data % 2 == 0\n");
  await expect(page.getByText("Guardado",{exact:true})).toBeVisible();
  const second=await context.newPage();
  await second.goto("/ejercicios/par-o-impar?lenguaje=python");
  await second.getByRole("button",{name:"Editor sencillo",exact:true}).click();
  await input.fill("def solve(data):\n    # Primera pestaña\n    return data % 2 == 0\n");
  await expect(page.getByText("Guardado",{exact:true})).toBeVisible();
  await second.getByRole("textbox",{name:"Editor sencillo de Python"}).fill("def solve(data):\n    # Segunda pestaña\n    return False\n");
  await expect(second.getByText(/Este borrador cambió en otra pestaña/)).toBeVisible();
  const draft=await db.draft.findFirstOrThrow({where:{user:{email},variant:{version:{exercise:{slug:"par-o-impar"}}}}});
  expect(draft.code).toContain("Primera pestaña");
  await second.close();
});

test("fallos del proveedor no crean aprobados y los lenguajes tienen progreso independiente",async({page})=>{
  await page.context().addCookies(authCookies);
  await page.goto("/ejercicios/suma-de-dos-numeros?lenguaje=javascript");
  await page.getByRole("button",{name:"Editor sencillo",exact:true}).click();
  await page.getByRole("textbox",{name:"Editor sencillo de JavaScript"}).fill("function solve(data) { return 999; }");
  const user=await db.user.findUniqueOrThrow({where:{email}});
  const before=await db.submission.count({where:{userId:user.id}});
  providerOnline=false;
  try{
    await page.getByRole("button",{name:"Comprobar solución",exact:true}).click();
    await expect(page.getByText("No pudimos ejecutar el programa",{exact:true})).toBeVisible();
    expect(await db.submission.count({where:{userId:user.id}})).toBe(before);
  }finally{providerOnline=true;}
  await page.getByRole("button",{name:"Comprobar solución",exact:true}).click();
  await expect(page.getByText("Tu solución todavía puede mejorar.")).toBeVisible();
  expect(await db.progress.count({where:{userId:user.id,language:"javascript",firstPassedAt:{not:null}}})).toBe(0);
  expect(await db.progress.count({where:{userId:user.id,language:"python",firstPassedAt:{not:null}}})).toBe(1);
});

test("recuperación local, rechazo de roles enviados por cliente y privacidad de intentos",async({page})=>{
  const signup=await page.request.post("/api/auth/sign-up/email",{data:{name:"Otra cuenta",email:otherEmail,password,role:"ADMIN"},headers:{origin:"http://127.0.0.1:3000"}});
  expect(signup.ok()).toBeTruthy();
  expect((await db.user.findUniqueOrThrow({where:{email:otherEmail}})).role).toBe("USER");
  const privateSubmission=await db.submission.findFirstOrThrow({where:{user:{email}}});
  expect((await page.request.get(`/api/executions/${privateSubmission.id}`)).status()).toBe(404);
  await page.request.post("/api/auth/sign-out",{headers:{origin:"http://127.0.0.1:3000"}});
  await page.goto("/recuperar-cuenta");
  await page.getByLabel("Correo electrónico").fill(otherEmail);
  await page.getByRole("button",{name:"Crear enlace de recuperación"}).click();
  await expect(page.getByText("Solicitud recibida.")).toBeVisible();
  let link="";
  for(const file of await readdir(".local/mail")){
    const content=await readFile(`.local/mail/${file}`,"utf8");
    if(content.startsWith(`Para: ${otherEmail}\n`))link=content.match(/http[^\s]+/)?.[0]??"";
  }
  expect(link).toContain("127.0.0.1:3000");
  await page.goto(link);
  await page.getByLabel("Contraseña",{exact:true}).fill(`${password}-nueva`);
  await page.getByRole("button",{name:"Guardar contraseña"}).click();
  await expect(page.getByText("Tu contraseña fue actualizada.")).toBeVisible();
  const old=await page.request.post("/api/auth/sign-in/email",{data:{email:otherEmail,password},headers:{origin:"http://127.0.0.1:3000"}});
  expect(old.ok()).toBeFalsy();
  const fresh=await page.request.post("/api/auth/sign-in/email",{data:{email:otherEmail,password:`${password}-nueva`},headers:{origin:"http://127.0.0.1:3000"}});
  expect(fresh.ok()).toBeTruthy();
});

test("administración guarda borradores privados y publica tras validar las referencias",async({page})=>{
  const completeAction=await actionStreamMonitor(page);
  const actionFailures:string[]=[];
  page.on("requestfailed",request=>{
    if(request.method()==="POST" && request.headers()["next-action"]!==undefined) actionFailures.push(request.failure()?.errorText??"Acción cancelada");
  });
  await db.user.update({where:{email},data:{role:"ADMIN"}});
  await page.context().addCookies(authCookies);
  await page.goto("/admin/ejercicios/nuevo");
  await page.getByLabel("Título",{exact:true}).fill("Suma editorial de prueba");
  await page.getByLabel("Identificador URL").fill(editorialSlug);
  await page.getByLabel("Descripción breve").fill("Suma dos valores para verificar el flujo editorial.");
  const objective="Combinar dos propiedades numéricas para practicar una suma con return.";
  await page.getByLabel("Objetivo de aprendizaje",{exact:true}).fill(objective);
  await page.getByLabel("Conocimientos previos recomendados",{exact:true}).fill("  Usar return  \nAcceder a propiedades\n\n");
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
  await completeAction(()=>page.getByRole("button",{name:"Guardar nueva versión"}).click());
  await expect(page).toHaveURL(new RegExp(`/admin/ejercicios/${editorialSlug}`));
  const firstVersion=await db.exerciseVersion.findFirstOrThrow({where:{exercise:{slug:editorialSlug}},orderBy:{number:"desc"}});
  expect(firstVersion.objective).toBe(objective);
  expect(firstVersion.prerequisites).toEqual(["Usar return","Acceder a propiedades"]);
  expect((await page.request.get(`/ejercicios/${editorialSlug}`)).status()).toBe(404);
  await completeAction(()=>page.getByRole("button",{name:"Validar y publicar versión guardada"}).click());
  await expect.poll(async()=>(await db.exercise.findUniqueOrThrow({where:{slug:editorialSlug}})).published).toBe(true);
  expect((await page.request.get(`/ejercicios/${editorialSlug}`)).status()).toBe(200);
  await page.goto(`/ejercicios/${editorialSlug}?lenguaje=python`);
  const guide=page.getByRole("region",{name:"Guía de aprendizaje"});
  await expect(guide.getByText(objective,{exact:true})).toBeVisible();
  await expect(guide.getByText("Acceder a propiedades",{exact:true})).toBeVisible();
  await expect(guide.getByText(/no bloqueos/)).toBeVisible();
  await expect(page.getByRole("button",{name:"Comprobar solución",exact:true})).toBeEnabled();
  await page.getByLabel("Lenguaje del ejercicio").selectOption("javascript");
  await expect(guide.getByText(objective,{exact:true})).toBeVisible();
  // Un objetivo nuevo en borrador no se filtra al catálogo ni reescribe el anterior.
  await page.goto(`/admin/ejercicios/${editorialSlug}`);
  const draftObjective="Practicar una revisión distinta que todavía no debe verse públicamente.";
  await page.getByLabel("Objetivo de aprendizaje",{exact:true}).fill(draftObjective);
  await page.getByLabel("Conocimientos previos recomendados",{exact:true}).fill("Operaciones numéricas");
  await completeAction(()=>page.getByRole("button",{name:"Guardar nueva versión",exact:true}).click());
  await expect.poll(async()=>(await db.exerciseVersion.findFirstOrThrow({where:{exercise:{slug:editorialSlug}},orderBy:{number:"desc"}})).objective).toBe(draftObjective);
  const preserved=await db.exerciseVersion.findUniqueOrThrow({where:{id:firstVersion.id}});
  expect(preserved.objective).toBe(objective);
  expect(preserved.prerequisites).toEqual(["Usar return","Acceder a propiedades"]);
  await page.goto(`/ejercicios/${editorialSlug}`);
  await expect(guide.getByText(objective,{exact:true})).toBeVisible();
  await expect(guide.getByText(draftObjective,{exact:true})).toHaveCount(0);
  await page.goto(`/admin/ejercicios/${editorialSlug}`);
  await expect(page.getByLabel("Objetivo de aprendizaje",{exact:true})).toHaveValue(draftObjective);
  await page.getByLabel("Objetivo de aprendizaje",{exact:true}).fill(`${draftObjective} Tercer guardado.`);
  await completeAction(()=>page.getByRole("button",{name:"Guardar nueva versión",exact:true}).click());
  expect(await db.exerciseVersion.count({where:{exercise:{slug:editorialSlug}}})).toBe(3);
  await completeAction(()=>page.getByRole("button",{name:"Ocultar del catálogo"}).click());
  await expect(page.getByText("Ejercicio oculto del catálogo.")).toBeVisible();
  expect((await page.request.get(`/ejercicios/${editorialSlug}`)).status()).toBe(404);
  expect(actionFailures).toEqual([]);
});

for(const revisionSlug of revisionSlugs){
test(`la revisión de ${revisionSlug} es privada, idempotente y respeta borradores editoriales`,async({page})=>{
  const completeAction=await actionStreamMonitor(page);
  await page.context().addCookies(authCookies);
  const exercise=await db.exercise.findUniqueOrThrow({where:{slug:revisionSlug},include:{versions:{orderBy:{number:"desc"},take:1,include:{variants:{include:{tests:true}}}}}});
  const previous=exercise.versions[0];
  const count=await db.exerciseVersion.count({where:{exerciseId:exercise.id}});
  const source=seedVersionContent(catalogRevision(exercise.slug)!);
  const decision=catalogRevisionDecision(previous,source,previous.id);
  const requests=providerRequests;
  await page.goto(`/admin/ejercicios/${exercise.slug}`);
  async function prepare(){
    await page.getByRole("button",{name:"Preparar revisión didáctica",exact:true}).click();
    await completeAction(()=>page.getByRole("button",{name:"Crear borrador didáctico",exact:true}).click());
  }
  await prepare();
  if(decision==="draft"){
    await expect(page.getByRole("status")).toContainText("Ya existe un borrador editorial distinto");
    expect(await db.exerciseVersion.count({where:{exerciseId:exercise.id}})).toBe(count);
    return; // No modificar un borrador previo del propietario.
  }
  if(decision==="create")await expect(page.getByRole("status")).toContainText("preparada en borrador");
  else await expect(page.getByRole("status")).toContainText("ya contiene esta revisión");
  const latest=await db.exerciseVersion.findFirstOrThrow({where:{exerciseId:exercise.id},orderBy:{number:"desc"},include:{variants:{include:{tests:true}}}});
  expect(catalogRevisionDecision(latest,source,latest.id)).toBe("unchanged");
  expect(await db.exerciseVersion.count({where:{exerciseId:exercise.id}})).toBe(count+(decision==="create"?1:0));
  if(decision==="create")expect(latest.published).toBe(false);
  expect(await db.exerciseVersion.findUniqueOrThrow({where:{id:previous.id},include:{variants:{include:{tests:true}}}})).toEqual(previous);
  const published=await db.exerciseVersion.findFirstOrThrow({where:{exerciseId:exercise.id,published:true},orderBy:{number:"desc"}});
  await page.goto(`/ejercicios/${exercise.slug}?lenguaje=python`);
  await expect(page.locator('section[aria-label="Enunciado"] > p').first()).toHaveText(published.statement);
  await page.goto(`/admin/ejercicios/${exercise.slug}`);
  await prepare();
  await expect(page.getByRole("status")).toContainText("ya contiene esta revisión");
  expect(await db.exerciseVersion.count({where:{exerciseId:exercise.id}})).toBe(count+(decision==="create"?1:0));
  // Un guardado manual posterior debe impedir que una importación lo sobrepase.
  await page.locator("#description").fill("Borrador temporal para verificar que se conserva el trabajo editorial manual.");
  await completeAction(()=>page.getByRole("button",{name:"Guardar nueva versión",exact:true}).click());
  await expect.poll(async()=>db.exerciseVersion.count({where:{exerciseId:exercise.id}})).toBe(count+(decision==="create"?2:1));
  await page.reload();
  await prepare();
  await expect(page.getByRole("status")).toContainText("Ya existe un borrador editorial distinto");
  expect(await db.exerciseVersion.count({where:{exerciseId:exercise.id}})).toBe(count+(decision==="create"?2:1));
  expect(providerRequests).toBe(requests); // Preparar no publica ni ejecuta referencias.
});
}
