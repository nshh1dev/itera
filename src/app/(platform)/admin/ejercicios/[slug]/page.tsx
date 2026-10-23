import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/server/auth";
import { db } from "@/server/db";
import { AdminEditor, type EditorialData } from "@/components/admin-editor";
import { CatalogRevisionButton } from "@/components/catalog-revision-button";
import { catalogRevision } from "../../../../../../prisma/editorial-revision";
import { educationalMetadataSchema } from "@/lib/learning-metadata";

export default async function AdminExercisePage({params}:{params:Promise<{slug:string}>}){
  await requireAdmin();
  const {slug}=await params;
  let initial:EditorialData={slug:"",title:"",description:"",statement:"",objective:"",prerequisites:[],practiceGoals:[],prerequisiteSlugs:[],complexity:"",commonErrors:[],activityType:"PRACTICE",runtimeMode:"FUNCTION",category:"Fundamentos",level:"BEGINNER",minutes:10,hints:["","",""],constraints:["Implementa solve(data) y devuelve el resultado."],python:{starter:"def solve(data):\n    return None",solution:"def solve(data):\n    return data",explanation:""},javascript:{starter:"function solve(data) {\n  return null;\n}",solution:"function solve(data) {\n  return data;\n}",explanation:""},typescript:{starter:"function solve(data: number): number {\n  return 0;\n}",solution:"function solve(data: number): number {\n  return data;\n}",explanation:""},tests:JSON.stringify([{input:1,expected:1,visible:true,explanation:""},{input:2,expected:2,visible:true,explanation:""},{input:0,expected:0,visible:false,explanation:""}],null,2)};
  if(slug!=="nuevo"){
    const exercise=await db.exercise.findUnique({where:{slug},include:{versions:{orderBy:{number:"desc"},take:1,include:{variants:{include:{tests:{orderBy:{order:"asc"}}}}}}}});
    const version=exercise?.versions[0];
    if(!exercise||!version)notFound();
    const python=version.variants.find(v=>v.language==="python");
    const javascript=version.variants.find(v=>v.language==="javascript");
    const typescript=version.variants.find(v=>v.language==="typescript");
    if(!python||!javascript)notFound();
    initial={id:exercise.id,versionId:version.id,published:exercise.published,slug:exercise.slug,title:version.title,description:version.description,statement:version.statement,objective:version.objective,prerequisites:version.prerequisites,practiceGoals:version.practiceGoals,prerequisiteSlugs:version.prerequisiteSlugs,complexity:version.complexity,commonErrors:version.commonErrors,activityType:educationalMetadataSchema.shape.activityType.catch("PRACTICE").parse(version.activityType),runtimeMode:version.runtimeMode,category:exercise.category,level:version.level,minutes:version.minutes,hints:version.hints,constraints:version.constraints,python:{starter:python.starter,solution:python.solution,explanation:python.explanation,statement:python.statement},javascript:{starter:javascript.starter,solution:javascript.solution,explanation:javascript.explanation,statement:javascript.statement},typescript:typescript?{starter:typescript.starter,solution:typescript.solution,explanation:typescript.explanation,statement:typescript.statement}:{starter:"",solution:"",explanation:"",statement:""},tests:JSON.stringify(python.tests.map(t=>({input:t.input,expected:t.expected,visible:t.visible,explanation:t.explanation})),null,2)};
    initial.typescript.typeContract = typescript?.typeContract ?? "";
    initial.conceptRule = version.conceptRule;
  } else initial.typescript.typeContract = "const __iteraContract: (data: number) => number = solve;";
  return <div className="page-container max-w-4xl"><Link href="/admin" className="text-link"><ArrowLeft className="size-3.5"/>Volver al catálogo</Link><h1 className="page-title mt-6">{slug==="nuevo"?"Una nueva oportunidad de aprender.":initial.title}</h1><p className="mt-3 text-sm leading-7 text-muted-foreground">Cada guardado crea una versión nueva. Los intentos anteriores conservan el contenido con el que fueron evaluados.</p>{initial.versionId && catalogRevision(slug) && <CatalogRevisionButton slug={slug} versionId={initial.versionId} />}<AdminEditor key={initial.versionId??"new"} initial={initial}/></div>;
}
