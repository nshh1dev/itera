"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "./auth";
import { db } from "./db";
import { Prisma } from "@/generated/prisma/client";
import type { Json, Language, RuntimeMode } from "@/lib/types";
import { availableRuntime, runCode, RunnerUnavailable } from "./execution/piston";
import { judge, judgeProgram } from "./execution/judge";
import { catalogRevision, catalogRevisionDecision, seedVersionContent } from "../../prisma/editorial-revision";
import { editorialSchema as schema, publicationMetadataSchema } from "@/lib/editorial";
import { prerequisiteIssue } from "@/lib/curriculum";
import { languages } from "@/lib/types";

async function checkPrerequisites(slug: string, slugs: string[]) {
  if (!slugs.length) return;
  const entries = await db.exercise.findMany({
    where: { published: true, versions: { some: { published: true } } }, select: { slug: true, order: true },
  });
  return prerequisiteIssue(slug, slugs, entries);
}

export async function saveExercise(input: unknown) {
  const user = await requireAdmin();
  if (JSON.stringify(input).length > 180000) return { error: "El contenido es demasiado grande." };
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues.map(issue=>`${issue.path.join(".")}: ${issue.message}`).slice(0,3).join(" · ") };
  const data = parsed.data;
  try {
    const issue = await checkPrerequisites(data.slug, data.prerequisiteSlugs);
    if (issue) return { error: issue };
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
        objective:data.objective, prerequisites:data.prerequisites,
        practiceGoals:data.practiceGoals, prerequisiteSlugs:data.prerequisiteSlugs, activityType:data.activityType,
        runtimeMode:data.runtimeMode,
        complexity:data.complexity, commonErrors:data.commonErrors,
        variants:{create:languages.map(language=>({language,...data[language],tests:{create:data.tests.map((test,order)=>({input:test.input===null?Prisma.JsonNull:test.input,expected:test.expected===null?Prisma.JsonNull:test.expected,visible:test.visible,explanation:test.explanation,order}))}}))},
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
  const version = await db.exerciseVersion.findUnique({where:{id:versionId},include:{exercise:true,variants:{include:{tests:{orderBy:{order:"asc"}}}}}});
  if (!version || version.variants.length !== languages.length || !languages.every(language => version.variants.some(variant => variant.language === language))) return {error:"Faltan las variantes de lenguaje. Prepara una nueva versión con Python, JavaScript y TypeScript."};
  const metadata = publicationMetadataSchema.safeParse(version);
  if (!metadata.success || version.hints.length !== 3) return {error:"Completa el objetivo, los conceptos de práctica y las tres pistas, y revisa los conocimientos previos. Guarda una nueva versión antes de publicar."};
  try {
    const issue = await checkPrerequisites(version.exercise.slug, version.prerequisiteSlugs);
    if (issue) return { error: issue };
    for (const variant of version.variants) {
      if (variant.language === "typescript" && version.runtimeMode === "FUNCTION" && !variant.typeContract.trim()) return {error:"Define el contrato de tipos de TypeScript antes de publicar esta función."};
      if (!variant.tests.some(t=>t.visible) || !variant.tests.some(t=>!t.visible)) return {error:"Incluye pruebas visibles y ocultas antes de publicar."};
      const runtime = await availableRuntime(variant.language as Language);
      const mode = version.runtimeMode as RuntimeMode;
      const evaluate = mode === "PROGRAM" ? judgeProgram : judge;
      let starterSolved = true;
      for (const test of variant.tests) {
        const entry = { ...test, input: test.input as Json, expected: test.expected as Json };
        const output = await runCode(variant.language as Language,runtime,variant.solution,test.input as Json,mode,variant.typeContract);
        if (!evaluate(output, entry).passed) return {error:`La solución de referencia de ${variant.language} no supera el caso ${test.order+1}. Revisa el contenido y guarda una nueva versión.`};
        const initial = evaluate(await runCode(variant.language as Language, runtime, variant.starter, test.input as Json, mode, variant.typeContract), { ...entry, visible: true });
        if (initial.status === "runtime" || initial.status === "timeout" || initial.error) return {error:`La plantilla de ${variant.language} falla en el caso ${test.order+1}. Debe ejecutarse ${mode === "PROGRAM" ? "sin errores" : "y devolver un valor JSON aunque aún no resuelva el problema"}.`};
        starterSolved &&= initial.passed;
      }
      if (starterSolved !== (version.activityType === "OBSERVATION")) return {error: version.activityType === "OBSERVATION" ? `La plantilla de observación de ${variant.language} debe estar completa.` : `La plantilla de ${variant.language} ya resuelve todos los casos. Retira parte de la solución.`};
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
  const validated = schema.safeParse({ ...source, python: variant("python"), javascript: variant("javascript"), typescript: variant("typescript"), tests: content.variants[0].tests });
  if (!validated.success) return { error: "La revisión del catálogo no supera la validación editorial. No se ha guardado nada." };
  const data = validated.data;
  try {
    const issue = await checkPrerequisites(data.slug, data.prerequisiteSlugs);
    if (issue) return { error: issue };
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
        objective: data.objective, prerequisites: data.prerequisites,
        practiceGoals: data.practiceGoals, prerequisiteSlugs: data.prerequisiteSlugs, activityType: data.activityType,
        runtimeMode: data.runtimeMode,
        complexity: data.complexity, commonErrors: data.commonErrors,
        variants: { create: languages.map(language => ({
          language, ...data[language], tests: { create: data.tests.map((test, order) => ({
            order, visible: test.visible, explanation: test.explanation, input: test.input === null ? Prisma.JsonNull : test.input, expected: test.expected === null ? Prisma.JsonNull : test.expected,
          })) },
        })) },
      } });
      await tx.auditLog.create({ data: { userId: user.id, action: "exercise.version.imported", resource: version.id } });
      return { created: true, number: version.number };
    });
    if ("error" in result) return result;
    if (result.created) {
      revalidatePath("/admin");
      revalidatePath(`/admin/ejercicios/${data.slug}`);
    }
    return result;
  } catch {
    return { error: "No pudimos preparar el borrador. Las versiones anteriores no se han modificado." };
  }
}
