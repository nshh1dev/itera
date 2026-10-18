import Link from "next/link";
import { Plus,ArrowRight } from "lucide-react";
import { requireAdmin } from "@/server/auth";
import { db } from "@/server/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { levelNames } from "@/lib/types";

export const metadata={title:"Administración"};
export default async function AdminPage(){
  await requireAdmin();
  const exercises=await db.exercise.findMany({orderBy:{order:"asc"},include:{versions:{orderBy:{number:"desc"},take:1}}});
  return <div className="page-container">
    <div className="page-intro">
      <div><h1 className="page-title">Contenido que enseña.</h1><p className="page-description">Administración local: crea, revisa y publica ejercicios con versiones independientes.</p></div>
      <Button asChild><Link href="/admin/ejercicios/nuevo"><Plus aria-hidden="true" />Nuevo ejercicio</Link></Button>
    </div>
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground"><p>{exercises.length} ejercicios editoriales</p><p>Los borradores no son visibles para estudiantes.</p></div>
    {exercises.length ? <ul className="space-y-1">{exercises.map(e=>{
      const version=e.versions[0];
      return <li key={e.id}><Link href={`/admin/ejercicios/${e.slug}`} className="list-entry flex-wrap items-center gap-4">
        <div className="min-w-0 flex-1 basis-48"><h2 className="break-words text-base font-medium">{version?.title??e.slug}</h2><p className="mt-1 text-xs text-muted-foreground">{e.category} · {version?levelNames[version.level]:"Sin versión"}</p></div>
        <div className="flex flex-wrap items-center gap-3"><span className="text-xs text-muted-foreground">Versión {version?.number??0}</span><Badge variant="outline">{e.published?version?.published?"Publicado":"Nueva versión en borrador":"Oculto"}</Badge></div>
        <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </Link></li>;
    })}</ul> : <div className="empty-state"><h2 className="section-title">Prepara el primer ejercicio</h2><p className="text-sm text-muted-foreground">Añade un enunciado, las variantes y sus pruebas. Después podrás validarlo y publicarlo.</p><Button asChild><Link href="/admin/ejercicios/nuevo">Crear ejercicio</Link></Button></div>}
  </div>;
}
