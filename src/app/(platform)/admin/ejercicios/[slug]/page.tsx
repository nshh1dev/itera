import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/server/auth";
import { db } from "@/server/db";
import { AdminEditor, type EditorialData } from "@/components/admin-editor";

export default async function AdminExercisePage({params}:{params:Promise<{slug:string}>}){
  await requireAdmin();
  const {slug}=await params;
  let initial:EditorialData={slug:"",title:"",description:"",statement:"",category:"Fundamentos",level:"BEGINNER",minutes:10,hints:[""],constraints:["Implementa solve(data) y devuelve el resultado."],python:{starter:"def solve(data):\n    pass",solution:"def solve(data):\n    return data",explanation:""},javascript:{starter:"function solve(data) {\n\n}",solution:"function solve(data) {\n  return data;\n}",explanation:""},tests:JSON.stringify([{input:1,expected:1,visible:true},{input:2,expected:2,visible:true},{input:0,expected:0,visible:false}],null,2)};
  if(slug!=="nuevo"){
    const exercise=await db.exercise.findUnique({where:{slug},include:{versions:{orderBy:{number:"desc"},take:1,include:{variants:{include:{tests:{orderBy:{order:"asc"}}}}}}}});
    const version=exercise?.versions[0];
    if(!exercise||!version)notFound();
    const python=version.variants.find(v=>v.language==="python");
    const javascript=version.variants.find(v=>v.language==="javascript");
    if(!python||!javascript)notFound();
    initial={id:exercise.id,versionId:version.id,published:exercise.published,slug:exercise.slug,title:version.title,description:version.description,statement:version.statement,category:exercise.category,level:version.level,minutes:version.minutes,hints:version.hints,constraints:version.constraints,python:{starter:python.starter,solution:python.solution,explanation:python.explanation},javascript:{starter:javascript.starter,solution:javascript.solution,explanation:javascript.explanation},tests:JSON.stringify(python.tests.map(t=>({input:t.input,expected:t.expected,visible:t.visible})),null,2)};
  }
  return <div className="page-container max-w-4xl"><Link href="/admin" className="text-link"><ArrowLeft className="size-3.5"/>Volver al catálogo</Link><h1 className="page-title mt-6">{slug==="nuevo"?"Una nueva oportunidad de aprender.":initial.title}</h1><p className="mt-3 text-sm leading-7 text-muted-foreground">Cada guardado crea una versión nueva. Los intentos anteriores conservan el contenido con el que fueron evaluados.</p><AdminEditor key={initial.versionId??"new"} initial={initial}/></div>;
}
