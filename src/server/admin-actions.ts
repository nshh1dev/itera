"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "./auth";
import { db } from "./db";
import { Prisma } from "@/generated/prisma/client";
import { levels, type Json, type Language } from "@/lib/types";
import { availableRuntime, runCode, RunnerUnavailable } from "./execution/piston";
import { judge } from "./execution/judge";
import { catalogRevision, catalogRevisionDecision, seedVersionContent } from "../../prisma/editorial-revision";

const variantSchema = z.object({ starter: z.string().min(1).max(30000), solution: z.string().min(1).max(30000), explanation: z.string().min(10).max(5000) });
const schema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100),
  title: z.string().trim().min(3).max(100), description: z.string().trim().min(10).max(300),
  statement: z.string().trim().min(20).max(8000), category: z.enum(["Fundamentos", "Cadenas", "Arreglos", "Algoritmos"]),
  level: z.enum(levels), minutes: z.number().int().min(1).max(180),
  hints: z.array(z.string().min(5).max(1000)).min(1).max(5),
  constraints: z.array(z.string().min(1).max(500)).min(1).max(10),
  python: variantSchema, javascript: variantSchema,
  tests: z.array(z.object({ input: z.json(), expected: z.json(), visible: z.boolean() })).min(3).max(10),
}).refine(data => data.tests.some(t=>t.visible) && data.tests.some(t=>!t.visible), "Incluye pruebas visibles y ocultas.");

export async function saveExercise(input: unknown) {
  const user = await requireAdmin();
  if (JSON.stringify(input).length > 180000) return { error: "El contenido es demasiado grande." };
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues.map(issue=>`${issue.path.join(".")}: ${issue.message}`).slice(0,3).join(" · ") };
  const data = parsed.data;
  try {
    await db.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(742902)`;
      let exercise = await tx.exercise.findUnique({ where: { slug: data.slug }, include: { versions: { orderBy: { number:"desc" }, take:1 } } });
      if (!exercise) {
        const order = await tx.exercise.aggregate({ _max: { order:true } });
        exercise = await tx.exercise.create({ data: { slug:data.slug, category:data.category, order:(order._max.order ?? -1)+1, published:false }, include:{versions:true} });
      }
      const version = await tx.exerciseVersion.create({ data: {
        exerciseId:exercise.id, number:(exercise.versions[0]?.number ?? 0)+1, title:data.title, description:data.description,
        statement:data.statement, level:data.level, minutes:data.minutes, hints:data.hints, constraints:data.constraints,
        variants:{create:(["python","javascript"] as const).map(language=>({language,...data[language],tests:{create:data.tests.map((test,order)=>({input:test.input===null?Prisma.JsonNull:test.input,expected:test.expected===null?Prisma.JsonNull:test.expected,visible:test.visible,order}))}}))},
      } });
      // La categoría pertenece a la identidad editorial; el contenido publicado sigue inmutable.
      if (!exercise.published) await tx.exercise.update({where:{id:exercise.id},data:{category:data.category}});
      await tx.auditLog.create({data:{userId:user.id,action:"exercise.version.created",resource:version.id}});
    });
    revalidatePath("/admin"); revalidatePath(`/admin/ejercicios/${data.slug}`);
    return {slug:data.slug};
  } catch { return {error:"No pudimos guardar esta versión. Comprueba la conexión e inténtalo de nuevo."}; }
}

export async function publishExerciseVersion(versionId: string) {
  const user = await requireAdmin();
  if (!z.string().min(1).max(100).safeParse(versionId).success) return {error:"Versión inválida."};
  const version = await db.exerciseVersion.findUnique({where:{id:versionId},include:{variants:{include:{tests:{orderBy:{order:"asc"}}}}}});
  if (!version || version.variants.length !== 2) return {error:"Faltan las variantes de lenguaje."};
  try {
    for (const variant of version.variants) {
      if (!variant.tests.some(t=>t.visible) || !variant.tests.some(t=>!t.visible)) return {error:"Incluye pruebas visibles y ocultas antes de publicar."};
      const runtime = await availableRuntime(variant.language as Language);
      for (const test of variant.tests) {
        const output = await runCode(variant.language as Language,runtime,variant.solution,test.input as Json);
        if (!judge(output,{...test,input:test.input as Json,expected:test.expected as Json}).passed) return {error:`La solución de referencia de ${variant.language} no supera el caso ${test.order+1}. Revisa el contenido y guarda una nueva versión.`};
      }
    }
    await db.$transaction([
      db.exerciseVersion.update({where:{id:version.id},data:{published:true}}),
      db.exercise.update({where:{id:version.exerciseId},data:{published:true}}),
      db.auditLog.create({data:{userId:user.id,action:"exercise.version.published",resource:version.id}}),
    ]);
    revalidatePath("/", "layout"); return {success:true};
  } catch(error) { return {error:error instanceof RunnerUnavailable ? error.message : "No se pudo completar la validación. La versión sigue guardada."}; }
}

export async function hideExercise(id: string) {
  const user = await requireAdmin();
  if (!z.string().min(1).max(100).safeParse(id).success) return {error:"Ejercicio inválido."};
  await db.$transaction([db.exercise.update({where:{id},data:{published:false}}),db.auditLog.create({data:{userId:user.id,action:"exercise.hidden",resource:id}})]);
  revalidatePath("/", "layout"); return {success:true};
}

export async function prepareCatalogRevision(input: unknown) {
  const user = await requireAdmin();
  const parsed = z.object({ slug: z.string().min(1).max(100), versionId: z.string().min(1).max(100) }).safeParse(input);
  if (!parsed.success) return { error: "La solicitud de actualización no es válida." };
  const source = catalogRevision(parsed.data.slug);
  if (!source) return { error: "Este ejercicio no tiene una revisión didáctica del catálogo." };
  const content = seedVersionContent(source);
  const variant = (language: string) => content.variants.find(item => item.language === language)!;
  const validated = schema.safeParse({ ...source, python: variant("python"), javascript: variant("javascript"), tests: content.variants[0].tests });
  if (!validated.success) return { error: "La revisión del catálogo no supera la validación editorial. No se ha guardado nada." };
  const data = validated.data;
  try {
    const result = await db.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(742902)`;
      const exercise = await tx.exercise.findUnique({ where: { slug: data.slug }, include: {
        versions: { orderBy: { number: "desc" }, take: 1, include: { variants: { include: { tests: true } } } },
      } });
      const current = exercise?.versions[0];
      if (!exercise || !current) return { error: "El ejercicio ya no está disponible." };
      const decision = catalogRevisionDecision(current, content, parsed.data.versionId);
      if (decision === "unchanged") return { created: false, number: current.number };
      if (decision === "stale") return { error: "La versión cambió en otra pestaña. Recarga antes de preparar la actualización." };
      if (decision === "draft") return { error: "Ya existe un borrador editorial distinto. Revísalo antes de importar otra versión; no hemos modificado nada." };
      const version = await tx.exerciseVersion.create({ data: {
        exerciseId: exercise.id, number: current.number + 1, published: false,
        title: data.title, description: data.description, statement: data.statement, constraints: data.constraints,
        hints: data.hints, level: data.level, minutes: data.minutes,
        variants: { create: (["python", "javascript"] as const).map(language => ({
          language, ...data[language], tests: { create: data.tests.map((test, order) => ({
            order, visible: test.visible, input: test.input === null ? Prisma.JsonNull : test.input, expected: test.expected === null ? Prisma.JsonNull : test.expected,
          })) },
        })) },
      } });
      await tx.auditLog.create({ data: { userId: user.id, action: "exercise.version.imported", resource: version.id } });
      return { created: true, number: version.number };
    });
    if ("error" in result) return result;
    if (result.created) revalidatePath("/admin");
    revalidatePath(`/admin/ejercicios/${data.slug}`);
    return result;
  } catch {
    return { error: "No pudimos preparar el borrador. Las versiones anteriores no se han modificado." };
  }
}
